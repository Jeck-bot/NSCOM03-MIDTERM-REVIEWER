'use strict';
// L02 Physical layer calculations — slide oracles (L02 p7, p8, p10, p13, p14, p17, p22, p26, p30, p32, p33, p37) + invariants.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();
const S = KIT.calc.signals;
const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(b));

test('KIT.calc.signals is registered', () => {
  assert.ok(S && typeof S === 'object', 'KIT.calc.signals is missing (js/calc/signals.js)');
});

test('L02 p7: 4 cycles in 1 s → f = 4 Hz, T = 1/4 s (f = 1/T, T = 1/f)', () => {
  assert.equal(S.frequencyFromCycles(4, 1), 4);
  assert.equal(S.period(4), 0.25);
  assert.equal(S.frequency(0.25), 4);
  assert.equal(S.frequencyFromCycles(8, 2), 4, 'cycles per second, whatever the observation time');
});

test('L02 p8: phase 0° / 90° / 180° / 270° are 0, ¼, ½, ¾ of a period (phase = 360° × shift / T)', () => {
  assert.equal(S.phaseFromShift(0, 1), 0);
  assert.equal(S.phaseFromShift(0.25, 1), 90);
  assert.equal(S.phaseFromShift(0.5, 1), 180);
  assert.equal(S.phaseFromShift(0.75, 1), 270);
  assert.equal(S.phaseFromShift(1, 1), 360);
  assert.ok(near(S.phaseFromShift(0.00025, 0.001), 90), 'works for millisecond periods');
  assert.equal(S.shiftFromPhase(180, 0.02), 0.01);
  assert.equal(S.shiftFromPhase(90, 4), 1);
});

test('L02 p9/p10: λ = c/f; red light 4×10¹⁴ Hz in free space → 0.75 µm', () => {
  assert.equal(S.C, 3e8, 'slide convention c = 3×10⁸ m/s');
  assert.ok(near(S.wavelength(4e14), 7.5e-7), 'default speed is c');
  assert.ok(near(S.wavelength(4e14, 3e8), 0.75e-6));
  assert.ok(near(S.wavelengthFromPeriod(1 / 4e14, 3e8), 7.5e-7), 'λ = propagation speed × period');
  assert.equal(S.wavelength(1e9, 2e8), 0.2, 'slower medium → shorter wavelength');
  assert.equal(S.frequencyFromWavelength(0.5), 6e8, 'f = c/λ');
});

test('L02 p13: spectrum 1000–5000 Hz → bandwidth 5000 − 1000 = 4000 Hz', () => {
  assert.equal(S.bandwidth(1000, 5000), 4000);
  assert.equal(S.bandwidthOf([1000, 2000, 3000, 4000, 5000]), 4000);
  assert.equal(S.bandwidthOf([5000, 1000, 3000]), 4000, 'order does not matter');
  assert.equal(S.highestFrequency(1000, 4000), 5000);
  assert.equal(S.lowestFrequency(5000, 4000), 1000);
});

test('L02 p12/p13: a composite of f, 3f and 9f has bandwidth 9f − f = 8f', () => {
  for (const f of [100, 250, 1000]) assert.equal(S.bandwidthOf([f, 3 * f, 9 * f]), 8 * f);
});

test('L02 p14: L levels → log₂L bits per level; 8 elements in 1 s → 8 bps (2 levels), 16 bps (4 levels)', () => {
  assert.equal(S.bitsPerLevel(2), 1);
  assert.equal(S.bitsPerLevel(4), 2);
  assert.equal(S.bitsPerLevel(8), 3);
  assert.equal(S.bitsPerLevel(256), 8);
  assert.equal(S.levels(3), 8);
  assert.equal(S.bitRateOf(8, 2), 8);
  assert.equal(S.bitRateOf(8, 4), 16);
});

test('L02 p14 (Forouzan): bit duration = 1/bit rate; bit length = propagation speed × bit duration', () => {
  assert.equal(S.bitDuration(1e6), 1e-6);
  assert.equal(S.bitLength(2e8, 1e6), 200, '2×10⁸ m/s at 1 Mbps → one bit is 200 m long');
  assert.equal(S.bitLength(3e8, 3e8), 1, 'at 3×10⁸ bps and c, one bit is 1 m long');
});

