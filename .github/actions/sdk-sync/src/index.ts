import * as core from '@actions/core';
import * as github from '@actions/github';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import * as child_process from 'child_process';
import * as os from 'os';

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

interface DebugFileInfo {
  sourceFile: string;
  targetFile: string;
  isNewFile: boolean;
  originalContent?: string;
  translatedContent?: string;
  diff?: string;
  notes?: string[];
  manualSteps?: string[];
  error?: string;
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
    let debugMode = core.getInput('debug-mode').toLowerCase() === 'true';
    const targetReposInput = core.getInput('target-repos');

    // Log debug status prominently
    core.info(
      `🚨 DEBUG MODE: ${
        debugMode
          ? 'ENABLED - NO PRs WILL BE CREATED'
          : 'DISABLED - PRs WILL BE CREATED'
      }`,
    );
    core.info(`📋 Debug Mode Input Value: "${core.getInput('debug-mode')}"`);
    core.info(`🔧 Target Repos: ${targetReposInput || 'All repos'}`);

    // Extra safety check - prevent PR creation if anything resembling debug mode is found
    const forceDebug =
      core.getInput('debug-mode').toLowerCase().includes('true') ||
      core.getInput('debug-mode').toLowerCase().includes('yes') ||
      process.env.DEBUG_MODE === 'true';

    if (forceDebug && !debugMode) {
      core.warning(
        'Debug mode string detected but not properly parsed as true. Forcing debug mode ON for safety.',
      );
      debugMode = true;
    }

    // Initialize clients
    const octokit = github.getOctokit(githubToken);
    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    // Get context information
    const context = github.context;
    const sourceRepo = context.repo.owner + '/' + context.repo.repo;
    let prNumber = context.payload.pull_request?.number;

    // For workflow_dispatch event, try to get PR number from inputs
    if (!prNumber && context.payload.inputs?.pr_number) {
      prNumber = parseInt(context.payload.inputs.pr_number, 10);
    }

