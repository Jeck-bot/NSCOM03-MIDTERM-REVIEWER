/* L02 interactive: Nyquist vs Shannon — choose a rate below capacity, then the levels (slide 33). Owner: Lead (taken over from O1). */
(function () {
  'use strict';
  var h = KIT.h;
  KIT.viz.register('l02.capacity', {
    topic: 'l02', title: 'Data-rate limits: Nyquist vs Shannon', tier: 1,
    blurb: 'Shannon gives the ceiling for a noisy channel; Nyquist tells you the levels needed to reach a chosen rate. Slide 33 in one panel.',
    mount: function (el, opts) {
      opts = opts || {};
      var S = KIT.calc.signals;
      var st = { B: 1e6, snrDb: 18, L: 4 };
      var out = h('div', { class: 'viz-stage' });
      function bar(label, val, max, cls) {
        var pct = Math.max(1, Math.min(100, val / max * 100));
        return h('div', { class: 'cap-row' }, h('div', { class: 'cap-label' }, label), h('div', { class: 'cap-track' }, h('span', { class: 'cap-fill ' + cls, style: { width: pct + '%' } })),
          h('div', { class: 'cap-val' }, KIT.fmt.si(val, 'bps', 4)));
      }
      function draw() {
        KIT.clear(out);
        var snr = Math.pow(10, st.snrDb / 10);
        var C = S.shannon(st.B, snr), N = S.nyquist(st.B, st.L);
        var max = Math.max(C, N) * 1.1;
        out.appendChild(bar('Shannon capacity C = B log₂(1 + SNR)', C, max, 'shannon'));
        out.appendChild(bar('Nyquist bit rate N = 2B log₂ L', N, max, 'nyquist'));
        var ok = N <= C;
        out.appendChild(h('div', { class: 'fb ' + (ok ? 'ok' : 'bad') }, ok ? '✓ The Nyquist rate with L = ' + st.L + ' is below the Shannon ceiling — achievable in principle.'
          : '✗ L = ' + st.L + ' asks for more than the channel can carry at this SNR — use fewer levels or improve the SNR.'));
        var ymax = Math.max(S.shannon(st.B, Math.pow(10, 6)), N) * 1.05;
        out.appendChild(KIT.svg.plot({
          width: 620, height: 220, x: [0, 60], y: [0, ymax], xTicks: [0, 10, 20, 30, 40, 50, 60], yTicks: 4,
          xFormat: function (v) { return v + ' dB'; }, yFormat: function (v) { return KIT.fmt.si(v, 'bps', 3); },
          xLabel: 'SNR (dB)', title: 'Shannon capacity vs SNR', hoverFormat: function (v) { return KIT.fmt.si(v, 'bps', 4); },
          hlines: [{ at: N, label: 'Nyquist N with L = ' + st.L }], vlines: [{ at: st.snrDb, label: 'now' }],
          series: [{ fn: function (x) { return S.shannon(st.B, Math.pow(10, x / 10)); }, color: 1, label: 'Capacity C (B = ' + KIT.fmt.si(st.B, 'Hz') + ')' }]
        }));
        // 2B·log₂L ≤ C  ⇒  log₂L ≤ C/(2B)  ⇒  L ≤ 2^(C/2B); largest power of 2 = 2^⌊C/2B⌋
        var Lmax = Math.pow(2, Math.floor(C / (2 * st.B) + 1e-9));
        out.appendChild(h('div', { class: 'small' }, 'SNR = ' + st.snrDb + ' dB = ' + KIT.fmt.num(snr, 4) + ' (linear — Shannon needs this, not the dB value). ' +
          'Largest power-of-2 L that stays under C: ' + (Lmax >= 2 ? Lmax : 'none (C is below 2B)') + '.'));
      }
      if (!opts.static) {
        var bsel = h('select', { class: 'inp', 'aria-label': 'Bandwidth' }, [3000, 4000, 1e5, 1e6, 2e6].map(function (b) { return h('option', { value: String(b), selected: b === st.B }, KIT.fmt.si(b, 'Hz')); }));
        bsel.addEventListener('change', function () { st.B = Number(bsel.value); draw(); });
        var snrS = h('input', { type: 'range', min: '0', max: '60', step: '1', value: String(st.snrDb), 'aria-label': 'SNR in dB' });
        var snrO = h('b', null, st.snrDb + ' dB');
        snrS.addEventListener('input', function () { st.snrDb = Number(snrS.value); snrO.textContent = st.snrDb + ' dB'; draw(); });
        var lsel = h('select', { class: 'inp', 'aria-label': 'Levels' }, [2, 4, 8, 16, 32, 64].map(function (l) { return h('option', { value: String(l), selected: l === st.L }, String(l)); }));
        lsel.addEventListener('change', function () { st.L = Number(lsel.value); draw(); });
        el.appendChild(h('div', { class: 'btn-row' }, h('label', null, 'Bandwidth ', bsel), h('label', null, 'SNR ', snrO, ' ', snrS), h('label', null, 'Levels L ', lsel)));
      }
      el.appendChild(out);
      draw();
      return { set: function (p) { if (p.B) st.B = p.B; if (p.snrDb !== undefined) st.snrDb = p.snrDb; if (p.L) st.L = p.L; draw(); }, destroy: function () { KIT.clear(el); } };
    }
  });
})();
