/* L02 problem generators: wave, bandwidth, decibels/SNR, Nyquist, Shannon, Shannon→Nyquist, latency.
   Rules: params(rng) uses ONLY rng and returns plain data with hand-computable numbers; build(p) is pure and returns
   {prompt, inputs[], steps[], hints[]?, key?}. Every number comes from KIT.calc.signals. Owner: O1. */
(function () {
  'use strict';
  function M() { return KIT.calc.signals; }
  function si(x, unit, sig) { return KIT.fmt.si(x, unit, sig || 4); }
  function num(x, sig) { return KIT.fmt.num(x, sig || 6); }
  function chip(r) { return '<span class="chip ref">' + r + '</span>'; }
  function chips() { return Array.prototype.slice.call(arguments).map(chip).join(' '); }
  function pow2(k) { return Math.pow(2, k); }

  /** 3×10⁸, 7.5×10⁻⁷, 10⁹: scientific notation for very large / very small numbers, plain digits otherwise. */
  function big(x) {
    if (x === 0 || (Math.abs(x) >= 1e-3 && Math.abs(x) < 1e6)) return num(x);
    var e = x.toExponential(6).split('e'), m = Number(e[0]), p = parseInt(e[1], 10);
    return (m === 1 ? '' : num(m) + '×') + '10' + KIT.fmt.sup(p);
  }
  function hzf(f) { return f >= 1e12 ? big(f) + ' Hz' : f >= 1e5 ? si(f, 'Hz') : num(f) + ' Hz'; }
  function bpsf(x) { return x >= 1e6 ? si(x, 'bps') : num(x) + ' bps'; }
  function mps(v) { return big(v) + ' m/s'; }
  function secs(t) { return t >= 0.1 ? num(t) + ' s' : si(t, 's'); }
  function metres(x) {
    if (x >= 1000) return num(x / 1000) + ' km';
    if (x >= 0.01) return num(x) + ' m';
    if (x >= 1e-3) return num(x * 1000) + ' mm';
    if (x >= 1e-7) return num(x * 1e6) + ' µm';
    return num(x * 1e9) + ' nm';
  }
  function pw(P) { return si(P, 'W'); }
  function dbs(x) { return num(x, 4) + ' dB'; }
  /** "20 µs (= 0.020 ms)" for times under 1 ms, the plain SI form otherwise. */
  function tfmt(t) {
    if (t >= 1e-3) return si(t, 's');
    var v = t * 1000, three = v.toFixed(3);
    return si(t, 's') + ' (= ' + (Number(three) === Number(v.toPrecision(12)) ? three : num(v)) + ' ms)';
  }
  function sz(bytes) { return bytes >= 1000 && bytes % 100 === 0 ? num(bytes / 1000) + '-KB' : num(bytes) + '-byte'; }
  /** a / b without floating-point noise, for display in worked steps. */
  function frac(a, b) { return Number((a / b).toPrecision(12)); }
  /** "0.75 µm" or "7.5×10⁻⁷ m = 0.75 µm": the plain-metre form, plus the prefixed form when it differs. */
  function mfmt(x) { var a = big(x) + ' m', b = metres(x); return a === b ? a : a + ' = ' + b; }

  /* ---------- 1. sine wave: period, frequency, wavelength, phase  [L02 pp6–10] ---------- */
  KIT.gen.register('l02.wave', {
    topic: 'l02', title: 'Period, frequency, wavelength and phase', level: 1, ref: 'L02 pp6-10',
    samples: [
      { find: 'fT', cycles: 4, seconds: 1 },                       // L02 p7
      { find: 'lambda', f: 4e14, v: 3e8 },                         // L02 p10
      { find: 'T', f: 250 }, { find: 'f', T: 0.002 }, { find: 'freq', lambda: 0.5, v: 3e8 },
      { find: 'phase', f: 250, shift: 0.001 }, { find: 'shift', f: 250, phase: 180 },
      { find: 'all', f: 1e9, v: 3e8, shift: 2.5e-10 }],
    params: function (rng) {
      var m = M(), find = rng.pick(['fT', 'T', 'f', 'lambda', 'lambda', 'freq', 'phase', 'shift', 'all']), v, T, ph, f;
      if (find === 'fT') { f = rng.pick([2, 4, 5, 8, 10, 20, 25, 50]); var s = rng.pick([1, 2, 5]); return { find: 'fT', cycles: f * s, seconds: s }; }
      if (find === 'T') return { find: 'T', f: rng.pick([20, 50, 100, 200, 250, 400, 500, 1000, 4000, 5000, 1e6]) };
      if (find === 'f') return { find: 'f', T: rng.pick([0.5, 0.25, 0.1, 0.02, 0.004, 0.002, 0.001, 0.00025, 1e-6]) };
      if (find === 'lambda') {
        v = rng.pick([3e8, 3e8, 2e8]);
        return { find: 'lambda', v: v, f: rng.pick(v === 3e8 ? [1.5e6, 3e6, 6e6, 15e6, 30e6, 60e6, 100e6, 150e6, 300e6, 600e6, 1e9, 1.5e9, 3e9, 5e14, 6e14]
          : [2e6, 4e6, 5e6, 10e6, 20e6, 50e6, 100e6, 200e6, 500e6, 1e9]) };
      }
      if (find === 'freq') {
        v = rng.pick([3e8, 3e8, 2e8]);
        return { find: 'freq', v: v, lambda: rng.pick(v === 3e8 ? [0.1, 0.2, 0.5, 1, 2, 3, 5, 10, 50, 100] : [0.2, 0.4, 1, 2, 4, 10, 20, 50, 100]) };
      }
      if (find === 'phase' || find === 'shift') {
        T = rng.pick([0.001, 0.002, 0.004, 0.008, 0.02, 0.04]); ph = rng.pick([45, 90, 135, 180, 270]);
        return find === 'phase' ? { find: 'phase', f: m.frequency(T), shift: m.shiftFromPhase(ph, T) } : { find: 'shift', f: m.frequency(T), phase: ph };
      }
      f = rng.pick([1e8, 2e8, 4e8, 5e8, 1e9]); v = rng.pick([3e8, 2e8]); ph = rng.pick([45, 90, 180, 270]);
      return { find: 'all', f: f, v: v, shift: m.shiftFromPhase(ph, m.period(f)) };
    },
    build: function (p) {
      var m = M(), f, T, lam, ph, sh;
      if (p.find === 'fT') {
        f = m.frequencyFromCycles(p.cycles, p.seconds); T = m.period(f);
        return {
          prompt: 'A periodic signal completes <b>' + num(p.cycles) + ' cycles in ' + secs(p.seconds) + '</b>. What are its frequency and its period?',
          inputs: [{ id: 'f', kind: 'num', label: 'Frequency f', answer: f, unit: 'Hz' }, { id: 'T', kind: 'num', label: 'Period T', answer: T, unit: 's' }],
          steps: ['Frequency is the number of periods in 1 s: f = ' + num(p.cycles) + ' cycles / ' + secs(p.seconds) + ' = <b>' + hzf(f) + '</b>. ' + chips('L02 p6', 'L02 p7'),
            'Period and frequency are reciprocals (f = 1/T, T = 1/f): T = 1/' + num(f) + ' = <b>' + secs(T) + '</b>. ' + chip('L02 p7')],
          hints: ['f = 1/T and T = 1/f.']
        };
      }
      if (p.find === 'T') {
        T = m.period(p.f);
        return {
          prompt: 'A signal has a frequency of <b>' + hzf(p.f) + '</b>. What is its period?',
          inputs: [{ id: 'T', kind: 'num', label: 'Period T', answer: T, unit: 's' }],
          steps: ['The period is the time of one cycle, the reciprocal of the frequency: T = 1/f. ' + chip('L02 p7'),
            'T = 1/' + num(p.f) + ' Hz = <b>' + secs(T) + '</b>.'],
          hints: ['T = 1/f.']
        };
      }
      if (p.find === 'f') {
        f = m.frequency(p.T);
        return {
          prompt: 'A signal has a period of <b>' + secs(p.T) + '</b>. What is its frequency?',
          inputs: [{ id: 'f', kind: 'num', label: 'Frequency f', answer: f, unit: 'Hz' }],
          steps: ['Frequency is the reciprocal of the period: f = 1/T. ' + chip('L02 p7'), 'f = 1/' + num(p.T) + ' s = <b>' + hzf(f) + '</b>.'],
          hints: ['f = 1/T.']
        };
      }
      if (p.find === 'lambda') {
        lam = m.wavelength(p.f, p.v);
        return {
          prompt: 'A sine wave has a frequency of <b>' + hzf(p.f) + '</b> and travels at a propagation speed of <b>' + mps(p.v) + '</b>' +
            (p.v === 3e8 ? ' (the speed of light in free space)' : '') + '. What is its wavelength?',
          inputs: [{ id: 'lambda', kind: 'num', label: 'Wavelength λ', answer: lam, unit: 'm' }],
          steps: ['Wavelength binds the period or frequency to the propagation speed: λ = propagation speed × period = propagation speed / frequency. ' + chip('L02 p9'),
            'λ = v / f = ' + big(p.v) + ' / ' + big(p.f) + ' = <b>' + mfmt(lam) + '</b>. ' + chip('L02 p10')],
          hints: ['λ = c/f; in free space c = 3×10⁸ m/s.']
        };
      }
      if (p.find === 'freq') {
        f = m.frequencyFromWavelength(p.lambda, p.v);
        return {
          prompt: 'A sine wave has a wavelength of <b>' + metres(p.lambda) + '</b> and travels at <b>' + mps(p.v) + '</b>. What is its frequency?',
          inputs: [{ id: 'f', kind: 'num', label: 'Frequency f', answer: f, unit: 'Hz' }],
          steps: ['λ = v / f, so f = v / λ. ' + chip('L02 p9'), 'f = ' + big(p.v) + ' / ' + num(p.lambda) + ' m = <b>' + hzf(f) + '</b>. ' + chip('L02 p10')],
          hints: ['Rearrange λ = v/f.']
        };
      }
      if (p.find === 'phase') {
        T = m.period(p.f); ph = m.phaseFromShift(p.shift, T);
        return {
          prompt: 'A sine wave has a frequency of <b>' + hzf(p.f) + '</b>. A second wave of the same frequency <b>leads</b> it by <b>' + secs(p.shift) +
            '</b> (it starts ' + secs(p.shift) + ' earlier). What is the phase of the second wave relative to the first, in degrees?',
          inputs: [{ id: 'phase', kind: 'num', label: 'Phase shift', answer: ph, unit: '°', rel: false, tol: 0.5, accept: [ph - 360] }],
          steps: ['Period: T = 1/f = 1/' + num(p.f) + ' Hz = ' + secs(T) + '. ' + chip('L02 p7'),
            'A full period is 360°. Slide 8’s pictures put the 90° wave a quarter period ahead of the 0° wave (it starts at the peak), 180° half a period and 270° three quarters, so phase = 360° × (shift / T). ' + chip('L02 p8'),
            'Phase = 360° × (' + secs(p.shift) + ' / ' + secs(T) + ') = 360° × ' + num(frac(p.shift, T)) + ' = <b>' + num(ph) + '°</b>' +
              (ph > 180 ? ' (the same as ' + num(ph - 360) + '°)' : '') + '.'],
          hints: ['A full period is 360°.']
        };
      }
      if (p.find === 'shift') {
        T = m.period(p.f); sh = m.shiftFromPhase(p.phase, T);
        return {
          prompt: 'Two sine waves of frequency <b>' + hzf(p.f) + '</b> differ in phase by <b>' + p.phase + '°</b>. By what time shift is one displaced from the other?',
          inputs: [{ id: 'shift', kind: 'num', label: 'Time shift', answer: sh, unit: 's' }],
          steps: ['Period: T = 1/f = 1/' + num(p.f) + ' Hz = ' + secs(T) + '. ' + chip('L02 p7'),
            'A full period is 360° (slide 8: 90° = ¼ period, 180° = ½ period), so shift = (phase / 360°) × T. ' + chip('L02 p8'),
            'Shift = (' + p.phase + ' / 360) × ' + secs(T) + ' = <b>' + secs(sh) + '</b>.'],
          hints: ['Phase / 360° is the fraction of a period.']
        };
      }
      T = m.period(p.f); lam = m.wavelength(p.f, p.v); ph = m.phaseFromShift(p.shift, T);
      return {
        prompt: 'A sine wave has a frequency of <b>' + hzf(p.f) + '</b> and propagates along a cable at <b>' + mps(p.v) + '</b>. Find (a) its period, (b) its wavelength, and (c) the phase of a copy of the wave that <b>leads</b> it by <b>' + secs(p.shift) + '</b> (starts ' + secs(p.shift) + ' earlier).',
        inputs: [{ id: 'T', kind: 'num', label: '(a) Period T', answer: T, unit: 's' },
          { id: 'lambda', kind: 'num', label: '(b) Wavelength λ', answer: lam, unit: 'm' },
          { id: 'phase', kind: 'num', label: '(c) Phase shift', answer: ph, unit: '°', rel: false, tol: 0.5, accept: [ph - 360] }],
        steps: ['(a) T = 1/f = 1/(' + big(p.f) + ' Hz) = <b>' + secs(T) + '</b>. ' + chip('L02 p7'),
          '(b) λ = propagation speed / f = ' + big(p.v) + ' / ' + big(p.f) + ' = <b>' + mfmt(lam) + '</b>. ' + chip('L02 p9'),
          '(c) A full period is 360°, and a wave that leads by a quarter period is the slide-8 90° wave, so phase = 360° × shift / T = 360° × (' + secs(p.shift) + ' / ' + secs(T) + ') = 360° × ' +
            num(frac(p.shift, T)) + ' = <b>' + num(ph) + '°</b>. ' + chip('L02 p8')],
        hints: ['T = 1/f, λ = v/f, phase = 360° × shift/T.']
      };
    }
  });

  /* ---------- 2. bandwidth of a composite signal  [L02 pp12–13] ---------- */
  KIT.gen.register('l02.bandwidth', {
    topic: 'l02', title: 'Bandwidth of a composite signal', level: 1, ref: 'L02 pp12-13',
    samples: [{ find: 'B', fLow: 1000, fHigh: 5000 }, { find: 'harm', f: 200 }, { find: 'high', fLow: 300, B: 3000 }, { find: 'low', fHigh: 3300, B: 3000 }],
    params: function (rng) {
      var find = rng.pick(['B', 'B', 'high', 'low', 'harm']);
      var fLow = rng.pick([100, 200, 300, 500, 1000, 2000, 5000, 10e3, 20e3]), B = rng.pick([1000, 2000, 3000, 4000, 5000, 10e3, 20e3]);
      if (find === 'B') return { find: 'B', fLow: fLow, fHigh: fLow + B };
      if (find === 'high') return { find: 'high', fLow: fLow, B: B };
      if (find === 'low') return { find: 'low', fHigh: fLow + B, B: B };
      return { find: 'harm', f: rng.pick([100, 200, 250, 500, 1000, 2000]) };
    },
    build: function (p) {
      var m = M(), B, hi, lo;
      if (p.find === 'B') {
        B = m.bandwidth(p.fLow, p.fHigh);
        return {
          prompt: 'The frequency spectrum of a composite signal ranges from <b>' + hzf(p.fLow) + '</b> to <b>' + hzf(p.fHigh) + '</b>. What is its bandwidth?',
          inputs: [{ id: 'B', kind: 'num', label: 'Bandwidth B', answer: B, unit: 'Hz' }],
          steps: ['The bandwidth of a composite signal is the range of frequencies it contains: the difference between the highest and the lowest frequency. ' + chip('L02 p13'),
            'B = f<sub>max</sub> − f<sub>min</sub> = ' + num(p.fHigh) + ' − ' + num(p.fLow) + ' = <b>' + hzf(B) + '</b>.'],
          hints: ['Bandwidth is a difference between two numbers.']
        };
      }
      if (p.find === 'high') {
        hi = m.highestFrequency(p.fLow, p.B);
        return {
          prompt: 'A composite signal has a bandwidth of <b>' + hzf(p.B) + '</b> and its lowest frequency is <b>' + hzf(p.fLow) + '</b>. What is its highest frequency?',
          inputs: [{ id: 'fHigh', kind: 'num', label: 'Highest frequency', answer: hi, unit: 'Hz' }],
          steps: ['Bandwidth = highest frequency − lowest frequency, so highest = lowest + B. ' + chip('L02 p13'),
            'f<sub>max</sub> = ' + num(p.fLow) + ' + ' + num(p.B) + ' = <b>' + hzf(hi) + '</b>.'],
          hints: ['B = f_max − f_min.']
        };
      }
      if (p.find === 'low') {
        lo = m.lowestFrequency(p.fHigh, p.B);
        return {
          prompt: 'A composite signal has a bandwidth of <b>' + hzf(p.B) + '</b> and its highest frequency is <b>' + hzf(p.fHigh) + '</b>. What is its lowest frequency?',
          inputs: [{ id: 'fLow', kind: 'num', label: 'Lowest frequency', answer: lo, unit: 'Hz' }],
          steps: ['Bandwidth = highest frequency − lowest frequency, so lowest = highest − B. ' + chip('L02 p13'),
            'f<sub>min</sub> = ' + num(p.fHigh) + ' − ' + num(p.B) + ' = <b>' + hzf(lo) + '</b>.'],
          hints: ['B = f_max − f_min.']
        };
      }
      hi = 9 * p.f; B = m.bandwidthOf([p.f, 3 * p.f, hi]);
      return {
        prompt: 'A composite signal is made of three sine waves with frequencies <i>f</i>, 3<i>f</i> and 9<i>f</i>, where the fundamental frequency is <b>f = ' + hzf(p.f) +
          '</b>. What is the highest frequency in the signal, and what is its bandwidth?',
        inputs: [{ id: 'fmax', kind: 'num', label: 'Highest frequency', answer: hi, unit: 'Hz' }, { id: 'B', kind: 'num', label: 'Bandwidth B', answer: B, unit: 'Hz' }],
        steps: ['The components are f = ' + num(p.f) + ' Hz, 3f = ' + num(3 * p.f) + ' Hz and 9f = <b>' + hzf(hi) + '</b>; f is the fundamental frequency. ' + chip('L02 p12'),
          'Bandwidth = highest − lowest = 9f − f = 8f = <b>' + hzf(B) + '</b>. ' + chip('L02 p13')],
        hints: ['Bandwidth = f_max − f_min.']
      };
    }
  });

  /* ---------- 3. decibels, attenuation chains, SNR  [L02 pp20–26] ---------- */
  KIT.gen.register('l02.db', {
    topic: 'l02', title: 'Decibels, attenuation and SNR', level: 2, ref: 'L02 pp20-26',
    samples: [
      { find: 'dB', P1: 1, P2: 0.5 },                                              // L02 p22
      { find: 'snr', Ps: 0.01, Pn: 1e-6 },                                          // L02 p26
      { find: 'ratio', dB: 20, P1: 0.002 }, { find: 'ratio', dB: -10, P1: 0.05 }, { find: 'fromdb', snrDb: 30 },
      { find: 'chain', Pin: 0.002, stages: [-10, 30, -10] },
      { find: 'chain', Pin: 0.01, stages: [-20, -10, 20], Pn: 1e-9 }],
    params: function (rng) {
      var m = M(), find = rng.pick(['dB', 'dB', 'ratio', 'snr', 'snr', 'fromdb', 'chain', 'chain']);
      if (find === 'dB') {
        var ratio = rng.pick([0.5, 2, 0.25, 4, 0.1, 10, 100, 0.01, 1000]), P1 = rng.pick([1, 2, 4, 5, 8, 10, 20, 40, 50, 100]) * rng.pick([1e-3, 1e-6, 1]);
        P1 = Number(P1.toPrecision(12));
        return { find: 'dB', P1: P1, P2: Number((P1 * ratio).toPrecision(12)) };
      }
      if (find === 'ratio') return { find: 'ratio', dB: rng.pick([-30, -20, -10, 10, 20, 30]), P1: rng.pick([1, 2, 5, 10, 20, 50]) * 1e-3 };
      if (find === 'snr') {
        var Pn = Number((rng.pick([1, 2, 5]) * rng.pick([1e-9, 1e-6, 1e-3])).toPrecision(12));
        return { find: 'snr', Pn: Pn, Ps: Number((Pn * Math.pow(10, rng.int(1, 6))).toPrecision(12)) };
      }
      if (find === 'fromdb') return { find: 'fromdb', snrDb: rng.pick([10, 20, 30, 40, 50, 60]) };
      var pool = [-30, -20, -10, 10, 20, 30], stages = [-20, 10, -20], net;
      for (var tries = 0; tries < 50; tries++) {
        var cand = [], n = rng.int(2, 4);
        for (var i = 0; i < n; i++) cand.push(rng.pick(pool));
        net = m.dbChain(cand);
        if (net !== 0 && net >= -40 && net <= 20) { stages = cand; break; }
      }
      var Pin = Number((rng.pick([1, 2, 5, 10, 20, 50, 100]) * 1e-3).toPrecision(12)), out = { find: 'chain', Pin: Pin, stages: stages };
      if (rng.chance(0.6)) out.Pn = Number((m.chainPower(Pin, stages) / rng.pick([10, 100, 1000])).toPrecision(12));
      return out;
    },
    build: function (p) {
      var m = M(), ratio, db;
      if (p.find === 'dB') {
        ratio = Number((p.P2 / p.P1).toPrecision(12)); db = m.dB(p.P2, p.P1);
        var lg = Math.log10(ratio);
        return {
          prompt: 'A signal travels through a transmission medium and its power ' + (ratio < 1 ? 'is reduced' : 'is increased') + ' from <b>P<sub>1</sub> = ' + pw(p.P1) +
            '</b> to <b>P<sub>2</sub> = ' + pw(p.P2) + '</b>' + (ratio === 0.5 ? ' (to one-half)' : '') + '. What is the change in decibels? Is the signal attenuated or amplified?',
          inputs: [{ id: 'dB', kind: 'num', label: 'Change in decibels', answer: db, unit: 'dB', rel: false, tol: 0.1 }],
          steps: ['Decibels compare two powers: dB = 10 log<sub>10</sub>(P<sub>2</sub>/P<sub>1</sub>). ' + chip('L02 p21'),
            'P<sub>2</sub>/P<sub>1</sub> = ' + pw(p.P2) + ' / ' + pw(p.P1) + ' = ' + num(ratio) + '.',
            'dB = 10 log<sub>10</sub>(' + num(ratio) + ') = 10 × (' + num(lg, 4) + ') = <b>' + dbs(db) + '</b>' + (ratio === 0.5 ? ' (the slide writes −3 dB).' : '.') + ' ' + chip('L02 p22'),
            'The decibel is negative if a signal is attenuated and positive if it is amplified: this one is ' + (db < 0 ? '<b>attenuated</b> (a loss)' : '<b>amplified</b> (a gain)') + '. ' + chip('L02 p21')],
          hints: ['dB = 10 log₁₀(P2/P1); a loss gives a negative number.']
        };
      }
      if (p.find === 'ratio') {
        ratio = m.ratioFromDb(p.dB); var P2 = m.powerAfter(p.P1, p.dB), ex = p.dB / 10;
        return {
          prompt: (p.dB < 0 ? 'A cable section has a loss of <b>' + num(-p.dB) + ' dB</b>. If the power entering it is <b>' + pw(p.P1) + '</b>, what is the power leaving it, and what is the ratio P<sub>2</sub>/P<sub>1</sub>?'
            : 'An amplifier has a gain of <b>' + num(p.dB) + ' dB</b>. If the input power is <b>' + pw(p.P1) + '</b>, what is the output power, and what is the ratio P<sub>2</sub>/P<sub>1</sub>?'),
          inputs: [{ id: 'ratio', kind: 'num', label: 'Ratio P₂/P₁', answer: ratio, unit: '' }, { id: 'P2', kind: 'num', label: 'Output power P₂', answer: P2, unit: 'W' }],
          steps: ['From dB = 10 log<sub>10</sub>(P<sub>2</sub>/P<sub>1</sub>): P<sub>2</sub>/P<sub>1</sub> = 10<sup>dB/10</sup>. ' + chip('L02 p21'),
            'P<sub>2</sub>/P<sub>1</sub> = 10<sup>(' + num(p.dB) + ')/10</sup> = 10<sup>' + num(ex) + '</sup> = <b>' + num(ratio) + '</b>.',
            'P<sub>2</sub> = P<sub>1</sub> × ' + num(ratio) + ' = ' + pw(p.P1) + ' × ' + num(ratio) + ' = <b>' + pw(P2) + '</b>.'],
          hints: ['Positive dB multiplies the power, negative dB divides it; every 10 dB is a factor of 10.']
        };
      }
      if (p.find === 'snr') {
        ratio = m.snr(p.Ps, p.Pn); db = m.snrDb(ratio);
        var k = Math.log10(ratio), pwr = Number.isInteger(k);
        return {
          prompt: 'The power of a signal is <b>' + pw(p.Ps) + '</b> and the power of the noise is <b>' + pw(p.Pn) + '</b>; what are the values of SNR and SNR<sub>dB</sub>?',
          inputs: [{ id: 'SNR', kind: 'num', label: 'SNR', answer: ratio, unit: '' }, { id: 'SNRdB', kind: 'num', label: 'SNR_dB', answer: db, unit: 'dB', rel: false, tol: 0.1 }],
          steps: ['SNR = average signal power / average noise power, a plain ratio. ' + chip('L02 p25'),
            'SNR = ' + pw(p.Ps) + ' / ' + pw(p.Pn) + ' = ' + num(p.Ps) + ' W / ' + big(p.Pn) + ' W = <b>' + num(ratio) + '</b>. ' + chip('L02 p26'),
            'SNR<sub>dB</sub> = 10 log<sub>10</sub> SNR = 10 log<sub>10</sub> ' + (pwr ? num(ratio) + ' = 10 log<sub>10</sub> 10<sup>' + k + '</sup> = 10 × ' + k : num(ratio)) + ' = <b>' + dbs(db) + '</b>. ' + chips('L02 p25', 'L02 p26')],
          hints: ['Convert both powers to the same unit first.']
        };
      }
      if (p.find === 'fromdb') {
        ratio = m.snrFromDb(p.snrDb);
        return {
          prompt: 'The SNR of a channel is given as <b>' + num(p.snrDb) + ' dB</b>. What is the SNR as a plain ratio (the value used in Shannon’s formula)?',
          inputs: [{ id: 'SNR', kind: 'num', label: 'SNR (plain ratio)', answer: ratio, unit: '' }],
          steps: ['SNR<sub>dB</sub> = 10 log<sub>10</sub> SNR, so SNR = 10<sup>SNR<sub>dB</sub>/10</sup>. ' + chip('L02 p25'),
            'SNR = 10<sup>' + num(p.snrDb) + '/10</sup> = 10<sup>' + num(p.snrDb / 10) + '</sup> = <b>' + num(ratio) + '</b>.',
            'Shannon’s capacity formula needs this plain ratio, never the dB value. ' + chip('L02 p31')],
          hints: ['Every 10 dB is a factor of 10.']
        };
      }
      var st = p.stages, net = m.dbChain(st), Pout = m.chainPower(p.Pin, st), gain = m.ratioFromDb(net);
      var signed = st.map(function (x) { return (x < 0 ? '−' : '+') + num(Math.abs(x)); });
      var desc = st.map(function (x) { return x < 0 ? 'a section with a loss of ' + num(-x) + ' dB' : 'an amplifier with a gain of ' + num(x) + ' dB'; });
      var route = desc.length === 2 ? desc[0] + ' and then ' + desc[1] : desc.slice(0, -1).join(', then ') + ', and finally ' + desc[desc.length - 1];
      var inputs = [{ id: 'net', kind: 'num', label: 'Net change', answer: net, unit: 'dB', rel: false, tol: 0.1 },
        { id: 'Pout', kind: 'num', label: 'Output power', answer: Pout, unit: 'W' }];
      var steps = ['Write every stage in dB: losses are negative, gains positive: ' + signed.join(', ') + ' dB. ' + chip('L02 p21'),
        'Decibels of cascaded stages simply add: net = ' + signed.join(' ').replace(/^\+/, '') + ' = <b>' + dbs(net) + '</b> (a net ' + (net < 0 ? 'loss' : 'gain') + '). ' + chip('Forouzan'),
        'P<sub>out</sub>/P<sub>in</sub> = 10<sup>' + num(net) + '/10</sup> = 10<sup>' + num(net / 10) + '</sup> = ' + num(gain) + ', so P<sub>out</sub> = ' + pw(p.Pin) + ' × ' + num(gain) + ' = <b>' + pw(Pout) + '</b>. ' + chip('L02 p21')];
      var prompt = 'A signal with a power of <b>' + pw(p.Pin) + '</b> passes through ' + route + '.';
      if (p.Pn === undefined) {
        prompt += ' Find the net change in dB and the output power.';
      } else {
        var s = m.snr(Pout, p.Pn), sd = m.snrDb(s), sk = Math.log10(s);
        prompt += ' The noise power at the output is <b>' + pw(p.Pn) + '</b>. Find the net change in dB, the output power, and the SNR and SNR<sub>dB</sub> at the output.';
        inputs.push({ id: 'SNR', kind: 'num', label: 'SNR at the output', answer: s, unit: '' },
          { id: 'SNRdB', kind: 'num', label: 'SNR_dB', answer: sd, unit: 'dB', rel: false, tol: 0.1 });
        steps.push('SNR = P<sub>out</sub> / P<sub>noise</sub> = ' + pw(Pout) + ' / ' + pw(p.Pn) + ' = <b>' + num(s) + '</b>. ' + chip('L02 p25'),
          'SNR<sub>dB</sub> = 10 log<sub>10</sub> ' + num(s) + (Number.isInteger(sk) ? ' = 10 log<sub>10</sub> 10<sup>' + sk + '</sup> = 10 × ' + sk : '') + ' = <b>' + dbs(sd) + '</b>. ' + chip('L02 p25'));
      }
      return {
        prompt: prompt, inputs: inputs, steps: steps,
        hints: ['Add the dB values; convert the total back to a power ratio with 10^(dB/10).'],
        key: function () { return KIT.draw.dbchain ? KIT.draw.dbchain({ stages: st }) : document.createElement('div'); }
      };
    }
  });

  /* ---------- 4. Nyquist bit rate / levels / bandwidth, bits per level  [L02 pp14, 28–30] ---------- */
  KIT.gen.register('l02.nyquist', {
    topic: 'l02', title: 'Nyquist: bit rate, levels and bandwidth', level: 1, ref: 'L02 p14; L02 pp29-30',
    samples: [{ find: 'N', B: 3000, L: 2 }, { find: 'digital', elements: 8, L: 2 }, { find: 'digital', elements: 8, L: 4 },
      { find: 'N', B: 3000, L: 4 }, { find: 'L', B: 4000, N: 32000 }, { find: 'B', N: 12000, L: 4 }],
    params: function (rng) {
      var find = rng.pick(['N', 'N', 'L', 'L', 'B', 'digital']);
      var B = rng.pick([1000, 2000, 3000, 4000, 5000, 6000, 8000, 10e3, 20e3, 100e3, 1e6, 2e6, 4e6]), r = rng.pick([1, 2, 3, 4, 5, 6, 8]);
      if (find === 'N') return { find: 'N', B: B, L: pow2(r) };
      if (find === 'L') return { find: 'L', B: B, N: 2 * B * r };
      if (find === 'B') return { find: 'B', N: 2 * B * r, L: pow2(r) };
      return { find: 'digital', elements: rng.pick([8, 10, 16, 20, 100]), L: rng.pick([2, 4, 8, 16]) };
    },
    build: function (p) {
      var m = M(), N, r, L, B;
      if (p.find === 'digital') {
        r = m.bitsPerLevel(p.L); N = m.bitRateOf(p.elements, p.L);
        return {
          prompt: 'A digital signal sends <b>' + num(p.elements) + ' signal levels (elements) in 1 s</b>, and each element can take one of <b>' + p.L + ' levels</b>. How many bits does each level carry, and what is the bit rate?',
          inputs: [{ id: 'r', kind: 'num', label: 'Bits per level', answer: r, unit: '' }, { id: 'N', kind: 'num', label: 'Bit rate N', answer: N, unit: 'bps' }],
          steps: ['A signal with L levels needs log<sub>2</sub>L bits for each level: log<sub>2</sub>' + p.L + ' = <b>' + r + ' bit' + (r > 1 ? 's' : '') + '</b> per level. ' + chip('L02 p14'),
            'Bit rate = bits sent in 1 s = ' + num(p.elements) + ' × ' + r + ' = <b>' + bpsf(N) + '</b>. ' + chip('L02 p14')],
          hints: ['Bit rate = elements per second × bits per element.']
        };
      }
      if (p.find === 'N') {
        r = m.bitsPerLevel(p.L); N = m.nyquist(p.B, p.L);
        return {
          prompt: 'Consider a noiseless channel with a bandwidth of <b>' + hzf(p.B) + '</b> transmitting a signal with <b>' + p.L + ' signal levels</b>. What is the theoretical maximum bit rate?',
          inputs: [{ id: 'N', kind: 'num', label: 'Bit rate N', answer: N, unit: 'bps' }],
          steps: ['A noiseless channel follows Nyquist: bit rate = 2 × bandwidth × log<sub>2</sub>L. ' + chip('L02 p29'),
            'Bit rate = 2 × ' + num(p.B) + ' × log<sub>2</sub>' + p.L + ' = 2 × ' + num(p.B) + ' × ' + r + ' = <b>' + bpsf(N) + '</b>. ' + chip('L02 p30')],
          hints: ['N = 2 · B · log₂L.']
        };
      }
      if (p.find === 'L') {
        r = m.nyquistBitsPerLevel(p.N, p.B); L = m.nyquistLevels(p.N, p.B);
        return {
          prompt: 'We need to send <b>' + bpsf(p.N) + '</b> over a noiseless channel with a bandwidth of <b>' + hzf(p.B) + '</b>. How many bits must each signal level carry, and how many signal levels do we need?',
          inputs: [{ id: 'r', kind: 'num', label: 'Bits per level log₂L', answer: r, unit: '' }, { id: 'L', kind: 'num', label: 'Signal levels L', answer: L, unit: '' }],
          steps: ['Nyquist: bit rate = 2 × bandwidth × log<sub>2</sub>L, so log<sub>2</sub>L = bit rate / (2 × bandwidth). ' + chip('L02 p29'),
            'log<sub>2</sub>L = ' + num(p.N) + ' / (2 × ' + num(p.B) + ') = <b>' + num(r) + '</b> bits per level.',
            'L = 2<sup>' + num(r) + '</sup> = <b>' + num(L) + '</b> signal levels.'],
          hints: ['Solve Nyquist for log₂L first, then L = 2^(log₂L).']
        };
      }
      r = m.bitsPerLevel(p.L); B = m.nyquistBandwidth(p.N, p.L);
      return {
        prompt: 'A noiseless channel must carry <b>' + bpsf(p.N) + '</b> using <b>' + p.L + ' signal levels</b>. What is the minimum bandwidth it needs?',
        inputs: [{ id: 'B', kind: 'num', label: 'Bandwidth B', answer: B, unit: 'Hz' }],
        steps: ['Nyquist: bit rate = 2 × bandwidth × log<sub>2</sub>L, so bandwidth = bit rate / (2 × log<sub>2</sub>L). ' + chip('L02 p29'),
          'log<sub>2</sub>' + p.L + ' = ' + r + ', so B = ' + num(p.N) + ' / (2 × ' + r + ') = <b>' + hzf(B) + '</b>.'],
        hints: ['B = N / (2 · log₂L).']
      };
    }
  });

  /* ---------- 5. Shannon capacity  [L02 pp25, 31–32] ---------- */
  KIT.gen.register('l02.shannon', {
    topic: 'l02', title: 'Shannon capacity of a noisy channel', level: 2, ref: 'L02 pp31-32',
    samples: [{ find: 'C', B: 3000, snr: 3162 }, { find: 'C', B: 1e6, snr: 63 }, { find: 'B', C: 48000, snr: 15 },
      { find: 'snr', C: 24000, B: 4000 }, { find: 'db', B: 4000, snrDb: 30 }],
    params: function (rng) {
      var find = rng.pick(['C', 'C', 'B', 'snr', 'db']);
      var k = rng.pick([1, 2, 3, 4, 5, 6, 7, 8, 10]), snr = pow2(k) - 1;
      var B = rng.pick([1000, 2000, 3000, 4000, 5000, 8000, 10e3, 100e3, 1e6, 2e6]);
      if (find === 'C') return { find: 'C', B: B, snr: snr };
      if (find === 'B') return { find: 'B', C: B * k, snr: snr };
      if (find === 'snr') return { find: 'snr', C: B * k, B: B };
      return { find: 'db', B: B, snrDb: rng.pick([0, 30, 60]) };
    },
    build: function (p) {
      var m = M(), C, B, s, lg;
      if (p.find === 'C') {
        C = m.shannon(p.B, p.snr); lg = Math.log2(1 + p.snr);
        var slide = p.B === 3000 && p.snr === 3162;
        return {
          prompt: 'A channel has a bandwidth of <b>' + hzf(p.B) + '</b> and a signal-to-noise ratio of <b>' + num(p.snr) + '</b> (a plain ratio, not dB). What is the theoretical highest bit rate (the capacity)?',
          inputs: [{ id: 'C', kind: 'num', label: 'Capacity C', answer: C, unit: 'bps', sig: 5 }],
          steps: ['A noisy channel follows Shannon: capacity = bandwidth × log<sub>2</sub>(1 + SNR), with SNR as a plain ratio. ' + chip('L02 p31'),
            'C = ' + num(p.B) + ' × log<sub>2</sub>(1 + ' + num(p.snr) + ') = ' + num(p.B) + ' × log<sub>2</sub>' + num(1 + p.snr) + '.',
            'log<sub>2</sub>' + num(1 + p.snr) + ' ' + (Number.isInteger(lg) ? '= ' + lg : '≈ ' + num(lg, 5)) + ', so C = ' + num(p.B) + ' × ' + (Number.isInteger(lg) ? lg : num(lg, 5)) + ' = <b>' + bpsf(Math.round(C)) + '</b>. ' + chip('L02 p32') +
              (slide ? ' The slide prints 34,860 bps because it rounds log<sub>2</sub>3163 to 11.62; the exact value is 34,881 bps.' : '')],
          hints: ['Use 1 + SNR inside the logarithm, and the plain ratio, not dB.']
        };
      }
      if (p.find === 'B') {
        B = m.shannonBandwidth(p.C, p.snr); lg = Math.log2(1 + p.snr);
        return {
          prompt: 'A noisy channel must carry <b>' + bpsf(p.C) + '</b> and has a signal-to-noise ratio of <b>' + num(p.snr) + '</b>. What is the minimum bandwidth?',
          inputs: [{ id: 'B', kind: 'num', label: 'Bandwidth B', answer: B, unit: 'Hz' }],
          steps: ['Shannon: C = B × log<sub>2</sub>(1 + SNR), so B = C / log<sub>2</sub>(1 + SNR). ' + chip('L02 p31'),
            'log<sub>2</sub>(1 + ' + num(p.snr) + ') = log<sub>2</sub>' + num(1 + p.snr) + ' = ' + lg + '.',
            'B = ' + num(p.C) + ' / ' + lg + ' = <b>' + hzf(B) + '</b>.'],
          hints: ['B = C / log₂(1 + SNR).']
        };
      }
      if (p.find === 'snr') {
        s = m.shannonSnr(p.C, p.B); lg = m.nyquistBitsPerLevel(p.C, p.B);
        return {
          prompt: 'A channel with a bandwidth of <b>' + hzf(p.B) + '</b> has a capacity of <b>' + bpsf(p.C) + '</b>. What signal-to-noise ratio (as a plain ratio) does it have?',
          inputs: [{ id: 'SNR', kind: 'num', label: 'SNR (plain ratio)', answer: s, unit: '' }],
          steps: ['Shannon: C = B × log<sub>2</sub>(1 + SNR), so log<sub>2</sub>(1 + SNR) = C / B. ' + chip('L02 p31'),
            'log<sub>2</sub>(1 + SNR) = ' + num(p.C) + ' / ' + num(p.B) + ' = ' + num(lg) + '.',
            '1 + SNR = 2<sup>' + num(p.C / p.B) + '</sup> = ' + num(pow2(p.C / p.B)) + ', so SNR = <b>' + num(s) + '</b>.'],
          hints: ['Undo the logarithm with a power of 2.']
        };
      }
      s = m.snrFromDb(p.snrDb); C = m.shannon(p.B, s); lg = Math.log2(1 + s);
      return {
        prompt: 'A channel has a bandwidth of <b>' + hzf(p.B) + '</b> and an SNR of <b>' + num(p.snrDb) + ' dB</b>. What is its Shannon capacity? (Convert the SNR to a plain ratio first; the shortcut 2<sup>10</sup> ≈ 1000 helps.)',
        inputs: [{ id: 'C', kind: 'num', label: 'Capacity C', answer: C, unit: 'bps', sig: 5 }],
        steps: ['Shannon needs the plain ratio: SNR = 10<sup>SNR<sub>dB</sub>/10</sup> = 10<sup>' + num(p.snrDb / 10) + '</sup> = ' + num(s) + '. ' + chips('L02 p25', 'L02 p31'),
          'C = B × log<sub>2</sub>(1 + SNR) = ' + num(p.B) + ' × log<sub>2</sub>' + num(1 + s) + '.',
          'log<sub>2</sub>' + num(1 + s) + ' ' + (Number.isInteger(lg) ? '= ' + lg : '≈ ' + num(lg, 4) + ' (about ' + num(Math.round(lg)) + ', since 2<sup>10</sup> = 1024 ≈ 1000)') +
            ', so C = ' + num(p.B) + ' × ' + (Number.isInteger(lg) ? lg : num(lg, 4)) + ' = <b>' + bpsf(Math.round(C)) + '</b>' + (Number.isInteger(lg) ? '' : ' (≈ ' + num(p.B) + ' × ' + num(Math.round(lg)) + ' = ' + bpsf(p.B * Math.round(lg)) + ' by the shortcut)') + '.'],
        hints: ['SNR(dB) → plain ratio: 10^(dB/10).']
      };
    }
  });

  /* ---------- 6. Shannon → choose a lower rate → Nyquist levels  [L02 p33] ---------- */
  KIT.gen.register('l02.capacity', {
    topic: 'l02', title: 'Shannon upper limit, then Nyquist levels', level: 3, ref: 'L02 pp29-33',
    samples: [{ B: 1e6, snr: 63, N: 4e6 }, { B: 4000, snr: 255, N: 24000 }, { B: 2e6, snr: 15, N: 4e6 }],
    params: function (rng) {
      var k = rng.pick([4, 5, 6, 7, 8, 10]), B = rng.pick([3e3, 4e3, 8e3, 500e3, 1e6, 2e6]), r = rng.int(1, Math.floor((k - 1) / 2));
      return { B: B, snr: pow2(k) - 1, N: 2 * B * r };
    },
    build: function (p) {
      var m = M(), plan = m.capacityPlan(p.B, p.snr, p.N), lg = Math.log2(1 + p.snr);
      return {
        prompt: 'We have a channel with a <b>' + hzf(p.B) + '</b> bandwidth. The SNR for this channel is <b>' + num(p.snr) + '</b>. Find the upper limit of the bit rate. For better performance we then use a lower bit rate of <b>' +
          bpsf(p.N) + '</b>: how many signal levels are needed?',
        inputs: [{ id: 'C', kind: 'num', label: 'Upper limit C', answer: plan.C, unit: 'bps' }, { id: 'L', kind: 'num', label: 'Signal levels L', answer: plan.L, unit: '' }],
        steps: ['The channel is noisy, so Shannon gives the upper limit: C = B × log<sub>2</sub>(1 + SNR) = ' + hzf(p.B) + ' × log<sub>2</sub>(1 + ' + num(p.snr) + ') = ' + hzf(p.B) + ' × log<sub>2</sub>' + num(1 + p.snr) +
            ' = ' + hzf(p.B) + ' × ' + lg + ' = <b>' + bpsf(plan.C) + '</b>. ' + chips('L02 p31', 'L02 p33'),
          'We may send at most C, and a lower rate is safer: N = ' + bpsf(p.N) + ' ≤ ' + bpsf(plan.C) + '. ' + chip('L02 p33'),
          'Nyquist links the rate to the levels: N = 2 × B × log<sub>2</sub>L, so log<sub>2</sub>L = ' + num(p.N) + ' / (2 × ' + num(p.B) + ') = ' + num(plan.r) + '. ' + chip('L02 p29'),
          'L = 2<sup>' + num(plan.r) + '</sup> = <b>' + num(plan.L) + '</b> signal levels. ' + chip('L02 p33')],
        hints: ['Shannon first (upper limit), then Nyquist solved for L at the chosen rate.']
      };
    }
  });

  /* ---------- 7. latency: propagation + transmission (+ queuing + processing); bit length  [L02 pp14, 34–37] ---------- */
  KIT.gen.register('l02.latency', {
    topic: 'l02', title: 'Latency: propagation, transmission, queuing, processing', level: 2, ref: 'L02 pp34-37',
    samples: [{ d: 12e6, v: 2.4e8, bytes: 2500, bw: 1e9 },                                    // L02 p37
      { d: 3e6, v: 2e8, bytes: 1000, bw: 1e6, total: true },
      { d: 6e6, v: 3e8, bytes: 5000, bw: 1e8, queue: 0.002, proc: 0.0005 },
      { find: 'bitlen', v: 2e8, bw: 1e6 }],
    params: function (rng) {
      var mode = rng.pick(['plain', 'plain', 'queued', 'queued', 'total', 'bitlen']);
      var v = rng.pick([2e8, 3e8, 2.4e8]);
      if (mode === 'bitlen') return { find: 'bitlen', v: v, bw: rng.pick([1e6, 2e6, 4e6, 5e6, 10e6, 100e6, 1e9]) };
      var ms = rng.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 100]);
      var out = { d: Number((v * ms / 1000).toPrecision(12)), v: v, bytes: rng.pick([500, 1000, 1500, 2000, 2500, 4000, 5000, 10000, 25000]),
        bw: rng.pick([1e6, 2e6, 4e6, 5e6, 8e6, 10e6, 20e6, 100e6, 1e9]) };
      if (mode === 'queued') { out.queue = rng.pick([0.0005, 0.001, 0.002, 0.005, 0.01]); out.proc = rng.pick([0.0001, 0.0005, 0.001, 0.002]); }
      if (mode === 'total') out.total = true;
      return out;
    },
    build: function (p) {
      var m = M();
      if (p.find === 'bitlen') {
        var dur = m.bitDuration(p.bw), len = m.bitLength(p.v, p.bw);
        return {
          prompt: 'Signals travel at <b>' + mps(p.v) + '</b> along a link that sends <b>' + bpsf(p.bw) + '</b>. What is the duration of one bit, and how long (in metres) is one bit on the medium?',
          inputs: [{ id: 'dur', kind: 'num', label: 'Bit duration', answer: dur, unit: 's' }, { id: 'len', kind: 'num', label: 'Bit length', answer: len, unit: 'm' }],
          steps: ['Bit rate is the number of bits sent in 1 s, so one bit lasts 1 / bit rate = 1 / ' + bpsf(p.bw) + ' = <b>' + si(dur, 's') + '</b>. ' + chip('L02 p14'),
            'Bit length is the distance one bit occupies on the medium: bit length = propagation speed × bit duration = ' + mps(p.v) + ' × ' + si(dur, 's') + ' = <b>' + metres(len) + '</b>. ' + chips('L02 p14', 'Forouzan')],
          hints: ['Textbook formula: bit length = propagation speed × bit duration.']
        };
      }
      var bits = m.bytesToBits(p.bytes), q = p.queue || 0, pr = p.proc || 0, withTotal = !!(p.total || p.queue !== undefined || p.proc !== undefined);
      var r = m.messageLatency({ distance: p.d, speed: p.v, bits: bits, bandwidth: p.bw, queue: q, processing: pr });
      var ask = withTotal ? 'the propagation time, the transmission time and the total latency' : 'the propagation time and the transmission time';
      var extra = (q || pr) ? ' The message also waits <b>' + secs(q) + '</b> in queues and needs <b>' + secs(pr) + '</b> of processing.'
        : withTotal ? ' Assume there is no queuing or processing delay.' : '';
      var inputs = [{ id: 'Tp', kind: 'num', label: 'Propagation time Tp', answer: r.Tp, unit: 's' }, { id: 'Tt', kind: 'num', label: 'Transmission time Tt', answer: r.Tt, unit: 's' }];
      var steps = ['Propagation time = distance / propagation speed = ' + (p.d >= 1000 ? '(' + num(p.d / 1000) + ' × 1000 m)' : num(p.d) + ' m') + ' / (' + mps(p.v) + ') = <b>' + si(r.Tp, 's') + '</b>. ' + chips('L02 p35', 'L02 p37'),
        'Message size in bits: ' + num(p.bytes) + ' bytes × 8 = ' + num(bits) + ' bits (the slides use KB = 1000 bytes).',
        'Transmission time = message size / bandwidth = ' + num(bits) + ' bits / ' + bpsf(p.bw) + ' = <b>' + tfmt(r.Tt) + '</b>. ' + chips('L02 p35', 'L02 p37')];
      if (withTotal) {
        inputs.push({ id: 'total', kind: 'num', label: 'Total latency', answer: r.total, unit: 's' });
        steps.push('Latency = propagation time + transmission time + queuing time + processing delay = ' + si(r.Tp, 's') + ' + ' + si(r.Tt, 's') +
          (q || pr ? ' + ' + si(q, 's') + ' + ' + si(pr, 's') : ' + 0 + 0') + ' = <b>' + si(r.total, 's') + '</b>. ' + chip('L02 p35'));
      }
      return {
        prompt: 'What are ' + ask + ' for a <b>' + sz(p.bytes).replace('-KB', '-KB (kilobyte)') + '</b> message if the bandwidth of the network is <b>' + bpsf(p.bw) + '</b>? ' +
          'Assume that the distance between the sender and the receiver is <b>' + metres(p.d) + '</b> and that signals travel at <b>' + mps(p.v) + '</b>. (1 KB = 1000 bytes.)' + extra,
        inputs: inputs, steps: steps,
        hints: ['Tp = distance / speed; Tt = message size (bits) / bandwidth; latency adds all the delays.'],
        key: function () { return KIT.draw.latency ? KIT.draw.latency({ Tp: r.Tp, Tt: r.Tt, queue: q, processing: pr }) : document.createElement('div'); }
      };
    }
  });

  /* ---------- draw a sine wave: amplitude, frequency, phase  [L02 pp7–8] ---------- */
  var PHASE_START = { 0: 'at 0, going up', 90: 'at the peak', 180: 'at 0, going down', 270: 'at the trough' };
  KIT.gen.register('l02.sketch', {
    topic: 'l02', title: 'Draw a sine wave (amplitude, frequency, phase)', level: 1, ref: 'L02 pp7-8',
    samples: [{ A: 2, f: 2, phase: 90 }, { A: 5, f: 1, phase: 180 }, { A: 1, f: 4, phase: 0 }],
    params: function (rng) { return { A: rng.pick([1, 2, 5, 10]), f: rng.pick([1, 2, 3, 4]), phase: rng.pick([0, 90, 180, 270]) }; },
    build: function (p) {
      var T = 1 / p.f, ph = p.phase * Math.PI / 180, start = PHASE_START[p.phase];
      var Ttxt = Number.isInteger(1000 / p.f) ? num(T, 4) + ' s' : '1/' + num(p.f) + ' s (≈ ' + num(T, 3) + ' s)';
      var volts = function (x) { return x === 0 ? '0' : (x > 0 ? '+' : '−') + num(Math.abs(x)) + ' V'; };
      return {
        prompt: 'Draw one second of a sine wave with peak amplitude <b>' + num(p.A) + ' V</b>, frequency <b>' + num(p.f) + ' Hz</b> and phase <b>' + p.phase + '°</b>.',
        inputs: [{ id: 'wave', kind: 'sketch', label: 'Sine wave, 0 to 1 s',
          axes: { x: [0, 1], y: [-1.3 * p.A, 1.3 * p.A], yTicks: [-p.A, 0, p.A], yFormat: volts,
            xTicks: [0, 0.25, 0.5, 0.75, 1], xFormat: function (t) { return t + ' s'; }, xLabel: 'time' },
          model: { series: [{ kind: 'fn', fn: function (t) { return p.A * Math.sin(2 * Math.PI * p.f * t + ph); }, samples: 480 }] },
          rubric: [{ pts: 2, point: 'At t = 0 the wave starts ' + start + ' (phase ' + p.phase + '°).' },
            { pts: 2, point: num(p.f) + (p.f === 1 ? ' full cycle' : ' full cycles') + ' in 1 s — one cycle every T = 1/f = ' + Ttxt + '.' },
            { pts: 1, point: 'Crests at +' + num(p.A) + ' V and troughs at −' + num(p.A) + ' V.' }] }],
        steps: ['Period: T = 1/f = 1/' + num(p.f) + ' Hz = <b>' + Ttxt + '</b>, so ' + num(p.f) + (p.f === 1 ? ' cycle fits' : ' cycles fit') + ' in 1 s. ' + chip('L02 p7'),
          'Phase ' + p.phase + '°: the wave starts <b>' + start + '</b>. ' + chip('L02 p8'),
          'Peak amplitude ' + num(p.A) + ' V: the crests reach +' + num(p.A) + ' V and the troughs −' + num(p.A) + ' V. ' + chip('L02 p7')],
        hints: ['First mark where the wave starts at t = 0 (the phase), then count how many cycles fit in 1 s (the frequency).']
      };
    }
  });

})();
