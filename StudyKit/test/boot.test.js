'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, scriptList, loadKit, listFiles } = require('./helpers/load.js');

const scripts = scriptList();

test('index.html declares utf-8 first and lists scripts', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const head = html.slice(0, html.indexOf('</head>'));
  assert.match(head, /<head>\s*<meta charset="utf-8">/, 'meta charset must be the first element in <head>');
  assert.ok(scripts.length > 50, 'expected the full script list');
  assert.equal(scripts[0], 'js/core/kit.js', 'kit.js must load first');
  assert.equal(scripts[scripts.length - 1], 'js/app.js', 'app.js must load last');
  assert.equal(new Set(scripts).size, scripts.length, 'a script is listed twice');
});

test('every listed script exists', () => {
  for (const rel of scripts) assert.ok(fs.existsSync(path.join(ROOT, rel)), 'missing ' + rel);
});

test('no orphan scripts (every .js under js/, content/, bank/, exams/ is listed)', () => {
  const all = [...listFiles('js', ['.js']), ...listFiles('content', ['.js']), ...listFiles('bank', ['.js']), ...listFiles('exams', ['.js'])];
  const listed = new Set(scripts);
  const orphans = all.filter((f) => !listed.has(f));
  assert.deepEqual(orphans, [], 'unlisted files (OneDrive conflict copies?): ' + orphans.join(', '));
});

test('files are UTF-8 without BOM', () => {
  const files = [...scripts, 'index.html', ...listFiles('css', ['.css'])];
  const dec = new TextDecoder('utf-8', { fatal: true });
  for (const rel of files) {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    assert.ok(!(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf), rel + ' has a BOM');
    assert.doesNotThrow(() => dec.decode(buf), rel + ' is not valid UTF-8');
  }
});

test('no top-level declarations (each file must be an IIFE)', () => {
  for (const rel of scripts) {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const lines = src.split(/\r?\n/);
    lines.forEach((line, i) => {
      assert.ok(!/^(var|let|const|function|class)\b/.test(line), `${rel}:${i + 1} top-level declaration: ${line.slice(0, 60)}`);
    });
  }
});

test('kit loads in Node with no recorded errors', () => {
  const KIT = loadKit();
  assert.ok(KIT && typeof KIT.topic === 'function');
  assert.deepEqual(KIT.errors.map((e) => e.where + ': ' + e.message), []);
});

test('registered topics use known ids', () => {
  const KIT = loadKit();
  for (const t of KIT.topics()) assert.ok(KIT.TOPIC_IDS.includes(t.id), 'unknown topic id ' + t.id);
});
