'use strict';
// Loads the kit in Node exactly as the browser does: the <script src> list from index.html, in order.
// Each file runs in this context via vm.runInThisContext, so top-level collisions behave like the browser.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..', '..');

function scriptList() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1]);
}

function loadKit() {
  if (globalThis.KIT) return globalThis.KIT;
  globalThis.window = globalThis; // no `document`: any top-level DOM access fails loudly
  for (const rel of scriptList()) {
    if (rel === 'js/app.js') continue; // app.js starts the router (browser only)
    const file = path.join(ROOT, rel);
    vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
  }
  return globalThis.KIT;
}

function listFiles(dirRel, exts) {
  const out = [];
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (!exts || exts.some((e) => ent.name.endsWith(e))) out.push(path.relative(ROOT, p).split(path.sep).join('/'));
    }
  };
  const abs = path.join(ROOT, dirRel);
  if (fs.existsSync(abs)) walk(abs);
  return out.sort();
}

module.exports = { ROOT, scriptList, loadKit, listFiles };
