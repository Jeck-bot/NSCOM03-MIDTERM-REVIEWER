/* L03a problem generators: baud rate / bandwidth, drawing line codes, decoding, clock drift, 4B/5B, scrambling, mBnL.
   Owner: O2. Rules: params(rng) uses ONLY rng and returns plain data; build(p) is pure and returns {prompt, inputs[], steps[], hints[]?, key?}.
   Every number and every waveform comes from KIT.calc.linecode (tested against the slides in test/calc.linecode.test.js). */
(function () {
  'use strict';
  function C() { return KIT.calc.linecode; }
  function si(x, unit, sig) { return KIT.fmt.si(x, unit, sig || 4); }
  function num(x, sig) { return KIT.fmt.num(x, sig || 6); }
  var ref = function (p) { return ' <span class="chip ref">' + p + '</span>'; };
  function mono(s) { return '<span class="mono">' + s + '</span>'; }
  function sym(v) { return v > 0 ? '+' : v < 0 ? '−' : '0'; }
  function sym3(v) { return (v > 0 ? '+' : '−') + Math.abs(v); }
  function name(s) { return C().NAMES[s]; }
  function group(bits, n) { return KIT.util.chunk(bits, n).join(' '); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many || one + 's'); }

  /* ---------- shared formatting of waveforms (slide notation) ---------- */
  function fmtCells(enc) {
    var l = enc.levels, out = [], i;
    if (enc.cellsPerBit === 2) { for (i = 0; i < l.length; i += 2) out.push('(' + sym(l[i]) + sym(l[i + 1]) + ')'); return out.join(''); }
    if (enc.cellsPerBit === 0.5) return l.map(sym3).join(' ');
    return l.map(sym).join(' ');
  }
  function fmtTrace(enc) {      // bit → level(s)
    var b = enc.bits, l = enc.levels, out = [], i;
    if (enc.cellsPerBit === 1) for (i = 0; i < b.length; i++) out.push(b.charAt(i) + '→' + sym(l[i]));
    else if (enc.cellsPerBit === 2) for (i = 0; i < b.length; i++) out.push(b.charAt(i) + '→' + sym(l[2 * i]) + sym(l[2 * i + 1]));
    else for (i = 0; i < b.length; i += 2) out.push(b.substr(i, 2) + '→' + sym3(l[i / 2]));
    return out.join(', ');
  }
  function fmtRead(scheme, enc) {   // level(s) → bit, with the comparison the decoder makes for the differential codes
    var l = enc.levels, b = enc.bits, out = [], i, prev;
    if (scheme === 'nrzi' || scheme === 'mlt3') {
      prev = enc.init.level;
      for (i = 0; i < l.length; i++) { out.push(sym(l[i]) + (l[i] !== prev ? ' (changed) → 1' : ' (same) → 0')); prev = l[i]; }
    } else if (scheme === 'dmanchester') {
      prev = enc.init.level;
      for (i = 0; i < b.length; i++) {
        out.push('(' + sym(l[2 * i]) + sym(l[2 * i + 1]) + ') ' + (l[2 * i] !== prev ? 'transition at the start → 0' : 'no transition at the start → 1'));
        prev = l[2 * i + 1];
      }
    } else if (enc.cellsPerBit === 2) {
      for (i = 0; i < b.length; i++) out.push('(' + sym(l[2 * i]) + sym(l[2 * i + 1]) + ') → ' + b.charAt(i));
    } else if (scheme === '2b1q') {
      prev = 1;
      for (i = 0; i < l.length; i++) { out.push(sym3(l[i]) + ' after ' + sym(prev) + ' → ' + b.substr(2 * i, 2)); prev = l[i] > 0 ? 1 : -1; }
    } else {
      for (i = 0; i < l.length; i++) out.push(sym(l[i]) + ' → ' + b.charAt(i));
    }
    return out.join('; ');
  }
  // The convention for each scheme, in the slide's words, plus the slide page it comes from.
  var RULE = {
    unipolar: ['Unipolar NRZ: 1 = +V, 0 = 0 V.', 'L03 p21'],
    nrzl: ['NRZ-L (slide figure): 0 = +V, 1 = −V.', 'L03 p23'],
    nrzi: ['NRZ-I: a 1 inverts the level at the start of the bit, a 0 does not; assume the level before the first bit is +V.', 'L03 p23'],
    rz: ['RZ: a 1 is +V then 0 V, a 0 is −V then 0 V (every bit returns to zero in the middle).', 'L03 p27'],
    manchester: ['Manchester: 0 = high→low, 1 = low→high (a transition in the middle of every bit).', 'L03 p29'],
    dmanchester: ['Differential Manchester: always a transition in the middle of the bit; a 0 also has a transition at the start of the bit, a 1 does not; assume the level before the first bit is +V.', 'L03 p29'],
    ami: ['AMI: 0 = 0 V; the 1s alternate +V, −V, …, starting with +V.', 'L03 p32'],
    pseudoternary: ['Pseudoternary: 1 = 0 V; the 0s alternate +V, −V, …, starting with +V.', 'L03 p32'],
    '2b1q': ['2B1Q: one level per pair of bits from the transition table (previous level positive: 00 → +1, 01 → +3, 10 → −1, 11 → −3; previous level negative: the signs reversed); assume the level before the first pair is positive.', 'L03 p38'],
    mlt3: ['MLT-3: a 0 keeps the level; a 1 moves round the cycle 0 → +V → 0 → −V → …; start at 0 V with the last nonzero level −V, so the first 1 goes to +V.', 'L03 p44']
  };
  function randBits(rng, n, minOnes) {
    for (var t = 0; t < 80; t++) {
      var b = rng.bits(n), ones = b.split('1').length - 1;
      if (ones >= (minOnes || 2) && n - ones >= 2 && !/0{5,}|1{5,}/.test(b)) return b;
    }
    return '0110100110100110'.slice(0, n);
  }
  function gridInput(id, scheme, bits) {
    var e = C().encode(scheme, bits);
    var g = { bits: bits, cellsPerBit: e.cellsPerBit, levels: e.allowed, levelSet: e.levelSet, answer: e.levels };
    if (e.init) g.init = e.init;
    if (e.acceptInverse) g.acceptInverse = true;
    return { id: id, kind: 'grid', label: name(scheme), grid: g };
  }

  /* ---------- 1. data rate, signal rate, minimum bandwidth (± 4B/5B)  [L03 pp8-9, p25, p46, p54] ---------- */
  var RCASE = {
    a: { r: 1, inv: '1', text: 'one data element is encoded as one signal element (r = 1)' },
    b: { r: 0.5, inv: '2', text: 'one data element is encoded as two signal elements (r = 1/2)' },
    c: { r: 2, inv: '1/2', text: 'two data elements are encoded as one signal element (r = 2)' },
    d: { r: 4 / 3, inv: '3/4', text: 'four data elements are encoded as three signal elements (r = 4/3)' }
  };
  var SCHEME_R = {
    nrzl: ['r = 1 (one signal element per bit)', 'L03 p23', '1'], nrzi: ['r = 1 (one signal element per bit)', 'L03 p23', '1'],
    rz: ['r = 1/2 (two signal elements per bit)', 'L03 p27', '2'], manchester: ['r = 1/2 (two signal elements per bit)', 'L03 p29', '2'],
    dmanchester: ['r = 1/2 (two signal elements per bit)', 'L03 p29', '2'], ami: ['r = 1 (one signal element per bit)', 'L03 p32', '1'],
    '2b1q': ['r = 2 (two bits per signal element; the slide box prints 1/2, but S = N/4 only works with r = 2)', 'L03 p38', '1/2']
  };
  // Color-coded quantities (AUTHORING §3.8): q() in prose, tq() inside $…$; the same role keeps the same color everywhere.
  function q(role, x, unit) { return KIT.fmt.q(role, x, unit); }
  function tq(role, x, unit) { return KIT.fmt.tq(role, x, unit); }
  var BAUD_TEX = '\\c{baud}{S} = c \\times \\c{rate}{N} \\times \\frac{1}{\\c{level}{r}}';
  var INV_TEX = { '1': '1', '2': '2', '1/2': '\\frac{1}{2}', '3/4': '\\frac{3}{4}' };
  var BAUD_COLORS = [{ role: 'rate', tex: 'N', name: 'bit rate' }, { role: 'baud', tex: 'S', name: 'signal (baud) rate' },
    { role: 'level', tex: 'r', name: 'data elements per signal element' }];
  KIT.gen.register('l03a.baud', {
    topic: 'l03a', title: 'Baud rate and minimum bandwidth of a line code', level: 2, ref: 'L03 pp8-9; L03 p25; L03 p46; L03 p54',
    samples: [
      { rCase: 'a', N: 100e3 },                                // L03 p9, Example 1
      { scheme: 'nrzi', N: 1e6 },                               // L03 p25, Example 3
      { scheme: 'nrzi', N: 1e6, block: true },                  // L03 p54, Example 4 (NRZ-I)
      { scheme: 'manchester', N: 1e6, block: true },            // L03 p54, Example 4 (Manchester)
      { scheme: '2b1q', N: 8e6 }],
    params: function (rng) {
      if (rng.chance(0.25)) {
        var rc = rng.pick(['a', 'b', 'c', 'd']);
        return { rCase: rc, N: rng.pick(rc === 'd' ? [8e3, 16e3, 80e3, 800e3] : [50e3, 100e3, 200e3, 400e3, 1e6]) };
      }
      var block = rng.chance(0.5);
      var scheme = block ? rng.pick(['nrzi', 'manchester'])      // slides 50 and 54 pair 4B/5B with NRZ-I or Manchester
        : rng.pick(['nrzl', 'nrzi', 'rz', 'manchester', 'dmanchester', 'ami', '2b1q', '2b1q']);
      var p = { scheme: scheme, N: rng.pick([1, 2, 4, 8, 16, 20, 40, 100]) * 1e6 };
      if (block) p.block = true;
      return p;
    },
    build: function (p) {
      var c = C();
      if (p.rCase) {
        var rc = RCASE[p.rCase], S = c.baud(p.N, rc.r, 0.5);
        return {
          prompt: 'A signal is carrying data in which ' + rc.text + '. If the bit rate is <b>' + q('rate', p.N, 'bps') + '</b>, what is the average value of the baud rate if c is between 0 and 1?',
          inputs: [{ id: 'S', kind: 'num', label: 'Average baud rate S', answer: S, unit: 'baud' }],
          colors: BAUD_COLORS,
          steps: ['The baud (signal) rate is $' + BAUD_TEX + '$, where $c$ is the case factor (worst case 1, best case 0).' + ref('L03 p8'),
            'For the average case we take $c = \\frac{1}{2}$.' + ref('L03 p9') + ref('L03 p25'),
            '$\\c{level}{r} = ' + tq('level', rc.r) + '$, so $\\frac{1}{\\c{level}{r}} = \\c{level}{' + INV_TEX[rc.inv] + '}$.' + ref('L03 p7'),
            '$\\c{baud}{S} = \\frac{1}{2} \\times ' + tq('rate', p.N, 'bps') + ' \\times \\c{level}{' + INV_TEX[rc.inv] + '} = ' + tq('baud', S, 'baud') + '$.'],
          hints: ['Average case: c = 1/2. Then S = c × N × 1/r.']
        };
      }
      var nm = name(p.scheme), n2 = p.block ? c.rate4b5b(p.N) : p.N;
      var S2 = c.avgBaud(p.scheme, n2), B = c.minBandwidth(p.scheme, n2), info = SCHEME_R[p.scheme];
      var inputs = [];
      if (p.block) inputs.push({ id: 'N2', kind: 'num', label: 'Bit rate after 4B/5B', answer: n2, unit: 'bps' });
      inputs.push({ id: 'S', kind: 'num', label: 'Average baud rate S', answer: S2, unit: 'baud' });
      inputs.push({ id: 'B', kind: 'num', label: 'Minimum bandwidth', answer: B, unit: 'Hz' });
      var steps = [], nSym = p.block ? "N'" : 'N';
      if (p.block) steps.push('4B/5B block coding replaces every 4 bits by 5 bits, so the bit rate rises to $\\c{rate}{N\'} = \\c{rate}{N} \\times \\frac{5}{4} = ' + tq('rate', p.N, 'bps') + ' \\times \\frac{5}{4} = ' + tq('rate', n2, 'bps') + '$.' + ref('L03 p48') + ref('L03 p54'));
      steps.push(nm + ' has ' + info[0] + '.' + ref(info[1]));
      steps.push('Average case ($c = \\frac{1}{2}$): $\\c{baud}{S} = c \\times \\c{rate}{' + nSym + '} \\times \\frac{1}{\\c{level}{r}} = \\frac{1}{2} \\times ' + tq('rate', n2, 'bps') + ' \\times \\c{level}{' + INV_TEX[info[2]] + '} = ' + tq('baud', S2, 'baud') + '$.' + ref('L03 p8') + ref('L03 p46'));
      steps.push('The minimum bandwidth equals the average signal rate: $\\c{bw}{B_{\\min}} = \\c{baud}{S} = ' + tq('bw', B, 'Hz') + '$.' + ref('L03 p25'));
      if (p.block && (p.scheme === 'nrzi' || p.scheme === 'manchester')) {
        steps.push((p.scheme === 'nrzi'
          ? 'Trade-off: NRZ-I needs the lower bandwidth (N′/2) but has a DC-component problem; Manchester would need N′ = ' + si(n2, 'Hz') + ' but has no DC component.'
          : 'Trade-off: Manchester needs twice the bandwidth of NRZ-I (N′ against N′/2) but has no DC component.') + ref('L03 p54'));
      }
      return {
        prompt: p.block
          ? 'We need to send data at <b>' + q('rate', p.N, 'bps') + '</b>. Using <b>4B/5B block coding followed by ' + nm + '</b> line coding, find the bit rate after block coding, the average signal (baud) rate and the minimum required bandwidth.'
          : 'A system is using <b>' + nm + '</b> to transfer <b>' + q('rate', p.N, 'bps') + '</b> data. What are the average signal rate and the minimum bandwidth?',
        colors: BAUD_COLORS.concat([{ role: 'bw', tex: 'B_{\\min}', name: 'minimum bandwidth' }]),
        inputs: inputs, steps: steps,
        hints: ['Block coding first: N′ = N × 5/4. Then S = c × N′ × 1/r with c = 1/2, and B<sub>min</sub> = S.']
      };
    }
  });

  /* ---------- 2. draw a bit stream in 1–3 line codes (grid inputs)  [L03 pp21-44] ---------- */
  KIT.gen.register('l03a.draw', {
    topic: 'l03a', title: 'Draw a bit stream in a line code', level: 1, ref: 'L03 pp21-44',
    samples: [
      { bits: '01001110', schemes: ['nrzl', 'nrzi'] },                 // L03 p23
      { bits: '01001', schemes: ['rz'] },                              // L03 p27
      { bits: '010011', schemes: ['manchester', 'dmanchester'] },      // L03 p29
      { bits: '010010', schemes: ['ami', 'pseudoternary'] },           // L03 p32 (pseudoternary: low priority)
      { bits: '0011011001', schemes: ['2b1q'] },                       // L03 p38
      { bits: '01011011', schemes: ['mlt3'] },                         // L03 p44, typical case
      { bits: '11111111', schemes: ['mlt3'] }],                        // L03 p44, worst case
    params: function (rng) {
      var pool = ['nrzl', 'nrzi', 'rz', 'manchester', 'dmanchester', 'ami', '2b1q', 'mlt3'];
      var chosen = rng.shuffle(pool).slice(0, rng.pick([1, 2, 2, 3, 3]));
      chosen.sort(function (a, b) { return pool.indexOf(a) - pool.indexOf(b); });
      var n = chosen.indexOf('2b1q') >= 0 ? rng.pick([6, 8]) : rng.pick([6, 7, 8]);
      return { bits: randBits(rng, n, chosen.indexOf('mlt3') >= 0 ? 3 : 2), schemes: chosen };
    },
    build: function (p) {
      var c = C(), steps = [];
      var encs = p.schemes.map(function (s) { return c.encode(s, p.bits); });
      p.schemes.forEach(function (s, i) {
        steps.push('<b>' + name(s) + '</b> — ' + RULE[s][0].replace(/^[^:]+: /, '') + ref(RULE[s][1]));
        steps.push('Bit by bit: ' + mono(fmtTrace(encs[i])) + ' — the waveform is ' + mono(fmtCells(encs[i])) + '.');
      });
      var rules = p.schemes.map(function (s) { return '<li>' + RULE[s][0] + '</li>'; }).join('');
      return {
        prompt: 'Draw the bit stream <b class="mono">' + p.bits + '</b> as a waveform ' + (p.schemes.length > 1 ? 'in each of the line codes below' : 'in the line code below') +
          ' (fill every cell of the grid). Use the slide conventions:<ul>' + rules + '</ul>',
        inputs: p.schemes.map(function (s, i) { return gridInput('w' + (i + 1), s, p.bits); }),
        steps: steps,
        hints: ['Work one bit at a time. Differential codes (NRZ-I, differential Manchester) depend on the previous level; AMI and MLT-3 depend on the last nonzero pulse.']
      };
    }
  });

  /* ---------- 3. decode a waveform (levels given → bits)  [L03 pp21-44] ---------- */
  var DECODE_NOTE = {
    unipolar: 'In unipolar NRZ, +V is a 1 and 0 V is a 0.',
    nrzl: 'In NRZ-L the level itself gives the bit (slide figure: 0 = +V, 1 = −V).',
    nrzi: 'The level before the first bit was +V; a change of level at the start of a bit means 1, no change means 0.',
    rz: 'Each bit is a pair: the first half tells the bit (+V = 1, −V = 0) and the second half returns to 0 V.',
    manchester: 'The direction of the mid-bit transition gives the bit: high→low = 0, low→high = 1.',
    dmanchester: 'The level before the first bit was +V. Every bit has a mid-bit transition; a transition at the START of the bit means 0, none means 1.',
    ami: 'A 0 V level is a 0; a pulse of either polarity is a 1.',
    pseudoternary: 'A 0 V level is a 1; a pulse of either polarity is a 0.',
    '2b1q': 'The level before the first pair was positive. Use the transition table backwards: after a positive level +1 = 00, +3 = 01, −1 = 10, −3 = 11; after a negative level the signs are reversed.',
    mlt3: 'The signal started at 0 V. A change of level means 1, no change means 0.'
  };
  KIT.gen.register('l03a.decode', {
    topic: 'l03a', title: 'Decode a line-coded waveform', level: 1, ref: 'L03 pp21-44',
    samples: [{ scheme: 'nrzi', bits: '01001110' }, { scheme: 'manchester', bits: '010011' }, { scheme: '2b1q', bits: '0011011001' }, { scheme: 'mlt3', bits: '01011011' }],
    params: function (rng) {
      var scheme = rng.pick(['nrzl', 'nrzi', 'rz', 'manchester', 'dmanchester', 'ami', '2b1q', 'mlt3']);
      return { scheme: scheme, bits: randBits(rng, scheme === '2b1q' ? rng.pick([6, 8]) : rng.pick([6, 7, 8]), scheme === 'mlt3' ? 3 : 2) };
    },
    build: function (p) {
      var c = C(), e = c.encode(p.scheme, p.bits), back = c.decode(p.scheme, e.levels);
      var how = e.cellsPerBit === 1 ? 'one level per bit' : e.cellsPerBit === 2 ? 'two half-bit levels per bit, grouped per bit' : 'one level per pair of bits';
      return {
        prompt: 'A receiver sees this <b>' + name(p.scheme) + '</b> signal (' + how + ', left to right): <span class="mono">' + fmtCells(e) + '</span>. ' +
          DECODE_NOTE[p.scheme] + ' What bit string was sent?',
        inputs: [{ id: 'bits', kind: 'bits', label: 'Bits sent', answer: p.bits }],
        steps: [RULE[p.scheme][0] + ref(RULE[p.scheme][1]),
          'Read the signal ' + (e.cellsPerBit === 0.5 ? 'one level (two bits)' : 'one bit') + ' at a time: ' + mono(fmtRead(p.scheme, e)) + '.',
          'The data bits are <b class="mono">' + back + '</b>.'],
        hints: [['nrzl', 'ami', 'rz', 'manchester', 'unipolar', 'pseudoternary'].indexOf(p.scheme) >= 0
          ? 'Decide each bit from its own cell(s) — no memory needed.' : 'Compare each cell with the one before it (the starting level is given).'],
        key: function () { return KIT.draw.linecode ? KIT.draw.linecode(p.scheme, p.bits) : document.createElement('div'); }
      };
    }
  });

  /* ---------- 4. receiver clock drift  [L03 pp13-14] ---------- */
  KIT.gen.register('l03a.drift', {
    topic: 'l03a', title: 'Clock drift: extra bits per second', level: 1, ref: 'L03 pp13-14',
    samples: [{ pct: 0.1, dir: 'fast', N1: 1000, N2: 1e6 }],   // L03 p14, Example 2
    params: function (rng) {
      return { pct: rng.pick([0.1, 0.2, 0.5, 1, 2, 5]), dir: rng.pick(['fast', 'fast', 'slow']), N1: rng.pick([1e3, 2e3, 5e3, 10e3, 100e3]), N2: rng.pick([1e6, 2e6, 10e6, 100e6]) };
    },
    build: function (p) {
      var c = C(), fast = p.dir !== 'slow', f = (fast ? 1 : -1) * p.pct / 100;
      var d1 = c.clockDrift(p.N1, f), d2 = c.clockDrift(p.N2, f);
      var word = fast ? 'extra' : 'missing', pct = num(p.pct, 3) + '%';
      function line(n, d) {
        return 'At ' + si(n, 'bps') + ': ' + num(n) + ' × ' + num(p.pct, 3) + '/100 = <b>' + si(Math.abs(d.extra), 'bps') + '</b> ' + word + '; the receiver gets ' + num(d.received) + ' bps instead of ' + num(n) + ' bps.';
      }
      return {
        prompt: 'In a digital transmission, the receiver clock is <b>' + pct + ' ' + (fast ? 'faster' : 'slower') + '</b> than the sender clock. ' +
          'How many ' + word + ' bits per second does the receiver ' + (fast ? 'receive' : 'miss') + ' if the data rate is <b>' + si(p.N1, 'bps') + '</b>? How many if the data rate is <b>' + si(p.N2, 'bps') + '</b>?',
        inputs: [{ id: 'x1', kind: 'num', label: 'At ' + si(p.N1, 'bps'), answer: Math.abs(d1.extra), unit: 'bps' },
          { id: 'x2', kind: 'num', label: 'At ' + si(p.N2, 'bps'), answer: Math.abs(d2.extra), unit: 'bps' }],
        steps: ['The clocks must run at the same bit interval; if the receiver clock is faster or slower, it misreads the stream.' + ref('L03 p13'),
          'The receiver reads N × (1 ' + (fast ? '+' : '−') + ' ' + num(p.pct, 3) + '/100) bits per second, so the ' + word + ' bits are N × ' + num(p.pct, 3) + '/100.' + ref('L03 p14'),
          line(p.N1, d1), line(p.N2, d2)],
        hints: ['A ' + pct + ' error means ' + num(p.pct, 3) + ' ' + word + ' bits for every 100 bits.']
      };
    }
  });

  /* ---------- 5. 4B/5B block coding and the resulting rate  [L03 pp48-54] ---------- */
  KIT.gen.register('l03a.block', {
    topic: 'l03a', title: '4B/5B block coding: code words and rate', level: 1, ref: 'L03 pp48-54',
    samples: [{ dir: 'enc', bits: '000011110001', N: 1e6 }, { dir: 'dec', bits: '0100101010010101', N: 8e6 }],
    params: function (rng) {
      var words = Object.keys(C().TABLE_4B5B), bits = '';
      for (var i = rng.int(2, 4); i > 0; i--) bits += rng.pick(words);
      return { dir: rng.chance(0.7) ? 'enc' : 'dec', bits: bits, N: rng.pick([1, 2, 4, 8, 16, 20, 40, 100]) * 1e6 };
    },
    build: function (p) {
      var c = C(), code = c.encode4b5b(p.bits), line = c.rate4b5b(p.N);
      var table = KIT.util.chunk(p.bits, 4).map(function (w) { return mono(w + ' → ' + c.TABLE_4B5B[w]); }).join(', ');
      if (p.dir === 'dec') {
        table = KIT.util.chunk(p.bits, 4).map(function (w) { return mono(c.TABLE_4B5B[w] + ' → ' + w); }).join(', ');
        return {
          prompt: 'A receiver gets this 4B/5B-encoded stream: <b class="mono">' + group(code, 5) + '</b>. The line bit rate is <b>' + si(line, 'bps') + '</b>. ' +
            'Using the 4B/5B table, what data bits were sent, and what is the data rate before block coding?',
          inputs: [{ id: 'data', kind: 'bits', label: 'Data bits', answer: p.bits }, { id: 'N', kind: 'num', label: 'Data rate', answer: p.N, unit: 'bps' }],
          steps: ['Split the stream into 5-bit words: ' + mono(group(code, 5)) + '.' + ref('L03 p50'),
            'Look each word up in the 4B/5B table (encoded sequence → data sequence): ' + table + '.' + ref('L03 p51'),
            'The data bits are <b class="mono">' + group(p.bits, 4) + '</b>.',
            'Block coding multiplied the rate by 5/4, so the data rate is ' + si(line, 'bps') + ' × 4/5 = <b>' + si(p.N, 'bps') + '</b>.' + ref('L03 p54')],
          hints: ['Every 5 line bits carry 4 data bits.']
        };
      }
      return {
        prompt: 'Using the 4B/5B table, encode the data stream <b class="mono">' + group(p.bits, 4) + '</b> for transmission. If the data rate is <b>' + si(p.N, 'bps') + '</b>, what is the bit rate on the line after block coding?',
        inputs: [{ id: 'code', kind: 'bits', label: '4B/5B stream', answer: code }, { id: 'N2', kind: 'num', label: 'Bit rate after 4B/5B', answer: line, unit: 'bps' }],
        steps: ['Division: split the stream into 4-bit groups ' + mono(group(p.bits, 4)) + '.' + ref('L03 p48') + ref('L03 p49'),
          'Substitution: replace each group using the table (data sequence → encoded sequence): ' + table + '.' + ref('L03 p51') + ref('L03 p52'),
          'Combination: join the 5-bit words: <b class="mono">' + group(code, 5) + '</b> (never more than three 0s in a row).' + ref('L03 p49'),
          'Five bits replace four, so the rate becomes N × 5/4 = ' + si(p.N, 'bps') + ' × 5/4 = <b>' + si(line, 'bps') + '</b>.' + ref('L03 p54')],
        hints: ['The table is on slide 51; the rate rises by 25%.']
      };
    }
  });

  /* ---------- 6. scrambling: B8ZS and HDB3 (grid input, levels + 0 −)  [L03 pp57-61] ---------- */
  function polWord(v) { return v > 0 ? 'positive (+V)' : 'negative (−V)'; }
  KIT.gen.register('l03a.scramble', {
    topic: 'l03a', title: 'Scrambling: B8ZS and HDB3', level: 2, ref: 'L03 pp57-61',
    samples: [
      { code: 'b8zs', bits: '100000000', prev: -1 },                                  // L03 p59 (a): the 1 is +, previous level positive
      { code: 'b8zs', bits: '100000000', prev: 1 },                                   // L03 p59 (b): the 1 is −, previous level negative
      { code: 'hdb3', bits: '1100001000000000', prev: -1, parity: 0 }],               // L03 p61
    params: function (rng) {
      var prev = rng.pick([1, -1]), ones = function (a, b) { return '1'.repeat(rng.int(a, b)); };
      if (rng.chance(0.5)) {
        // B8ZS: a prefix ending in 1, exactly eight 0s, a suffix starting with 1
        var pre = rng.pick(['1', '11', '101', '011', '1001', '0101']), suf = rng.pick(['1', '10', '11', '101', '1011']);
        return { code: 'b8zs', bits: pre + '00000000' + suf, prev: prev };
      }
      for (var t = 0; t < 30; t++) {
        var bits = '', groups = rng.pick([2, 2, 3]);
        for (var g = 0; g < groups; g++) {
          bits += ones(1, 2);
          if (rng.chance(0.4)) bits += rng.pick(['01', '001']);
          bits += '0000';
        }
        bits += rng.pick(['1', '10', '11']);
        if (bits.length <= 18) return { code: 'hdb3', bits: bits, prev: prev, parity: rng.pick([0, 0, 1]) };
      }
      return { code: 'hdb3', bits: '110000100001', prev: prev, parity: 0 };
    },
    build: function (p) {
      var c = C(), steps = [], res;
      steps.push('Scrambling works on top of AMI: 0 = 0 V and the 1s alternate in polarity. The last pulse before the stream was ' + polWord(p.prev) + ', so the next 1 is ' + sym(-p.prev) + '.' + ref('L03 p58'));
      if (p.code === 'b8zs') {
        res = c.b8zs(p.bits, p.prev);
        steps.push('B8ZS replaces eight consecutive 0s with <b>000VB0VB</b>: V = a violation (the same polarity as the previous pulse), B = a normal bipolar pulse (the opposite polarity).' + ref('L03 p59'));
        res.subs.forEach(function (s) {
          var v = res.levels[s.start + 3];
          steps.push('Bits ' + (s.start + 1) + '–' + (s.start + 8) + ' are eight 0s and the pulse before them is ' + polWord(v) + ': V = ' + sym(v) + ', B = ' + sym(-v) + ', 0, V = ' + sym(-v) + ' (the same as the B before it), B = ' + sym(v) +
            ' → <b class="mono">' + res.levels.slice(s.start, s.start + 8).map(sym).join(' ') + '</b>.' + ref('L03 p59'));
        });
      } else {
        res = c.hdb3(p.bits, { prevPolarity: p.prev, parity: p.parity });
        steps.push('HDB3 replaces four consecutive 0s: count the nonzero pulses since the last substitution — <b>even</b> → <b>B00V</b>, <b>odd</b> → <b>000V</b> (the total becomes even either way).' + ref('L03 p60'));
        if (p.parity) steps.push('The problem says the count was already odd at the start of the stream, so counting starts at 1.');
        res.subs.forEach(function (s, i) {
          var cells = res.levels.slice(s.start, s.start + 4);
          steps.push('Substitution ' + (i + 1) + ' (bits ' + (s.start + 1) + '–' + (s.start + 4) + '): ' + plural(s.pulsesBefore, 'nonzero pulse') + ' since ' + (i === 0 ? 'the start' : 'the last substitution') +
            ' → ' + s.parityBefore + ' → <b>' + s.pattern + '</b> = <b class="mono">' + cells.map(sym).join(' ') + '</b>' +
            (s.pattern === 'B00V' ? ' (B alternates from the previous pulse, V repeats B).' : ' (V repeats the previous pulse).') + ref('L03 p61'));
        });
      }
      steps.push('The transmitted pulses are <b class="mono">' + res.levels.map(sym).join(' ') + '</b> — no run of ' + (p.code === 'b8zs' ? 'eight' : 'four') + ' zeros is left.');
      var detail = 'The last nonzero pulse sent before this stream was ' + polWord(p.prev) + '.' +
        (p.code === 'hdb3' ? ' At the start of the stream the number of nonzero pulses since the last substitution is ' + (p.parity ? 'odd' : 'even') + '.' : '');
      return {
        prompt: 'Apply <b>' + (p.code === 'b8zs' ? 'B8ZS' : 'HDB3') + '</b> scrambling (on top of AMI) to the data stream <b class="mono">' + group(p.bits, 4) + '</b> and draw the line signal. ' + detail,
        inputs: [{ id: 'w', kind: 'grid', label: (p.code === 'b8zs' ? 'B8ZS' : 'HDB3') + ' signal',
          grid: { bits: p.bits, cellsPerBit: 1, levels: [1, 0, -1], levelSet: [1, 0, -1], answer: res.levels } }],
        steps: steps,
        hints: [p.code === 'b8zs' ? 'Write the AMI pulses first, then find the run of eight 0s.' : 'Count the nonzero pulses since the last substitution each time you meet four 0s.'],
        keyShowsAnswer: true,        // the annotated key figure is the answer waveform; no second copy
        key: function () { return KIT.draw.scramble ? KIT.draw.scramble(p.code, p.bits, { prev: p.prev, parity: p.parity }) : document.createElement('div'); }
      };
    }
  });

  /* ---------- 7. is an mBnL code valid? how many patterns go unused?  [L03 pp34-37] ---------- */
  var LETTER = { 2: 'B', 3: 'T', 4: 'Q' }, LEVEL_WORD = { 2: 'binary', 3: 'ternary', 4: 'quaternary' };
  KIT.gen.register('l03a.mbnl', {
    topic: 'l03a', title: 'mBnL codes: valid or not, unused patterns', level: 2, ref: 'L03 pp34-37',
    samples: [{ m: 2, n: 1, L: 4 }, { m: 8, n: 6, L: 3 }, { m: 3, n: 1, L: 4 }],
    params: function (rng) {
      var ok = [[2, 1, 4], [4, 2, 4], [4, 3, 3], [8, 6, 3], [3, 2, 3], [5, 3, 4], [6, 4, 3], [6, 3, 4], [3, 2, 4], [7, 5, 3], [8, 4, 4], [5, 4, 3]];
      var bad = [[3, 1, 4], [5, 3, 3], [4, 2, 3], [7, 4, 3], [2, 1, 3], [5, 2, 4], [8, 5, 3], [4, 3, 2]];
      var t = rng.chance(0.65) ? rng.pick(ok) : rng.pick(bad);
      return { m: t[0], n: t[1], L: t[2] };
    },
    build: function (p) {
      var c = C(), r = c.mbnl(p.m, p.n, p.L), code = p.m + 'B' + p.n + LETTER[p.L];
      var verdict = r.exact ? 'exactly equal (2<sup>m</sup> = L<sup>n</sup>): one signal pattern for every data pattern'
        : r.valid ? 'fewer than the signal patterns (2<sup>m</sup> &lt; L<sup>n</sup>): the spare signal patterns can be chosen to be more distinct, giving better noise immunity and error detection'
          : 'more than the signal patterns (2<sup>m</sup> &gt; L<sup>n</sup>): there are not enough signal patterns to represent every data pattern';
      return {
        prompt: 'A designer proposes the <b>' + code + '</b> code: every pattern of m = ' + p.m + ' data bits is replaced by a pattern of n = ' + p.n + ' signal element' + (p.n === 1 ? '' : 's') + ', each with L = ' + p.L + ' levels (' + LEVEL_WORD[p.L] + '). ' +
          'How many data patterns and signal patterns are there? Is the code valid? How many signal patterns go unused (answer 0 if the code is not valid)?',
        inputs: [
          { id: 'data', kind: 'num', label: 'Data patterns 2^m', answer: r.data, unit: '' },
          { id: 'signals', kind: 'num', label: 'Signal patterns L^n', answer: r.signals, unit: '' },
          { id: 'valid', kind: 'choice', label: 'Is the code valid?', choices: ['Yes, it is valid', 'No, it is not valid'], answer: r.valid ? 0 : 1 },
          { id: 'unused', kind: 'num', label: 'Unused signal patterns', answer: r.unused, unit: '' }],
        steps: ['mBnL notation: m data bits → n signal elements with L levels; the letter gives L (B = 2, T = 3, Q = 4), so ' + code + ' has m = ' + p.m + ', n = ' + p.n + ', L = ' + p.L + '.' + ref('L03 p37'),
          'Data patterns: 2<sup>m</sup> = 2<sup>' + p.m + '</sup> = <b>' + num(r.data) + '</b>. Signal patterns: L<sup>n</sup> = ' + p.L + '<sup>' + p.n + '</sup> = <b>' + num(r.signals) + '</b>.' + ref('L03 p34') + ref('L03 p35'),
          'A valid mBnL code needs 2<sup>m</sup> ≤ L<sup>n</sup>.' + ref('L03 p36'),
          num(r.data) + ' data patterns against ' + num(r.signals) + ' signal patterns: the data patterns are ' + verdict + ' → the code is <b>' + (r.valid ? 'valid' : 'not valid') + '</b>.' + ref('L03 p35'),
          r.valid ? 'Unused patterns = L<sup>n</sup> − 2<sup>m</sup> = ' + num(r.signals) + ' − ' + num(r.data) + ' = <b>' + num(r.unused) + '</b>.'
            : 'An invalid code has no spare patterns to count (all ' + num(r.signals) + ' are needed and are still too few): <b>0</b>.'],
        hints: ['Compute both powers, then compare: 2^m ≤ L^n?']
      };
    }
  });
})();
