'use strict';
// L03a line coding / block coding / scrambling — slide oracles (L03 p9, p14, p23, p25, p27, p29, p32, p34-36, p38, p44, p46,
// p51, p54, p59, p61) + invariants (round trips, Manchester mid-bit transition, run-length limits).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();
const L = KIT.calc.linecode || {};

// '+ − 0' text → [1, -1, 0] (slide notation, readable in the oracles below)
const lv = (s) => s.trim().split(/\s+/).map((c) => (c === '+' ? 1 : c === '−' || c === '-' ? -1 : Number(c)));
const SCHEMES = ['unipolar', 'nrzl', 'nrzi', 'rz', 'manchester', 'dmanchester', 'ami', 'pseudoternary', '2b1q', 'mlt3'];
const maxRun = (arr, v) => { let m = 0, c = 0; for (const x of arr) { c = x === v ? c + 1 : 0; if (c > m) m = c; } return m; };
const maxZeroRunStr = (s) => (s.match(/0+/g) || ['']).reduce((a, z) => Math.max(a, z.length), 0);

test('module is registered with a CONV table', () => {
  assert.ok(KIT.calc.linecode, 'KIT.calc.linecode is missing');
  assert.equal(typeof L.CONV, 'object');
});

test('L03 p9: r = 1, 100 kbps, c = 1/2 → 50 kbaud (S = c × N × 1/r)', () => {
  assert.equal(L.baud(100e3, 1, 0.5), 50e3);
  assert.equal(L.baud(100e3, 1), 50e3, 'c defaults to the average value 1/2 (p25 note)');
});

test('L03 p7: r cases — 1, 1/2, 2, 4/3 and the baud rate each gives (c = 1/2)', () => {
  assert.equal(L.baud(8000, 1, 0.5), 4000);
  assert.equal(L.baud(8000, 0.5, 0.5), 8000);   // r = 1/2 (RZ, Manchester): S = N on average
  assert.equal(L.baud(8000, 2, 0.5), 2000);
  assert.equal(L.baud(8000, 4 / 3, 0.5), 3000); // r = 4/3
});

test('L03 p14: receiver clock 0.1% fast → 1001 bps (1 kbps) and 1,001,000 bps (1 Mbps)', () => {
  assert.deepEqual(L.clockDrift(1000, 0.001), { received: 1001, extra: 1 });
  assert.deepEqual(L.clockDrift(1e6, 0.001), { received: 1001000, extra: 1000 });
  // a slow receiver clock reads fewer bits (p13: "faster or slower")
  assert.deepEqual(L.clockDrift(1000, -0.001), { received: 999, extra: -1 });
  assert.equal(L.slipEvery(0.001), 1000, 'a 0.1% error gains one extra bit every 1000 bits');
});

test('L03 p13: the clock-drift figure strings are recorded', () => {
  assert.equal(L.P13.sent, '10110001');
  assert.equal(L.P13.received, '110111000011');
  assert.equal(L.P13.received.length, 12);
});

test('L03 p21: unipolar NRZ — 1 = +V, 0 = 0', () => {
  const e = L.encode('unipolar', '10110');
  assert.deepEqual(e.levels, [1, 0, 1, 1, 0]);
  assert.deepEqual(e.levelSet, [1, 0]);
  assert.deepEqual(e.allowed, [1, 0]);
  assert.equal(e.acceptInverse, false);
});

test('L03 p23: NRZ-L (figure: 0 = +V, 1 = −V) for 01001110', () => {
  const e = L.encode('nrzl', '01001110');
  assert.deepEqual(e.levels, lv('+ − + + − − − +'));
  assert.equal(e.cellsPerBit, 1);
  assert.deepEqual(e.levelSet, [1, 0, -1], 'the 0 axis is shown');
  assert.deepEqual(e.allowed, [1, -1]);
  assert.equal(e.acceptInverse, true, 'polarity is only a convention (p22 text vs p23 figure)');
});

