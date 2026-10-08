/* Worked-example animation player. Owner: Lead.
   Frames come from KIT.anim (js/anim/<topic>.js): [{ caption: 'html', render: function () { return Element; }, step?: k }].
   KIT.ui.anim.player(frames, { title }) → { el, show(i), toStep(k), finish(), count }
   KIT.ui.anim.forProblem(problem)       → a player for a built problem (KIT.gen.build sets problem.gen / problem.params), or null.
   Interactive: starts on frame 1; ◀ ▶ step, Play advances every 1.6 s and stops at the end, ↺ restarts.
   Static (print, selftest, ?static=1): the last frame and its caption only, no controls, no timers. */
(function () {
  'use strict';
  var h = KIT.h;
  var DELAY = 1600;

  function player(frames, o) {
    o = o || {};
    var n = frames.length, cur = -1, timer = null, fixed = !!KIT.env.static;
    var stage = h('div', { class: 'anim-stage' });
    var cap = h('div', { class: 'anim-caption', 'aria-live': 'polite' });
    var count = h('span', { class: 'anim-count' });
    var fill = h('span', { class: 'anim-fill' });
    var restart = h('button', { class: 'btn ghost small', type: 'button', title: 'Back to the start', 'aria-label': 'Restart animation' }, '↺');
    var prev = h('button', { class: 'btn ghost small', type: 'button', 'aria-label': 'Previous frame' }, '◀');
    var play = h('button', { class: 'btn small', type: 'button' }, '▶ Play');
    var next = h('button', { class: 'btn ghost small', type: 'button', 'aria-label': 'Next frame' }, '▶');
    var controls = h('div', { class: 'anim-controls no-print' }, restart, prev, play, next, h('span', { class: 'anim-bar', 'aria-hidden': 'true' }, fill), count);
    var el = h('div', { class: 'anim no-print' + (fixed ? ' static' : ''), role: 'group', 'aria-label': o.title || 'Animated solution' },
      h('div', { class: 'anim-label' }, fixed ? '▶ Animation — final frame' : '▶ Animation'),
      stage, cap, fixed ? null : controls);

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      play.textContent = '▶ Play';
    }
    function show(i) {
      i = Math.max(0, Math.min(n - 1, i));
      var forward = i === cur + 1;
      cur = i;
      var f = frames[i], node = null;
      try { node = f.render(); } catch (e) {
        KIT.report(e, 'anim' + (o.title ? ':' + o.title : ''));
        node = h('div', { class: 'fb bad' }, 'This frame failed to draw: ' + e.message);
      }
      KIT.clear(stage);
      if (node) stage.appendChild(node);
      // Only a step forward animates the new piece; jumping or stepping back shows the frame as it is.
      stage.classList.toggle('no-anim', !forward || fixed);
      KIT.clear(cap);
      cap.appendChild(KIT.html(f.caption || ''));
      count.textContent = (i + 1) + ' / ' + n;
      fill.style.width = Math.round((i + 1) / n * 100) + '%';
      prev.disabled = i === 0;
      next.disabled = i === n - 1;
      if (i === n - 1) stop();
    }
    function start() {
      if (cur >= n - 1) show(0);
      play.textContent = '⏸ Pause';
      timer = setInterval(function () {
        if (!el.isConnected) { stop(); return; }    // the page changed: stop quietly
        show(cur + 1);
      }, DELAY);
    }
    play.addEventListener('click', function () { if (timer) stop(); else start(); });
    prev.addEventListener('click', function () { stop(); show(cur - 1); });
    next.addEventListener('click', function () { stop(); show(cur + 1); });
    restart.addEventListener('click', function () { stop(); show(0); });

    show(fixed ? n - 1 : 0);
    return {
      el: el, count: n,
      show: function (i) { stop(); show(i); },
      /** Jump to the last frame that illustrates solution step k (or an earlier one). */
      toStep: function (k) {
        var best = -1;
        frames.forEach(function (f, i) { if (f.step !== undefined && f.step <= k) best = i; });
        if (best >= 0 && best !== cur) { stop(); show(best); }
      },
      finish: function () { stop(); show(n - 1); }
    };
  }

  function forProblem(p) {
    if (!p || !p.gen || !KIT.anim.has(p.gen)) return null;
    var frames;
    try { frames = KIT.anim.frames(p.gen, p.params, p); } catch (e) { KIT.report(e, 'anim:' + p.gen); return null; }
    return frames && frames.length ? player(frames, { title: 'Animated solution' }) : null;
  }

  /** The quantity slot (1–6) of an element with class v1…v6, or of its nearest such ancestor inside root. */
  function slotOf(el, root) {
    while (el && el !== root && el.nodeType === 1) {
      for (var i = 1; i <= 6; i++) if (el.classList.contains('v' + i)) return i;
      el = el.parentNode;
    }
    return 0;
  }
  /** Hover to connect: pointing at (or focusing) a colored quantity lights up every occurrence of it inside root —
      prompt, formula, steps and animation alike. One delegated listener per root; frames that re-render need nothing extra. */
  function connect(root) {
    var on = 0;
    function set(k) {
      if (k === on) return;
      var i, list;
      if (on) { list = root.querySelectorAll('.v' + on); for (i = 0; i < list.length; i++) list[i].classList.remove('v-on'); }
      on = k;
      if (k) { list = root.querySelectorAll('.v' + k); for (i = 0; i < list.length; i++) list[i].classList.add('v-on'); }
    }
    root.addEventListener('mouseover', function (e) { set(slotOf(e.target, root)); });
    root.addEventListener('mouseleave', function () { set(0); });
    root.addEventListener('focusin', function (e) { set(slotOf(e.target, root)); });
    root.addEventListener('focusout', function () { set(0); });
    return root;
  }
  /** "Track: N bit rate · B bandwidth · L levels" — colors: [{ role, tex, name }] from a problem's build(). */
  function colorKey(colors) {
    if (!colors || !colors.length) return null;
    var row = h('div', { class: 'color-key' }, h('span', null, 'Track:'));
    colors.forEach(function (c) {
      var slot = KIT.math.ROLES[c.role] || 0;
      row.appendChild(h('button', { type: 'button', class: 'ck btn ghost small v' + slot, title: 'Highlight every ' + c.name },
        KIT.html('$\\c{' + c.role + '}{' + c.tex + '}$'), ' ' + c.name));
    });
    return row;
  }

  KIT.ui.anim = { player: player, forProblem: forProblem, connect: connect, colorKey: colorKey };
})();
