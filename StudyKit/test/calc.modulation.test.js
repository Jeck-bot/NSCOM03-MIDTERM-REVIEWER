'use strict';
// L04 Digital-to-Analog — slide oracles (L04 p6, p7, p12, p13, p16, p19, p20, p25, p26, p29, p31) + invariants.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();
const M = KIT.calc.modulation;
const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(b));

test('L04 p6/p7: bit rate, baud rate, bits per element, levels', () => {
  assert.equal(M.bitRate(1000, 4), 4000);            // p6: r = 4, S = 1000 baud → N = 4000 bps
  assert.equal(M.bitsPerElement(8000, 1000), 8);     // p7: N = 8000, S = 1000 → r = 8
  assert.equal(M.levels(8), 256);                    // p7: L = 2^r = 256
  assert.equal(M.baud(12e6, 2), 6e6);
  assert.equal(M.bitsPerLevel(256), 8);
  assert.equal(M.bitsPerLevel(16), 4);
});

test('L04 p12: ASK in 200–300 kHz with d = 1 → fc = 250 kHz, N = 50 kbps', () => {
  assert.equal(M.carrier(200e3, 300e3), 250e3);
  const r = M.askInBand(200e3, 300e3, 1);
  assert.equal(r.fc, 250e3); assert.equal(r.B, 100e3); assert.equal(r.S, 50e3); assert.equal(r.N, 50e3);
  assert.equal(M.askBandwidth(50e3, 1), 100e3);
});

test('L04 p13: full duplex splits 200–300 kHz into two 50 kHz bands → 25 kbps each way', () => {
  const d = M.duplexSplit(200e3, 300e3);
  assert.equal(d.each, 50e3);
  assert.deepEqual(d.carriers, [225e3, 275e3]);
  assert.equal(M.askInBand(200e3, 250e3, 1).N, 25e3);
});

test('L04 p16: FSK in 200–300 kHz, d = 1, 2Δf = 50 kHz → S = 25 kbaud, N = 25 kbps', () => {
  const r = M.fskInBand(200e3, 300e3, 1, 50e3);
  assert.equal(r.fc, 250e3); assert.equal(r.S, 25e3); assert.equal(r.N, 25e3);
  assert.deepEqual(r.freqs, { f1: 275e3, f0: 225e3 }, 'bit 1 → fc + Δf, bit 0 → fc − Δf (L04 p14)');
  assert.equal(M.fskBandwidth(25e3, 1, 50e3), 100e3);
});

test('L04 p19/p20: MFSK, 3 bits at a time, 3 Mbps, fc = 10 MHz → L = 8, S = 1 Mbaud, B = 8 MHz', () => {
  const r = M.mfsk(3e6, 3, 10e6);
  assert.equal(r.L, 8); assert.equal(r.S, 1e6); assert.equal(r.spacing, 1e6); assert.equal(r.B, 8e6);
  assert.deepEqual(r.carriers.map((f) => f / 1e6), [6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5]);
  // general formula (slide p18 prints "/" by mistake): B = (1 + d)S + (L − 1)·2Δf
  assert.equal(M.mfskBandwidth(8, 1e6, 0, 1e6), 8e6);
  assert.equal(M.mfskBandwidth(4, 1e6, 1, 1e6), 5e6);
});

test('L04 p26: QPSK at 12 Mbps with d = 0 → 6 Mbaud, 6 MHz', () => {
  const r = M.multilevel('qpsk', 12e6, 0);
  assert.equal(r.r, 2); assert.equal(r.S, 6e6); assert.equal(r.B, 6e6);
  assert.equal(M.pskBandwidth(6e6, 0), 6e6);
});

test('L04 p25/p29: QPSK mapping (first bit → I) and phases', () => {
  const expect = { '11': [1, 1, 45], '01': [-1, 1, 135], '00': [-1, -1, -135], '10': [1, -1, -45] };
  for (const [bits, [i, q, ph]] of Object.entries(expect)) {
    const p = M.point('qpsk', bits);
    assert.equal(p.i, i, bits + ' I'); assert.equal(p.q, q, bits + ' Q'); assert.ok(near(p.phase, ph), bits + ' phase ' + p.phase);
    assert.ok(near(p.amp, Math.SQRT2), bits + ' amplitude √2');
  }
});

