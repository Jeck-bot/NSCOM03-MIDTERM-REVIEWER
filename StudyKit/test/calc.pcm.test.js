'use strict';
// L03b — PCM, delta modulation, transmission modes. Slide oracles: L03 p69, p70, p71, p74, p75, p76, p80, p83 (+ invariants).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();
const P = KIT.calc.pcm;
const close = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

test('L03 p66/p69: Nyquist sampling rate = 2 × f_max (voice 4 kHz → 8000 samples/s)', () => {
  assert.equal(P.nyquistRate(4000), 8000);
  assert.equal(P.samplingInterval(8000), 1 / 8000);
});

test('L03 p70/p71: low-pass B = 200 kHz → 400 ksps; bandpass with only B known → cannot determine', () => {
  assert.equal(P.minSamplingRate({ kind: 'lowpass', bandwidth: 200e3 }), 400e3);
  assert.equal(P.minSamplingRate({ kind: 'bandpass', bandwidth: 200e3 }), null);
  assert.equal(P.minSamplingRate({ kind: 'bandpass', fmin: 1e6, fmax: 1.2e6 }), 2.4e6, 'slide p67: bandpass Nyquist rate is also 2 × f_max');
});

test('L03 p74/p75: −20…+20 V, L = 8 → Δ = 5 V, zones, midpoints, 3-bit codes', () => {
  const z = P.zones(-20, 20, 8);
  assert.equal(z.delta, 5);
  assert.equal(z.nb, 3);
  assert.deepEqual(z.zones.map((q) => q.mid), [-17.5, -12.5, -7.5, -2.5, 2.5, 7.5, 12.5, 17.5]);
  assert.deepEqual(z.zones.map((q) => q.code), ['000', '001', '010', '011', '100', '101', '110', '111']);
  assert.deepEqual([z.zones[0].lo, z.zones[0].hi], [-20, -15]);
});

test('L03 p76: the nine-sample quantization table (with the corrected first error −0.28)', () => {
  const amps = [-6.1, 7.5, 16.2, 19.7, 11.0, -5.5, -11.3, -9.4, -6.0];
  const rows = P.quantizeSeries(amps, -20, 20, 8);
  assert.deepEqual(rows.map((r) => r.k), [2, 5, 7, 7, 6, 2, 1, 2, 2]);
  assert.deepEqual(rows.map((r) => r.code), ['010', '101', '111', '111', '110', '010', '001', '010', '010']);
  const norm = [-1.22, 1.5, 3.24, 3.94, 2.2, -1.1, -2.26, -1.88, -1.2];
  rows.forEach((r, i) => assert.ok(close(r.normalized, norm[i]), `normalized ${i}: ${r.normalized}`));
  const qn = [-1.5, 1.5, 3.5, 3.5, 2.5, -1.5, -2.5, -1.5, -1.5];
  rows.forEach((r, i) => assert.ok(close(r.normalizedQuantized, qn[i]), `quantized ${i}`));
  const err = [-0.28, 0, 0.26, -0.44, 0.3, -0.4, -0.24, 0.38, -0.3];
  rows.forEach((r, i) => assert.ok(close(r.normalizedError, err[i], 1e-9), `error ${i}: ${r.normalizedError}`));
  assert.ok(close(rows[0].mid, -7.5) && close(rows[0].error, -1.4), 'in volts: −6.1 V → −7.5 V, error −1.4 V');
});

test('quantization edges: boundaries go to the upper zone; the top value stays in zone L−1; |error| ≤ Δ/2', () => {
  assert.equal(P.quantize(0, -20, 20, 8).k, 4);
  assert.equal(P.quantize(-15, -20, 20, 8).k, 1);
  assert.equal(P.quantize(20, -20, 20, 8).k, 7);
  assert.equal(P.quantize(-20, -20, 20, 8).k, 0);
  const rng = KIT.rng(3);
  for (let i = 0; i < 500; i++) {
    const L = rng.pick([4, 8, 16, 32, 64]);
    const v = -10 + 20 * rng.next();
    const q = P.quantize(v, -10, 10, L);
    assert.ok(Math.abs(q.error) <= 20 / L / 2 + 1e-12);
    assert.equal(q.code.length, Math.log2(L));
  }
});

test('L03 p79/p80/p83: bit rate = n_b × f_s (voice → 64 kbps); minimum bandwidth = n_b × f_max (32 kHz)', () => {
  assert.equal(P.bitsPerSample(256), 8);
  assert.equal(P.bitsPerSample(8), 3);
  assert.equal(P.bitsPerSample(100), 7, 'not a power of 2 → round up');
  assert.equal(P.bitRate(8, 8000), 64000);
  assert.equal(P.minBandwidth(8, 4000), 32000);
  const r = P.pcm({ fmax: 4000, nb: 8 });
  assert.deepEqual([r.fs, r.N, r.Bmin], [8000, 64000, 32000]);
});

test('L03 p84/p85: delta modulation — 1 = step up, 0 = step down; decoding rebuilds the staircase', () => {
  // Samples chosen so the comparator reproduces the slide's generated bits (p85): 0 111111 000000 11.
  const samples = [1.6, 1.8, 2.5, 3.6, 4.5, 5.5, 6.3, 6.4, 5.6, 4.4, 3.5, 2.6, 1.8, 1.4, 2.3];
  const dm = P.deltaMod(samples, 1, 2);
  assert.equal(dm.bits, '011111100000011');
  assert.deepEqual(dm.staircase, [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 2, 3]);
  assert.deepEqual(P.dmDecode(dm.bits, 1, 2), dm.staircase);
  assert.equal(P.deltaMod([2], 1, 2).bits, '0', 'a sample equal to the staircase is not "higher" → 0');
  dm.staircase.forEach((s, i) => {
    const prev = i ? dm.staircase[i - 1] : 2;
    assert.equal(Math.abs(s - prev), 1, 'every step is ±δ');
  });
  // the slide's generated bits 011111100000011 rise six steps, fall six, rise two
  const st = P.dmDecode('011111100000011', 1, 0);
  assert.equal(st.length, 15);
  assert.equal(Math.max(...st), 5); assert.equal(st[st.length - 1], 1);
});

test('L03 p92: asynchronous framing overhead (1 start + 1 stop around 8 data bits → 80% efficiency)', () => {
  const a = P.asyncFrame(8, 1);
  assert.equal(a.frameBits, 10);
  assert.ok(close(a.efficiency, 0.8));
  assert.equal(P.asyncFrame(7, 2).frameBits, 10);
  assert.equal(P.charsPerSecond(9600, 8, 1), 960);
});

test('CONV documents the slide conventions with refs', () => {
  for (const k of ['sampling', 'zones', 'codes', 'error', 'bitrate', 'bandwidth', 'dm', 'async']) {
    assert.match(P.CONV[k], /L03 p/, `CONV.${k} needs a slide ref`);
  }
});
