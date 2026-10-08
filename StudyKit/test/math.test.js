'use strict';
// js/core/math.js — a small TeX subset rendered as MathML (Chrome renders MathML Core natively, offline and in print).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadKit } = require('./helpers/load.js');
const KIT = loadKit();
const M = () => KIT.math;
const tex = (s, o) => M().tex(s, o);

test('tex(): identifiers, numbers and operators', () => {
  assert.equal(tex('x'), '<math><mi>x</mi></math>');
  assert.equal(tex('a + b = 6.02'), '<math><mi>a</mi><mo>+</mo><mi>b</mi><mo>=</mo><mn>6.02</mn></math>');
  assert.equal(tex('a - b'), '<math><mi>a</mi><mo>−</mo><mi>b</mi></math>', 'a hyphen becomes a real minus sign');
  assert.equal(tex('10,000'), '<math><mn>10,000</mn></math>', 'thousands separators stay inside the number');
  assert.equal(tex('SNR'), '<math><mi>SNR</mi></math>', 'a run of letters is one (upright) name');
  assert.equal(tex('c N'), '<math><mi>c</mi><mi>N</mi></math>', 'spaces separate single-letter variables');
});

test('tex(): fractions, scripts and roots', () => {
  assert.equal(tex('\\frac{1}{r}'), '<math><mfrac><mrow><mn>1</mn></mrow><mrow><mi>r</mi></mrow></mfrac></math>');
  assert.equal(tex('x^2'), '<math><msup><mi>x</mi><mn>2</mn></msup></math>');
  assert.equal(tex('2^{m} \\le L^{n}'), '<math><msup><mn>2</mn><mrow><mi>m</mi></mrow></msup><mo>≤</mo><msup><mi>L</mi><mrow><mi>n</mi></mrow></msup></math>');
  assert.equal(tex('f_s'), '<math><msub><mi>f</mi><mi>s</mi></msub></math>');
  assert.equal(tex('T_{\\text{prop}}'), '<math><msub><mi>T</mi><mrow><mtext>prop</mtext></mrow></msub></math>');
  assert.equal(tex('x_1^2'), '<math><msubsup><mi>x</mi><mn>1</mn><mn>2</mn></msubsup></math>');
  assert.equal(tex('x^2_1'), '<math><msubsup><mi>x</mi><mn>1</mn><mn>2</mn></msubsup></math>', 'script order does not matter');
  assert.equal(tex('\\sqrt{I^2 + Q^2}'), '<math><msqrt><msup><mi>I</mi><mn>2</mn></msup><mo>+</mo><msup><mi>Q</mi><mn>2</mn></msup></msqrt></math>');
  assert.equal(tex('10^{-3}'), '<math><msup><mn>10</mn><mrow><mo>−</mo><mn>3</mn></mrow></msup></math>');
});

test('tex(): commands — logs, Greek, relations, text, spacing', () => {
  assert.equal(tex('\\log_2 L'), '<math><msub><mi>log</mi><mn>2</mn></msub><mi>L</mi></math>');
  assert.equal(tex('\\log_{10}'), '<math><msub><mi>log</mi><mrow><mn>10</mn></mrow></msub></math>');
  assert.equal(tex('\\Delta f'), '<math><mi mathvariant="normal">Δ</mi><mi>f</mi></math>', 'capital Greek is upright');
  assert.equal(tex('\\lambda'), '<math><mi>λ</mi></math>');
  assert.equal(tex('a \\times b \\cdot c'), '<math><mi>a</mi><mo>×</mo><mi>b</mi><mo>⋅</mo><mi>c</mi></math>');
  assert.equal(tex('a \\ge b \\approx c \\Rightarrow d'), '<math><mi>a</mi><mo>≥</mo><mi>b</mi><mo>≈</mo><mi>c</mi><mo>⇒</mo><mi>d</mi></math>');
  assert.equal(tex('a \\lt b'), '<math><mi>a</mi><mo>&lt;</mo><mi>b</mi></math>', '\\lt is escaped for HTML');
  assert.equal(tex('\\text{bit rate}'), '<math><mtext>bit rate</mtext></math>');
  assert.equal(tex('360^\\circ'), '<math><msup><mn>360</mn><mo>°</mo></msup></math>');
  assert.equal(tex('|e|'), '<math><mo stretchy="false">|</mo><mi>e</mi><mo stretchy="false">|</mo></math>', 'bars keep the text size');
  assert.equal(tex('a\\,b'), '<math><mi>a</mi><mspace width="0.17em"></mspace><mi>b</mi></math>');
  assert.equal(tex('a\\qquad b'), '<math><mi>a</mi><mspace width="2em"></mspace><mi>b</mi></math>');
});

