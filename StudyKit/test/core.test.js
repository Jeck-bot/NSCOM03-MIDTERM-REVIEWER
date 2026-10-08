'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();

test('rng is deterministic per seed and in range', () => {
  const a = KIT.rng(42), b = KIT.rng(42), c = KIT.rng(43);
  const sa = [a.next(), a.next(), a.next()], sb = [b.next(), b.next(), b.next()];
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, [c.next(), c.next(), c.next()]);
  const r = KIT.rng(7);
  for (let i = 0; i < 500; i++) {
    const x = r.next(); assert.ok(x >= 0 && x < 1);
    const n = r.int(3, 6); assert.ok(n >= 3 && n <= 6 && Number.isInteger(n));
  }
  assert.equal(KIT.rng('abc').next(), KIT.rng('abc').next(), 'string seeds hash deterministically');
  const s = KIT.rng(1).shuffle([1, 2, 3, 4, 5]);
  assert.deepEqual([...s].sort(), [1, 2, 3, 4, 5]);
  assert.match(KIT.rng(5).bits(12), /^[01]{12}$/);
  assert.ok(['x', 'y', 'z'].includes(KIT.rng(9).pick(['x', 'y', 'z'])));
});

test('fmt.si picks SI prefixes and significant digits', () => {
  const si = KIT.fmt.si;
  assert.equal(si(2.5e6, 'bps'), '2.5 Mbps');
  assert.equal(si(34881, 'bps', 4), '34.88 kbps');
  assert.equal(si(0.05, 's'), '50 ms');
  assert.equal(si(2e-5, 's'), '20 µs');
  assert.equal(si(0.75e-6, 'm'), '750 nm');
  assert.equal(si(0, 'bps'), '0 bps');
  assert.equal(si(999.96, 'bps', 3), '1 kbps');
  assert.equal(si(500e3, 'baud'), '500 kbaud');
  assert.equal(si(-3.0103, 'dB', 3), '−3.01 dB');
  assert.equal(si(40, 'dB'), '40 dB');
  assert.equal(si(1e9, 'bps'), '1 Gbps');
  assert.equal(si(6e6, 'Hz'), '6 MHz');
});

test('fmt.num groups thousands, uses a real minus, and switches to ×10ⁿ', () => {
  const num = KIT.fmt.num;
  assert.equal(num(34881, 4), '34,880');
  assert.equal(num(6000), '6,000');
  assert.equal(num(1001000), '1,001,000');
  assert.equal(num(-0.28, 2), '−0.28');
  assert.equal(num(0.75e-6, 3), '7.5×10⁻⁷');
  assert.equal(num(4e14, 3), '400,000,000,000,000');
  assert.equal(num(4e15, 2), '4×10¹⁵');
  assert.equal(num(0.0005, 3), '0.0005');
  assert.equal(num(12.5), '12.5');
});

test('fmt.bin / fmt.hex pad to width', () => {
  assert.equal(KIT.fmt.bin(5, 8), '00000101');
  assert.equal(KIT.fmt.hex(0x4b, 2), '4B');
  assert.equal(KIT.fmt.hex(0x212a, 4), '212A');
});

test('store round-trips JSON with a pluggable backend', () => {
  const mem = {};
  const fake = {
    getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); },
    removeItem: (k) => { delete mem[k]; }, key: (i) => Object.keys(mem)[i], get length() { return Object.keys(mem).length; }
  };
  KIT.store._use(fake);
  KIT.store.set('a', { x: 1, y: [2, 3] });
  assert.deepEqual(KIT.store.get('a'), { x: 1, y: [2, 3] });
  assert.ok('nscom03.v1.a' in mem, 'keys are prefixed with nscom03.v1.');
  assert.equal(KIT.store.get('missing', 'dflt'), 'dflt');
  mem['nscom03.v1.bad'] = '{not json';
  assert.equal(KIT.store.get('bad', 7), 7, 'corrupt values fall back to the default');
  assert.deepEqual(KIT.store.keys().sort(), ['a', 'bad']);
  KIT.store.remove('a');
  assert.equal(KIT.store.get('a', null), null);
  const dump = KIT.store.export();
  assert.equal(typeof dump, 'object');
  KIT.store._use(null); // back to memory fallback
  KIT.store.set('m', 3);
  assert.equal(KIT.store.get('m'), 3);
});

test('svg.wavePath draws steps with vertical transitions', () => {
  const geo = { cellWidth: 10, left: 0, levelSet: [1, 0, -1], rowGap: 10, top: 0 };
  // levels: +1 (y=0), +1, -1 (y=20), 0 (y=10)
  assert.equal(KIT.svg.wavePath([1, 1, -1, 0], geo), 'M0 0 H10 H20 V20 H30 V10 H40');
  // null cells leave a gap
  assert.equal(KIT.svg.wavePath([1, null, 1], geo), 'M0 0 H10 M20 0 H30');
  assert.equal(KIT.svg.wavePath([], geo), '');
});

test('svg.niceTicks returns clean steps covering the range', () => {
  assert.deepEqual(KIT.svg.niceTicks(0, 10, 5), [0, 2, 4, 6, 8, 10]);
  assert.deepEqual(KIT.svg.niceTicks(0, 1, 4), [0, 0.25, 0.5, 0.75, 1]);
  const t = KIT.svg.niceTicks(-3, 3, 6);
  assert.equal(t[0], -3); assert.equal(t[t.length - 1], 3);
});
