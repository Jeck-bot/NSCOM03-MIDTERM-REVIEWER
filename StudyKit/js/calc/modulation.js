/* L04 Digital-to-Analog calculations. Pure, deterministic, SI base units (bps, baud, Hz, degrees).
   Owner: Lead (golden slice). Tests: test/calc.modulation.test.js */
(function () {
  'use strict';

  var CONV = {
    baud: 'S = N × 1/r (baud); N = bit rate (bps), r = data bits per signal element. For analog transmission of digital data, S ≤ N. [L04 p5]',
    levels: 'r = log₂ L ⇒ L = 2^r (L = number of distinct signal elements/levels). [L04 p7]',
    ask: 'ASK (and PSK) bandwidth B = (1 + d) × S, with 0 ≤ d ≤ 1 set by modulation and filtering; BASK has r = 1 so S = N. [L04 p9; L04 p10; L04 p21]',
    fsk: 'BFSK: bit 1 → f1 = fc + Δf, bit 0 → f2 = fc − Δf; B = (1 + d) × S + 2Δf, where 2Δf = f1 − f2. [L04 p14; L04 p15]',
    mfsk: 'MFSK: B = (1 + d) × S + (L − 1) × 2Δf (the slide prints "(L−1)/2Δf" by mistake); with d = 0 and spacing 2Δf = S this is B = L × S, as in the slide example. [L04 p18; L04 p19]',
    qpsk: 'QPSK: the first bit of each pair drives the in-phase (I) carrier, the second the quadrature (Q) carrier: 11 → 45°, 01 → 135°, 00 → −135°, 10 → −45°. [L04 p25; L04 p29]',
    carrier: 'Put the carrier in the middle of the available band: fc = (f_low + f_high) / 2. [L04 p12]',
    duplex: 'Full duplex splits the band in two equal halves, one carrier per direction (200–300 kHz → carriers 225 and 275 kHz). [L04 p13]',
    qam: '16-QAM labels follow the slide applet (L04 p31): first two bits pick the quadrant (00 = I, 10 = II, 11 = III, 01 = IV); I and Q take ±25% / ±75% (here ±1 / ±3 units).'
  };

  function log2(x) { return Math.log(x) / Math.LN2; }
  function round12(x) { return Number(x.toPrecision(12)); }

  /** S = N / r */
  function baud(N, r) { return round12(N / r); }
  /** N = S × r */
  function bitRate(S, r) { return round12(S * r); }
  /** r = N / S */
  function bitsPerElement(N, S) { return round12(N / S); }
  /** L = 2^r */
  function levels(r) { return Math.pow(2, r); }
  /** r = log₂ L */
  function bitsPerLevel(L) { return round12(log2(L)); }

  function askBandwidth(S, d) { return round12((1 + d) * S); }
  function pskBandwidth(S, d) { return askBandwidth(S, d); }
  function fskBandwidth(S, d, twoDf) { return round12((1 + d) * S + twoDf); }
  function mfskBandwidth(L, S, d, twoDf) { return round12((1 + d) * S + (L - 1) * twoDf); }
  function carrier(fLow, fHigh) { return round12((fLow + fHigh) / 2); }

  /** Binary ASK (r = 1) in an available band [fLow, fHigh]. */
  function askInBand(fLow, fHigh, d) {
    var B = round12(fHigh - fLow);
    var S = round12(B / (1 + d));
    return { fc: carrier(fLow, fHigh), B: B, S: S, N: bitRate(S, 1) };
  }

  /** Binary FSK in a band with carrier spacing 2Δf. */
  function fskInBand(fLow, fHigh, d, twoDf) {
    var B = round12(fHigh - fLow);
    var fc = carrier(fLow, fHigh);
    var S = round12((B - twoDf) / (1 + d));
    return { fc: fc, B: B, S: S, N: bitRate(S, 1), freqs: { f1: round12(fc + twoDf / 2), f0: round12(fc - twoDf / 2) } };
  }

  /** Split a band for full duplex: two equal halves, carrier at each half's middle. */
  function duplexSplit(fLow, fHigh) {
    var each = round12((fHigh - fLow) / 2);
    return { each: each, carriers: [carrier(fLow, fLow + each), carrier(fLow + each, fHigh)] };
  }

  /** MFSK with r bits per element; minimum spacing 2Δf = S and d = 0 (slide example). */
  function mfsk(N, r, fc, d, spacing) {
    d = d || 0;
    var L = levels(r), S = baud(N, r);
    var sp = spacing === undefined ? S : spacing;
    var carriers = [];
    for (var i = 0; i < L; i++) carriers.push(round12(fc + (i - (L - 1) / 2) * sp));
    return { L: L, S: S, spacing: sp, B: mfskBandwidth(L, S, d, sp), carriers: carriers };
  }

  var BITS_PER = { bask: 1, ook: 1, bfsk: 1, bpsk: 1, qpsk: 2, '4qam': 2, '8qam': 3, '16qam': 4, '64qam': 6 };
  /** PSK/QAM family: S = N/r, B = (1 + d)S. */
  function multilevel(scheme, N, d) {
    var r = BITS_PER[scheme];
    if (!r) throw new Error('Unknown scheme ' + scheme);
    var S = baud(N, r);
    return { r: r, L: levels(r), S: S, B: pskBandwidth(S, d || 0) };
  }

  function polar(i, q) {
    var amp = round12(Math.sqrt(i * i + q * q));
    var ph = Math.atan2(q, i) * 180 / Math.PI;
    if (Math.abs(ph) < 1e-12) ph = 0;
    var ph360 = ph < 0 ? ph + 360 : ph;
    return { amp: amp, phase: round12(ph), phase360: round12(ph360) };
  }

  // 16-QAM per L04 p31, rows from Q = +3 down to Q = −3, columns I = −3, −1, +1, +3.
  var QAM16 = [
    ['1011', '1001', '0010', '0011'],
    ['1010', '1000', '0000', '0001'],
    ['1101', '1100', '0100', '0110'],
    ['1111', '1110', '0101', '0111']
  ];
  var AXIS = [-3, -1, 1, 3], ROWQ = [3, 1, -1, -3];

  function constellation(scheme) {
    var pts = [];
    function add(bits, i, q) { var p = polar(i, q); pts.push({ bits: bits, i: i, q: q, amp: p.amp, phase: p.phase, phase360: p.phase360 }); }
    switch (scheme) {
      case 'ook': case 'bask': add('0', 0, 0); add('1', 1, 0); break;
      case 'bpsk': add('0', -1, 0); add('1', 1, 0); break;
      case 'qpsk': case '4qam':
        ['00', '01', '10', '11'].forEach(function (b) { add(b, b.charAt(0) === '1' ? 1 : -1, b.charAt(1) === '1' ? 1 : -1); });
        break;
      case '16qam':
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) add(QAM16[r][c], AXIS[c], ROWQ[r]);
        break;
      default: throw new Error('Unknown constellation ' + scheme);
    }
    return pts;
  }

  function point(scheme, bits) {
    var p = constellation(scheme).filter(function (x) { return x.bits === String(bits); })[0];
    if (!p) throw new Error('No point "' + bits + '" in ' + scheme);
    return p;
  }

  /** Time-domain waveform for drawings: one symbol per unit of t, amplitude ≤ 1. Carriers run 3 cycles per symbol;
      BFSK uses 4 cycles for a 1 (f1 = fc + Δf) and 2 for a 0 (f2 = fc − Δf). → { fn(t), symbols } */
  function waveform(scheme, bits) {
    var r = { ook: 1, bfsk: 1, bpsk: 1, qpsk: 2, '16qam': 4 }[scheme] || 1, syms = [], TAU = 2 * Math.PI, cyc = 3;
    for (var i = 0; i + r <= bits.length; i += r) syms.push(bits.substr(i, r));
    function fn(t) {
      var k = Math.max(0, Math.min(syms.length - 1, Math.floor(t))), s = syms[k], u = t - k;
      if (scheme === 'ook') return s === '1' ? Math.sin(TAU * cyc * u) : 0;            // L04 p8: a 1 sends the carrier, a 0 nothing
      if (scheme === 'bfsk') return Math.sin(TAU * (s === '1' ? 4 : 2) * u);             // L04 p14
      if (scheme === 'bpsk') return Math.sin(TAU * cyc * u + (s === '1' ? 0 : Math.PI)); // L04 p22: 1 = 0°, 0 = 180°
      var p = point(scheme, s), sc = scheme === '16qam' ? 3 * Math.SQRT2 : Math.SQRT2;
      return (p.i * Math.cos(TAU * cyc * u) - p.q * Math.sin(TAU * cyc * u)) / sc;
    }
    return { fn: fn, symbols: syms };
  }

  KIT.calc.modulation = {
    waveform: waveform,
    CONV: CONV,
    baud: baud, bitRate: bitRate, bitsPerElement: bitsPerElement, levels: levels, bitsPerLevel: bitsPerLevel,
    askBandwidth: askBandwidth, pskBandwidth: pskBandwidth, fskBandwidth: fskBandwidth, mfskBandwidth: mfskBandwidth,
    carrier: carrier, askInBand: askInBand, fskInBand: fskInBand, duplexSplit: duplexSplit, mfsk: mfsk,
    multilevel: multilevel, polar: polar, constellation: constellation, point: point, BITS_PER: BITS_PER
  };
})();