test('L02 p17: low-pass approximation needs N/2, 3N/2, 5N/2 for 1, 2, 3 harmonics', () => {
  assert.equal(S.lowpassBandwidth(1000, 1), 500);
  assert.equal(S.lowpassBandwidth(1000, 2), 1500);
  assert.equal(S.lowpassBandwidth(1000, 3), 2500);
  assert.equal(S.lowpassBandwidth(8, 3), 20);
});

test('L02 p21/p22: dB = 10 log₁₀(P2/P1); power halved → −3 dB (−3.01)', () => {
  assert.ok(Math.abs(S.dB(0.5, 1) - -3.0103) < 1e-4, 'dB(½) = ' + S.dB(0.5, 1));
  assert.ok(Math.abs(S.dB(5, 10) - -3.0103) < 1e-4);
  assert.ok(Math.abs(S.dB(2, 1) - 3.0103) < 1e-4, 'doubling = +3 dB');
  assert.equal(S.dB(10, 1), 10, 'amplified ×10 = +10 dB');
  assert.equal(S.dB(1, 10), -10, 'attenuated to 1/10 = −10 dB');
  assert.equal(S.dB(100, 1), 20);
  assert.equal(S.dB(1, 1), 0);
  assert.ok(S.dB(0.5, 1) < 0 && S.dB(2, 1) > 0, 'negative if attenuated, positive if amplified');
});

test('dB ↔ ratio and power conversions round-trip', () => {
  assert.equal(S.ratioFromDb(10), 10);
  assert.equal(S.ratioFromDb(20), 100);
  assert.equal(S.ratioFromDb(-10), 0.1);
  assert.equal(S.ratioFromDb(0), 1);
  assert.ok(near(S.ratioFromDb(-3), 0.501187, 1e-5));
  assert.ok(near(S.ratioFromDb(3), 1.995262, 1e-5));
  for (const db of [-30, -20, -10, -3, 0, 3, 6, 10, 20, 30, 40]) assert.ok(near(S.dB(S.ratioFromDb(db), 1), db), 'round trip ' + db);
  assert.equal(S.powerAfter(0.05, -30), 5e-5);
  assert.equal(S.powerAfter(2, 20), 200);
});

test('dB chains: gains add, losses subtract (Forouzan cascade −3 + 7 − 3 = +1 dB)', () => {
  assert.equal(S.dbChain([-3, 7, -3]), 1);
  assert.equal(S.dbChain([-20, 10, -20]), -30);
  assert.equal(S.dbChain([]), 0);
  assert.equal(S.chainPower(0.05, [-20, 10, -20]), 5e-5, '50 mW through −30 dB leaves 50 µW');
  assert.equal(S.chainPower(1, [10, 10, -20]), 1, 'gains cancel losses');
  const P1 = 0.002, chain = [-10, 30, -10];
  assert.ok(near(S.dB(S.chainPower(P1, chain), P1), S.dbChain(chain)), 'dB of the output/input power equals the chain sum');
});

test('L02 p25/p26: SNR = signal / noise power; 10 mW over 1 µW → 10,000 → 40 dB', () => {
  assert.equal(S.snr(0.01, 1e-6), 10000);
  assert.equal(S.snrDb(10000), 40);
  assert.equal(S.snrFromDb(40), 10000);
  assert.equal(S.snrDb(1), 0, 'signal = noise → 0 dB');
  assert.equal(S.snrDb(100), 20);
  assert.ok(S.snrDb(2) > 3.0 && S.snrDb(2) < 3.02);
  assert.ok(S.snr(1e-3, 1e-6) > S.snr(1e-3, 1e-5), 'less noise → higher SNR');
  for (const x of [1, 7, 63, 1000, 3162]) assert.ok(near(S.snrFromDb(S.snrDb(x)), x), 'SNR ↔ SNR_dB round trip ' + x);
});

test('L02 p29/p30: Nyquist, 3000 Hz noiseless, 2 levels → 2 × 3000 × log₂2 = 6000 bps', () => {
  assert.equal(S.nyquist(3000, 2), 6000);
  assert.equal(S.nyquist(3000, 4), 12000, 'doubling levels adds one bit per element: ×2, not ×4');
  assert.equal(S.nyquist(1e6, 4), 4e6);
  assert.equal(S.nyquist(20e3, 128), 280e3);
});

