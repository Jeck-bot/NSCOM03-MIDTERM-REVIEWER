/* Terms & FAQ side panel for topic pages. Owner: Lead.
   index()            → every glossary and walkthrough term [{ id, term, def, alt, ref, topic }]
   forms(entries, t)  → the surface forms to look for [{ s, cs, id }], longest first; t = current topic wins name clashes
   find(text, forms)  → non-overlapping matches [{ start, end, id }] — whole words, abbreviations case-sensitive, plurals ok
   panel(aside, topic, query) → { link(root) } — fills the right-hand aside and links terms inside [data-linkable] blocks.
   Hovering, focusing or clicking a dotted term shows its definition at the top of the panel. Links are added to reading
   content only (walkthrough cards, notes, analogies, traps), never inside questions, so a hover can't give away an answer. */
(function () {
  'use strict';
  var h = KIT.h;
  var cache = null;

  function index() {
    if (cache) return cache;
    var list = [];
    KIT.topics().forEach(function (t) {
      (t.glossary || []).forEach(function (g) { list.push({ term: g.term, def: g.def, alt: g.alt || [], ref: g.ref, topic: t.id }); });
    });
    KIT.walks().forEach(function (w) {
      w.terms.forEach(function (g) { list.push({ term: g.term, def: g.def, alt: g.alt || [], ref: g.ref, topic: w.topic }); });
    });
    list.forEach(function (e, i) { e.id = 't' + i; });
    cache = list;
    return list;
  }

  function isCaseSensitive(s) { return !/\s/.test(s) && /[A-Z0-9]/.test(s.slice(1)); }   // AMI, NRZ-I, 4B/5B, mBnL, dB
  function surfaces(name) {
    var out = [], base = String(name).replace(/\s*\([^)]*\)/g, '').trim(), re = /\(([^)]*)\)/g, m;
    if (base.length >= 2) out.push(base);
    while ((m = re.exec(name))) {
      var inner = m[1].trim();
      if (inner.length >= 2 && /^[A-Z0-9][A-Za-z0-9\-\/]*$/.test(inner) && /[A-Z0-9]/.test(inner.slice(1))) out.push(inner);
    }
    return out;
  }
  function forms(entries, topic) {
    var byKey = {}, out = [];
    entries.forEach(function (e) {
      [e.term].concat(e.alt || []).forEach(function (n) {
        surfaces(n).forEach(function (s) {
          var cs = isCaseSensitive(s), key = cs ? s : s.toLowerCase(), have = byKey[key];
          if (have && !(topic && e.topic === topic && have.topic !== topic)) return;
          byKey[key] = { s: s, cs: cs, id: e.id, topic: e.topic };
        });
      });
    });
    Object.keys(byKey).forEach(function (k) { out.push(byKey[k]); });
    return out.sort(function (a, b) { return b.s.length - a.s.length || (a.s < b.s ? -1 : 1); });
  }

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); }
  var ALNUM = /[A-Za-z0-9]/;
  function find(text, fs) {
    if (!fs.length) return [];
    if (!fs._re) {
      fs._re = new RegExp(fs.map(function (f) { return esc(f.s); }).join('|'), 'gi');
      fs._by = {};
      fs.forEach(function (f) { var k = f.s.toLowerCase(); (fs._by[k] = fs._by[k] || []).push(f); });
    }
    var re = fs._re, out = [], m;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      var i = m.index, s = m[0], f = null;
      (fs._by[s.toLowerCase()] || []).forEach(function (c) { if (!f && (c.cs ? c.s === s : true)) f = c; });
      var end = i + s.length;
      if (f && !f.cs) {      // plurals: elements, codes, classes
        if (/^es\b/i.test(text.slice(end)) && !ALNUM.test(text.charAt(end + 2))) end += 2;
        else if (/^s/i.test(text.slice(end)) && !ALNUM.test(text.charAt(end + 1))) end += 1;
      }
      var before = text.charAt(i - 1), after = text.charAt(end);
      var okBefore = !before || !ALNUM.test(before);
      var okAfter = !after || (!ALNUM.test(after) && !(after === '-' && ALNUM.test(text.charAt(end + 1))));
      if (f && okBefore && okAfter) { out.push({ start: i, end: end, id: f.id }); re.lastIndex = end; }
      else re.lastIndex = i + 1;
    }
    return out;
  }

  /* ---------- DOM linker ---------- */
  var SKIP = 'a, button, code, kbd, math, svg, figure, h1, h2, h3, h4, input, textarea, select, .term, .chip, .mono, .q, .predict, ' +
    '.problem-card, .essay-practice, .callout.example, .anim, .says-correct';
  // A term is linked once per card: its first use in a slide card, cram idea or section, not in every paragraph.
  var GROUP = '.slide-card, .cram-idea, .cram-top, .callout, section';
  function link(root, fs) {
    var n = 0, blocks = root.querySelectorAll('[data-linkable]'), groups = [], seenOf = [];
    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b], g = (block.closest && block.closest(GROUP)) || block, gi = groups.indexOf(g);
      if (gi < 0) { groups.push(g); seenOf.push({}); gi = groups.length - 1; }
      var seen = seenOf[gi], nodes = [];
      var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null);
      for (var t = walker.nextNode(); t; t = walker.nextNode()) {
        var p = t.parentNode;
        if (p && p.closest && p.closest(SKIP) && block.contains(p.closest(SKIP))) continue;
        if (t.nodeValue.trim().length > 1) nodes.push(t);
      }
      nodes.forEach(function (node) {
        var text = node.nodeValue, hitsAll = find(text, fs), hits = [];
        hitsAll.forEach(function (x) { if (!seen[x.id]) { seen[x.id] = true; hits.push(x); } });   // first use per block
        if (!hits.length) return;
        var frag = document.createDocumentFragment(), at = 0;
        hits.forEach(function (x) {
          if (x.start > at) frag.appendChild(document.createTextNode(text.slice(at, x.start)));
          frag.appendChild(h('span', { class: 'term', tabindex: '0', 'data-term': x.id }, text.slice(x.start, x.end)));
          at = x.end;
          n++;
        });
        if (at < text.length) frag.appendChild(document.createTextNode(text.slice(at)));
        node.parentNode.replaceChild(frag, node);
      });
    }
    return n;
  }

  /* ---------- the panel ---------- */
  function byId(id) { var all = index(); for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return null; }
  function byName(name) {
    var k = String(name).toLowerCase(), all = index();
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (e.term.toLowerCase() === k || e.alt.some(function (a) { return a.toLowerCase() === k; })) return e;
      if (surfaces(e.term).some(function (s) { return s.toLowerCase() === k; })) return e;
    }
    return null;
  }

  function panel(aside, topic, query) {
    query = query || {};
    var entries = index(), fs = forms(entries, topic.id), shown = null;
    var mine = entries.filter(function (e) { return e.topic === topic.id; });
    var keyNames = [];
    KIT.walks(topic.id).forEach(function (w) { keyNames = keyNames.concat(w.keyTerms); });
    var keys = [];
    keyNames.forEach(function (k) { var e = byName(k); if (e && keys.indexOf(e) < 0) keys.push(e); });
    var faq = [];
    KIT.walks(topic.id).forEach(function (w) { faq = faq.concat(w.faq); });

    var card = h('div', { class: 'tp-card', 'aria-live': 'polite' },
      h('p', { class: 'muted small' }, 'Point at, tab to or tap a dotted term to see its definition here.'));
    var filter = h('input', { type: 'search', class: 'tp-filter', placeholder: 'Filter terms…', 'aria-label': 'Filter terms' });
    function termButton(e) {
      var b = h('button', { type: 'button', class: 'tp-term', 'data-term': e.id }, e.term);
      b.addEventListener('click', function () { show(e); });
      return b;
    }
    var keyList = h('ul', { class: 'tp-list' }, keys.map(function (e) { return h('li', null, termButton(e)); }));
    var allList = h('ul', { class: 'tp-list' }, mine.slice().sort(function (a, b) { return a.term.localeCompare(b.term); })
      .map(function (e) { return h('li', null, termButton(e)); }));
    filter.addEventListener('input', function () {
      var q = filter.value.trim().toLowerCase();
      [keyList, allList].forEach(function (ul) {
        Array.prototype.forEach.call(ul.children, function (li) { li.hidden = q && li.textContent.toLowerCase().indexOf(q) < 0; });
      });
    });
    var close = h('button', { type: 'button', class: 'btn ghost small tp-close', 'aria-label': 'Close the terms panel' }, '✕');
    close.addEventListener('click', function () { aside.classList.remove('open'); });

    function show(e) {
      if (!e || e === shown) return;
      shown = e;
      KIT.clear(card);
      var other = e.topic !== topic.id ? h('span', { class: 'badge low' }, 'from ' + KIT.ui.deckLabel(e.topic)) : null;
      card.appendChild(h('div', { class: 'tp-name' }, e.term, other));
      if (e.alt && e.alt.length) card.appendChild(h('div', { class: 'tp-alt small muted' }, 'also: ' + e.alt.join(', ')));
      card.appendChild(h('div', { class: 'tp-def' }, KIT.html(e.def)));
      if (e.ref) card.appendChild(h('span', { class: 'chip ref' }, e.ref));
    }

    KIT.clear(aside);
    aside.hidden = false;
    aside.appendChild(h('div', { class: 'tp-head' }, h('div', { class: 'tp-title' }, 'Terms & FAQ'), close));
    aside.appendChild(card);
    aside.appendChild(filter);
    if (keys.length) aside.appendChild(h('section', { class: 'tp-sec' }, h('h3', null, '★ Must-know for ' + KIT.ui.deckLabel(topic.id)), keyList));
    aside.appendChild(h('details', { class: 'tp-sec' }, h('summary', null, 'All terms in this lecture (' + mine.length + ')'), allList));
    if (faq.length) {
      aside.appendChild(h('section', { class: 'tp-sec' }, h('h3', null, 'FAQ'),
        faq.map(function (f) { return h('details', { class: 'tp-faq' }, h('summary', null, KIT.html(f.q)), h('div', { class: 'small' }, KIT.html(f.a), h('span', { class: 'chip ref' }, f.ref))); })));
    }
    if (aside.parentNode && aside.parentNode.classList) aside.parentNode.classList.add('with-aside');

    // On narrow screens the panel is a drawer, opened by this button.
    var toggle = h('button', { type: 'button', class: 'btn primary tp-toggle no-print' }, 'Terms & FAQ');
    toggle.addEventListener('click', function () { aside.classList.toggle('open'); });
    if (aside.parentNode) aside.parentNode.appendChild(toggle);

    if (query.term) { var q0 = byName(query.term); if (q0) { show(q0); aside.classList.add('open'); } }

    function hover(ev) {
      var t = ev.target && ev.target.closest ? ev.target.closest('.term') : null;
      if (t) show(byId(t.getAttribute('data-term')));
    }
    return {
      show: show, card: card,
      /** Link the terms in a freshly rendered topic body (call again after a view switch). */
      link: function (root) {
        var n = link(root, fs);
        if (!root._termsWired) {
          root._termsWired = true;
          root.addEventListener('mouseover', hover);
          root.addEventListener('focusin', hover);
          root.addEventListener('click', function (ev) {
            var t = ev.target && ev.target.closest ? ev.target.closest('.term') : null;
            if (t) { show(byId(t.getAttribute('data-term'))); aside.classList.add('open'); }
          });
        }
        return n;
      }
    };
  }

  KIT.ui.terms = { index: index, forms: forms, find: find, link: link, panel: panel, byName: byName };
})();
