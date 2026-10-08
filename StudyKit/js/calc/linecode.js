/* L03a line coding, block coding and scrambling. Pure and deterministic (levels are +1 / 0 / −1 for the polar and
   bipolar families, ±1 / ±3 for 2B1Q). Owner: O2. Tests: test/calc.linecode.test.js (slide oracles + invariants).
   Every convention below was checked against the slide figures (docs/source-digest.md, Part 1, L03). */
(function () {
  'use strict';

  var CONV = {
    baud: 'S = c × N × 1/r (baud): N = data rate (bps), r = data elements per signal element, c = case factor (worst 1, best 0, average 1/2). ' +
      'Example 3 writes the reciprocal 1/r as R. The minimum bandwidth equals the average signal rate: Bmin = S. [L03 p8; L03 p9; L03 p25]',
    drift: 'A receiver clock x% faster than the sender clock reads N × (1 + x/100) bps: 0.1% at 1 kbps → 1001 bps (1 extra); at 1 Mbps → 1,001,000 bps ' +
      '(1000 extra). A slow clock loses bits instead. [L03 p13; L03 p14]',
    unipolar: 'Unipolar NRZ: 1 = +V, 0 = 0 V (every level on one side of the time axis); normalized power ½V². [L03 p20; L03 p21]',
    nrzl: 'NRZ-L follows the p23 FIGURE: 0 = +V, 1 = −V (the p22 text says +V for 1 — a contradiction; the polarity is only a convention, so the mirror image is accepted). [L03 p22; L03 p23]',
    nrzi: 'NRZ-I: a 1 inverts the level at the start of the bit, a 0 does not; the level before the first bit is +V. Bits 01001110 → + − − − + − + +. [L03 p22; L03 p23]',
    rz: 'RZ: 1 = +V then 0 V, 0 = −V then 0 V (a transition to zero in the middle of every bit); r = 1/2, S_avg = N. [L03 p26; L03 p27]',
    manchester: 'Manchester follows the p29 FIGURE: 0 = high→low, 1 = low→high, a transition in the middle of every bit (the p5 text lists the reverse). [L03 p5; L03 p28; L03 p29]',
    dmanchester: 'Differential Manchester: always a transition in the middle of the bit; a 0 also has a transition at the START of the bit, a 1 does not; the level before the first bit is +V. [L03 p28; L03 p29]',
    ami: 'AMI: 0 = 0 V; the 1s alternate +V / −V and the first 1 is +V. [L03 p31; L03 p32]',
    pseudoternary: 'Pseudoternary (low priority: handwritten "not included" on p32) is the reverse of AMI: 1 = 0 V; the 0s alternate +V / −V and the first 0 is +V. [L03 p31; L03 p32]',
    mbnl: 'mBnL: a pattern of m data bits becomes a pattern of n signal elements with L levels (B = 2, T = 3, Q = 4 levels); it is valid only if 2^m ≤ L^n, and r = m/n. [L03 p34; L03 p35; L03 p36; L03 p37]',
    '2b1q': '2B1Q: each pair of bits becomes one of four levels by the transition table; the previous level is taken as positive at the start. Previous positive / negative: ' +
      '00 → +1 / −1, 01 → +3 / −3, 10 → −1 / +1, 11 → −3 / +3. r = 2 (the p38 box prints 1/2), S_avg = N/4. [L03 p38]',
    mlt3: 'MLT-3: a 0 keeps the level; a 1 moves round the cycle 0 → +V → 0 → −V (from ±V to 0; from 0 to the opposite of the last nonzero level). Start at 0 with the last nonzero level −V, so the first 1 goes to +V. [L03 p44]',
    summary: 'Average bandwidth (p46): NRZ N/2; NRZ-L N/2; NRZ-I N/2; biphase N; AMI N/2; 2B1Q N/4; 8B6T 3N/4; 4D-PAM5 N/8; MLT-3 N/3. [L03 p46]',
    block4b5b: '4B/5B: each 4-bit group is replaced by the 5-bit word of the p51 table, so the stream becomes N × 5/4 and never has more than three 0s in a row. [L03 p48; L03 p51; L03 p53; L03 p54]',
    b8zs: 'B8ZS: eight consecutive 0s → 000VB0VB (V = same polarity as the previous pulse, a violation; B = the bipolar rule). Previous + → 000+−0−+; previous − → 000−+0+−. [L03 p59]',
    hdb3: 'HDB3: four consecutive 0s → 000V if the number of nonzero pulses since the last substitution is odd, B00V if it is even (so the total is even). [L03 p60; L03 p61]'
  };

  var hasOwn = Object.prototype.hasOwnProperty;
  function round12(x) { var r = Number(x.toPrecision(12)); return r === 0 ? 0 : r; }
  function neg(v) { return v === 0 ? 0 : -v; }
  function sign(v) { return v > 0 ? 1 : -1; }

  function checkBits(bits, what) {
    if (typeof bits !== 'string' || !/^[01]*$/.test(bits)) throw new Error((what || 'bits') + ' must be a string of 0s and 1s');
    return bits;
  }
  function checkPolarity(p, name) {
    if (p !== 1 && p !== -1) throw new Error((name || 'prevPolarity') + ' must be +1 or -1 (a polarity)');
    return p;
  }
  function polarityOpt(o, key, dflt) { return o[key] === undefined ? dflt : checkPolarity(o[key], key); }

  /* ---------------- scheme registry ---------------- */
  var NAMES = {
    unipolar: 'Unipolar NRZ', nrzl: 'NRZ-L', nrzi: 'NRZ-I', rz: 'RZ', manchester: 'Manchester', dmanchester: 'Differential Manchester',
    ami: 'AMI', pseudoternary: 'Pseudoternary', '2b1q': '2B1Q', mlt3: 'MLT-3', '8b6t': '8B6T', '4dpam5': '4D-PAM5'
  };
  // cpb = signal cells per data bit; allowed = levels a student may draw; levelSet = display rows (top → bottom, with the 0 axis);
  // inverse = whether the mirror image is an acceptable answer (polarity is only a convention).
  var SCHEMES = {
    unipolar: { cpb: 1, allowed: [1, 0], levelSet: [1, 0], inverse: false },
    nrzl: { cpb: 1, allowed: [1, -1], levelSet: [1, 0, -1], inverse: true },
    nrzi: { cpb: 1, allowed: [1, -1], levelSet: [1, 0, -1], inverse: true },
    rz: { cpb: 2, allowed: [1, 0, -1], levelSet: [1, 0, -1], inverse: true },
    manchester: { cpb: 2, allowed: [1, -1], levelSet: [1, 0, -1], inverse: true },
    dmanchester: { cpb: 2, allowed: [1, -1], levelSet: [1, 0, -1], inverse: true },
    ami: { cpb: 1, allowed: [1, 0, -1], levelSet: [1, 0, -1], inverse: true },
    pseudoternary: { cpb: 1, allowed: [1, 0, -1], levelSet: [1, 0, -1], inverse: true },
    '2b1q': { cpb: 0.5, allowed: [3, 1, -1, -3], levelSet: [3, 1, 0, -1, -3], inverse: true },
    mlt3: { cpb: 1, allowed: [1, 0, -1], levelSet: [1, 0, -1], inverse: true }
  };
  function scheme(name) {
    if (typeof name !== 'string' || !hasOwn.call(SCHEMES, name)) throw new Error('Unknown line-coding scheme: ' + name);
    return SCHEMES[name];
  }

  /* 2B1Q transition table (previous level positive / negative) [L03 p38] */
  var TABLE_2B1Q = {
    positive: { '00': 1, '01': 3, '10': -1, '11': -3 },
    negative: { '00': -1, '01': -3, '10': 1, '11': 3 }
  };
  var PAIR_OF_2B1Q = { '1': '00', '3': '01', '-1': '10', '-3': '11' };   // level seen after a positive level → pair

  /* ---------------- encoders: bits → one level per cell ---------------- */
  var ENC = {
    unipolar: function (bits) { return bits.split('').map(function (b) { return b === '1' ? 1 : 0; }); },
    nrzl: function (bits) { return bits.split('').map(function (b) { return b === '0' ? 1 : -1; }); },
    nrzi: function (bits, o) {
      var cur = polarityOpt(o, 'start', 1), out = [];
      bits.split('').forEach(function (b) { if (b === '1') cur = -cur; out.push(cur); });
      return out;
    },
    rz: function (bits) {
      var out = [];
      bits.split('').forEach(function (b) { out.push(b === '1' ? 1 : -1, 0); });
      return out;
    },
    manchester: function (bits) {
      var out = [];
      bits.split('').forEach(function (b) { if (b === '0') out.push(1, -1); else out.push(-1, 1); });
      return out;
    },
    dmanchester: function (bits, o) {
      var cur = polarityOpt(o, 'start', 1), out = [];
      bits.split('').forEach(function (b) {
        var first = b === '0' ? -cur : cur;      // a 0 has a transition at the start of the bit
        cur = -first;                            // always a transition in the middle
        out.push(first, cur);
      });
      return out;
    },
    ami: function (bits, o) {
      var last = polarityOpt(o, 'prevPolarity', -1), out = [];
      bits.split('').forEach(function (b) { if (b === '1') { last = -last; out.push(last); } else out.push(0); });
      return out;
    },
    pseudoternary: function (bits, o) {
      var last = polarityOpt(o, 'prevPolarity', -1), out = [];
      bits.split('').forEach(function (b) { if (b === '0') { last = -last; out.push(last); } else out.push(0); });
      return out;
    },
    '2b1q': function (bits, o) {
      if (bits.length % 2) throw new Error('2B1Q needs an even number of bits (it encodes pairs)');
      var prev = polarityOpt(o, 'prevPolarity', 1), out = [];
      for (var i = 0; i < bits.length; i += 2) {
        var v = TABLE_2B1Q.positive[bits.substr(i, 2)] * prev;
        out.push(v);
        prev = sign(v);
      }
      return out;
    },
    mlt3: function (bits, o) {
      var level = o.start === undefined ? 0 : o.start;
      if (level !== 0 && level !== 1 && level !== -1) throw new Error('start must be +1, 0 or -1 (a level)');
      var last = level !== 0 ? level : polarityOpt(o, 'lastNonzero', -1), out = [];
      bits.split('').forEach(function (b) {
        if (b === '1') {
          if (level !== 0) { last = level; level = 0; }      // ±V → 0
          else { level = -last; last = level; }               // 0 → opposite of the last nonzero level
        }
        out.push(level);
      });
      return out;
    }
  };
  var INIT = {   // the level just before the first bit, where the rule needs one
    nrzi: function (o) { return polarityOpt(o, 'start', 1); },
    dmanchester: function (o) { return polarityOpt(o, 'start', 1); },
    mlt3: function (o) { return o.start === undefined ? 0 : o.start; }
  };

  /** encode(scheme, bits, opts) → { scheme, bits, levels, cellsPerBit, levelSet, allowed, acceptInverse, init? }
      opts: start (nrzi, dmanchester, mlt3), prevPolarity (ami, pseudoternary, 2b1q), lastNonzero (mlt3). */
  function encode(name, bits, opts) {
    var sc = scheme(name);
    checkBits(bits);
    opts = opts || {};
    var res = {
      scheme: name, bits: bits, levels: ENC[name](bits, opts), cellsPerBit: sc.cpb,
      levelSet: sc.levelSet.slice(), allowed: sc.allowed.slice(), acceptInverse: sc.inverse
    };
    if (INIT[name]) res.init = { level: INIT[name](opts) };
    return res;
  }

  /* ---------------- decoders: levels → bits ---------------- */
  function levelCheck(v, ok, name) {
    if (ok.indexOf(v) < 0) throw new Error(name + ': level ' + v + ' is not allowed (' + ok.join(', ') + ')');
    return v;
  }
  function pairs(levels, name) {
    if (levels.length % 2) throw new Error(name + ' needs two cells per bit');
    var out = [];
    for (var i = 0; i < levels.length; i += 2) out.push([levels[i], levels[i + 1]]);
    return out;
  }
  var DEC = {
    unipolar: function (lv) { return lv.map(function (v) { return levelCheck(v, [1, 0], 'unipolar') === 1 ? '1' : '0'; }).join(''); },
    nrzl: function (lv) { return lv.map(function (v) { return levelCheck(v, [1, -1], 'NRZ-L') === 1 ? '0' : '1'; }).join(''); },
    nrzi: function (lv, o) {
      var cur = polarityOpt(o, 'start', 1);
      return lv.map(function (v) { levelCheck(v, [1, -1], 'NRZ-I'); var b = v !== cur ? '1' : '0'; cur = v; return b; }).join('');
    },
    rz: function (lv) {
      return pairs(lv, 'RZ').map(function (p) {
        levelCheck(p[0], [1, -1], 'RZ');
        if (p[1] !== 0) throw new Error('RZ: the second half of a bit must be 0');
        return p[0] === 1 ? '1' : '0';
      }).join('');
    },
    manchester: function (lv) {
      return pairs(lv, 'Manchester').map(function (p) {
        if (p[0] === 1 && p[1] === -1) return '0';
        if (p[0] === -1 && p[1] === 1) return '1';
        throw new Error('Manchester: no mid-bit transition (code violation)');
      }).join('');
    },
    dmanchester: function (lv, o) {
      var cur = polarityOpt(o, 'start', 1);
      return pairs(lv, 'Differential Manchester').map(function (p) {
        levelCheck(p[0], [1, -1], 'Differential Manchester');
        if (p[1] !== -p[0]) throw new Error('Differential Manchester: no mid-bit transition (code violation)');
        var b = p[0] !== cur ? '0' : '1';      // a transition at the start of the bit means 0
        cur = p[1];
        return b;
      }).join('');
    },
    ami: function (lv) { return lv.map(function (v) { return levelCheck(v, [1, 0, -1], 'AMI') === 0 ? '0' : '1'; }).join(''); },
    pseudoternary: function (lv) { return lv.map(function (v) { return levelCheck(v, [1, 0, -1], 'Pseudoternary') === 0 ? '1' : '0'; }).join(''); },
    '2b1q': function (lv, o) {
      var prev = polarityOpt(o, 'prevPolarity', 1);
      return lv.map(function (v) {
        levelCheck(v, [3, 1, -1, -3], '2B1Q');
        var pair = PAIR_OF_2B1Q[String(v * prev)];
        prev = sign(v);
        return pair;
      }).join('');
    },
    mlt3: function (lv, o) {
      var cur = o.start === undefined ? 0 : o.start;
      return lv.map(function (v) { levelCheck(v, [1, 0, -1], 'MLT-3'); var b = v !== cur ? '1' : '0'; cur = v; return b; }).join('');
    }
  };

  /** decode(scheme, levels, opts) → bit string. Same opts as encode (start / prevPolarity). */
  function decode(name, levels, opts) {
    scheme(name);
    if (!Array.isArray(levels)) throw new Error('levels must be an array of cell levels');
    return DEC[name](levels, opts || {});
  }

  /* ---------------- data rate, signal rate, bandwidth ---------------- */
  /** S = c × N × 1/r. c defaults to the average case, 1/2 [L03 p25 note]. */
  function baud(N, r, c) { return round12((c === undefined ? 0.5 : c) * N / r); }

  // Average signal rate = minimum bandwidth as a multiple of N [L03 p46]. r where the slides give it (p23, p27, p29, p32; 2B1Q corrected to 2).
  var AVG = {
    unipolar: { factor: 1 / 2, r: 1, ref: 'L03 p20; L03 p46' },
    nrzl: { factor: 1 / 2, r: 1, ref: 'L03 p23; L03 p24; L03 p46' },
    nrzi: { factor: 1 / 2, r: 1, ref: 'L03 p23; L03 p24; L03 p25; L03 p46' },
    rz: { factor: 1, r: 1 / 2, ref: 'L03 p27' },
    manchester: { factor: 1, r: 1 / 2, ref: 'L03 p29; L03 p30; L03 p46' },
    dmanchester: { factor: 1, r: 1 / 2, ref: 'L03 p29; L03 p30; L03 p46' },
    ami: { factor: 1 / 2, r: 1, ref: 'L03 p32; L03 p46' },
    pseudoternary: { factor: 1 / 2, r: 1, ref: 'L03 p32' },
    '2b1q': { factor: 1 / 4, r: 2, ref: 'L03 p38; L03 p46' },
    mlt3: { factor: 1 / 3, ref: 'L03 p46' },
    '8b6t': { factor: 3 / 4, ref: 'L03 p46' },
    '4dpam5': { factor: 1 / 8, ref: 'L03 p46' }
  };
  function avgInfo(name) {
    if (typeof name !== 'string' || !hasOwn.call(AVG, name)) throw new Error('No average-rate entry for scheme: ' + name);
    return AVG[name];
  }
  /** Average signal rate S_avg (baud) for a data rate N (bps) [L03 p23-p38, p46]. */
  function avgBaud(name, N) { return round12(avgInfo(name).factor * N); }
  /** Minimum bandwidth (Hz): Bmin = S [L03 p25]. */
  function minBandwidth(name, N) { return avgBaud(name, N); }

  /** Block coding mB/nB: the data rate becomes N × n/m [L03 p48; L03 p54]. */
  function blockRate(N, m, n) { return round12(N * n / m); }
  function rate4b5b(N) { return blockRate(N, 4, 5); }

  /** Receiver clock `frac` faster (+) or slower (−) than the sender clock [L03 p13; L03 p14]. */
  function clockDrift(N, frac) { return { received: round12(N * (1 + frac)), extra: round12(N * frac) }; }
  /** Bits after which a clock error of `frac` has gained (or lost) one whole bit. */
  function slipEvery(frac) {
    if (!frac) throw new Error('slipEvery needs a nonzero clock error');
    return round12(1 / Math.abs(frac));
  }
  var P13 = Object.freeze({ sent: '10110001', received: '110111000011' });   // the figure on L03 p13 (drawn by hand: ≈ 1.5× clock)

  /* ---------------- multilevel mBnL [L03 p34-p42] ---------------- */
  var LEVEL_LETTER = { B: 2, T: 3, Q: 4 };
  function mbnl(m, n, Lv) {
    var data = Math.pow(2, m), signals = Math.pow(Lv, n), valid = data <= signals;
    return { m: m, n: n, L: Lv, data: data, signals: signals, valid: valid, exact: data === signals,
      unused: valid ? signals - data : 0, short: valid ? 0 : data - signals };
  }
  function parseMbnl(text) {
    var m = /^(\d+)B(\d+)([BTQ])$/i.exec(String(text).trim());
    if (!m) throw new Error('Not an mBnL name: ' + text);
    var mm = parseInt(m[1], 10), nn = parseInt(m[2], 10);
    return { m: mm, n: nn, L: LEVEL_LETTER[m[3].toUpperCase()], r: mm / nn };
  }
  /** Invert a code word (swap + and −) — used to remove a DC component [L03 p39]. */
  function invertCode(code) { return code.map(neg); }
  function tern(s) { return s.replace(/-/g, '−'); }   // '-' → the typographic minus used throughout the kit
  // The three 8B6T examples on the slide; the third code word is "weighted −", so it is sent inverted (DC balance) [L03 p39; L03 p40].
  var SLIDE_8B6T = Object.freeze([
    Object.freeze({ bits: '00010001', code: tern('-0-0++'), sent: tern('-0-0++') }),
    Object.freeze({ bits: '01010011', code: tern('-+-++0'), sent: tern('-+-++0') }),
    Object.freeze({ bits: '01010000', code: tern('+--+0+'), sent: tern('-++-0-') })
  ]);
  // 4D-PAM5: 8 bits on four wires, one level per wire; 1 Gbps → 250 Mbps (125 MBd) per wire [L03 p42].
  var SLIDE_4DPAM5 = Object.freeze({ bits: '00011110', wires: Object.freeze([-2, 1, 2, -1]), gbps: 1, perWireMbps: 250, perWireMBd: 125 });

  /* ---------------- 4B/5B block coding [L03 p48-p54] ---------------- */
  var TABLE_4B5B = Object.freeze({
    '0000': '11110', '0001': '01001', '0010': '10100', '0011': '10101', '0100': '01010', '0101': '01011', '0110': '01110', '0111': '01111',
    '1000': '10010', '1001': '10011', '1010': '10110', '1011': '10111', '1100': '11010', '1101': '11011', '1110': '11100', '1111': '11101'
  });
  var CONTROL_4B5B = Object.freeze({ Q: '00000', I: '11111', H: '00100', J: '11000', K: '10001', T: '01101', S: '11001', R: '00111' });
  var CONTROL_NAMES = Object.freeze({ Q: 'Quiet', I: 'Idle', H: 'Halt', J: 'Start delimiter', K: 'Start delimiter', T: 'End delimiter', S: 'Set', R: 'Reset' });
  var DATA_OF = {}, CTL_OF = {};
  Object.keys(TABLE_4B5B).forEach(function (d) { DATA_OF[TABLE_4B5B[d]] = d; });
  Object.keys(CONTROL_4B5B).forEach(function (k) { CTL_OF[CONTROL_4B5B[k]] = k; });

  function encode4b5b(bits) {
    checkBits(bits);
    if (bits.length % 4) throw new Error('4B/5B needs a multiple of 4 bits');
    var out = '';
    for (var i = 0; i < bits.length; i += 4) out += TABLE_4B5B[bits.substr(i, 4)];
    return out;
  }
  function lookup5b(word) {
    if (hasOwn.call(DATA_OF, word)) return { type: 'data', data: DATA_OF[word] };
    if (hasOwn.call(CTL_OF, word)) return { type: 'control', name: CTL_OF[word], meaning: CONTROL_NAMES[CTL_OF[word]] };
    return { type: 'invalid' };
  }
  function decode4b5b(bits) {
    checkBits(bits);
    if (bits.length % 5) throw new Error('4B/5B words are 5 bits long (need a multiple of 5 bits)');
    var out = '';
    for (var i = 0; i < bits.length; i += 5) {
      var w = bits.substr(i, 5), r = lookup5b(w);
      if (r.type !== 'data') throw new Error('4B/5B word ' + w + ' is a ' + (r.type === 'control' ? 'control sequence (' + r.name + ')' : 'invalid word') + ', not data');
      out += r.data;
    }
    return out;
  }
  /** The 8 five-bit words that are neither data words nor named control sequences (ascending). */
  function invalid5b() {
    var out = [];
    for (var n = 0; n < 32; n++) {
      var w = ('0000' + n.toString(2)).slice(-5);
      if (lookup5b(w).type === 'invalid') out.push(w);
    }
    return out;
  }

  /* ---------------- scrambling: B8ZS and HDB3 on top of AMI [L03 p57-p61] ---------------- */
  /** B8ZS: 00000000 → 000VB0VB. prevPolarity = polarity of the last pulse before the stream (default −, so the first 1 is +).
      Returns { levels, marks:[{i, kind:'V'|'B'}], subs:[{start, len, pattern}], last }. */
  function b8zs(bits, prevPolarity) {
    checkBits(bits);
    var last = prevPolarity === undefined ? -1 : checkPolarity(prevPolarity), levels = [], marks = [], subs = [], i = 0;
    while (i < bits.length) {
      if (bits.substr(i, 8) === '00000000') {
        var v1 = last, b1 = -last, v2 = b1, b2 = -v2;      // 0 0 0 V B 0 V B
        levels.push(0, 0, 0, v1, b1, 0, v2, b2);
        marks.push({ i: i + 3, kind: 'V' }, { i: i + 4, kind: 'B' }, { i: i + 6, kind: 'V' }, { i: i + 7, kind: 'B' });
        subs.push({ start: i, len: 8, pattern: '000VB0VB' });
        last = b2;
        i += 8;
      } else if (bits.charAt(i) === '1') { last = -last; levels.push(last); i++; }
      else { levels.push(0); i++; }
    }
    return { levels: levels, marks: marks, subs: subs, last: last };
  }

  /** HDB3: 0000 → 000V (odd number of nonzero pulses since the last substitution) or B00V (even).
      opts: prevPolarity (default −1), parity (0 = even, 1 = odd: the pulse count before the stream, default 0).
      Returns { levels, marks, subs:[{start, len, pattern, parityBefore, pulsesBefore}], last, parity }
      (pulsesBefore = nonzero pulses since the previous substitution, counting the opts.parity assumed before the stream). */
  function hdb3(bits, opts) {
    checkBits(bits);
    opts = opts || {};
    var last = polarityOpt(opts, 'prevPolarity', -1);
    var count = opts.parity === undefined ? 0 : opts.parity;
    if (count !== 0 && count !== 1) throw new Error('parity must be 0 (even) or 1 (odd)');
    var levels = [], marks = [], subs = [], i = 0;
    while (i < bits.length) {
      if (bits.substr(i, 4) === '0000') {
        var even = count % 2 === 0;
        if (even) { var b = -last; levels.push(b, 0, 0, b); marks.push({ i: i, kind: 'B' }, { i: i + 3, kind: 'V' }); last = b; }
        else { levels.push(0, 0, 0, last); marks.push({ i: i + 3, kind: 'V' }); }
        subs.push({ start: i, len: 4, pattern: even ? 'B00V' : '000V', parityBefore: even ? 'even' : 'odd', pulsesBefore: count });
        count = 0;
        i += 4;
      } else if (bits.charAt(i) === '1') { last = -last; levels.push(last); count++; i++; }
      else { levels.push(0); i++; }
    }
    return { levels: levels, marks: marks, subs: subs, last: last, parity: count % 2 };
  }

  function unB8zs(lv, last) {
    var out = [], i = 0;
    while (i < lv.length) {
      var v = lv[i];
      if (v === 0 && i + 7 < lv.length && lv[i + 1] === 0 && lv[i + 2] === 0 && lv[i + 3] === last && lv[i + 4] === -last &&
          lv[i + 5] === 0 && lv[i + 6] === -last && lv[i + 7] === last) {
        out.push('0', '0', '0', '0', '0', '0', '0', '0');
        i += 8;
      } else if (v === 0) { out.push('0'); i++; }
      else { out.push('1'); last = v; i++; }
    }
    return out.join('');
  }
  function unHdb3(lv, last) {
    var out = [];
    for (var j = 0; j < lv.length; j++) {
      var v = lv[j];
      if (v === 0) out.push('0');
      else if (v === last) {                       // same polarity as the previous pulse = a violation V
        if (j < 3) throw new Error('HDB3: a violation cannot occur in the first three cells');
        out[j - 3] = out[j - 2] = out[j - 1] = '0';   // 000V or B00V → 0000
        out.push('0');
      } else { out.push('1'); last = v; }
    }
    return out.join('');
  }
  /** unscramble('b8zs'|'hdb3', levels, { prevPolarity }) → the original bit string. */
  function unscramble(kind, levels, opts) {
    if (!Array.isArray(levels)) throw new Error('levels must be an array of cell levels');
    levels.forEach(function (v) { levelCheck(v, [1, 0, -1], 'scrambled AMI'); });
    var last = polarityOpt(opts || {}, 'prevPolarity', -1);
    if (kind === 'b8zs') return unB8zs(levels, last);
    if (kind === 'hdb3') return unHdb3(levels, last);
    throw new Error('Unknown scrambling code: ' + kind);
  }

  KIT.calc.linecode = {
    CONV: CONV, NAMES: NAMES,
    encode: encode, decode: decode,
    baud: baud, AVG: AVG, avgBaud: avgBaud, minBandwidth: minBandwidth, blockRate: blockRate, rate4b5b: rate4b5b,
    clockDrift: clockDrift, slipEvery: slipEvery, P13: P13,
    mbnl: mbnl, parseMbnl: parseMbnl, TABLE_2B1Q: TABLE_2B1Q, invertCode: invertCode, SLIDE_8B6T: SLIDE_8B6T, SLIDE_4DPAM5: SLIDE_4DPAM5,
    TABLE_4B5B: TABLE_4B5B, CONTROL_4B5B: CONTROL_4B5B, CONTROL_NAMES: CONTROL_NAMES,
    encode4b5b: encode4b5b, decode4b5b: decode4b5b, lookup5b: lookup5b, invalid5b: invalid5b,
    b8zs: b8zs, hdb3: hdb3, unscramble: unscramble
  };
})();
