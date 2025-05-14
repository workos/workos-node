import * as core from '@actions/core';
import * as github from '@actions/github';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';

// Type definitions
interface PRFile {
  filename: string;
  status: string;
  sha: string;
  contents_url: string;
  content?: string;
  patch?: string; // Add patch field to store diff content
}

interface RepoContext {
  contextFiles: Array<{
    path: string;
    content: string;
  }>;
  repoStructure: string;
}

interface TranslationResult {
  success: boolean;
  translatedCode?: string;
  targetPath?: string;
  error?: string;
  notes?: string[];
  manualSteps?: string[];
  isNewFile?: boolean; // Track if this is a new file or modifying existing
}

interface PRCreationResult {
  repo: string;
  prUrl?: string;
  success: boolean;
  error?: string;
  untranslatedChanges: Array<{
    sourceFile: string;
    reason: string;
    manualSteps?: string[];
  }>;
}

/**
 * Utility function to estimate token count for OpenAI models
 * This is a rough estimate based on average tokens per character
 */
function estimateTokenCount(text: string): number {
  // GPT models typically use ~4 characters per token on average
  return Math.ceil(text.length / 4);
}

async function run(): Promise<void> {
  try {
    // Get inputs
    const githubToken = core.getInput('github-token', { required: true });
    const openaiKey = core.getInput('openai-key', { required: true });

    // Initialize clients
    const octokit = github.getOctokit(githubToken);
    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    // Get context information
    const context = github.context;
    const sourceRepo = context.repo.owner + '/' + context.repo.repo;
    const prNumber = context.payload.pull_request?.number;

    if (!prNumber) {
      throw new Error('This action can only be run on pull request events');
    }

    // Determine source language from repo name
    let sourceLang = '';
    if (sourceRepo.includes('-ruby')) sourceLang = 'ruby';
    else if (sourceRepo.includes('-node')) sourceLang = 'node';
    else if (sourceRepo.includes('-python')) sourceLang = 'python';
    else if (sourceRepo.includes('-php')) sourceLang = 'php';

    if (!sourceLang) {
      throw new Error(
        `Could not determine language from repo name: ${sourceRepo}`,
      );
    }

    core.info(`Source repository: ${sourceRepo} (${sourceLang})`);

    // Define target repos (all WorkOS SDKs except the current one)
    const allRepos = [
      'workos/workos-ruby',
      'workos/workos-node',
      'workos/workos-python',
      'workos/workos-php',
    ];

    const targetRepos = allRepos.filter((repo) => repo !== sourceRepo);
    core.info(`Target repositories: ${targetRepos.join(', ')}`);

    // Get PR details
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
    });

    core.info(`PR #${prNumber}: ${pullRequest.title}`);

    // Get PR files with their patches (diffs)
    const { data: prFiles } = await octokit.rest.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
    });

    core.info(`PR contains ${prFiles.length} changed files`);

    // Process files to get their content
    const filesWithContent: (PRFile & { content: string })[] =
      await Promise.all(
        prFiles.map(async (file) => {
          if (file.status === 'removed') {
            return {
              ...file,
              content: '',
              patch: file.patch || '',
            };
          }

          // Get file content
          try {
            const { data: fileData } = await octokit.rest.repos.getContent({
              owner: context.repo.owner,
              repo: context.repo.repo,
              path: file.filename,
              ref: pullRequest.head.ref,
            });

            // If it's a file (not a directory)
            if ('content' in fileData && 'encoding' in fileData) {
              const content = Buffer.from(
                fileData.content,
                fileData.encoding as BufferEncoding,
              ).toString();
              return {
                ...file,
                content,
                patch: file.patch || '',
              };
            }
          } catch (error) {
            core.warning(
              `Could not get content for file ${file.filename}: ${error}`,
            );
          }

          return {
            ...file,
            content: '',
            patch: file.patch || '',
          };
        }),
      );

    // Process each target repo
    for (const targetRepo of targetRepos) {
      const [owner, repo] = targetRepo.split('/');

      // Extract target language from repo name
      let targetLang = '';
      if (targetRepo.includes('-ruby')) targetLang = 'ruby';
      else if (targetRepo.includes('-node')) targetLang = 'node';
      else if (targetRepo.includes('-python')) targetLang = 'python';
      else if (targetRepo.includes('-php')) targetLang = 'php';

      core.info(
        `\nTranslating from ${sourceLang} to ${targetLang} for ${targetRepo}`,
      );

      // Create temp dir for target repo
      const targetDir = path.join(process.cwd(), `${targetLang}-output`);
      fs.mkdirSync(targetDir, { recursive: true });

      // Clone target repo to get context
      const git: SimpleGit = simpleGit({ baseDir: targetDir });
      await git.clone(
        `https://x-access-token:${githubToken}@github.com/${targetRepo}.git`,
        targetDir,
      );

      // Create a new branch
      const branchName = `cross-sdk-sync-${prNumber}`;

      // Delete branch if it exists and recreate it
      try {
        await git.checkout('main'); // or whatever your default branch is
        try {
          // Try to delete the local branch if it exists
          await git.deleteLocalBranch(branchName, true);
        } catch (err) {
          // Ignore errors - branch might not exist yet
        }
        await git.checkoutLocalBranch(branchName);
      } catch (error) {
        core.error(`Error setting up branch: ${error}`);
        continue;
      }

      // Get repo structure for context
      const repoStructure = await getRepoStructure(targetDir);

      // Track translation failures and notes
      const untranslatedChanges: Array<{
        sourceFile: string;
        reason: string;
        manualSteps?: string[];
      }> = [];

      const translationNotes: Array<{
        file: string;
        notes: string[];
      }> = [];

      // Process each changed file
      let hasChanges = false;

      for (const file of filesWithContent) {
        // Skip files that don't need translation
        if (shouldSkipFile(file.filename)) {
          core.info(`Skipping ${file.filename} - not a translatable file`);
          continue;
        }

        // Get target repository context
        const repoContext = await getRepoContext(
          targetDir,
          file.filename,
          sourceLang,
          targetLang,
        );

        // Translate file
        const translationResult = await translateFileChanges(
          file,
          sourceLang,
          targetLang,
          repoContext,
          openai,
          pullRequest.title,
        );

        if (
          translationResult.success &&
          translationResult.translatedCode &&
          translationResult.targetPath
        ) {
          // Ensure the directory exists
          const targetFileDir = path.dirname(
            path.join(targetDir, translationResult.targetPath),
          );
          fs.mkdirSync(targetFileDir, { recursive: true });

          if (translationResult.isNewFile) {
            // Create a new file
            fs.writeFileSync(
              path.join(targetDir, translationResult.targetPath),
              translationResult.translatedCode,
            );
          } else {
            // Update existing file if it exists, otherwise create it
            const targetFilePath = path.join(
              targetDir,
              translationResult.targetPath,
            );
            if (fs.existsSync(targetFilePath)) {
              // Read the existing file
              const existingContent = fs.readFileSync(targetFilePath, 'utf8');

              // Apply changes (assuming translatedCode contains only the changes)
              fs.writeFileSync(
                targetFilePath,
                translationResult.translatedCode,
              );
            } else {
              // If the file doesn't exist yet, just create it
              fs.writeFileSync(
                targetFilePath,
                translationResult.translatedCode,
              );
            }
          }

          hasChanges = true;

          // Collect any notes from the translation
          if (translationResult.notes && translationResult.notes.length > 0) {
            translationNotes.push({
              file: file.filename,
              notes: translationResult.notes,
            });
          }
        } else {
          // Track failed translations
          untranslatedChanges.push({
            sourceFile: file.filename,
            reason: translationResult.error || 'Unknown error',
            manualSteps: translationResult.manualSteps,
          });
        }
      }

      // If we made changes, commit and create PR
      if (hasChanges) {
        try {
          // Commit changes
          await git.add('.');
          await git.commit(`Translated from ${sourceLang} PR #${prNumber}`);

          // Force push to replace any existing branch
          await git.push('origin', branchName, {
            // '--force': true,
            '--set-upstream': null,
          });

          // Create detailed PR description
          const prDescription = generatePRDescription(
            targetRepo,
            sourceLang,
            pullRequest.body || '',
            prNumber,
            untranslatedChanges,
            translationNotes,
          );

          // Check if PR already exists
          const existingPRs = await octokit.rest.pulls.list({
            owner,
            repo,
            head: `${owner}:${branchName}`,
            state: 'open',
          });

          if (existingPRs.data.length > 0) {
            // Update existing PR
            const existingPR = existingPRs.data[0];
            await octokit.rest.pulls.update({
              owner,
              repo,
              pull_number: existingPR.number,
              title: `[Cross-SDK Sync] ${pullRequest.title}`,
              body: prDescription,
            });

            core.info(
              `Updated existing PR in ${targetRepo}: ${existingPR.html_url}`,
            );
          } else {
            // Create new PR
            const { data: createdPR } = await octokit.rest.pulls.create({
              owner,
              repo,
              title: `[Cross-SDK Sync] ${pullRequest.title}`,
              body: prDescription,
              head: branchName,
              base: pullRequest.base.ref, // Use same base branch as original PR
            });

            core.info(`Created PR in ${targetRepo}: ${createdPR.html_url}`);
          }
        } catch (error) {
          core.error(
            `Error creating PR in ${targetRepo}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      } else {
        core.info(`No changes to commit for ${targetRepo}`);
      }
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get smarter, more focused context for the translation
 */
async function getSmartContext(
  repoDir: string,
  sourceFilePath: string,
  sourceLang: string,
  targetLang: string,
  patchContent: string,
): Promise<RepoContext> {
  try {
    // Get repo structure in a token-efficient way
    const fileExtMap: Record<string, string> = {
      ruby: '.rb',
      node: '.ts', // or .js
      python: '.py',
      php: '.php',
    };

    const targetExt = fileExtMap[targetLang] || '';

    // Extract key identifiers and patterns from the source file path
    const pathParts = sourceFilePath.split('/');
    const baseName = path.basename(
      sourceFilePath,
      path.extname(sourceFilePath),
    );

    // Create a compact list of possible matching patterns
    const possiblePatterns: string[] = [];

    // Add specific module patterns based on source path
    if (pathParts.includes('user-management')) {
      possiblePatterns.push('user[_-]management');
      possiblePatterns.push('users?[_-]?manage');
    } else if (pathParts.includes('sso')) {
      possiblePatterns.push('sso');
      possiblePatterns.push('single[_-]sign[_-]on');
    } else if (pathParts.includes('passwordless')) {
      possiblePatterns.push('passwordless');
      possiblePatterns.push('magic[_-]link');
    }
    // Add more patterns for other modules...

    // Always add the base filename as a pattern
    possiblePatterns.push(baseName.replace(/[.-]/g, '[_-]'));

    // Extract function names and key identifiers from the patch for better matching
    const identifierRegex =
      /(?:class|function|def|module|interface)\s+(\w+)|(?:const|let|var|public|private)\s+(\w+)/g;
    let match;

    // Extract identifiers from the patch
    let patchText = patchContent || '';
    while ((match = identifierRegex.exec(patchText)) !== null) {
      const identifier = match[1] || match[2];
      if (identifier) {
        possiblePatterns.push(identifier);
      }
    }

    // Get a trimmed list of files to search
    const files = await getRelevantFiles(repoDir, targetExt, possiblePatterns);

    // Score and select the best matches
    const scoredFiles = files
      .map((file) => {
        let score = 0;
        const fileLower = file.toLowerCase();

        // Score by pattern matches
        for (const pattern of possiblePatterns) {
          if (fileLower.includes(pattern.toLowerCase())) {
            score += 2;
          }
        }

        // Score by path similarity
        const filePathParts = file.split('/');
        for (
          let i = 0;
          i < Math.min(pathParts.length, filePathParts.length);
          i++
        ) {
          if (pathParts[i].toLowerCase() === filePathParts[i].toLowerCase()) {
            score += 3;
          }
        }

        return { file, score };
      })
      .sort((a, b) => b.score - a.score);

    // Get the 2 best matches
    const bestMatches = scoredFiles.slice(0, 2);

    // Read only the first 5KB of each file to save tokens
    const contextFiles = await Promise.all(
      bestMatches.map(async ({ file }) => {
        try {
          // Read file, but limit to first 5KB
          const buffer = Buffer.alloc(5 * 1024);
          const fd = fs.openSync(path.join(repoDir, file), 'r');
          fs.readSync(fd, buffer, 0, buffer.length, 0);
          fs.closeSync(fd);

          const content = buffer.toString('utf8').replace(/\0/g, '');

          return {
            path: file,
            content,
          };
        } catch (e) {
          core.warning(`Error reading file ${file}: ${e}`);
          return {
            path: file,
            content: '',
          };
        }
      }),
    );

    // Generate a compact representation of the repo structure
    const compactStructure = await getCompactRepoStructure(repoDir, targetExt);

    return {
      contextFiles: contextFiles.filter((file) => file.content),
      repoStructure: compactStructure,
    };
  } catch (error) {
    core.warning('Error getting smart context: ' + error);
    return { contextFiles: [], repoStructure: '' };
  }
}

/**
 * Get relevant files based on patterns
 */
async function getRelevantFiles(
  repoDir: string,
  fileExt: string,
  patterns: string[],
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');

    // Create a grep pattern from our list
    const grepPatterns = patterns
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape regex chars
      .join('|');

    // Find files with the right extension that match our patterns
    const command = `find . -type f -name "*${fileExt}" | grep -v "test\\|spec\\|fixture\\|vcr" | xargs grep -l "${grepPatterns}" 2>/dev/null || true`;

    exec(
      command,
      { cwd: repoDir, maxBuffer: 1024 * 1024 },
      (error: any | Error | null, stdout: string) => {
        if (error && error?.code !== 1) {
          // grep returns 1 if no matches, which isn't an error for us
          reject(error);
        } else {
          // Get the list of files
          const files = stdout.trim().split('\n').filter(Boolean);
          resolve(files);
        }
      },
    );
  });
}

/**
 * Get a compact representation of repo structure
 */
async function getCompactRepoStructure(
  repoDir: string,
  fileExt: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');

    // Get just the directory structure of source files, not their content
    const command = `find . -type f -name "*${fileExt}" | grep -v "test\\|spec\\|fixture\\|vcr" | sort`;

    exec(command, { cwd: repoDir }, (error: Error | null, stdout: string) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * Extract only the most relevant parts of the target file
 * based on function/class names in the changed code
 */
function getMinimalTargetContext(
  existingContent: string,
  patch: string,
): string {
  if (!existingContent) return '';

  // Extract function/class names and key identifiers from the patch
  const identifierRegex =
    /(?:class|function|def|module|interface)\s+(\w+)|(?:const|let|var|public|private)\s+(\w+)/g;
  let match;
  const keyIdentifiers: string[] = [];

  // Extract identifiers from the patch
  let patchText = patch || '';
  while ((match = identifierRegex.exec(patchText)) !== null) {
    const identifier = match[1] || match[2];
    if (identifier && !keyIdentifiers.includes(identifier)) {
      keyIdentifiers.push(identifier);
    }
  }

  // If no identifiers found, return a small sample
  if (keyIdentifiers.length === 0) {
    // Return first 50 lines or less
    const lines = existingContent.split('\n');
    return lines.slice(0, Math.min(50, lines.length)).join('\n');
  }

  // Extract relevant sections from the target file that match identifiers
  const lines = existingContent.split('\n');
  const relevantSections: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains any key identifier
    if (keyIdentifiers.some((id) => line.includes(id))) {
      // Find the start of the block (go backwards for context)
      let blockStart = i;
      for (let j = i - 1; j >= Math.max(0, i - 20); j--) {
        if (/^\s*$/.test(lines[j]) || /^[^\s]/.test(lines[j])) {
          blockStart = j + 1;
          break;
        }
      }

      // Find the end of the block (go forwards)
      let blockEnd = i;
      for (let j = i + 1; j < Math.min(lines.length, i + 50); j++) {
        blockEnd = j;
        // Stop at the end of the function/class/block
        if (/^\s*}/.test(lines[j]) || /^}/.test(lines[j])) {
          blockEnd = j;
          break;
        }
      }

      // Add this block to relevant sections
      relevantSections.push(lines.slice(blockStart, blockEnd + 1).join('\n'));

      // Skip to the end of this block
      i = blockEnd;
    }
  }

  // If we found relevant sections, return them
  if (relevantSections.length > 0) {
    return relevantSections.join('\n\n');
  }

  // Fallback to first 50 lines
  return lines.slice(0, Math.min(50, lines.length)).join('\n');
}

/**
 * Extracts only the changed parts of a patch with minimal context
 */
function extractRelevantDiffParts(patch: string): string {
  if (!patch) return '';

  // Split the patch into hunks
  const hunks = patch
    .split(/^@@/m)
    .slice(1)
    .map((hunk) => `@@${hunk}`);

  let relevantParts = '';

  // Process each hunk to extract only changed lines with minimal context
  for (const hunk of hunks) {
    // Extract the hunk header
    const headerMatch = hunk.match(/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
    if (!headerMatch) continue;

    // Extract lines, keeping only changed lines and minimal context
    const lines = hunk.split('\n').slice(1); // Skip the header line

    // Include 2 lines of context around changes
    const condensedLines: string[] = [];
    let changeFound = false;
    let contextBuffer: string[] = [];

    for (const line of lines) {
      if (!line) continue;

      // If it's a changed line (added or removed)
      if (line.startsWith('+') || line.startsWith('-')) {
        // Add context buffer if we haven't already
        if (!changeFound && contextBuffer.length > 0) {
          // Add up to 2 lines of preceding context
          condensedLines.push(...contextBuffer.slice(-2));
          contextBuffer = [];
        }

        changeFound = true;
        condensedLines.push(line);
      }
      // Context line
      else if (line.startsWith(' ')) {
        if (changeFound) {
          // Add up to 2 lines of following context
          if (condensedLines.length > 0 && contextBuffer.length < 2) {
            contextBuffer.push(line);
          }
        } else {
          // Keep track of context before changes
          contextBuffer.push(line);
          if (contextBuffer.length > 2) {
            contextBuffer.shift(); // Keep only 2 lines
          }
        }
      }
    }

    // Add any remaining context
    if (changeFound && contextBuffer.length > 0) {
      condensedLines.push(...contextBuffer);
    }

    // Add this processed hunk to our result
    if (condensedLines.length > 0) {
      relevantParts += `@@ ${headerMatch[0].substring(3)} @@\n`;
      relevantParts += condensedLines.join('\n') + '\n';
    }
  }

  return relevantParts;
}

function shouldSkipFile(filePath: string): boolean {
  // Skip files like README, LICENSE, etc.
  const skipPatterns = [
    /\.md$/i,
    /LICENSE/i,
    /\.gitignore/,
    /\.github\//,
    /package-lock\.json$/,
    /Gemfile\.lock$/,
    /\.DS_Store$/,
    /yarn\.lock$/,
    /\.vscode\//,
    /\.idea\//,
    /vcr_cassettes\//, // Skip test fixtures
    /fixtures\//, // Skip test fixtures
  ];

  return skipPatterns.some((pattern) => pattern.test(filePath));
}

async function getRepoStructure(repoDir: string): Promise<string> {
  try {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
      exec(
        `find . -type f -name "*.rb" -o -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.php" | grep -v "test\|spec\|fixture\|vcr" | sort`,
        { cwd: repoDir },
        (error: Error | null, stdout: string) => {
          if (error) {
            reject(error);
          } else {
            resolve(stdout);
          }
        },
      );
    });
  } catch (error) {
    core.warning('Error getting repo structure: ' + error);
    return '';
  }
}

