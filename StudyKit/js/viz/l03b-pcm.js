/* L03b figures: PCM pipeline, Nyquist sampling cases, the slide-76 quantization table. Owner: Lead. */
(function () {
  'use strict';
  var h = KIT.h;
  function cap(el, d) { if (d && d.caption) el.appendChild(h('figcaption', null, d.caption)); }

  /** Analog → PAM samples → quantized midpoints (L = 8 zones between −4 and +4). */
  KIT.draw.pcmPipeline = function (opts) {
    opts = opts || {};
    var sig = function (t) { return 2.6 * Math.sin(2 * Math.PI * t / 10) + 0.9 * Math.sin(2 * Math.PI * t / 4); };
    var pts = [], q = [];
    for (var k = 0; k <= 20; k++) {
      var y = sig(k);
      pts.push([k, y]);
      var zone = Math.max(0, Math.min(7, Math.floor(y + 4)));
      q.push([k, zone - 4 + 0.5]);
    }
    return KIT.svg.plot({
      width: opts.width || 600, height: opts.height || 230, x: [0, 20], y: [-4, 4], yTicks: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
      yFormat: function (v) { return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + 'Δ'; }, xTicks: [0, 5, 10, 15, 20],
      xLabel: 'sample number (one every T_s)', yLabel: 'amplitude', hover: false, title: 'PCM: sample, then quantize',
      series: [
        { fn: sig, color: 1, label: 'Analog signal' },
        { kind: 'stems', data: pts, color: 3, r: 3, label: 'PAM samples' },
        { kind: 'points', data: q, color: 2, r: 4, label: 'Quantized (zone midpoint)' }
      ]
    });
  };

  /** Sine sampled at ratio = f_s / f (4 = oversampling, 2 = Nyquist rate, 0.8 = undersampling). */
  KIT.draw.sampling = function (ratio, opts) {
    opts = opts || {};
    var f = function (t) { return Math.sin(2 * Math.PI * t); };
    var Ts = 1 / ratio, off = ratio === 2 ? 0.25 : 0, pts = [];
    for (var t = off; t <= 3 + 1e-9; t += Ts) pts.push([Number(t.toFixed(6)), f(t)]);
    return KIT.svg.plot({
      width: opts.width || 560, height: opts.height || 120, x: [0, 3], y: [-1.2, 1.2], yTicks: [0], yFormat: function () { return ''; },
      xTicks: [0, 1, 2, 3], xFormat: function (v) { return v ? v + 'T' : '0'; }, hover: false, legend: false,
      margin: { l: 20, r: 10, t: 8, b: 22 }, title: opts.title || 'sampling',
      series: [{ fn: f, color: 1 }, { data: pts, color: 2, dashed: true }, { kind: 'points', data: pts, color: 2, r: 4 }]
    });
  };

  // Slide 76: nine samples, Δ = 5 V, codes 0–7 (normalized to Δ units).
  var P76 = [-6.1, 7.5, 16.2, 19.7, 11.0, -5.5, -11.3, -9.4, -6.0];

  KIT.fig.register('l03b.pcm', function (el, d) {
    el.appendChild(KIT.draw.pcmPipeline());
    cap(el, d);
  });

  KIT.fig.register('l03b.sampling', function (el, d) {
    [[4, 'Oversampling: f_s = 4f — the same shape, with redundant samples'], [2, 'Nyquist rate: f_s = 2f — just enough to rebuild the wave'],
      [0.8, 'Undersampling: f_s below 2f — the samples trace a slower, false wave (the slide labels this f_s = f)']].forEach(function (c) {
      el.appendChild(h('div', { class: 'small', style: { fontWeight: '600', marginTop: '6px' } }, c[1]));
      el.appendChild(KIT.draw.sampling(c[0], { title: c[1] }));
    });
    cap(el, d);
  });

  /* ---------- interactive: PCM lab (sampling rate + quantization levels) ---------- */
  KIT.viz.register('l03b.pcm', {
    topic: 'l03b', title: 'PCM lab: sampling rate and quantization levels', tier: 1,
    blurb: 'Slide the sampling rate below 2f and watch the samples lie; add quantization levels and watch the error shrink — while the bit rate grows.',
    mount: function (el, opts) {
      opts = opts || {};
      var p = opts.params || {};
      var st = { ratio: p.ratio ? Number(p.ratio) : 4, L: p.L ? Number(p.L) : 8 };
      var plotBox = h('div', { class: 'viz-stage' }), read = h('div', { class: 'viz-readout small' });
      var sig = function (t) { return Math.sin(2 * Math.PI * t); };         // f = 1 cycle per unit time, amplitude 1
      function draw() {
        KIT.clear(plotBox); KIT.clear(read);
        var Ts = 1 / st.ratio, pts = [], q = [], delta = 2 / st.L, errMax = 0;
        for (var t = 0; t <= 3 + 1e-9; t += Ts) {
          var v = sig(t), k = Math.max(0, Math.min(st.L - 1, Math.floor((v + 1) / delta + 1e-9)));
          var mid = -1 + (k + 0.5) * delta;
          pts.push([t, v]); q.push([t, mid]); errMax = Math.max(errMax, Math.abs(mid - v));
        }
        plotBox.appendChild(KIT.svg.plot({
          width: 640, height: 240, x: [0, 3], y: [-1.15, 1.15], yTicks: [-1, 0, 1], xTicks: [0, 1, 2, 3],
          xFormat: function (v) { return v ? v + 'T' : '0'; }, hover: false, title: 'PCM lab',
          hlines: [], series: [
            { fn: sig, color: 1, label: 'Analog (frequency f)' },
            { kind: 'step', data: q, until: 3, color: 2, label: 'Quantized, held (what the decoder rebuilds)' },
            { kind: 'points', data: pts, color: 3, r: 3.5, label: 'Samples' }
          ]
        }));
        var ok = st.ratio >= 2;
        var nb = KIT.calc.pcm.bitsPerSample(st.L);
        read.appendChild(h('div', { class: 'fb ' + (ok ? 'ok' : 'bad') }, ok
          ? '✓ f_s = ' + st.ratio + 'f ≥ 2f — the Nyquist condition holds.'
          : '✗ f_s = ' + st.ratio + 'f < 2f — undersampled: the samples trace a false, slower wave.'));
        read.appendChild(h('div', null, 'L = ' + st.L + ' zones → Δ = ' + KIT.fmt.num(delta, 3) + ' (of full scale 2), n_b = log₂L = ' + nb +
          ' bits/sample, worst-case error ≈ Δ/2 = ' + KIT.fmt.num(delta / 2, 3) + '.'));
        read.appendChild(h('div', null, 'For telephone voice (f_max = 4 kHz) at this sampling ratio: f_s = ' + KIT.fmt.si(4000 * st.ratio, 'samples/s') +
          ', bit rate = n_b × f_s = ' + KIT.fmt.si(nb * 4000 * st.ratio, 'bps') + '.'));
      }
      if (!opts.static) {
        var ratio = h('input', { type: 'range', min: '0.5', max: '8', step: '0.1', value: String(st.ratio), 'aria-label': 'Sampling rate as a multiple of f' });
        var ratioLbl = h('b', null, st.ratio + 'f');
        ratio.addEventListener('input', function () { st.ratio = Number(ratio.value); ratioLbl.textContent = st.ratio + 'f'; draw(); });
        var Lsel = h('select', { class: 'inp', 'aria-label': 'Quantization levels' }, [2, 4, 8, 16, 32, 64].map(function (n) {
          return h('option', { value: String(n), selected: n === st.L }, String(n));
        }));
        Lsel.addEventListener('change', function () { st.L = Number(Lsel.value); draw(); });
        el.appendChild(h('div', { class: 'btn-row' }, h('label', null, 'Sampling rate f_s = ', ratioLbl, ' ', ratio), h('label', null, 'Levels L ', Lsel)));
      }
      el.appendChild(plotBox);
      el.appendChild(read);
      draw();
      return { set: function (q) { if (q.ratio) st.ratio = q.ratio; if (q.L) st.L = q.L; draw(); }, destroy: function () { KIT.clear(el); } };
    }
  });

  KIT.fig.register('l03b.quant', function (el, d) {
    var rows = KIT.calc.pcm.quantizeSeries(P76, -20, 20, 8);
    el.appendChild(KIT.svg.plot({
      width: 600, height: 250, x: [0.5, 9.5], y: [-4, 4], yTicks: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
      yFormat: function (v) { return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + 'Δ'; },
      xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9], xLabel: 'sample', yLabel: 'normalized amplitude', hover: false,
      title: 'Slide 76: quantizing nine samples (Δ = 5 V, L = 8)',
      series: [
        { kind: 'stems', data: rows.map(function (r, i) { return [i + 1, r.normalized]; }), color: 1, r: 3.5, label: 'PAM value' },
        { kind: 'points', data: rows.map(function (r, i) { return [i + 1, r.normalizedQuantized]; }), color: 2, r: 4.5,
          labels: rows.map(function (r) { return r.code; }), label: 'Quantized → code' }
      ]
    }));
    cap(el, d);
  });
})();