test('L03 p23: NRZ-I (a 1 inverts at the start of the bit, start level +) for 01001110', () => {
  const e = L.encode('nrzi', '01001110');
  assert.deepEqual(e.levels, lv('+ − − − + − + +'));
  assert.deepEqual(e.init, { level: 1 });
  assert.equal(e.acceptInverse, true);
  // a different starting level just mirrors the waveform
  assert.deepEqual(L.encode('nrzi', '01001110', { start: -1 }).levels, lv('− + + + − + − −'));
});

test('L03 p25: NRZ-I at 1 Mbps → S = 500 kbaud, Bmin = 500 kHz', () => {
  assert.equal(L.avgBaud('nrzi', 1e6), 500e3);
  assert.equal(L.minBandwidth('nrzi', 1e6), 500e3, 'Bmin = S (p25)');
  assert.equal(L.baud(1e6, 1, 0.5), 500e3);
});

test('L03 p27: RZ for 01001 → (−0)(+0)(−0)(−0)(+0); r = 1/2, S = N', () => {
  const e = L.encode('rz', '01001');
  assert.deepEqual(e.levels, lv('− 0 + 0 − 0 − 0 + 0'));
  assert.equal(e.cellsPerBit, 2);
  assert.deepEqual(e.allowed, [1, 0, -1]);
  assert.equal(L.avgBaud('rz', 1e6), 1e6);
});

test('L03 p29: Manchester (0 = high→low, 1 = low→high) for 010011', () => {
  const e = L.encode('manchester', '010011');
  assert.deepEqual(e.levels, lv('+ − − + + − + − − + − +'));
  assert.equal(e.cellsPerBit, 2);
  assert.deepEqual(e.allowed, [1, -1]);
  assert.equal(e.acceptInverse, true, 'p5 text has it reversed; accept the mirror');
});

test('L03 p29: differential Manchester (mid-bit transition always; 0 = transition at the start; prior level +) for 010011', () => {
  const e = L.encode('dmanchester', '010011');
  assert.deepEqual(e.levels, lv('− + + − + − + − − + + −'));
  assert.deepEqual(e.init, { level: 1 });
  assert.equal(e.cellsPerBit, 2);
});

test('L03 p29/p30: Manchester family has r = 1/2, S_avg = N, Bmin = 2 × NRZ', () => {
  assert.equal(L.avgBaud('manchester', 1e6), 1e6);
  assert.equal(L.avgBaud('dmanchester', 1e6), 1e6);
  assert.equal(L.minBandwidth('manchester', 1e6), 2 * L.minBandwidth('nrzl', 1e6));
});

test('L03 p32: AMI (0 = 0 V; 1s alternate, first +) for 010010', () => {
  const e = L.encode('ami', '010010');
  assert.deepEqual(e.levels, lv('0 + 0 0 − 0'));
  assert.deepEqual(e.allowed, [1, 0, -1]);
  assert.equal(L.avgBaud('ami', 1e6), 500e3, 'r = 1, S_avg = N/2');
});

test('L03 p32: pseudoternary (1 = 0 V; 0s alternate, first +) for 010010 — reverse of AMI', () => {
  const e = L.encode('pseudoternary', '010010');
  assert.deepEqual(e.levels, lv('+ 0 − + 0 −'));
  const ami = L.encode('ami', '010010').levels;
  // "reverse of AMI": the zero/nonzero roles swap, so encoding the complement with AMI gives the same pulses
  assert.deepEqual(L.encode('ami', '101101').levels, e.levels);
  assert.equal(ami.filter((x) => x === 0).length, 4);
});

test('L03 p34-36: mBnL validity — 2^m ≤ L^n', () => {
  const a = L.mbnl(2, 1, 4);   // 2B1Q: exact mapping
  assert.deepEqual([a.data, a.signals, a.valid, a.exact, a.unused], [4, 4, true, true, 0]);
  const b = L.mbnl(8, 6, 3);   // 8B6T: 256 of 729 patterns used
  assert.deepEqual([b.data, b.signals, b.valid, b.exact, b.unused], [256, 729, true, false, 473]);
  const c = L.mbnl(3, 2, 2);   // 8 data patterns, only 4 signal patterns: not enough signals
  assert.deepEqual([c.data, c.signals, c.valid, c.exact, c.unused, c.short], [8, 4, false, false, 0, 4]);
  assert.equal(L.mbnl(4, 3, 3).valid, true);   // 16 ≤ 27
  assert.equal(L.mbnl(5, 3, 3).valid, false);  // 32 > 27
});

