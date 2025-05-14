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
  const { repoStructure } = repoContext;
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

    // First, determine where in the target repo this file should go
    const fileLocationResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert software developer helping to translate code changes between different programming language SDKs.
                    The purpose is to identify the equivalent file in the target language codebase that should be modified to implement the same functionality.
                    You should determine if the change requires:
                    1. Modifying an existing file in the target codebase
                    2. Creating a new file (only if the functionality doesn't exist yet)
                    
                    Prefer updating existing files rather than creating new ones when possible.`,
        },
        {
          role: 'user',
          content: `This PR titled "${prTitle}" modifies the ${sourceLang} file "${
            file.filename
          }".

                    Based on the repository structure below, determine the equivalent path in the ${targetLang} repository that should be modified.
                    
                    Patch/diff of the change:
                    ${file.patch || 'No patch available'}
                    
                    Repository structure:
                    ${repoStructure.slice(0, 2000)}
                    
                    Respond with ONLY the full path of the target file, without any additional text or explanation.`,
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
    }

    // Limit context files to reduce token count
    const limitedContextFiles = repoContext.contextFiles.slice(0, 2);
    const contextDescription = limitedContextFiles
      .map(
        (contextFile) => `
      File: ${contextFile.path}
      
      \`\`\`
      ${contextFile.content.slice(0, 1500)}
      ${contextFile.content.length > 1500 ? '... (content truncated)' : ''}
      \`\`\`
      `,
      )
      .join('\n');

    // Now translate the code with appropriate context
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
          content: `I'm implementing equivalent changes from a ${sourceLang} PR into ${targetLang}.

              PR TITLE: "${prTitle}"
              
              SOURCE FILE: "${file.filename}"
              PATCH/DIFF of changes:
              \`\`\`diff
              ${file.patch || 'No patch available'}
              \`\`\`
              
              SOURCE CODE (full file):
              \`\`\`
              ${file.content}
              \`\`\`
              
              TARGET FILE: "${targetFilePath}"
              ${
                targetFileExists
                  ? `EXISTING TARGET CONTENT:
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
                  ? 'Return the complete updated file with your changes applied'
                  : 'Create a new file that implements the equivalent functionality'
              }
              2. Follow the target language's conventions and match the style of the existing codebase
              3. ONLY implement changes equivalent to what was changed in the source file
              4. If you have important notes or manual steps needed, add them as a JSON object at the end: {"notes": ["note1", "note2"]}
              
              Return ONLY the code for the target file, without any explanations or prefixes inline.`,
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