test('Nyquist solved for L and for B (algebra on p29)', () => {
  assert.equal(S.nyquistBitsPerLevel(12000, 3000), 2);
  assert.equal(S.nyquistLevels(12000, 3000), 4);
  assert.equal(S.nyquistLevels(4e6, 1e6), 4, 'the second half of slide 33');
  assert.equal(S.nyquistLevels(40000, 5000), 16);
  assert.equal(S.nyquistBandwidth(12000, 4), 3000);
  assert.equal(S.nyquistBandwidth(6000, 2), 3000);
  for (const [B, L] of [[3000, 2], [4000, 8], [1e6, 16], [5000, 256]]) {
    const N = S.nyquist(B, L);
    assert.ok(near(S.nyquistBandwidth(N, L), B), 'B round trip');
    assert.ok(near(S.nyquistLevels(N, B), L), 'L round trip');
  }
});

test('L02 p31/p32: Shannon, 3000 Hz, SNR 3162 → exact 34,881 bps (the slide prints 34,860: it rounds log₂3163 to 11.62)', () => {
  const C = S.shannon(3000, 3162);
  assert.equal(Math.round(C), 34881, 'exact value ' + C);
  assert.ok(Math.abs(C - 34881.2335) < 0.001);
  assert.ok(Math.abs(C - 34860) / 34860 < 0.01, 'the slide value is within 1% of the exact one');
  assert.equal(S.shannon(3000, 3162) > 3000 * 11.62, true, 'the slide rounds down');
  assert.ok(near(S.bitsPerLevel(3163), 11.627, 1e-3), 'log₂3163 = 11.627');
});

test('L02 p33: B = 1 MHz, SNR = 63 → C = 6 Mbps; use 4 Mbps → L = 4', () => {
  assert.equal(S.shannon(1e6, 63), 6e6);
  assert.equal(S.nyquistLevels(4e6, 1e6), 4);
  const plan = S.capacityPlan(1e6, 63, 4e6);
  assert.equal(plan.C, 6e6); assert.equal(plan.r, 2); assert.equal(plan.L, 4); assert.equal(plan.feasible, true);
  assert.equal(S.capacityPlan(1e6, 63, 8e6).feasible, false, 'a rate above the Shannon capacity is impossible');
  assert.equal(S.capacityPlan(1e6, 63, 6e6).feasible, true, 'exactly at the capacity is still the limit');
});

test('Shannon solved for B, SNR (algebra on p31)', () => {
  assert.equal(S.shannonBandwidth(6e6, 63), 1e6);
  assert.equal(S.shannonBandwidth(48000, 15), 12000);
  assert.equal(S.shannonSnr(6e6, 1e6), 63);
  assert.equal(S.shannonSnr(4000, 1000), 15);
  for (const [B, snr] of [[1e6, 63], [3000, 7], [8000, 255]]) {
    const C = S.shannon(B, snr);
    assert.ok(near(S.shannonBandwidth(C, snr), B), 'B round trip');
    assert.ok(near(S.shannonSnr(C, B), snr), 'SNR round trip');
  }
  assert.equal(S.shannon(4000, 0), 0, 'no signal power → no capacity');
});

test('invariants: Shannon capacity grows with bandwidth and SNR and takes no level argument (L02 p31)', () => {
  assert.ok(S.shannon(2000, 15) > S.shannon(1000, 15));
  assert.ok(S.shannon(1000, 31) > S.shannon(1000, 15));
  assert.equal(S.shannon.length, 2, 'Shannon is a function of bandwidth and SNR only — the signal levels do not dictate the capacity');
  assert.equal(S.nyquist.length, 2);
  assert.ok(S.nyquist(1000, 8) > S.nyquist(1000, 4), 'Nyquist does grow with the number of levels');
});

