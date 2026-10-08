/* Draw grid: click cells to draw a waveform (line codes, scrambling). Owner: Lead (Phase 2).
   KIT.ui.grid.create(gridSpec, {onChange}) → { el, value(), set(levels), clear(), mark(result), disable() }
   gridSpec = { bits, cellsPerBit: 1|2|0.5, levels: [allowed, top→bottom], levelSet?: [display rows], init?: {level}, answer, … } */
(function () {
  'use strict';
  var h = KIT.h, S = function (t, a) { return KIT.s(t, a); };

  function create(spec, opts) {
    opts = opts || {};
    var cpb = spec.cellsPerBit || 1;
    var bits = String(spec.bits || '');
    var rows = (spec.levelSet || spec.levels || [1, 0, -1]).slice();
    var allowed = spec.levels || rows;
    var n = Math.round(bits.length * cpb);
    var bitW = 40, cellW = bitW / cpb, rowGap = rows.length > 3 ? 22 : 30;
    var hasInit = spec.init && spec.init.level !== undefined && spec.init.level !== null;
    var left = 60, top = 26;             // fixed (room for the prior-level stub) so stacked grids share bit columns
    var W = left + n * cellW + 12, H = top + rowGap * (rows.length - 1) + 16;
    var vals = new Array(n).fill(null);
    var disabled = false;

    var svg = S('svg', { class: 'kit-svg kit-grid', viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'group',
      'aria-label': 'Drawing grid for bits ' + bits + '. Click a cell at the level you want.' });
    function y(v) { return top + rows.indexOf(v) * rowGap; }
    rows.forEach(function (lv) {
      svg.appendChild(S('line', { class: lv === 0 ? 'axis' : 'grid', x1: left, x2: left + n * cellW, y1: y(lv), y2: y(lv) }));
      var t = S('text', { class: 'lvl', x: left - 20, y: y(lv) + 4, 'text-anchor': 'end' });
      t.textContent = KIT.fmt.level(lv, Math.max.apply(null, rows.map(Math.abs)) <= 1);
      svg.appendChild(t);
    });
    var step = cpb >= 1 ? bitW : cellW, nb = cpb >= 1 ? bits.length : n;
    for (var b = 0; b <= nb; b++) svg.appendChild(S('line', { class: 'grid', x1: left + b * step, x2: left + b * step, y1: top - 8, y2: H - 6 }));
    // Dashed half-bit guides for two-cell codes (Manchester, differential Manchester, RZ).
    if (cpb > 1) for (var sc = 1; sc < n; sc++) { if (sc % cpb) svg.appendChild(S('line', { class: 'grid sub', x1: left + sc * cellW, x2: left + sc * cellW, y1: top - 2, y2: H - 12 })); }
    for (var c = 0; c < n; c++) {
      if (cpb >= 1 && c % cpb) continue;
      var lab = cpb >= 1 ? bits.charAt(c / cpb) : bits.substr(c / cpb, 1 / cpb);
      var tx = S('text', { class: 'bit', x: left + (cpb >= 1 ? (c / cpb + 0.5) * bitW : (c + 0.5) * cellW), y: top - 12, 'text-anchor': 'middle' });
      tx.textContent = lab;
      svg.appendChild(tx);
    }
    var bad = S('rect', { class: 'grid-bad', x: 0, y: top - 8, width: cellW, height: H - top + 2, visibility: 'hidden' });
    svg.appendChild(bad);
    if (hasInit) svg.appendChild(S('path', { class: 'trace stub', d: 'M' + (left - 14) + ' ' + y(spec.init.level) + ' H' + left }));
    var path = S('path', { class: 'trace user', d: '' });
    svg.appendChild(path);
    var dots = S('g', { class: 'grid-dots' });
    svg.appendChild(dots);

    function redraw() {
      var d = KIT.svg.wavePath(vals, { cellWidth: cellW, left: left, top: top, rowGap: rowGap, levelSet: rows, init: hasInit ? spec.init.level : null, stub: 0 });
      path.setAttribute('d', d);
      KIT.clear(dots);
      vals.forEach(function (v, i) {
        if (v === null) return;
        dots.appendChild(S('circle', { class: 'grid-dot', cx: left + (i + 0.5) * cellW, cy: y(v), r: 3 }));
      });
      if (opts.onChange) opts.onChange(vals.slice());
    }

    // one transparent hit column per cell; clicking sets the nearest allowed level
    for (var i = 0; i < n; i++) {
      (function (idx) {
        var hit = S('rect', { class: 'grid-hit', x: left + idx * cellW, y: top - 10, width: cellW, height: H - top + 4, fill: 'transparent', tabindex: '0',
          'aria-label': 'Cell ' + (idx + 1) + (cpb === 2 ? (idx % 2 ? ' (second half)' : ' (first half)') : '') });
        function setFromY(py) {
          var best = null, bd = Infinity;
          allowed.forEach(function (lv) { var dd = Math.abs(y(lv) - py); if (dd < bd) { bd = dd; best = lv; } });
          vals[idx] = best;
          bad.setAttribute('visibility', 'hidden');
          redraw();
        }
        hit.addEventListener('click', function (ev) {
          if (disabled) return;
          var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
          var ctm = svg.getScreenCTM();
          if (!ctm) return;
          setFromY(pt.matrixTransform(ctm.inverse()).y);
        });
        hit.addEventListener('keydown', function (ev) {
          if (disabled) return;
          var cur = vals[idx] === null ? null : allowed.indexOf(vals[idx]);
          if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
            ev.preventDefault();
            var ni = cur === null ? 0 : Math.max(0, Math.min(allowed.length - 1, cur + (ev.key === 'ArrowUp' ? -1 : 1)));
            vals[idx] = allowed[ni]; redraw();
          } else if (ev.key === 'Backspace' || ev.key === 'Delete') { vals[idx] = null; redraw(); }
        });
        svg.appendChild(hit);
      })(i);
    }

    var wrap = h('div', { class: 'grid-wrap' }, h('div', { class: 'grid-scroll' }, svg),
      h('div', { class: 'small muted' }, 'Click each cell at the level you want (or focus a cell and use ↑/↓). ' +
        (cpb === 2 ? 'Each bit has two half-bit cells. ' : cpb === 0.5 ? 'Each cell is one signal element for two bits. ' : '')));
    redraw();
    return {
      el: wrap,
      value: function () { return vals.slice(); },
      set: function (levels) { vals = levels.slice(0, n).concat(new Array(Math.max(0, n - levels.length)).fill(null)); redraw(); },
      clear: function () { vals = new Array(n).fill(null); bad.setAttribute('visibility', 'hidden'); redraw(); },
      mark: function (res) {
        if (res && !res.ok && res.firstWrongCell !== undefined) {
          bad.setAttribute('x', left + res.firstWrongCell * cellW);
          bad.setAttribute('visibility', 'visible');
        } else bad.setAttribute('visibility', 'hidden');
      },
      disable: function () { disabled = true; svg.classList.add('disabled'); }
    };
  }

  KIT.ui.grid = { create: create };
})();
