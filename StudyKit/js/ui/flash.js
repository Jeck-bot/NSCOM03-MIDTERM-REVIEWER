/* Flashcards (#/flash): Leitner boxes 1–5, built from topic glossaries, cheat-sheet formulas, and general identification
   items (exam-pool items are excluded so the mocks stay fresh). Owner: Lead (Phase 2). Progress: KIT.store 'flash.state'. */
(function () {
  'use strict';
  var h = KIT.h;
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); }

  function buildDeck() {
    var deck = [];
    KIT.topics().forEach(function (t) {
      (t.glossary || []).forEach(function (g) {
        deck.push({ id: t.id + '.term.' + slug(g.term), topic: t.id, kind: 'Term', frontText: g.term, backHtml: g.def, ref: g.ref });
      });
    });
    KIT.formulas({ sheet: true }).forEach(function (f) {
      deck.push({ id: f.id, topic: f.topic, kind: 'Formula', frontText: f.name, backHtml: f.html + (f.where ? '<div class="small muted">' + f.where + '</div>' : ''), ref: f.ref });
    });
    KIT.bank.query({ type: 'id', pool: 'none' }).forEach(function (q) {
      deck.push({ id: q.id, topic: q.topic, kind: 'Identify', frontHtml: q.q, backText: q.answer, extraHtml: q.explain, ref: q.ref });
    });
    return deck;
  }
  KIT.ui.flash = { deck: buildDeck };

  function state() { return KIT.store.get('flash.state', {}); }
  function save(s) { KIT.store.set('flash.state', s); }

  KIT.page('flash', function (main, route) {
    var q = route.query || {};
    var topic = q.topic || 'all';
    var deck = buildDeck().filter(function (c) { return topic === 'all' || c.topic === topic; });
    main.appendChild(h('h1', null, 'Flashcards'));
    main.appendChild(h('p', { class: 'muted' }, 'Spaced repetition with Leitner boxes: “Again” sends a card back to box 1; “Got it” moves it up a box. ' +
      'Low boxes come back first. Keys: Space = flip, 1 = again, 2 = got it.'));
    var row = h('div', { class: 'btn-row' }, [['all', 'All topics']].concat(KIT.TOPIC_IDS.map(function (t) { return [t, KIT.ui.deckLabel(t)]; })).map(function (o) {
      return h('a', { class: 'btn' + (topic === o[0] ? ' primary' : ''), href: '#/flash?topic=' + o[0] }, o[1]);
    }));
    main.appendChild(row);
    if (!deck.length) { main.appendChild(h('p', { class: 'muted' }, 'No cards for this topic yet.')); return; }

    var st = state();
    function box(c) { return (st[c.id] && st[c.id].box) || 1; }
    var counts = [0, 0, 0, 0, 0];
    deck.forEach(function (c) { counts[box(c) - 1]++; });
    main.appendChild(h('div', { class: 'box-counts' }, counts.map(function (n, i) {
      return h('span', { class: 'chip' }, 'Box ' + (i + 1) + ': ' + n);
    })));

    if (KIT.env.static) {
      var ol = h('ol', { class: 'flash-list' });
      deck.forEach(function (c) {
        ol.appendChild(h('li', null, h('b', null, c.frontText || ''), c.frontHtml ? KIT.html(c.frontHtml) : null, ' — ',
          c.backHtml ? KIT.html(c.backHtml) : c.backText));
      });
      main.appendChild(ol);
      return;
    }

    // session: lowest box first, then least recently seen; 20 cards
    var session = deck.slice().sort(function (a, b) {
      var sa = st[a.id] || {}, sb = st[b.id] || {};
      return (box(a) - box(b)) || ((sa.last || 0) - (sb.last || 0));
    }).slice(0, 20);
    var i = 0, flipped = false, inner = null;
    // Two faces stacked in one grid cell; flipping rotates them (0.1 s). A new card always starts face up, without animating.
    var cardEl = h('div', { class: 'flashcard', tabindex: '0', role: 'button', 'aria-label': 'Flashcard — press Space to flip' });
    var meta = h('div', { class: 'small muted flash-meta' });
    var again = h('button', { class: 'btn', type: 'button' }, '1 · Again');
    var good = h('button', { class: 'btn primary', type: 'button' }, '2 · Got it');
    var flip = h('button', { class: 'btn', type: 'button' }, 'Flip (Space)');
    function setFlipped(v) {
      flipped = v;
      if (inner) {
        inner.classList.toggle('is-flipped', v);
        inner.children[0].setAttribute('aria-hidden', v ? 'true' : 'false');
        inner.children[1].setAttribute('aria-hidden', v ? 'false' : 'true');
      }
      again.disabled = good.disabled = !flipped;
    }
    function toggle() { if (i < session.length) setFlipped(!flipped); }
    function render() {
      KIT.clear(cardEl);
      inner = null;
      if (i >= session.length) {
        cardEl.appendChild(h('div', { class: 'card flash-done' }, h('h2', null, '✓ Session done'), h('p', null, 'Reload the page for another round — weak cards come back first.')));
        again.disabled = good.disabled = flip.disabled = true;
        meta.textContent = '';
        return;
      }
      var c = session[i];
      meta.textContent = 'Card ' + (i + 1) + ' of ' + session.length + ' · ' + KIT.ui.deckLabel(c.topic) + ' · ' + c.kind + ' · box ' + box(c);
      function prompt() { return [c.frontText ? h('div', { class: 'flash-term' }, c.frontText) : null, c.frontHtml ? KIT.html(c.frontHtml) : null]; }
      var front = h('div', { class: 'flash-face card' }, prompt(), h('div', { class: 'small muted', style: { marginTop: '14px' } }, 'Recall the answer, then flip.'));
      var back = h('div', { class: 'flash-face flash-back card' }, h('div', { class: 'flash-asked' }, prompt()), h('hr'),
        c.backHtml ? KIT.html(c.backHtml) : h('div', { class: 'flash-term' }, c.backText),
        c.extraHtml ? h('div', { class: 'small muted' }, KIT.html(c.extraHtml)) : null,
        c.ref ? h('span', { class: 'chip ref' }, c.ref) : null);
      inner = h('div', { class: 'flash-inner' }, front, back);
      cardEl.appendChild(inner);
      setFlipped(false);
    }
    function grade(ok) {
      var c = session[i];
      var cur = st[c.id] || { box: 1, seen: 0 };
      cur.box = ok ? Math.min(5, (cur.box || 1) + 1) : 1;
      cur.seen = (cur.seen || 0) + 1;
      cur.last = Date.now();
      st[c.id] = cur;
      save(st);
      i++; render();
    }
    flip.addEventListener('click', toggle);
    cardEl.addEventListener('click', toggle);
    again.addEventListener('click', function () { grade(false); });
    good.addEventListener('click', function () { grade(true); });
    function onKey(ev) {
      if (!document.body.contains(cardEl)) { document.removeEventListener('keydown', onKey); return; }
      if (ev.target && /input|textarea|select/i.test(ev.target.tagName)) return;
      if (ev.key === ' ') { ev.preventDefault(); toggle(); }
      else if (ev.key === '1' && flipped) grade(false);
      else if (ev.key === '2' && flipped) grade(true);
    }
    document.addEventListener('keydown', onKey);
    main.appendChild(meta);
    main.appendChild(cardEl);
    main.appendChild(h('div', { class: 'btn-row' }, flip, again, good));
    render();
  });
})();
