/* Sketch pad: draw with a mouse, pen or finger — for wave-drawing questions and for essays answered with a drawing.
   Owner: Lead.
   KIT.ui.sketch.create({ axes?, height?, label? })
     → { el, value() (strokes as [[{x,y}…]…] in pad units), isEmpty(), clear(), undo(), lock(on), showModel(model), hideModel(), onChange }
   KIT.ui.sketch.figure({ axes?, height? }, model?) → a static <svg>: blank axes for the paper, or the model drawn on them (keys).
   axes  = { x: [x0, x1], y: [y0, y1], yTicks?: [..], ySub?: [..] (dashed levels), yFormat?(v), xTicks?: [..], xFormat?(v), xLabel?, bits?: '1011' }
           with bits, every x unit is one bit cell: dashed boundaries and the bit written above it.
   model = { series: [{ kind: 'fn', fn(x), samples? } | { kind: 'step', data: [[x, y], …], until? } | { kind: 'points', data: [[x, y], …] }] }
   Pad, paper blank and key share one geometry, so the model lands exactly on the student's drawing. */
(function () {
  'use strict';
  var h = KIT.h;
  function S(tag, attrs) { return KIT.s(tag, attrs); }
  var W = 640;

  function geometry(o) {
    var ax = o.axes || null;
    var H = o.height || (ax ? 210 : 240);
    var m = ax ? { l: 56, r: 12, t: ax.bits ? 24 : 12, b: ax.xLabel ? 34 : 24 } : { l: 0, r: 0, t: 0, b: 0 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    return {
      W: W, H: H, m: m, pw: pw, ph: ph, ax: ax,
      sx: function (x) { return ax ? m.l + (x - ax.x[0]) / (ax.x[1] - ax.x[0]) * pw : x; },
      sy: function (y) { return ax ? m.t + (ax.y[1] - y) / (ax.y[1] - ax.y[0]) * ph : y; }
    };
  }

  function label(cls, x, y, s, anchor) {
    var t = S('text', { class: cls, x: x, y: y, 'text-anchor': anchor || 'middle' });
    t.textContent = String(s);
    return t;
  }

  function background(svg, G) {
    var ax = G.ax, m = G.m, i;
    if (!ax) {                                   // a blank page for essays: light dot grid
      var dots = S('g', { class: 'sk-dots' });
      for (var x = 16; x < G.W; x += 16) for (var y = 16; y < G.H; y += 16) dots.appendChild(S('circle', { cx: x, cy: y, r: 0.8 }));
      svg.appendChild(dots);
      return;
    }
    var x0 = G.sx(ax.x[0]), x1 = G.sx(ax.x[1]), y0 = m.t, y1 = m.t + G.ph;
    (ax.yTicks || [ax.y[0], 0, ax.y[1]]).forEach(function (v) {
      var yy = G.sy(v);
      svg.appendChild(S('line', { class: v === 0 ? 'axis' : 'grid', x1: x0, x2: x1, y1: yy, y2: yy }));
      svg.appendChild(label('lvl', m.l - 6, yy + 4, ax.yFormat ? ax.yFormat(v) : KIT.fmt.num(v, 3), 'end'));
    });
    (ax.ySub || []).forEach(function (v) {        // dashed in-between levels, e.g. quantization zone midpoints
      var yy = G.sy(v);
      svg.appendChild(S('line', { class: 'grid sub', x1: x0, x2: x1, y1: yy, y2: yy }));
      svg.appendChild(label('lvl', m.l - 6, yy + 4, ax.yFormat ? ax.yFormat(v) : KIT.fmt.num(v, 3), 'end'));
    });
    if (ax.bits) {
      var n = ax.bits.length;
      for (i = 0; i <= n; i++) {
        var bx = G.sx(ax.x[0] + i);
        svg.appendChild(S('line', { class: i === 0 || i === n ? 'grid' : 'grid sub', x1: bx, x2: bx, y1: y0 - 4, y2: y1 }));
      }
      for (i = 0; i < n; i++) svg.appendChild(label('bit', G.sx(ax.x[0] + i + 0.5), m.t - 8, ax.bits.charAt(i)));
    } else {
      (ax.xTicks || []).forEach(function (v) {
        var xx = G.sx(v);
        svg.appendChild(S('line', { class: 'grid sub', x1: xx, x2: xx, y1: y0, y2: y1 }));
        svg.appendChild(label('tick', xx, y1 + 14, ax.xFormat ? ax.xFormat(v) : KIT.fmt.num(v, 3)));
      });
    }
    svg.appendChild(S('line', { class: 'axis', x1: x0, x2: x0, y1: y0, y2: y1 }));
    if (ax.xLabel) svg.appendChild(label('axis-label', x1, G.H - 6, ax.xLabel, 'end'));
  }

  function drawModel(g, G, model, cls, dotCls) {
    var ax = G.ax;
    ((model && model.series) || []).forEach(function (s) {
      var d = '', k;
      if (s.kind === 'fn') {
        var n = s.samples || 480;
        for (k = 0; k <= n; k++) {
          var x = ax.x[0] + (ax.x[1] - ax.x[0]) * k / n, y = s.fn(x);
          if (!isFinite(y)) continue;
          d += (d ? ' L' : 'M') + G.sx(x).toFixed(1) + ' ' + G.sy(y).toFixed(1);
        }
      } else if (s.kind === 'step') {
        var pts = s.data, until = s.until !== undefined ? s.until : ax.x[1];
        for (k = 0; k < pts.length; k++) {
          var xe = k + 1 < pts.length ? pts[k + 1][0] : until;
          d += (k ? ' V' : 'M' + G.sx(pts[k][0]).toFixed(1) + ' ') + G.sy(pts[k][1]).toFixed(1) + ' H' + G.sx(xe).toFixed(1);
        }
      } else if (s.kind === 'points') {
        s.data.forEach(function (p) { g.appendChild(S('circle', { class: dotCls, cx: G.sx(p[0]), cy: G.sy(p[1]), r: 4 })); });
      }
      if (d) g.appendChild(S('path', { class: cls, d: d }));
    });
  }

  function pathD(pts) {
    var d = 'M' + pts[0].x + ' ' + pts[0].y;
    if (pts.length === 1) return d + ' l0.01 0';                    // a tap leaves a dot
    for (var i = 1; i < pts.length; i++) d += ' L' + pts[i].x + ' ' + pts[i].y;
    return d;
  }

  function create(o) {
    o = o || {};
    var G = geometry(o);
    var svg = S('svg', { class: 'kit-svg sketch-svg', viewBox: '0 0 ' + G.W + ' ' + G.H, width: G.W, height: G.H,
      role: 'img', 'aria-label': o.label || (G.ax ? 'Drawing area with axes' : 'Drawing area') });
    background(svg, G);
    var modelLayer = S('g', { class: 'sk-model' }), inkLayer = S('g', { class: 'sk-ink' });
    svg.appendChild(modelLayer);
    svg.appendChild(inkLayer);
    var strokes = [], cur = null, mode = 'pen', erasing = false, locked = false;

    var pen = h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'true' }, '✏ Pen');
    var eraser = h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'false' }, '⌫ Eraser');
    var undoBtn = h('button', { class: 'btn small', type: 'button' }, '↶ Undo');
    var clearBtn = h('button', { class: 'btn small ghost', type: 'button' }, 'Clear');
    var tools = h('div', { class: 'sketch-tools' }, pen, eraser, undoBtn, clearBtn,
      h('span', { class: 'small muted' }, G.ax ? 'Draw on the axes.' : 'Draw here (optional) — sketches, waveforms, diagrams.'));
    var el = h('div', { class: 'sketch' }, svg, tools);

    function changed() { if (api.onChange) api.onChange(); }
    function setMode(m) { mode = m; pen.setAttribute('aria-pressed', String(m === 'pen')); eraser.setAttribute('aria-pressed', String(m === 'erase')); }
    function toLocal(ev) {
      var r = svg.getBoundingClientRect();
      if (!r.width || !r.height) return { x: 0, y: 0 };
      return { x: Math.round((ev.clientX - r.left) / r.width * G.W * 10) / 10, y: Math.round((ev.clientY - r.top) / r.height * G.H * 10) / 10 };
    }
    function remove(s) { if (s.el.parentNode) s.el.parentNode.removeChild(s.el); }
    function eraseAt(p) {
      var keep = [];
      strokes.forEach(function (s) {
        var hit = s.pts.some(function (q) { return Math.abs(q.x - p.x) < 10 && Math.abs(q.y - p.y) < 10; });
        if (hit) remove(s); else keep.push(s);
      });
      if (keep.length !== strokes.length) { strokes = keep; changed(); }
    }

    svg.addEventListener('pointerdown', function (ev) {
      if (locked || (ev.button !== undefined && ev.button > 0)) return;
      ev.preventDefault();
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* synthetic events have no capture */ }
      var p = toLocal(ev);
      if (mode === 'erase') { erasing = true; eraseAt(p); return; }
      cur = { pts: [p], el: S('path', { class: 'ink', d: pathD([p]) }) };
      inkLayer.appendChild(cur.el);
    });
    svg.addEventListener('pointermove', function (ev) {
      if (erasing) { eraseAt(toLocal(ev)); return; }
      if (!cur) return;
      var p = toLocal(ev), last = cur.pts[cur.pts.length - 1];
      if (Math.abs(p.x - last.x) + Math.abs(p.y - last.y) < 1.2) return;
      cur.pts.push(p);
      cur.el.setAttribute('d', pathD(cur.pts));
    });
    function end() {
      if (cur) { strokes.push(cur); cur = null; changed(); }
      erasing = false;
    }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('pointerleave', function () { if (erasing) erasing = false; });

    pen.addEventListener('click', function () { setMode('pen'); });
    eraser.addEventListener('click', function () { setMode('erase'); });
    undoBtn.addEventListener('click', function () { api.undo(); });
    clearBtn.addEventListener('click', function () { api.clear(); });

    var api = {
      el: el,
      value: function () { return strokes.map(function (s) { return s.pts.slice(); }); },
      isEmpty: function () { return !strokes.length; },
      clear: function () { strokes.forEach(remove); strokes = []; changed(); },
      undo: function () { var s = strokes.pop(); if (s) { remove(s); changed(); } },
      lock: function (on) {
        locked = !!on;
        el.classList.toggle('locked', locked);
        [pen, eraser, undoBtn, clearBtn].forEach(function (b) { b.disabled = locked; });
      },
      showModel: function (model) { KIT.clear(modelLayer); if (G.ax) drawModel(modelLayer, G, model, 'sk-model-trace', 'sk-model-dot'); },
      hideModel: function () { KIT.clear(modelLayer); },
      onChange: null
    };
    return api;
  }

  /** Static figure: blank axes (paper) or the model on them (keys, worked solutions). */
  function figure(spec, model) {
    spec = spec || {};
    var G = geometry(spec);
    var svg = S('svg', { class: 'kit-svg sketch-fig', viewBox: '0 0 ' + G.W + ' ' + G.H, width: G.W, height: G.H,
      role: 'img', 'aria-label': model ? 'Model drawing' : 'Blank axes to draw on' });
    background(svg, G);
    if (model && G.ax) { var g = S('g', { class: 'sk-key' }); drawModel(g, G, model, 'trace sk-key-trace', 'sk-key-dot'); svg.appendChild(g); }
    return svg;
  }

  KIT.ui.sketch = { create: create, figure: figure };
})();
