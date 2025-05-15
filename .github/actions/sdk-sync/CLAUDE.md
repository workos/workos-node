# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a GitHub Action that translates changes between different WorkOS SDK repositories. It automatically identifies changes in a pull request from one SDK language and creates equivalent PRs in other language SDKs.

The action supports translating between:
- Ruby
- Node.js 
- Python
- PHP

## Build Commands

```bash
# Install dependencies
npm install

# Build the TypeScript project
npm run build

# Build (required before commits)
npm run prepare
```

## Architecture

The SDK Sync Action works by:

1. Identifying the source language from the repository name
2. Determining which target repositories to sync to
3. For each target repository:
   - Cloning the target repository
   - For each changed file in the source PR:
     - Translating the file to the target language
     - Writing the translated file to the target repository
   - Creating a PR in the target repository with the translated changes

The translation is performed using OpenAI's GPT-4 model, with careful prompt engineering to:
- First identify the target file path
- Then translate the file content based on the diff/patch

The action has a "debug mode" that can be enabled to preview changes without creating PRs.

## Key Components

- **Translation logic**: Uses a two-step approach to translate file changes between languages
- **Context gathering**: Identifies relevant files in the target repository for context
- **Diff processing**: Extracts only the relevant parts of diffs to save tokens
- **Token optimization**: Handles large files by using different translation strategies

## Important Files

- `src/index.ts`: Main entry point with the core logic
- `action.yml`: GitHub Action definition with inputs and configuration

## Action Inputs

- `github-token`: GitHub token with access to target repositories
- `openai-key`: OpenAI API key for code translation
- `debug-mode`: Enable debug mode to preview changes without creating PRs
- `target-repos`: Comma-separated list of target repos to process (defaults to all)