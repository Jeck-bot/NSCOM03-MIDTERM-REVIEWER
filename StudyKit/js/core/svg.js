/* Shared SVG drawing helpers.
   Pure helpers (scale, niceTicks, wavePath) are Node-testable; wave/plot/timeline/legend need a DOM.
   Style follows the dataviz spec: 2px traces, solid hairline grid, text in text tokens, series colors
   only on marks, 2px surface gap between touching spans, >=8px markers with a 2px surface ring. */
(function () {
  'use strict';
  var uid = 0;

  /* ---------------- pure helpers ---------------- */
  function scale(d0, d1, r0, r1) {
    var span = (d1 - d0) || 1, k = (r1 - r0) / span;
    var f = function (v) { return r0 + (v - d0) * k; };
    f.invert = function (px) { return d0 + (px - r0) / k; };
    return f;
  }

  function niceStep(raw) {
    var p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var m = raw / p;
    var nice = m <= 1 + 1e-9 ? 1 : m <= 2 + 1e-9 ? 2 : m <= 2.5 + 1e-9 ? 2.5 : m <= 5 + 1e-9 ? 5 : 10;
    return nice * p;
  }
  function niceTicks(min, max, count) {
    if (!(max > min)) return [min];
    var step = niceStep((max - min) / (count || 5));
    var start = Math.ceil(min / step - 1e-9) * step;
    var out = [];
    for (var i = 0; i < 1000; i++) {
      var v = Number((start + i * step).toPrecision(12));
      if (v > max + step * 1e-9) break;
      out.push(v === 0 ? 0 : v);
    }
    return out;
  }

  /** Path for a step waveform. levels: one value per cell (null = gap).
      geo: {cellWidth, left, top, rowGap, levelSet (top→bottom), init (optional prior level), stub}. */
  function wavePath(levels, geo) {
    var set = geo.levelSet, cw = geo.cellWidth, x = geo.left || 0, top = geo.top || 0, gap = geo.rowGap;
    function y(v) {
      var i = set.indexOf(v);
      if (i < 0) throw new Error('wavePath: level ' + v + ' not in levelSet ' + JSON.stringify(set));
      return top + i * gap;
    }
    var d = '', prev = null;
    if (geo.init !== undefined && geo.init !== null && levels.length) {
      d = 'M' + (x - (geo.stub === undefined ? 12 : geo.stub)) + ' ' + y(geo.init) + ' H' + x;
      prev = geo.init;
    }
    for (var i = 0; i < levels.length; i++) {
      var v = levels[i];
      if (v === null || v === undefined) { prev = null; x += cw; continue; }
      if (prev === null) d += (d ? ' ' : '') + 'M' + x + ' ' + y(v);
      else if (prev !== v) d += ' V' + y(v);
      x += cw;
      d += ' H' + x;
      prev = v;
    }
    return d;
  }

  /* ---------------- DOM builders ---------------- */
  function S(tag, attrs) {
    var el = KIT.s(tag, attrs);
    for (var i = 2; i < arguments.length; i++) {
      var k = arguments[i];
      if (k === null || k === undefined || k === false) continue;
      el.appendChild(typeof k === 'string' || typeof k === 'number' ? document.createTextNode(String(k)) : k);
    }
    return el;
  }
  function root(cls, w, h, label) {
    return S('svg', {
      class: 'kit-svg ' + cls, viewBox: '0 0 ' + w + ' ' + h, width: w, height: h,
      role: 'img', 'aria-label': label || cls, preserveAspectRatio: 'xMinYMin meet'
    });
  }
  function seriesVar(n) { return 'var(--series-' + (n || 1) + ')'; }
  // Series slots whose fill is dark enough for white text (light mode): blue, green, violet, red.
  var DARK_FILL = { 1: true, 6: true, 7: true, 8: true };

  function inferLevelSet(levels) {
    var vals = {};
    levels.forEach(function (v) { if (v !== null && v !== undefined) vals[v] = true; });
    var set = Object.keys(vals).map(Number);
    // Always show the 0 V time axis (unipolar: below the marks; polar: between +V and −V).
    if (set.indexOf(0) < 0) set.push(0);
    return set.sort(function (a, b) { return b - a; });
  }

  /** Step waveform (line codes, scrambling, NRZ inputs).
      o: {cellsPerBit (1|2|0.5), bits, levelSet, levelLabels, title, init, marks:[{bit, kind:'inv'|'noinv'}],
          blank (grid only, for paper answers), bitWidth, rowGap, color (series slot), highlight:[{from,to}] (bit ranges)} */
  function wave(levels, o) {
    o = o || {};
    var cpb = o.cellsPerBit || 1;
    var bits = String(o.bits || '');
    var set = o.levelSet || inferLevelSet(levels);
    var bitW = o.bitWidth || 34;
    var cellW = bitW / cpb;                    // cpb 0.5 → one cell spans two bits
    var nCells = levels.length;
    var rowGap = o.rowGap || (set.length > 3 ? 16 : 22);
    var hasInit = o.init !== undefined && o.init !== null;
    // titleWidth + stubSpace let stacked waveforms share the same bit columns.
    var titleW = o.titleWidth !== undefined ? o.titleWidth : (o.title ? Math.min(130, 10 + String(o.title).length * 6.4) : 0);
    var lblW = 30;
    var left = titleW + lblW + (hasInit || o.stubSpace ? 16 : 6);
    var topPad = bits ? 22 : 10;
    var plotH = rowGap * (set.length - 1);
    var plotW = nCells * cellW;
    var width = Math.ceil(left + plotW + 10);
    var height = Math.ceil(topPad + plotH + 12);
    var svg = root('kit-wave' + (o.blank ? ' blank' : ''), width, height,
      (o.title ? o.title + ': ' : '') + (bits ? 'bits ' + bits : 'waveform'));

    (o.highlight || []).forEach(function (hl) {
      svg.appendChild(S('rect', { class: 'hl', x: left + hl.from * bitW, y: topPad - 8, width: (hl.to - hl.from) * bitW, height: plotH + 16, rx: 3 }));
    });
    set.forEach(function (lv, i) {
      var y = topPad + i * rowGap;
      svg.appendChild(S('line', { class: lv === 0 ? 'axis' : 'grid', x1: left, x2: left + plotW, y1: y, y2: y }));
      var lab = o.levelLabels && o.levelLabels[lv] !== undefined ? o.levelLabels[lv]
        : KIT.fmt.level(lv, Math.max.apply(null, set.map(Math.abs)) <= 1);
      svg.appendChild(S('text', { class: 'lvl', x: titleW + lblW - 4, y: y + 4, 'text-anchor': 'end' }, lab));
    });
    // Boundaries at every bit (NRZ, Manchester, …) or at every signal element when one cell spans several bits (2B1Q).
    var step = cpb >= 1 ? bitW : cellW;
    var nBounds = cpb >= 1 ? (bits.length || Math.round(nCells / cpb)) : nCells;
    for (var b = 0; b <= nBounds; b++) {
      var bx = left + b * step;
      svg.appendChild(S('line', { class: 'grid', x1: bx, x2: bx, y1: topPad - 6, y2: topPad + plotH + 6 }));
    }
    // Blank (draw-by-hand) grids: dashed half-bit guides for two-cell codes, and the stated level before the first bit.
    if (o.blank) {
      svg.setAttribute('data-cpb', String(cpb));
      if (cpb > 1) {
        for (var sc = 1; sc < nCells; sc++) {
          if (sc % cpb === 0) continue;
          svg.appendChild(S('line', { class: 'grid sub', x1: left + sc * cellW, x2: left + sc * cellW, y1: topPad - 2, y2: topPad + plotH + 2 }));
        }
      }
      if (hasInit && set.indexOf(o.init) >= 0) {
        svg.setAttribute('data-init', String(o.init));
        svg.appendChild(S('path', { class: 'trace stub-cue', d: 'M' + (left - 14) + ' ' + (topPad + set.indexOf(o.init) * rowGap) + ' H' + left }));
      }
    }
    if (bits) {
      if (cpb >= 1) {
        for (var j = 0; j < bits.length; j++) {
          svg.appendChild(S('text', { class: 'bit', x: left + (j + 0.5) * bitW, y: topPad - 10, 'text-anchor': 'middle' }, bits.charAt(j)));
        }
      } else {
        for (var c = 0; c < nCells; c++) {
          svg.appendChild(S('text', { class: 'bit', x: left + (c + 0.5) * cellW, y: topPad - 10, 'text-anchor': 'middle' }, bits.substr(c / cpb, 1 / cpb)));
        }
      }
    }
    if (o.title) svg.appendChild(S('text', { class: 'title', x: 2, y: topPad + plotH / 2 + 4 }, String(o.title)));
    if (!o.blank && nCells) {
      // reveal: draw only the first n cells (animations draw the signal bit by bit); the grid keeps its full width.
      var drawn = o.reveal === undefined ? levels : levels.map(function (v, i) { return i < o.reveal ? v : null; });
      svg.appendChild(S('path', {
        class: 'trace', style: 'stroke:' + seriesVar(o.color || 1),
        d: wavePath(drawn, { cellWidth: cellW, left: left, top: topPad, rowGap: rowGap, levelSet: set, init: hasInit ? o.init : null, stub: 12 })
      }));
      // focus: cells [from, to) traced again on top, including the transition into them (the bit being explained).
      if (o.focus && o.focus.to > o.focus.from) {
        var f0 = o.focus.from, before = f0 > 0 ? levels[f0 - 1] : (hasInit ? o.init : null);
        svg.appendChild(S('path', {
          class: 'trace focus anim-new', pathLength: 1,
          d: wavePath(levels.slice(f0, o.focus.to), { cellWidth: cellW, left: left + f0 * cellW, top: topPad, rowGap: rowGap, levelSet: set, init: before, stub: 0 })
        }));
      }
    }
    (o.marks || []).forEach(function (mk) {
      svg.appendChild(S('circle', { class: 'mark ' + (mk.kind || 'inv'), cx: left + mk.bit * bitW, cy: topPad + plotH + 6, r: 3.5 }));
    });
    return svg;
  }

  function defaultFmt(v) { return KIT.fmt.num(v, 3); }

  function sampleFn(fn, x0, x1, n) {
    var pts = [];
    for (var i = 0; i <= n; i++) { var x = x0 + (x1 - x0) * i / n; var y = fn(x); if (isFinite(y)) pts.push([x, y]); }
    return pts;
  }

  /** 2-D plot. o: {width,height,margin,x:[a,b],y:[a,b],xTicks,yTicks,xFormat,yFormat,xLabel,yLabel,title,equal,
        series:[{kind:'line'|'step'|'points'|'stems'|'area', data:[[x,y]...] | fn, samples, color, label, labels:[...], dashed}],
        bands:[{x0,x1,label,color}], hlines:[{at,label}], vlines:[{at,label}], hover (default on unless static)} */
  function plot(o) {
    o = o || {};
    var W = o.width || 560, H = o.height || 240;
    var m = { l: 48, r: 14, t: 16, b: 34 };
    if (o.margin) Object.keys(o.margin).forEach(function (k) { m[k] = o.margin[k]; });
    var xr = o.x || [0, 1], yr = o.y || [0, 1];
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    if (o.equal) {
      var ux = pw / (xr[1] - xr[0]), uy = ph / (yr[1] - yr[0]), u = Math.min(ux, uy);
      pw = u * (xr[1] - xr[0]); ph = u * (yr[1] - yr[0]); W = pw + m.l + m.r; H = ph + m.t + m.b;
    }
    var sx = scale(xr[0], xr[1], m.l, m.l + pw), sy = scale(yr[0], yr[1], m.t + ph, m.t);
    var svg = root('kit-plot', Math.ceil(W), Math.ceil(H), o.title || 'plot');
    var xf = o.xFormat || defaultFmt, yf = o.yFormat || defaultFmt;
    var xt = Array.isArray(o.xTicks) ? o.xTicks : niceTicks(xr[0], xr[1], o.xTicks || 6);
    var yt = Array.isArray(o.yTicks) ? o.yTicks : niceTicks(yr[0], yr[1], o.yTicks || 4);

    (o.bands || []).forEach(function (b) {
      var x0 = sx(b.x0), x1 = sx(b.x1);
      svg.appendChild(S('rect', { class: 'band', x: x0 + 1, y: m.t, width: Math.max(1, x1 - x0 - 2), height: ph, style: 'fill:' + seriesVar(b.color || 1) }));
      if (b.label) svg.appendChild(S('text', { class: 'band-label', x: (x0 + x1) / 2, y: m.t + 12, 'text-anchor': 'middle' }, b.label));
    });
    yt.forEach(function (v) {
      var y = sy(v);
      svg.appendChild(S('line', { class: v === 0 ? 'axis' : 'grid', x1: m.l, x2: m.l + pw, y1: y, y2: y }));
      svg.appendChild(S('text', { class: 'tick', x: m.l - 6, y: y + 4, 'text-anchor': 'end' }, yf(v)));
    });
    xt.forEach(function (v) {
      var x = sx(v);
      if (o.xGrid) svg.appendChild(S('line', { class: v === 0 ? 'axis' : 'grid', x1: x, x2: x, y1: m.t, y2: m.t + ph }));
      svg.appendChild(S('text', { class: 'tick', x: x, y: m.t + ph + 16, 'text-anchor': 'middle' }, xf(v)));
    });
    var baseY = sy(yr[0] <= 0 && yr[1] >= 0 ? 0 : yr[0]);
    svg.appendChild(S('line', { class: 'axis', x1: m.l, x2: m.l + pw, y1: baseY, y2: baseY }));
    if (o.equal || o.yAxisAtZero) {
      var zx = sx(xr[0] <= 0 && xr[1] >= 0 ? 0 : xr[0]);
      svg.appendChild(S('line', { class: 'axis', x1: zx, x2: zx, y1: m.t, y2: m.t + ph }));
    }
    (o.hlines || []).forEach(function (h) {
      svg.appendChild(S('line', { class: 'ref', x1: m.l, x2: m.l + pw, y1: sy(h.at), y2: sy(h.at) }));
      if (h.label) svg.appendChild(S('text', { class: 'ref-label', x: m.l + pw - 2, y: sy(h.at) - 4, 'text-anchor': 'end' }, h.label));
    });
    (o.vlines || []).forEach(function (v) {
      svg.appendChild(S('line', { class: 'ref', x1: sx(v.at), x2: sx(v.at), y1: m.t, y2: m.t + ph }));
      if (v.label) svg.appendChild(S('text', { class: 'ref-label', x: sx(v.at) + 4, y: m.t + 11 }, v.label));
    });

    var lineSeries = [];
    (o.series || []).forEach(function (s, idx) {
      var color = seriesVar(s.color || idx + 1);
      var kind = s.kind || 'line';
      var pts = s.data || (s.fn ? sampleFn(s.fn, xr[0], xr[1], s.samples || 400) : []);
      if (kind === 'line' || kind === 'area') {
        if (!pts.length) return;
        var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + sx(p[0]).toFixed(2) + ' ' + sy(p[1]).toFixed(2); }).join(' ');
        if (kind === 'area') {
          var y0 = sy(yr[0] <= 0 && yr[1] >= 0 ? 0 : yr[0]);
          svg.appendChild(S('path', { class: 'area', style: 'fill:' + color, d: d + ' L' + sx(pts[pts.length - 1][0]).toFixed(2) + ' ' + y0 + ' L' + sx(pts[0][0]).toFixed(2) + ' ' + y0 + ' Z' }));
        }
        svg.appendChild(S('path', { class: 'trace' + (s.dashed ? ' dashed' : ''), style: 'stroke:' + color, d: d }));
        lineSeries.push({ s: s, pts: pts, color: color });
      } else if (kind === 'step') {
        var ds = '';
        pts.forEach(function (p, i) {
          var x = sx(p[0]).toFixed(2), y = sy(p[1]).toFixed(2);
          ds += i === 0 ? 'M' + x + ' ' + y : ' H' + x + ' V' + y;
        });
        if (s.until !== undefined && pts.length) ds += ' H' + sx(s.until).toFixed(2);
        svg.appendChild(S('path', { class: 'trace', style: 'stroke:' + color, d: ds }));
      } else if (kind === 'stems' || kind === 'points') {
        pts.forEach(function (p, i) {
          var x = sx(p[0]), y = sy(p[1]);
          if (kind === 'stems') svg.appendChild(S('line', { class: 'stem', style: 'stroke:' + color, x1: x, x2: x, y1: baseY, y2: y }));
          var c = S('circle', { class: 'dot', style: 'fill:' + color, cx: x, cy: y, r: s.r || 4 });
          if (s.labels && s.labels[i] !== undefined) c.appendChild(S('title', null, String(s.labels[i])));
          svg.appendChild(c);
          if (s.labels && s.labels[i] !== undefined && s.showLabels !== false) {
            svg.appendChild(S('text', { class: 'pt-label', x: x + (s.labelDx || 7), y: y + (s.labelDy || -7) }, String(s.labels[i])));
          }
        });
      }
    });
    if (o.xLabel) svg.appendChild(S('text', { class: 'axis-label', x: m.l + pw / 2, y: H - 4, 'text-anchor': 'middle' }, o.xLabel));
    if (o.yLabel) svg.appendChild(S('text', { class: 'axis-label', x: 12, y: m.t + ph / 2, 'text-anchor': 'middle', transform: 'rotate(-90 12 ' + (m.t + ph / 2) + ')' }, o.yLabel));

    var labeled = (o.series || []).filter(function (s) { return s.label; });
    if (labeled.length >= 2 && o.legend !== false) {
      var lx = m.l + 4;
      (o.series || []).forEach(function (s, idx) {
        if (!s.label) return;
        var color = seriesVar(s.color || idx + 1);
        var g = S('g', { class: 'legend-item' });
        var isLine = !s.kind || s.kind === 'line' || s.kind === 'step' || s.kind === 'area';
        g.appendChild(isLine ? S('line', { class: 'key', x1: lx, x2: lx + 16, y1: m.t - 6, y2: m.t - 6, style: 'stroke:' + color })
          : S('circle', { cx: lx + 6, cy: m.t - 6, r: 4, style: 'fill:' + color }));
        g.appendChild(S('text', { class: 'legend', x: lx + 21, y: m.t - 2 }, s.label));
        svg.appendChild(g);
        lx += 30 + s.label.length * 6.2;
      });
    }

    if (!KIT.env.static && o.hover !== false && lineSeries.length) addCrosshair(svg, lineSeries, sx, sy, m, pw, ph, xf, o.hoverFormat);
    return svg;
  }

  function addCrosshair(svg, series, sx, sy, m, pw, ph, xf, vf) {
    var vline = S('line', { class: 'crosshair', x1: 0, x2: 0, y1: m.t, y2: m.t + ph, visibility: 'hidden' });
    var tip = S('g', { class: 'tip', visibility: 'hidden' });
    var bg = S('rect', { class: 'tip-bg', rx: 4 });
    tip.appendChild(bg);
    var lines = [S('text', { class: 'tip-x', x: 8, y: 16 })];
    series.forEach(function (s, i) { lines.push(S('text', { class: 'tip-v', x: 8, y: 32 + i * 15 })); });
    lines.forEach(function (t) { tip.appendChild(t); });
    var hit = S('rect', { class: 'hit', x: m.l, y: m.t, width: pw, height: ph, fill: 'transparent' });
    svg.appendChild(vline); svg.appendChild(tip); svg.appendChild(hit);
    function nearestY(pts, x) {
      var best = pts[0], bd = Infinity;
      for (var i = 0; i < pts.length; i++) { var d = Math.abs(pts[i][0] - x); if (d < bd) { bd = d; best = pts[i]; } }
      return best;
    }
    function move(ev) {
      var pt = svg.createSVGPoint ? svg.createSVGPoint() : null;
      var px;
      if (pt && svg.getScreenCTM && svg.getScreenCTM()) { pt.x = ev.clientX; pt.y = ev.clientY; px = pt.matrixTransform(svg.getScreenCTM().inverse()).x; }
      else return;
      var x = sx.invert(px);
      vline.setAttribute('x1', px); vline.setAttribute('x2', px); vline.setAttribute('visibility', 'visible');
      lines[0].textContent = 'x = ' + xf(x);
      var wmax = lines[0].textContent.length;
      series.forEach(function (s, i) {
        var p = nearestY(s.pts, x);
        lines[i + 1].textContent = (vf ? vf(p[1]) : KIT.fmt.num(p[1], 3)) + (s.s.label ? '  ' + s.s.label : '');
        wmax = Math.max(wmax, lines[i + 1].textContent.length);
      });
      var tw = 16 + wmax * 6.3, th = 22 + series.length * 15;
      var tx = px + 12 + tw > m.l + pw ? px - 12 - tw : px + 12;
      tip.setAttribute('transform', 'translate(' + tx + ',' + (m.t + 4) + ')');
      bg.setAttribute('width', tw); bg.setAttribute('height', th);
      tip.setAttribute('visibility', 'visible');
    }
    hit.addEventListener('pointermove', move);
    hit.addEventListener('pointerleave', function () { vline.setAttribute('visibility', 'hidden'); tip.setAttribute('visibility', 'hidden'); });
  }

  /** Protocol/time timeline. o: {t:[t0,t1], width, laneHeight, labelWidth, ticks (array|count|false), tFormat,
        lanes:[{label, spans:[{t0,t1,label,color (series slot) | kind:'collision'|'nav'|'busy'}], marks:[{t,label}]}],
        arrows:[{from:{lane,t}, to:{lane,t}, label}]} */
  function timeline(o) {
    o = o || {};
    var lanes = o.lanes || [];
    var W = o.width || 640, laneH = o.laneHeight || 30, labelW = o.labelWidth || 120;
    var axisH = o.ticks === false ? 8 : 28;
    var H = 12 + lanes.length * laneH + axisH;
    var t0 = o.t[0], t1 = o.t[1];
    var sx = scale(t0, t1, labelW, W - 12);
    var svg = root('kit-timeline', W, H, o.title || 'timeline');
    var mid = 'kit-arrow-' + (++uid);
    var defs = S('defs', null, S('marker', { id: mid, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
      S('path', { class: 'arrowhead', d: 'M0 0 L10 5 L0 10 z' })));
    svg.appendChild(defs);
    function laneTop(i) { return 12 + i * laneH; }
    lanes.forEach(function (ln, i) {
      var y = laneTop(i);
      svg.appendChild(S('text', { class: 'lane-label', x: labelW - 8, y: y + laneH / 2 + 2, 'text-anchor': 'end' }, ln.label || ''));
      svg.appendChild(S('line', { class: 'grid', x1: labelW, x2: W - 12, y1: y + laneH - 5, y2: y + laneH - 5 }));
      (ln.spans || []).forEach(function (sp) {
        var x0 = sx(sp.t0) + 1, x1 = sx(sp.t1) - 1;
        var w = Math.max(1.5, x1 - x0);
        var cls = 'span' + (sp.kind ? ' k-' + sp.kind : '');
        var style = sp.kind ? '' : 'fill:' + seriesVar(sp.color || 1);
        var r = S('rect', { class: cls, x: x0, y: y + 4, width: w, height: laneH - 12, rx: 3, style: style });
        r.appendChild(S('title', null, (sp.label ? sp.label + ': ' : '') + (o.tFormat ? o.tFormat(sp.t0) + ' – ' + o.tFormat(sp.t1) : sp.t0 + ' – ' + sp.t1)));
        svg.appendChild(r);
        if (sp.label && w >= String(sp.label).length * 6.4 + 8) {
          var dark = !sp.kind && DARK_FILL[sp.color || 1];
          svg.appendChild(S('text', { class: 'span-label' + (dark ? ' on-dark' : '') + (sp.kind ? ' on-' + sp.kind : ''), x: x0 + w / 2, y: y + laneH / 2 + 2, 'text-anchor': 'middle' }, String(sp.label)));
        }
      });
      (ln.marks || []).forEach(function (mk) {
        var x = sx(mk.t);
        svg.appendChild(S('line', { class: 'mark-line', x1: x, x2: x, y1: y + 2, y2: y + laneH - 5 }));
        if (mk.label) svg.appendChild(S('text', { class: 'mark-label', x: x + 3, y: y + 9 }, mk.label));
      });
    });
    (o.arrows || []).forEach(function (a) {
      var fy = laneTop(a.from.lane) + laneH / 2 - 2, ty = laneTop(a.to.lane) + laneH / 2 - 2;
      var x0 = sx(a.from.t), x1 = sx(a.to.t);
      svg.appendChild(S('line', { class: 'arrow', x1: x0, y1: fy, x2: x1, y2: ty, 'marker-end': 'url(#' + mid + ')' }));
      if (a.label) svg.appendChild(S('text', { class: 'arrow-label', x: (x0 + x1) / 2 + 4, y: (fy + ty) / 2 }, a.label));
    });
    if (o.ticks !== false) {
      var ticks = Array.isArray(o.ticks) ? o.ticks : niceTicks(t0, t1, o.ticks || 6);
      var yb = 12 + lanes.length * laneH;
      svg.appendChild(S('line', { class: 'axis', x1: labelW, x2: W - 12, y1: yb, y2: yb }));
      ticks.forEach(function (t) {
        svg.appendChild(S('line', { class: 'axis', x1: sx(t), x2: sx(t), y1: yb, y2: yb + 4 }));
        svg.appendChild(S('text', { class: 'tick', x: sx(t), y: yb + 16, 'text-anchor': 'middle' }, o.tFormat ? o.tFormat(t) : KIT.fmt.num(t, 3)));
      });
    }
    return svg;
  }

  /** HTML legend row: items [{label, color (slot), kind:'line'|'rect'|'dot'}] */
  function legend(items) {
    var row = KIT.h('div', { class: 'kit-legend' });
    items.forEach(function (it) {
      var sw = KIT.h('span', { class: 'sw ' + (it.kind || 'rect') });
      sw.style.setProperty('--c', seriesVar(it.color || 1));
      row.appendChild(KIT.h('span', { class: 'item' }, sw, it.label));
    });
    return row;
  }

  KIT.svg = { scale: scale, niceTicks: niceTicks, wavePath: wavePath, wave: wave, plot: plot, timeline: timeline, legend: legend, S: S };

  // Generic static figure: <figure data-fig="wave" data-levels="1,-1,0" data-cpb="1" data-bits="010" data-title="NRZ-L">
  KIT.fig.register('wave', function (el, d) {
    var levels = String(d.levels || '').split(',').filter(function (s) { return s !== ''; }).map(Number);
    var opts = { cellsPerBit: d.cpb ? Number(d.cpb) : 1, bits: d.bits || '', title: d.title || '' };
    if (d.set) opts.levelSet = String(d.set).split(',').map(Number);
    if (d.init !== undefined) opts.init = Number(d.init);
    el.appendChild(wave(levels, opts));
  });
})();
