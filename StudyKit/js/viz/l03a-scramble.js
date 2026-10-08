/* L03a scrambling figures (B8ZS / HDB3). Owner: Lead (taken over from O2).
   <figure data-fig="l03a.scramble" data-code="b8zs|hdb3" data-bits="…" data-prev="1|-1" data-parity="0|1"> */
(function () {
  'use strict';
  var h = KIT.h;
  /** Pulses for B8ZS/HDB3 drawn as a 3-level waveform, substituted groups highlighted. */
  KIT.draw.scramble = function (code, bits, prev, parity) {
    if (prev && typeof prev === 'object') { parity = prev.parity; prev = prev.prev; }   // key() form: (code, bits, {prev, parity})
    prev = Number(prev) > 0 ? 1 : -1;
    var L = KIT.calc.linecode;
    var r = code === 'hdb3' ? L.hdb3(bits, { prevPolarity: prev, parity: parity || 0 }) : L.b8zs(bits, prev);
    var hl = (r.subs || []).map(function (s) { return { from: s.start, to: s.start + s.len }; });
    var svg = KIT.svg.wave(r.levels, { cellsPerBit: 1, bits: bits, levelSet: [1, 0, -1], title: code === 'hdb3' ? 'HDB3' : 'B8ZS', init: prev, highlight: hl });
    var marks = (r.marks || []).map(function (m) { return m.kind + ' at bit ' + (m.i + 1); }).join(', ');
    var subs = (r.subs || []).map(function (s) {
      return 'bits ' + (s.start + 1) + '–' + (s.start + s.len) + ' → ' + s.pattern + (s.parityBefore ? ' (' + s.parityBefore + ' pulses since last substitution)' : '');
    }).join('; ');
    return h('div', null, svg, h('div', { class: 'small muted' }, 'Pulse before the stream: ' + (prev > 0 ? '+' : '−') + '. Substitutions: ' + (subs || 'none') + (marks ? '. Marks: ' + marks + '.' : '.')));
  };
  KIT.fig.register('l03a.scramble', function (el, d) {
    el.appendChild(KIT.draw.scramble(d.code || 'b8zs', d.bits || '100000000', Number(d.prev || -1), Number(d.parity || 0)));
    if (d.caption) el.appendChild(h('figcaption', null, d.caption));
  });

  /* ---------- interactive: B8ZS / HDB3 stepper (AMI first, then one substitution per step) ---------- */
  var PRESETS = [
    { label: 'Slide 61 (HDB3)', code: 'hdb3', bits: '1100001000000000', prev: -1, parity: 0 },
    { label: 'Slide 59 (B8ZS)', code: 'b8zs', bits: '100000000', prev: -1, parity: 0 },
    { label: 'Odd count first', code: 'hdb3', bits: '1000010000110000', prev: 1, parity: 0 }
  ];
  function sym(v) { return v > 0 ? '+' : v < 0 ? '−' : '0'; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  KIT.viz.register('l03a.scramble', {
    topic: 'l03a', title: 'Scrambling stepper: B8ZS and HDB3', tier: 1,
    blurb: 'Start from AMI, then step through each substitution: count the pulses, pick the pattern, and see where the deliberate violations (V) land.',
    mount: function (el, opts) {
      opts = opts || {};
      var p = opts.params || {}, L = KIT.calc.linecode;
      var st = { code: p.code || 'hdb3', bits: p.bits || PRESETS[0].bits, prev: p.prev === 1 ? 1 : -1, parity: p.parity ? 1 : 0, step: 0 };
      var stage = h('div', { class: 'viz-stage' }), note = h('ol', { class: 'steps' }), nav = h('div', { class: 'btn-row' });

      function compute() {
        var last = st.prev;
        var ami = st.bits.split('').map(function (b) { return b === '1' ? (last = -last) : 0; });
        var r = st.code === 'hdb3' ? L.hdb3(st.bits, { prevPolarity: st.prev, parity: st.parity }) : L.b8zs(st.bits, st.prev);
        return { ami: ami, r: r };
      }
      function stepText(c, k) {            // k = 0 (AMI) … subs.length + 1 (done)
        var subs = c.r.subs, name = st.code === 'hdb3' ? 'HDB3' : 'B8ZS', run = st.code === 'hdb3' ? 'four' : 'eight';
        if (k === 0) return 'AMI first: 0 → 0 V, and each 1 alternates polarity. The pulse before this stream was <b>' + sym(st.prev) +
          '</b>, so the first 1 is <b>' + sym(-st.prev) + '</b>. A long run of 0s is a flat line — no transitions to keep the receiver in sync.' +
          (st.code === 'hdb3' && st.parity ? ' The count of nonzero pulses since the last substitution starts <b>odd</b>.' : '');
        if (k > subs.length) return subs.length ? 'Done: no run of ' + run + ' 0s is left, and the bandwidth is unchanged. The receiver spots each V (same polarity as the pulse before it — a bipolar violation on purpose) and turns the pattern back into 0s.'
          : 'No run of ' + run + ' 0s, so ' + name + ' sends plain AMI.';
        var s = subs[k - 1], cells = c.r.levels.slice(s.start, s.start + s.len).map(sym).join(' ');
        var where = 'Bits ' + (s.start + 1) + '–' + (s.start + s.len) + ': ' + run + ' 0s. ';
        if (st.code === 'b8zs') return where + 'Replace them with <b>000VB0VB</b> = <b class="mono">' + cells + '</b>: each V repeats the polarity of the pulse before it, each B alternates.';
        return where + plural(s.pulsesBefore, 'nonzero pulse') + ' since ' + (k === 1 ? 'the start' : 'the last substitution') + ' → <b>' + s.parityBefore + '</b> → <b>' + s.pattern +
          '</b> = <b class="mono">' + cells + '</b>. ' + (s.pattern === 'B00V' ? 'B alternates from the previous pulse; V repeats B.' : 'V repeats the previous pulse.') + ' The count restarts.';
      }
      function draw() {
        KIT.clear(stage); KIT.clear(note); KIT.clear(nav);
        if (!/^[01]{2,24}$/.test(st.bits)) { stage.appendChild(h('p', { class: 'muted' }, 'Type 2 to 24 bits (0s and 1s).')); return; }
        var c = compute(), subs = c.r.subs, last = subs.length + 1;
        var k = opts.static ? last : Math.min(st.step, last);
        var upto = k === 0 ? 0 : k > subs.length ? st.bits.length : subs[k - 1].start + subs[k - 1].len;
        var shown = c.r.levels.map(function (v, i) { return i < upto ? v : null; });
        var marks = {};
        c.r.marks.forEach(function (m) { if (m.i < upto) marks[m.i] = m.kind; });
        var labels = st.bits.split('').map(function (b, i) { return marks[i] || b; }).join('');
        var hl = subs.slice(0, Math.min(k, subs.length)).map(function (s) { return { from: s.start, to: s.start + s.len }; });
        var common = { cellsPerBit: 1, levelSet: [1, 0, -1], init: st.prev, titleWidth: 64, stubSpace: true };
        stage.appendChild(KIT.svg.wave(c.ami, Object.assign({ bits: st.bits, title: 'AMI', color: 3 }, common)));
        stage.appendChild(KIT.svg.wave(shown, Object.assign({ bits: labels, title: st.code === 'hdb3' ? 'HDB3' : 'B8ZS', highlight: hl }, common)));
        stage.appendChild(h('div', { class: 'small muted' }, 'Top: plain AMI. Bottom: the scrambled signal; letters mark V (violation) and B (bipolar) pulses; shaded = substituted.'));
        for (var j = opts.static ? 0 : k; j <= k; j++) note.appendChild(h('li', { value: String(j + 1) }, KIT.html(stepText(c, j))));
        if (opts.static) return;
        var back = h('button', { class: 'btn', type: 'button', disabled: k === 0 }, '◀ Back');
        var next = h('button', { class: 'btn primary', type: 'button', disabled: k === last }, k === 0 ? 'Start substituting ▶' : 'Next step ▶');
        var all = h('button', { class: 'btn ghost', type: 'button', disabled: k === last }, 'Show the result');
        back.addEventListener('click', function () { st.step = k - 1; draw(); });
        next.addEventListener('click', function () { st.step = k + 1; draw(); });
        all.addEventListener('click', function () { st.step = last; draw(); });
        nav.appendChild(back); nav.appendChild(next); nav.appendChild(all);
        nav.appendChild(h('span', { class: 'small muted', style: { alignSelf: 'center' } }, 'Step ' + (k + 1) + ' of ' + (last + 1)));
      }
      if (!opts.static) {
        var codeSel = h('select', { class: 'inp', 'aria-label': 'Scrambling code' }, h('option', { value: 'hdb3' }, 'HDB3'), h('option', { value: 'b8zs' }, 'B8ZS'));
        var bitsIn = h('input', { class: 'inp mono', maxlength: '24', value: st.bits, 'aria-label': 'Bits', style: { width: '210px' } });
        var prevSel = h('select', { class: 'inp', 'aria-label': 'Pulse before the stream' }, h('option', { value: '1' }, '+'), h('option', { value: '-1' }, '−'));
        var parSel = h('select', { class: 'inp', 'aria-label': 'Starting count' }, h('option', { value: '0' }, 'even'), h('option', { value: '1' }, 'odd'));
        var parLabel = h('label', null, 'Count since last substitution ', parSel);
        function sync() {
          codeSel.value = st.code; bitsIn.value = st.bits; prevSel.value = String(st.prev); parSel.value = String(st.parity);
          parLabel.style.display = st.code === 'hdb3' ? '' : 'none';
        }
        function changed() { st.step = 0; sync(); draw(); }
        codeSel.addEventListener('change', function () { st.code = codeSel.value; changed(); });
        bitsIn.addEventListener('input', function () { st.bits = bitsIn.value.replace(/[^01]/g, '').slice(0, 24); st.step = 0; draw(); });
        prevSel.addEventListener('change', function () { st.prev = Number(prevSel.value); changed(); });
        parSel.addEventListener('change', function () { st.parity = Number(parSel.value); changed(); });
        el.appendChild(h('div', { class: 'btn-row' }, h('label', null, 'Code ', codeSel), h('label', null, 'Bits ', bitsIn),
          h('label', null, 'Pulse before the stream ', prevSel), parLabel));
        el.appendChild(h('div', { class: 'btn-row' }, PRESETS.map(function (pr) {
          var b = h('button', { class: 'btn ghost', type: 'button' }, pr.label);
          b.addEventListener('click', function () { st.code = pr.code; st.bits = pr.bits; st.prev = pr.prev; st.parity = pr.parity; changed(); });
          return b;
        })));
        sync();
      }
      el.appendChild(stage); el.appendChild(nav); el.appendChild(note);
      draw();
      return { set: function (q) { if (q.code) st.code = q.code; if (q.bits) st.bits = q.bits; if (q.prev) st.prev = q.prev; if (q.parity !== undefined) st.parity = q.parity; st.step = 0; draw(); },
        destroy: function () { KIT.clear(el); } };
    }
  });
})();
