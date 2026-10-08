'use strict';
// content/formulas.js — every formula is a real, color-coded equation with a legend, when-to-use and a slide example.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

test('every formula has a typeset equation, a legend, when-to-use and a slide example', () => {
  const problems = [];
  KIT.formulas().forEach((f) => {
    const w = f.id;
    if (typeof f.tex !== 'string' || !f.tex.trim()) { problems.push(w + ': missing tex'); return; }
    KIT.math.check('$$' + f.tex + '$$').forEach((e) => problems.push(w + ': ' + e));
    if (!Array.isArray(f.vars)) problems.push(w + ': vars[] missing');
    ['use', 'example'].forEach((k) => {
      if (typeof f[k] !== 'string' || !f[k].trim()) problems.push(w + ': missing ' + k);
      else KIT.schema.checkHtml(f[k], w + '.' + k).forEach((e) => problems.push(e));
    });
    (f.vars || []).forEach((v, i) => {
      if (!v.tex || !v.means) { problems.push(w + '.vars[' + i + ']: needs tex and means'); return; }
      if (f.tex.indexOf(v.tex) < 0) problems.push(w + ': legend symbol ' + v.tex + ' is not in the equation');
      if (v.role !== undefined) {
        if (!KIT.math.ROLES[v.role]) problems.push(w + ': unknown role ' + v.role);
        else if (f.tex.indexOf('\\c{' + v.role + '}{' + v.tex + '}') < 0) problems.push(w + ': ' + v.tex + ' is not colored as ' + v.role + ' in the equation');
      }
    });
  });
  assert.deepEqual(problems, []);
});