test('L02 p35/p36/p37: 2.5 KB at 1 Gbps over 12,000 km at 2.4×10⁸ m/s → Tp = 50 ms, Tt = 0.020 ms', () => {
  assert.equal(S.bytesToBits(2500), 20000, 'KB = 1000 bytes on the slide (2500 × 8)');
  assert.equal(S.propagationTime(12000 * 1000, 2.4e8), 0.05);
  assert.ok(near(S.transmissionTime(2500 * 8, 1e9), 2e-5), 'Tt = 20 µs = 0.020 ms');
  assert.ok(near(S.transmissionTime(S.bytesToBits(2500), 1e9) * 1000, 0.02));
});

test('L02 p35: latency = propagation + transmission + queuing + processing', () => {
  assert.equal(S.latency(0.05, 0.002), 0.052);
  assert.equal(S.latency(0.02, 0.002, 0.005, 0.001), 0.028);
  assert.ok(near(S.latency(0.05, 2e-5), 0.05002), 'no queuing or processing by default');
  const m = S.messageLatency({ distance: 12e6, speed: 2.4e8, bits: 20000, bandwidth: 1e9, queue: 0.005, processing: 0.001 });
  assert.equal(m.Tp, 0.05); assert.ok(near(m.Tt, 2e-5)); assert.equal(m.queue, 0.005); assert.equal(m.processing, 0.001);
  assert.ok(near(m.total, 0.05602), 'total ' + m.total);
  assert.equal(S.messageLatency({ distance: 4e6, speed: 2e8, bits: 20000, bandwidth: 1e7 }).total, 0.022, 'queue/processing default to 0');
});

test('invariants: more bandwidth shortens Tt but cannot touch Tp; a slower medium lengthens Tp', () => {
  assert.ok(S.transmissionTime(8000, 2e6) < S.transmissionTime(8000, 1e6));
  assert.equal(S.propagationTime.length, 2, 'Tp depends on distance and propagation speed only');
  assert.ok(S.propagationTime(1e6, 1e8) > S.propagationTime(1e6, 3e8));
  assert.ok(near(S.transmissionTime(16000, 1e6), 2 * S.transmissionTime(8000, 1e6)), 'Tt is proportional to the message size');
});

test('hostile inputs are rejected instead of returning NaN / Infinity', () => {
  assert.throws(() => S.period(0), RangeError);
  assert.throws(() => S.period(-5), RangeError);
  assert.throws(() => S.frequency(0), RangeError);
  assert.throws(() => S.wavelength(0), RangeError);
  assert.throws(() => S.wavelength(1e6, 0), RangeError);
  assert.throws(() => S.phaseFromShift(1, 0), RangeError);
  assert.throws(() => S.bandwidth(5000, 1000), RangeError, 'low must not exceed high');
  assert.throws(() => S.bandwidthOf([]), RangeError);
  assert.throws(() => S.bitsPerLevel(0), RangeError);
  assert.throws(() => S.dB(0, 1), RangeError);
  assert.throws(() => S.dB(1, 0), RangeError);
  assert.throws(() => S.snr(1, 0), RangeError);
  assert.throws(() => S.snrDb(0), RangeError);
  assert.throws(() => S.nyquist(3000, 0), RangeError);
  assert.throws(() => S.nyquist(0, 2), RangeError);
  assert.throws(() => S.shannon(-1, 3), RangeError);
  assert.throws(() => S.shannon(3000, -1), RangeError);
  assert.throws(() => S.propagationTime(1000, 0), RangeError);
  assert.throws(() => S.transmissionTime(1000, 0), RangeError);
  assert.throws(() => S.latency(-1, 0), RangeError);
  assert.throws(() => S.period('fast'), RangeError);
  assert.throws(() => S.shannon(NaN, 3), RangeError);
});

test('CONV documents every slide convention with a ref', () => {
  for (const k of ['frequency', 'wavelength', 'phase', 'bandwidth', 'levels', 'lowpass', 'db', 'snr', 'nyquist', 'shannon', 'capacity', 'latency', 'bytes', 'bitLength']) {
    assert.match(S.CONV[k], /L02 p/, `CONV.${k} needs a slide ref`);
  }
  assert.match(S.CONV.bitLength, /Forouzan/, 'bit length is textbook material (slide p14 gives it in words only)');
});