test('L03 p37: mBnL notation — B = 2, T = 3, Q = 4 levels; r = m/n', () => {
  assert.deepEqual(L.parseMbnl('2B1Q'), { m: 2, n: 1, L: 4, r: 2 });
  assert.deepEqual(L.parseMbnl('8B6T'), { m: 8, n: 6, L: 3, r: 8 / 6 });
  assert.equal(L.parseMbnl('2b1q').L, 4, 'case-insensitive');
  assert.throws(() => L.parseMbnl('8B6X'));
});

test('L03 p38: 2B1Q for 00 11 01 10 01 → +1 −3 −3 +1 +3 (positive start); S = N/4 (r = 2, not 1/2)', () => {
  const e = L.encode('2b1q', '0011011001');
  assert.deepEqual(e.levels, [1, -3, -3, 1, 3]);
  assert.equal(e.cellsPerBit, 0.5);
  assert.deepEqual(e.allowed, [3, 1, -1, -3]);
  assert.deepEqual(e.levelSet, [3, 1, 0, -1, -3]);
  assert.equal(L.AVG['2b1q'].r, 2);
  assert.equal(L.avgBaud('2b1q', 8e6), 2e6);
});

test('L03 p38: the 2B1Q transition table (previous level positive / negative)', () => {
  const pos = { '00': 1, '01': 3, '10': -1, '11': -3 };
  const neg = { '00': -1, '01': -3, '10': 1, '11': 3 };
  for (const [bits, v] of Object.entries(pos)) assert.deepEqual(L.encode('2b1q', bits, { prevPolarity: 1 }).levels, [v], bits + ' after +');
  for (const [bits, v] of Object.entries(neg)) assert.deepEqual(L.encode('2b1q', bits, { prevPolarity: -1 }).levels, [v], bits + ' after −');
  assert.deepEqual(L.TABLE_2B1Q.positive, pos);
  assert.deepEqual(L.TABLE_2B1Q.negative, neg);
});

test('L03 p39: a "+" weighted code is inverted to remove a DC component (+00++− → −00−−+)', () => {
  assert.deepEqual(L.invertCode([1, 0, 0, 1, 1, -1]), [-1, 0, 0, -1, -1, 1]);
});

test('L03 p40/p42: 8B6T and 4D-PAM5 slide examples are recorded', () => {
  assert.deepEqual(L.SLIDE_8B6T, [
    { bits: '00010001', code: '−0−0++', sent: '−0−0++' },
    { bits: '01010011', code: '−+−++0', sent: '−+−++0' },
    { bits: '01010000', code: '+−−+0+', sent: '−++−0−' }   // sent inverted (DC balance)
  ]);
  assert.deepEqual(L.SLIDE_4DPAM5, { bits: '00011110', wires: [-2, 1, 2, -1], gbps: 1, perWireMbps: 250, perWireMBd: 125 });
});

test('L03 p44: MLT-3 for 01011011 → 0 + + 0 − − 0 + and the worst case 11111111 → + 0 − 0 + 0 − 0', () => {
  assert.deepEqual(L.encode('mlt3', '01011011').levels, lv('0 + + 0 − − 0 +'));
  assert.deepEqual(L.encode('mlt3', '11111111').levels, lv('+ 0 − 0 + 0 − 0'));
  assert.deepEqual(L.encode('mlt3', '01011011').init, { level: 0 });
  assert.deepEqual(L.encode('mlt3', '01011011').allowed, [1, 0, -1]);
  // the worst-case pattern is periodic with period 4 bits → analog frequency N/4 (p45)
  const w = L.encode('mlt3', '11111111').levels;
  assert.deepEqual(w.slice(0, 4), w.slice(4, 8));
});

