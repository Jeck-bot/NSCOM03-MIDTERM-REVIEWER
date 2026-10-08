#!/usr/bin/env bash
# T: run the Node test suite. Optional filter: bash tools/test.sh calc   (runs test/*calc*.test.js)
cd "$(dirname "$0")/.." || exit 1
if [ $# -gt 0 ]; then
  files=(); for f in test/*"$1"*.test.js; do [ -f "$f" ] && files+=("$f"); done
  [ ${#files[@]} -eq 0 ] && { echo "no test files match '$1'"; exit 1; }
  node --test --test-reporter=spec "${files[@]}"
else
  node --test --test-reporter=spec "test/**/*.test.js"
fi
