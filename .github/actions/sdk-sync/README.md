# WorkOS SDK Sync Action

A GitHub Action that automatically translates changes between WorkOS SDK repositories, ensuring consistent implementation of features and fixes across Ruby, Node.js, Python, and PHP SDKs.

## Overview

When you make changes to one WorkOS SDK and open a pull request, this action automatically:
1. Identifies which files were changed
2. Translates those changes to equivalent code in other SDK languages
3. Creates pull requests in the target repositories with the translated changes

This ensures that all WorkOS SDKs stay in sync and receive the same features, bug fixes, and improvements.

## Features

- **Automatic Cross-Language Translation**: Translates code changes between Ruby, Node.js, Python, and PHP
- **Smart File Mapping**: Automatically identifies corresponding files across different SDK structures
- **Minimal Change Approach**: Makes only the necessary changes, preserving existing code structure
- **AI-Powered Translation**: Uses GPT-4 for accurate language-specific translations
- **Debug Mode**: Preview changes without creating PRs
- **Comprehensive Error Handling**: Reports untranslatable files with manual instructions

## Usage

### Basic Usage

Add this action to your workflow in any WorkOS SDK repository:

```yaml
name: Sync SDKs
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: workos/.github/actions/sdk-sync@main
        with:
          github-token: ${{ secrets.CROSS_REPO_TOKEN }}
          openai-key: ${{ secrets.OPENAI_API_KEY }}
```

### Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `github-token` | Yes | - | GitHub token with access to target repositories |
| `openai-key` | Yes | - | OpenAI API key for GPT-4 access |
| `debug-mode` | No | `false` | Enable debug mode to preview changes without creating PRs |
| `target-repos` | No | All repos | Comma-separated list of target repos (e.g., `workos/workos-python,workos/workos-php`) |

### Debug Mode

To test translations without creating PRs:

```yaml
- uses: workos/.github/actions/sdk-sync@main
  with:
    github-token: ${{ secrets.CROSS_REPO_TOKEN }}
    openai-key: ${{ secrets.OPENAI_API_KEY }}
    debug-mode: true
```

In debug mode, the action will:
- Output detailed translation information
- Save translated files to the workflow artifacts
- Show diffs of all changes
- Skip PR creation

## How It Works

### 1. Change Detection
The action analyzes the pull request to identify:
- Which files were changed
- The type of changes (additions, modifications, deletions)
- The source SDK language

### 2. File Mapping
For each changed file, the action:
- Determines the equivalent file path in target repositories
- Gathers context from similar files if the target doesn't exist
- Skips non-translatable files (docs, configs, test fixtures)

### 3. Translation Process
The action uses a two-phase approach:

**Phase 1: Structured Translation**
- Attempts to apply changes directly using code analysis
- Handles common patterns like parameter additions, field additions
- Preserves exact formatting and structure

**Phase 2: AI-Powered Translation** (if Phase 1 fails)
- Uses GPT-4 to understand the conceptual changes
- Translates changes to target language idioms
- Ensures minimal, surgical modifications

### 4. PR Creation
For each target repository:
- Creates a branch named `cross-sdk-sync-{PR_NUMBER}`
- Commits translated changes
- Opens a PR with translation notes
- Updates existing PRs if they already exist

## Supported Repositories

- `workos/workos-ruby` - Ruby SDK
- `workos/workos-node` - Node.js/TypeScript SDK
- `workos/workos-python` - Python SDK
- `workos/workos-php` - PHP SDK

## File Filtering

The following files are automatically skipped:
- Documentation files (README, CHANGELOG, etc.)
- Configuration files (.gitignore, package-lock.json, etc.)
- Test fixtures and data files
- IDE configurations
- License files

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/workos/.github.git
cd .github/actions/sdk-sync

# Install dependencies
npm install

# Build the action
npm run build
```

### Local Testing

```bash
# Build and prepare
npm run prepare

# The action can be tested by creating a test workflow
# that uses the local path to the action
```

Additionally, this can be tested using [`act`](https://github.com/nektos/act):
```bash
#!/usr/bin/env bash

# Force debug mode to be true both in the test event and in the workflow environment
# jq '.inputs.debug_mode = "true"' test-event.json > test-event.tmp.json && mv test-event.tmp.json test-event.json

# Create debug directory in the host filesystem
mkdir -p ./debug-output

# Run with debug mode force-enabled
# Pass Docker volume mount through container-options
act workflow_dispatch \
  -e test-event.json \
  -j translate-to-other-sdks \
  --verbose \
  --container-architecture linux/amd64 \
  -s DEBUG_MODE=true \
  --container-options "-v $PWD/debug-output:/debug-output"

# 1. Start by fixing the token limit issue - that's blocking your testing
# 2. Split the translation process into smaller steps
# 3. Build a better mapping between repositories
# 4. Would you like me to help with implementing any specific part of this solution?
```

A test event looks like this:

```json
{
  "event_type": "workflow_dispatch",
  "inputs": {
    "pr_number": "1273",
    "debug_mode": "false",
    "target_repos": "workos/workos-ruby,workos/workos-python"
  },
  "repository": {
    "name": "workos-node",
    "owner": {
      "login": "workos"
    },
    "full_name": "workos/workos-node"
  },
  "pull_request": {
    "number": 1273,
    "head": {
      "ref": "some-branch-name"
    },
    "base": {
      "ref": "main"
    }
  }
}
```

## Translation Examples

### Ruby to Node.js
```ruby
# Ruby change
def get_user(id:, organization_id: nil)
  # implementation
end
```

Translates to:
```typescript
// Node.js
async getUser(id: string, organizationId?: string) {
  // implementation
}
```

### Python to PHP
```python
# Python change
def list_users(self, *, limit: int = 10, before: str = None):
    # implementation
```

Translates to:
```php
// PHP
public function listUsers(int $limit = 10, ?string $before = null) {
    // implementation
}
```

## Troubleshooting

### Common Issues

1. **Translation Failures**: Some complex changes may not translate automatically. The PR will include manual instructions for these files.

2. **Token Limits**: Very large files may hit OpenAI token limits. The action automatically handles this by using a more concise translation approach.

3. **Missing Target Files**: If a file doesn't exist in the target repository, the action will attempt to create it based on similar files.

### Debug Output

Enable debug mode to see:
- Detailed translation steps
- Token usage statistics
- File mapping decisions
- Full translated content

## Contributing

When making changes to the SDK Sync action:

1. Update the TypeScript source in `src/`
2. Run `npm run build` to compile
3. Commit both source and compiled files
4. Test with debug mode enabled first

## License

This action is part of the WorkOS SDK suite and follows the same licensing terms.
