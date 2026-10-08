/* L03a line-coding figures + interactive visualizer. Owner: Lead (taken over from O2).
   KIT.draw.linecode(scheme, bits, opts) → SVG waveform using KIT.calc.linecode.encode (slide conventions).
   <figure data-fig="l03a.linecode" data-scheme="nrzl,nrzi" data-bits="01001110"> stacks one waveform per scheme. */
(function () {
  'use strict';
  var h = KIT.h;
  function LC() { return KIT.calc.linecode; }

  // Properties per scheme, from the slides (L03 pp20–46).
  var PROPS = {
    unipolar: { r: '1', S: 'N/2', dc: 'yes', sync: 'no (long 0s or 1s)', ref: 'L03 p20' },
    nrzl: { r: '1', S: 'N/2', dc: 'yes (worse)', sync: 'no (long 0s or 1s)', ref: 'L03 p24' },
    nrzi: { r: '1', S: 'N/2', dc: 'yes', sync: 'no (long 0s)', ref: 'L03 p24' },
    rz: { r: '1/2', S: 'N', dc: 'no', sync: 'yes', ref: 'L03 p26' },
    manchester: { r: '1/2', S: 'N', dc: 'no', sync: 'yes (mid-bit transition)', ref: 'L03 p30' },
    dmanchester: { r: '1/2', S: 'N', dc: 'no', sync: 'yes (mid-bit transition)', ref: 'L03 p30' },
    ami: { r: '1', S: 'N/2', dc: 'no', sync: 'no (long 0s)', ref: 'L03 p33' },
    pseudoternary: { r: '1', S: 'N/2', dc: 'no', sync: 'no (long 1s)', ref: 'L03 p33' },
    '2b1q': { r: '2', S: 'N/4', dc: 'yes (no redundancy)', sync: 'no (long same double bits)', ref: 'L03 p39; L03 p46' },
    mlt3: { r: '1', S: 'N/3 (summary table)', dc: '—', sync: 'no (long 0s)', ref: 'L03 p45; L03 p46' }
  };
  KIT.data.lineProps = PROPS;

  KIT.draw.linecode = function (scheme, bits, opts) {
    opts = opts || {};
    var e = LC().encode(scheme, bits);
    return KIT.svg.wave(e.levels, {
      cellsPerBit: e.cellsPerBit, bits: bits, levelSet: e.levelSet,
      title: opts.title === undefined ? LC().NAMES[scheme] : opts.title,
      init: e.init ? e.init.level : undefined, bitWidth: opts.bitWidth || 34, highlight: opts.highlight,
      titleWidth: opts.titleWidth === undefined ? 150 : opts.titleWidth, stubSpace: true
    });
  };

  KIT.fig.register('l03a.linecode', function (el, d) {
    var bits = d.bits || '01001110';
    String(d.scheme || 'nrzl').split(',').forEach(function (s) {
      el.appendChild(KIT.draw.linecode(s.trim(), bits));
    });
    if (d.caption) el.appendChild(h('figcaption', null, d.caption));
  });

  /* ---------- interactive: line-coding visualizer ---------- */
  var ORDER = ['unipolar', 'nrzl', 'nrzi', 'rz', 'manchester', 'dmanchester', 'ami', 'pseudoternary', '2b1q', 'mlt3'];
  KIT.viz.register('l03a.linecode', {
    topic: 'l03a', title: 'Line-coding visualizer', tier: 1,
    blurb: 'Type any bits and compare the schemes side by side — watch for long flat stretches (baseline wandering, lost sync) and for mid-bit transitions (self-clocking).',
    mount: function (el, opts) {
      opts = opts || {};
      var p = opts.params || {};
      var st = { bits: p.bits || '01001110', on: (p.schemes || 'nrzl,nrzi,manchester,dmanchester,ami').split(',') };
      var waves = h('div', { class: 'viz-stage' }), table = h('div', { class: 'table-wrap' });
      function draw() {
        KIT.clear(waves); KIT.clear(table);
        var bits = st.bits;
        var rows = [];
        ORDER.forEach(function (s) {
          if (st.on.indexOf(s) < 0) return;
          var b = s === '2b1q' && bits.length % 2 ? bits + '0' : bits;
          waves.appendChild(KIT.draw.linecode(s, b));
          var pr = PROPS[s];
          rows.push(h('tr', null, h('td', null, LC().NAMES[s]), h('td', null, pr.r), h('td', null, pr.S), h('td', null, pr.dc), h('td', null, pr.sync)));
        });
        if (bits.length % 2 && st.on.indexOf('2b1q') >= 0) waves.appendChild(h('div', { class: 'small muted' }, '2B1Q needs an even number of bits — a 0 was appended.'));
        table.appendChild(h('table', { class: 'tbl compact' },
          h('thead', null, h('tr', null, h('th', null, 'Scheme'), h('th', null, 'r'), h('th', null, 'S (avg)'), h('th', null, 'DC component'), h('th', null, 'Self-sync'))),
          h('tbody', null, rows)));
      }
      if (!opts.static) {
        var inp = h('input', { class: 'inp mono', value: st.bits, maxlength: '16', size: '18', 'aria-label': 'Bits (0 and 1 only)' });
        inp.addEventListener('input', function () {
          var v = inp.value.replace(/[^01]/g, '').slice(0, 16);
          if (v !== inp.value) inp.value = v;
          st.bits = v || '0';
          draw();
        });
        var boxes = h('div', { class: 'btn-row' }, ORDER.map(function (s) {
          var cb = h('input', { type: 'checkbox', checked: st.on.indexOf(s) >= 0 });
          cb.addEventListener('change', function () {
            st.on = ORDER.filter(function (x) { return x === s ? cb.checked : st.on.indexOf(x) >= 0; });
            draw();
          });
          return h('label', { class: 'chip', style: { padding: '3px 9px' } }, cb, ' ', LC().NAMES[s]);
        }));
        var presets = h('div', { class: 'btn-row' }, [['01001110', 'Slide 23'], ['010011', 'Slide 29'], ['00000000', 'Long zeros'], ['11111111', 'Long ones']].map(function (pp) {
          var b = h('button', { class: 'btn ghost', type: 'button' }, pp[1] + ' (' + pp[0] + ')');
          b.addEventListener('click', function () { inp.value = pp[0]; st.bits = pp[0]; draw(); });
          return b;
        }));
        el.appendChild(h('div', { class: 'btn-row' }, h('label', null, 'Bits ', inp)));
        el.appendChild(boxes);
        el.appendChild(presets);
      }
      el.appendChild(waves);
      el.appendChild(table);
      draw();
      return {
        set: function (q) { if (q.bits) st.bits = q.bits; if (q.schemes) st.on = q.schemes.split(','); draw(); },
        destroy: function () { KIT.clear(el); }
      };
    }
  });
})();