test('L03 p46: summary table — average bandwidth as a multiple of N', () => {
  const t = { unipolar: 1 / 2, nrzl: 1 / 2, nrzi: 1 / 2, manchester: 1, dmanchester: 1, ami: 1 / 2, '2b1q': 1 / 4, '8b6t': 3 / 4, '4dpam5': 1 / 8, mlt3: 1 / 3 };
  for (const [k, f] of Object.entries(t)) assert.equal(L.AVG[k].factor, f, k);
  assert.equal(L.minBandwidth('mlt3', 120e6), 40e6);
  assert.equal(L.minBandwidth('8b6t', 100e6), 75e6);
  assert.equal(L.minBandwidth('4dpam5', 1e9), 125e6);
});

test('L03 p46 vs p8: with c = 1/2 the p23-p38 figure boxes agree with S = c·N/r', () => {
  for (const k of ['unipolar', 'nrzl', 'nrzi', 'rz', 'manchester', 'dmanchester', 'ami', 'pseudoternary', '2b1q']) {
    assert.equal(L.avgBaud(k, 1e6), L.baud(1e6, L.AVG[k].r, 0.5), k);
  }
});

test('L03 p51: the 4B/5B data table (all 16 entries)', () => {
  const t = { '0000': '11110', '0001': '01001', '0010': '10100', '0011': '10101', '0100': '01010', '0101': '01011', '0110': '01110', '0111': '01111',
    '1000': '10010', '1001': '10011', '1010': '10110', '1011': '10111', '1100': '11010', '1101': '11011', '1110': '11100', '1111': '11101' };
  assert.deepEqual(L.TABLE_4B5B, t);
});

test('L03 p51: the 4B/5B control sequences', () => {
  assert.deepEqual(L.CONTROL_4B5B, { Q: '00000', I: '11111', H: '00100', J: '11000', K: '10001', T: '01101', S: '11001', R: '00111' });
  assert.equal(L.CONTROL_NAMES.J, 'Start delimiter');
  assert.equal(L.CONTROL_NAMES.Q, 'Quiet');
  assert.equal(L.CONTROL_NAMES.R, 'Reset');
});

test('L03 p52/p53: substitution and redundancy — 16 data words of 32, 16 spare for control/invalid', () => {
  assert.equal(L.encode4b5b('0000'), '11110');
  assert.equal(L.encode4b5b('1111'), '11101');
  assert.equal(L.encode4b5b('0001'), '01001');
  assert.equal(L.encode4b5b('000011110001'), '11110' + '11101' + '01001');
  const codes = Object.values(L.TABLE_4B5B), ctl = Object.values(L.CONTROL_4B5B);
  assert.equal(new Set(codes).size, 16);
  assert.equal(2 ** 5 - 2 ** 4, 16, 'p53 "32 − 26" means 32 − 16');
  assert.equal(ctl.filter((c) => codes.includes(c)).length, 0, 'control words are never data words');
  // 16 extra words: 8 are the named control sequences, the other 8 are invalid (a receiver can flag them as errors)
  const bad = L.invalid5b();
  assert.equal(bad.length, 32 - 16 - 8);
  assert.ok(bad.every((w) => !codes.includes(w) && !ctl.includes(w)));
  assert.deepEqual(bad, ['00001', '00010', '00011', '00101', '00110', '01000', '01100', '10000']);
});

test('L03 p48: block coding mB/nB — N × n/m (4B/5B adds 25%)', () => {
  assert.equal(L.blockRate(1e6, 4, 5), 1.25e6);
  assert.equal(L.rate4b5b(1e6), 1.25e6);
  assert.equal(L.rate4b5b(100e6), 125e6);
});

test('L03 p54: 1 Mbps with 4B/5B → 1.25 Mbps; NRZ-I Bmin 625 kHz; Manchester Bmin 1.25 MHz', () => {
  const n2 = L.rate4b5b(1e6);
  assert.equal(n2, 1.25e6);
  assert.equal(L.minBandwidth('nrzi', n2), 625e3);
  assert.equal(L.minBandwidth('manchester', n2), 1.25e6);
});

