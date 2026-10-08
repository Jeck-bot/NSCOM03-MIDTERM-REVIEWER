/* L04 problem generators (golden slice — copy this pattern). Owner: Lead.
   Rules: params(rng) uses ONLY rng and returns plain data; build(p) is pure and returns
   {prompt, inputs[], steps[], hints[]?, key?}. Every number comes from KIT.calc.modulation. */
(function () {
  'use strict';
  function M() { return KIT.calc.modulation; }
  function si(x, unit, sig) { return KIT.fmt.si(x, unit, sig || 4); }
  function num(x, sig) { return KIT.fmt.num(x, sig || 6); }

  /* ---------- 1. bit rate / baud rate / levels  [L04 pp5–7] ---------- */
  KIT.gen.register('l04.rates', {
    topic: 'l04', title: 'Bit rate, baud rate and levels', level: 1, ref: 'L04 pp5-7',
    samples: [{ find: 'N', S: 1000, r: 4 }, { find: 'rL', N: 8000, S: 1000 }, { find: 'S', N: 9600, L: 16 }],
    params: function (rng) {
      var r = rng.pick([1, 2, 3, 4, 5, 6, 8]);
      var S = rng.pick([500, 1000, 1200, 2400, 4000, 8000, 10000, 125000, 1e6]);
      var find = rng.pick(['N', 'rL', 'S']);
      if (find === 'rL') return { find: 'rL', N: S * r, S: S };
      if (find === 'S') return { find: 'S', N: S * r, L: Math.pow(2, r) };
      return { find: 'N', S: S, r: r };
    },
    build: function (p) {
      var m = M();
      if (p.find === 'N') {
        var N = m.bitRate(p.S, p.r);
        return {
          prompt: 'An analog signal carries <b>' + p.r + ' bit' + (p.r > 1 ? 's' : '') + '</b> in each signal element. If <b>' +
            num(p.S) + '</b> signal elements are sent per second, find the bit rate.',
          inputs: [{ id: 'N', kind: 'num', label: 'Bit rate N', answer: N, unit: 'bps' }],
          steps: ['Given: r = ' + p.r + ' bits per signal element, S = ' + si(p.S, 'baud') + '.',
            'S = N × 1/r, so N = S × r. <span class="chip ref">L04 p5</span>',
            'N = ' + num(p.S) + ' × ' + p.r + ' = <b>' + si(N, 'bps') + '</b>.'],
          hints: ['Baud counts signal elements; each element carries r bits.']
        };
      }
      if (p.find === 'rL') {
        var r = m.bitsPerElement(p.N, p.S), L = m.levels(r);
        return {
          prompt: 'An analog signal has a bit rate of <b>' + si(p.N, 'bps') + '</b> and a baud rate of <b>' + si(p.S, 'baud') +
            '</b>. How many data elements are carried by each signal element? How many different signal elements (levels) do we need?',
          inputs: [
            { id: 'r', kind: 'num', label: 'r (bits per signal element)', answer: r, unit: '' },
            { id: 'L', kind: 'num', label: 'L (signal levels)', answer: L, unit: '' }],
          steps: ['S = N × 1/r, so r = N / S = ' + num(p.N) + ' / ' + num(p.S) + ' = <b>' + r + ' bits/baud</b>. <span class="chip ref">L04 p7</span>',
            'r = log₂ L, so L = 2<sup>r</sup> = 2<sup>' + r + '</sup> = <b>' + num(L) + '</b>.'],
          hints: ['First find r from N and S; then L = 2^r.']
        };
      }
      var rr = m.bitsPerLevel(p.L), S2 = m.baud(p.N, rr);
      return {
        prompt: 'A modem uses <b>' + p.L + '</b> different signal elements and sends <b>' + si(p.N, 'bps') + '</b>. What is its baud rate?',
        inputs: [{ id: 'S', kind: 'num', label: 'Baud rate S', answer: S2, unit: 'baud' }],
        steps: ['r = log₂ L = log₂ ' + p.L + ' = ' + rr + ' bits per signal element. <span class="chip ref">L04 p7</span>',
          'S = N × 1/r = ' + num(p.N) + ' / ' + rr + ' = <b>' + si(S2, 'baud') + '</b>. <span class="chip ref">L04 p5</span>'],
        hints: ['More levels → more bits per element → fewer elements per second for the same bit rate.']
      };
    }
  });

  /* ---------- 2. ASK / FSK / BPSK in an available band (± full duplex)  [L04 pp9–16, p21] ---------- */
  KIT.gen.register('l04.band', {
    topic: 'l04', title: 'ASK / FSK / PSK in an available band', level: 2, ref: 'L04 pp12-16',
    samples: [
      { scheme: 'ask', fLow: 200e3, fHigh: 300e3, d: 1 },                    // L04 p12
      { scheme: 'ask', fLow: 200e3, fHigh: 300e3, d: 1, duplex: true },      // L04 p13
      { scheme: 'fsk', fLow: 200e3, fHigh: 300e3, d: 1, twoDf: 50e3 }],      // L04 p16
    params: function (rng) {
      var scheme = rng.pick(['ask', 'ask', 'fsk', 'fsk', 'psk']);
      var d = rng.pick([0, 0.25, 0.5, 1]);
      var S = rng.pick([8e3, 10e3, 20e3, 24e3, 40e3, 50e3, 100e3]);   // clean baud rate, chosen first
      var twoDf = scheme === 'fsk' ? rng.pick([1, 2]) * S : 0;
      if (((1 + d) * S + twoDf) / 2 % 1000 !== 0) d = 1;            // carriers on whole kHz (no calculator)
      var B = (1 + d) * S + twoDf;
      var duplex = scheme !== 'fsk' && rng.chance(0.3);
      var fLow = rng.pick([100e3, 200e3, 400e3, 500e3, 1e6]);
      var p = { scheme: scheme, fLow: fLow, fHigh: fLow + (duplex ? 2 * B : B), d: d };
      if (scheme === 'fsk') p.twoDf = twoDf;
      if (duplex) p.duplex = true;
      return p;
    },
    build: function (p) {
      var m = M();
      var name = { ask: 'ASK', fsk: 'FSK', psk: 'BPSK' }[p.scheme];
      var Btot = p.fHigh - p.fLow;
      var band = si(Btot, 'Hz') + ' which spans from ' + si(p.fLow, 'Hz') + ' to ' + si(p.fHigh, 'Hz');
      if (p.duplex) {
        var sp = m.duplexSplit(p.fLow, p.fHigh);
        var half = m.askInBand(p.fLow, p.fLow + sp.each, p.d);
        return {
          prompt: 'We have an available bandwidth of <b>' + band + '</b> for <b>full-duplex</b> communication using ' + name +
            ' with d = ' + p.d + '. Find the two carrier frequencies and the bit rate in each direction.',
          inputs: [
            { id: 'fc1', kind: 'num', label: 'Carrier 1 (lower)', answer: sp.carriers[0], unit: 'Hz' },
            { id: 'fc2', kind: 'num', label: 'Carrier 2 (upper)', answer: sp.carriers[1], unit: 'Hz' },
            { id: 'N', kind: 'num', label: 'Bit rate per direction', answer: half.N, unit: 'bps' }],
          steps: ['Full duplex splits the band in two: each direction gets ' + si(Btot, 'Hz') + ' / 2 = ' + si(sp.each, 'Hz') + '. <span class="chip ref">L04 p13</span>',
            'Each carrier sits in the middle of its half: f<sub>c1</sub> = <b>' + si(sp.carriers[0], 'Hz') + '</b>, f<sub>c2</sub> = <b>' + si(sp.carriers[1], 'Hz') + '</b>.',
            name + ': B = (1 + d) × S, and with r = 1, S = N. <span class="chip ref">' + (p.scheme === 'psk' ? 'L04 p21' : 'L04 p9') + '</span>',
            si(sp.each, 'Hz') + ' = (1 + ' + p.d + ') × S ⇒ S = ' + si(half.S, 'baud') + ' ⇒ N = <b>' + si(half.N, 'bps') + '</b> each way.'],
          hints: ['Halve the band first, then treat each half like a one-way ' + name + ' problem.']
        };
      }
      if (p.scheme === 'fsk') {
        var f = m.fskInBand(p.fLow, p.fHigh, p.d, p.twoDf);
        return {
          prompt: 'We have an available bandwidth of <b>' + band + '</b>. What should be the carrier frequency and the bit rate if we modulate our data with ' +
            '<b>FSK</b>, d = ' + p.d + ', and 2Δf = ' + si(p.twoDf, 'Hz') + '? Also give the frequencies used for bit 1 and bit 0.',
          inputs: [
            { id: 'fc', kind: 'num', label: 'Carrier f_c', answer: f.fc, unit: 'Hz' },
            { id: 'N', kind: 'num', label: 'Bit rate N', answer: f.N, unit: 'bps' },
            { id: 'f1', kind: 'num', label: 'f₁ (bit 1)', answer: f.freqs.f1, unit: 'Hz' },
            { id: 'f0', kind: 'num', label: 'f₂ (bit 0)', answer: f.freqs.f0, unit: 'Hz' }],
          steps: ['Middle of the band: f<sub>c</sub> = (' + si(p.fLow, 'Hz') + ' + ' + si(p.fHigh, 'Hz') + ') / 2 = <b>' + si(f.fc, 'Hz') + '</b>. <span class="chip ref">L04 p16</span>',
            'FSK: B = (1 + d) × S + 2Δf. <span class="chip ref">L04 p15</span>',
            si(Btot, 'Hz') + ' = (1 + ' + p.d + ') × S + ' + si(p.twoDf, 'Hz') + ' ⇒ S = (' + si(Btot, 'Hz') + ' − ' + si(p.twoDf, 'Hz') + ') / ' + num(1 + p.d) + ' = ' + si(f.S, 'baud') + '.',
            'Binary FSK has r = 1, so N = S = <b>' + si(f.N, 'bps') + '</b>.',
            'Bit 1 → f<sub>c</sub> + Δf = <b>' + si(f.freqs.f1, 'Hz') + '</b>; bit 0 → f<sub>c</sub> − Δf = <b>' + si(f.freqs.f0, 'Hz') + '</b>. <span class="chip ref">L04 p14</span>'],
          hints: ['Subtract 2Δf from the bandwidth before dividing by (1 + d).']
        };
      }
      var a = m.askInBand(p.fLow, p.fHigh, p.d);
      return {
        prompt: 'We have an available bandwidth of <b>' + band + '</b>. What are the carrier frequency and the bit rate if we modulate our data using <b>' +
          name + '</b> with d = ' + p.d + '?',
        inputs: [
          { id: 'fc', kind: 'num', label: 'Carrier f_c', answer: a.fc, unit: 'Hz' },
          { id: 'N', kind: 'num', label: 'Bit rate N', answer: a.N, unit: 'bps' }],
        steps: ['The carrier goes in the middle of the band: f<sub>c</sub> = (' + si(p.fLow, 'Hz') + ' + ' + si(p.fHigh, 'Hz') + ') / 2 = <b>' + si(a.fc, 'Hz') + '</b>. <span class="chip ref">L04 p12</span>',
          name + ': B = (1 + d) × S. <span class="chip ref">' + (p.scheme === 'psk' ? 'L04 p21' : 'L04 p9') + '</span>',
          si(Btot, 'Hz') + ' = (1 + ' + p.d + ') × S ⇒ S = ' + si(a.S, 'baud') + '.',
          'Binary ' + name + ' carries r = 1 bit per element, so N = S = <b>' + si(a.N, 'bps') + '</b>.'],
        hints: ['Bandwidth depends on the baud rate S, not directly on the bit rate.']
      };
    }
  });

  /* ---------- 3. multilevel: QPSK / 16-QAM / MFSK  [L04 pp18–26] ---------- */
  KIT.gen.register('l04.mlevel', {
    topic: 'l04', title: 'Multilevel modulation: QPSK, 16-QAM, MFSK', level: 2, ref: 'L04 pp18-26',
    samples: [{ scheme: 'mfsk', N: 3e6, r: 3, fc: 10e6 }, { scheme: 'qpsk', N: 12e6, d: 0 }],
    params: function (rng) {
      var scheme = rng.pick(['qpsk', 'qpsk', '16qam', 'mfsk', 'mfsk']);
      if (scheme === 'mfsk') {
        var r = rng.pick([2, 3, 4]);
        var S = rng.pick([250e3, 500e3, 1e6, 2e6]), band = Math.pow(2, r) * S;          // B = L × S
        return { scheme: 'mfsk', N: r * S, r: r, fc: rng.pick([5e6, 10e6, 20e6, 50e6, 100e6].filter(function (f) { return f >= band; })) };   // lowest carrier stays > 0
      }
      var bits = scheme === 'qpsk' ? 2 : 4;
      return { scheme: scheme, N: bits * rng.pick([1e6, 1.5e6, 2e6, 3e6, 6e6, 10e6]), d: rng.pick([0, 0, 0.5, 1]) };
    },
    build: function (p) {
      var m = M();
      if (p.scheme === 'mfsk') {
        var f = m.mfsk(p.N, p.r, p.fc);
        return {
          prompt: 'We need to send data <b>' + p.r + ' bits at a time</b> at a bit rate of <b>' + si(p.N, 'bps') + '</b>. The carrier frequency is <b>' +
            si(p.fc, 'Hz') + '</b>. Using MFSK with the minimum carrier spacing (2Δf = S) and d = 0, calculate the number of levels (different frequencies), ' +
            'the baud rate, the bandwidth, and the lowest and highest carrier frequencies.',
          inputs: [
            { id: 'L', kind: 'num', label: 'L (frequencies)', answer: f.L, unit: '' },
            { id: 'S', kind: 'num', label: 'Baud rate S', answer: f.S, unit: 'baud' },
            { id: 'B', kind: 'num', label: 'Bandwidth B', answer: f.B, unit: 'Hz' },
            { id: 'fmin', kind: 'num', label: 'Lowest carrier', answer: f.carriers[0], unit: 'Hz' },
            { id: 'fmax', kind: 'num', label: 'Highest carrier', answer: f.carriers[f.L - 1], unit: 'Hz' }],
          steps: ['L = 2<sup>r</sup> = 2<sup>' + p.r + '</sup> = <b>' + f.L + '</b> frequencies. <span class="chip ref">L04 p19</span>',
            'S = N / r = ' + si(p.N, 'bps') + ' / ' + p.r + ' = <b>' + si(f.S, 'baud') + '</b>, so the carriers are 2Δf = ' + si(f.spacing, 'Hz') + ' apart.',
            'B = (1 + d) × S + (L − 1) × 2Δf = ' + si(f.S, 'Hz') + ' + ' + (f.L - 1) + ' × ' + si(f.spacing, 'Hz') + ' = <b>' + si(f.B, 'Hz') + '</b> (= L × S). <span class="chip ref">L04 p18</span>',
            'The ' + f.L + ' carriers sit symmetrically around f<sub>c</sub>: from <b>' + si(f.carriers[0], 'Hz') + '</b> to <b>' + si(f.carriers[f.L - 1], 'Hz') + '</b>. <span class="chip ref">L04 p20</span>'],
          hints: ['With the minimum spacing, each carrier occupies one baud-rate-wide slot, so B = L × S.']
        };
      }
      var res = m.multilevel(p.scheme, p.N, p.d);
      var name = p.scheme === 'qpsk' ? 'QPSK' : '16-QAM';
      return {
        prompt: 'Find the baud rate and the bandwidth for a signal transmitting at <b>' + si(p.N, 'bps') + '</b> using <b>' + name + '</b>. The value of d = ' + p.d + '.',
        inputs: [
          { id: 'S', kind: 'num', label: 'Baud rate S', answer: res.S, unit: 'baud' },
          { id: 'B', kind: 'num', label: 'Bandwidth B', answer: res.B, unit: 'Hz' }],
        steps: [name + ' carries r = log₂ ' + res.L + ' = ' + res.r + ' bits per signal element. <span class="chip ref">' + (p.scheme === 'qpsk' ? 'L04 p24' : 'L04 p30') + '</span>',
          'S = N × 1/r = ' + si(p.N, 'bps') + ' / ' + res.r + ' = <b>' + si(res.S, 'baud') + '</b>. <span class="chip ref">L04 p26</span>',
          (p.scheme === '16qam' ? 'QAM combines ASK and PSK (slide 30), so it needs the same bandwidth: ' : '') + 'B = (1 + d) × S = ' + num(1 + p.d) + ' × ' + si(res.S, 'Hz') + ' = <b>' + si(res.B, 'Hz') + '</b>. <span class="chip ref">' + (p.scheme === '16qam' ? 'Forouzan' : 'L04 p26') + '</span>'],
        hints: ['Convert bits to signal elements first; the bandwidth follows the baud rate.']
      };
    }
  });

  /* ---------- 4. reading a constellation  [L04 pp25–31] ---------- */
  KIT.gen.register('l04.constellation', {
    topic: 'l04', title: 'Read a constellation diagram', level: 1, ref: 'L04 pp27-31',
    samples: [{ scheme: 'qpsk', bits: '01', ask: 'phase' }, { scheme: '16qam', bits: '1100', ask: 'bits' }],
    params: function (rng) {
      var scheme = rng.pick(['qpsk', 'qpsk', '16qam', '16qam', 'bpsk']);
      var pts = KIT.calc.modulation.constellation(scheme), ask = rng.pick(['phase', 'bits']);
      // 16-QAM phases off the diagonals need an arctangent: ask those points for their bits only (no calculator)
      if (scheme === '16qam' && ask === 'phase') pts = pts.filter(function (pt) { return Math.abs(pt.i) === Math.abs(pt.q); });
      return { scheme: scheme, bits: rng.pick(pts).bits, ask: ask };
    },
    build: function (p) {
      var m = M();
      var pt = m.point(p.scheme, p.bits);
      var name = { qpsk: 'QPSK', '16qam': '16-QAM', bpsk: 'BPSK', ook: 'OOK' }[p.scheme];
      var unit = p.scheme === '16qam' ? ' (1 unit = 25% of full scale)' : '';
      var where = 'I = ' + (pt.i > 0 ? '+' : '') + pt.i + ', Q = ' + (pt.q > 0 ? '+' : '') + pt.q;
      var ref = p.scheme === '16qam' ? 'L04 p31' : 'L04 p29';
      var key = function () { return KIT.draw.constellation ? KIT.draw.constellation(p.scheme, { highlight: p.bits }) : document.createElement('div'); };
      if (p.ask === 'bits') {
        return {
          prompt: 'Using the ' + name + ' constellation from the slides' + unit + ', which bit pattern is sent by the point at <b>' + where + '</b>?',
          inputs: [{ id: 'bits', kind: 'bits', label: 'Bits', answer: p.bits }],
          steps: [p.scheme === '16qam'
            ? 'In the slide\'s 16-QAM, the first two bits pick the quadrant (00 = I, 10 = II, 11 = III, 01 = IV) and the last two pick the point inside it. <span class="chip ref">L04 p31</span>'
            : p.scheme === 'bpsk' ? 'BPSK: bit 1 is phase 0° (on +I), bit 0 is phase 180° (on −I). <span class="chip ref">L04 p22</span> <span class="chip ref">L04 p29</span>'
            : 'Slide mapping: the first bit drives the in-phase (I) carrier, the second the quadrature (Q) carrier; bit 1 → +, bit 0 → −. <span class="chip ref">L04 p25</span>',
          'The point ' + where + ' carries <b>' + p.bits + '</b>.'],
          key: key
        };
      }
      var alt = pt.phase < 0 ? [pt.phase360] : (pt.phase === 180 ? [-180] : []);
      return {
        prompt: 'In the slides\' ' + name + ' constellation' + unit + ', what is the <b>phase</b> of the signal element that carries <b>' + p.bits + '</b>?',
        inputs: [{ id: 'phase', kind: 'num', label: 'Phase', answer: pt.phase, unit: '°', rel: false, tol: 0.5, accept: alt }],
        steps: ['Locate ' + p.bits + ': it sits at ' + where + '. <span class="chip ref">' + ref + '</span>',
          'The angle from the +I axis is the phase: atan2(Q, I) = <b>' + num(pt.phase, 4) + '°</b>' + (pt.phase < 0 ? ' (same as ' + num(pt.phase360, 4) + '°)' : '') + '.',
          'Its distance from the origin is the amplitude: √(I² + Q²) = ' + num(pt.amp, 4) + ' units. <span class="chip ref">L04 p28</span>'],
        key: key
      };
    }
  });

  /* ---------- draw an ASK / FSK / PSK signal for a bit string  [L04 pp8–22] ---------- */
  var SKETCH = {
    ook: { name: 'binary ASK', rule: 'a 1 sends the carrier, a 0 sends no signal (amplitude 0)', ref: 'L04 p8',
      say: function (b) { return b === '1' ? 'carrier' : 'nothing'; },
      rubric: ['Every 1-bit is the carrier at full amplitude.', 'Every 0-bit is a flat line at 0 (no signal).', 'The same number of carrier cycles in every 1-bit.'] },
    bfsk: { name: 'binary FSK', rule: 'a 1 uses the higher frequency f<sub>1</sub> = f<sub>c</sub> + Δf, a 0 the lower frequency f<sub>2</sub> = f<sub>c</sub> − Δf (draw about 4 cycles per bit for f<sub>1</sub> and 2 for f<sub>2</sub>)', ref: 'L04 p14',
      say: function (b) { return b === '1' ? 'f1 (fast)' : 'f2 (slow)'; },
      rubric: ['Every 1-bit uses the higher frequency f1 (more cycles per bit).', 'Every 0-bit uses the lower frequency f2 (fewer cycles per bit).', 'The amplitude is the same in every bit.'] },
    bpsk: { name: 'binary PSK', rule: 'a 1 is the carrier at phase 0°, a 0 is the carrier shifted 180° (draw about 3 cycles per bit)', ref: 'L04 p22',
      say: function (b) { return b === '1' ? '0°' : '180°'; },
      rubric: ['Every 1-bit starts at 0 going up (phase 0°).', 'Every 0-bit starts at 0 going down (phase 180°).', 'The phase flips at each 0↔1 boundary; amplitude and frequency stay the same.'] }
  };
  KIT.gen.register('l04.sketch', {
    topic: 'l04', title: 'Draw an ASK / FSK / PSK signal', level: 1, ref: 'L04 pp8-22',
    samples: [{ scheme: 'ook', bits: '1011' }, { scheme: 'bfsk', bits: '10110' }, { scheme: 'bpsk', bits: '0110' }],
    params: function (rng) {
      var scheme = rng.pick(['ook', 'bfsk', 'bpsk']), bits = rng.bits(rng.pick([4, 5]));
      while (!/0/.test(bits) || !/1/.test(bits)) bits = rng.bits(bits.length);
      return { scheme: scheme, bits: bits };
    },
    build: function (p) {
      var c = SKETCH[p.scheme], wv = M().waveform(p.scheme, p.bits), n = p.bits.length, weights = [2, 2, 1];
      return {
        prompt: 'Draw the <b>' + c.name + '</b> signal for the bits <b class="mono">' + p.bits + '</b>: ' + c.rule + '.',
        inputs: [{ id: 'wave', kind: 'sketch', label: c.name.charAt(0).toUpperCase() + c.name.slice(1) + ' for ' + p.bits,
          axes: { x: [0, n], y: [-1.4, 1.4], yTicks: [-1, 0, 1], yFormat: function (x) { return x === 0 ? '0' : x > 0 ? '+A' : '−A'; }, bits: p.bits },
          model: { series: [{ kind: 'fn', fn: wv.fn, samples: n * 160 }] },
          rubric: c.rubric.map(function (r, i) { return { pts: weights[i], point: r }; }) }],
        steps: ['The rule for ' + c.name + ': ' + c.rule + '. <span class="chip ref">' + c.ref + '</span>',
          'Bit by bit: ' + p.bits.split('').map(function (b) { return b + ' → ' + c.say(b); }).join(', ') + '.',
          'A binary scheme carries one bit per signal element (r = 1), so every bit cell has the same width.'],
        hints: ['Mark the bit cells first, then decide for each bit what happens to the carrier.']
      };
    }
  });

})();