async function getRepoContext(
  repoDir: string,
  sourceFilePath: string,
  sourceLang: string,
  targetLang: string,
): Promise<RepoContext> {
  try {
    // Get repo structure
    const repoStructure = await getRepoStructure(repoDir);

    // Find similar files in target repo for context
    const fileExtMap: Record<string, string> = {
      ruby: '.rb',
      node: '.ts', // or .js
      python: '.py',
      php: '.php',
    };

    const targetExt = fileExtMap[targetLang] || '';
    const contextFiles: Array<{ path: string; content: string }> = [];

    // Keywords to look for in similar files
    let keywordMatches: string[] = [];

    // Extract keywords from source file path
    const pathParts = sourceFilePath.split('/');
    keywordMatches = pathParts
      .filter((part) => !part.startsWith('.'))
      .map((part) => part.replace(/[.-]/g, '_').toLowerCase());

    // Also get keywords from file name without extension
    const baseName = path.basename(
      sourceFilePath,
      path.extname(sourceFilePath),
    );
    const nameKeywords = baseName.split(/[-._]/);
    keywordMatches = [
      ...keywordMatches,
      ...nameKeywords,
      baseName.toLowerCase(),
    ];

    // Read main library files for context
    if (fs.existsSync(repoDir)) {
      // Find files by keyword relevance
      const files = fs.readdirSync(repoDir, { recursive: true }) as string[];

      // Score files by keyword relevance
      const scoredFiles = files
        .filter(
          (file) =>
            typeof file === 'string' &&
            file.endsWith(targetExt) &&
            !file.includes('node_modules') &&
            !file.includes('dist') &&
            !file.includes('spec/') &&
            !file.includes('test/') &&
            !file.includes('fixtures/') &&
            !file.includes('vcr_cassettes/'),
        )
        .map((file) => {
          // Calculate a relevance score based on keyword matches
          const fileLower = file.toLowerCase();
          let score = 0;

          for (const keyword of keywordMatches) {
            if (fileLower.includes(keyword.toLowerCase())) {
              score += 1;
            }
          }

          // Extra points for files in similar directories
          const filePathParts = file.split('/');
          for (
            let i = 0;
            i < Math.min(pathParts.length, filePathParts.length);
            i++
          ) {
            if (pathParts[i].toLowerCase() === filePathParts[i].toLowerCase()) {
              score += 2;
            }
          }

          return { file, score };
        })
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, 3); // Take top 3

      for (const { file } of scoredFiles) {
        try {
          const content = fs.readFileSync(path.join(repoDir, file), 'utf8');
          contextFiles.push({
            path: file,
            content,
          });
        } catch (e) {
          // Skip files we can't read
        }
      }

      // If we couldn't find any similar files, get core files
      if (contextFiles.length === 0) {
        // Look for main module files
        const corePatterns = [
          /lib\/.*\/client\.rb/, // Ruby client files
          /lib\/.*\/client\.py/, // Python client files
          /lib\/.*\.php$/, // PHP lib files
          /src\/.*\/client\.ts$/, // TypeScript client files
        ];

        const coreFiles = files
          .filter(
            (file) =>
              typeof file === 'string' &&
              corePatterns.some((pattern) => pattern.test(file)),
          )
          .slice(0, 3);

        for (const file of coreFiles) {
          try {
            const content = fs.readFileSync(path.join(repoDir, file), 'utf8');
            contextFiles.push({
              path: file,
              content,
            });
          } catch (e) {
            // Skip files we can't read
          }
        }
      }
    }

    return {
      contextFiles,
      repoStructure,
    };
  } catch (error) {
    core.warning('Error getting repo context: ' + error);
    return { contextFiles: [], repoStructure: '' };
  }
}