/* ---------- generators (js/gen/l02.js): slide params reproduce the slide answers; exam slots have clean hand-computed keys ---------- */
const GENS = ['l02.wave', 'l02.bandwidth', 'l02.db', 'l02.nyquist', 'l02.shannon', 'l02.capacity', 'l02.latency'];
const build = (id, params) => KIT.gen.build(id, params);
const ans = (p, id) => {
  const i = p.inputs.find((x) => x.id === id);
  assert.ok(i, `input "${id}" is missing (have ${p.inputs.map((x) => x.id).join(', ')})`);
  return i.answer;
};

test('l02 generators are registered with samples, a ref and params(rng)', () => {
  for (const id of GENS) {
    const g = KIT.gen.get(id);
    assert.ok(g, `${id} is not registered`);
    assert.equal(g.topic, 'l02');
    assert.equal(typeof g.params, 'function', `${id} needs params(rng)`);
    assert.match(g.ref, /^L02 pp?\d/, `${id} needs a slide ref`);
    assert.ok(Array.isArray(g.samples) && g.samples.length >= 2, `${id} needs samples`);
    for (const s of g.samples) assert.doesNotThrow(() => build(id, s), `${id} sample ${JSON.stringify(s)}`);
  }
});

test('l02.wave reproduces L02 p7 (4 Hz, T = 1/4 s) and p10 (λ = 0.75 µm)', () => {
  const a = build('l02.wave', { find: 'fT', cycles: 4, seconds: 1 });
  assert.equal(ans(a, 'f'), 4); assert.equal(ans(a, 'T'), 0.25);
  const b = build('l02.wave', { find: 'lambda', f: 4e14, v: 3e8 });
  assert.ok(near(ans(b, 'lambda'), 7.5e-7), 'λ = ' + ans(b, 'lambda'));
  assert.match(b.steps.join(' '), /0\.75 µm/, 'the steps state the slide answer 0.75 µm');
});

test('l02.wave: period, frequency, phase and time-shift modes', () => {
  assert.equal(ans(build('l02.wave', { find: 'T', f: 250 }), 'T'), 0.004);
  assert.equal(ans(build('l02.wave', { find: 'f', T: 0.002 }), 'f'), 500);
  assert.equal(ans(build('l02.wave', { find: 'freq', lambda: 0.5, v: 3e8 }), 'f'), 6e8);
  assert.equal(ans(build('l02.wave', { find: 'phase', f: 250, shift: 0.001 }), 'phase'), 90);
  assert.equal(ans(build('l02.wave', { find: 'phase', f: 250, shift: 0.003 }), 'phase'), 270);
  assert.equal(ans(build('l02.wave', { find: 'shift', f: 250, phase: 180 }), 'shift'), 0.002);
  const p270 = build('l02.wave', { find: 'phase', f: 250, shift: 0.003 }).inputs.find((i) => i.id === 'phase');
  assert.deepEqual(p270.accept, [-90], '270° and −90° are the same phase');
});

test('l02.bandwidth reproduces L02 p13 (1000–5000 Hz → 4000 Hz) and the f/3f/9f composite of p12', () => {
  assert.equal(ans(build('l02.bandwidth', { find: 'B', fLow: 1000, fHigh: 5000 }), 'B'), 4000);
  assert.equal(ans(build('l02.bandwidth', { find: 'high', fLow: 1000, B: 4000 }), 'fHigh'), 5000);
  assert.equal(ans(build('l02.bandwidth', { find: 'low', fHigh: 5000, B: 4000 }), 'fLow'), 1000);
  const h = build('l02.bandwidth', { find: 'harm', f: 200 });
  assert.equal(ans(h, 'fmax'), 1800); assert.equal(ans(h, 'B'), 1600);
});

test('l02.db reproduces L02 p22 (P2 = ½P1 → −3 dB) and p26 (SNR 10,000 → 40 dB)', () => {
  const a = build('l02.db', { find: 'dB', P1: 1, P2: 0.5 });
  assert.ok(Math.abs(ans(a, 'dB') - -3.0103) < 1e-4);
  assert.equal(a.inputs[0].unit, 'dB');
  const b = build('l02.db', { find: 'snr', Ps: 0.01, Pn: 1e-6 });
  assert.equal(ans(b, 'SNR'), 10000); assert.equal(ans(b, 'SNRdB'), 40);
  assert.match(b.prompt, /10 mW/); assert.match(b.prompt, /1 µW/);
});