test('L03 p59: B8ZS substitutes eight zeros with 000VB0VB — previous level positive and negative', () => {
  // slide a: the 1 before the zeros is positive (the pulse before the stream was negative) → 000+−0−+
  const a = L.b8zs('100000000', -1);
  assert.deepEqual(a.levels, lv('+ 0 0 0 + − 0 − +'));
  assert.deepEqual(a.marks, [{ i: 4, kind: 'V' }, { i: 5, kind: 'B' }, { i: 7, kind: 'V' }, { i: 8, kind: 'B' }]);
  assert.deepEqual(a.subs, [{ start: 1, len: 8, pattern: '000VB0VB' }]);
  // slide b: the 1 is negative → 000−+0+−
  const b = L.b8zs('100000000', 1);
  assert.deepEqual(b.levels, lv('− 0 0 0 − + 0 + −'));
  assert.deepEqual(b.marks.map((m) => m.kind + m.i), ['V4', 'B5', 'V7', 'B8']);
  // the two violations V sit at the polarity of the previous pulse; the substitution leaves the polarity state unchanged
  assert.equal(a.last, 1);
  assert.equal(b.last, -1);
});

test('L03 p61: HDB3 on 11 0000 1 0000 0000 0 → + − | +00+ | − | 000− | +00+ | 0', () => {
  const r = L.hdb3('1100001000000000', { prevPolarity: -1, parity: 0 });
  assert.deepEqual(r.levels, lv('+ − + 0 0 + − 0 0 0 − + 0 0 + 0'));
  assert.deepEqual(r.subs.map((s) => [s.start, s.pattern, s.parityBefore]), [[2, 'B00V', 'even'], [7, '000V', 'odd'], [11, 'B00V', 'even']]);
  assert.deepEqual(r.marks.map((m) => m.kind + m.i), ['B2', 'V5', 'V10', 'B11', 'V14']);
  // nonzero pulses counted before each substitution: 2 since the start, 1 since the first substitution, 0 since the second
  assert.deepEqual(r.subs.map((s) => s.pulsesBefore), [2, 1, 0]);
  // an assumed odd count before the stream is included in the first count
  assert.deepEqual(L.hdb3('1100001', { prevPolarity: -1, parity: 1 }).subs.map((s) => [s.pulsesBefore, s.parityBefore, s.pattern]), [[3, 'odd', '000V']]);
  // the successive violations alternate in polarity (this is what removes the DC component)
  const vs = r.marks.filter((m) => m.kind === 'V').map((m) => r.levels[m.i]);
  assert.deepEqual(vs, [1, -1, 1]);
});

test('L03 p60: HDB3 parity rule — an odd count gives 000V, an even count gives B00V', () => {
  const even = L.hdb3('0000', { prevPolarity: -1, parity: 0 });
  assert.deepEqual(even.levels, lv('+ 0 0 +'), 'even → B00V (B alternates from −, V repeats B)');
  const odd = L.hdb3('0000', { prevPolarity: -1, parity: 1 });
  assert.deepEqual(odd.levels, lv('0 0 0 −'), 'odd → 000V (V repeats the previous − pulse)');
  assert.deepEqual(L.hdb3('1000010000', { prevPolarity: 1 }).levels.slice(0, 5), lv('− 0 0 0 −'), 'one pulse since the start (odd) → 000V');
});

test('L03 p48: encode/decode — shape of the result record for every scheme', () => {
  for (const s of SCHEMES) {
    const e = L.encode(s, '01101100');
    assert.ok(Array.isArray(e.levels) && e.levels.length === Math.round(8 * e.cellsPerBit), s + ' cell count');
    assert.ok([0.5, 1, 2].includes(e.cellsPerBit), s + ' cellsPerBit');
    assert.ok(e.levels.every((v) => e.allowed.includes(v)), s + ' levels ⊆ allowed');
    assert.ok(e.allowed.every((v) => e.levelSet.includes(v)), s + ' allowed ⊆ levelSet');
    assert.ok(e.levelSet.includes(0), s + ' shows the 0 axis');
    assert.deepEqual(e.levelSet.slice().sort((a, b) => b - a), e.levelSet, s + ' levelSet is top→bottom');
    assert.equal(typeof e.acceptInverse, 'boolean');
  }
});

