/* Schema validators (pure). Each returns an array of human-readable error strings ([] = valid).
   Used by the Node tests (test/content.test.js, test/exam.test.js) and by the browser selftest. */
(function () {
  'use strict';
  var TYPES = ['mcq', 'multi', 'tf', 'id', 'num', 'essay'];
  var SECTION_KINDS = ['intuition', 'notes', 'formulas', 'example', 'practice', 'quick', 'traps', 'mnemonics', 'recall'];
  var INPUT_KINDS = ['num', 'bits', 'text', 'choice', 'tf', 'vector', 'grid', 'sketch'];
  var VOID = { br: 1, hr: 1, img: 1, input: 1, meta: 1, link: 1, wbr: 1, col: 1, area: 1, source: 1, track: 1, embed: 1, param: 1 };
  var REF_PART = /^(L0[1-4]) pp?\.?\s?(\d+)(?:\s?[–-]\s?(\d+))?$/; // midterm coverage: L01–L04
  var BEYOND_REF = /^(Forouzan|Beyond slides|derived|textbook|Tanenbaum|Stallings|IEEE)/i;
  var GARBAGE = /\bundefined\b|\bNaN\b|\[object |\bTODO\b|\bTBD\b/;
  var ID_TOPIC = '(l01|l02|l03a|l03b|l04)';

  function isStr(s) { return typeof s === 'string' && s.trim().length > 0; }
  function prefix(where, list) { return list.map(function (x) { return where + ': ' + x; }); }

  /** "L03 p25", "L03 pp17-30", "L02 p30; L02 p32", or "Forouzan …" (beyond-slides material). */
  function checkRef(ref) {
    var errs = [];
    if (!isStr(ref)) return ['missing ref'];
    String(ref).split(/\s*;\s*/).forEach(function (part) {
      if (!part) return;
      var m = REF_PART.exec(part);
      if (m) {
        var pages = KIT.DECK_PAGES[m[1]];
        var a = +m[2], b = m[3] ? +m[3] : a;
        if (!pages) errs.push('ref "' + part + '" points outside the midterm coverage (L01–L04)');
        else if (a < 1 || b > pages || b < a) errs.push('ref "' + part + '" is outside ' + m[1] + ' (pages 1–' + pages + ')');
      } else if (!BEYOND_REF.test(part)) {
        errs.push('bad ref "' + part + '" — use "L03 p25", "L03 pp17-30", or "Forouzan …" for beyond-slides material');
      }
    });
    return errs;
  }

  /** Authored-HTML checks: balanced tags, no scripts/handlers/links, no TODO/TBD, and every $…$ formula parses. */
  function checkHtml(html, where) {
    var errs = [];
    where = where || 'html';
    if (typeof html !== 'string') return [where + ': must be a string'];
    if (/<script/i.test(html)) errs.push(where + ': <script> is not allowed');
    if (/\son[a-z]+\s*=/i.test(html)) errs.push(where + ': inline event handlers are not allowed');
    if (/javascript:/i.test(html)) errs.push(where + ': javascript: URLs are not allowed');
    if (/https?:\/\/(?!www\.w3\.org\/)/i.test(html)) errs.push(where + ': external links are not allowed (offline kit)');
    if (/\bTODO\b|\bTBD\b/.test(html)) errs.push(where + ': TODO/TBD left in content');
    if (html.indexOf('$') >= 0 && KIT.math) KIT.math.check(html).forEach(function (m) { errs.push(where + ': ' + m); });
    var text = html.replace(/<!--[\s\S]*?-->/g, '');
    var re = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g, m, stack = [];
    while ((m = re.exec(text))) {
      var tag = m[1].toLowerCase(), closing = m[0].charAt(1) === '/', selfClose = m[2] === '/';
      if (VOID[tag] || selfClose) continue;
      if (!closing) { stack.push(tag); continue; }
      var top = stack.pop();
      if (top !== tag) { errs.push(where + ': unbalanced </' + tag + '> (innermost open tag: ' + (top ? '<' + top + '>' : 'none') + '); write "<" in text as &lt;'); return errs; }
    }
    if (stack.length) errs.push(where + ': unclosed <' + stack.join('>, <') + '>');
    return errs;
  }

  function garbage(text) { return GARBAGE.test(String(text)); }

  function question(q) {
    var id = q && q.id, where = 'question ' + (id || '?'), e = [];
    if (!q || typeof q !== 'object') return [where + ': not an object'];
    var m = new RegExp('^' + ID_TOPIC + '\\.([qe])(\\d{3})$').exec(id || '');
    if (!m) e.push('id must look like "l07.q012" (or "l07.e001" for essays)');
    else {
      if (q.topic !== m[1]) e.push('topic must be "' + m[1] + '" to match the id');
      if ((m[2] === 'e') !== (q.type === 'essay')) e.push('essays use .eNNN ids; every other type uses .qNNN');
    }
    if (KIT.TOPIC_IDS.indexOf(q.topic) < 0) e.push('unknown topic "' + q.topic + '"');
    if (TYPES.indexOf(q.type) < 0) e.push('type must be one of ' + TYPES.join(', '));
    if (!isStr(q.q)) e.push('missing q (question text)');
    else { e = e.concat(checkHtml(q.q, 'q')); if (garbage(q.q)) e.push('q contains undefined/NaN/TODO'); }
    if (q.type !== 'essay' && !isStr(q.explain)) e.push('missing explain');
    if (q.explain !== undefined) e = e.concat(checkHtml(q.explain, 'explain'));
    e = e.concat(checkRef(q.ref));
    if (q.diff !== undefined && [1, 2, 3].indexOf(q.diff) < 0) e.push('diff must be 1, 2 or 3');
    if (q.pool !== undefined && ['A', 'B', 'diag'].indexOf(q.pool) < 0) e.push('pool must be "A", "B" or "diag" (omit for general items)');
    if (q.tags !== undefined && !Array.isArray(q.tags)) e.push('tags must be an array');
    switch (q.type) {
      case 'mcq':
      case 'multi':
        if (!Array.isArray(q.choices) || q.choices.length < 3 || q.choices.length > 5) { e.push('mcq/multi need 3–5 choices'); break; }
        var seen = {};
        q.choices.forEach(function (c, i) {
          if (!isStr(c)) { e.push('choice ' + i + ' is empty'); return; }
          var k = c.trim().toLowerCase();
          if (seen[k]) e.push('duplicate choice "' + c + '"');
          seen[k] = true;
          e = e.concat(checkHtml(c, 'choice ' + i));
        });
        if (q.type === 'mcq' && !(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length)) e.push('answer must be a valid choice index');
        if (q.type === 'multi') {
          var ok = Array.isArray(q.answer) && q.answer.length >= 1 && q.answer.every(function (a) { return Number.isInteger(a) && a >= 0 && a < q.choices.length; });
          if (!ok || new Set(q.answer).size !== q.answer.length) e.push('answer must be an array of distinct choice indexes');
        }
        break;
      case 'tf':
        if (typeof q.answer !== 'boolean') e.push('answer must be true or false');
        if (q.answer === false && !isStr(q.fix)) e.push('false statements need fix (the corrected statement)');
        break;
      case 'id':
        if (!isStr(q.answer)) e.push('answer must be the canonical term');
        if (q.accept !== undefined && !(Array.isArray(q.accept) && q.accept.every(isStr))) e.push('accept must be an array of strings');
        break;
      case 'num':
        if (!q.num || typeof q.num.value !== 'number' || !isFinite(q.num.value)) e.push('num.value must be a finite number');
        else if (typeof q.num.unit !== 'string') e.push('num.unit is required ("" for a plain number)');
        break;
      case 'essay':
        if (!Array.isArray(q.rubric) || !q.rubric.length) e.push('rubric is required');
        else q.rubric.forEach(function (r, i) { if (!(r && r.pts > 0 && isStr(r.point))) e.push('rubric ' + i + ' needs pts > 0 and point'); });
        if (!isStr(q.model)) e.push('model answer is required');
        else e = e.concat(checkHtml(q.model, 'model'));
        break;
    }
    return prefix(where, e);
  }

  function formula(f) {
    var where = 'formula ' + (f && f.id || '?'), e = [];
    if (!f || typeof f !== 'object') return [where + ': not an object'];
    if (!new RegExp('^' + ID_TOPIC + '\\.[a-z0-9-]+$').test(f.id || '')) e.push('id must look like "l02.shannon"');
    else if (f.id.split('.')[0] !== f.topic) e.push('topic must match the id prefix');
    if (!isStr(f.name)) e.push('missing name');
    if (!isStr(f.html)) e.push('missing html'); else e = e.concat(checkHtml(f.html, 'html'));
    if (f.where !== undefined) e = e.concat(checkHtml(f.where, 'where'));
    if (f.note !== undefined) e = e.concat(checkHtml(f.note, 'note'));
    e = e.concat(checkRef(f.ref));
    return prefix(where, e);
  }

  function input(inp, where) {
    var e = [];
    if (!inp || INPUT_KINDS.indexOf(inp.kind) < 0) return [where + ': kind must be one of ' + INPUT_KINDS.join(', ')];
    if (inp.label !== undefined && garbage(inp.label)) e.push('label contains undefined/NaN');
    switch (inp.kind) {
      case 'num':
        if (typeof inp.answer !== 'number' || !isFinite(inp.answer)) e.push('answer must be a finite number (got ' + inp.answer + ')');
        if (typeof inp.unit !== 'string') e.push('unit is required ("" for a plain number)');
        break;
      case 'bits': if (!/^[01]+$/.test(String(inp.answer))) e.push('answer must be a bit string'); break;
      case 'text': if (!((Array.isArray(inp.accept) && inp.accept.length && inp.accept.every(isStr)) || isStr(inp.answer))) e.push('text needs accept[] or answer'); break;
      case 'choice':
        if (!Array.isArray(inp.choices) || inp.choices.length < 2) e.push('choice needs choices[]');
        else if (!Array.isArray(inp.answer) && !(Number.isInteger(inp.answer) && inp.answer >= 0 && inp.answer < inp.choices.length)) e.push('choice answer must be an index');
        break;
      case 'tf': if (typeof inp.answer !== 'boolean') e.push('tf answer must be boolean'); break;
      case 'vector': if (!Array.isArray(inp.answer) || !inp.answer.every(function (x) { return typeof x === 'number' && isFinite(x); })) e.push('vector answer must be finite numbers'); break;
      case 'grid':
        var g = inp.grid;
        if (!g || !Array.isArray(g.answer) || !Array.isArray(g.levels)) { e.push('grid needs grid.answer[] and grid.levels[]'); break; }
        if ([0.5, 1, 2].indexOf(g.cellsPerBit) < 0) e.push('grid.cellsPerBit must be 0.5, 1 or 2');
        if (typeof g.bits !== 'string' || !/^[01]+$/.test(g.bits)) e.push('grid.bits must be a bit string');
        else if (Math.round(g.bits.length * g.cellsPerBit) !== g.answer.length) e.push('grid.answer length must be bits × cellsPerBit');
        g.answer.forEach(function (v, i) { if (g.levels.indexOf(v) < 0) e.push('grid.answer[' + i + ']=' + v + ' is not in levels'); });
        (g.alts || []).forEach(function (alt, i) { if (!Array.isArray(alt) || alt.length !== g.answer.length) e.push('grid.alts[' + i + '] has the wrong length'); });
        break;
      case 'sketch':
        var ax = inp.axes, range = function (r) { return Array.isArray(r) && r.length === 2 && isFinite(r[0]) && isFinite(r[1]) && r[1] > r[0]; };
        if (!ax || !range(ax.x) || !range(ax.y)) e.push('sketch needs axes.x and axes.y as increasing [min, max]');
        var series = inp.model && inp.model.series;
        if (!Array.isArray(series) || !series.length) e.push('sketch needs model.series[]');
        else series.forEach(function (sr, i) {
          if (sr.kind === 'fn' ? typeof sr.fn !== 'function' : !(sr.kind === 'step' || sr.kind === 'points') || !Array.isArray(sr.data) || !sr.data.length) e.push('model.series[' + i + '] needs fn or data');
        });
        if (!Array.isArray(inp.rubric) || !inp.rubric.length || !inp.rubric.every(function (r) { return r && r.pts > 0 && isStr(r.point); })) e.push('sketch needs rubric [{pts, point}] for the self-check');
        break;
    }
    return prefix(where, e);
  }

  /** A built problem: {prompt, inputs[], steps[], hints?, key?} */
  function problem(p, where) {
    where = where || 'problem';
    var e = [];
    if (!p || typeof p !== 'object') return [where + ': build() must return an object'];
    if (!isStr(p.prompt)) e.push(where + ': missing prompt');
    else { e = e.concat(checkHtml(p.prompt, where + '.prompt')); if (garbage(p.prompt)) e.push(where + ': prompt contains undefined/NaN/[object/TODO'); }
    if (!Array.isArray(p.inputs) || !p.inputs.length) e.push(where + ': needs at least one input');
    else p.inputs.forEach(function (inp, i) { e = e.concat(input(inp, where + '.inputs[' + i + ']')); });
    if (!Array.isArray(p.steps) || !p.steps.length) e.push(where + ': needs steps[] (the worked solution)');
    else p.steps.forEach(function (s, i) {
      if (!isStr(s)) e.push(where + '.steps[' + i + ']: must be a non-empty string');
      else { e = e.concat(checkHtml(s, where + '.steps[' + i + ']')); if (garbage(s)) e.push(where + '.steps[' + i + ']: contains undefined/NaN/[object/TODO'); }
    });
    if (p.key !== undefined && typeof p.key !== 'function') e.push(where + ': key must be a function returning an Element');
    if (p.colors !== undefined) {     // the color key of a worked solution: [{ role, tex, name }]
      if (!Array.isArray(p.colors)) e.push(where + ': colors must be an array');
      else p.colors.forEach(function (c, i) {
        if (!c || !KIT.math.ROLES[c.role] || !isStr(c.tex) || !isStr(c.name)) { e.push(where + '.colors[' + i + ']: needs a known role, tex and name'); return; }
        KIT.math.check('$' + c.tex + '$').forEach(function (m) { e.push(where + '.colors[' + i + ']: ' + m); });
      });
    }
    return e;
  }

  function topic(t) {
    var where = 'topic ' + (t && t.id || '?'), e = [];
    if (!t || typeof t !== 'object') return [where + ': not an object'];
    var meta = KIT.META[t.id];
    if (!meta) return [where + ': id must be one of ' + KIT.TOPIC_IDS.join(', ')];
    if (!isStr(t.title)) e.push('missing title');
    if (!isStr(t.blurb)) e.push('missing blurb');
    if (t.lecture !== meta.lecture) e.push('lecture must be ' + meta.lecture);
    if (!Array.isArray(t.glance) || t.glance.length < 3) e.push('glance needs at least 3 bullets');
    else t.glance.forEach(function (g, i) { e = e.concat(checkHtml(g, 'glance[' + i + ']')); });
    if (!Array.isArray(t.ask) || t.ask.length < 2) e.push('ask needs at least 2 likely question forms');
    if (!Array.isArray(t.sections) || !t.sections.length) e.push('sections must be a non-empty array');
    var noteIds = {};
    (t.sections || []).forEach(function (s, i) {
      var w = 'sections[' + i + '] (' + (s && s.kind) + ')';
      if (!s || SECTION_KINDS.indexOf(s.kind) < 0) { e.push(w + ': kind must be one of ' + SECTION_KINDS.join(', ')); return; }
      switch (s.kind) {
        case 'intuition':
          if (s.viz && !KIT.viz.has(s.viz)) e.push(w + ': viz "' + s.viz + '" is not registered');
          if (s.fig && !KIT.fig.has(s.fig)) e.push(w + ': fig "' + s.fig + '" is not registered');
          if (!s.viz && !s.fig && !isStr(s.analogy)) e.push(w + ': needs viz, fig, or analogy');
          if (s.analogy !== undefined) e = e.concat(checkHtml(s.analogy, w + '.analogy'));
          (s.predict || []).forEach(function (p, j) {
            if (!isStr(p.q) || !Array.isArray(p.choices) || !Number.isInteger(p.answer) || !isStr(p.explain)) e.push(w + '.predict[' + j + ']: needs q, choices, answer, explain');
          });
          break;
        case 'notes':
          if (!isStr(s.id)) e.push(w + ': missing id'); else if (noteIds[s.id]) e.push(w + ': duplicate notes id ' + s.id); else noteIds[s.id] = true;
          if (!isStr(s.title)) e.push(w + ': missing title');
          if (!isStr(s.html)) e.push(w + ': missing html'); else e = e.concat(checkHtml(s.html, w + '.html'));
          e = e.concat(prefix(w, checkRef(s.ref)));
          break;
        case 'formulas':
          if (!Array.isArray(s.ids) || !s.ids.length) e.push(w + ': ids[] required');
          else s.ids.forEach(function (id) { if (!KIT.getFormula(id)) e.push(w + ': formula "' + id + '" is not registered'); });
          break;
        case 'example':
          if (!isStr(s.title)) e.push(w + ': missing title');
          e = e.concat(prefix(w, checkRef(s.ref)));
          if (s.gen) {
            if (!KIT.gen.has(s.gen)) e.push(w + ': generator "' + s.gen + '" is not registered');
            if (!s.params || typeof s.params !== 'object') e.push(w + ': params object required');
            if (s.slideValue !== undefined && typeof s.slideValue !== 'number') e.push(w + ': slideValue must be a number');
          } else if (!isStr(s.html)) e.push(w + ': needs gen+params or html');
          else e = e.concat(checkHtml(s.html, w + '.html'));
          break;
        case 'practice':
          if (!Array.isArray(s.gens) || !s.gens.length) e.push(w + ': gens[] required');
          else s.gens.forEach(function (g) { if (!KIT.gen.has(g)) e.push(w + ': generator "' + g + '" is not registered'); });
          break;
        case 'quick':
          if (!(Number.isInteger(s.n) && s.n >= 1)) e.push(w + ': n must be a positive integer');
          break;
        case 'traps':
          if (!Array.isArray(s.items) || !s.items.length) e.push(w + ': items[] required');
          else s.items.forEach(function (it, j) {
            if (!isStr(it.trap) || !isStr(it.fix)) e.push(w + '.items[' + j + ']: needs trap and fix');
            else { e = e.concat(checkHtml(it.trap, w + '.trap')); e = e.concat(checkHtml(it.fix, w + '.fix')); }
            if (it.ref !== undefined) e = e.concat(prefix(w + '.items[' + j + ']', checkRef(it.ref)));
          });
          break;
        case 'mnemonics':
        case 'recall':
          var list = s.kind === 'recall' ? s.prompts : s.items;
          if (!Array.isArray(list) || !list.length || !list.every(isStr)) e.push(w + ': needs a non-empty list of strings (' + (s.kind === 'recall' ? 'prompts' : 'items') + ')');
          else list.forEach(function (x, j) { e = e.concat(checkHtml(x, w + '[' + j + ']')); });
          break;
      }
    });
    (t.slideErrors || []).forEach(function (se, i) {
      if (!isStr(se.says) || !isStr(se.correct)) e.push('slideErrors[' + i + ']: needs says and correct');
      e = e.concat(prefix('slideErrors[' + i + ']', checkRef(se.ref)));
    });
    var terms = {};
    (t.glossary || []).forEach(function (g, i) {
      if (!isStr(g.term) || !isStr(g.def)) { e.push('glossary[' + i + ']: needs term and def'); return; }
      var k = g.term.toLowerCase();
      if (terms[k]) e.push('glossary: duplicate term "' + g.term + '"');
      terms[k] = true;
      e = e.concat(checkHtml(g.def, 'glossary[' + i + '].def'));
      if (g.ref !== undefined) e = e.concat(prefix('glossary[' + i + ']', checkRef(g.ref)));
    });
    (t.cheat || []).forEach(function (c, i) {
      if (!isStr(c.title) || !isStr(c.html)) e.push('cheat[' + i + ']: needs title and html');
      else e = e.concat(checkHtml(c.html, 'cheat[' + i + '].html'));
    });
    return prefix(where, e);
  }

  function isInt(x) { return typeof x === 'number' && Math.floor(x) === x; }
  function isSpan(a) { return Array.isArray(a) && a.length === 2 && isInt(a[0]) && isInt(a[1]) && a[1] >= a[0]; }
  var WALK_ID = new RegExp('^' + ID_TOPIC + '(?:-\\d)?$');

  /** Slide-by-slide walkthrough file (content/walk/*.js). Cross-file checks (unique terms, coverage) are in test/walk.test.js. */
  function walk(w) {
    var where = 'walk ' + (w && w.id || '?'), e = [];
    if (!w || typeof w !== 'object') return [where + ': not an object'];
    function html(x, at) {
      if (!isStr(x)) { e.push(at + ': missing'); return; }
      e = e.concat(checkHtml(x, at));
      if (garbage(x)) e.push(at + ': contains undefined/NaN/TODO');
      var re = /data-fig="([^"]*)"/g, m;
      while ((m = re.exec(x))) if (!KIT.fig.has(m[1])) e.push(at + ': unknown figure "' + m[1] + '"');
    }
    if (!WALK_ID.test(w.id || '')) e.push('id must look like "l03a-1" or "l04"');
    if (KIT.TOPIC_IDS.indexOf(w.topic) < 0) { e.push('unknown topic "' + w.topic + '"'); return prefix(where, e); }
    if (String(w.id).indexOf(w.topic) !== 0) e.push('id must start with the topic id');
    var tr = KIT.topicRange(w.topic), r = w.range;
    if (!isSpan(r)) { e.push('range must be [firstSlide, lastSlide]'); return prefix(where, e); }
    if (r[0] < tr[0] || r[1] > tr[1]) e.push('range ' + r.join('–') + ' is outside ' + w.topic + ' (slides ' + tr.join('–') + ')');
    if (!Array.isArray(w.parts) || !w.parts.length) { e.push('parts[] required'); return prefix(where, e); }
    var next = r[0];
    w.parts.forEach(function (p, i) {
      var pw = 'parts[' + i + ']';
      if (!isStr(p.title)) e.push(pw + ': needs a title');
      if (!isSpan(p.slides)) { e.push(pw + ': slides must be [first, last]'); return; }
      if (p.slides[0] !== next) e.push(pw + ': starts at slide ' + p.slides[0] + ', expected ' + next + ' (parts are contiguous)');
      next = p.slides[1] + 1;
      var at = p.slides[0];
      if (!Array.isArray(p.items) || !p.items.length) { e.push(pw + ': items[] required'); return; }
      p.items.forEach(function (it, j) {
        var n = it && it.n, s = isInt(n) ? [n, n] : n;
        if (!isSpan(s)) { e.push(pw + '.items[' + j + ']: n must be a slide number or [first, last]'); return; }
        var iw = pw + ' slide ' + (s[0] === s[1] ? s[0] : s.join('–'));
        if (s[0] !== at) e.push(iw + ': expected slide ' + at + ' next (every slide exactly once, in order)');
        at = s[1] + 1;
        if (!isStr(it.title)) e.push(iw + ': needs a title');
        html(it.says, iw + '.says');
        if (it.kind === 'admin') {
          ['means', 'why', 'tip', 'beyond', 'error', 'example'].forEach(function (k) {
            if (it[k] !== undefined) e.push(iw + ': admin slides only have a title and says (found ' + k + ')');
          });
        } else {
          if (it.kind !== undefined) e.push(iw + ': kind must be "admin" or left out');
          html(it.means, iw + '.means');
          html(it.why, iw + '.why');
        }
        if (it.tip !== undefined) html(it.tip, iw + '.tip');
        if (it.beyond !== undefined) html(it.beyond, iw + '.beyond');
        if (it.error !== undefined) {
          if (!it.error || typeof it.error !== 'object') e.push(iw + '.error: must be { says, correct }');
          else { html(it.error.says, iw + '.error.says'); html(it.error.correct, iw + '.error.correct'); }
        }
        if (it.ref !== undefined) e = e.concat(prefix(iw, checkRef(it.ref)));
        if (it.example !== undefined) {
          var x = it.example || {};
          if (!isStr(x.title)) e.push(iw + '.example: needs a title');
          if (x.gen !== undefined) {
            if (!KIT.gen.has(x.gen)) e.push(iw + '.example: unknown generator "' + x.gen + '"');
            if (x.slideAnswer !== undefined) html(x.slideAnswer, iw + '.example.slideAnswer');
          } else html(x.html, iw + '.example.html');
        }
      });
      if (at !== p.slides[1] + 1) e.push(pw + ': items end at slide ' + (at - 1) + ' but the part ends at ' + p.slides[1]);
      html(p.together, pw + '.together');
    });
    if (next !== r[1] + 1) e.push('parts end at slide ' + (next - 1) + ' but the range ends at ' + r[1]);
    if (!Array.isArray(w.terms)) e.push('terms[] required (may be empty)');
    var seen = {};
    (w.terms || []).forEach(function (g, i) {
      var tw = 'terms[' + i + ']';
      if (!g || !isStr(g.term) || !isStr(g.def)) { e.push(tw + ': needs term and def'); return; }
      var k = g.term.toLowerCase();
      if (seen[k]) e.push('duplicate term "' + g.term + '"');
      seen[k] = true;
      html(g.def, tw + '.def');
      e = e.concat(prefix(tw, checkRef(g.ref)));
      if (g.alt !== undefined && !(Array.isArray(g.alt) && g.alt.every(isStr))) e.push(tw + ': alt must be an array of names');
    });
    if (!Array.isArray(w.keyTerms) || !w.keyTerms.every(isStr)) e.push('keyTerms[] must list term names');
    if (!Array.isArray(w.faq) || w.faq.length < 4 || w.faq.length > 10) e.push('faq[] needs 4–10 entries');
    (w.faq || []).forEach(function (f, i) {
      var fw = 'faq[' + i + ']';
      if (!f) { e.push(fw + ': empty'); return; }
      html(f.q, fw + '.q');
      html(f.a, fw + '.a');
      e = e.concat(prefix(fw, checkRef(f.ref)));
    });
    return prefix(where, e);
  }

  /** The cram sheet (content/cram.js): top must-knows, concepts per lecture, then the computational recipes. */
  function cram(c) {
    var where = 'cram', e = [];
    if (!c || typeof c !== 'object') return [where + ': not registered'];
    function html(x, at) {
      if (!isStr(x)) { e.push(at + ': missing'); return; }
      e = e.concat(checkHtml(x, at));
      if (garbage(x)) e.push(at + ': contains undefined/NaN/TODO');
      var re = /data-fig="([^"]*)"/g, m;
      while ((m = re.exec(x))) if (!KIT.fig.has(m[1])) e.push(at + ': unknown figure "' + m[1] + '"');
    }
    function refOk(r, at) { e = e.concat(prefix(at, checkRef(r))); }
    html(c.intro, 'intro');
    if (!Array.isArray(c.top) || c.top.length < 8 || c.top.length > 20) e.push('top[] needs 8–20 must-knows');
    (c.top || []).forEach(function (x, i) {
      if (KIT.TOPIC_IDS.indexOf(x.topic) < 0) e.push('top[' + i + ']: unknown topic');
      html(x.html, 'top[' + i + '].html'); refOk(x.ref, 'top[' + i + ']');
    });
    var seen = {};
    (c.lectures || []).forEach(function (l, i) {
      var lw = 'lectures[' + i + '] (' + l.topic + ')';
      if (KIT.TOPIC_IDS.indexOf(l.topic) < 0) { e.push(lw + ': unknown topic'); return; }
      seen[l.topic] = true;
      html(l.big, lw + '.big');
      if (!Array.isArray(l.ideas) || l.ideas.length < 4) e.push(lw + ': needs at least 4 ideas');
      (l.ideas || []).forEach(function (x, j) {
        var iw = lw + '.ideas[' + j + ']';
        if (!isStr(x.title)) e.push(iw + ': needs a title');
        html(x.html, iw + '.html'); refOk(x.ref, iw);
      });
      (l.mixups || []).forEach(function (x, j) {
        var mw = lw + '.mixups[' + j + ']';
        if (!isStr(x.a) || !isStr(x.b)) e.push(mw + ': needs a and b');
        html(x.html, mw + '.html'); refOk(x.ref, mw);
      });
    });
    KIT.TOPIC_IDS.forEach(function (t) { if (!seen[t]) e.push('lectures: ' + t + ' is missing'); });
    (c.compute || []).forEach(function (g, i) {
      var gw = 'compute[' + i + '] (' + g.topic + ')';
      if (KIT.TOPIC_IDS.indexOf(g.topic) < 0) e.push(gw + ': unknown topic');
      (g.recipes || []).forEach(function (r, j) {
        var rw = gw + '.recipes[' + j + ']';
        if (!isStr(r.title)) e.push(rw + ': needs a title');
        html(r.when, rw + '.when'); html(r.how, rw + '.how'); html(r.example, rw + '.example'); refOk(r.ref, rw);
        (r.formulas || []).forEach(function (id) { if (!KIT.getFormula(id)) e.push(rw + ': unknown formula ' + id); });
      });
    });
    if (!Array.isArray(c.compute) || !c.compute.length) e.push('compute[] required');
    (c.tips || []).forEach(function (x, i) { html(x, 'tips[' + i + ']'); });
    return prefix(where, e);
  }

  /** Structural exam check. Content checks for final forms live in test/exam.test.js. */
  function exam(x) {
    var where = 'exam ' + (x && x.id || '?'), e = [];
    if (!x || typeof x !== 'object') return [where + ': not an object'];
    if (!isStr(x.title)) e.push('missing title');
    if (['form', 'diag'].indexOf(x.kind) < 0) e.push('kind must be "form" or "diag"');
    if (['draft', 'final'].indexOf(x.status) < 0) e.push('status must be "draft" or "final"');
    if (!Array.isArray(x.sections) || !x.sections.length) e.push('sections required');
    (x.sections || []).forEach(function (s, i) {
      var w = 'sections[' + i + '] (' + (s && s.id) + ')';
      if (!isStr(s.id) || !isStr(s.title)) e.push(w + ': needs id and title');
      if (['mcq', 'tf', 'id', 'gen', 'essay', 'mixed'].indexOf(s.type) < 0) e.push(w + ': bad type');
      if (!Array.isArray(s.items)) e.push(w + ': items[] required');
    });
    return prefix(where, e);
  }

  KIT.schema = {
    TYPES: TYPES, SECTION_KINDS: SECTION_KINDS, INPUT_KINDS: INPUT_KINDS,
    checkRef: checkRef, checkHtml: checkHtml, garbage: garbage,
    question: question, formula: formula, input: input, problem: problem, topic: topic, exam: exam, walk: walk, cram: cram
  };
})();
