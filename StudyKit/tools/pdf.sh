#!/usr/bin/env bash
# P: print documents to pdf/ and check them.  bash tools/pdf.sh [cheatsheet reviewer examA examAkey recall …]
. "$(dirname "$0")/chrome.sh"
declare -A ROUTE=( [cheatsheet]=/print/cheatsheet [reviewer]=/print/reviewer [examA]=/print/exam/A [examAkey]=/print/exam/A/key
  [recall]=/print/recall [examB]=/print/exam/B [examBkey]=/print/exam/B/key [drills]=/print/drills [practice]=/print/practice [essays]=/print/essays )
declare -A FILE=( [cheatsheet]=01-Cheat-Sheet [reviewer]=02-Reviewer [examA]=03-Mock-Exam-A [examAkey]=04-Mock-Exam-A-Key
  [recall]=05-Recall-Drill [examB]=06-Mock-Exam-B [examBkey]=07-Mock-Exam-B-Key [drills]=08-Drill-Worksheets [practice]=09-Practice-Set [essays]=09-Essay-Practice )
declare -A DOCID=( [cheatsheet]=cheatsheet [reviewer]=reviewer [examA]=exam-A [examAkey]=exam-A-key [recall]=recall
  [examB]=exam-B [examBkey]=exam-B-key [drills]=drills [practice]=practice [essays]=essays )
docs=("$@"); [ ${#docs[@]} -eq 0 ] && docs=(cheatsheet reviewer examA examAkey recall)
mkdir -p "$KIT_ROOT/pdf"
fail=0
for d in "${docs[@]}"; do
  [ -n "${ROUTE[$d]:-}" ] || { echo "FAIL unknown doc '$d'"; fail=1; continue; }
  tmp="$KIT_OUT/${FILE[$d]}.pdf"; out="$KIT_ROOT/pdf/${FILE[$d]}.pdf"
  rm -f "$tmp"
  chrome_run --virtual-time-budget=15000 --no-pdf-header-footer --print-to-pdf="$tmp" "$(kit_url "${ROUTE[$d]}")"
  [ -s "$tmp" ] || { echo "FAIL $d: no PDF produced"; fail=1; continue; }
  txt="$(pdftotext -layout "$tmp" - 2>/dev/null)"
  pages="$(pdftotext "$tmp" - 2>/dev/null | tr -cd '\f' | wc -c)"
  marker="$(printf '%s' "$txt" | grep -c "END OF DOCUMENT: ${DOCID[$d]}")"
  bad="$(printf '%s' "$txt" | grep -cE '\bundefined\b|\bNaN\b|\[object |\bTODO\b|\bTBD\b')"
  media="$(grep -a -o '/MediaBox \[[^]]*\]' "$tmp" | sort -u | tr '\n' ' ')"
  for i in 1 2 3 4 5; do cp -f "$tmp" "$out" 2>/dev/null && break; sleep 2; done   # OneDrive may briefly lock the file
  status=OK; { [ "$marker" -ge 1 ] && [ "$bad" -eq 0 ]; } || { status=FAIL; fail=1; }
  echo "$status $(basename "$out") pages=$pages marker=$marker bad=$bad media=$media"
done
exit $fail