test('tex(): \\c{role}{…} colors a quantity the same way everywhere (formulas, legends, steps, animations)', () => {
  assert.equal(tex('\\c{bw}{B}'), '<math><mrow class="v3"><mi>B</mi></mrow></math>');
  assert.equal(tex('\\c{rate}{N_{\\max}} = 2\\c{bw}{B}'),
    '<math><mrow class="v1"><msub><mi>N</mi><mrow><mi>max</mi></mrow></msub></mrow><mo>=</mo><mn>2</mn><mrow class="v3"><mi>B</mi></mrow></math>');
  assert.equal(tex('\\c{4}{L}'), '<math><mrow class="v4"><mi>L</mi></mrow></math>', 'slots 1–6 work too');
  ['rate', 'baud', 'bw', 'level', 'snr', 'time'].forEach((r, i) => assert.match(tex('\\c{' + r + '}{x}'), new RegExp('class="v' + (i + 1) + '"')));
  // One color per unit family: bps, baud (and samples/s), Hz (bandwidth and every frequency), levels/bits-per, power/SNR/dB, seconds.
  assert.deepEqual(M().ROLES, { rate: 1, baud: 2, bw: 3, freq: 3, level: 4, snr: 5, time: 6 });
  assert.equal(tex('\\c{freq}{f}'), tex('\\c{bw}{f}'), 'a frequency is colored like bandwidth (both in Hz)');
  assert.throws(() => tex('\\c{red}{x}'), /unknown color "red"/);
  assert.throws(() => tex('\\c{bw}'), /missing colored part/);
});

test('tex(): brackets keep their size and a sign after an operator or bracket is a prefix minus', () => {
  assert.equal(tex('(1 + x)'), '<math><mo stretchy="false">(</mo><mn>1</mn><mo>+</mo><mi>x</mi><mo stretchy="false">)</mo></math>');
  assert.equal(tex('10 \\times (-0.3)'),
    '<math><mn>10</mn><mo>×</mo><mo stretchy="false">(</mo><mo form="prefix">−</mo><mn>0.3</mn><mo stretchy="false">)</mo></math>');
  assert.equal(tex('a = -3'), '<math><mi>a</mi><mo>=</mo><mo form="prefix">−</mo><mn>3</mn></math>');
  assert.equal(tex('a - b'), '<math><mi>a</mi><mo>−</mo><mi>b</mi></math>', 'between two operands it stays a binary minus');
});

test('tex(): display mode for formula cards', () => {
  assert.equal(tex('x', { display: true }), '<math display="block"><mi>x</mi></math>');
});

test('tex(): mistakes fail loudly with the source in the message', () => {
  assert.throws(() => tex('\\frac{1}'), /missing denominator.*\\frac\{1\}/);
  assert.throws(() => tex('{a'), /unbalanced \{/);
  assert.throws(() => tex('a}'), /unbalanced \}/);
  assert.throws(() => tex('\\foo'), /unknown command \\foo/);
  assert.throws(() => tex('x^'), /missing superscript/);
  assert.throws(() => tex('a < b'), /\\lt/, 'raw < would break the HTML');
  assert.throws(() => tex('a & b'), /raw "&"/);
  assert.throws(() => tex('_x'), /script without a base/);
});

test('render(): $…$ inline and $$…$$ display inside trusted HTML; everything else untouched', () => {
  assert.equal(M().render('<p>no math</p>'), '<p>no math</p>');
  assert.equal(M().render('<p>Speed $v = \\frac{d}{t}$.</p>'),
    '<p>Speed <math><mi>v</mi><mo>=</mo><mfrac><mrow><mi>d</mi></mrow><mrow><mi>t</mi></mrow></mfrac></math>.</p>');
  assert.equal(M().render('$$x$$ and $y$'), '<math display="block"><mi>x</mi></math> and <math><mi>y</mi></math>');
  assert.equal(M().render('$$a$$'), '<math display="block"><mi>a</mi></math>');
});

test('check(): lists the math errors in a block of HTML (used by the schema)', () => {
  assert.deepEqual(M().check('<p>$\\frac{a}{b}$ fine</p>'), []);
  assert.equal(M().check('<p>$\\frac{a}$ broken</p>').length, 1);
  assert.match(M().check('<p>one $ alone</p>')[0], /odd number of \$/);
});

test('schema.checkHtml(): authored HTML with a broken formula is rejected', () => {
  assert.deepEqual(KIT.schema.checkHtml('<p>$x^2$ and $$\\frac{S}{N}$$</p>', 'w'), []);
  assert.match(KIT.schema.checkHtml('<p>$\\frac{a}$</p>', 'w')[0], /^w: math: missing denominator/);
  assert.match(KIT.schema.checkHtml('<p>costs $5</p>', 'w')[0], /^w: math: odd number of \$/);
});