async function translateFileChanges(
  file: PRFile & { content: string; patch?: string },
  sourceLang: string,
  targetLang: string,
  repoContext: RepoContext,
  openai: OpenAI,
  prTitle: string,
): Promise<TranslationResult> {
  try {
    // Skip empty or deleted files
    if (!file.content || file.status === 'removed') {
      return {
        success: false,
        error: 'File is empty or was deleted',
        targetPath: file.filename,
      };
    }

    core.info(`Translating: ${file.filename}`);

    // Extract only the relevant parts of the diff to save tokens
    const relevantDiff = extractRelevantDiffParts(file.patch || '');

    // Get smart context focused on what's actually needed
    const smartContext = await getSmartContext(
      process.cwd() + `/${targetLang}-output`,
      file.filename,
      sourceLang,
      targetLang,
      relevantDiff,
    );

    // Step 1: First determine the target file path with minimal context
    const fileIdentificationPrompt = `
I'm trying to find the equivalent file path in a ${targetLang} codebase that corresponds to this ${sourceLang} file: "${
      file.filename
    }".

This is a change related to: "${prTitle}"

The diff shows these kinds of changes:
${relevantDiff.slice(0, 500)}

Here's the structure of the ${targetLang} repository:
${smartContext.repoStructure}

Which file in the ${targetLang} codebase would need to be modified to implement the equivalent change?
Respond with ONLY the full path of the target file, without any explanation or additional text.`;

    // Check token count for the file identification step
    const identificationTokens = estimateTokenCount(fileIdentificationPrompt);
    if (identificationTokens > 4000) {
      core.warning(
        `File identification prompt is too large (${identificationTokens} tokens). Truncating...`,
      );
      // Truncate the repository structure part which is likely the largest
      const truncateAmount = identificationTokens - 3500;
      const repoStructureChars = smartContext.repoStructure.length;
      const newRepoStructureLength = Math.max(
        1000,
        repoStructureChars - truncateAmount * 4,
      );
      smartContext.repoStructure =
        smartContext.repoStructure.slice(0, newRepoStructureLength) +
        '\n[Structure truncated to fit token limits]';
    }

    const fileLocationResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert software developer helping to translate code changes between different programming language SDKs.
Your task is to identify the exact file in the target language codebase that should be modified to implement the same functionality.
Respond with ONLY the file path, nothing else.`,
        },
        {
          role: 'user',
          content: fileIdentificationPrompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 100,
    });

    // Get the target file path
    const targetFilePath =
      fileLocationResponse.choices[0].message.content
        ?.trim()
        .replace(/^['"`](.*)['"`]$/, '$1') || '';

    // Check if target file exists
    const fullTargetPath = path.join(
      process.cwd(),
      `${targetLang}-output`,
      targetFilePath,
    );
    const targetFileExists = fs.existsSync(fullTargetPath);
    const isNewFile = !targetFileExists;

    let existingContent = '';
    if (targetFileExists) {
      existingContent = fs.readFileSync(fullTargetPath, 'utf8');

      // Get minimal relevant context from the target file
      existingContent = getMinimalTargetContext(existingContent, relevantDiff);
    }

    // Extract only key parts of the source file
    // If we can get the full patch, use that instead of the source content
    const sourceContent = file.patch
      ? relevantDiff
      : file.content.slice(0, 2000);

    // Limit context files to reduce token count further
    const limitedContextFiles = smartContext.contextFiles
      .slice(0, 2)
      .map((file) => ({
        path: file.path,
        // Extract only the first 100 lines or so
        content: file.content.split('\n').slice(0, 100).join('\n'),
      }));

    const contextDescription = limitedContextFiles
      .map(
        (contextFile) => `
      File: ${contextFile.path}
      
      \`\`\`
      ${contextFile.content}
      \`\`\`
      `,
      )
      .join('\n');

    // Create the translation prompt
    let translationPrompt = `I'm implementing equivalent changes from a ${sourceLang} PR into ${targetLang}.

PR TITLE: "${prTitle}"

SOURCE FILE: "${file.filename}"
PATCH/DIFF of changes:
\`\`\`diff
${relevantDiff}
\`\`\`

SOURCE CODE (relevant parts):
\`\`\`
${sourceContent}
\`\`\`

TARGET FILE: "${targetFilePath}"
${
  targetFileExists
    ? `EXISTING TARGET CONTENT (relevant parts):
\`\`\`
${existingContent}
\`\`\``
    : 'This will be a new file.'
}

RELEVANT FILES FROM TARGET REPO:
${contextDescription}

INSTRUCTIONS:
1. ${
      targetFileExists
        ? 'Return the complete updated file with your changes applied - be precise with indentation and whitespace'
        : 'Create a new file that implements the equivalent functionality'
    }
2. Follow the target language conventions and match the style of the existing codebase
3. ONLY implement changes equivalent to what was changed in the source file
4. If you have important notes or manual steps needed, add them as a JSON object at the end: {"notes": ["note1", "note2"]}

Return ONLY the code for the target file, without any explanations or prefixes inline.`;

    // Check token count for translation prompt
    const translationTokens = estimateTokenCount(translationPrompt);
    core.info(`Translation prompt token estimate: ${translationTokens}`);

    // If translation prompt is too large, reduce context
    if (translationTokens > 7000) {
      core.warning(
        `Translation prompt is too large (${translationTokens} tokens). Reducing context...`,
      );

      // Simplify the prompt by removing context files if we have target content
      let reducedPrompt = translationPrompt;

      if (targetFileExists) {
        // Remove the context files section first
        reducedPrompt = reducedPrompt.replace(
          /RELEVANT FILES FROM TARGET REPO:[\s\S]*?(?=INSTRUCTIONS)/,
          '',
        );
      } else {
        // Reduce source code section next
        reducedPrompt = reducedPrompt.replace(
          /SOURCE CODE \(relevant parts\):[\s\S]*?(?=TARGET FILE)/,
          `SOURCE CODE: [Too large to include in prompt]\n\n`,
        );
      }

      // Recalculate token count
      const reducedTokens = estimateTokenCount(reducedPrompt);
      core.info(`Reduced translation prompt token estimate: ${reducedTokens}`);

      // If still too large, use a two-step translation process
      if (reducedTokens > 7000) {
        return await twoStepTranslation(
          file,
          sourceLang,
          targetLang,
          smartContext,
          targetFilePath,
          targetFileExists,
          existingContent,
          openai,
          prTitle,
        );
      }

      // Use the reduced prompt
      translationPrompt = reducedPrompt;
    }

    // Now translate the code with the optimized prompt
    const message = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert code translator specialized in understanding changes made in one language and implementing equivalent changes in another language.
Your task is to update code in the target language to implement the same functionality as the source language changes.
You should focus on making minimal, focused changes that match the style and conventions of the target codebase.`,
        },
        {
          role: 'user',
          content: translationPrompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    let responseText = message.choices[0].message.content?.trim() || '';
    let translatedCode = responseText;
    let notes: string[] = [];
    let manualSteps: string[] = [];

    // Check if there are notes or manual steps
    const notesMatch = responseText.match(
      /\{[\s\n]*"(?:notes|manualSteps)"[\s\n]*:[\s\n]*\[[\s\S]*?\][\s\S]*?\}/,
    );
    if (notesMatch) {
      try {
        // Extract the JSON
        const jsonStr = notesMatch[0];
        const parsed = JSON.parse(jsonStr);

        // Store notes and manual steps
        if (parsed.notes) notes = parsed.notes;
        if (parsed.manualSteps) manualSteps = parsed.manualSteps;

        // Remove the JSON part from the response
        translatedCode = responseText.replace(jsonStr, '').trim();
      } catch (error) {
        core.warning(`Error parsing notes/steps JSON: ${error}`);
      }
    }

    // Clean the code - remove any "TARGET CODE:" prefixes and markdown code blocks
    translatedCode = translatedCode
      .replace(/^TARGET CODE:\s*\n?/i, '') // Remove "TARGET CODE:" prefix
      .replace(/```[\w]*\s*\n?/g, '') // Remove markdown code blocks
      .replace(/```\s*$/g, '') // Remove closing code fence
      .trim();

    return {
      success: true,
      translatedCode,
      targetPath: targetFilePath,
      notes,
      manualSteps,
      isNewFile,
    };
  } catch (error) {
    core.error(`Error translating ${file.filename}: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      targetPath: file.filename,
    };
  }
}

/**
 * Fallback function that uses a two-step approach for translation
 * when the prompt is too large for a single API call
 */
async function twoStepTranslation(
  file: PRFile & { content: string; patch?: string },
  sourceLang: string,
  targetLang: string,
  smartContext: RepoContext,
  targetFilePath: string,
  targetFileExists: boolean,
  existingContent: string,
  openai: OpenAI,
  prTitle: string,
): Promise<TranslationResult> {
  core.info(`Using two-step translation process for ${file.filename}`);

  // Extract only the relevant parts of the diff
  const relevantDiff = extractRelevantDiffParts(file.patch || '');

  // Step 1: Understand the changes (what is being changed conceptually)
  const understandChangesPrompt = `
Analyze this diff from a ${sourceLang} file and explain the key conceptual changes:

\`\`\`diff
${relevantDiff}
\`\`\`

Describe in detail:
1. What functionality is being modified?
2. What new parameters, methods, or fields are being added?
3. What logic changes are being made?
4. List specific function names, parameter names, and types that would need to be modified in the target language.

Be specific but concise.`;

  const understandingResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are an expert code analyst who can understand the conceptual changes in a code diff.`,
      },
      {
        role: 'user',
        content: understandChangesPrompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 1000,
  });

  const changeAnalysis =
    understandingResponse.choices[0].message.content?.trim() || '';

  // Step 2: Translate those changes to the target language
  const translateChangesPrompt = `
I need to implement these changes in the ${targetLang} file "${targetFilePath}" for a PR titled "${prTitle}".

The conceptual changes to implement are:
${changeAnalysis}

${
  targetFileExists
    ? `Here's the relevant part of the target file that needs to be modified:
\`\`\`
${existingContent}
\`\`\``
    : 'This will be a new file that needs to be created.'
}

Now, implement these changes in ${targetLang}, following these guidelines:
1. Match the coding style of the existing codebase
2. Be precise with indentation, spacing, and syntax
3. Only make the necessary changes indicated in the analysis
4. If you have important notes or manual steps needed, add them as a JSON object at the end: {"notes": ["note1", "note2"]}

Provide the complete ${targetFileExists ? 'updated' : 'new'} file content:`;

  const translationResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are an expert code translator specialized in implementing code changes in ${targetLang}.`,
      },
      {
        role: 'user',
        content: translateChangesPrompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 2000,
  });

  let responseText =
    translationResponse.choices[0].message.content?.trim() || '';
  let translatedCode = responseText;
  let notes: string[] = [];
  let manualSteps: string[] = [];

  // Check if there are notes or manual steps
  const notesMatch = responseText.match(
    /\{[\s\n]*"(?:notes|manualSteps)"[\s\n]*:[\s\n]*\[[\s\S]*?\][\s\S]*?\}/,
  );
  if (notesMatch) {
    try {
      // Extract the JSON
      const jsonStr = notesMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Store notes and manual steps
      if (parsed.notes) notes = parsed.notes;
      if (parsed.manualSteps) manualSteps = parsed.manualSteps;

      // Remove the JSON part from the response
      translatedCode = responseText.replace(jsonStr, '').trim();
    } catch (error) {
      core.warning(`Error parsing notes/steps JSON: ${error}`);
    }
  }

  // Clean the code
  translatedCode = translatedCode
    .replace(/^TARGET CODE:\s*\n?/i, '')
    .replace(/```[\w]*\s*\n?/g, '')
    .replace(/```\s*$/g, '')
    .trim();

  return {
    success: true,
    translatedCode,
    targetPath: targetFilePath,
    notes,
    manualSteps,
    isNewFile: !targetFileExists,
  };
}

