#!/usr/bin/env bash
# S: run the in-browser self-test headless; prints "SELFTEST DONE pass=N fail=M" and any failures.
. "$(dirname "$0")/chrome.sh"
OUTF="$KIT_OUT/selftest.html"
chrome_run --virtual-time-budget=15000 --dump-dom "$(kit_url '/selftest')" > "$OUTF"
LINE="$(grep -o 'SELFTEST DONE pass=[0-9]* fail=[0-9]*' "$OUTF" | head -1)"
if [ -z "$LINE" ]; then echo "SELFTEST: no result line — see $OUTF and $KIT_OUT/chrome.log"; exit 1; fi
echo "$LINE"
sed -n '/<pre id="selftest">/,/<\/pre>/p' "$OUTF" | sed 's/<[^>]*>//g; s/&amp;/\&/g; s/&lt;/</g; s/&gt;/>/g' | grep '^FAIL' | head -60
case "$LINE" in *" fail=0") exit 0 ;; *) exit 1 ;; esac