test('invariant: decode(encode(x)) = x for every scheme (all 8-bit strings and random longer ones)', () => {
  for (const s of SCHEMES) {
    for (let n = 0; n < 256; n++) {
      const bits = n.toString(2).padStart(8, '0');
      assert.equal(L.decode(s, L.encode(s, bits).levels), bits, s + ' ' + bits);
    }
    const rng = KIT.rng('linecode-roundtrip-' + s);
    for (let k = 0; k < 40; k++) {
      const bits = rng.bits(2 * rng.int(1, 12));
      assert.equal(L.decode(s, L.encode(s, bits).levels), bits, s + ' ' + bits);
    }
  }
});

test('invariant: the decoder honours the same start / previous-polarity options as the encoder', () => {
  const rng = KIT.rng('linecode-opts');
  for (let k = 0; k < 30; k++) {
    const bits = rng.bits(2 * rng.int(2, 8));
    for (const p of [1, -1]) {
      for (const s of ['nrzi', 'dmanchester']) assert.equal(L.decode(s, L.encode(s, bits, { start: p }).levels, { start: p }), bits, s);
      for (const s of ['ami', 'pseudoternary', '2b1q']) assert.equal(L.decode(s, L.encode(s, bits, { prevPolarity: p }).levels, { prevPolarity: p }), bits, s);
    }
    for (const last of [1, -1]) assert.equal(L.decode('mlt3', L.encode('mlt3', bits, { lastNonzero: last }).levels), bits, 'mlt3');
  }
});

test('invariant: Manchester and differential Manchester have a mid-bit transition in every bit', () => {
  const rng = KIT.rng('linecode-midbit');
  for (let k = 0; k < 60; k++) {
    const bits = rng.bits(rng.int(1, 16));
    for (const s of ['manchester', 'dmanchester']) {
      const c = L.encode(s, bits).levels;
      for (let i = 0; i < bits.length; i++) assert.equal(c[2 * i], -c[2 * i + 1], `${s} ${bits} bit ${i}`);
    }
    // differential Manchester: a 0 has a transition at the start of the bit (vs the end of the previous bit), a 1 does not
    const d = L.encode('dmanchester', bits).levels;
    let prev = 1;
    for (let i = 0; i < bits.length; i++) {
      assert.equal(d[2 * i] !== prev, bits[i] === '0', `dmanchester ${bits} start of bit ${i}`);
      prev = d[2 * i + 1];
    }
  }
});

test('invariant: RZ returns to 0 in the second half; AMI/pseudoternary pulses alternate', () => {
  const rng = KIT.rng('linecode-rz-ami');
  for (let k = 0; k < 40; k++) {
    const bits = rng.bits(rng.int(2, 16));
    const rz = L.encode('rz', bits).levels;
    for (let i = 0; i < bits.length; i++) assert.equal(rz[2 * i + 1], 0);
    for (const s of ['ami', 'pseudoternary']) {
      const pulses = L.encode(s, bits).levels.filter((x) => x !== 0);
      pulses.forEach((p, i) => assert.equal(p, i % 2 === 0 ? 1 : -1, `${s} ${bits}`));
    }
    assert.equal(L.encode('ami', bits).levels.filter((x) => x !== 0).length, bits.split('1').length - 1);
  }
});

test('invariant: 4B/5B round trips and never produces more than 3 consecutive 0s', () => {
  const data = Object.keys(L.TABLE_4B5B);
  for (const a of data) for (const b of data) {
    const out = L.encode4b5b(a + b);
    assert.equal(L.decode4b5b(out), a + b);
    assert.ok(maxZeroRunStr(out) <= 3, `${a}${b} → ${out}`);
  }
  const rng = KIT.rng('linecode-4b5b');
  for (let k = 0; k < 60; k++) {
    const bits = rng.bits(4 * rng.int(1, 12));
    const out = L.encode4b5b(bits);
    assert.equal(out.length, bits.length * 5 / 4);
    assert.equal(L.decode4b5b(out), bits);
    assert.ok(maxZeroRunStr(out) <= 3, bits);
  }
  // all-zero data (the worst case for NRZ-I) still has transitions: 0000 → 11110
  assert.equal(L.encode4b5b('0'.repeat(32)), '11110'.repeat(8));
});

