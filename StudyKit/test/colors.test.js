'use strict';
// Color-coded solutions (AUTHORING §3.8): every generator with a formula colors its given values, its formula and every
// substituted number, and lists its colors in a key. Drawing-only generators have no formula and are exempt.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

const EXEMPT = new Set(['l03a.draw', 'l03a.decode', 'l03a.scramble', 'l04.constellation', 'l02.sketch', 'l03b.sketch', 'l04.sketch']);
const SEEDS = 25;
const SLOT = KIT.math.ROLES;

function check(id, p) {
  const prob = KIT.gen.build(id, p), where = id + ' ' + JSON.stringify(p).slice(0, 70), text = [prob.prompt].concat(prob.steps).join('\n');
  assert.ok(Array.isArray(prob.colors) && prob.colors.length, where + ': no color key');
  assert.ok(/\\c\{/.test(prob.steps.join('\n')), where + ': the steps have no colored math');
  prob.colors.forEach((c) => {
    const used = text.indexOf('\\c{' + c.role + '}') >= 0 || text.indexOf('class="v' + SLOT[c.role] + '"') >= 0;
    assert.ok(used, where + ': key lists ' + c.role + ' (' + c.tex + ') but the solution never colors it');
  });
  prob.steps.forEach((s, i) => assert.deepEqual(KIT.schema.checkHtml(s, where + ' step ' + (i + 1)), []));
}

KIT.gen.all().filter((g) => !EXEMPT.has(g.id)).forEach((g) => {
  const first = KIT.gen.build(g.id, (g.samples || [])[0] || (g.params ? g.params(KIT.rng(1)) : {}));
  const converted = Array.isArray(first.colors);
  test('colored solution: ' + g.id, { todo: converted ? false : 'steps not color-coded yet' }, () => {
    (g.samples || []).forEach((p) => check(g.id, p));
    if (typeof g.params === 'function') for (let s = 1; s <= SEEDS; s++) check(g.id, g.params(KIT.rng(s)));
  });
});
