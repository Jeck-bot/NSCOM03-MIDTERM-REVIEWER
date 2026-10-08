/* Cram page (#/cram): catch up fast. Owner: Lead. Content: content/cram.js (KIT.cram, AUTHORING §3.10).
   Order: the must-knows of the whole course, then every lecture's concepts (big picture, key ideas with a "got it" tick,
   mix-ups), and only then the computational parts: recipes with the color-coded formula cards and a worked mini example. */
(function () {
  'use strict';
  var h = KIT.h;
  var DONE_KEY = 'cram.done';
  function frag(html) { return KIT.html(html); }
  function chip(ref) { return ref ? h('span', { class: 'chip ref' }, ref) : null; }
  function words(c) {
    var n = 0, add = function (s) { n += String(s || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length; };
    add(c.intro); c.top.forEach(function (x) { add(x.html); });
    c.lectures.forEach(function (l) { add(l.big); l.ideas.forEach(function (x) { add(x.html); }); (l.mixups || []).forEach(function (x) { add(x.html); }); });
    c.compute.forEach(function (g) { g.recipes.forEach(function (r) { add(r.when); add(r.how); add(r.example); }); });
    return n;
  }

  // The must-knows of the whole course, most exam-relevant first (line encodings and concepts before computation).
  var TOP = [
    { topic: 'l03a', ref: 'L03 pp23-32', html: '<b>Line-code conventions (slide figures):</b> NRZ-L 0 = +V, 1 = −V · NRZ-I: a 1 <b>inverts</b> the level, a 0 keeps it (start +V) · Manchester 0 = high→low, 1 = low→high · Differential Manchester: always a mid-bit transition, a 0 also has one at the <b>start</b> · AMI: 0 = 0 V, the 1s alternate +V, −V, … starting with +V.' },
    { topic: 'l03a', ref: 'L03 pp11-17', html: '<b>What makes a good line code:</b> no baseline wandering and no DC component (avoid long runs of one level), self-synchronization (enough transitions for the receiver clock), some error detection, noise immunity, low complexity.' },
    { topic: 'l03a', ref: 'L03 p8; L03 p25', html: '<b>Data element vs signal element:</b> bits are data elements, voltage pulses are signal elements, r = data elements per signal element. $\\c{baud}{S} = c \\times \\c{rate}{N} \\times \\frac{1}{\\c{level}{r}}$ with average $c = \\frac{1}{2}$, and $\\c{bw}{B_{\\min}} = \\c{baud}{S}$.' },
    { topic: 'l03a', ref: 'L03 pp57-61', html: '<b>Scrambling</b> removes long runs of 0s without adding bandwidth: <b>B8ZS</b> replaces 8 zeros with 000VB0VB; <b>HDB3</b> replaces 4 zeros with 000V (odd number of pulses since the last substitution) or B00V (even). V = violation, B = bipolar pulse.' },
    { topic: 'l03a', ref: 'L03 pp48-54', html: '<b>4B/5B block coding</b> maps every 4 bits to a 5-bit code with no long 0 runs, so NRZ-I can carry it: the rate rises × 5/4 (1 Mbps → 1.25 Mbps → NRZ-I needs 625 kHz).' },
    { topic: 'l02', ref: 'L02 pp29-33', html: '<b>Nyquist vs Shannon:</b> noiseless channel $\\c{rate}{N} = 2\\c{bw}{B} \\log_2 \\c{level}{L}$; noisy channel $\\c{rate}{C} = \\c{bw}{B} \\log_2 (1 + \\c{snr}{SNR})$ with SNR as a plain ratio. Shannon gives the upper limit; Nyquist then tells you how many levels L to use.' },
    { topic: 'l03b', ref: 'L03 pp63-83', html: '<b>PCM = sample → quantize → encode.</b> Sample at $\\c{baud}{f_s} \\ge 2\\c{bw}{f_{\\max}}$ (Nyquist theorem, low-pass and bandpass alike); bit rate $\\c{rate}{N} = \\c{level}{n_b} \\times \\c{baud}{f_s}$; voice: 8000 samples/s × 8 bits = 64 kbps.' },
    { topic: 'l03b', ref: 'L03 pp72-78', html: '<b>Quantization:</b> split the range into L zones of height $\\Delta = \\frac{V_{\\max} - V_{\\min}}{\\c{level}{L}}$; each sample becomes the midpoint of its zone (error at most Δ/2) and is coded with $\\c{level}{n_b} = \\log_2 \\c{level}{L}$ bits.' },
    { topic: 'l04', ref: 'L04 pp3-31', html: '<b>Digital-to-analog:</b> ASK changes the carrier\'s amplitude, FSK its frequency, PSK its phase; QAM changes amplitude and phase together. $\\c{baud}{S} = \\c{rate}{N} \\times \\frac{1}{\\c{level}{r}}$ and $\\c{level}{r} = \\log_2 \\c{level}{L}$.' },
    { topic: 'l04', ref: 'L04 pp27-31', html: '<b>Constellation diagram:</b> each point is one signal element — its distance from the origin is the amplitude, its angle is the phase. BPSK: 2 points 180° apart; QPSK: 4 points; 16-QAM: 16 points.' },
    { topic: 'l04', ref: 'L04 pp9-21', html: '<b>Bandwidth in a band:</b> ASK/PSK $\\c{bw}{B} = (1 + d)\\c{baud}{S}$; FSK adds the carrier spacing $2\\c{freq}{\\Delta f}$; put the carrier in the middle of the available band.' },
    { topic: 'l02', ref: 'L02 pp21-26', html: '<b>Decibels:</b> $10 \\log_{10} \\frac{P_2}{P_1}$ — negative = loss, positive = gain, half the power = −3 dB, and the dB values of a chain simply add. $SNR_{\\text{dB}} = 10 \\log_{10} SNR$.' },
    { topic: 'l02', ref: 'L02 pp6-13', html: '<b>Signals:</b> $\\c{freq}{f} = \\frac{1}{\\c{time}{T}}$; phase is the position at time 0 (¼ period = 90°); bandwidth = highest − lowest frequency of a composite signal; a digital signal with L levels sends log₂ L bits per level.' },
    { topic: 'l02', ref: 'L02 pp35-37', html: '<b>Latency</b> = propagation + transmission + queuing + processing time; propagation = distance ÷ speed, transmission = message size ÷ bandwidth.' },
    { topic: 'l03b', ref: 'L03 pp87-96', html: '<b>Transmission modes:</b> parallel (n bits at once) vs serial; serial <b>asynchronous</b> frames each character with a start bit (0) and stop bit(s) (1), gaps allowed; <b>synchronous</b> sends a continuous stream with no start/stop bits; <b>isochronous</b> guarantees a fixed rate.' },
    { topic: 'l03b', ref: 'L03 pp84-85', html: '<b>Delta modulation</b> sends 1 bit per sample: 1 = the staircase steps up by Δ, 0 = it steps down.' },
    { topic: 'l01', ref: 'L01 pp2-6', html: '<b>Layers:</b> OSI bottom-up Physical, Data link, Network, Transport, Session, Presentation, Application; TCP/IP: Network access = OSI 1–2, Internet = 3, Transport = 4, Application = 5–7. The data link layer moves frames error-free between two nodes (framing, flow control, error detection).' }
  ];

  /** Until content/cram.js is written by hand, the cram sheet is assembled from the kit's reviewed content: each lecture's
      high-yield points and "at a glance" summary, its ★ must-know terms with their definitions, its traps as mix-ups, and
      every cheat-sheet formula card at the bottom. */
  function autoCram() {
    var glossary = KIT.ui.terms ? KIT.ui.terms.index() : [];
    function def(name) {
      var e = KIT.ui.terms ? KIT.ui.terms.byName(name) : null;
      return e ? { term: e.term, def: e.def, ref: e.ref } : null;
    }
    var top = [], lectures = [], compute = [];
    KIT.TOPIC_IDS.forEach(function (id) {
      var t = KIT.getTopic(id);
      if (!t) return;
      var ideas = (t.glance || []).map(function (g, i) {
        var m = /<b>([^<]{2,60})<\/b>/.exec(g);
        return { title: m ? m[1] : 'Key point ' + (i + 1), html: '<p>' + g + '</p>', star: i < 3 };
      });
      var keys = [];
      KIT.walks(id).forEach(function (w) { w.keyTerms.forEach(function (k) { var d = def(k); if (d && !keys.some(function (x) { return x.term === d.term; })) keys.push(d); }); });
      if (keys.length) {
        ideas.push({ title: '★ Must-know terms', star: true,
          html: '<dl class="cram-terms">' + keys.map(function (d) { return '<dt>' + d.term + '</dt><dd>' + d.def + '</dd>'; }).join('') + '</dl>' });
      }
      var traps = [];
      (t.sections || []).forEach(function (s) { if (s.kind === 'traps') traps = traps.concat(s.items); });
      lectures.push({ topic: id, big: '<p>' + t.blurb + '</p>', ideas: ideas,
        mixups: traps.map(function (x) { return { a: '⚠', b: '', trap: x.trap, html: x.fix, ref: x.ref }; }) });
      var fs = KIT.formulas({ topic: id, sheet: true });
      if (fs.length) compute.push({ topic: id, recipes: fs.map(function (f) { return { title: f.name, formulas: [f.id], ref: f.ref }; }) });
    });
    void glossary;
    return {
      auto: true,
      intro: '<p>Everything that matters, in the order to learn it: the must-knows of the whole course, then each lecture\'s ' +
        'concepts and the mistakes to avoid, and only at the bottom the formulas you need for the one or two solving items. ' +
        'Each lecture links to its slide-by-slide walkthrough when you need the full explanation.</p>',
      top: TOP, lectures: lectures, compute: compute,
      tips: (KIT.print && KIT.print.cheatData ? KIT.print.cheatData().globals : []).filter(function (p) { return /Mental/.test(p.title); }).map(function (p) { return p.html; })
    };
  }

  KIT.page('cram', function (main) {
    var c = KIT.getCram() || autoCram();
    main.appendChild(h('h1', null, 'Cram — catch up fast'));
    var done = KIT.store.get(DONE_KEY, {});
    var total = 0, counter = h('span', { class: 'cram-count' });
    function refresh() {
      var n = 0; Object.keys(done).forEach(function (k) { if (done[k]) n++; });
      counter.textContent = n + ' / ' + total + ' ideas ticked';
    }
    var minutes = Math.max(5, Math.round(words(c) / 200));
    main.appendChild(h('div', { class: 'cram-intro' }, frag(c.intro),
      h('p', { class: 'muted small' }, 'About ' + minutes + ' minutes of reading. Concepts first; the computational parts are at the bottom. ', counter)));

    // Table of contents.
    var toc = h('ul', { class: 'toc no-print' }, h('li', null, h('a', { href: '#/cram', 'data-target': 'cram-top', onclick: jump }, '★ Must-knows')));
    c.lectures.forEach(function (l) { toc.appendChild(h('li', null, h('a', { href: '#/cram', 'data-target': 'cram-' + l.topic, onclick: jump }, KIT.ui.deckLabel(l.topic)))); });
    toc.appendChild(h('li', null, h('a', { href: '#/cram', 'data-target': 'cram-compute', onclick: jump }, '∑ Computational parts')));
    main.appendChild(toc);

    // 1. The must-knows of the whole course.
    main.appendChild(h('section', { class: 'cram-top', id: 'cram-top' }, h('h2', null, '★ If you only remember this'),
      h('ol', { class: 'cram-top-list', 'data-linkable': '' }, c.top.map(function (x) {
        return h('li', null, h('span', { class: 'cram-deck' }, KIT.ui.deckLabel(x.topic)), frag(x.html), chip(x.ref));
      }))));

    // 2. Concepts, lecture by lecture.
    main.appendChild(h('h2', { class: 'cram-part' }, 'Part 1 — Concepts'));
    c.lectures.forEach(function (l) {
      var t = KIT.getTopic(l.topic), meta = KIT.META[l.topic];
      var sec = h('section', { class: 'cram-lecture', id: 'cram-' + l.topic },
        h('h3', { class: 'cram-lecture-title' }, h('span', { class: 'cram-deck' }, KIT.ui.deckLabel(l.topic)), t ? t.title : meta.title,
          h('a', { class: 'small no-print', href: '#/topic/' + l.topic, style: { marginLeft: 'auto', fontWeight: '500' } }, 'slide by slide →')),
        h('div', { class: 'callout key cram-big' }, h('div', { class: 'callout-label' }, 'The big picture'), h('div', { 'data-linkable': '' }, frag(l.big))));
      var list = h('ol', { class: 'cram-ideas' });
      l.ideas.forEach(function (x, i) {
        var key = l.topic + ':' + i;
        total++;
        var box = h('input', { type: 'checkbox', 'aria-label': 'Got it: ' + x.title });
        box.checked = !!done[key];
        box.addEventListener('change', function () { done[key] = box.checked; KIT.store.set(DONE_KEY, done); li.classList.toggle('got', box.checked); refresh(); });
        var li = h('li', { class: 'cram-idea' + (x.star ? ' star' : '') + (done[key] ? ' got' : '') },
          h('div', { class: 'cram-idea-head' }, h('label', { class: 'cram-got no-print', title: 'Tick when you could explain it' }, box),
            h('b', null, (x.star ? '★ ' : '') + x.title), chip(x.ref)),
          h('div', { class: 'prose', 'data-linkable': '' }, frag(x.html)));
        list.appendChild(li);
      });
      sec.appendChild(list);
      if (l.mixups && l.mixups.length) {
        sec.appendChild(h('div', { class: 'cram-mixups' }, h('div', { class: 'callout-label' }, '⇄ Don\'t mix these up'),
          h('table', { class: 'tbl compact' }, h('tbody', null, l.mixups.map(function (x) {
            return h('tr', null, h('th', null, x.trap ? frag(x.trap) : [x.a, ' vs ', x.b]), h('td', { 'data-linkable': '' }, frag(x.html), chip(x.ref)));
          })))));
      }
      main.appendChild(sec);
    });

    // 3. The computational parts, at the bottom.
    main.appendChild(h('h2', { class: 'cram-part', id: 'cram-compute' }, 'Part 2 — Computational parts'));
    main.appendChild(h('p', { class: 'muted' }, 'Only one or two solving items are expected, and there is no calculator. For each type: the cue in the question, the formula (each quantity keeps its color), the recipe and a slide-sized example.'));
    c.compute.forEach(function (g) {
      var sec = h('section', { class: 'cram-compute' }, h('h3', { class: 'cram-lecture-title' }, h('span', { class: 'cram-deck' }, KIT.ui.deckLabel(g.topic)),
        (KIT.getTopic(g.topic) || KIT.META[g.topic]).title));
      g.recipes.forEach(function (r) {
        var card = h('article', { class: 'cram-recipe' },
          h('h4', null, r.title, chip(r.ref)),
          r.when ? h('div', { class: 'cram-when' }, h('b', null, 'When you see: '), frag(r.when)) : null);
        if (r.formulas && r.formulas.length) {
          var grid = h('div', { class: 'formula-grid' });
          r.formulas.forEach(function (id) { var f = KIT.getFormula(id); if (f) grid.appendChild(KIT.ui.formulaCard(f)); });
          card.appendChild(grid);
        }
        if (r.how) card.appendChild(h('div', { class: 'cram-how' }, h('b', null, 'How: '), frag(r.how)));
        if (r.example) card.appendChild(KIT.ui.anim.connect(h('div', { class: 'cram-ex' }, h('b', null, 'Example: '), frag(r.example))));
        sec.appendChild(card);
      });
      main.appendChild(sec);
    });
    if (c.tips && c.tips.length) {
      main.appendChild(h('section', { class: 'callout good' }, h('div', { class: 'callout-label' }, '🧮 Mental math (no calculator)'),
        h('ul', null, c.tips.map(function (x) { return h('li', null, frag(x)); }))));
    }
    refresh();
    KIT.fig.hydrate(main);
  });

  function jump(ev) {
    ev.preventDefault();
    var el = document.getElementById(ev.currentTarget.getAttribute('data-target'));
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
