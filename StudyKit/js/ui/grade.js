/* Answer checking — pure (no DOM), Node-testable.
   Input kinds: num | bits | text | choice | tf | vector | grid  (see docs/AUTHORING.md). */
(function () {
  'use strict';

  var PREFIX = { T: 1e12, G: 1e9, M: 1e6, k: 1e3, K: 1e3, m: 1e-3, u: 1e-6, 'µ': 1e-6, 'μ': 1e-6, n: 1e-9, p: 1e-12 };
  // canonical unit → synonyms. "cs:" marks a case-sensitive synonym.
  var UNITS = {
    bps: ['bps', 'b/s', 'bit/s', 'bits/s'],
    baud: ['baud', 'bauds', 'bd', 'baud/s'],
    Hz: ['hz'],
    s: ['s', 'sec', 'secs', 'second', 'seconds'],
    m: ['cs:m', 'meter', 'meters', 'metre', 'metres'],
    'm/s': ['cs:m/s'],
    W: ['w', 'watt', 'watts'],
    dB: ['db'],
    B: ['cs:B', 'byte', 'bytes'],
    bits: ['bit', 'bits', 'cs:b'],
    sps: ['sps', 'samples/s', 'sample/s', 'samples/sec', 'sa/s'],
    'frames/s': ['frames/s', 'frame/s', 'fps', 'frames/sec'],
    V: ['v', 'volt', 'volts'],
    '%': ['%'],
    '°': ['°', 'deg', 'degrees']
  };
  var RATE = { bps: true, baud: true, Hz: true, sps: true, 'frames/s': true };
  var NOPREFIX = { dB: true, '%': true, '°': true };

  function baseUnit(u) {
    for (var c in UNITS) {
      if (!Object.prototype.hasOwnProperty.call(UNITS, c)) continue;
      var syn = UNITS[c];
      for (var i = 0; i < syn.length; i++) {
        var s = syn[i];
        if (s.indexOf('cs:') === 0) { if (u === s.slice(3)) return c; }
        else if (u.toLowerCase() === s) return c;
      }
    }
    return null;
  }

  var SUPMAP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' };
  function normalizeNumberText(str) {
    var s = String(str === null || str === undefined ? '' : str).trim();
    s = s.replace(/[−–—]/g, '-');
    // 3×10^8, 3 x 10⁸, 2.4*10^-8  →  3e8
    s = s.replace(/\s*[x×*]\s*10\s*(?:\^\s*)?([+-]?\d+|[⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, function (_, e) {
      return 'e' + e.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, function (c) { return SUPMAP[c]; });
    });
    // thousands separators: 2,500,000 / 34 860
    var prev;
    do { prev = s; s = s.replace(/(\d)[,\s](?=\d{3}(?:\D|$))/, '$1'); } while (s !== prev);
    return s;
  }

  var NUM_RE = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?\s*([a-zA-Zµμ°%][a-zA-Zµμ°%\/]*)?$/;

  /** → {ok, value, unit, prefix, mismatch, unknown}. value is in base units (prefix applied). */
  function parseQuantity(str, expected) {
    var s = normalizeNumberText(str);
    var m = NUM_RE.exec(s);
    if (!m) return { ok: false, value: NaN };
    var v = parseFloat(m[1]);
    if (m[2] !== undefined) { var den = parseFloat(m[2]); if (!den) return { ok: false, value: NaN }; v = v / den; }
    if (!isFinite(v)) return { ok: false, value: NaN };
    var u = m[3] || '';
    var exp = expected || '';
    if (!u) return { ok: true, value: v, unit: '', prefix: '', mismatch: false };
    var canon = baseUnit(u), prefix = '';
    if (!canon && u.length > 1) {
      var p = u.charAt(0), rest = u.slice(1);
      var c2 = baseUnit(rest);
      if (c2 && !NOPREFIX[c2] && (PREFIX[p] !== undefined || (RATE[c2] && /[gt]/.test(p)))) { canon = c2; prefix = p; }
    }
    if (!canon && u.length === 1 && PREFIX[u] !== undefined) { canon = exp || ''; prefix = u; } // bare "2.5M"
    if (canon === null) return { ok: true, value: v, unit: u, prefix: '', mismatch: true, unknown: true };
    if (RATE[canon]) { if (prefix === 'm') prefix = 'M'; else if (prefix === 'g') prefix = 'G'; else if (prefix === 't') prefix = 'T'; }
    var mult = prefix ? PREFIX[prefix] : 1;
    var value = v * mult;
    if (canon === '%' && exp !== '%') value = value / 100;
    var mismatch = !!(exp && canon && canon !== exp && !(canon === '%' && exp === ''));
    if (!exp && canon === '%') mismatch = false;
    return { ok: true, value: value, unit: canon, prefix: prefix, mismatch: mismatch };
  }

  function parseNumber(str, expected) {
    var q = parseQuantity(str, expected);
    return q.ok && !q.mismatch ? q.value : NaN;
  }

  function normalizeText(s) {
    return String(s === null || s === undefined ? '' : s).toLowerCase()
      .replace(/[\s\-\/_.,'"`()\[\]{}:;!?]/g, '');
  }
  function normBits(s) { return String(s === null || s === undefined ? '' : s).replace(/[\s,_|]/g, ''); }

  function parseVector(s) {
    if (Array.isArray(s)) return s.map(Number);
    var parts = normalizeNumberText(String(s)).replace(/[\[\](){};,]/g, ' ').trim().split(/\s+/).filter(Boolean);
    return parts.map(function (p) { return parseFloat(p); });
  }

  function sameSet(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    var x = a.map(Number).sort(), y = b.map(Number).sort();
    for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
    return true;
  }
  function arrEq(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  function bitIndexOf(cell, cpb) { return cpb >= 1 ? Math.floor(cell / cpb) : Math.round(cell / cpb); }

  function checkGrid(grid, resp) {
    var ans = grid.answer || [];
    var r = Array.isArray(resp) ? resp : [];
    var cpb = grid.cellsPerBit || 1;
    for (var i = 0; i < ans.length; i++) {
      if (r[i] === null || r[i] === undefined) return { ok: false, firstWrongCell: i, bitIndex: bitIndexOf(i, cpb), msg: 'Fill every cell (cell ' + (i + 1) + ' is empty).' };
    }
    if (r.length !== ans.length) return { ok: false, msg: 'Expected ' + ans.length + ' cells.' };
    if (arrEq(r, ans)) return { ok: true, msg: 'Correct.' };
    var alts = grid.alts || [];
    for (var a = 0; a < alts.length; a++) if (arrEq(r, alts[a])) return { ok: true, msg: 'Correct (accepted alternative).' };
    if (grid.acceptInverse && arrEq(r, ans.map(function (v) { return v === 0 ? 0 : -v; }))) {
      return { ok: true, inverted: true, msg: 'Correct — inverted convention; state your legend (which level means which bit).' };
    }
    for (var j = 0; j < ans.length; j++) {
      if (r[j] !== ans[j]) {
        var bi = bitIndexOf(j, cpb);
        return { ok: false, firstWrongCell: j, bitIndex: bi, msg: 'First error at bit ' + (bi + 1) + (cpb === 2 ? (j % 2 ? ' (second half)' : ' (first half)') : '') + '.' };
      }
    }
    return { ok: false, msg: 'Not quite.' };
  }

  function check(inp, resp) {
    var kind = inp && inp.kind;
    if (kind === 'num') {
      var q = parseQuantity(resp, inp.unit);
      if (!q.ok) return { ok: false, msg: 'Enter a number' + (inp.unit ? ', e.g. "' + example(inp.unit) + '"' + (prefixable(inp.unit) ? ' or "12500"' : '') : '') + '.' };
      if (q.mismatch) return { ok: false, msg: 'Unit mismatch — expected ' + (inp.unit || 'a plain number') + '.' };
      var a = Number(inp.answer), v = q.value;
      var tol = inp.tol !== undefined ? inp.tol : 0.01;
      var rel = inp.rel !== undefined ? inp.rel : true;
      var lim = rel ? tol * Math.abs(a) : tol;
      if (a === 0 && rel) lim = 1e-9;
      var eps = 1e-12 * Math.max(1, Math.abs(a));
      var err = Math.abs(v - a);
      if (err <= lim + eps) return { ok: true, msg: 'Correct.' };
      var acc = inp.accept || [];
      for (var i = 0; i < acc.length; i++) {
        if (Math.abs(v - acc[i]) <= (rel ? tol * Math.abs(acc[i]) : tol) + eps) return { ok: true, msg: 'Correct (accepted value).' };
      }
      var near = err <= Math.max(lim * 10, rel ? 0.05 * Math.abs(a) : 0);
      return { ok: false, msg: near ? 'Close — check your rounding or one step.' : 'Not quite.' };
    }
    if (kind === 'sketch') {          // drawings are self-checked against the model overlay
      if (resp === 'self' || (resp && resp.self === true)) return { ok: true, self: true, msg: 'Self-checked: your drawing matches the model.' };
      if (resp && resp.self === false) return { ok: false, self: true, msg: 'Self-checked: not yet — compare with the model and redraw.' };
      return { ok: false, self: true, pending: true, msg: 'Compare your drawing with the model (overlaid in orange), then mark it.' };
    }
    if (kind === 'bits') {
      var want = normBits(inp.answer), got = normBits(resp);
      if (!/^[01]*$/.test(got)) return { ok: false, msg: 'Use only 0 and 1.' };
      if (got.length !== want.length) return { ok: false, msg: 'Expected ' + want.length + ' bits.' };
      return got === want ? { ok: true, msg: 'Correct.' } : { ok: false, msg: 'Not quite.' };
    }
    if (kind === 'text') {
      var sing = function (t) { return t.length > 3 ? t.replace(/s$/, '') : t; };      // plural-insensitive: networks = network
      var accept = (inp.accept || []).concat(inp.answer !== undefined ? [inp.answer] : []).map(function (t) { return sing(normalizeText(t)); });
      var n = normalizeText(resp);
      if (!n) return { ok: false, msg: 'Type an answer.' };
      // "Term (ABBR)": the part outside the brackets must match — or the bracketed part, when the outside is a short
      // abbreviation ("RZ (return-to-zero)"). A long wrong term is not rescued by a right one in brackets.
      var outside = normalizeText(String(resp).replace(/\([^)]*\)/g, ' ')), inside = (String(resp).match(/\(([^)]*)\)/) || [])[1];
      var ok = accept.indexOf(sing(n)) >= 0 || (outside && accept.indexOf(sing(outside)) >= 0) ||
        (inside !== undefined && outside.length <= 6 && accept.indexOf(sing(normalizeText(inside))) >= 0);
      return ok ? { ok: true, msg: 'Correct.' } : { ok: false, msg: 'Not quite.' };
    }
    if (kind === 'choice') {
      if (Array.isArray(inp.answer)) return sameSet(inp.answer, resp) ? { ok: true, msg: 'Correct.' } : { ok: false, msg: 'Not quite.' };
      return Number(resp) === Number(inp.answer) && resp !== null && resp !== '' ? { ok: true, msg: 'Correct.' } : { ok: false, msg: 'Not quite.' };
    }
    if (kind === 'tf') {
      var b = resp === true || resp === 'true' ? true : resp === false || resp === 'false' ? false : null;
      return b === inp.answer ? { ok: true, msg: 'Correct.' } : { ok: false, msg: b === null ? 'Choose true or false.' : 'Not quite.' };
    }
    if (kind === 'vector') {
      var vw = inp.answer.map(Number), vg = parseVector(resp);
      if (vg.length !== vw.length || vg.some(function (x) { return !isFinite(x); })) return { ok: false, msg: 'Expected ' + vw.length + ' numbers.' };
      for (var k = 0; k < vw.length; k++) if (Math.abs(vg[k] - vw[k]) > 1e-9) return { ok: false, msg: 'Entry ' + (k + 1) + ' is off.' };
      return { ok: true, msg: 'Correct.' };
    }
    if (kind === 'grid') return checkGrid(inp.grid || {}, resp);
    return { ok: false, msg: 'Unknown input kind: ' + kind };
  }

  /** Canonical correct response (used by self-tests and "show answer"). */
  function answerOf(inp) {
    switch (inp.kind) {
      case 'num': return String(inp.answer);
      case 'bits': return String(inp.answer);
      case 'text': return (inp.accept && inp.accept[0]) || String(inp.answer);
      case 'choice': return Array.isArray(inp.answer) ? inp.answer.slice() : inp.answer;
      case 'tf': return inp.answer;
      case 'vector': return inp.answer.join(' ');
      case 'grid': return inp.grid.answer.slice();
      case 'sketch': return 'self';
      default: return null;
    }
  }

  function signed(v) { return v > 0 ? '+' + v : v === 0 ? '0' : '−' + Math.abs(v); }

  /** Human-readable answer text. */
  function display(inp) {
    switch (inp.kind) {
      case 'num': return KIT.fmt.si(Number(inp.answer), inp.unit || '', inp.sig || 4);
      case 'bits': return String(inp.answer);
      case 'text': return inp.display || (inp.accept && inp.accept[0]) || String(inp.answer);
      case 'choice':
        if (Array.isArray(inp.answer)) return inp.answer.map(function (i) { return inp.choices ? inp.choices[i] : String.fromCharCode(65 + i); }).join('; ');
        return inp.choices ? String(inp.choices[inp.answer]) : String.fromCharCode(65 + inp.answer);
      case 'tf': return inp.answer ? 'True' : 'False';
      case 'vector': return '[' + inp.answer.map(signed).join(', ') + ']';
      case 'grid': {
        var g = inp.grid, volts = Math.max.apply(null, (g.levels || [1]).map(Math.abs)) <= 1;
        return g.answer.map(function (v) { return KIT.fmt.level(v, volts); }).join(' ');
      }
      case 'sketch': return 'see the model drawing';
      default: return '';
    }
  }

  /** Grade a bank question. Returns true/false, or null for self-graded essays. */
  function question(q, resp) {
    switch (q.type) {
      case 'mcq': return check({ kind: 'choice', answer: q.answer }, resp).ok;
      case 'multi': return check({ kind: 'choice', answer: q.answer }, resp).ok;
      case 'tf': return check({ kind: 'tf', answer: q.answer }, resp).ok;
      case 'id': return check({ kind: 'text', answer: q.answer, accept: q.accept || [] }, resp).ok;
      case 'num': return check({ kind: 'num', answer: q.num.value, tol: q.num.tol, rel: q.num.rel, unit: q.num.unit, accept: q.num.accept }, resp).ok;
      default: return null;
    }
  }

  /** True when SI prefixes make sense for the unit (kHz, Mbps), false for dB, %, ° and plain numbers. */
  function prefixable(unit) { return !!unit && !NOPREFIX[unit]; }
  /** Sample answer for placeholders and messages: "12.5 kHz", "12.5 dB", "45°", "12.5". */
  function example(unit) {
    if (!unit) return '12.5';
    if (unit === '°') return '45°';
    return prefixable(unit) ? '12.5 k' + unit : '12.5 ' + unit;
  }

  KIT.grade = {
    parseQuantity: parseQuantity, parseNumber: parseNumber, normalizeText: normalizeText,
    check: check, answerOf: answerOf, display: display, question: question, example: example, prefixable: prefixable
  };
})();
