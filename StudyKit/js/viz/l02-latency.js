/* L02 drawing helper: latency components (used by the l02.latency answer key) + figure. Owner: Lead (taken over from O1). */
(function () {
  'use strict';
  var h = KIT.h;
  /** KIT.draw.latency({Tp, Tt, queue, processing}) → proportional bar of the delay components with values. */
  KIT.draw.latency = function (o) {
    o = o || {};
    var parts = [['Transmission', o.Tt || 0, 1], ['Propagation', o.Tp || 0, 2], ['Queuing', o.queue || 0, 3], ['Processing', o.processing || 0, 4]].filter(function (p) { return p[1] > 0; });
    var total = parts.reduce(function (a, p) { return a + p[1]; }, 0) || 1;
    var bar = h('div', { class: 'lat-bar' }, parts.map(function (p) {
      var seg = h('span', { class: 'lat-seg', title: p[0] + ': ' + KIT.fmt.si(p[1], 's', 4) });
      seg.style.setProperty('flex-grow', String(Math.max(p[1] / total, 0.004)));
      seg.style.setProperty('background', 'var(--series-' + p[2] + ')');
      return seg;
    }));
    var legend = KIT.svg.legend(parts.map(function (p) { return { label: p[0] + ' ' + KIT.fmt.si(p[1], 's', 4), color: p[2] }; }));
    return h('div', { class: 'lat-wrap' }, bar, legend, h('div', { class: 'small' }, 'Latency = ' + parts.map(function (p) { return p[0].toLowerCase(); }).join(' + ') +
      ' = ' + KIT.fmt.si(total, 's', 4) + (parts.length > 1 ? '. The largest share dominates the delay.' : '.')));
  };
  KIT.fig.register('l02.latency', function (el, d) {
    el.appendChild(KIT.draw.latency({ Tp: 0.05, Tt: 0.00002 }));
    el.appendChild(h('figcaption', null, d.caption || 'Slide 37: for a 2.5 KB e-mail over 12,000 km at 1 Gbps, propagation (50 ms) dwarfs transmission (0.020 ms).'));
  });
})();