test('l02.db: dB → ratio, SNR_dB → SNR, and attenuation chains', () => {
  const r = build('l02.db', { find: 'ratio', dB: 20, P1: 0.002 });
  assert.equal(ans(r, 'ratio'), 100); assert.equal(ans(r, 'P2'), 0.2);
  assert.equal(ans(build('l02.db', { find: 'fromdb', snrDb: 30 }), 'SNR'), 1000);
  const c = build('l02.db', { find: 'chain', Pin: 0.05, stages: [-20, 10, -20] });
  assert.equal(ans(c, 'net'), -30); assert.equal(ans(c, 'Pout'), 5e-5);
  assert.equal(c.inputs.length, 2, 'no SNR inputs without a noise power');
});

test('l02.nyquist reproduces L02 p14 (8 bps / 16 bps) and p30 (6000 bps)', () => {
  const two = build('l02.nyquist', { find: 'digital', elements: 8, L: 2 });
  assert.equal(ans(two, 'r'), 1); assert.equal(ans(two, 'N'), 8);
  const four = build('l02.nyquist', { find: 'digital', elements: 8, L: 4 });
  assert.equal(ans(four, 'r'), 2); assert.equal(ans(four, 'N'), 16);
  assert.equal(ans(build('l02.nyquist', { find: 'N', B: 3000, L: 2 }), 'N'), 6000);
});

test('l02.nyquist: solve for levels and for bandwidth', () => {
  const l = build('l02.nyquist', { find: 'L', B: 5000, N: 40000 });
  assert.equal(ans(l, 'r'), 4); assert.equal(ans(l, 'L'), 16);
  assert.equal(ans(build('l02.nyquist', { find: 'B', N: 12000, L: 4 }), 'B'), 3000);
});

test('l02.shannon reproduces L02 p32 with the EXACT value (slide: 34,860; exact 34,881)', () => {
  const p = build('l02.shannon', { find: 'C', B: 3000, snr: 3162 });
  assert.equal(Math.round(ans(p, 'C')), 34881);
  assert.ok(Math.abs(ans(p, 'C') - 34860) / 34860 < 0.01, 'a student who copies the slide value (34,860) is within tolerance');
  assert.equal(p.inputs[0].sig, 5, 'show 34.881 kbps, not 34.88 kbps');
  assert.match(p.steps.join(' '), /11\.62/, 'the steps mention the slide’s rounded 11.62');
});

test('l02.shannon: bandwidth, SNR and dB-given modes', () => {
  assert.equal(ans(build('l02.shannon', { find: 'B', C: 48000, snr: 15 }), 'B'), 12000);
  assert.equal(ans(build('l02.shannon', { find: 'snr', C: 24000, B: 4000 }), 'SNR'), 63);
  const d = build('l02.shannon', { find: 'db', B: 4000, snrDb: 30 });
  assert.ok(near(ans(d, 'C'), 4000 * Math.log2(1001), 1e-9));
  assert.ok(Math.abs(ans(d, 'C') - 40000) / 40000 < 0.01, 'the mental shortcut log₂1001 ≈ 10 stays within tolerance');
});

test('l02.capacity reproduces L02 p33 (C = 6 Mbps, use 4 Mbps → L = 4)', () => {
  const p = build('l02.capacity', { B: 1e6, snr: 63, N: 4e6 });
  assert.equal(ans(p, 'C'), 6e6); assert.equal(ans(p, 'L'), 4);
});

test('l02.latency reproduces L02 p37 (Tp = 50 ms, Tt = 0.020 ms)', () => {
  const p = build('l02.latency', { d: 12e6, v: 2.4e8, bytes: 2500, bw: 1e9 });
  assert.equal(ans(p, 'Tp'), 0.05); assert.ok(near(ans(p, 'Tt'), 2e-5));
  assert.equal(p.inputs.length, 2, 'the slide asks only for Tp and Tt');
  assert.match(p.steps.join(' '), /0\.020 ms/, 'the steps state the slide answer 0.020 ms');
  const q = build('l02.latency', { d: 4e6, v: 2e8, bytes: 2000, bw: 8e6, queue: 0.005, proc: 0.001 });
  assert.equal(ans(q, 'total'), 0.028);
  const b = build('l02.latency', { find: 'bitlen', v: 2e8, bw: 1e6 });
  assert.equal(ans(b, 'dur'), 1e-6); assert.equal(ans(b, 'len'), 200);
});

