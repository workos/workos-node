#!/usr/bin/env bash

act pull_request -e test-event.json -j translate-to-other-sdks --verbose --container-architecture linux/amd64

# 1. Start by fixing the token limit issue - that's blocking your testing
# 2. Split the translation process into smaller steps
# 3. Build a better mapping between repositories
# 4. Would you like me to help with implementing any specific part of this solution?
