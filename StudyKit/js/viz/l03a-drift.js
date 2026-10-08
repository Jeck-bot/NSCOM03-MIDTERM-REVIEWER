/* L03a figure: effect of a faster receiver clock (slide 13, marked "replicate"). Owner: Lead (taken over from O2). */
(function () {
  'use strict';
  var h = KIT.h;
  KIT.fig.register('l03a.drift', function (el, d) {
    var sent = d.sent || '10110001', recv = d.recv || '110111000011';
    var pol = function (s) { return s.split('').map(function (b) { return b === '1' ? 1 : -1; }); };
    var bw = 36, bw2 = bw * sent.length / recv.length;
    el.appendChild(KIT.svg.wave(pol(sent), { bits: sent, levelSet: [1, 0, -1], title: 'Sent', bitWidth: bw }));
    el.appendChild(KIT.svg.wave(pol(recv), { bits: recv, levelSet: [1, 0, -1], title: 'Received', bitWidth: bw2 }));
    el.appendChild(h('figcaption', null, d.caption || 'Slide 13: the receiver’s faster clock samples the same waveform 12 times instead of 8, so 10110001 is read as 110111000011.'));
  });
})();
