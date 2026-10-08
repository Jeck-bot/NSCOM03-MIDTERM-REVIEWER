/* L04 visuals (golden slice — copy this pattern). Owner: Lead.
   - KIT.draw.constellation(scheme, {highlight, used}) → SVG   (also used by answer keys)
   - KIT.draw.modwave(bits, scheme, opts) → SVG                (one modulated waveform)
   - figures: <figure data-fig="l04.constellation" data-scheme="qpsk">, <figure data-fig="l04.modwaves" data-bits="10110">
   - viz 'l04.constellation': modulation studio (bits + scheme → waveform + constellation). */
(function () {
  'use strict';
  var h = KIT.h;
  var NAMES = { ook: 'ASK (OOK)', bfsk: 'Binary FSK', bpsk: 'BPSK', qpsk: 'QPSK', '16qam': '16-QAM' };

  /** Constellation diagram. Highlighted point uses series 2; used points series 1; others muted outline. */
  KIT.draw.constellation = function (scheme, opts) {
    opts = opts || {};
    var pts = KIT.calc.modulation.constellation(scheme);
    var lim = scheme === '16qam' ? 4 : 1.6;
    var normal = pts.filter(function (p) { return p.bits !== opts.highlight; });
    var hi = pts.filter(function (p) { return p.bits === opts.highlight; });
    var series = [{ kind: 'points', data: normal.map(function (p) { return [p.i, p.q]; }), labels: normal.map(function (p) { return p.bits; }),
      color: 1, r: 4.5, labelDx: 6, labelDy: -6 }];
    if (hi.length) series.push({ kind: 'points', data: [[hi[0].i, hi[0].q]], labels: [hi[0].bits], color: 2, r: 7, labelDx: 9, labelDy: -9 });
    var svg = KIT.svg.plot({
      width: opts.width || 300, height: opts.height || 300, x: [-lim, lim], y: [-lim, lim], equal: true,
      xTicks: scheme === '16qam' ? [-3, -1, 1, 3] : [-1, 1], yTicks: scheme === '16qam' ? [-3, -1, 1, 3] : [-1, 1],
      xLabel: 'In-phase (I)', yLabel: 'Quadrature (Q)', series: series, hover: false, legend: false,
      margin: { l: 44, r: 16, t: 14, b: 36 }, title: (NAMES[scheme] || scheme) + ' constellation'
    });
    return svg;
  };

  /** One modulated carrier for a bit string. scheme: ook | bfsk | bpsk | qpsk | 16qam. */
  KIT.draw.modwave = function (bits, scheme, opts) {
    opts = opts || {};
    var wv = KIT.calc.modulation.waveform(scheme, bits), syms = wv.symbols, seg = wv.fn;
    return KIT.svg.plot({
      width: opts.width || 560, height: opts.height || 96, x: [0, syms.length], y: [-1.15, 1.15],
      xTicks: syms.map(function (_, i) { return i + 0.5; }), xFormat: function (v) { return syms[Math.floor(v)] || ''; },
      yTicks: [0], yFormat: function () { return ''; }, xGrid: false, hover: false, legend: false,
      series: [{ fn: seg, samples: Math.max(240, syms.length * 120), color: 1 }],
      vlines: syms.map(function (_, i) { return { at: i }; }).slice(1),
      margin: { l: 70, r: 8, t: 8, b: 22 }, title: (NAMES[scheme] || scheme) + ' for ' + bits
    });
  };

  function labeled(label, node) {
    return h('div', { class: 'modwave-row' }, h('div', { class: 'small', style: { fontWeight: '600', margin: '6px 0 0' } }, label), node);
  }

  KIT.fig.register('l04.constellation', function (el, d) {
    el.appendChild(KIT.draw.constellation(d.scheme || 'qpsk', { highlight: d.highlight }));
    if (d.caption) el.appendChild(h('figcaption', null, d.caption));
  });
  KIT.fig.register('l04.modwaves', function (el, d) {
    var bits = d.bits || '10110';
    (d.schemes || 'ook,bfsk,bpsk').split(',').forEach(function (s) {
      el.appendChild(labeled(NAMES[s] || s, KIT.draw.modwave(bits, s)));
    });
    if (d.caption) el.appendChild(h('figcaption', null, d.caption));
  });

  /* ---------- interactive: modulation studio ---------- */
  KIT.viz.register('l04.constellation', {
    topic: 'l04', title: 'Modulation studio: ASK, FSK, PSK, QPSK, 16-QAM', tier: 1,
    blurb: 'Type bits, pick a scheme, and watch the carrier change — then find each symbol on the constellation.',
    mount: function (el, opts) {
      opts = opts || {};
      var state = { bits: (opts.params && opts.params.bits) || '10110010', scheme: (opts.params && opts.params.scheme) || 'qpsk' };
      var waveBox = h('div', { class: 'viz-stage' }), conBox = h('div'), info = h('div', { class: 'small muted' });
      function draw() {
        KIT.clear(waveBox); KIT.clear(conBox);
        var r = { ook: 1, bfsk: 1, bpsk: 1, qpsk: 2, '16qam': 4 }[state.scheme];
        var bits = state.bits.slice(0, Math.floor(state.bits.length / r) * r) || '0'.repeat(r);
        waveBox.appendChild(KIT.draw.modwave(bits, state.scheme, { width: 600, height: 110 }));
        var last = bits.slice(-r);
        conBox.appendChild(KIT.draw.constellation(state.scheme === 'bfsk' ? 'bpsk' : state.scheme, { highlight: state.scheme === 'bfsk' ? null : last, width: 260, height: 260 }));
        info.textContent = 'r = ' + r + ' bit' + (r > 1 ? 's' : '') + ' per signal element → ' + bits.length / r + ' signal elements for ' + bits.length + ' bits. ' +
          (state.scheme === 'bfsk' ? 'FSK changes frequency, so a constellation doesn\'t apply.' : 'Highlighted: the last symbol, ' + last + '.');
      }
      if (!opts.static) {
        var inp = h('input', { class: 'inp mono', value: state.bits, maxlength: '16', size: '18', 'aria-label': 'Bits (0 and 1 only)' });
        inp.addEventListener('input', function () {
          var v = inp.value.replace(/[^01]/g, '').slice(0, 16);
          if (v !== inp.value) inp.value = v;
          state.bits = v || '0';
          draw();
        });
        var sel = h('select', { class: 'inp', 'aria-label': 'Scheme' }, Object.keys(NAMES).map(function (k) {
          return h('option', { value: k, selected: k === state.scheme }, NAMES[k]);
        }));
        sel.addEventListener('change', function () { state.scheme = sel.value; draw(); });
        el.appendChild(h('div', { class: 'btn-row' }, h('label', null, 'Bits ', inp), h('label', null, 'Scheme ', sel)));
      }
      el.appendChild(waveBox);
      el.appendChild(h('div', { style: { display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' } }, conBox, info));
      draw();
      return {
        set: function (p) { if (p.scheme) state.scheme = p.scheme; if (p.bits) state.bits = p.bits; draw(); },
        destroy: function () { KIT.clear(el); }
      };
    }
  });
})();
