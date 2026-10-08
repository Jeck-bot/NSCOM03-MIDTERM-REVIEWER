/* L03b figure: delta-modulation staircase (default: the slide-85 bits 011111100000011). Owner: Lead. */
(function () {
  'use strict';
  var h = KIT.h;
  KIT.draw.dmStaircase = function (bits, opts) {
    opts = opts || {};
    var start = opts.start === undefined ? 0 : opts.start;
    var st = KIT.calc.pcm.dmDecode(bits, 1, start);
    var data = [[0, start]].concat(st.map(function (y, i) { return [i + 1, y]; }));
    var lo = Math.min.apply(null, data.map(function (p) { return p[1]; })) - 1, hi = Math.max.apply(null, data.map(function (p) { return p[1]; })) + 1;
    var ticks = [];
    for (var i = 0; i < bits.length; i++) ticks.push(i + 0.5);
    return KIT.svg.plot({
      width: opts.width || 600, height: opts.height || 200, x: [0, bits.length], y: [lo, hi],
      xTicks: ticks, xFormat: function (v) { return bits.charAt(Math.floor(v)); }, yTicks: 4, yFormat: function (v) { return KIT.fmt.num(v, 3) + 'δ'; },
      xLabel: 'transmitted bit in each interval T (1 = step up, 0 = step down)', hover: false, legend: false,
      title: 'Delta modulation staircase for ' + bits,
      series: [{ kind: 'step', data: data, until: bits.length, color: 1 }]
    });
  };
  /* interactive: a staircase chasing a sine — step size δ vs how fast the signal moves */
  KIT.viz.register('l03b.dm', {
    topic: 'l03b', title: 'Delta modulation: step size vs signal speed', tier: 1,
    blurb: 'A 1-bit staircase chases the signal. Too small a step can\'t keep up with fast changes; too big a step jitters when the signal is flat.',
    mount: function (el, opts) {
      opts = opts || {};
      var st = { delta: 0.15, speed: 1 };
      var box = h('div', { class: 'viz-stage' }), read = h('div', { class: 'viz-readout small' });
      function draw() {
        KIT.clear(box); KIT.clear(read);
        var n = 48, samples = [], tt = [];
        for (var i = 0; i < n; i++) { var t = i / n * 2; tt.push(t); samples.push(Math.sin(2 * Math.PI * st.speed * t / 2)); }
        var dm = KIT.calc.pcm.deltaMod(samples, st.delta, 0);
        var stairs = [[0, 0]].concat(dm.staircase.map(function (y, i) { return [tt[i] + 2 / n, y]; }));
        var worst = 0;
        samples.forEach(function (x, i) { worst = Math.max(worst, Math.abs(x - dm.staircase[i])); });
        box.appendChild(KIT.svg.plot({
          width: 640, height: 220, x: [0, 2], y: [-1.6, 1.6], yTicks: [-1, 0, 1], xTicks: [0, 0.5, 1, 1.5, 2], hover: false, title: 'Delta modulation',
          series: [{ fn: function (t) { return Math.sin(2 * Math.PI * st.speed * t / 2); }, color: 1, label: 'Analog signal' },
            { kind: 'step', data: stairs, until: 2, color: 2, label: 'Staircase (decoded)' }]
        }));
        read.appendChild(h('div', null, 'Bits: ', h('span', { class: 'mono' }, dm.bits)));
        read.appendChild(h('div', { class: 'fb ' + (worst < 0.3 ? 'ok' : 'bad') }, worst < 0.3 ? '✓ The staircase keeps up (largest gap ' + KIT.fmt.num(worst, 2) + ').'
          : '✗ Large errors (largest gap ' + KIT.fmt.num(worst, 2) + ') — the signal changes faster than δ per sample can follow.'));
      }
      if (!opts.static) {
        var d = h('input', { type: 'range', min: '0.03', max: '0.5', step: '0.01', value: String(st.delta), 'aria-label': 'Step size delta' });
        var s = h('input', { type: 'range', min: '0.5', max: '4', step: '0.1', value: String(st.speed), 'aria-label': 'Signal speed' });
        d.addEventListener('input', function () { st.delta = Number(d.value); draw(); });
        s.addEventListener('input', function () { st.speed = Number(s.value); draw(); });
        el.appendChild(h('div', { class: 'btn-row' }, h('label', null, 'Step δ ', d), h('label', null, 'Signal speed ', s)));
      }
      el.appendChild(box); el.appendChild(read);
      draw();
      return { set: function (q) { if (q.delta) st.delta = q.delta; if (q.speed) st.speed = q.speed; draw(); }, destroy: function () { KIT.clear(el); } };
    }
  });

  KIT.fig.register('l03b.dm', function (el, d) {
    el.appendChild(KIT.draw.dmStaircase(d.bits || '011111100000011', { start: d.start ? Number(d.start) : 0 }));
    if (d.caption) el.appendChild(KIT.h('figcaption', null, d.caption));
  });
})();
