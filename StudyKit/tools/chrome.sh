#!/usr/bin/env bash
# Shared headless-Chrome helpers. Source this file; don't run it.
# Every run gets a fresh throwaway profile, so your real browser and saved progress are never touched.
KIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
K_WIN="$(cygpath -m "$KIT_ROOT")"
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
KIT_OUT="${KIT_OUT:-$(cygpath -m "${TMPDIR:-/tmp}")/kit-out}"
mkdir -p "$KIT_OUT"

# kit_url '/topic/l06?static=1'  (a leading '#' is optional)
kit_url() { local r="${1#\#}"; printf 'file:///%s/index.html#%s' "${K_WIN// /%20}" "$r"; }

chrome_run() {
  local prof rc
  prof="$(mktemp -d)"
  timeout "${CHROME_TIMEOUT:-180}" "$CHROME" --headless --no-first-run --no-default-browser-check \
    --disable-extensions --disable-gpu --user-data-dir="$(cygpath -m "$prof")" "$@" 2>>"$KIT_OUT/chrome.log"
  rc=$?
  rm -rf "$prof"
  return $rc
}
