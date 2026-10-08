/* L01 figures: OSI ↔ TCP/IP stacks (slides 2–3), analog vs digital signals (slide 16). Owner: Lead. */
(function () {
  'use strict';
  var h = KIT.h;
  function S(t, a, txt) { var e = KIT.s(t, a); if (txt !== undefined) e.textContent = txt; return e; }

  var OSI = [
    ['7', 'Application', 'End-user layer · HTTP, FTP, DNS'],
    ['6', 'Presentation', 'Syntax layer · SSL, JPEG, MPEG'],
    ['5', 'Session', 'Synch & send to port · sockets'],
    ['4', 'Transport', 'End-to-end connections · TCP, UDP'],
    ['3', 'Network', 'Packets · IP, ICMP'],
    ['2', 'Data link', 'Frames · Ethernet, PPP, switch, bridge'],
    ['1', 'Physical', 'Physical structure · coax, fiber, hubs']
  ];
  var TCPIP = [['Application', 0, 3], ['Transport', 3, 1], ['Internet', 4, 1], ['Network access', 5, 2]];

  KIT.draw.osiStack = function (opts) {
    opts = opts || {};
    var rowH = 34, x0 = 4, wNum = 26, wName = 118, wDesc = 236, gap = 26, wT = 150;
    var W = x0 + wNum + wName + wDesc + gap + wT + 6, H = 30 + rowH * 7 + 8;
    var svg = KIT.s('svg', { class: 'kit-svg kit-osi', viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': 'OSI seven layers next to the four-layer TCP/IP model' });
    svg.appendChild(S('text', { class: 'title', x: x0, y: 16 }, 'OSI model (slide 2)'));
    svg.appendChild(S('text', { class: 'title', x: x0 + wNum + wName + wDesc + gap, y: 16 }, 'TCP/IP model (slide 3)'));
    OSI.forEach(function (r, i) {
      var y = 26 + i * rowH, focus = i >= 5;
      svg.appendChild(S('rect', { class: 'osi-row' + (focus ? ' focus' : ''), x: x0, y: y + 1, width: wNum + wName + wDesc, height: rowH - 2, rx: 4 }));
      svg.appendChild(S('text', { class: 'osi-num', x: x0 + 9, y: y + rowH / 2 + 4 }, r[0]));
      svg.appendChild(S('text', { class: 'osi-name', x: x0 + wNum + 4, y: y + rowH / 2 + 4 }, r[1]));
      svg.appendChild(S('text', { class: 'osi-desc', x: x0 + wNum + wName, y: y + rowH / 2 + 4 }, r[2]));
    });
    var tx = x0 + wNum + wName + wDesc + gap;
    TCPIP.forEach(function (t) {
      var y = 26 + t[1] * rowH;
      svg.appendChild(S('rect', { class: 'tcp-row' + (t[1] >= 5 ? ' focus' : ''), x: tx, y: y + 1, width: wT, height: t[2] * rowH - 2, rx: 4 }));
      svg.appendChild(S('text', { class: 'osi-name', x: tx + wT / 2, y: y + t[2] * rowH / 2 + 4, 'text-anchor': 'middle' }, t[0]));
      svg.appendChild(S('line', { class: 'grid', x1: tx - gap + 4, x2: tx - 4, y1: y + t[2] * rowH / 2, y2: y + t[2] * rowH / 2 }));
    });
    return svg;
  };

  KIT.fig.register('l01.osi', function (el, d) {
    el.appendChild(KIT.draw.osiStack());
    el.appendChild(h('figcaption', null, d.caption || 'The two bottom layers (highlighted) are the ones this deck reviews: the data link and physical layers.'));
  });

  // Slide 16: the same bits as a digital (unipolar) signal, and on an analog carrier (AM-like and FM-like).
  KIT.fig.register('l01.analog', function (el, d) {
    var bits = d.bits || '010010';
    el.appendChild(h('div', { class: 'small', style: { fontWeight: '600' } }, 'Digital transmission: 1 = +V, 0 = 0 V'));
    el.appendChild(KIT.svg.wave(bits.split('').map(Number), { bits: bits, levelSet: [1, 0], levelLabels: { 1: '+5 V', 0: '0 V' } }));
    if (KIT.draw.modwave) {
      el.appendChild(h('div', { class: 'small', style: { fontWeight: '600', marginTop: '8px' } }, 'Analog transmission: amplitude changes (AM) …'));
      el.appendChild(KIT.draw.modwave(bits, 'ook', { height: 86 }));
      el.appendChild(h('div', { class: 'small', style: { fontWeight: '600', marginTop: '8px' } }, '… or frequency changes (FM)'));
      el.appendChild(KIT.draw.modwave(bits, 'bfsk', { height: 86 }));
    }
    el.appendChild(h('figcaption', null, d.caption || 'Slide 16: analog transmission varies a carrier (here amplitude or frequency); digital transmission sends voltage levels.'));
  });
})();