    if (!prNumber) {
      throw new Error('No PR number found. This action requires a PR number.');
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

    // Use filtered target repos if provided
    const targetRepos = targetReposInput
      ? targetReposInput.split(',').map((r) => r.trim())
      : allRepos.filter((repo) => repo !== sourceRepo);

    core.info(`Target repositories: ${targetRepos.join(', ')}`);

    // Set up debug directory if in debug mode
    // Try multiple locations to make sure we write somewhere accessible
    const isDocker = fs.existsSync('/.dockerenv');

    // Try multiple possible debug output locations
    const possibleDebugDirs = [
      // Mounted volume location specifically for act
      '/debug-output',
      // Direct in repo root (most likely to work with act)
      path.join(process.cwd(), 'sdk-debug-output'),
      // Home directory
      path.join(process.env.HOME || '/home/node', 'sdk-debug-output'),
      // Temp directory
      path.join('/tmp', 'sdk-debug-output'),
      // Current directory
      './sdk-debug-output',
    ];

    // Force using the mounted volume for output if available
    let debugDir = '';
    
    // First try the mounted volume (highest priority)
    if (fs.existsSync('/debug-output')) {
      try {
        // Test that we can write to it
        const testFile = '/debug-output/mounted-volume-test.txt';
        fs.writeFileSync(testFile, 'Successfully wrote to mounted volume');
        core.info('🎯 Using mounted volume at /debug-output for debug output');
        debugDir = '/debug-output';
      } catch (err) {
        core.warning(`⚠️ Found mounted volume but couldn't write to it: ${err}`);
      }
    }
    
    // If we couldn't use the mounted volume, try other locations
    if (!debugDir) {
      for (const dir of possibleDebugDirs) {
        try {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          // Test write a file
          const testFile = path.join(dir, '.write-test');
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
  
          // If we get here, we can write to this directory
          debugDir = dir;
          break;
        } catch (err) {
          core.info(`⚠️ Could not write to ${dir}: ${err}`);
          continue;
        }
      }
    }

    if (!debugDir) {
      core.warning(
        '⚠️ Could not find a writable debug directory - debug output will be missing',
      );
      debugDir = './debug-output'; // Fallback but likely won't work
    }

    if (debugMode) {
      core.info(
        `🐛 DEBUG MODE ENABLED - Running in ${
          isDocker ? 'Docker' : 'local'
        } environment`,
      );
      core.info(
        `🐛 Using debug directory: ${debugDir} (absolute: ${path.resolve(
          debugDir,
        )})`,
      );

      // Create marker files in MULTIPLE locations to maximize chances of finding them
      for (const dir of possibleDebugDirs) {
        try {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(
            path.join(dir, 'DEBUG-LOCATION.txt'),
            `SDK Debug output created at: ${new Date().toISOString()}\n` +
              `Source repo: ${sourceRepo}\n` +
              `PR: #${prNumber}\n` +
              `Main debug directory: ${debugDir}\n` +
              `All possible debug dirs: ${possibleDebugDirs.join(', ')}\n`,
          );
        } catch (err) {
          // Ignore - we'll try all locations
        }
      }

      // Also create a prominent marker file in the repo root
      try {
        fs.writeFileSync(
          path.join(process.cwd(), 'DEBUG-OUTPUT-LOCATION.txt'),
          `SDK Debug output created at: ${new Date().toISOString()}\n` +
            `Main debug directory: ${debugDir}\n` +
            `All possible debug dirs: ${possibleDebugDirs.join(', ')}\n`,
        );
      } catch (err) {
        // Ignore
      }
    }

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

      // Create appropriate directory for target repo
      const targetDir = path.join(process.cwd(), `${targetLang}-output`);
      fs.mkdirSync(targetDir, { recursive: true });

      // Set up debug directory for this language
      const debugLangDir = debugMode ? path.join(debugDir, targetLang) : '';
      if (debugMode) {
        try {
          fs.mkdirSync(debugLangDir, { recursive: true });
          core.info(`🐛 Debug directory for ${targetLang}: ${debugLangDir}`);

          // Create a language-specific marker file directly in the repo root
          fs.writeFileSync(
            path.join(process.cwd(), `DEBUG-${targetLang.toUpperCase()}.txt`),
            `Debug output for ${targetLang} is in: ${debugLangDir}\n` +
              `Created at: ${new Date().toISOString()}\n`,
          );
        } catch (err) {
          core.warning(
            `⚠️ Failed to create debug directory for ${targetLang}: ${err}`,
          );
        }

        // Create a summary file
        fs.writeFileSync(
          path.join(debugLangDir, 'summary.md'),
          `# Debug Summary: ${sourceLang} → ${targetLang}\n\n` +
            `PR: #${prNumber} - ${pullRequest.title}\n\n` +
            `Source Repo: ${sourceRepo}\n` +
            `Target Repo: ${targetRepo}\n\n` +
            `Generated: ${new Date().toISOString()}\n\n`,
        );
      }

      // Clone target repo to get context
      const git: SimpleGit = simpleGit({ baseDir: targetDir });
      await git.clone(
        `https://x-access-token:${githubToken}@github.com/${targetRepo}.git`,
        targetDir,
      );

      // Only create a branch if not in debug mode
      if (!debugMode) {
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

      // For debug mode, collect info about each file
      const debugInfo: DebugFileInfo[] = [];

      // Process each changed file
      let hasChanges = false;

      for (const file of filesWithContent) {
        // Skip files that don't need translation
        if (shouldSkipFile(file.filename)) {
          if (debugMode) {
            debugInfo.push({
              sourceFile: file.filename,
              targetFile: '',
              isNewFile: false,
              error: 'Skipped - not a translatable file type',
            });
          }
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

        // Create debug file info object
        const fileDebugInfo: DebugFileInfo = {
          sourceFile: file.filename,
          targetFile: '',
          isNewFile: false,
        };

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
          // Update debug info
          if (debugMode) {
            fileDebugInfo.targetFile = translationResult.targetPath;
            fileDebugInfo.isNewFile = translationResult.isNewFile || false;
            fileDebugInfo.translatedContent = translationResult.translatedCode;
            fileDebugInfo.notes = translationResult.notes;
            fileDebugInfo.manualSteps = translationResult.manualSteps;
          }

          // Ensure the directory exists
          const targetFileDir = path.dirname(
            path.join(targetDir, translationResult.targetPath),
          );
          fs.mkdirSync(targetFileDir, { recursive: true });

          // Get the full target path
          const targetFilePath = path.join(
            targetDir,
            translationResult.targetPath,
          );

          // Check if the file exists before writing
          const fileExists = fs.existsSync(targetFilePath);

          // In debug mode, store original content and create diff
          if (debugMode && fileExists) {
            try {
              const originalContent = fs.readFileSync(targetFilePath, 'utf8');
              fileDebugInfo.originalContent = originalContent;

              // Generate a diff
              fileDebugInfo.diff = await generateDiff(
                originalContent,
                translationResult.translatedCode,
              );
            } catch (error) {
              core.warning(`Error generating diff: ${error}`);
            }
          }

          // In debug mode, write to debug directory instead of modifying the actual repo
          if (debugMode) {
            // Try multiple locations for writing debug output
            try {
              const debugFileName = path.basename(translationResult.targetPath);

              // 1. Write to standard debug directory
              const debugFilePath = path.join(
                debugLangDir,
                `${debugFileName}.translated`,
              );
              fs.writeFileSync(debugFilePath, translationResult.translatedCode);

              // 2. Also write directly to repo root for maximum visibility
              fs.writeFileSync(
                path.join(
                  process.cwd(),
                  `DEBUG-${targetLang}-${debugFileName}.txt`,
                ),
                translationResult.translatedCode,
              );
              
              // 3. Additionally write to the mounted volume if it exists
              if (fs.existsSync('/debug-output')) {
                try {
                  // Make sure target language dir exists in the mounted volume
                  const mountedLangDir = path.join('/debug-output', targetLang);
                  if (!fs.existsSync(mountedLangDir)) {
                    fs.mkdirSync(mountedLangDir, { recursive: true });
                  }
                  
                  // Write the translated file to the mounted volume
                  fs.writeFileSync(
                    path.join(mountedLangDir, `${debugFileName}.translated`),
                    translationResult.translatedCode,
                  );
                  
                  core.info(`✅ Saved to mounted volume: /debug-output/${targetLang}/${debugFileName}.translated`);
                } catch (err) {
                  core.warning(`⚠️ Failed to write to mounted volume: ${err}`);
                }
              }

              // If we have original content, write that too for comparison
              if (fileDebugInfo.originalContent) {
                fs.writeFileSync(
                  path.join(debugLangDir, `${debugFileName}.original`),
                  fileDebugInfo.originalContent,
                );
              }

              core.info(
                `🔍 Debug output for ${debugFileName} saved to:\n- ${debugFilePath}\n- ${path.join(
                  process.cwd(),
                  `DEBUG-${targetLang}-${debugFileName}.txt`,
                )}`,
              );
            } catch (err) {
              // If file write fails, log information to console
              core.warning(`⚠️ Could not write debug files: ${err}`);
              core.info(
                `📋 TRANSLATION PREVIEW for ${translationResult.targetPath}:`,
              );
              // Log first 10 lines of content to console
              const previewLines = translationResult.translatedCode
                .split('\n')
                .slice(0, 10);
              core.info(
                `${previewLines.join('\n')}${
                  previewLines.length <
                  translationResult.translatedCode.split('\n').length
                    ? '\n[...truncated...]'
                    : ''
                }`,
              );
            }
          } else {
            // In normal mode, actually update the repo
            if (translationResult.isNewFile || !fileExists) {
              // Create a new file
              fs.writeFileSync(
                targetFilePath,
                translationResult.translatedCode,
              );
            } else {
              // Update existing file
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

          // Update debug info
          if (debugMode) {
            fileDebugInfo.error = translationResult.error || 'Unknown error';
            fileDebugInfo.manualSteps = translationResult.manualSteps;
          }
        }

        // Add to debug collection
        if (debugMode) {
          debugInfo.push(fileDebugInfo);
        }
      }

      // In debug mode, write summary and debug info
      if (debugMode) {
        // Write debug info to JSON file
        fs.writeFileSync(
          path.join(debugLangDir, 'debug-info.json'),
          JSON.stringify(debugInfo, null, 2),
        );

        // Update summary markdown file
        let summary = fs.readFileSync(
          path.join(debugLangDir, 'summary.md'),
          'utf8',
        );

        // Add file-by-file summary
        summary += `## Files Processed\n\n`;

        for (const info of debugInfo) {
          summary += `### ${info.sourceFile}\n\n`;

          if (info.error) {
            summary += `**Error:** ${info.error}\n\n`;
          } else {
            summary += `**Target:** ${info.targetFile}\n`;
            summary += `**Action:** ${
              info.isNewFile ? 'Create new file' : 'Update existing file'
            }\n\n`;

            if (info.diff) {
              summary += `**Changes:**\n\`\`\`diff\n${info.diff}\n\`\`\`\n\n`;
            }

            if (info.notes && info.notes.length > 0) {
              summary += `**Notes:**\n`;
              for (const note of info.notes) {
                summary += `- ${note}\n`;
              }
              summary += `\n`;
            }

            if (info.manualSteps && info.manualSteps.length > 0) {
              summary += `**Manual Steps:**\n`;
              for (const step of info.manualSteps) {
                summary += `- ${step}\n`;
              }
              summary += `\n`;
            }
          }
        }

        // Add stats
        const successCount = debugInfo.filter((i) => !i.error).length;
        const failureCount = debugInfo.filter((i) => !!i.error).length;

        summary += `## Summary Statistics\n\n`;
        summary += `- Total files: ${debugInfo.length}\n`;
        summary += `- Successfully processed: ${successCount}\n`;
        summary += `- Failed: ${failureCount}\n\n`;

        // Write updated summary
        fs.writeFileSync(path.join(debugLangDir, 'summary.md'), summary);

        core.info(`Debug output for ${targetLang} saved to ${debugLangDir}`);
      }
      // If we made changes and not in debug mode, commit and create PR
      else if (!debugMode && hasChanges) {
        core.info(`👉 Creating PR for ${targetRepo} (debug mode is OFF)`);

        try {
          // Commit changes
          await git.add('.');
          await git.commit(`Translated from ${sourceLang} PR #${prNumber}`);

          // Push to replace any existing branch
          await git.push('origin', `cross-sdk-sync-${prNumber}`, {
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
            head: `${owner}:cross-sdk-sync-${prNumber}`,
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
              head: `cross-sdk-sync-${prNumber}`,
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

    if (debugMode) {
      core.info(`\n🐛 DEBUG MODE COMPLETED`);
      core.info(`All debug output has been saved to: ${debugDir}`);
      core.info(`Look for files named DEBUG-*.txt in your repository root.`);
      core.info(`Review the generated files to see what would be changed.`);
      core.info(
        `\n❗❗❗ NO PULL REQUESTS WERE CREATED because debug mode is ON ❗❗❗`,
      );

      // Write a list of all files generated to make it easier to find them
      let fileList = '';
      try {
        fileList = listAllFiles(debugDir);
        fs.writeFileSync(path.join(debugDir, 'file-list.txt'), fileList);

        // Also write to repo root for visibility
        fs.writeFileSync(
          path.join(process.cwd(), 'DEBUG-FILE-LIST.txt'),
          fileList,
        );

        core.info(
          `\n✅ Full list of debug files written to:\n- ${path.join(
            debugDir,
            'file-list.txt',
          )}\n- ${path.join(process.cwd(), 'DEBUG-FILE-LIST.txt')}`,
        );
      } catch (err) {
        core.warning(`Failed to create file list: ${err}`);
      }

      // Find all debug files we created in repo root
      try {
        const rootFiles = fs
          .readdirSync(process.cwd())
          .filter((f) => f.startsWith('DEBUG-'))
          .map((f) => path.join(process.cwd(), f));

        if (rootFiles.length > 0) {
          core.info(`\n📍 Debug marker files found in repo root:`);
          rootFiles.forEach((f) => core.info(`- ${f}`));
        }
      } catch (err) {
        // Ignore
      }
    } else {
      core.info(`\n✅ Processing completed in LIVE MODE`);
      core.info(`Pull requests were created if needed.`);
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Generate a diff between two strings
 */
async function generateDiff(
  oldContent: string,
  newContent: string,
): Promise<string> {
  try {
    // Create temporary files
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-sync-'));
    const oldFile = path.join(tempDir, 'old.txt');
    const newFile = path.join(tempDir, 'new.txt');

    fs.writeFileSync(oldFile, oldContent);
    fs.writeFileSync(newFile, newContent);

    // Run diff command
    const { stdout } = await new Promise<{ stdout: string; stderr: string }>(
      (resolve, reject) => {
        child_process.exec(
          `diff -u ${oldFile} ${newFile} || true`,
          (error, stdout, stderr) => {
            if (error && error.code !== 1) {
              // diff returns 1 if files differ, which is expected
              reject(error);
            } else {
              resolve({ stdout, stderr });
            }
          },
        );
      },
    );

    // Clean up temp files
    try {
      fs.unlinkSync(oldFile);
      fs.unlinkSync(newFile);
      fs.rmdirSync(tempDir);
    } catch (e) {
      // Ignore cleanup errors
    }

    return stdout;
  } catch (error) {
    return `Error generating diff: ${error}`;
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

/**
 * Extract only the changed parts of a patch with minimal context
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

async function getRepoStructure(repoDir: string): Promise<string> {
  try {
    return new Promise<string>((resolve, reject) => {
      child_process.exec(
        `find . -type f -name "*.rb" -o -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.php" | grep -v "test\\|spec\\|fixture\\|vcr" | sort`,
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

// Add the missing getSmartContext function
async function getSmartContext(
  repoDir: string,
  sourceFilePath: string,
  sourceLang: string,
  targetLang: string,
  patchContent: string,
): Promise<RepoContext> {
  try {
    // Get repo structure
    const repoStructure = await getRepoStructure(repoDir);

    // Find similar files in target repo for context
    const fileExtMap: Record<string, string> = {
      ruby: '.rb',
      node: '.ts',
      python: '.py',
      php: '.php',
    };

    const targetExt = fileExtMap[targetLang] || '';
    const contextFiles: Array<{ path: string; content: string }> = [];

    // Extract keywords from source file path
    const pathParts = sourceFilePath.split('/');
    const baseName = path.basename(
      sourceFilePath,
      path.extname(sourceFilePath),
    );

    // Create a list of keywords to look for
    const keywordMatches = [
      ...pathParts
        .filter((part) => !part.startsWith('.'))
        .map((part) => part.replace(/[.-]/g, '_').toLowerCase()),
      ...baseName.split(/[-._]/),
      baseName.toLowerCase(),
    ];

    // Try to find relevant files with similar keywords
    if (fs.existsSync(repoDir)) {
      const allFiles = await getRelevantFiles(
        repoDir,
        targetExt,
        keywordMatches,
      );

      // Score and get top matching files
      const scoredFiles = allFiles
        .map((file) => {
          const fileLower = file.toLowerCase();
          let score = 0;

          // Score by keyword matches
          for (const keyword of keywordMatches) {
            if (fileLower.includes(keyword.toLowerCase())) {
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
        .sort((a, b) => b.score - a.score)
        .slice(0, 2); // Take just the top 2 matches

      // Get the content of these files
      for (const { file } of scoredFiles) {
        try {
          const content = fs.readFileSync(path.join(repoDir, file), 'utf8');
          contextFiles.push({
            path: file,
            content: content.slice(0, 5000), // Limit content size
          });
        } catch (e) {
          // Skip files we can't read
        }
      }
    }

    return {
      contextFiles,
      repoStructure,
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
  keywords: string[],
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Create grep pattern from keywords
    const pattern = keywords
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    const cmd = `find . -type f -name "*${fileExt}" | grep -v "test\\|spec\\|fixture\\|vcr" | sort`;

    child_process.exec(cmd, { cwd: repoDir }, (error, stdout) => {
      if (error) {
        resolve([]);
      } else {
        const files = stdout.trim().split('\n').filter(Boolean);
        resolve(files);
      }
    });
  });
}

/**
 * List all files recursively in a directory
 */
function listAllFiles(dir: string): string {
  let fileList = '';

  function walkDir(currentPath: string, indent = '') {
    const files = fs.readdirSync(currentPath);

    files.forEach((file) => {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        fileList += `${indent}📁 ${file}/\n`;
        walkDir(filePath, indent + '  ');
      } else {
        fileList += `${indent}📄 ${file} (${stats.size} bytes)\n`;
      }
    });
  }

  walkDir(dir);
  return fileList;
}

// Run the main function
run();
