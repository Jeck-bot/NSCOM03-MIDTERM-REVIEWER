'use strict';
// Bans things that break under file:// in Chrome, or that would make calc/gen non-deterministic.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, scriptList, listFiles } = require('./helpers/load.js');

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const scripts = scriptList();

// Strip comments so prose in comments doesn't trip the lint (string contents are kept).
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"`])\/\/.*$/gm, '$1');
}

const JS_BANS = [
  [/\bimport\s*\(/, 'dynamic import()'],
  [/^\s*(import|export)\s/m, 'ES module syntax'],
  [/\bfetch\s*\(/, 'fetch() (blocked on file://)'],
  [/XMLHttpRequest/, 'XMLHttpRequest (blocked on file://)'],
  [/\bnew\s+Worker\b/, 'Web Worker'],
  [/<iframe/i, 'iframe'],
  [/pushState|replaceState/, 'history.pushState (restricted on file://)'],
  [/https?:\/\/(?!www\.w3\.org\/)/, 'network URL'],
  [/\beval\s*\(/, 'eval'],
  [/new\s+Function\s*\(/, 'new Function'],
  [/document\.write/, 'document.write'],
  [/insertAdjacentHTML/, 'insertAdjacentHTML (use KIT.html for trusted strings)']
];

test('index.html has no module scripts or remote resources', () => {
  const html = read('index.html');
  assert.ok(!/type="module"/.test(html), 'module script in index.html');
  assert.ok(!/https?:\/\//.test(html), 'remote URL in index.html');
});

test('JS files avoid file://-hostile and unsafe APIs', () => {
  for (const rel of scripts) {
    const src = stripComments(read(rel));
    for (const [re, why] of JS_BANS) assert.ok(!re.test(src), `${rel}: ${why}`);
    if (rel !== 'js/core/util.js') assert.ok(!/\.innerHTML\s*=/.test(src), `${rel}: assign innerHTML only via KIT.html (util.js)`);
  }
});

test('calc and gen code is deterministic (no Math.random / Date)', () => {
  for (const rel of scripts.filter((s) => s.startsWith('js/calc/') || s.startsWith('js/gen/'))) {
    const src = stripComments(read(rel));
    assert.ok(!/Math\.random/.test(src), `${rel}: Math.random`);
    assert.ok(!/\bDate\b/.test(src), `${rel}: Date`);
  }
});

test('CSS has no @font-face, @import or remote url()', () => {
  for (const rel of listFiles('css', ['.css'])) {
    const src = read(rel);
    assert.ok(!/@font-face/.test(src), `${rel}: @font-face`);
    assert.ok(!/@import/.test(src), `${rel}: @import`);
    assert.ok(!/url\(\s*['"]?https?:/.test(src), `${rel}: remote url()`);
  }
});