test('exam slots: hand-computable keys for Form A and Form B problem solving', () => {
  const slots = {
    'A1 capacity': ['l02.capacity', { B: 500e3, snr: 255, N: 3e6 }, { C: 4e6, L: 8 }],
    'A2 db chain + SNR': ['l02.db', { find: 'chain', Pin: 0.1, stages: [-20, 10, -20], Pn: 1e-6 }, { net: -30, Pout: 1e-4, SNR: 100, SNRdB: 20 }],
    'A3 latency': ['l02.latency', { d: 6e6, v: 2e8, bytes: 5000, bw: 1e7, total: true }, { Tp: 0.03, Tt: 0.004, total: 0.034 }],
    'B1 wave': ['l02.wave', { find: 'all', f: 2.5e8, v: 2e8, shift: 1e-9 }, { T: 4e-9, lambda: 0.8, phase: 90 }],
    'B2 nyquist': ['l02.nyquist', { find: 'L', B: 5000, N: 40000 }, { r: 4, L: 16 }],
    'B3 latency + queuing': ['l02.latency', { d: 4e6, v: 2e8, bytes: 2000, bw: 8e6, queue: 0.005, proc: 0.001 }, { Tp: 0.02, Tt: 0.002, total: 0.028 }]
  };
  for (const [name, [id, params, want]] of Object.entries(slots)) {
    const p = build(id, params);
    for (const [k, v] of Object.entries(want)) assert.ok(near(ans(p, k), v, 1e-9), `${name}: ${k} = ${ans(p, k)}, expected ${v}`);
    assert.equal(p.inputs.length, Object.keys(want).length, `${name}: unexpected extra inputs`);
    for (const g of GENS) for (const s of KIT.gen.get(g).samples) assert.notDeepEqual(params, s, `${name} reuses a slide sample`);
  }
});

test('random problems are hand-computable: every numeric key has at most 6 significant digits', () => {
  const dbMode = (p) => p.params && (p.params.find === 'db' || p.params.find === 'dB' || p.params.find === 'chain');
  for (const id of GENS) {
    for (let seed = 1; seed <= 200; seed++) {
      const p = KIT.gen.random(id, seed);
      for (const inp of p.inputs) {
        if (inp.kind !== 'num') continue;
        if (inp.unit === 'dB' && dbMode(p)) continue; // ±3.01 dB / ±6.02 dB keys come from 10·log₁₀(½), 10·log₁₀(¼)
        if (id === 'l02.shannon' && p.params.find === 'db') continue; // log₂(1001) ≈ 10 by the 2¹⁰ ≈ 1000 shortcut
        assert.equal(Number(inp.answer.toPrecision(6)), inp.answer, `${id} seed ${seed} input ${inp.id} = ${inp.answer} is not hand-computable`);
      }
    }
  }
});

test('random problems exercise every mode of every generator', () => {
  const want = {
    'l02.wave': ['fT', 'T', 'f', 'lambda', 'freq', 'phase', 'shift', 'all'],
    'l02.bandwidth': ['B', 'high', 'low', 'harm'],
    'l02.db': ['dB', 'ratio', 'snr', 'fromdb', 'chain'],
    'l02.nyquist': ['N', 'L', 'B', 'digital'],
    'l02.shannon': ['C', 'B', 'snr', 'db']
  };
  for (const [id, modes] of Object.entries(want)) {
    const seen = new Set();
    for (let seed = 1; seed <= 200; seed++) seen.add(KIT.gen.get(id).params(KIT.rng(seed)).find);
    for (const m of modes) assert.ok(seen.has(m), `${id}: mode "${m}" never occurs in 200 seeds`);
  }
  const lat = new Set();
  for (let seed = 1; seed <= 200; seed++) {
    const q = KIT.gen.get('l02.latency').params(KIT.rng(seed));
    lat.add(q.find === 'bitlen' ? 'bitlen' : (q.queue || q.proc ? 'queued' : 'plain'));
  }
  assert.deepEqual([...lat].sort(), ['bitlen', 'plain', 'queued']);
});
