/* Core utilities: DOM builders, seeded RNG, number formatting. */
(function () {
  'use strict';
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- DOM builders ---------- */
  function append(el, kid) {
    if (kid === null || kid === undefined || kid === false || kid === true) return;
    if (Array.isArray(kid)) { for (var i = 0; i < kid.length; i++) append(el, kid[i]); return; }
    if (typeof kid === 'string' || typeof kid === 'number') { el.appendChild(document.createTextNode(String(kid))); return; }
    el.appendChild(kid);
  }
  function setAttrs(el, attrs, isSvg) {
    if (!attrs) return;
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class' || k === 'className') el.setAttribute('class', String(v));
      else if (k === 'style' && typeof v === 'object') Object.keys(v).forEach(function (s) {
        // camelCase (marginTop) → kebab-case (margin-top); custom properties (--x) pass through
        var prop = s.indexOf('--') === 0 ? s : s.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); });
        el.style.setProperty(prop, v[s]);
      });
      else if (k === 'dataset') Object.keys(v).forEach(function (d) { el.dataset[d] = v[d]; });
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'text') el.textContent = String(v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    });
  }
  /** KIT.h('div', {class:'x', onclick: fn}, 'text', child, [more]) — strings become text nodes (safe). */
  KIT.h = function (tag, attrs) {
    var el = document.createElement(tag);
    setAttrs(el, attrs, false);
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  };
  /** SVG element builder. */
  KIT.s = function (tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    setAttrs(el, attrs, true);
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  };
  /** Parse TRUSTED, authored HTML (content files) into a fragment. Never pass user input here.
      $…$ and $$…$$ inside it become MathML (js/core/math.js). */
  KIT.html = function (trusted) {
    var t = document.createElement('template'), s = String(trusted);
    if (KIT.math && s.indexOf('$') >= 0) s = KIT.math.render(s);
    t.innerHTML = s;
    return t.content;
  };
  KIT.clear = function (el) { while (el && el.firstChild) el.removeChild(el.firstChild); return el; };

  /* ---------- seeded RNG (mulberry32) ---------- */
  function hashString(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  }
  KIT.hashString = hashString;
  KIT.rng = function (seed) {
    var a = typeof seed === 'string' ? hashString(seed) : (Number(seed) >>> 0);
    if (!a) a = 0x9e3779b9;
    function next() {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return {
      seed: seed,
      next: next,
      int: function (lo, hi) { return lo + Math.floor(next() * (hi - lo + 1)); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      bits: function (n) { var s = ''; for (var i = 0; i < n; i++) s += next() < 0.5 ? '0' : '1'; return s; },
      chance: function (p) { return next() < p; },
      shuffle: function (arr) {
        var b = arr.slice();
        for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(next() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; }
        return b;
      }
    };
  };

  /* ---------- number formatting ---------- */
  var SUP = { '-': '⁻', '+': '', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sup(n) { return String(n).split('').map(function (c) { return SUP[c] !== undefined ? SUP[c] : c; }).join(''); }
  function group(intStr) { return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  var MINUS = '−';

  /** Significant-digit formatting: 34881 → "34,880" (sig 4), 7.5e-7 → "7.5×10⁻⁷". */
  function num(x, sig) {
    if (typeof x !== 'number' || !isFinite(x)) return String(x);
    if (x === 0) return '0';
    sig = sig || 4;
    var r = Number(x.toPrecision(sig));
    var a = Math.abs(r);
    if (a >= 1e-4 && a < 1e15) {
      var s = String(a);
      if (s.indexOf('e') >= 0) s = a.toFixed(20).replace(/0+$/, '').replace(/\.$/, '');
      var parts = s.split('.');
      var ip = a >= 1000 ? group(parts[0]) : parts[0];
      return (r < 0 ? MINUS : '') + ip + (parts[1] ? '.' + parts[1] : '');
    }
    var e = r.toExponential(sig - 1).split('e');
    var m = String(Number(e[0]));
    return (m.charAt(0) === '-' ? MINUS + m.slice(1) : m) + '×10' + sup(parseInt(e[1], 10));
  }

  var PFX = [[1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
  var NOPFX = { '': true, 'dB': true, '%': true, '°': true, 'rad': true };

  /** SI formatting: si(2.5e6,'bps') → "2.5 Mbps"; si(0.05,'s') → "50 ms". Units in NOPFX never get prefixes. */
  function si(x, unit, sig) {
    unit = unit === undefined || unit === null ? '' : String(unit);
    sig = sig || 3;
    if (typeof x !== 'number' || !isFinite(x)) return String(x);
    if (NOPFX[unit]) return num(x, sig) + (unit === '' ? '' : (unit === '%' || unit === '°' ? '' : ' ') + unit);
    if (x === 0) return '0 ' + unit;
    var a = Math.abs(x), i, f = 1e-12, p = 'p';
    for (i = 0; i < PFX.length; i++) { if (a >= PFX[i][0]) { f = PFX[i][0]; p = PFX[i][1]; break; } }
    if (i === PFX.length) i = PFX.length - 1;
    var v = Number((x / f).toPrecision(sig));
    if (Math.abs(v) >= 1000 && i > 0) { f = PFX[i - 1][0]; p = PFX[i - 1][1]; v = Number((x / f).toPrecision(sig)); }
    return num(v, sig) + ' ' + p + unit;
  }

  function pad(s, w, ch) { s = String(s); while (s.length < w) s = (ch || '0') + s; return s; }

  KIT.fmt = {
    num: num,
    si: si,
    sup: sup,
    group: group,
    bin: function (n, w) { return pad((n >>> 0).toString(2), w || 1); },
    hex: function (n, w) { return pad((n >>> 0).toString(16).toUpperCase(), w || 1); },
    pct: function (x, sig) { return num(x * 100, sig || 3) + '%'; },
    pad: pad,
    /** A color-coded quantity in prose HTML: q('bw', 4000, 'Hz') → '<span class="v3">4 kHz</span>'. Roles: AUTHORING §3.8.
        Without a unit the plain number is shown. Hovering it lights up the same quantity everywhere in its example. */
    q: function (role, x, unit, sig) {
      return '<span class="v' + KIT.math.ROLES[role] + '">' + (unit === undefined ? num(x, sig || 6) : si(x, unit, sig || 4)) + '</span>';
    },
    /** The same quantity inside $…$ math: tq('bw', 4000, 'Hz') → '\c{bw}{\text{4 kHz}}'. */
    tq: function (role, x, unit, sig) {
      return '\\c{' + role + '}{\\text{' + (unit === undefined ? num(x, sig || 6) : si(x, unit, sig || 4)) + '}}';
    },
    /** Signed level label for waveforms: 1 → "+V", -1 → "−V", 0 → "0", 3 → "+3". */
    level: function (v, volts) {
      if (v === 0) return '0';
      var s = v > 0 ? '+' : MINUS;
      var m = Math.abs(v);
      if (volts !== false && m === 1) return s + 'V';
      return s + m;
    }
  };

  /* ---------- small helpers ---------- */
  KIT.util = {
    range: function (n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; },
    sum: function (arr) { var s = 0; for (var i = 0; i < arr.length; i++) s += arr[i]; return s; },
    clamp: function (x, lo, hi) { return Math.max(lo, Math.min(hi, x)); },
    approx: function (a, b, rel) { rel = rel === undefined ? 1e-9 : rel; return Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b)); },
    log2: function (x) { return Math.log(x) / Math.LN2; },
    log10: function (x) { return Math.log(x) / Math.LN10; },
    chunk: function (str, n) { var out = []; for (var i = 0; i < str.length; i += n) out.push(str.slice(i, i + n)); return out; }
  };
})();
