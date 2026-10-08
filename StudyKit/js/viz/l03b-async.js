/* L03b figures: asynchronous vs synchronous serial framing. Owner: Lead. */
(function () {
  'use strict';
  KIT.draw.serialFrames = function (mode, opts) {
    opts = opts || {};
    var spans = [], t = 0;
    function add(len, label, color, kind) { spans.push({ t0: t, t1: t + len, label: label, color: color, kind: kind }); t += len; }
    if (mode === 'async') {
      [['11111011', 2], ['00010111', 4], ['01101001', 1]].forEach(function (c) {
        add(2, '0', 2); add(8, 'data ' + c[0], 1); add(2, '1', 3); if (c[1]) add(c[1], 'gap (idle)', null, 'idle');
      });
    } else {
      ['11111011', '11110110', '10010111', '11110111'].forEach(function (b) { add(8, b, 1); });
    }
    return KIT.svg.timeline({
      width: opts.width || 640, laneHeight: 34, labelWidth: 96, t: [0, t], ticks: false,
      title: mode === 'async' ? 'Asynchronous (schematic, not to scale): start and stop bits around every byte, gaps allowed' : 'Synchronous: bytes back to back inside a frame',
      lanes: [{ label: mode === 'async' ? 'Asynchronous' : 'Synchronous', spans: spans }]
    });
  };
  KIT.fig.register('l03b.async', function (el, d) {
    el.appendChild(KIT.draw.serialFrames('async'));
    el.appendChild(KIT.draw.serialFrames('sync'));
    el.appendChild(KIT.svg.legend([{ label: 'start bit (0)', color: 2 }, { label: 'data byte', color: 1 }, { label: 'stop bit (1)', color: 3 }]));
    if (d.caption) el.appendChild(KIT.h('figcaption', null, d.caption));
  });
})();