test('L03 p51: 4B/5B lookup classifies data, control and unused words', () => {
  assert.deepEqual(L.lookup5b('11110'), { type: 'data', data: '0000' });
  assert.deepEqual(L.lookup5b('11000'), { type: 'control', name: 'J', meaning: 'Start delimiter' });
  assert.deepEqual(L.lookup5b('00001'), { type: 'invalid' });
  assert.throws(() => L.decode4b5b('11000'), /control|invalid/i);
});

test('invariant: B8ZS output never has 8 zeros in a row, decodes back, and the pulse state stays balanced', () => {
  const rng = KIT.rng('linecode-b8zs');
  for (let k = 0; k < 120; k++) {
    const n = rng.int(1, 40), p = rng.pick([0.5, 0.8, 0.9, 0.97]);
    let bits = ''; for (let i = 0; i < n; i++) bits += rng.chance(p) ? '0' : '1';
    for (const prev of [1, -1]) {
      const r = L.b8zs(bits, prev);
      assert.equal(r.levels.length, bits.length);
      assert.ok(maxRun(r.levels, 0) < 8, `b8zs ${bits}`);
      assert.equal(L.unscramble('b8zs', r.levels, { prevPolarity: prev }), bits, `b8zs round trip ${bits}`);
      let sum = 0; r.levels.forEach((v) => { sum += v; assert.ok(Math.abs(sum) <= 2, `b8zs running sum ${bits}`); });
      assert.ok(r.levels.every((v) => [-1, 0, 1].includes(v)));
    }
  }
  assert.ok(maxRun(L.encode('ami', '0'.repeat(20)).levels, 0) === 20, 'plain AMI keeps the long run that scrambling removes');
});

test('invariant: HDB3 output never has 4 zeros in a row, decodes back, and the violations alternate', () => {
  const rng = KIT.rng('linecode-hdb3');
  for (let k = 0; k < 120; k++) {
    const n = rng.int(1, 40), p = rng.pick([0.5, 0.75, 0.9, 0.97]);
    let bits = ''; for (let i = 0; i < n; i++) bits += rng.chance(p) ? '0' : '1';
    for (const prev of [1, -1]) for (const parity of [0, 1]) {
      const r = L.hdb3(bits, { prevPolarity: prev, parity });
      assert.equal(r.levels.length, bits.length);
      assert.ok(maxRun(r.levels, 0) < 4, `hdb3 ${bits}`);
      assert.equal(L.unscramble('hdb3', r.levels, { prevPolarity: prev }), bits, `hdb3 round trip ${bits}`);
      const vs = r.marks.filter((m) => m.kind === 'V').map((m) => r.levels[m.i]);
      for (let i = 1; i < vs.length; i++) assert.equal(vs[i], -vs[i - 1], `hdb3 violations alternate ${bits}`);
    }
  }
});

test('hostile input: unknown schemes, non-binary bits and odd 2B1Q lengths are rejected', () => {
  assert.throws(() => L.encode('bogus', '0101'), /unknown/i);
  assert.throws(() => L.encode('nrzl', '01x1'), /bit/i);
  assert.throws(() => L.encode('nrzl', 101), /bit/i);
  assert.throws(() => L.encode('2b1q', '011'), /even|pairs/i);
  assert.throws(() => L.encode4b5b('010'), /multiple of 4/i);
  assert.throws(() => L.b8zs('01a', 1), /bit/i);
  assert.throws(() => L.hdb3('0000', { prevPolarity: 2 }), /polarity/i);
  assert.throws(() => L.decode('manchester', [1, 1]), /transition|violat/i);
  assert.equal(L.encode('nrzl', '').levels.length, 0);
});

test('CONV documents every slide convention with a slide ref', () => {
  for (const k of ['baud', 'unipolar', 'nrzl', 'nrzi', 'rz', 'manchester', 'dmanchester', 'ami', 'pseudoternary', 'mbnl', '2b1q', 'mlt3',
    'summary', 'block4b5b', 'b8zs', 'hdb3', 'drift']) {
    assert.match(L.CONV[k] || '', /L03 p\d+/, `CONV.${k} needs a slide ref`);
  }
  assert.match(L.CONV.nrzl, /0 = \+V/, 'NRZ-L follows the p23 figure');
  assert.match(L.CONV.manchester, /0 = high/);
});
