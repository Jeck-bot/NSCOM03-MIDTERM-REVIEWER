/* L03a figure: 4B/5B substitution for a short stream (slides 50–52). Owner: Lead (taken over from O2). */
(function () {
  'use strict';
  var h = KIT.h;
  KIT.fig.register('l03a.blockcode', function (el, d) {
    var L = KIT.calc.linecode, bits = d.bits || '000011110001';
    var groups = KIT.util.chunk(bits, 4);
    var row = h('div', { class: 'blockcode-row' }, groups.map(function (g) {
      return h('div', { class: 'bc-cell' }, h('div', { class: 'mono' }, g), h('div', { class: 'bc-arrow' }, '↓'), h('div', { class: 'mono bc-code' }, L.TABLE_4B5B[g]));
    }));
    el.appendChild(row);
    var coded = L.encode4b5b(bits);
    el.appendChild(KIT.draw.linecode('nrzi', coded, { title: 'NRZ-I' }));
    el.appendChild(h('figcaption', null, d.caption || 'Division into 4-bit groups → substitution with 5-bit codes → combination, then NRZ-I line coding (slide 50). The long run of 0s in 0000 becomes 11110.'));
  });
})();