test('L04 p29: OOK and BPSK constellations', () => {
  assert.deepEqual([M.point('ook', '0').i, M.point('ook', '0').q], [0, 0]);
  assert.deepEqual([M.point('ook', '1').i, M.point('ook', '1').q], [1, 0]);
  assert.equal(M.point('bpsk', '0').i, -1); assert.equal(M.point('bpsk', '1').i, 1);
  assert.ok(near(M.point('bpsk', '0').phase, 180));
});

test('L04 p31: 16-QAM labels (I/Q at ±1, ±3 = ±25%, ±75%) and the inset point 1100 → 225°', () => {
  const pts = M.constellation('16qam');
  assert.equal(pts.length, 16);
  assert.equal(new Set(pts.map((p) => p.bits)).size, 16, 'labels are unique');
  const at = (i, q) => pts.find((p) => p.i === i && p.q === q).bits;
  assert.deepEqual([at(-3, 3), at(-1, 3), at(1, 3), at(3, 3)], ['1011', '1001', '0010', '0011']);
  assert.deepEqual([at(-3, 1), at(-1, 1), at(1, 1), at(3, 1)], ['1010', '1000', '0000', '0001']);
  assert.deepEqual([at(-3, -1), at(-1, -1), at(1, -1), at(3, -1)], ['1101', '1100', '0100', '0110']);
  assert.deepEqual([at(-3, -3), at(-1, -3), at(1, -3), at(3, -3)], ['1111', '1110', '0101', '0111']);
  const p = M.point('16qam', '1100');
  assert.ok(near(p.phase360, 225)); assert.ok(near(p.amp, Math.SQRT2), 'true magnitude is √2 units (≈35%), not the 25% per-axis value');
});

test('invariants: N = r·S round-trips; L = 2^r round-trips; ASK/PSK bandwidth bounds', () => {
  for (const r of [1, 2, 3, 4, 6, 8]) {
    assert.equal(M.bitsPerLevel(M.levels(r)), r);
    assert.equal(M.bitRate(M.baud(48e3, r), r), 48e3);
  }
  for (const d of [0, 0.25, 0.5, 1]) {
    const B = M.askBandwidth(10e3, d);
    assert.ok(B >= 10e3 && B <= 20e3, 'S ≤ B ≤ 2S');
  }
});

test('CONV documents the slide conventions with refs', () => {
  for (const k of ['baud', 'levels', 'ask', 'fsk', 'mfsk', 'qpsk', 'carrier', 'duplex', 'qam']) {
    assert.match(M.CONV[k], /L04 p/, `CONV.${k} needs a slide ref`);
  }
});

test('waveform(): one symbol per time unit — OOK 1 = carrier / 0 = none, BFSK 1 = 4 cycles / 0 = 2, BPSK 1 = 0° / 0 = 180° (L04 p8, p14, p22)', () => {
  const ook = M.waveform('ook', '10');
  assert.deepEqual(ook.symbols, ['1', '0']);
  assert.ok(near(ook.fn(1 / 12), 1), 'a 1 sends the carrier (3 cycles per bit: peak at 1/12)');
  assert.equal(ook.fn(1.3), 0, 'a 0 sends nothing');
  const fsk = M.waveform('bfsk', '10');
  assert.ok(near(fsk.fn(1 / 16), 1), 'bit 1: f1, 4 cycles per bit (peak at 1/16)');
  assert.ok(near(fsk.fn(1 + 1 / 8), 1), 'bit 0: f2, 2 cycles per bit (peak at 1/8 into the bit)');
  const psk = M.waveform('bpsk', '10');
  assert.ok(near(psk.fn(1 / 12), 1), 'bit 1 starts at phase 0: rising');
  assert.ok(near(psk.fn(1 + 1 / 12), -1), 'bit 0 is shifted 180°: falling');
  assert.deepEqual(M.waveform('qpsk', '1101').symbols, ['11', '01'], 'two bits per symbol');
});
