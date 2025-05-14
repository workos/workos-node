#!/usr/bin/env bash

# Force debug mode to be true both in the test event and in the workflow environment
jq '.inputs.debug_mode = "true"' test-event.json > test-event.tmp.json && mv test-event.tmp.json test-event.json

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
