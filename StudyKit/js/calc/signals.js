/* L02 Physical-layer calculations: sine waves, bandwidth, decibels, SNR, Nyquist, Shannon, latency.
   Pure, deterministic, SI base units (Hz, bps, s, m, m/s, W, dB, degrees). Owner: O1. Tests: test/calc.signals.test.js
   Domain errors throw RangeError instead of returning NaN / Infinity, so a bad input can never reach a rendered answer. */
(function () {
  'use strict';

  var C = 3e8; // propagation speed in free space (m/s) — slide convention, L02 p9

  var CONV = {
    frequency: 'f = 1/T and T = 1/f; frequency is the number of periods in 1 s, in Hz (cycles per second): 4 cycles in 1 s → 4 Hz, T = 1/4 s. [L02 p6; L02 p7]',
    wavelength: 'λ = (propagation speed) × period = speed / f; in free space the speed is c = 3×10⁸ m/s. [L02 p9; L02 p10]',
    phase: 'Phase = position of the waveform relative to time 0, in degrees or radians: 0° starts at 0 going up, 90° at the peak, 180° at 0 going down, 270° at the trough. A time shift t is a phase of 360° × t/T (derived from the quarter-period pictures). [L02 p6; L02 p8]',
    bandwidth: 'Bandwidth of a composite signal = highest frequency − lowest frequency, a difference between two numbers in Hz: 5000 − 1000 = 4000 Hz. [L02 p13]',
    levels: 'A digital signal with L levels needs log₂L bits per level; bit rate = bits sent in 1 s (bps): 8 elements/s → 8 bps with 2 levels, 16 bps with 4 levels. [L02 p14]',
    bitLength: 'Bit length = propagation speed × bit duration (= speed / bit rate). Textbook formula — slide L02 p14 defines bit length only in words. [L02 p14; Forouzan]',
    lowpass: 'Approximating a digital signal of bit rate N in a low-pass channel: the first harmonic needs B = N/2; harmonics N/2, 3N/2 and 5N/2 need B = 5N/2. [L02 p17]',
    db: 'dB = 10 log₁₀(P2/P1): negative if the signal is attenuated, positive if amplified; P2 = ½ P1 → −3 dB. Gains and losses of cascaded stages add in dB (textbook). [L02 p21; L02 p22; Forouzan]',
    snr: 'SNR = average signal power / average noise power (a plain ratio); SNR_dB = 10 log₁₀ SNR: 10 mW over 1 µW → 10,000 → 40 dB. [L02 p25; L02 p26]',
    nyquist: 'Noiseless channel: bit rate = 2 × bandwidth × log₂L (L = number of signal levels): 3000 Hz, 2 levels → 6000 bps. [L02 p29; L02 p30]',
    shannon: 'Noisy channel: capacity = bandwidth × log₂(1 + SNR) with SNR as a plain ratio (not dB); the number of signal levels does not enter. 3000 Hz, SNR 3162 → 34,860 bps on the slide (exact 34,881). [L02 p31; L02 p32]',
    capacity: 'Use Shannon for the upper limit, choose a lower bit rate, then solve Nyquist for L: B = 1 MHz, SNR = 63 → 6 Mbps; use 4 Mbps → L = 4. [L02 p33]',
    latency: 'Latency = propagation time + transmission time + queuing time + processing delay; Tp = distance / propagation speed; Tt = message size / bandwidth. [L02 p35]',
    bytes: 'Slide arithmetic: 2.5 KB = 2500 bytes (KB = 1000 bytes) = 20,000 bits; 1 Gbps = 10⁹ bps; 1000 kbps = 1 Mbps. [L02 p27; L02 p37]'
  };

  /* ---------- helpers ---------- */
  function round12(x) { return Number(x.toPrecision(12)); }
  function fin(x, name) {
    if (typeof x !== 'number' || !isFinite(x)) throw new RangeError(name + ' must be a finite number (got ' + x + ')');
    return x;
  }
  function pos(x, name) {
    if (!(fin(x, name) > 0)) throw new RangeError(name + ' must be greater than 0 (got ' + x + ')');
    return x;
  }
  function nonneg(x, name) {
    if (fin(x, name) < 0) throw new RangeError(name + ' must not be negative (got ' + x + ')');
    return x;
  }
  function atLeast1(x, name) {
    if (fin(x, name) < 1) throw new RangeError(name + ' must be at least 1 (got ' + x + ')');
    return x;
  }
  function optional(x, fallback) { return x === undefined ? fallback : x; }

  /* ---------- sine wave: frequency, period, wavelength, phase  [L02 pp6–10] ---------- */
  /** f = 1/T */
  function frequency(T) { return round12(1 / pos(T, 'period T')); }
  /** T = 1/f */
  function period(f) { return round12(1 / pos(f, 'frequency f')); }
  /** f = cycles / seconds */
  function frequencyFromCycles(cycles, seconds) { return round12(nonneg(cycles, 'cycles') / pos(seconds, 'seconds')); }
  /** λ = speed / f   (speed defaults to c = 3×10⁸ m/s) */
  function wavelength(f, speed) { return round12(pos(optional(speed, C), 'propagation speed') / pos(f, 'frequency f')); }
  /** f = speed / λ */
  function frequencyFromWavelength(lambda, speed) { return round12(pos(optional(speed, C), 'propagation speed') / pos(lambda, 'wavelength')); }
  /** λ = speed × T */
  function wavelengthFromPeriod(T, speed) { return round12(pos(optional(speed, C), 'propagation speed') * pos(T, 'period T')); }
  /** phase (degrees) = 360° × shift / T */
  function phaseFromShift(shift, T) { return round12(360 * fin(shift, 'time shift') / pos(T, 'period T')); }
  /** shift (s) = phase / 360° × T */
  function shiftFromPhase(phase, T) { return round12(pos(T, 'period T') * fin(phase, 'phase') / 360); }

  /* ---------- composite signals and bandwidth  [L02 pp11–13] ---------- */
  function bandwidth(fLow, fHigh) {
    nonneg(fLow, 'lowest frequency'); nonneg(fHigh, 'highest frequency');
    if (fLow > fHigh) throw new RangeError('lowest frequency (' + fLow + ') must not exceed the highest (' + fHigh + ')');
    return round12(fHigh - fLow);
  }
  /** Bandwidth of a list of component frequencies. */
  function bandwidthOf(freqs) {
    if (!Array.isArray(freqs) || !freqs.length) throw new RangeError('bandwidthOf needs a non-empty list of frequencies');
    return bandwidth(Math.min.apply(null, freqs), Math.max.apply(null, freqs));
  }
  function highestFrequency(fLow, B) { return round12(nonneg(fLow, 'lowest frequency') + nonneg(B, 'bandwidth')); }
  function lowestFrequency(fHigh, B) {
    var lo = fHigh - nonneg(B, 'bandwidth');
    if (nonneg(fHigh, 'highest frequency') < 0 || lo < 0) throw new RangeError('a spectrum cannot start below 0 Hz');
    return round12(lo);
  }

  /* ---------- digital signals  [L02 p14, p17] ---------- */
  /** bits per level = log₂L */
  function bitsPerLevel(L) { return round12(Math.log2(atLeast1(L, 'levels L'))); }
  /** L = 2^bits */
  function levels(bits) { return round12(Math.pow(2, nonneg(bits, 'bits per level'))); }
  /** bit rate (bps) of a signal that sends `elements` levels per second, each carrying log₂L bits (p14: 8 → 8 or 16 bps) */
  function bitRateOf(elements, L) { return round12(nonneg(elements, 'signal elements per second') * bitsPerLevel(L)); }
  function bitDuration(bitRate) { return round12(1 / pos(bitRate, 'bit rate')); }
  /** Bit length = propagation speed × bit duration = speed / bit rate (textbook; p14 gives only the definition in words).
      One division, so no rounding error from the intermediate bit duration. */
  function bitLength(speed, bitRate) { return round12(pos(speed, 'propagation speed') / pos(bitRate, 'bit rate')); }
  /** Low-pass approximation: h harmonics (N/2, 3N/2, 5N/2, …) need (2h − 1) × N/2. */
  function lowpassBandwidth(N, harmonics) {
    if (!(Number.isInteger(harmonics) && harmonics >= 1)) throw new RangeError('harmonics must be a whole number ≥ 1 (got ' + harmonics + ')');
    return round12((2 * harmonics - 1) * pos(N, 'bit rate N') / 2);
  }

  /* ---------- decibels and SNR  [L02 pp20–26] ---------- */
  /** dB = 10 log₁₀(P2/P1) */
  function dB(P2, P1) { return round12(10 * Math.log10(pos(P2, 'P2') / pos(P1, 'P1'))); }
  /** P2/P1 = 10^(dB/10) */
  function ratioFromDb(db) { return round12(Math.pow(10, fin(db, 'dB') / 10)); }
  /** P2 = P1 × 10^(dB/10) */
  function powerAfter(P1, db) { return round12(pos(P1, 'P1') * Math.pow(10, fin(db, 'dB') / 10)); }
  /** Net dB of cascaded stages: gains (+) and losses (−) simply add. */
  function dbChain(stages) {
    if (!Array.isArray(stages)) throw new RangeError('dbChain needs a list of dB values');
    var t = 0;
    for (var i = 0; i < stages.length; i++) t += fin(stages[i], 'stage ' + (i + 1));
    return round12(t);
  }
  function chainPower(P1, stages) { return powerAfter(P1, dbChain(stages)); }
  /** SNR = average signal power / average noise power */
  function snr(Ps, Pn) { return round12(pos(Ps, 'signal power') / pos(Pn, 'noise power')); }
  /** SNR_dB = 10 log₁₀ SNR */
  function snrDb(ratio) { return round12(10 * Math.log10(pos(ratio, 'SNR'))); }
  function snrFromDb(db) { return round12(Math.pow(10, fin(db, 'SNR_dB') / 10)); }

  /* ---------- data-rate limits  [L02 pp28–33] ---------- */
  /** Nyquist (noiseless): N = 2 × B × log₂L */
  function nyquist(B, L) { return round12(2 * pos(B, 'bandwidth') * bitsPerLevel(L)); }
  /** bits per level needed for bit rate N: N / (2B) = log₂L */
  function nyquistBitsPerLevel(N, B) { return round12(nonneg(N, 'bit rate') / (2 * pos(B, 'bandwidth'))); }
  /** L = 2^(N / 2B) */
  function nyquistLevels(N, B) { return round12(Math.pow(2, nyquistBitsPerLevel(N, B))); }
  /** B = N / (2 log₂L) */
  function nyquistBandwidth(N, L) {
    var r = bitsPerLevel(L);
    if (r === 0) throw new RangeError('a single level carries no information (L must be greater than 1)');
    return round12(nonneg(N, 'bit rate') / (2 * r));
  }
  /** Shannon (noisy): C = B × log₂(1 + SNR), SNR as a plain ratio */
  function shannon(B, ratio) { return round12(pos(B, 'bandwidth') * Math.log2(1 + nonneg(ratio, 'SNR'))); }
  /** B = C / log₂(1 + SNR) */
  function shannonBandwidth(capacity, ratio) { return round12(nonneg(capacity, 'capacity') / Math.log2(1 + pos(ratio, 'SNR'))); }
  /** SNR = 2^(C/B) − 1 */
  function shannonSnr(capacity, B) { return round12(Math.pow(2, nonneg(capacity, 'capacity') / pos(B, 'bandwidth')) - 1); }
  /** p33: Shannon gives the upper limit C; a chosen lower rate N then needs L = 2^(N/2B) levels. */
  function capacityPlan(B, ratio, N) {
    var cap = shannon(B, ratio), r = nyquistBitsPerLevel(N, B);
    return { C: cap, N: N, r: r, L: round12(Math.pow(2, r)), feasible: N <= cap * (1 + 1e-12) };
  }

  /* ---------- latency  [L02 pp34–37] ---------- */
  /** Slide convention: KB = 1000 bytes, so 2.5 KB = 2500 bytes; 1 byte = 8 bits. */
  function bytesToBits(bytes) { return round12(8 * nonneg(bytes, 'message size in bytes')); }
  /** Tp = distance / propagation speed */
  function propagationTime(distance, speed) { return round12(nonneg(distance, 'distance') / pos(speed, 'propagation speed')); }
  /** Tt = message size / bandwidth */
  function transmissionTime(bits, bandwidthBps) { return round12(nonneg(bits, 'message size in bits') / pos(bandwidthBps, 'bandwidth')); }
  /** latency = Tp + Tt + queuing + processing */
  function latency(Tp, Tt, queue, processing) {
    return round12(nonneg(Tp, 'propagation time') + nonneg(Tt, 'transmission time') +
      nonneg(optional(queue, 0), 'queuing time') + nonneg(optional(processing, 0), 'processing delay'));
  }
  /** Full breakdown from physical quantities: {distance (m), speed (m/s), bits, bandwidth (bps), queue (s)?, processing (s)?}. */
  function messageLatency(o) {
    var Tp = propagationTime(o.distance, o.speed), Tt = transmissionTime(o.bits, o.bandwidth);
    var q = optional(o.queue, 0), p = optional(o.processing, 0);
    return { Tp: Tp, Tt: Tt, queue: q, processing: p, total: latency(Tp, Tt, q, p) };
  }

  KIT.calc.signals = {
    CONV: CONV, C: C,
    frequency: frequency, period: period, frequencyFromCycles: frequencyFromCycles,
    wavelength: wavelength, frequencyFromWavelength: frequencyFromWavelength, wavelengthFromPeriod: wavelengthFromPeriod,
    phaseFromShift: phaseFromShift, shiftFromPhase: shiftFromPhase,
    bandwidth: bandwidth, bandwidthOf: bandwidthOf, highestFrequency: highestFrequency, lowestFrequency: lowestFrequency,
    bitsPerLevel: bitsPerLevel, levels: levels, bitRateOf: bitRateOf, bitDuration: bitDuration, bitLength: bitLength,
    lowpassBandwidth: lowpassBandwidth,
    dB: dB, ratioFromDb: ratioFromDb, powerAfter: powerAfter, dbChain: dbChain, chainPower: chainPower,
    snr: snr, snrDb: snrDb, snrFromDb: snrFromDb,
    nyquist: nyquist, nyquistBitsPerLevel: nyquistBitsPerLevel, nyquistLevels: nyquistLevels, nyquistBandwidth: nyquistBandwidth,
    shannon: shannon, shannonBandwidth: shannonBandwidth, shannonSnr: shannonSnr, capacityPlan: capacityPlan,
    bytesToBits: bytesToBits, propagationTime: propagationTime, transmissionTime: transmissionTime,
    latency: latency, messageLatency: messageLatency
  };
})();
