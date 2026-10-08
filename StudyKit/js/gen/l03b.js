/* L03b problem generators: sampling, quantization, PCM rates, delta modulation, asynchronous framing. Owner: Lead. */
(function () {
  'use strict';
  function P() { return KIT.calc.pcm; }
  function si(x, unit, sig) { return KIT.fmt.si(x, unit, sig || 4); }
  function num(x, sig) { return KIT.fmt.num(x, sig || 6); }
  function v(x) { return KIT.fmt.num(x, 6) + ' V'; }
  var ref = function (p) { return ' <span class="chip ref">' + p + '</span>'; };

  /* ---------- 1. Nyquist sampling rate  [L03 pp64–71] ---------- */
  KIT.gen.register('l03b.sampling', {
    topic: 'l03b', title: 'Nyquist sampling rate', level: 1, ref: 'L03 pp64-71',
    samples: [{ kind: 'lowpass', fmax: 4000 }, { kind: 'lowpass', fmax: 200e3 }, { kind: 'bandpass-unknown', bandwidth: 200e3 },
      { kind: 'bandpass', fmin: 1e6, fmax: 1.2e6 }, { kind: 'interval', Ts: 125e-6 }],
    params: function (rng) {
      var kind = rng.pick(['lowpass', 'lowpass', 'bandpass', 'bandpass-unknown', 'interval']);
      if (kind === 'lowpass') return { kind: kind, fmax: rng.pick([4000, 5000, 10e3, 20e3, 50e3, 100e3, 200e3]) };   // 1/(2 f_max) stays a round number (no calculator)
      if (kind === 'bandpass') { var f0 = rng.pick([1e6, 2e6, 5e6, 10e6]); return { kind: kind, fmin: f0, fmax: f0 + rng.pick([100e3, 200e3, 500e3]) }; }
      if (kind === 'bandpass-unknown') return { kind: kind, bandwidth: rng.pick([100e3, 200e3, 300e3, 1e6]) };
      return { kind: 'interval', Ts: rng.pick([125e-6, 100e-6, 50e-6, 25e-6, 10e-6]) };
    },
    build: function (p) {
      var pc = P();
      if (p.kind === 'lowpass') {
        var fs = pc.nyquistRate(p.fmax);
        return {
          prompt: 'A low-pass analog signal contains frequencies from 0 to <b>' + si(p.fmax, 'Hz') + '</b> (bandwidth ' + si(p.fmax, 'Hz') + '). ' +
            'What is the minimum sampling rate, and what is the sampling interval at that rate?',
          inputs: [{ id: 'fs', kind: 'num', label: 'Minimum f_s', answer: fs, unit: 'sps' },
            { id: 'Ts', kind: 'num', label: 'Sampling interval T_s', answer: 1 / fs, unit: 's' }],
          steps: ['A low-pass signal runs from 0 to f<sub>max</sub>, so f<sub>max</sub> = ' + si(p.fmax, 'Hz') + '.' + ref('L03 p70'),
            'Nyquist: f<sub>s</sub> ≥ 2 × f<sub>max</sub> = 2 × ' + si(p.fmax, 'Hz') + ' = <b>' + si(fs, 'samples/s') + '</b>.' + ref('L03 p66'),
            'T<sub>s</sub> = 1 / f<sub>s</sub> = <b>' + si(1 / fs, 's') + '</b>.' + ref('L03 p64')],
          hints: ['The sampling rate depends on the HIGHEST frequency in the signal.']
        };
      }
      if (p.kind === 'bandpass') {
        var fs2 = pc.nyquistRate(p.fmax);
        return {
          prompt: 'A bandpass signal occupies <b>' + si(p.fmin, 'Hz') + ' to ' + si(p.fmax, 'Hz') + '</b>. Using the Nyquist rule from the slides, what is the minimum sampling rate?',
          inputs: [{ id: 'fs', kind: 'num', label: 'Minimum f_s', answer: fs2, unit: 'sps' }],
          steps: ['The slides give the Nyquist rate for both low-pass and bandpass signals as 2 × f<sub>max</sub>.' + ref('L03 p67'),
            'f<sub>max</sub> = ' + si(p.fmax, 'Hz') + ' → f<sub>s</sub> = 2 × ' + si(p.fmax, 'Hz') + ' = <b>' + si(fs2, 'samples/s') + '</b>.',
            'Note: the bandwidth (' + si(p.fmax - p.fmin, 'Hz') + ') is not what matters — the highest frequency is.'],
          hints: ['Use the highest frequency, not the bandwidth.']
        };
      }
      if (p.kind === 'bandpass-unknown') {
        var choices = [si(2 * p.bandwidth, 'samples/s'), si(p.bandwidth, 'samples/s'), 'It cannot be determined', si(4 * p.bandwidth, 'samples/s')];
        return {
          prompt: 'A complex <b>bandpass</b> signal has a bandwidth of <b>' + si(p.bandwidth, 'Hz') + '</b>. What is the minimum sampling rate for this signal?',
          inputs: [{ id: 'ans', kind: 'choice', label: 'Answer', choices: choices, answer: 2 }],
          steps: ['The Nyquist rate is 2 × f<sub>max</sub>.' + ref('L03 p67'),
            'For a bandpass signal we only know the width of the band, not where it starts or ends — so f<sub>max</sub> is unknown.',
            '<b>The minimum sampling rate cannot be determined.</b> (Slide Example 8.)' + ref('L03 p71')],
          hints: ['Compare with a low-pass signal, where the band always starts at 0.']
        };
      }
      var fs3 = 1 / p.Ts;
      return {
        prompt: 'An analog signal is sampled every <b>' + si(p.Ts, 's') + '</b>. What is the sampling rate, and what is the highest frequency the signal may contain so that it can be recovered?',
        inputs: [{ id: 'fs', kind: 'num', label: 'f_s', answer: fs3, unit: 'sps' },
          { id: 'fmax', kind: 'num', label: 'Highest allowed frequency', answer: fs3 / 2, unit: 'Hz' }],
        steps: ['f<sub>s</sub> = 1 / T<sub>s</sub> = 1 / ' + si(p.Ts, 's') + ' = <b>' + si(fs3, 'samples/s') + '</b>.' + ref('L03 p64'),
          'Nyquist: f<sub>s</sub> ≥ 2 f<sub>max</sub>, so f<sub>max</sub> ≤ f<sub>s</sub>/2 = <b>' + si(fs3 / 2, 'Hz') + '</b>.' + ref('L03 p66')],
        hints: ['Turn the Nyquist rule around: f_max ≤ f_s / 2.']
      };
    }
  });

  /* ---------- 2. Quantization  [L03 pp72–78] ---------- */
  KIT.gen.register('l03b.quant', {
    topic: 'l03b', title: 'Quantization: zones, codes, error', level: 2, ref: 'L03 pp72-78',
    samples: [{ vmax: 20, L: 8, value: -6.1 }, { vmax: 20, L: 8, series: [7.5, 16.2, -11.3] }],
    params: function (rng) {
      var pair = rng.pick([[4, 4], [8, 4], [8, 8], [16, 8], [16, 16], [10, 4], [20, 4], [20, 8], [40, 8]]);   // Δ = 2, 4, 5, 10 or 20 (no calculator)
      var vmax = pair[0], L = pair[1];
      var delta = 2 * vmax / L;
      function sample() {
        for (var t = 0; t < 20; t++) {
          var x = Math.round((-vmax + 2 * vmax * rng.next()) * 10) / 10;
          var off = ((x + vmax) / delta) % 1;
          if (off > 0.05 && off < 0.95) return x;          // keep away from zone boundaries
        }
        return Math.round((-vmax + delta * 0.4) * 10) / 10;
      }
      if (rng.chance(0.35)) return { vmax: vmax, L: L, series: [sample(), sample(), sample()] };
      return { vmax: vmax, L: L, value: sample() };
    },
    build: function (p) {
      var pc = P(), min = -p.vmax, max = p.vmax;
      var z = pc.zones(min, max, p.L);
      var setup = 'A signal swings between <b>' + v(min) + '</b> and <b>' + v(max) + '</b> and is quantized into <b>L = ' + p.L + '</b> zones ' +
        '(zones numbered 0 to ' + (p.L - 1) + ' from the bottom, each sample replaced by its zone\'s midpoint, as in the slides).';
      var s1 = 'Δ = (max − min) / L = (' + num(max) + ' − (' + num(min) + ')) / ' + p.L + ' = <b>' + v(z.delta) + '</b>.' + ref('L03 p72');
      var s2 = 'n<sub>b</sub> = log₂ ' + p.L + ' = ' + z.nb + ' bits per sample; zone k is sent as k in binary.' + ref('L03 p75');
      if (p.series) {
        var rows = pc.quantizeSeries(p.series, min, max, p.L);
        return {
          prompt: setup + ' Give the ' + z.nb + '-bit code word for each sample: <b>' + p.series.map(v).join(', ') + '</b>.',
          inputs: rows.map(function (r, i) { return { id: 'c' + i, kind: 'bits', label: 'Code for ' + v(r.value), answer: r.code }; }),
          steps: [s1, s2].concat(rows.map(function (r) {
            return v(r.value) + ' lies in zone ' + r.k + ' (' + v(z.zones[r.k].lo) + ' to ' + v(z.zones[r.k].hi) + ') → midpoint ' + v(r.mid) + ' → code <b>' + r.code + '</b>.';
          })),
          hints: ['Find the zone by counting Δ-wide steps up from the minimum.']
        };
      }
      var q = pc.quantize(p.value, min, max, p.L);
      return {
        prompt: setup + ' A sample has the value <b>' + v(p.value) + '</b>. Find Δ, its code word, its quantized value, and the quantization error (quantized − actual).',
        inputs: [
          { id: 'delta', kind: 'num', label: 'Δ', answer: z.delta, unit: 'V' },
          { id: 'code', kind: 'bits', label: 'Code word', answer: q.code },
          { id: 'mid', kind: 'num', label: 'Quantized value', answer: q.mid, unit: 'V', rel: false, tol: 0.005 },
          { id: 'err', kind: 'num', label: 'Quantization error', answer: q.error, unit: 'V', rel: false, tol: 0.005, accept: q.error === 0 ? [] : [-q.error] }],
        steps: [s1, s2,
          v(p.value) + ' falls in zone ' + q.k + ': ' + v(z.zones[q.k].lo) + ' to ' + v(z.zones[q.k].hi) + ' → code <b>' + q.code + '</b>.' + ref('L03 p74'),
          'The sample is replaced by the zone midpoint: <b>' + v(q.mid) + '</b>.' + ref('L03 p73'),
          'Error = quantized − actual = ' + num(q.mid) + ' − (' + num(p.value) + ') = <b>' + v(q.error) + '</b> (|error| ≤ Δ/2 = ' + v(z.delta / 2) + ').' + ref('L03 p76')],
        hints: ['Count how many Δ steps the sample is above the minimum; the integer part is the zone number.']
      };
    }
  });

  /* ---------- 3. PCM bit rate and bandwidth  [L03 pp79–83] ---------- */
  KIT.gen.register('l03b.pcm', {
    topic: 'l03b', title: 'PCM: sampling rate, bits per sample, bit rate, bandwidth', level: 2, ref: 'L03 pp79-83',
    samples: [{ fmax: 4000, nb: 8 }, { fmax: 15e3, L: 64 }],
    params: function (rng) {
      var fmax = rng.pick([3000, 4000, 5000, 10e3, 15e3, 20e3, 100e3]);
      if (rng.chance(0.5)) return { fmax: fmax, L: rng.pick([16, 32, 64, 128, 256, 1024]) };
      return { fmax: fmax, nb: rng.pick([4, 6, 8, 10, 12]) };
    },
    build: function (p) {
      var r = P().pcm(p);
      var given = p.L !== undefined ? '<b>' + p.L + ' quantization levels</b>' : '<b>' + p.nb + ' bits per sample</b>';
      var steps = ['f<sub>max</sub> = ' + si(p.fmax, 'Hz') + ' → Nyquist sampling rate f<sub>s</sub> = 2 × f<sub>max</sub> = <b>' + si(r.fs, 'samples/s') + '</b>.' + ref('L03 p69')];
      if (p.L !== undefined) steps.push('n<sub>b</sub> = log₂ L = log₂ ' + p.L + ' = <b>' + r.nb + ' bits/sample</b>.' + ref('L03 p75'));
      steps.push('Bit rate N = n<sub>b</sub> × f<sub>s</sub> = ' + r.nb + ' × ' + si(r.fs, 'samples/s') + ' = <b>' + si(r.N, 'bps') + '</b>.' + ref('L03 p79'));
      steps.push('Minimum bandwidth (NRZ-type line code, c = ½, r = 1): B<sub>min</sub> = N/2 = n<sub>b</sub> × f<sub>max</sub> = <b>' + si(r.Bmin, 'Hz') + '</b> — versus only ' + si(p.fmax, 'Hz') + ' for the analog signal.' + ref('L03 p83'));
      var inputs = [{ id: 'fs', kind: 'num', label: 'Sampling rate f_s', answer: r.fs, unit: 'sps' }];
      if (p.L !== undefined) inputs.push({ id: 'nb', kind: 'num', label: 'Bits per sample n_b', answer: r.nb, unit: '' });
      inputs.push({ id: 'N', kind: 'num', label: 'Bit rate N', answer: r.N, unit: 'bps' });
      inputs.push({ id: 'Bmin', kind: 'num', label: 'Minimum bandwidth', answer: r.Bmin, unit: 'Hz' });
      return {
        prompt: 'A low-pass analog signal with frequencies up to <b>' + si(p.fmax, 'Hz') + '</b> is digitized with PCM using ' + given +
          ', sampled at the Nyquist rate. Find the sampling rate' + (p.L !== undefined ? ', the bits per sample' : '') +
          ', the bit rate, and the minimum bandwidth of the digitized signal (NRZ-type line code).',
        inputs: inputs,
        steps: steps,
        hints: ['Three formulas in a row: f_s = 2 f_max, N = n_b × f_s, B_min = n_b × f_max.']
      };
    }
  });

  /* ---------- 4. Delta modulation  [L03 pp84–87] ---------- */
  KIT.gen.register('l03b.dm', {
    topic: 'l03b', title: 'Delta modulation bits and staircase', level: 2, ref: 'L03 pp84-87',
    samples: [{ start: 2, delta: 1, samples: [1.6, 1.8, 2.5, 3.6, 4.5, 5.5, 6.3, 6.4, 5.6, 4.4, 3.5, 2.6, 1.8, 1.4, 2.3] }],
    params: function (rng) {
      var start = rng.pick([0, 1, 2, 5]), delta = rng.pick([0.5, 1, 2]);
      var n = rng.int(6, 9), st = start, samples = [];
      for (var i = 0; i < n; i++) {
        var up = rng.chance(0.55);
        var x = up ? st + delta * (0.2 + 0.1 * rng.int(0, 7)) : st - delta * (0.1 * rng.int(1, 8));   // never equal to the staircase (the tie rule is a convention)
        x = Math.round(x * 100) / 100;
        samples.push(x);
        st = x > st ? st + delta : st - delta;
      }
      return { start: start, delta: delta, samples: samples };
    },
    build: function (p) {
      var d = P().deltaMod(p.samples, p.delta, p.start);
      var last = d.staircase[d.staircase.length - 1];
      var rows = p.samples.map(function (x, i) {
        var before = i ? d.staircase[i - 1] : p.start;
        var b = d.bits.charAt(i);
        return 'Sample ' + num(x) + (b === '1' ? ' > ' : ' ≤ ') + 'staircase ' + num(before) + ' → <b>' + b + '</b>, staircase ' + (b === '1' ? '+' : '−') + num(p.delta) + ' = ' + num(d.staircase[i]) + '.';
      });
      return {
        prompt: 'A delta modulator starts with its staircase at <b>' + num(p.start) + '</b> and uses step size δ = <b>' + num(p.delta) + '</b>. ' +
          'The samples are: <b>' + p.samples.map(function (x) { return num(x); }).join(', ') + '</b>. Give the transmitted bits and the final staircase value.',
        inputs: [{ id: 'bits', kind: 'bits', label: 'Transmitted bits', answer: d.bits },
          { id: 'last', kind: 'num', label: 'Final staircase value', answer: last, unit: '', rel: false, tol: 0.001 }],
        steps: ['Rule: if the sample is higher than the current staircase, send 1 and step up by δ; otherwise send 0 and step down by δ.' + ref('L03 p84')]
          .concat(rows).concat(['Bits: <b>' + d.bits + '</b>; final staircase value <b>' + num(last) + '</b>.' + ref('L03 p85')]),
        hints: ['Compare each sample with the staircase BEFORE that step.']
      };
    }
  });

  /* ---------- 5. Asynchronous serial framing  [L03 pp92–93] ---------- */
  KIT.gen.register('l03b.async', {
    topic: 'l03b', title: 'Asynchronous transmission overhead', level: 1, ref: 'L03 pp92-93',
    samples: [{ dataBits: 8, stopBits: 1, rate: 2400, chars: 480 }],
    params: function (rng) {
      var frame = rng.pick([[8, 1], [8, 1], [7, 2]]);          // 10-bit frames: rates and times stay mental math (no calculator)
      return { dataBits: frame[0], stopBits: frame[1], rate: rng.pick([1200, 2400, 4800, 9600]), chars: rng.pick([120, 240, 480, 960]) };
    },
    build: function (p) {
      var pc = P(), f = pc.asyncFrame(p.dataBits, p.stopBits);
      var cps = pc.charsPerSecond(p.rate, p.dataBits, p.stopBits);
      var time = p.chars / cps;
      return {
        prompt: 'Characters of <b>' + p.dataBits + ' data bits</b> are sent asynchronously with one start bit and <b>' + p.stopBits + ' stop bit' + (p.stopBits > 1 ? 's' : '') +
          '</b> over a <b>' + si(p.rate, 'bps') + '</b> line, with no gaps. Find the bits per character frame, the efficiency, the characters per second, and the time to send ' + p.chars + ' characters.',
        inputs: [
          { id: 'frame', kind: 'num', label: 'Bits per frame', answer: f.frameBits, unit: '' },
          { id: 'eff', kind: 'num', label: 'Efficiency (ratio or %)', answer: f.efficiency, unit: '', accept: [f.efficiency * 100] },
          { id: 'cps', kind: 'num', label: 'Characters per second', answer: cps, unit: '' },
          { id: 't', kind: 'num', label: 'Time for ' + p.chars + ' characters', answer: time, unit: 's' }],
        steps: ['Each character is framed by 1 start bit (0) and ' + p.stopBits + ' stop bit' + (p.stopBits > 1 ? 's' : '') + ' (1): 1 + ' + p.dataBits + ' + ' + p.stopBits + ' = <b>' + f.frameBits + ' bits</b>.' + ref('L03 p92'),
          'Efficiency = data bits / frame bits = ' + p.dataBits + '/' + f.frameBits + ' = <b>' + KIT.fmt.pct(f.efficiency, 3) + '</b> (the rest is framing overhead).',
          'Characters per second = ' + si(p.rate, 'bps') + ' / ' + f.frameBits + ' = <b>' + num(cps) + '</b>.',
          'Time = ' + p.chars + ' / ' + num(cps) + ' = <b>' + si(time, 's') + '</b>.'],
        hints: ['Count every framing bit — they travel on the line too.']
      };
    }
  });

  /* ---------- draw the quantized samples as a staircase  [L03 pp64, 72–76] ---------- */
  KIT.gen.register('l03b.sketch', {
    topic: 'l03b', title: 'Draw the quantized samples (staircase)', level: 2, ref: 'L03 pp72-76; L03 p81',
    samples: [{ L: 4, vmax: 4, values: [1.3, 3.2, 2.5, -0.6, -2.7, -3.6] }],
    params: function (rng) {
      var vmax = rng.pick([4, 8]), L = 4, d = 2 * vmax / L, values = [];
      for (var i = 0; i < 6; i++) {
        var k = rng.int(0, L - 1), frac = rng.pick([0.15, 0.3, 0.45, 0.6, 0.85]);   // inside zone k, never on a boundary
        values.push(Math.round((-vmax + (k + frac) * d) * 10) / 10);
      }
      return { L: L, vmax: vmax, values: values };
    },
    build: function (p) {
      var q = P().quantizeSeries(p.values, -p.vmax, p.vmax, p.L), z = P().zones(-p.vmax, p.vmax, p.L), n = p.values.length;
      var bounds = [-p.vmax].concat(z.zones.map(function (o) { return o.hi; })), mids = z.zones.map(function (o) { return o.mid; });
      return {
        prompt: 'A signal between <b>' + v(-p.vmax) + '</b> and <b>' + v(p.vmax) + '</b> is quantized into <b>L = ' + p.L + '</b> zones (zone height Δ = ' + v(z.delta) + '). ' +
          'Its samples at t<sub>1</sub> … t<sub>' + n + '</sub> are <b>' + p.values.map(function (x) { return num(x); }).join(', ') + ' V</b>. ' +
          'Draw the quantized signal: each sample moved to its zone midpoint and held until the next sample.',
        inputs: [{ id: 'q', kind: 'sketch', label: 'Quantized signal',
          axes: { x: [1, n + 1], y: [-1.1 * p.vmax, 1.1 * p.vmax], yTicks: bounds, ySub: mids, yFormat: function (x) { return num(x); },   // solid zone edges, dashed midpoints
            xTicks: q.map(function (o, i) { return i + 1; }), xFormat: function (t) { return 't' + t; } },
          model: { series: [{ kind: 'step', data: q.map(function (o, i) { return [i + 1, o.mid]; }), until: n + 1 },
            { kind: 'points', data: p.values.map(function (x, i) { return [i + 1, x]; }) }] },
          rubric: [{ pts: 3, point: 'Each sample moved to its zone midpoint: ' + q.map(function (o) { return num(o.value) + ' → ' + num(o.mid); }).join(', ') + ' V.' },
            { pts: 2, point: 'Flat steps: each value held for one sample interval (a staircase that changes only at the sampling instants).' }] }],
        steps: ['Zone height Δ = (max − min)/L = (' + num(p.vmax) + ' − (−' + num(p.vmax) + '))/' + p.L + ' = <b>' + v(z.delta) + '</b>; the zone midpoints are ' +
            z.zones.map(function (o) { return num(o.mid); }).join(', ') + ' V.' + ref('L03 p72'),
          'Each sample goes to the midpoint of its zone: ' + q.map(function (o) { return num(o.value) + ' → <b>' + num(o.mid) + '</b>'; }).join(', ') + '.' + ref('L03 p76'),
          'Holding each value until the next sample arrives (as the decoder\'s hold circuit does) turns the samples into a staircase.' + ref('L03 p81')],
        hints: ['Draw the zone boundaries first (every Δ volts); each sample then goes to the middle of the zone it falls in.']
      };
    }
  });

})();
