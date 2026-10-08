/* L03b — PCM (sampling, quantization, encoding), delta modulation, transmission modes.
   Pure, deterministic; SI base units (Hz, samples/s, bps, V). Owner: Lead. Tests: test/calc.pcm.test.js */
(function () {
  'use strict';

  var CONV = {
    sampling: 'f_s = 1/T_s. Nyquist: sample at least 2 × the highest frequency, f_s ≥ 2·f_max — for low-pass AND bandpass signals; a bandpass signal whose f_max is unknown cannot be given a rate. [L03 p64; L03 p66; L03 p67; L03 p71]',
    zones: 'Δ = (max − min)/L. Zones are numbered 0 … L−1 from the bottom; a sample is replaced by its zone midpoint. A sample exactly on a boundary goes to the upper zone; the top value (max) stays in zone L−1. [L03 p72; L03 p73; L03 p74]',
    codes: 'n_b = log₂L bits per sample (round up if L is not a power of 2); zone k is sent as k in n_b-bit binary (000 = lowest zone). [L03 p75]',
    error: 'Quantization error = quantized (midpoint) − actual value, the sign used in the slide table; |error| ≤ Δ/2. (The text on p77 words it as actual − coded.) [L03 p76; L03 p77; L03 p78]',
    bitrate: 'PCM bit rate N = n_b × f_s. [L03 p79; L03 p80]',
    bandwidth: 'Minimum PCM bandwidth with an NRZ-type line code (c = 1/2, r = 1): B_min = N/2 = n_b × f_max — slide example 10: 4 kHz × 8 = 32 kHz. [L03 p83]',
    dm: 'Delta modulation: if the next sample is higher than the staircase, send 1 and step up by δ; otherwise send 0 and step down by δ. [L03 p84; L03 p85]',
    async: 'Asynchronous serial: one start bit (0) before and one or more stop bits (1) after every byte; gaps are allowed between bytes. [L03 p92; L03 p93]'
  };

  function r12(x) { return Number(x.toPrecision(12)); }
  function log2(x) { return Math.log(x) / Math.LN2; }
  function pad(s, w) { while (s.length < w) s = '0' + s; return s; }

  function nyquistRate(fmax) { return r12(2 * fmax); }
  function samplingInterval(fs) { return 1 / fs; }
  /** {kind:'lowpass'|'bandpass', bandwidth?, fmin?, fmax?} → minimum sampling rate, or null when it cannot be determined. */
  function minSamplingRate(sig) {
    if (sig.fmax !== undefined) return nyquistRate(sig.fmax);
    if (sig.kind === 'lowpass' && sig.bandwidth !== undefined) return nyquistRate(sig.bandwidth); // low-pass: B = f_max − 0
    return null;
  }

  function bitsPerSample(L) {
    var x = log2(L), rx = Math.round(x);
    return Math.abs(x - rx) < 1e-9 ? rx : Math.ceil(x);
  }

  function zones(min, max, L) {
    var delta = r12((max - min) / L), nb = bitsPerSample(L), out = [];
    for (var k = 0; k < L; k++) {
      out.push({ k: k, lo: r12(min + k * delta), hi: r12(min + (k + 1) * delta), mid: r12(min + (k + 0.5) * delta), code: pad(k.toString(2), nb) });
    }
    return { delta: delta, nb: nb, zones: out };
  }

  function quantize(value, min, max, L) {
    var delta = (max - min) / L, nb = bitsPerSample(L);
    var k = Math.floor((value - min) / delta + 1e-9);
    if (k < 0) k = 0;
    if (k > L - 1) k = L - 1;
    var mid = r12(min + (k + 0.5) * delta);
    var error = r12(mid - value);
    return {
      value: value, k: k, code: pad(k.toString(2), nb), mid: mid, error: error, delta: r12(delta),
      normalized: r12(value / delta), normalizedQuantized: r12(mid / delta), normalizedError: r12(error / delta)
    };
  }
  function quantizeSeries(values, min, max, L) { return values.map(function (v) { return quantize(v, min, max, L); }); }

  function bitRate(nb, fs) { return r12(nb * fs); }
  function minBandwidth(nb, fmax) { return r12(nb * fmax); }
  /** {fmax, nb | L} → {fs, nb, N, Bmin} */
  function pcm(o) {
    var nb = o.nb !== undefined ? o.nb : bitsPerSample(o.L);
    var fs = nyquistRate(o.fmax);
    return { fs: fs, nb: nb, N: bitRate(nb, fs), Bmin: minBandwidth(nb, o.fmax) };
  }

  function deltaMod(samples, delta, start) {
    var st = start || 0, bits = '', stair = [];
    samples.forEach(function (x) {
      if (x > st) { bits += '1'; st = r12(st + delta); } else { bits += '0'; st = r12(st - delta); }
      stair.push(st);
    });
    return { bits: bits, staircase: stair };
  }
  function dmDecode(bits, delta, start) {
    var st = start || 0, out = [];
    for (var i = 0; i < bits.length; i++) { st = r12(st + (bits.charAt(i) === '1' ? delta : -delta)); out.push(st); }
    return out;
  }

  function asyncFrame(dataBits, stopBits, startBits) {
    var s = startBits === undefined ? 1 : startBits;
    var frameBits = s + dataBits + (stopBits === undefined ? 1 : stopBits);
    return { frameBits: frameBits, efficiency: r12(dataBits / frameBits), overhead: frameBits - dataBits };
  }
  function charsPerSecond(bitRate, dataBits, stopBits) { return r12(bitRate / asyncFrame(dataBits, stopBits).frameBits); }

  KIT.calc.pcm = {
    CONV: CONV,
    nyquistRate: nyquistRate, samplingInterval: samplingInterval, minSamplingRate: minSamplingRate,
    bitsPerSample: bitsPerSample, zones: zones, quantize: quantize, quantizeSeries: quantizeSeries,
    bitRate: bitRate, minBandwidth: minBandwidth, pcm: pcm,
    deltaMod: deltaMod, dmDecode: dmDecode, asyncFrame: asyncFrame, charsPerSecond: charsPerSecond
  };
})();
