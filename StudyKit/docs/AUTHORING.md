# StudyKit authoring guide (contracts — read fully before writing)

Offline study kit for the **NSCOM03 midterm. Coverage: Modules 1–4 only** (L01–L04 slide decks). The real exam has
**MCQ, Identification, Solving (computational) and Essay** items, with at least 3 of those types in each set.

- The kit opens by double-clicking `index.html` (file:// URLs) in Chrome.
- Topic ids: `l01`, `l02`, `l03a` (L03 slides 1–61: line coding, block coding, scrambling), `l03b` (L03 slides 62–96: PCM, delta modulation, transmission modes), `l04`.
- **Golden slice = L04.** Copy its patterns exactly:
  - `js/calc/modulation.js` + `test/calc.modulation.test.js` (calc + slide-oracle tests)
  - `js/gen/l04.js` (generators)
  - `content/l04.js` (topic content, formulas, cheat-sheet panels)
  - `bank/l04.js` (question bank)
  - `js/viz/l04-constellation.js` (drawing helpers, static figures, one interactive visual)
- **Source of truth:** the lecture slides themselves, placed in `../Resources/` (see the repository README; the slides are not distributed). The original authors also used `docs/source-digest.md`, a text extraction of the slides, which is not included in this repository for the same reason.

## 1. Rules that tests enforce (`node --test` will fail otherwise)
- **One IIFE per file** that touches only `KIT`:
  - Start with `(function () { 'use strict'; … })();`.
  - **No top-level `var/let/const/function/class`.**
- **No DOM access at load time.** Only call `document`/`KIT.h`/`KIT.s` inside functions (renderers, figures, `mount`, `key`).
- **Never** use:
  - `fetch`, `XMLHttpRequest`, ES modules (`import`/`export`), `eval`, `new Function`, `document.write`, `insertAdjacentHTML`, `pushState`, iframes, or Web Workers
  - `.innerHTML =` — use `KIT.html(trustedString)` for authored HTML
  - any `http(s)://` URL (offline kit)
- **`js/calc/*` and `js/gen/*` must be deterministic:** no `Math.random`, no `Date`. Randomness comes only from the `rng` passed to `params(rng)`.
- **Files are UTF-8 without BOM.** Unicode (µ, Δ, ≤, ², →) is fine and encouraged.
- **Authored HTML must have balanced tags.** No `<script>`, no inline `on…=` handlers, no TODO/TBD. Write a literal `<` in text as `&lt;`.
- **Don't create new files** and don't edit files you don't own: every script is pre-registered in `index.html`. If you need something in a file you don't own, say so in your report.
- **Ids are topic-prefixed and unique:**
  - generators, visuals and formulas: `l02.shannon`
  - questions: `l02.q007`
  - essays: `l02.e001`

## 2. Ownership
| Owner | Files |
|---|---|
| Lead | `index.html`, `js/core/*`, `js/router.js`, `js/selftest.js`, `js/app.js`, `js/pages/{shell,topic,lab}.js`, `css/app.css`, `css/viz.css`, `exams/*`, `test/{boot,lint,core,grade,content,gen,exam}.test.js`, `tools/*`, `docs/*`; L04 and L03b content |
| O1 | `content/l01.js`, `content/l02.js`, `bank/l01.js`, `bank/l02.js`, `js/calc/signals.js`, `js/gen/l02.js`, `js/viz/l01-osi.js`, `js/viz/l02-{sine,capacity,db,latency}.js`, `test/calc.signals.test.js` (new) |
| O2 | `content/l03a.js`, `bank/l03a.js`, `js/calc/linecode.js`, `js/gen/l03a.js`, `js/viz/l03a-{linecode,scramble,drift,blockcode}.js`, `test/calc.linecode.test.js` (new) |
| UI | `js/ui/{quiz,grid,practice,exam,diag,flash}.js`, `js/print/docs.js`, `js/pages/{home,cheatsheet}.js`, `content/plan.js`, `css/ui.css`, `css/print.css`, `test/ui.*.test.js` (new) |
| Walk authors | one `content/walk/<id>.js` each (§3.7) |

Test files under `test/` named for your module are yours to create (they are not loaded by `index.html`).

## 3. Contracts

### 3.1 Calc modules (`js/calc/<name>.js`)
```js
(function () {
  'use strict';
  var CONV = { key: 'Convention in words … [L03 p23]' };   // every slide convention, with a slide ref
  function f(...) { … }                                     // pure; SI base units (Hz, bps, baud, s, m, W)
  KIT.calc.<name> = { CONV: CONV, f: f, … };
})();
```
- **Test-first.** Write `test/calc.<name>.test.js` asserting **every worked example** on your slides (the slide page in the test name), plus invariants (e.g. encode → decode round trip). Run it, watch it fail, then implement.
- **If a slide answer is rounded** (e.g. Shannon 34,860 vs exact 34,881), test the exact value and note the slide value.
- **If a test disagrees with the slide,** re-read the digest or the slide. Never loosen a test to make it pass.

### 3.2 Formulas (in your `content/<topic>.js`)
```js
KIT.formula({ id: 'l02.shannon', topic: 'l02', name: 'Shannon capacity', html: 'C = B × log<sub>2</sub>(1 + SNR)',
  where: 'B in Hz; SNR is the linear ratio (not dB)', note: 'optional', ref: 'L02 p31', sheet: true, beyond: false });
```
`sheet: true` puts it on the cheat sheet. Keep `html` short.

### 3.3 Topic (`content/<topic>.js`) — see `content/l04.js`
```js
KIT.topic({ id, lecture /* 1..4; l03a and l03b are both 3 */, title, blurb, highYield: [..],
  glance: [ 5–7 html bullets ], ask: [ 4–6 likely exam question forms, prefixed <b>MCQ</b>/<b>Identification</b>/<b>Solving</b>/<b>Essay</b> ],
  sections: [ … ], slideErrors: [{ ref, says, correct }], glossary: [{ term, def, alt?, ref }], cheat: [{ title, html }] });
```
**Section kinds,** in this order (place each `example` right after the notes it illustrates):
- `{ kind:'intuition', title, viz?, fig?, figData?, params?, analogy, predict:[{ q, choices, answer, explain, set? }] }`
  - Phase 1: use a static `fig` (or a `viz` if you have one), plus an everyday analogy and 1–2 "predict" questions that prime the key idea.
- `{ kind:'notes', id, title, ref:'L02 pp20-22', html, beyond? }` — the reviewer text.
  - Use `<p>`, `<ul>`, `<table class="tbl">`, `<h4>`, figures, and `<span class="chip ref">L02 p21</span>` after facts.
  - Callouts: `<div class="callout key|slide-error|beyond|trap"><div class="callout-label">…</div>…</div>`.
  - Slide-error callout body: `<div class="says-correct"><b>Slide 18</b><span>…</span><b>Correct</b><span>…</span></div>`.
- `{ kind:'example', title, ref, gen, params, slideAnswer, slideValue?, input?, slideTol? }`
  - A worked example **from the slides**, built by your generator from explicit params.
  - `slideValue` is checked against the input named `input` (default: first numeric input) with relative tolerance `slideTol` (default 0.01). Add it whenever the slide gives a number.
  - Use `{ kind:'example', title, ref, html }` only for non-numeric slide examples.
- `{ kind:'formulas', ids:[…] }`
- `{ kind:'practice', gens:[…] }`
- `{ kind:'quick', n:8 }` — draws general (non-pool, non-essay) bank items for the topic. You need at least n of them.
- `{ kind:'traps', items:[{ trap, fix, ref }] }`
- `{ kind:'mnemonics', items:[…] }`
- `{ kind:'recall', prompts:[…] }`

**Cheat-sheet panels:** `cheat: [{ title: 'L02 · Data-rate limits', html: '<ul><li>…</li></ul>' }]`.
- 2–3 dense panels per topic: formulas, conventions, key numbers, and the slide answers to remember.
- Wrap the key term or value in `<em class="k">…</em>`. The recall drill blanks exactly those spans.

### 3.4 Bank items (`bank/<topic>.js`) — see `bank/l04.js`
```js
{ id:'l02.q001', topic:'l02', type:'mcq'|'multi'|'tf'|'id'|'num'|'essay', pool:'A'|'B'|'diag'|undefined,
  q:'html', choices:[3–5], answer, accept:[synonyms for id], num:{ value, tol, rel, unit }, fix:'for false tf',
  rubric:[{ pts, point }], model:'html (essays)', explain:'html', ref:'L02 p30', diff:1|2|3, tags:[…], beyond? }
```
- **`mcq`** — `answer` is the choice index. **Vary the answer position:** across all your MCQs, no position should hold more than 35% of the answers.
- **`id`** — Identification: the question describes something; `answer` is the canonical term; `accept` lists synonyms and abbreviations. Matching ignores case, spaces, `- / . ,`.
- **`num`** — numeric answer: `num.unit` uses the canonical units `bps`, `baud`, `Hz`, `s`, `m`, `W`, `dB`, `''`, `°`, `sps`, `bits`, `B`. Students may type prefixes (k, M, µ, …).
- **`essay`** — `rubric` points must add up to **5** (the Form A/B essay weight); `model` is a full model answer.
- **`pool`:**
  - `'A'` / `'B'` = reserved for Mock Form A / B
  - `'diag'` = diagnostic
  - none = general (quick checks, practice, flashcards)
  - **Pool items never appear in quick checks.**

### 3.5 Generators (`js/gen/<topic>.js`) — see `js/gen/l04.js`
```js
KIT.gen.register('l02.capacity', { topic:'l02', title:'…', level:1|2|3, ref:'L02 pp29-33',
  samples:[ {…slide example params…} ],           // known-good params (selftest builds them)
  params: function (rng) { … return plainObject; },   // ONLY rng.next/int/pick/bits/chance/shuffle
  build: function (p) { return { prompt:'html', inputs:[…], steps:['html', …], hints:['…'], key: optionalFn }; } });
```
- **Input kinds:**
  - `{ id, kind:'num', label, answer, unit, tol?, rel?, accept?:[alt values], sig? }` — default: rel tol 1%.
  - `{ kind:'bits', answer:'10110' }`
  - `{ kind:'text', accept:['canonical', 'synonym'] }`
  - `{ kind:'choice', choices, answer }`
  - `{ kind:'tf', answer }`
  - `{ kind:'vector', answer:[…] }`
  - `{ kind:'grid', label, grid: GridSpec }` — draw a waveform:
    - `GridSpec = { bits:'0100', cellsPerBit:1|2|0.5, levels:[1,0,-1] /* allowed values, top→bottom */, init?:{ level }, answer:[…cell levels], acceptInverse?:true, alts?:[[…]] }`
    - `answer.length` must equal `bits.length × cellsPerBit`.
    - Set `acceptInverse: true` where polarity is only a convention (NRZ-L, Manchester, the starting level of NRZ-I, the first pulse of AMI).
  - `{ kind:'sketch', label, axes, model, rubric }` — freehand drawing of a wave (sine, ASK/FSK/PSK, quantized samples):
    - `axes = { x:[x0,x1], y:[y0,y1], yTicks?, ySub? /* dashed levels */, yFormat?, xTicks?, xFormat?, xLabel?, bits? /* one bit cell per x unit */ }`
    - `model = { series:[{ kind:'fn', fn, samples? } | { kind:'step', data:[[x,y]…], until? } | { kind:'points', data }] }` in axes units.
    - `rubric = [{ pts, point }]` (sum = the slot's points). Sketches are **self-checked**: practice overlays the model and the student marks it; the exam runner self-grades with the rubric; paper shows blank axes and the key shows the model.
    - Return `keyShowsAnswer: true` from `build()` when `key()` already draws the answer waveform (the plain answer grid is then skipped).
- **No calculator on the exam:** `params(rng)` must yield hand-computable numbers — powers of 2, SNR of 7/15/31/63/255, round rates, Δ of 2/4/5/10, carriers on whole kHz, 16-QAM phases only on the diagonals. Pick values backward from a clean answer.
- **Essays** may be answered by drawing and/or explaining: prompts invite a drawing, models may embed `<figure data-fig="…">` placeholders (hydrated everywhere a model is shown), and every essay renders with a drawing pad online and a dot-grid area on paper.
- **`steps`** are the full worked solution, one idea per step, with a slide ref chip on the step that uses a slide formula. Use `KIT.fmt.si(x, unit, 4)` for numbers with units.
- **The tests run every generator for 200 seeds.** Each seed must be valid, deterministic, and graded correct against its own answers; a perturbed answer must be graded wrong.

### 3.6 Figures, drawing helpers, visuals (`js/viz/<topic>-<name>.js`) — see `js/viz/l04-constellation.js`
- **Shared SVG helpers in `KIT.svg`:**
  - `wave(levels, { cellsPerBit, bits, levelSet, title, init, marks, blank, highlight })` — step waveforms
  - `plot({ x, y, series:[{ fn|data, kind:'line'|'step'|'points'|'stems'|'area', color: 1..8, label }], bands, hlines, vlines, xLabel, yLabel, equal })`
  - `timeline({ t, lanes:[{ label, spans:[{ t0, t1, label, color|kind }] }], arrows })`
  - `legend(items)`
  - Colors are series slots 1..8 (CSS vars); text uses text tokens. Don't hard-code colors.
- **`KIT.draw.<name> = function (…) { return svgOrElement; }`** — reusable drawings (also used by answer keys via a generator's `key()`).
- **`KIT.fig.register('<topic>.<name>', function (el, data) { el.appendChild(…); })`** — static figures.
  - Use them in notes as `<figure data-fig="l03a.linecode" data-scheme="nrzi" data-bits="01001110" data-caption="…"></figure>`.
  - `data-*` attributes arrive as strings in `data` (camelCased).
  - The built-in `wave` figure takes `data-levels="1,-1,0"`, `data-cpb`, `data-bits`, `data-set`, `data-title`.
- **Interactive visuals (Phase 2):** `KIT.viz.register('l03a.linecode', { topic, title, blurb, tier, mount(el, { static, params }) { …; return { set(p){}, destroy(){} }; } })`.
  - In static mode: render the default state, no listeners, no timers.
  - Validate typed input (charset + length caps); render user text with `textContent` only.

### 3.7 Slide-by-slide walkthroughs (`content/walk/<id>.js`)
The topic page's default **Slide by slide** view: every slide of the deck, in order, as a card with **The slide says / What it
means / Why it matters**, and a **★ Putting it together** recap after each part. One file per slide range, one owner per file.

| File | Topic | Deck slides (= PDF pages) |
|---|---|---|
| `l01` | l01 | L01 1–18 |
| `l02-1` / `l02-2` | l02 | L02 1–19 / 20–39 |
| `l03a-1` / `l03a-2` | l03a | L03 1–31 / 32–61 |
| `l03b` | l03b | L03 62–96 |
| `l04` | l04 | L04 1–31 |

```js
(function () {
  'use strict';
  KIT.walk({
    id: 'l03a-1', topic: 'l03a', range: [1, 31],
    parts: [                                             // follow the deck's own sections; parts are contiguous
      { title: 'Why line coding?', slides: [1, 9],
        items: [
          { n: 1, kind: 'admin', title: 'Title slide', says: 'Lecture 3 — Digital Transmission.' },
          { n: 4, title: 'Line coding', says: '<p>…</p>', means: '<p>…</p>', why: '<p>…</p>',
            tip: '<p>…</p>',                             // optional: trap, memory hook or drawing rule
            error: { says: '…', correct: '…' },          // optional: a mistake on this slide
            beyond: '<p>…</p>',                          // optional: textbook extra, shown with the "Beyond slides" badge
            example: { title, gen, params, slideAnswer, slideValue, input },   // optional worked slide example (§3.3)
                                                         //   or { title, html } for a non-numeric one
            ref: 'L03 p23' },                            // optional extra refs; the slide's own ref is automatic
          { n: [5, 6], title: '…', says: '…', means: '…', why: '…' }   // one card may cover slides that continue one idea
        ],
        together: '<p>…</p>' }                           // ★ Putting it together
    ],
    terms: [{ term: 'Signal element', def: 'The shortest unit of a digital signal …', alt: ['symbol'], ref: 'L03 p8' }],
    keyTerms: ['Line coding', 'Signal element', 'Baud rate'],
    faq: [{ q: 'Why does a long run of 0s break NRZ-L?', a: '<p>…</p>', ref: 'L03 p13' }]
  });
})();
```

**Rules the tests enforce** (`bash tools/test.sh walk`; a file that is not written yet shows as `todo`):
- **Coverage:** every slide of `range` exactly once, in order — the items' `n` run without gaps or overlaps, and parts are contiguous.
- **Content items** have `title`, `says`, `means` and `why` (HTML).
- **Admin items** (`kind: 'admin'`: title slide, agenda, section divider, "Questions?", thank-you, references, blank) have only a `title` and a one-line `says`.
- **Every part** has a `together` recap.
- **HTML and math:** HTML is balanced and every `$…$` parses (§3.8).
- **Figures and examples:**
  - every `<figure data-fig="…">` names a registered figure
  - every `example.gen` is a registered generator that builds, and its `slideValue` matches
- **`terms` are new:**
  - not already a glossary term or `alt` name in any `content/*.js`, and not defined in another walk file
  - defined in the file whose slides introduce them
  - definitions ≤ 60 words (they show in the side panel)
- **`keyTerms`** — 8–15 ★ must-know terms. Each names a glossary term, a walk term, or one of their `alt` names, from any topic.
- **`faq`** — 4–10 entries (aim for 5–8), each with a `ref`.
- **Depth:** on average at least 100 words per content slide (`says` + `means` + `why`).
  - Aim for 150–250.
  - Dense slides (tables, worked examples, waveforms) deserve more; continuation slides need less.

**What each field holds:**
- **`title`** — the slide's own heading, or a short description if it has none.
- **`says`** — what the slide literally shows, faithfully and compactly. No interpretation here.
  - its bullets, condensed
  - its table, reproduced (`<table class="tbl">`)
  - its figure, described: what is drawn, the labels, the values
  - its own terms and numbers, kept as they are
- **`means`** — break it down.
  - Define every term at first use, first in plain words and then precisely (`<b>term</b>`).
  - Walk through the figure or example step by step (`<ol>`), using concrete numbers that need no calculator.
  - Write equations as real math (§3.8).
  - Embed a figure (`<figure data-fig=…>`, §3.6) when the slide is visual and a figure exists for it.
- **`why`** — put it together.
  - what problem this slide solves
  - how it connects to earlier and later slides ("slide 12 showed …; slide 20 will …")
  - the exam angle: which question types it feeds (MCQ, identification, drawing, solving, essay) and the usual mistakes
- **`tip`** — one or two sentences.
- **`together`** — 120–250 words that turn the part's slides into one picture.
  - the chain problem → idea → mechanism → trade-off, often as a compact table
  - how it leads into the next part
- **`faq`** — questions a student or an exam actually asks ("What is the difference between …", "Why does …", "When do you use …").
  - Answer each in 1–4 sentences, with a ref.
  - Write them from the slides; never copy mock-exam items.

**Worked examples are visualized.**
- Whenever a generator covers a slide's worked example, use `example: { title, gen, params, … }`. Copy `{ gen, params }` from the matching `kind: 'example'` section in `content/<topic>.js` when there is one.
  - The page then shows the step-by-step solution together with an animation of it.
- For an example that no generator covers, use `{ title, html }` and put a visualization in the html: a `<figure data-fig=…>`, or a `<table class="tbl">` that walks through the steps.

**Color-code the quantities** (§3.8, `\c{role}{…}`) in every equation and worked step, so the reader can follow each variable from the formula into the numbers.
- A quantity keeps its role everywhere: in the formula, in prose (write it as math, `$\c{bw}{B}$`), and in the substituted numbers.

**Style:** as in §5.
- Concrete, no padding — every sentence carries information.
- Bold the key terms; use short paragraphs and lists.
- Use ref chips (`<span class="chip ref">L03 p23</span>`) for facts from other slides.
- Don't add callout `div`s: the card renders `tip`, `error` and `beyond` as callouts.
- Refer to slides as "slide 23" (deck slide = PDF page).

### 3.8 Math (`$…$`, rendered by `js/core/math.js`)
Equations are written in a small TeX subset and rendered as MathML: native in Chrome, offline, crisp in print. Math works in any authored HTML (notes, walkthroughs, formulas, FAQ, terms).

**Delimiters:** `$…$` is inline; `$$…$$` is display (its own line, larger).

**Supported:**
- `\frac{a}{b}`, `x_1`, `x^2`, `x_{\text{max}}^{2}`, `\sqrt{…}`, `\log_2 L`, `\log_{10}`, `\ln`, `\min`, `\max`
- Greek letters: `\Delta \lambda \theta \pi \mu`, …
- operators and relations: `\times \cdot \pm \le \ge \lt \gt \ne \approx \Rightarrow \to \infty`
- `360^\circ`, `\text{…}`, `\,` (thin space), `\quad`, `|x|`, and `{…}` groups

**Writing rules:**
- A run of letters is one upright name (`SNR`, `dB`). Separate single-letter variables with spaces or operators (`c N r`, `c \times N`).
- **Never write a raw `<`, `>` or `&` inside math**; use `\lt`, `\gt`, `\le`, `\ge`. The build rejects them.
- **Never use `$` for anything but math.** Write "USD" or "pesos" for money.
- Keep units outside the math (`$N = 8$ kbps`) or use `\text{ kbps}`.

**Color roles** — `\c{role}{…}` colors a quantity, and each quantity has one color across the whole course:

| Role | Color | Quantities |
|---|---|---|
| `rate` | blue | bit rate $N$, data rate, capacity $C$, $N_{\max}$ |
| `baud` | orange | signal (baud) rate $S$, sampling rate $f_s$ (samples per second play the part of signal elements) |
| `bw` (alias `freq`) | green | everything in **Hz**: bandwidth $B$, $B_{\min}$, frequency $f$, $f_{\max}$, carrier $f_c$, $\Delta f$ |
| `level` | violet | levels $L$, bits per signal element $r$, bits per sample $n_b$ |
| `snr` | magenta | SNR, $SNR_{\text{dB}}$, power $P$, dB values |
| `time` | amber | everything in **seconds**: period $T$, time $t$, delays, propagation and transmission time |

The rule of thumb is that **color follows the unit**: bps is blue, baud and samples/s are orange, Hz is green, levels and bits-per are violet, power, SNR and dB are magenta, and seconds are amber.

- Color a quantity in the formula, and again when its number is substituted, so a reader sees where each number goes.
  - `$\c{rate}{N} = 2 \times \c{bw}{3000} \times \log_2 \c{level}{4} = \c{rate}{12,000}$ bps`
  - Thousands separators inside numbers (`12,000`) work as written.
- Leave constants and one-off symbols uncolored, such as the case factor $c$ and $d$.
- In prose, write a colored quantity as math: `the bandwidth $\c{bw}{B}$`.

**Examples:**
- `$S = c \times N \times \frac{1}{r}$` → colored: `$\c{baud}{S} = c \times \c{rate}{N} \times \frac{1}{\c{level}{r}}$`
- `$$C = B \log_2 (1 + SNR)$$`
- `$N_{\max} = 2B \log_2 L$`
- `$SNR_{\text{dB}} = 10 \log_{10} SNR$`
- `$\Delta = \frac{V_{\max} - V_{\min}}{L}$`

### 3.9 Worked-example animations (`js/anim/<topic>.js`) and color-coded solutions (`js/gen/<topic>.js`)
Every worked example shows an **animation of its solution** between the question and the steps.
- "Reveal next step" moves the animation to that step's frame.
- Play advances it on its own.
- Print shows nothing (`no-print`), because the answer key already shows the answer.

**Golden patterns:**
- **`js/anim/l03a.js`:**
  - `l03a.draw` is a custom picture per frame: a waveform drawn bit by bit, with the reason for each level.
  - `l03a.baud` uses `KIT.anim.eqFrames`: the colored solution written line by line under a diagram.
- **`js/gen/l03a.js` → `l03a.baud`:** color-coded prompt, steps and `colors`.

**The animation contract:**
```js
KIT.anim.register('l02.nyquist', function (p, prob) {   // p = generator params, prob = its built problem
  return [{ caption: 'html', step: 0, render: function () { return svgOrElement; } }, …];   // ≥ 2 frames
});
// or, for a formula-driven solution:
return KIT.anim.eqFrames([{ tex: '\\c{rate}{N} = …', caption: '…', step: 1, figure: function () { return svg; } }, …]);
```
- **Frames must be pure until `render()` runs.**
  - Build captions from `p` and `prob` and from `KIT.calc.*`, the same source the answer uses. Never compute an answer a second way.
  - `render()` builds DOM.
  - No timers, no listeners and no randomness: the player owns playback.
- **`step` is the index of the solution step a frame illustrates.** Steps never decrease across frames, and the last frame shows the complete result.
- **Draw with `KIT.svg.wave/plot/timeline/S`** and the existing `KIT.draw.*`/figure helpers.
  - **A new piece in a frame gets class `anim-new`**, which fades it in. A wave segment can use `focus: { from, to }` instead, which draws it in.
- **Colors:** a shape that stands for a quantity gets class `v1`…`v6` (the role slot) and `fill`/`stroke: currentColor`. Hover-to-connect then lights it up together with the same quantity in the prompt, formula and steps.
- **Captions** say what happens in that frame in one or two sentences, with the numbers.

**Color-coded solutions** (the same rules apply to every generator that has a formula):
- **Prompt:** wrap each given value as `KIT.fmt.q(role, value, unit)`.
- **Steps, in order:**
  1. the formula in color: `$\c{rate}{N} = 2 \times \c{bw}{B} \times \log_2 \c{level}{L}$`
  2. the substitution, with every number in its quantity's color: `KIT.fmt.tq(role, value, unit)` inside `$…$`
  3. the result in the color of the quantity found
- **`colors: [{ role, tex, name }]` in `build()`'s return** is the "Track:" key above the example. Every role listed must appear colored in the prompt or steps.
- **Tests:** `test/colors.test.js` and `test/anim.test.js` cover every sample and 25 seeds.
  - A generator not converted yet shows as `todo`.
  - Once it has `colors`, it must pass.

### 3.10 The cram sheet (`content/cram.js`, the Cram tab)
The page that lets a student who fell behind catch up with a decent understanding. **Concepts come first** and **the computational parts come at the bottom.**

```js
KIT.cram({
  intro: '<p>…how to use this page…</p>',
  top: [{ topic: 'l03a', html: 'one-sentence must-know', ref: 'L03 p23' }, …],    // 8–20: the whole course's essentials, most important first
  lectures: [                                                                       // all five, in lecture order: l01, l02, l03a, l03b, l04
    { topic: 'l01', big: '<p>the big picture in 4–6 sentences</p>',
      ideas: [{ title, html, ref, star: true }, …],                                 // 6–12 ideas, the most important first; star the exam-critical ones
      mixups: [{ a: 'NRZ-L', b: 'NRZ-I', html: 'the difference in 1–2 sentences', ref }] }   // 2–6 per lecture
  ],
  compute: [                                                                        // the solving types, per lecture
    { topic: 'l02', recipes: [{ title, when: 'the cue in the question', formulas: ['l02.nyquist'],
        how: 'the recipe, in colored math', example: 'a slide-sized worked example in colored math', ref }] }
  ],
  tips: ['mental-math tip (no calculator)', …]
});
```

**Rules:**
- **Ideas** explain, not just state. Each is 60–150 words: what it is, why it exists, and how it shows up on the exam.
  - Use colored math (§3.8) and small figures (`<figure data-fig=…>`) where a picture is clearer.
- **Every** `sheet: true` formula appears in at least one recipe.
- **Every ref is a real slide.** The test checks the schema, the lecture order and the formula coverage.

## 4. Accuracy rules (the most important section)
1. **The slides are the answer source.** Follow the conventions in the digest exactly.
   - L03: NRZ-L figure = 0 → +V, 1 → −V. NRZ-I = a 1 inverts, starting level +.
   - Manchester = 0 high→low, 1 low→high.
   - Differential Manchester = always a mid-bit transition; a 0 has a transition at the start; the level before the first bit is +.
   - AMI = 0 → 0 V, 1s alternate starting +. Pseudoternary is the reverse of AMI.
   - 2B1Q uses the transition table with a positive starting level.
   - MLT-3 starts at 0 with last nonzero level −V.
   - B8ZS = 000VB0VB. HDB3 = 000V if the number of nonzero pulses since the last substitution is odd, B00V if even.
2. **Where the slides contradict themselves or are wrong**, add a `slideErrors` entry and an in-notes `slide-error` callout (“Slide says / Correct”). Answers that follow the slide's intent are accepted.
3. **Material not on the slides** (Forouzan textbook extras) is allowed only if it helps, and must be tagged `beyond: true` (notes, formulas, questions) or carry the ref `Forouzan`. Keep it small.
4. **Every fact carries a ref** (`L02 p21`, `L03 pp17-30`; separate several refs with `;`).
5. **The handwritten marks on L03 are assessment hints:**
   - "Main Section" 1 = line coding, 2 = data vs signal rate, 3 = synchronization, 7 = PCM.
   - "Sub section" on the examples.
   - "replicate" on the clock-drift figure (p13).
   - **"not included" next to pseudoternary (p32)**, so cover pseudoternary briefly and give it low priority.
6. **Never invent slide content.** If unsure, cite what the slide literally says.

## 5. Style
- **Exam-focused and concise.** Short paragraphs, bullets, tables, bold key terms. Explain *why*, not just *what*.
- **Every topic needs:**
  - an intuition section with an analogy
  - worked slide examples
  - traps
  - mnemonics
  - recall prompts
  - glossary terms (these become flashcards)
  - cheat panels
- **Use "you" sparingly.** No emojis except the callout labels used in L04 (💡 is set by the renderer).

## 6. Verify before you report (definition of done)
```bash
cd StudyKit
export KIT_OUT="$(mktemp -d)"     # scratch folder for screenshots and selftest output
bash tools/test.sh                 # full node suite → must end with "fail 0"
bash tools/selftest.sh             # headless Chrome → "SELFTEST DONE pass=N fail=0"
bash tools/shot.sh '#/topic/l02?theme=light' l02 1280,2600   # then view the PNG and fix layout problems
```
Your report must list:
- the files you changed
- the test and selftest result lines
- your Form A / Form B / diagnostic item ids per section, and the exact `{ gen, params }` for each of your exam problem slots
- anything you could not do, or any problem you noticed in a file you don't own
