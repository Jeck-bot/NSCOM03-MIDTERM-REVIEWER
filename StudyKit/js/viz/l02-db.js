/* L02 drawing helpers: decibel chain (used by the l02.db answer key) and attenuation figure. Owner: Lead (taken over from O1). */
(function () {
  'use strict';
  var h = KIT.h;
  /** KIT.draw.dbchain({stages: [-10, 30, -10]}) → a row of stages with the running total in dB. */
  KIT.draw.dbchain = function (o) {
    var stages = (o && o.stages) || [];
    var row = h('div', { class: 'dbchain' }), total = 0;
    row.appendChild(h('div', { class: 'db-end' }, 'In'));
    stages.forEach(function (s) {
      total += s;
      row.appendChild(h('div', { class: 'db-arrow' }, '→'));
      row.appendChild(h('div', { class: 'db-stage ' + (s < 0 ? 'loss' : 'gain') },
        h('div', { class: 'db-val' }, (s < 0 ? '−' : '+') + KIT.fmt.num(Math.abs(s), 4) + ' dB'),
        h('div', { class: 'small muted' }, s < 0 ? 'loss' : 'amplifier'),
        h('div', { class: 'small' }, 'running total ' + (total < 0 ? '−' : '+') + KIT.fmt.num(Math.abs(total), 4) + ' dB')));
    });
    row.appendChild(h('div', { class: 'db-arrow' }, '→'));
    row.appendChild(h('div', { class: 'db-end' }, 'Out'));
    return h('div', null, row, h('div', { class: 'small muted' }, 'Decibels of cascaded stages add; convert the total back with P_out = P_in × 10^(dB/10).'));
  };
  // Slide 20: original → transmission medium (attenuated) → amplifier.
  KIT.fig.register('l02.attenuation', function (el, d) {
    el.appendChild(KIT.draw.dbchain({ stages: [-3, 3] }));
    el.appendChild(h('figcaption', null, d.caption || 'Slide 20: the medium attenuates the signal (point 1 → point 2); an amplifier restores it (point 2 → point 3). Here: half the power lost (−3 dB), then doubled (+3 dB).'));
  });
})();
