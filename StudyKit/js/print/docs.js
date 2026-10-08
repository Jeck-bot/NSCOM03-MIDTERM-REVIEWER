/* Printable documents (#/print/<doc>, rendered without app chrome, Letter paper). Owner: UI.
   cheatsheet, recall, reviewer, exam/<id>, exam/<id>/key. Every document ends with
   <div class="sentinel">END OF DOCUMENT: <id> · build <KIT.build></div>.
   Pure helpers (docs, blankKeys, examSummary, cheatData) are Node-testable; the renderers need a DOM. */
(function () {
  'use strict';
  var h = KIT.h;
  var BLANK = '________';
  var LETTERS = 'ABCDEFGH';

  /* ================= document list ================= */

  var FIXED_DOCS = [
    { id: 'cheatsheet', route: 'print/cheatsheet', title: 'Cheat sheet (formula cards and key facts)', file: '01-Cheat-Sheet.pdf' },
    { id: 'recall', route: 'print/recall', title: 'Recall drill (cheat sheet with blanks)', file: '05-Recall-Drill.pdf' },
    { id: 'reviewer', route: 'print/reviewer', title: 'Reviewer (all topics)', file: '02-Reviewer.pdf' }
  ];
  var EXAM_FILES = { A: ['03-Mock-Exam-A.pdf', '04-Mock-Exam-A-Key.pdf'], B: ['06-Mock-Exam-B.pdf', '07-Mock-Exam-B-Key.pdf'] };

  function sum(o) { return Object.keys(o || {}).reduce(function (a, k) { return a + o[k]; }, 0); }

  /** What each part is worth. A part's points come from its blueprint (quota or slots), so the header and score boxes are
      right even while the exam is being assembled; items beyond the blueprint still count.
      → { parts: [{ id, title, type, count (items so far), planned (blueprint items), pts, complete }], total, assembled, anyItems }. */
  function examSummary(x) {
    var total = 0, assembled = true, any = false;
    var parts = (x.sections || []).map(function (s) {
      var gen = s.type === 'gen', count = (s.items || []).length;
      var planned = gen ? (s.slots || 0) : sum(s.quota);
      if (!planned) planned = count;
      var pts = Math.max(planned, count) * (gen ? (s.pts || 0) : (s.each || 0));
      var complete = count >= planned && planned > 0;
      if (!complete) assembled = false;
      if (count > 0) any = true;
      total += pts;
      return { id: s.id, title: s.title, type: s.type, count: count, planned: planned, pts: pts, complete: complete };
    });
    return { parts: parts, total: total, assembled: assembled && parts.length > 0, anyItems: any };
  }

  /** [{ id, route, title, file, ready }] — ready is false for an exam form that has no items yet. */
  function docs() {
    var out = FIXED_DOCS.map(function (d) { return { id: d.id, route: d.route, title: d.title, file: d.file, ready: true }; });
    KIT.exams.all().forEach(function (x) {
      if (x.kind !== 'form') return;
      var files = EXAM_FILES[x.id] || ['Mock-Exam-' + x.id + '.pdf', 'Mock-Exam-' + x.id + '-Key.pdf'];
      var ready = examSummary(x).anyItems;
      out.push({ id: 'exam-' + x.id, route: 'print/exam/' + x.id, title: 'Mock Exam ' + x.id, file: files[0], ready: ready });
      out.push({ id: 'exam-' + x.id + '-key', route: 'print/exam/' + x.id + '/key', title: 'Mock Exam ' + x.id + ' — answer key', file: files[1], ready: ready });
    });
    out.push({ id: 'drills', route: 'print/drills', title: 'Drawing drills: line codes, scrambling, decoding, waves (+ key)', file: '08-Drill-Worksheets.pdf', ready: true });
    out.push({ id: 'essays', route: 'print/essays', title: 'Essay practice: draw and/or explain (+ model answers)', file: '09-Essay-Practice.pdf', ready: practiceEssays().length > 0 });
    return out;
  }

  /* ================= recall blanks ================= */

  var KEY_RE = /<em\s+class=(["'])([^"']*)\1\s*>([\s\S]*?)<\/em>/gi;
  var HAS_KEY = /<em\s+class=(["'])([^"']*\bk\b[^"']*)\1\s*>/i;

  /** Replace every <em class="k">…</em> with a numbered fixed-width blank. → { html, answers (inner html), next }. */
  function blankKeys(html, start) {
    var n = start === undefined ? 1 : start, answers = [];
    var out = String(html === undefined || html === null ? '' : html).replace(KEY_RE, function (m, q, cls, inner) {
      if (cls.split(/\s+/).indexOf('k') < 0) return m;
      answers.push(inner);
      var blank = '<span class="rc-blank"><b class="rc-n">(' + n + ')</b>' + BLANK + '</span>';
      n += 1;
      return blank;
    });
    return { html: out, answers: answers, next: n };
  }

  /* ================= cheat sheet content ================= */

  var GLOBAL_PANELS = [
    { title: 'Symbol clashes', html: '<ul>' +
      '<li><b>S</b> = <em class="k">signal (baud) rate</em> in baud: S = c·N/r (L03), S = N/r (L04). <b>C</b> = <em class="k">Shannon capacity</em> in bps. Not the same thing.</li>' +
      '<li><b>c</b> = <em class="k">case factor</em> (0 to 1, average ½) in S = c·N/r. In L02, <b>c</b> = <em class="k">speed of light</em>, 3×10⁸ m/s.</li>' +
      '<li><b>N</b> = <em class="k">bit (data) rate</em> in bps. <b>N<sub>max</sub></b> = <em class="k">2·B·log₂L</em> is Nyquist’s limit for a noiseless channel.</li></ul>' },
    { title: 'Mental-math tips (no calculator)', html: '<ul>' +
      '<li>log₂ of a power of 2 = <em class="k">count the doublings</em> (log₂ 64 = 6); log₂ 1000 ≈ <em class="k">10</em></li>' +
      '<li>dB → ratio: <em class="k">10^(dB/10)</em>; ratio → dB: 10·log₁₀(ratio). Add dB to multiply ratios.</li>' +
      '<li><em class="k">3 dB ≈ ×2</em> · <em class="k">10 dB = ×10</em> · 20 dB = ×100 · −3 dB ≈ ×½</li>' +
      '<li><em class="k">2¹⁰ ≈ 10³</em> (1024 vs 1000)</li>' +
      '<li>Powers of 2: 2¹=2 · 2²=4 · 2³=8 · 2⁴=16 · 2⁵=<em class="k">32</em> · 2⁶=<em class="k">64</em> · 2⁷=<em class="k">128</em> · 2⁸=<em class="k">256</em> · 2⁹=<em class="k">512</em> · 2¹⁰=<em class="k">1024</em></li>' +
      '<li>SNR = 2<sup>k</sup> − 1 gives log₂(1 + SNR) = k: SNR 3, 7, 15, 31, 63, 255 → 2, 3, 4, 5, 6, 8</li></ul>' },
    { title: 'Unit traps', html: '<ul>' +
      '<li><em class="k">K = 1000</em> for data rates and sizes (1 kbps = 1000 bps; 1 KB = 1000 B on the slides), not 1024.</li>' +
      '<li>Bytes <em class="k">× 8</em> = bits (2.5 KB = 20,000 bits) before dividing by a bit rate.</li>' +
      '<li><em class="k">µs = 10⁻⁶ s</em>, <em class="k">ms = 10⁻³ s</em>: 0.020 ms = 20 µs.</li>' +
      '<li>Convert everything to base units (Hz, bps, s, m) before substituting.</li></ul>' }
  ];

  /** Cheat-sheet content in reading order: per lecture its formula cards (the color-coded equation, a symbol legend, when to
      use it and a slide example — content/formulas.js) and its fact panels, then the global panels.
      { blank: true } is the recall drill: each equation becomes a numbered blank whose answer is the equation (the name and
      the legend stay; the example is hidden because it shows the equation), and the key terms of the panels are blanked. */
  function cheatData(opts) {
    var blank = !!(opts && opts.blank), n = 1, answers = [];
    function proc(html) {
      if (!blank || !html) return html;
      var r = blankKeys(html, n);
      n = r.next; answers = answers.concat(r.answers);
      return r.html;
    }
    var topics = KIT.TOPIC_IDS.map(function (id) {
      var t = KIT.getTopic(id), meta = KIT.META[id] || {};
      var formulas = KIT.formulas({ topic: id, sheet: true }).map(function (f) {
        var x = { id: f.id, name: f.name, ref: f.ref, tex: f.tex || null, html: f.html, vars: f.vars || [], use: f.use || f.where || '',
          example: f.example || '', note: f.note || '' };
        if (blank) {
          x.blank = n++;
          answers.push(f.tex ? '$$' + f.tex + '$$' : f.html);
          x.tex = null; x.html = null; x.example = '';
        }
        return x;
      });
      var panels = ((t && t.cheat) || []).map(function (p) { return { title: p.title, html: proc(p.html) }; });
      return { id: id, deck: KIT.ui.deckLabel ? KIT.ui.deckLabel(id) : id, title: (t && t.title) || meta.title || id,
        pending: !t && !formulas.length, formulas: formulas, panels: panels, figs: CHEAT_FIGS[id] || [] };
    });
    var globals = GLOBAL_PANELS.map(function (p) { return { title: p.title, html: proc(p.html) }; });
    return { topics: topics, globals: globals, answers: answers };
  }

  // A few slide figures per lecture, where a picture says it faster than words.
  var CHEAT_FIGS = {
    l02: ['<figure data-fig="l02.phase" data-caption="Phase: the same sine wave shifted by 0°, 90°, 180° and 270° (slide 8)."></figure>'],
    l03a: ['<figure data-fig="l03a.linecode" data-scheme="nrzl,nrzi,rz,manchester,dmanchester,ami" data-bits="01001110" data-caption="01001110 in the slide conventions (slides 23, 27, 29, 32)."></figure>',
      '<figure data-fig="l03a.scramble" data-code="b8zs" data-bits="100000000" data-prev="-1" data-caption="B8ZS: 000VB0VB (slide 59)."></figure>',
      '<figure data-fig="l03a.scramble" data-code="hdb3" data-bits="1100001000000000" data-prev="-1" data-parity="0" data-caption="HDB3: 000V after an odd count, B00V after an even count (slide 61)."></figure>'],
    l03b: ['<figure data-fig="l03b.quant" data-caption="Quantization: zones, midpoints and 3-bit codes (slide 76)."></figure>'],
    l04: ['<figure data-fig="l04.modwaves" data-bits="10110" data-caption="10110 in ASK, FSK and BPSK (slides 10, 14, 22)."></figure>',
      '<figure data-fig="l04.constellation" data-scheme="16qam" data-caption="16-QAM constellation: amplitude = distance, phase = angle (slide 31)."></figure>']
  };

  /* ================= DOM: shared pieces ================= */

  function frag(html) { return KIT.html(html); }
  function plainText(html) { return frag(html).textContent; }

  function sentinel(id) { return h('div', { class: 'sentinel' }, 'END OF DOCUMENT: ' + id + ' · build ' + KIT.build); }
  function docEl(cls, id, kids) {
    var d = h('div', { class: 'doc ' + cls, 'data-doc': id }, kids);
    d.appendChild(sentinel(id));
    return d;
  }

  /* ---------- cheat sheet block: readable formula cards and fact panels, each lecture on its own page ---------- */

  function cheatPanel(title, body, cls) {
    return h('section', { class: 'cs-panel' + (cls ? ' ' + cls : '') }, h('h4', null, title), h('div', { class: 'cs-body' }, body));
  }

  /** One formula card: name and slide ref, the color-coded equation (or the recall blank), the legend in the same colors,
      when to use it and a slide example. Hovering a colored symbol lights up the same quantity across the card. */
  function cheatFormula(f) {
    var eq = f.blank
      ? h('div', { class: 'cs-eq cs-eq-blank' }, h('b', { class: 'rc-n' }, '(' + f.blank + ')'), ' ', h('span', { class: 'cs-line' }, BLANK + BLANK + BLANK))
      : h('div', { class: 'cs-eq' }, frag(f.tex ? '$$' + f.tex + '$$' : f.html));
    var legend = f.vars.length ? h('ul', { class: 'cs-legend' }, f.vars.map(function (v) {
      return h('li', null, h('span', { class: 'cs-sym' }, frag(v.role ? '$\\c{' + v.role + '}{' + v.tex + '}$' : '$' + v.tex + '$')),
        h('span', null, v.means, v.unit ? h('span', { class: 'cs-unit' }, ' (' + v.unit + ')') : null));
    })) : null;
    var card = h('article', { class: 'cs-fcard' },
      h('div', { class: 'cs-fname' }, f.name, f.ref ? h('span', { class: 'cs-ref' }, f.ref) : null),
      eq, legend,
      f.use ? h('div', { class: 'cs-use' }, frag(f.use)) : null,
      f.example ? h('div', { class: 'cs-ex' }, frag(f.example)) : null,
      f.note ? h('div', { class: 'cs-note' }, frag(f.note)) : null);
    return KIT.ui.anim ? KIT.ui.anim.connect(card) : card;
  }

  function cheatBlock(data, opts) {
    var body = h('div', { class: 'cs-lectures' });
    data.topics.forEach(function (t) {
      var sec = h('section', { class: 'cs-lecture' }, h('h2', { class: 'cs-lecture-title' }, h('span', { class: 'cs-deck' }, t.deck), t.title));
      if (t.pending) { sec.appendChild(h('p', { class: 'cs-pending' }, 'This lecture’s summary is not written yet.')); body.appendChild(sec); return; }
      if (t.formulas.length) sec.appendChild(h('div', { class: 'cs-fgrid' }, t.formulas.map(cheatFormula)));
      if (t.panels.length) sec.appendChild(h('div', { class: 'cs-panels' }, t.panels.map(function (p) { return cheatPanel(p.title, frag(p.html)); })));
      if (t.figs.length && !opts.noFigs) sec.appendChild(h('div', { class: 'cs-figs' }, t.figs.map(function (x) { return frag(x); })));
      body.appendChild(sec);
    });
    body.appendChild(h('section', { class: 'cs-lecture cs-global-sec' }, h('h2', { class: 'cs-lecture-title' }, h('span', { class: 'cs-deck' }, '∑'), 'Exam conventions, mental math and traps'),
      h('div', { class: 'cs-panels' }, data.globals.map(function (p) { return cheatPanel(p.title, frag(p.html), 'cs-global'); }))));
    var block = h('section', { class: 'cheat-sheet' + (opts.screen ? ' cheat-screen' : '') },
      h('header', { class: 'cheat-head' }, h('h1', null, opts.title), h('div', { class: 'cheat-sub' }, opts.sub)), body);
    KIT.fig.hydrate(block);
    return block;
  }

  var CHEAT_TITLE = 'NSCOM03 Midterm Cheat Sheet — Modules 1–4';
  var CHEAT_SUB = 'L01–L04 · one lecture per page · grey = slide page · bold = key term · colors follow the unit: bps blue, baud orange, Hz green, levels violet, power/SNR/dB magenta, seconds amber';

  /** The cheat sheet block (reused by the screen page, the reviewer and the cheat-sheet PDF). */
  function cheatSheet(opts) {
    return cheatBlock(cheatData(), { title: CHEAT_TITLE, sub: CHEAT_SUB, screen: !!(opts && opts.screen) });
  }

  function cheatDoc() { return docEl('doc-cheat', 'cheatsheet', [cheatSheet()]); }

  function recallDoc() {
    var data = cheatData({ blank: true });
    var list = h('div', { class: 'rc-list' }, data.answers.map(function (a, i) {
      return h('div', { class: 'rc-a' }, h('b', null, '(' + (i + 1) + ')'), ' ', frag(a));
    }));
    var answers = h('section', { class: 'rc-answers' }, h('h2', null, 'Answers — recall drill'),
      h('p', { class: 'rc-note' }, 'Cover this page until every blank is filled in from memory. ' + data.answers.length + ' answers, numbered as on the sheet.'), list);
    var sheet = cheatBlock(data, { title: 'NSCOM03 Midterm Recall Drill — Modules 1–4', sub: 'Write each blanked equation and key term from memory · answers at the back', noFigs: true });
    return docEl('doc-recall', 'recall', [sheet, answers]);
  }

  /* ================= reviewer ================= */

  function reviewerCover() {
    var tbl = h('table', { class: 'tbl compact rv-toc' },
      h('thead', null, h('tr', null, h('th', null, 'Deck'), h('th', null, 'Topic'), h('th', null, 'Slides'), h('th', null, 'In this reviewer'))),
      h('tbody', null, KIT.TOPIC_IDS.map(function (id) {
        var t = KIT.getTopic(id), m = KIT.META[id];
        return h('tr', null, h('td', { class: 'mono' }, KIT.ui.deckLabel(id)), h('td', null, (t && t.title) || m.title),
          h('td', null, m.range ? m.range[0] + '–' + m.range[1] : m.pages + ' slides'),
          h('td', null, t ? 'Included' : 'Pending — still being written'));
      })));
    return h('section', { class: 'rv-cover' },
      h('div', { class: 'ex-kicker' }, 'NSCOM03 Data Communications'),
      h('h1', null, 'Midterm Reviewer'),
      h('p', { class: 'rv-sub' }, 'Coverage: Modules 1–4 (L01–L04). Exam types: multiple choice, identification, solving (computation) and essay.'),
      h('h2', null, 'How to use it'),
      h('ol', { class: 'rv-how' },
        h('li', null, h('b', null, 'Study the weakest topic first.'), ' The kit’s diagnostic ranks the topics; read in that order.'),
        h('li', null, h('b', null, 'Per topic:'), ' intuition, then the notes, then the worked examples. Cover each solution and solve it yourself before reading it.'),
        h('li', null, h('b', null, 'Trust the refs.'), ' Every fact carries a slide page. Slide errors are flagged; on the exam follow the slide’s intent but know the correct version.'),
        h('li', null, h('b', null, 'Use the cheat sheet pages'), ' as the last-day summary, and the recall drill (the same sheet with its key terms blanked) to test yourself.'),
        h('li', null, h('b', null, 'Then simulate:'), ' a mock exam on paper, timed, and mark it with the key.')),
      h('h2', null, 'Contents'), tbl,
      h('p', { class: 'small muted' }, 'Pages: this cover, the cheat sheet, then one section per topic, each starting on a new page. Quick checks and practice are in the interactive kit, not in this reviewer.'));
  }

  function reviewerDoc() {
    var kids = [reviewerCover(), h('section', { class: 'rv-cheat page-break' }, cheatSheet())];
    KIT.topics().forEach(function (t) {
      var sec = h('section', { class: 'rv-topic page-break' });
      try { sec.appendChild(KIT.ui.renderTopic(t, { skipKinds: ['quick', 'practice'] })); }
      catch (e) { KIT.report(e, 'print:reviewer:' + t.id); sec.appendChild(h('p', null, 'This topic failed to render: ' + e.message)); }
      kids.push(sec);
    });
    return docEl('doc-reviewer', 'reviewer', kids);
  }

  /* ================= exams ================= */

  function partLabel(title) { return String(title).split(/\s+[—–-]\s+/)[0]; }
  function pts(n) { return n + (n === 1 ? ' pt' : ' pts'); }

  // Paper grids share one title column and bit width (KIT.ui.gridLayout), sized so the longest bit string
  // fills the answer column (~680 px) and stacked line codes line up for drawing.
  var GRID_COL = 680;

  function blankGrid(inp, lay) {
    var g = inp.grid, set = g.levelSet || g.levels;
    var init = g.init && g.init.level !== undefined ? g.init.level : undefined;
    return h('div', { class: 'ex-grid' }, KIT.svg.wave(new Array(g.answer.length).fill(null), {
      blank: true, bits: g.bits, cellsPerBit: g.cellsPerBit, levelSet: set, title: inp.label || '', init: init,
      titleWidth: lay.titleWidth, bitWidth: lay.bitWidth, stubSpace: true, rowGap: set.length > 3 ? 22 : 28 }));
  }

  function answerLines(p) {
    var box = h('div', { class: 'ex-answers' }), lay = KIT.ui.gridLayout(p.inputs, GRID_COL);
    p.inputs.forEach(function (inp) {
      if (inp.kind === 'grid') { box.appendChild(blankGrid(inp, lay)); return; }
      if (inp.kind === 'sketch') { box.appendChild(h('div', { class: 'ex-grid' }, inp.label ? h('div', { class: 'ex-alab' }, inp.label) : null, KIT.ui.sketch.figure({ axes: inp.axes, height: inp.height }, null))); return; }
      var label = inp.label || 'Answer';
      if (inp.kind === 'choice' && inp.choices) {
        box.appendChild(h('div', { class: 'ex-al' }, h('span', { class: 'ex-alab' }, label + ':'),
          h('span', { class: 'ex-opts' }, inp.choices.map(function (c, i) { return h('span', { class: 'ex-opt' }, '☐ ' + LETTERS.charAt(i) + '. ', typeof c === 'string' ? frag(c) : String(c)); }))));
        return;
      }
      if (inp.kind === 'tf') { box.appendChild(h('div', { class: 'ex-al' }, h('span', { class: 'ex-alab' }, label + ':'), h('span', { class: 'ex-opts' }, h('span', { class: 'ex-opt' }, '☐ True'), h('span', { class: 'ex-opt' }, '☐ False')))); return; }
      box.appendChild(h('div', { class: 'ex-al' }, h('span', { class: 'ex-alab' }, label + ' ='), h('span', { class: 'ex-line' }),
        inp.unit ? h('span', { class: 'ex-unit' }, inp.unit) : null));
    });
    return box;
  }

  function buildProblem(it, where) {
    try { return KIT.gen.build(it.gen, it.params); }
    catch (e) { KIT.report(e, 'print:' + where); return null; }
  }

  function genPaper(it, n, sec) {
    var p = buildProblem(it, 'exam-gen');
    var worth = it.pts !== undefined ? it.pts : sec.pts;
    var body = h('div', { class: 'ex-body' }, worth !== undefined ? h('div', { class: 'ex-pts' }, '[' + pts(worth) + ']') : null);
    if (!p) body.appendChild(h('div', { class: 'ex-text' }, 'This problem could not be built (' + it.gen + ').'));
    else {
      body.appendChild(h('div', { class: 'ex-text' }, frag(p.prompt)));
      // Drawing-only problems: the grids are the work area.
      if (!p.inputs.every(function (inp) { return inp.kind === 'grid' || inp.kind === 'sketch'; })) body.appendChild(h('div', { class: 'ex-work' }, h('span', { class: 'ex-work-label' }, 'Work')));
      body.appendChild(answerLines(p));
    }
    return h('div', { class: 'ex-q ex-gen no-lead' }, h('div', { class: 'ex-n' }, n + '.'), body);
  }

  function genKey(it, n, sec, opts) {        // opts.brief: skip the prompt (the worksheet already has it)
    var p = buildProblem(it, 'exam-key');
    var box = h('div', { class: 'kq kq-gen' }, h('div', { class: 'kq-head' }, h('span', { class: 'q-num' }, n + '.'),
      h('span', { class: 'q-type' }, 'Problem' + ((it.pts !== undefined ? it.pts : sec.pts) !== undefined ? ' · ' + pts(it.pts !== undefined ? it.pts : sec.pts) : '') + (it.topic ? ' · ' + KIT.ui.deckLabel(it.topic) : ''))));
    if (!p) { box.appendChild(h('div', { class: 'q-text' }, 'This problem could not be built (' + it.gen + ').')); return box; }
    if (!(opts && opts.brief)) box.appendChild(h('div', { class: 'q-text' }, frag(p.prompt)));
    box.appendChild(KIT.ui.solutionBlock(p));
    return box;
  }

  function paperQuestion(q, n, sec) {
    var text = h('div', { class: 'ex-text' }, frag(q.q));
    var body = h('div', { class: 'ex-body' }, text);
    var cls = 'ex-q ex-' + q.type;
    var lead = null;
    if (q.type === 'mcq' || q.type === 'multi') {
      var long = q.choices.some(function (c) { return plainText(c).length > 36; });
      body.appendChild(h('div', { class: 'ex-choices' + (long ? ' long' : '') }, q.choices.map(function (c, i) {
        return h('div', { class: 'ex-ch' }, h('span', { class: 'ex-l' }, (q.type === 'multi' ? '☐ ' : '') + LETTERS.charAt(i) + '.'), h('span', null, frag(c)));
      })));
      if (q.type === 'multi') text.appendChild(h('span', { class: 'ex-hint' }, ' (Select all that apply.)'));
      lead = h('div', { class: 'ex-blank', 'aria-hidden': 'true' });
    } else if (q.type === 'tf') {
      lead = h('div', { class: 'ex-blank', 'aria-hidden': 'true' });
      body.appendChild(h('div', { class: 'ex-hint' }, 'Write T for true or F for false on the line.'));
    } else if (q.type === 'id') {
      body.appendChild(h('div', { class: 'ex-al' }, h('span', { class: 'ex-alab' }, 'Answer:'), h('span', { class: 'ex-line' })));
    } else if (q.type === 'num') {
      body.appendChild(h('div', { class: 'ex-al' }, h('span', { class: 'ex-alab' }, 'Answer ='), h('span', { class: 'ex-line' }),
        q.num && q.num.unit ? h('span', { class: 'ex-unit' }, q.num.unit) : null));
    } else if (q.type === 'essay') {
      body.insertBefore(h('div', { class: 'ex-pts' }, '[' + pts(q.pts !== undefined ? q.pts : (sec.each || 5)) + ']'), text);
      // Essays may be answered with a drawing, an explanation, or both: a dot grid serves for writing and drawing.
      body.appendChild(h('div', { class: 'ex-draw' }, h('div', { class: 'ex-draw-label' }, 'Draw and/or explain'), KIT.ui.sketch.figure({ height: 330 }, null)));
    }
    return h('div', { class: cls + (lead ? '' : ' no-lead') }, lead, h('div', { class: 'ex-n' }, n + '.'), body);
  }

  function keyQuestion(q, n) {
    var short = (q.type === 'mcq' || q.type === 'multi') && q.choices && !q.choices.some(function (c) { return plainText(c).length > 36; });
    return h('div', { class: 'kq' + (short ? ' kq-short' : '') }, KIT.ui.quiz.render(q, { static: true, index: n }));
  }

  var PART_NOTE = {
    mcq: 'Write the letter of the best answer on the line before each number.',
    multi: 'Write the letters of all correct answers.',
    tf: 'Write T or F on the line before each number.',
    id: 'Write the term on the answer line.',
    gen: 'Show a complete solution; give final answers with units.',
    essay: 'Answer in the space provided — draw, explain, or both.'
  };

  function examParts(x, s, isKey) {
    return x.sections.map(function (sec, si) {
      var part = s.parts[si], each = sec.type === 'gen' ? sec.pts : sec.each;
      var noun = sec.type === 'gen' ? 'problem' : 'question';
      var sectionEl = h('section', { class: 'ex-part ex-part-' + sec.type + (sec.type === 'gen' || sec.type === 'essay' ? ' page-break' : '') },
        h('h2', null, sec.title, h('span', { class: 'ex-pts' }, part.planned + ' ' + noun + (part.planned === 1 ? '' : 's') + ' × ' + pts(each || 0) + ' = ' + pts(part.pts))));
      if (!isKey && PART_NOTE[sec.type]) sectionEl.appendChild(h('div', { class: 'ex-note' }, PART_NOTE[sec.type]));
      var items = sec.items || [];
      if (!items.length) sectionEl.appendChild(h('p', { class: 'ex-todo' }, 'These ' + noun + 's are not assembled yet.'));
      items.forEach(function (it, i) {
        if (sec.type === 'gen') { sectionEl.appendChild(isKey ? genKey(it, i + 1, sec) : genPaper(it, i + 1, sec)); return; }
        var q = typeof it === 'string' ? KIT.bank.get(it) : it;
        if (!q) { KIT.report(new Error('exam ' + x.id + ': unknown item ' + it), 'print:exam'); return; }
        sectionEl.appendChild(isKey ? keyQuestion(q, i + 1) : paperQuestion(q, i + 1, sec));
      });
      return sectionEl;
    });
  }

  function examHead(x, s, isKey) {
    var head = h('header', { class: 'ex-head' },
      h('div', { class: 'ex-kicker' }, 'NSCOM03 Data Communications · Midterm · Modules 1–4'),
      h('h1', null, x.title + (isKey ? ' — answer key' : '')),
      h('div', { class: 'ex-meta' }, 'Time allowed: ' + x.minutes + ' minutes · ' + s.total + ' points'));
    if (isKey) return head;
    head.appendChild(h('div', { class: 'ex-id' },
      h('div', { class: 'ex-fld wide' }, h('b', null, 'Name:'), h('i')),
      h('div', { class: 'ex-fld' }, h('b', null, 'Section:'), h('i')),
      h('div', { class: 'ex-fld' }, h('b', null, 'Date:'), h('i'))));
    head.appendChild(h('table', { class: 'ex-score' },
      h('thead', null, h('tr', null, h('th'), s.parts.map(function (p) { return h('th', null, partLabel(p.title)); }), h('th', null, 'Total'))),
      h('tbody', null,
        h('tr', null, h('th', null, 'Points'), s.parts.map(function (p) { return h('td', null, String(p.pts)); }), h('td', null, String(s.total))),
        h('tr', null, h('th', null, 'Score'), s.parts.map(function () { return h('td', { class: 'box' }); }), h('td', { class: 'box' })))));
    return head;
  }

  function blueprintTable(x, s) {
    return h('table', { class: 'tbl compact ex-blueprint' },
      h('thead', null, h('tr', null, h('th', null, 'Part'), h('th', null, 'Items'), h('th', null, 'Points'), h('th', null, 'Planned content'))),
      h('tbody', null, x.sections.map(function (sec, i) {
        var part = s.parts[i];
        var plan = sec.plan ? h('ul', { class: 'ex-plan' }, sec.plan.map(function (t) { return h('li', null, t); }))
          : sec.quota ? Object.keys(sec.quota).map(function (t) { return KIT.ui.deckLabel(t) + ' × ' + sec.quota[t]; }).join(' · ') : '';
        return h('tr', null, h('td', null, sec.title), h('td', null, part.count + ' of ' + part.planned), h('td', null, String(part.pts)), h('td', null, plan));
      })));
  }

  function examDoc(id, isKey) {
    var docId = 'exam-' + id + (isKey ? '-key' : '');
    var x = KIT.exams.get(id);
    if (!x) return docEl('doc-exam', docId, [h('h1', null, 'Unknown exam'), h('p', null, 'There is no exam form “' + id + '”.')]);
    var s = examSummary(x);
    var kids = [examHead(x, s, isKey)];
    if (!isKey) kids.push(h('div', { class: 'ex-instr' }, h('b', null, 'Instructions. '), x.instructions || ''));
    if (!s.anyItems) {
      kids.push(h('div', { class: 'ex-draft' }, h('b', null, 'This exam is being assembled.'),
        ' Its questions and problems have not been added yet, so there is nothing to ' + (isKey ? 'mark' : 'answer') + ' here. The blueprint below shows what the finished paper will contain.'));
      kids.push(blueprintTable(x, s));
    } else {
      if (!s.assembled) kids.push(h('div', { class: 'ex-draft' }, h('b', null, 'Draft.'), ' Some parts are not fully assembled yet; the points shown are the blueprint totals.'));
      if (isKey) kids.push(quickKey(x));
      kids = kids.concat(examParts(x, s, isKey));
    }
    return docEl('doc-' + (isKey ? 'key' : 'exam'), docId, kids);
  }

  /* ================= drawing drills: paper worksheet + key ================= */

  // Fresh bit strings (not the slide examples or the mock exams). Every scheme the slides draw, both scramblers, odd and even HDB3 starts.
  var DRILLS = [
    { title: 'Part A — Draw the line codes', note: 'Fill every cell of each grid. Each problem states the slide conventions to use.', items: [
      { gen: 'l03a.draw', params: { bits: '10011010', schemes: ['nrzl', 'nrzi', 'manchester', 'dmanchester'] } },
      { gen: 'l03a.draw', params: { bits: '01101001', schemes: ['rz', 'ami', 'mlt3'] } },
      { gen: 'l03a.draw', params: { bits: '0010110100', schemes: ['2b1q', 'unipolar'] } },
      { gen: 'l03a.draw', params: { bits: '00011101', schemes: ['nrzi', 'dmanchester', 'ami'] } },
      { gen: 'l03a.draw', params: { bits: '11110000', schemes: ['mlt3', '2b1q', 'manchester'] } }] },
    { title: 'Part B — Scrambling (B8ZS and HDB3)', note: 'Write the AMI pulses first, then substitute. Mark each V and B.', items: [
      { gen: 'l03a.scramble', params: { code: 'b8zs', bits: '1000000001100000', prev: -1, parity: 0 } },
      { gen: 'l03a.scramble', params: { code: 'hdb3', bits: '0000110000100000', prev: 1, parity: 0 } },
      { gen: 'l03a.scramble', params: { code: 'hdb3', bits: '0000100000000110', prev: -1, parity: 1 } }] },
    { title: 'Part C — Decode the signal', note: 'Write the bit string that was sent.', items: [
      { gen: 'l03a.decode', params: { scheme: 'manchester', bits: '01110010' } },
      { gen: 'l03a.decode', params: { scheme: 'nrzi', bits: '10100111' } },
      { gen: 'l03a.decode', params: { scheme: 'mlt3', bits: '11010110' } }] },
    { title: 'Part D — Draw the waves', note: 'Draw on the axes; check the shape bit by bit (or sample by sample) against the key.', items: [
      { gen: 'l02.sketch', params: { A: 3, f: 1, phase: 180 } },
      { gen: 'l04.sketch', params: { scheme: 'ook', bits: '10110' } },
      { gen: 'l04.sketch', params: { scheme: 'bpsk', bits: '1001' } },
      { gen: 'l03b.sketch', params: { L: 4, vmax: 4, values: [2.7, -0.4, -3.1, 1.6, 3.5, -1.9] } }] }
  ];

  function drillsDoc() {
    var kids = [h('header', { class: 'ex-head' },
      h('div', { class: 'ex-kicker' }, 'NSCOM03 Data Communications · Midterm · Modules 1–4'),
      h('h1', null, 'Drawing drills — line codes, scrambling, decoding, waves'),
      h('div', { class: 'ex-meta' }, 'Untimed practice on paper. The answer key starts on a new page.'))];
    var n = 0;
    DRILLS.forEach(function (part) {
      var sec = h('section', { class: 'ex-part ex-part-gen' }, h('h2', null, part.title), h('div', { class: 'ex-note' }, part.note));
      part.items.forEach(function (it) { sec.appendChild(genPaper(it, ++n, {})); });
      kids.push(sec);
    });
    var key = h('section', { class: 'ex-part page-break' }, h('h2', null, 'Answer key'));
    n = 0;
    DRILLS.forEach(function (part) { part.items.forEach(function (it) { key.appendChild(genKey(it, ++n, {}, { brief: true })); }); });
    kids.push(key);
    return docEl('doc-exam doc-key doc-drills', 'drills', kids);
  }

  /* ================= essay practice: general-pool essays on paper, model answers at the back ================= */

  /** Practice essays in lecture order — general pool only, so the mock exams and the diagnostic stay unseen. */
  function practiceEssays() {
    return [].concat.apply([], KIT.TOPIC_IDS.map(function (t) {
      return KIT.bank.query({ topic: t, pool: 'none' }).filter(function (q) { return q.type === 'essay'; });
    }));
  }

  function essaysDoc() {
    var list = practiceEssays();
    var kids = [h('header', { class: 'ex-head' },
      h('div', { class: 'ex-kicker' }, 'NSCOM03 Data Communications · Midterm · Modules 1–4'),
      h('h1', null, 'Essay practice — draw and/or explain'),
      h('div', { class: 'ex-meta' }, list.length + ' essays × 5 pts · answer by drawing, explaining or both · rubrics and model answers start on a new page'))];
    var paper = h('section', { class: 'ex-part ex-part-essay' }, h('div', { class: 'ex-note' }, PART_NOTE.essay));
    list.forEach(function (q, i) { paper.appendChild(paperQuestion(q, i + 1, { each: 5 })); });
    kids.push(paper);
    var key = h('section', { class: 'ex-part page-break' }, h('h2', null, 'Rubrics and model answers'));
    list.forEach(function (q, i) { key.appendChild(keyQuestion(q, i + 1)); });
    kids.push(key);
    return docEl('doc-exam doc-key doc-essays', 'essays', kids);
  }

  /** One-line multiple-choice key for fast marking: 1-B 2-D … */
  function quickKey(x) {
    var rows = [];
    x.sections.forEach(function (sec) {
      if (sec.type !== 'mcq') return;
      var line = (sec.items || []).map(function (id, i) {
        var q = KIT.bank.get(id);
        return q ? (i + 1) + '-' + LETTERS.charAt(q.answer) : null;
      }).filter(Boolean);
      // Each pair is its own unbreakable span, so a line never wraps inside “23-D”.
      if (line.length) rows.push(h('div', { class: 'kq-quick' }, h('b', null, partLabel(sec.title) + ': '),
        line.map(function (pr) { return [h('span', { class: 'kq-pair' }, pr), ' ']; })));   // the spaces are the break points
    });
    return rows.length ? h('div', { class: 'kq-quickbox' }, h('div', { class: 'q-sub' }, 'Quick key — multiple choice'), rows) : null;
  }

  /* ================= the print page ================= */

  function render(path) {
    var kind = path[1];
    if (kind === 'cheatsheet') return cheatDoc();
    if (kind === 'recall') return recallDoc();
    if (kind === 'reviewer') return reviewerDoc();
    if (kind === 'exam') return examDoc(path[2], path[3] === 'key');
    if (kind === 'drills') return drillsDoc();
    if (kind === 'essays') return essaysDoc();
    return h('div', { class: 'doc' }, h('h1', null, 'Unknown document'),
      h('p', null, 'There is no printable document “' + (kind || '') + '”. Available: ' + docs().map(function (d) { return d.id; }).join(', ') + '.'));
  }

  KIT.page('print', function (main, route) {
    var prev = KIT.env.static;
    KIT.env.static = true;                 // print documents never contain interactive controls
    try { main.appendChild(render(route.path)); }
    finally { KIT.env.static = prev; }
  });

  KIT.print = { docs: docs, blankKeys: blankKeys, examSummary: examSummary, cheatData: cheatData, cheatSheet: cheatSheet, render: render, drills: DRILLS, practiceEssays: practiceEssays };
})();
