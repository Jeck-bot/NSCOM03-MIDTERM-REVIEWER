#!/usr/bin/env bash
# SH: screenshot a route.  bash tools/shot.sh '#/topic/l06?static=1' l06 [1280,1600]
. "$(dirname "$0")/chrome.sh"
ROUTE="${1:-/home}"; NAME="${2:-shot}"; SIZE="${3:-1280,1600}"
F="$KIT_OUT/$NAME.png"
rm -f "$F"
chrome_run --virtual-time-budget=5000 --hide-scrollbars --window-size="$SIZE" --screenshot="$F" "$(kit_url "$ROUTE")"
if [ -s "$F" ]; then echo "OK $F"; else echo "FAIL: no screenshot (see $KIT_OUT/chrome.log)"; exit 1; fi
