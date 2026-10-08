/* L02 figures + interactive sine/composite builder. Owner: Lead (taken over from O1). */
(function () {
  'use strict';
  var h = KIT.h;
  var TAU = 2 * Math.PI;

  // Slide 7: 4 cycles in 1 s (f = 4 Hz, T = 1/4 s), peak amplitude.
  KIT.fig.register('l02.sine', function (el, d) {
    el.appendChild(KIT.svg.plot({ width: 600, height: 200, x: [0, 1], y: [-1.2, 1.2], yTicks: [-1, 0, 1], xTicks: [0, 0.25, 0.5, 0.75, 1],
      xFormat: function (v) { return v + ' s'; }, xLabel: 'time (1 s shown)', hover: false, title: 'Sine wave, f = 4 Hz',
      vlines: [{ at: 0.25, label: 'T = 1/4 s' }], hlines: [{ at: 1, label: 'peak amplitude' }],
      series: [{ fn: function (t) { return Math.sin(TAU * 4 * t); }, color: 1 }] }));
    el.appendChild(h('figcaption', null, d.caption || 'Slide 7: four cycles in 1 s → f = 4 Hz and T = 1/4 s. Peak amplitude is measured from the axis to the crest.'));
  });

  // Slide 8: phases 0°, 90°, 180°, 270°.
  KIT.fig.register('l02.phase', function (el, d) {
    [0, 90, 180, 270].forEach(function (ph) {
      el.appendChild(h('div', { class: 'small', style: { fontWeight: '600', marginTop: '4px' } }, ph + '°' + (ph === 0 ? ' — starts at 0 going up' : ph === 90 ? ' — starts at the peak' : ph === 180 ? ' — starts at 0 going down' : ' — starts at the trough')));
      el.appendChild(KIT.svg.plot({ width: 420, height: 70, x: [0, 2], y: [-1.2, 1.2], yTicks: [0], yFormat: function () { return ''; }, xTicks: [0, 1, 2],
        xFormat: function (v) { return v ? v + 'T' : '0'; }, hover: false, legend: false, margin: { l: 16, r: 8, t: 6, b: 20 }, title: 'phase ' + ph,
        series: [{ fn: function (t) { return Math.sin(TAU * t + ph * Math.PI / 180); }, color: 1 }] }));
    });
    if (d.caption) el.appendChild(h('figcaption', null, d.caption));
  });

  // Slide 12: composite of f, 3f, 9f (time and frequency domain).
  KIT.fig.register('l02.composite', function (el, d) {
    var comp = function (t) { return Math.sin(TAU * t) + Math.sin(TAU * 3 * t) / 3 + Math.sin(TAU * 9 * t) / 9; };
    el.appendChild(KIT.svg.plot({ width: 600, height: 190, x: [0, 2], y: [-1.3, 1.3], yTicks: [0], xTicks: [0, 1, 2], xFormat: function (v) { return v ? v + 'T' : '0'; },
      hover: false, title: 'Composite of f, 3f, 9f',
      series: [{ fn: comp, color: 1, label: 'Composite' }, { fn: function (t) { return Math.sin(TAU * t); }, color: 3, label: 'f (fundamental)', dashed: true }] }));
    el.appendChild(KIT.svg.plot({ width: 600, height: 150, x: [0, 10], y: [0, 1.15], yTicks: [0, 0.5, 1], xTicks: [1, 3, 9], xFormat: function (v) { return v === 1 ? 'f' : v + 'f'; },
      xLabel: 'frequency', hover: false, legend: false, title: 'Spectrum', series: [{ kind: 'stems', data: [[1, 1], [3, 1 / 3], [9, 1 / 9]], color: 2 }] }));
    el.appendChild(h('figcaption', null, d.caption || 'Slide 12: a periodic composite signal built from sine waves at f, 3f and 9f with decreasing amplitudes; f is the fundamental frequency.'));
  });

  // Slide 13: bandwidth of a periodic signal with components 1000–5000 Hz.
  KIT.fig.register('l02.spectrum', function (el, d) {
    var lo = Number(d.lo || 1000), hi = Number(d.hi || 5000), stepF = Number(d.step || 1000), pts = [];
    for (var f = lo; f <= hi + 1e-9; f += stepF) pts.push([f, 0.6 + 0.4 * Math.cos((f - lo) / (hi - lo) * 2)]);
    el.appendChild(KIT.svg.plot({ width: 600, height: 170, x: [0, hi * 1.15], y: [0, 1.15], yTicks: [0], yFormat: function () { return ''; }, xTicks: pts.map(function (p) { return p[0]; }),
      xFormat: function (v) { return KIT.fmt.num(v, 4); }, xLabel: 'frequency (Hz)', hover: false, legend: false, title: 'Bandwidth',
      bands: [{ x0: lo, x1: hi, label: 'B = ' + KIT.fmt.num(hi, 4) + ' − ' + KIT.fmt.num(lo, 4) + ' = ' + KIT.fmt.num(hi - lo, 4) + ' Hz', color: 1 }],
      series: [{ kind: 'stems', data: pts, color: 1 }] }));
    el.appendChild(h('figcaption', null, d.caption || 'Slide 13: bandwidth = highest frequency − lowest frequency.'));
  });

  // Slide 17: approximating bits 0 1 0 with harmonics N/2, 3N/2, 5N/2 in a low-pass channel.
  KIT.fig.register('l02.lowpass', function (el, d) {
    var sq = function (t) { return t < 1 ? -1 : t < 2 ? 1 : -1; };          // bits 0 1 0 as polar levels over 3 bit times
    function approx(n) { return function (t) { var s = 0; for (var k = 1; k <= n; k += 2) s += Math.sin(Math.PI * k * (t - 1)) / k; return 4 / Math.PI * s; }; }   // +1 on the middle (1) bit, like slide 17
    var series = [{ kind: 'step', data: [[0, -1], [1, 1], [2, -1]], until: 3, color: 7, label: 'Digital signal 0 1 0' },
      { fn: approx(1), color: 1, label: 'N/2 only' }, { fn: approx(3), color: 2, label: '+ 3N/2' }, { fn: approx(5), color: 3, label: '+ 5N/2' }];
    void sq;
    el.appendChild(KIT.svg.plot({ width: 620, height: 210, x: [0, 3], y: [-1.5, 1.5], yTicks: [-1, 0, 1], xTicks: [0, 1, 2, 3], xFormat: function (v) { return v + 'T'; },
      hover: false, title: 'Low-pass approximation', series: series }));
    el.appendChild(h('figcaption', null, d.caption || 'Slide 17: in a low-pass channel the digital signal is approximated by an analog one; the first harmonic needs B = N/2, adding 3N/2 and 5N/2 needs B = 5N/2.'));
  });

  // Slides 20, 23, 24: what attenuation, distortion and noise do to the same composite signal.
  KIT.fig.register('l02.impairments', function (el, d) {
    var sent = function (t) { return Math.sin(TAU * t) + Math.sin(TAU * 3 * t) / 3; };
    [['Attenuation — the same shape with less energy (slide 20)', function (t) { return 0.45 * sent(t); }],
      ['Distortion — the components arrive at different times, so the shape changes (slide 23)', function (t) { return Math.sin(TAU * t) + Math.sin(TAU * 3 * (t - 0.09)) / 3; }],
      ['Noise — unwanted energy added on the way (slide 24)', function (t) { return sent(t) + 0.16 * (Math.sin(TAU * 37 * t) + Math.sin(TAU * 53 * t + 1) + Math.sin(TAU * 71 * t + 2)); }]
    ].forEach(function (r) {
      el.appendChild(h('div', { class: 'small', style: { fontWeight: '600', marginTop: '6px' } }, r[0]));
      el.appendChild(KIT.svg.plot({ width: 600, height: 134, x: [0, 2], y: [-1.6, 1.6], yTicks: [0], yFormat: function () { return ''; }, xTicks: [0, 1, 2],
        xFormat: function (v) { return v ? v + 'T' : '0'; }, hover: false, margin: { l: 16, r: 8, t: 30, b: 20 }, title: r[0],
        series: [{ fn: sent, color: 7, dashed: true, label: 'Sent' }, { fn: r[1], color: 1, label: 'Received', samples: 600 }] }));
    });
    if (d.caption) el.appendChild(h('figcaption', null, d.caption));
  });

  /* ---------- interactive: sine & composite builder ---------- */
  KIT.viz.register('l02.sine', {
    topic: 'l02', title: 'Sine wave & composite-signal builder', tier: 1,
    blurb: 'Change amplitude, frequency and phase; then add odd harmonics and watch a square wave appear — and the bandwidth grow.',
    mount: function (el, opts) {
      opts = opts || {};
      var st = { A: 1, f: 2, ph: 0, harm: { 3: false, 5: false, 7: false, 9: false } };
      var timeBox = h('div', { class: 'viz-stage' }), specBox = h('div'), read = h('div', { class: 'viz-readout small' });
      function comps() {
        var c = [{ k: 1, amp: st.A }];
        [3, 5, 7, 9].forEach(function (k) { if (st.harm[k]) c.push({ k: k, amp: st.A / k }); });
        return c;
      }
      function draw() {
        KIT.clear(timeBox); KIT.clear(specBox); KIT.clear(read);
        var c = comps(), phr = st.ph * Math.PI / 180;
        var sig = function (t) { var s = 0; c.forEach(function (x) { s += x.amp * Math.sin(TAU * x.k * st.f * t + x.k * phr); }); return s; };
        timeBox.appendChild(KIT.svg.plot({ width: 620, height: 200, x: [0, 1], y: [-1.6, 1.6], yTicks: [-1, 0, 1], xTicks: [0, 0.25, 0.5, 0.75, 1],
          xFormat: function (v) { return v + ' s'; }, title: 'Time domain', legend: false, series: [{ fn: sig, color: 1, samples: 600 }] }));
        specBox.appendChild(KIT.svg.plot({ width: 620, height: 130, x: [0, 10 * st.f], y: [0, 1.15], yTicks: [0, 1], hover: false, legend: false,
          xTicks: c.map(function (x) { return x.k * st.f; }), xFormat: function (v) { return KIT.fmt.num(v, 3) + ' Hz'; }, title: 'Frequency domain',
          series: [{ kind: 'stems', data: c.map(function (x) { return [x.k * st.f, x.amp]; }), color: 2 }] }));
        var fmax = c[c.length - 1].k * st.f;
        read.appendChild(h('div', null, 'Frequency f = ' + st.f + ' Hz → period T = 1/f = ' + KIT.fmt.num(1 / st.f, 3) + ' s. Phase ' + st.ph + '°.'));
        read.appendChild(h('div', null, c.length > 1 ? 'Composite of ' + c.map(function (x) { return x.k === 1 ? 'f' : x.k + 'f'; }).join(', ') +
          ' → bandwidth = ' + KIT.fmt.num(fmax, 3) + ' − ' + KIT.fmt.num(st.f, 3) + ' = ' + KIT.fmt.num(fmax - st.f, 3) + ' Hz. More harmonics → sharper edges → more bandwidth.'
          : 'A single sine wave occupies one frequency (bandwidth 0). Add harmonics to build a composite signal.'));
      }
      if (!opts.static) {
        function slider(lbl, min, max, step, key) {
          var s = h('input', { type: 'range', min: String(min), max: String(max), step: String(step), value: String(st[key]), 'aria-label': lbl });
          var out = h('b', null, String(st[key]));
          s.addEventListener('input', function () { st[key] = Number(s.value); out.textContent = s.value; draw(); });
          return h('label', null, lbl + ' ', out, ' ', s);
        }
        el.appendChild(h('div', { class: 'btn-row' }, slider('Amplitude', 0.2, 1, 0.1, 'A'), slider('Frequency (Hz)', 1, 5, 1, 'f'), slider('Phase (°)', 0, 270, 90, 'ph')));
        el.appendChild(h('div', { class: 'btn-row' }, [3, 5, 7, 9].map(function (k) {
          var cb = h('input', { type: 'checkbox' });
          cb.addEventListener('change', function () { st.harm[k] = cb.checked; draw(); });
          return h('label', { class: 'chip', style: { padding: '3px 9px' } }, cb, ' add ' + k + 'f');
        })));
      }
      el.appendChild(timeBox); el.appendChild(specBox); el.appendChild(read);
      draw();
      return { set: function (p) { if (p.f) st.f = p.f; if (p.ph !== undefined) st.ph = p.ph; if (p.harm) p.harm.forEach(function (k) { st.harm[k] = true; }); draw(); }, destroy: function () { KIT.clear(el); } };
    }
  });
})();
