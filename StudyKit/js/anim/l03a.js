/* L03a worked-example animations (contract: docs/AUTHORING.md §3.9). Owner: Lead (golden: l03a.draw).
   Each animation returns frames [{ caption, render(), step }] built from the generator's params and problem; render() draws one
   still frame (DOM only inside render). Waveforms come from KIT.calc.linecode, the same source as the answer keys. */
(function () {
  'use strict';
  function C() { return KIT.calc.linecode; }
  function lv(v) { return v > 0 ? '+V' : v < 0 ? '−V' : '0 V'; }
  function lv3(v) { return (v > 0 ? '+' : '−') + Math.abs(v); }
  function b(x) { return '<b class="mono">' + x + '</b>'; }

  // The rule of each code in the slide's words (AUTHORING §4.1).
  var RULE = {
    unipolar: '1 = +V, 0 = 0 V.',
    nrzl: 'the level is the bit: 0 = +V, 1 = −V (slide figure).',
    nrzi: 'a 1 <b>inverts</b> the level at the start of the bit, a 0 keeps it. The level before the first bit is +V.',
    rz: 'a 1 is +V then 0 V, a 0 is −V then 0 V — every bit returns to zero halfway.',
    manchester: 'every bit has a transition in the middle: 0 = high→low, 1 = low→high.',
    dmanchester: 'every bit has a transition in the middle; a 0 also has one at the <b>start</b>, a 1 does not. The level before the first bit is +V.',
    ami: '0 = 0 V; the 1s <b>alternate</b> +V, −V, +V, … starting with +V.',
    pseudoternary: '1 = 0 V; the 0s alternate +V, −V, … starting with +V (the reverse of AMI).',
    '2b1q': 'each <b>pair</b> of bits picks one of four levels from the transition table. After a positive level: 00 → +1, 01 → +3, 10 → −1, 11 → −3; after a negative level the signs flip. The level before the first pair is positive.',
    mlt3: 'a 0 stays; a 1 moves to the next level of the cycle 0 → +V → 0 → −V → 0. It starts at 0 V and the last nonzero level was −V, so the first move up is to +V.'
  };

  /** Why bit j (pair j for 2B1Q) gets its level(s). `enc` is KIT.calc.linecode.encode(scheme, bits). */
  function reason(scheme, enc, j) {
    var bits = enc.bits, L = enc.levels, x = bits.charAt(j), k, pulses, prevNZ;
    switch (scheme) {
      case 'unipolar': return 'Bit ' + b(x) + ' → ' + lv(L[j]) + '.';
      case 'nrzl': return 'Bit ' + b(x) + ' → ' + lv(L[j]) + '.';
      case 'nrzi': {
        var before = j ? L[j - 1] : enc.init.level;
        return x === '1' ? 'Bit ' + b('1') + ': invert — ' + lv(before) + ' → ' + lv(L[j]) + '.'
          : 'Bit ' + b('0') + ': no change — stay at ' + lv(before) + '.';
      }
      case 'rz': return 'Bit ' + b(x) + ' → ' + lv(L[2 * j]) + ' for the first half, then back to 0 V.';
      case 'manchester': return 'Bit ' + b(x) + ' → ' + (x === '0' ? 'high→low' : 'low→high') + ' in the middle (' + lv(L[2 * j]) + ' then ' + lv(L[2 * j + 1]) + ').';
      case 'dmanchester': {
        var prev = j ? L[2 * j - 1] : enc.init.level;
        return x === '0'
          ? 'Bit ' + b('0') + ': transition at the start (' + lv(prev) + ' → ' + lv(L[2 * j]) + '), then the mid-bit transition to ' + lv(L[2 * j + 1]) + '.'
          : 'Bit ' + b('1') + ': no transition at the start (stay at ' + lv(prev) + '), then the mid-bit transition to ' + lv(L[2 * j + 1]) + '.';
      }
      case 'ami':
      case 'pseudoternary': {
        var mark = scheme === 'ami' ? '1' : '0';
        if (x !== mark) return 'Bit ' + b(x) + ' → 0 V.';
        for (pulses = 0, k = 0; k < j; k++) if (bits.charAt(k) === mark) pulses++;
        return 'Bit ' + b(x) + ' is pulse number ' + (pulses + 1) + ' → ' + lv(L[j]) + (pulses ? ' (the previous pulse was ' + lv(-L[j]) + ', so it alternates).' : ' (the first pulse is +V).');
      }
      case '2b1q': {
        var pair = bits.substr(2 * j, 2), after = j ? (L[j - 1] > 0 ? 'positive' : 'negative') : 'positive (the starting level)';
        return 'Pair ' + b(pair) + ' after a ' + after + ' level → ' + lv3(L[j]) + '.';
      }
      case 'mlt3': {
        var cur = j ? L[j - 1] : enc.init.level;
        if (x === '0') return 'Bit ' + b('0') + ': stay at ' + lv(cur) + '.';
        if (cur !== 0) return 'Bit ' + b('1') + ': from ' + lv(cur) + ' the next level in the cycle is 0 V.';
        for (prevNZ = -1, k = 0; k < j; k++) if (L[k] !== 0) prevNZ = L[k];
        return 'Bit ' + b('1') + ': from 0 V move to the opposite of the last nonzero level (' + lv(prevNZ) + ') → ' + lv(L[j]) + '.';
      }
    }
    return 'Bit ' + b(x) + '.';
  }

  /* ---------- shared diagrams (colors follow AUTHORING §3.8: data = rate blue, signal = baud orange, Hz = green) ---------- */
  function svgRoot(w, hgt, label) {
    return KIT.svg.S('svg', { class: 'kit-svg', viewBox: '0 0 ' + w + ' ' + hgt, width: w, height: hgt, role: 'img', 'aria-label': label, preserveAspectRatio: 'xMinYMin meet' });
  }
  function boxRow(svg, y, n, slot, label, x0, w) {
    var S = KIT.svg.S;
    svg.appendChild(S('text', { class: 'lvl', x: x0 - 8, y: y + 16, 'text-anchor': 'end' }, label));
    for (var i = 0; i < n; i++) {
      svg.appendChild(S('rect', { class: 'v' + slot, x: x0 + i * w / n + 1.5, y: y, width: w / n - 3, height: 22, rx: 4,
        style: 'fill: currentColor; fill-opacity: 0.18; stroke: currentColor; stroke-width: 1.5' }));
    }
  }
  /** Data elements (bits) on top, the signal elements that carry them below, over the same stretch of time. */
  function elementsFig(r, o) {
    o = o || {};
    return function () {
      var nD = r < 1 ? 4 : 8, nS = Math.round(nD / r), W = 600, x0 = 160, w = W - x0 - 12;
      var top = o.top || 'data elements (bits)', bottom = o.bottom || 'signal elements';
      var svg = svgRoot(W, 84, nD + ' ' + top + ' → ' + nS + ' ' + bottom);
      boxRow(svg, 6, nD, 1, nD + ' ' + top, x0, w);
      boxRow(svg, 50, nS, o.bottomSlot || 2, nS + ' ' + bottom, x0, w);
      return svg;
    };
  }
  /** A frequency axis with the band 0 … B shaded green. */
  function bandFig(B, label) {
    return function () {
      var S = KIT.svg.S, W = 600, x0 = 30, x1 = 470, svg = svgRoot(W, 70, label);
      svg.appendChild(S('rect', { class: 'v3', x: x0, y: 10, width: x1 - x0, height: 26, rx: 4, style: 'fill: currentColor; fill-opacity: 0.2; stroke: currentColor; stroke-width: 1.5' }));
      svg.appendChild(S('line', { class: 'axis', x1: x0, x2: W - 20, y1: 36, y2: 36 }));
      svg.appendChild(S('text', { class: 'tick', x: x0, y: 54, 'text-anchor': 'middle' }, '0 Hz'));
      svg.appendChild(S('text', { class: 'tick v3', x: x1, y: 54, 'text-anchor': 'middle', style: 'fill: currentColor; font-weight: 600' }, KIT.fmt.si(B, 'Hz', 4)));
      svg.appendChild(S('text', { class: 'tick v3', x: (x0 + x1) / 2, y: 28, 'text-anchor': 'middle', style: 'fill: currentColor; font-weight: 600' }, label));
      return svg;
    };
  }

  /* ---------- l03a.baud: data elements → signal elements → baud rate → bandwidth ---------- */
  var R_OF = { a: 1, b: 0.5, c: 2, d: 4 / 3 };
  var SCHEME_RV = { nrzl: 1, nrzi: 1, rz: 0.5, manchester: 0.5, dmanchester: 0.5, ami: 1, '2b1q': 2 };
  function invTex(r) { return r === 1 ? '1' : r === 0.5 ? '2' : r === 2 ? '\\frac{1}{2}' : '\\frac{3}{4}'; }
  KIT.anim.register('l03a.baud', function (p, prob) {
    var tq = KIT.fmt.tq, c = C(), lines = [];
    var F = '\\c{baud}{S} = c \\times \\c{rate}{N} \\times \\frac{1}{\\c{level}{r}}';
    if (p.rCase) {
      var r = R_OF[p.rCase], S = c.baud(p.N, r, 0.5);
      lines.push({ step: 0, tex: F, figure: elementsFig(r),
        caption: 'The <b>signal rate</b> S counts signal elements per second; the <b>data rate</b> N counts data elements (bits). Here r = ' + KIT.fmt.num(r, 4) + ' data elements ride on each signal element.' });
      lines.push({ step: 1, tex: 'c = \\frac{1}{2}', caption: 'Average case: c = ½ (worst case c = 1, best case c = 0).' });
      lines.push({ step: 2, tex: '\\frac{1}{\\c{level}{r}} = \\c{level}{' + invTex(r) + '}', caption: 'One over r: how many signal elements each data element needs.' });
      lines.push({ step: 3, tex: '\\c{baud}{S} = \\frac{1}{2} \\times ' + tq('rate', p.N, 'bps') + ' \\times \\c{level}{' + invTex(r) + '} = ' + tq('baud', S, 'baud'),
        caption: 'Substitute and multiply: the average baud rate is ' + KIT.fmt.si(S, 'baud', 4) + '.' });
      return KIT.anim.eqFrames(lines);
    }
    var name = c.NAMES[p.scheme], n2 = p.block ? c.rate4b5b(p.N) : p.N, rv = SCHEME_RV[p.scheme];
    var S2 = c.avgBaud(p.scheme, n2), B = c.minBandwidth(p.scheme, n2), k = 0;
    if (p.block) {
      lines.push({ step: k++, tex: "\\c{rate}{N'} = " + tq('rate', p.N, 'bps') + ' \\times \\frac{5}{4} = ' + tq('rate', n2, 'bps'),
        figure: elementsFig(0.8, { top: 'data bits', bottom: 'code bits after 4B/5B', bottomSlot: 1 }), caption: '4B/5B: every 4 data bits leave as 5 code bits, so the line rate rises by a quarter.' });
    }
    lines.push({ step: k++, tex: '\\c{level}{r} = \\c{level}{' + (rv === 0.5 ? '\\frac{1}{2}' : rv) + '}', figure: elementsFig(rv),
      caption: '<b>' + name + '</b>: ' + (rv === 1 ? 'one signal element per bit (r = 1).' : rv === 0.5 ? 'two signal elements per bit (r = ½).' : 'one signal element per pair of bits (r = 2).') });
    lines.push({ step: k++, tex: F.replace('{N}', p.block ? "{N'}" : '{N}') + ' = \\frac{1}{2} \\times ' + tq('rate', n2, 'bps') + ' \\times \\c{level}{' + invTex(rv) + '} = ' + tq('baud', S2, 'baud'),
      caption: 'Average case c = ½: the line sends ' + KIT.fmt.si(S2, 'baud', 4) + '.' });
    lines.push({ step: k++, tex: '\\c{bw}{B_{\\min}} = \\c{baud}{S} = ' + tq('bw', B, 'Hz'), figure: bandFig(B, 'minimum bandwidth'),
      caption: 'The minimum bandwidth equals the average signal rate.' });
    return KIT.anim.eqFrames(lines);
  });

  /* ---------- l03a.draw: the waveform drawn bit by bit, one code at a time ---------- */
  KIT.anim.register('l03a.draw', function (p, prob) {
    var encs = p.schemes.map(function (s) { return C().encode(s, p.bits); });
    var frames = [];
    // state: which code is being drawn (si), how many bits of it are done (j); earlier codes are complete, later ones blank.
    function render(si, j, focusBit) {
      return function () {
        var lay = KIT.ui.gridLayout(prob.inputs, 640);
        var box = KIT.h('div', { class: 'anim-waves' });
        encs.forEach(function (e, k) {
          var cpb = e.cellsPerBit, o = {
            cellsPerBit: cpb, bits: p.bits, levelSet: e.levelSet, title: C().NAMES[e.scheme], init: e.init ? e.init.level : undefined,
            titleWidth: lay.titleWidth, bitWidth: lay.bitWidth, stubSpace: true
          };
          if (k > si) o.blank = true;
          if (k === si) {
            var cellsDone = cpb >= 1 ? j * cpb : j;               // j counts bits (pairs for 2B1Q)
            o.reveal = cellsDone;
            if (focusBit !== null) {
              var c0 = cpb >= 1 ? focusBit * cpb : focusBit;
              o.focus = { from: c0, to: c0 + (cpb >= 1 ? cpb : 1) };
              o.highlight = [{ from: cpb >= 1 ? focusBit : focusBit * 2, to: cpb >= 1 ? focusBit + 1 : focusBit * 2 + 2 }];
            }
          }
          box.appendChild(KIT.svg.wave(e.levels, o));
        });
        return box;
      };
    }
    encs.forEach(function (e, si) {
      var name = C().NAMES[e.scheme];
      var units = e.cellsPerBit >= 1 ? p.bits.length : p.bits.length / 2;
      frames.push({ step: 2 * si, caption: '<b>' + name + '</b>: ' + RULE[e.scheme], render: render(si, 0, null) });
      for (var j = 0; j < units; j++) {
        frames.push({ step: 2 * si + 1, caption: '<b>' + name + '</b> — ' + reason(e.scheme, e, j), render: render(si, j + 1, j) });
      }
    });
    frames.push({
      step: prob.steps.length - 1,
      caption: 'Done: ' + p.schemes.map(function (s) { return C().NAMES[s]; }).join(', ') + ' for ' + b(p.bits) + '. Compare each bit column with the rule.',
      render: render(encs.length, 0, null)
    });
    return frames;
  });
})();