function generatePRDescription(
  targetRepo: string,
  sourceLang: string,
  originalDescription: string,
  prNumber: number,
  untranslatedChanges: Array<{
    sourceFile: string;
    reason: string;
    manualSteps?: string[];
  }>,
  translationNotes: Array<{ file: string; notes: string[] }>,
): string {
  let description = `# Automated Cross-SDK Sync

This PR was automatically translated from ${sourceLang} PR #${prNumber}.

## Original Description
${originalDescription}

`;

  // Add translation notes if any
  if (translationNotes.length > 0) {
    description += `\n## Translation Notes\n\n`;

    translationNotes.forEach((noteItem) => {
      if (noteItem.notes && noteItem.notes.length > 0) {
        description += `### ${noteItem.file}\n`;
        noteItem.notes.forEach((note) => {
          description += `- ${note}\n`;
        });
        description += '\n';
      }
    });
  }

  // Add details about any unsuccessful translations
  if (untranslatedChanges.length > 0) {
    description += `\n## Manual Attention Required\n\n`;
    description += `The following files could not be automatically translated and require manual review:\n\n`;

    untranslatedChanges.forEach((change) => {
      description += `### ${change.sourceFile}\n`;
      description += `- **Reason**: ${change.reason}\n\n`;

      if (change.manualSteps && change.manualSteps.length > 0) {
        description += `**Manual steps needed**:\n`;
        change.manualSteps.forEach((step, index) => {
          description += `${index + 1}. ${step}\n`;
        });
        description += '\n';
      }
    });
  }

  return description;
}

// Run the main function
run();
