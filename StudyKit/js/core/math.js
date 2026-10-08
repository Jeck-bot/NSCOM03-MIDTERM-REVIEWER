/* Math: a small TeX subset rendered as MathML, which Chrome draws natively (offline, crisp in print). Owner: Lead.
   KIT.math.tex(src, { display })  → '<math …>…</math>' string (throws on mistakes, with the source in the message)
   KIT.math.render(html)           → html with every $…$ (inline) and $$…$$ (display) replaced by MathML
   KIT.math.check(html)            → [error strings] for the schema (odd $ count, parse errors)
   Supported: \frac{a}{b}, x_1, x^2, x_{…}^{…}, \sqrt{…}, \text{…}, \log \ln \max \min, Greek (\Delta, \lambda, …),
   \times \cdot \le \ge \lt \gt \approx \ne \pm \Rightarrow \Leftrightarrow \to \infty \circ \degree \ldots, \, \quad, { … } groups,
   and \c{role}{…} — the quantity's course-wide color (rate, baud, bw, level, snr, time, or 1–6).
   Letters run together form one upright name (SNR, dB); put spaces between single-letter variables (c N r).
   Raw <, > and & are rejected — write \lt, \gt, \le, \ge — so the surrounding HTML always stays valid. */
(function () {
  'use strict';
  var GREEK = {
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ', pi: 'π', rho: 'ρ',
    sigma: 'σ', tau: 'τ', phi: 'φ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Omega: 'Ω'
  };
  var OPS = {
    times: '×', cdot: '⋅', le: '≤', leq: '≤', ge: '≥', geq: '≥', lt: '<', gt: '>', approx: '≈', ne: '≠', neq: '≠', pm: '±',
    Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', to: '→', rightarrow: '→', leftarrow: '←', infty: '∞', circ: '°',
    degree: '°', ldots: '…', cdots: '⋯', in: '∈', div: '÷', propto: '∝', equiv: '≡'
  };
  var FUNCS = { log: 1, ln: 1, sin: 1, cos: 1, tan: 1, max: 1, min: 1, exp: 1 };
  // Course-wide variable colors (css/app.css --v1…--v6): one quantity, one color, in every formula, legend, step and animation.
  var ROLES = { rate: 1, baud: 2, bw: 3, freq: 3, level: 4, snr: 5, time: 6 };
  var SYMBOL = { '-': '−', '*': '⋅', "'": '′' };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function parse(src) {
    var i = 0, n = src.length;
    function err(msg) { throw new Error('math: ' + msg + ' in "' + src + '"'); }
    function skip() { while (i < n && /\s/.test(src.charAt(i))) i++; }
    function group() {                              // just after '{': read to the matching '}'
      var out = seq('}');
      if (src.charAt(i) !== '}') err('unbalanced {');
      i++;
      return out;
    }
    function inner(what) {                          // a required argument's content: {…} or one token, unwrapped
      skip();
      if (i >= n || src.charAt(i) === '}') err('missing ' + what);
      if (src.charAt(i) === '{') { i++; return group(); }
      return atom(what);
    }
    function arg(what) {                            // a script argument: a braced group stays one <mrow>
      skip();
      var braced = src.charAt(i) === '{', x = inner(what);
      return braced ? '<mrow>' + x + '</mrow>' : x;
    }
    function command() {
      i++;                                          // past the backslash
      var c = src.charAt(i);
      if (!/[A-Za-z]/.test(c)) {
        i++;
        if (c === ',') return '<mspace width="0.17em"></mspace>';
        if (c === ' ') return '<mspace width="0.25em"></mspace>';
        if ('%{}_#$'.indexOf(c) >= 0 && c) return '<mo>' + esc(c) + '</mo>';
        err('unknown command \\' + c);
      }
      var name = /^[A-Za-z]+/.exec(src.slice(i))[0];
      i += name.length;
      if (name === 'frac') { var a = inner('numerator'), b = inner('denominator'); return '<mfrac><mrow>' + a + '</mrow><mrow>' + b + '</mrow></mfrac>'; }
      if (name === 'sqrt') return '<msqrt>' + inner('radicand') + '</msqrt>';
      if (name === 'text') {
        skip();
        if (src.charAt(i) !== '{') err('\\text needs {…}');
        var j = src.indexOf('}', i);
        if (j < 0) err('unbalanced {');
        var txt = src.slice(i + 1, j);
        if (/[<&>]/.test(txt)) err('raw "' + /[<&>]/.exec(txt)[0] + '" is not allowed; write \\lt, \\gt, \\le or \\ge');
        i = j + 1;
        return '<mtext>' + txt + '</mtext>';
      }
      if (name === 'c') {                           // \c{role}{…}: the quantity's course-wide color
        skip();
        if (src.charAt(i) !== '{') err('\\c needs {role}{…}');
        var k = src.indexOf('}', i);
        if (k < 0) err('unbalanced {');
        var role = src.slice(i + 1, k).trim();
        var slot = ROLES[role] || (/^[1-6]$/.test(role) ? +role : 0);
        if (!slot) err('unknown color "' + role + '" (use ' + Object.keys(ROLES).join(', ') + ' or 1–6)');
        i = k + 1;
        return '<mrow class="v' + slot + '">' + inner('colored part') + '</mrow>';
      }
      if (name === 'quad') return '<mspace width="1em"></mspace>';
      if (name === 'qquad') return '<mspace width="2em"></mspace>';
      if (GREEK[name]) return /^[A-Z]/.test(name) ? '<mi mathvariant="normal">' + GREEK[name] + '</mi>' : '<mi>' + GREEK[name] + '</mi>';
      if (OPS[name]) return '<mo>' + esc(OPS[name]) + '</mo>';
      if (FUNCS[name]) return '<mi>' + name + '</mi>';
      err('unknown command \\' + name);
    }
    function atom(what) {
      skip();
      if (i >= n) { if (what) err('missing ' + what); return null; }
      var c = src.charAt(i), m;
      if (c === '\\') return command();
      if (c === '{') { i++; return '<mrow>' + group() + '</mrow>'; }
      if (c === '}') { if (what) err('missing ' + what); return null; }
      if (c === '<' || c === '>' || c === '&') err('raw "' + c + '" is not allowed; write \\lt, \\gt, \\le or \\ge');
      if (c === '$') err('nested $');
      if (c === '_' || c === '^') err('script without a base');
      if ((m = /^\d+(?:,\d{3})*(?:\.\d+)?/.exec(src.slice(i)))) { i += m[0].length; return '<mn>' + m[0] + '</mn>'; }
      if ((m = /^[A-Za-z]+/.exec(src.slice(i)))) { i += m[0].length; return '<mi>' + m[0] + '</mi>'; }
      if (/[Α-Ω]/.test(c)) { i++; return '<mi mathvariant="normal">' + c + '</mi>'; }   // capital Greek: upright
      if (/[α-ωµ]/.test(c)) { i++; return '<mi>' + c + '</mi>'; }
      i++;
      if ('()[]|'.indexOf(c) >= 0) return '<mo stretchy="false">' + c + '</mo>';   // brackets and bars keep the text size
      return '<mo>' + esc(SYMBOL[c] || c) + '</mo>';
    }
    function scripts(base) {                        // base, then _x and/or ^x in either order
      var sub = null, sup = null;
      for (;;) {
        skip();
        var c = src.charAt(i);
        if (c === '_' && sub === null) { i++; sub = arg('subscript'); continue; }
        if (c === '^' && sup === null) { i++; sup = arg('superscript'); continue; }
        break;
      }
      if (sub !== null && sup !== null) return '<msubsup>' + base + sub + sup + '</msubsup>';
      if (sub !== null) return '<msub>' + base + sub + '</msub>';
      if (sup !== null) return '<msup>' + base + sup + '</msup>';
      return base;
    }
    function seq(end) {
      var out = '';
      for (;;) {
        skip();
        if (i >= n) { if (end) err('unbalanced {'); break; }
        var c = src.charAt(i);
        if (c === '}') { if (end) break; err('unbalanced }'); }
        var item = scripts(atom());
        // A minus right after an operator or an opening bracket is a sign: no binary-operator spacing.
        if (item === '<mo>−</mo>' && /<mo[^>]*>[^<)\]]*<\/mo>$/.test(out)) item = '<mo form="prefix">−</mo>';
        out += item;
      }
      return out;
    }
    return seq(null);
  }

  function tex(src, o) {
    o = o || {};
    return '<math' + (o.display ? ' display="block"' : '') + '>' + parse(String(src)) + '</math>';
  }

  var DISPLAY = /\$\$([\s\S]+?)\$\$/g, INLINE = /\$([^$]+?)\$/g;

  /** Replace $$…$$ and $…$ in trusted HTML with MathML. A broken formula is shown as its source and reported. */
  function render(html) {
    var s = String(html === null || html === undefined ? '' : html);
    if (s.indexOf('$') < 0) return s;
    function safe(src, display) {
      try { return tex(src, { display: display }); }
      catch (e) { if (KIT.report) KIT.report(e, 'math'); return '<code class="math-error">' + esc(src) + '</code>'; }
    }
    return s.replace(DISPLAY, function (m, src) { return safe(src, true); })
      .replace(INLINE, function (m, src) { return safe(src, false); });
  }

  /** Errors in the math of a block of HTML (empty when fine). */
  function check(html) {
    var s = String(html === null || html === undefined ? '' : html), errs = [];
    var rest = s.replace(DISPLAY, function (m, src) { try { tex(src); } catch (e) { errs.push(e.message); } return ''; })
      .replace(INLINE, function (m, src) { try { tex(src); } catch (e) { errs.push(e.message); } return ''; });
    if (rest.indexOf('$') >= 0) errs.push('math: odd number of $ (an unclosed formula) in "' + s.slice(0, 80) + '"');
    return errs;
  }

  KIT.math = { tex: tex, render: render, check: check, ROLES: ROLES };
})();
