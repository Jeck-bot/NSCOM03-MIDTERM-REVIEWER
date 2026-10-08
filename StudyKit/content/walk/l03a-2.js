/* Slide-by-slide walkthrough: L03 slides 32–61 (topic l03a). Contract: docs/AUTHORING.md §3.7. */
(function () {
  'use strict';
  function r(p) { return ' <span class="chip ref">' + p + '</span>'; }
  function fig(scheme, bits, cap) { return '<figure data-fig="l03a.linecode" data-scheme="' + scheme + '" data-bits="' + bits + '" data-caption="' + cap + '"></figure>'; }

  KIT.walk({
    id: 'l03a-2', topic: 'l03a', range: [32, 61],
    parts: [

      /* ================= PART 1: bipolar ================= */
      { title: 'Bipolar schemes: AMI and pseudoternary', slides: [32, 33],
        items: [
          { n: 32, title: 'Bipolar schemes: AMI and Pseudoternary',
            says: '<p>A figure slide. The bit stream <span class="mono">0 1 0 0 1 0</span> is drawn twice (Amplitude against Time, dashed bit boundaries):</p>' +
              '<ul><li><b>AMI</b>: 0 V for every 0; the first 1 is a positive pulse and the second 1 a negative pulse → <span class="mono">0 + 0 0 − 0</span>.</li>' +
              '<li><b>Pseudoternary</b>: the first 0 is positive, the 1 is 0 V, then the 0s are negative and positive → <span class="mono">+ 0 − + 0 −</span>.</li></ul>' +
              '<p>On the right: a yellow box “r = 1, S<sub>ave</sub> = ½N” and a bandwidth plot (power P against f/N). The curve is 0 at f = 0, peaks near f/N = 0.5 and is back to 0 near f/N = 1. A handwritten bracket around “Pseudoternary” is annotated <b>“not included”</b>.</p>',
            means: '<p><b>Bipolar</b> means three voltage levels (+V, 0, −V) where one data value always sits at 0 V and the other value alternates between +V and −V' + r('L03 p31') + '. <b>AMI</b> (alternate mark inversion) calls a 1 a “mark”: successive marks are <i>inverted</i>, that is, they alternate in polarity.</p>' +
              '<p>Drawing AMI for 010010, one bit at a time:</p><ol>' +
              '<li>0 → 0 V.</li><li>1 (the first 1) → +V; the first pulse is positive in the figure.</li><li>0, 0 → 0 V, 0 V.</li>' +
              '<li>1 (the second 1) → −V, because it must alternate with the +V before it.</li><li>0 → 0 V.</li></ol>' +
              '<p>Result: <span class="mono">0 + 0 0 − 0</span>. <b>Pseudoternary</b> swaps the two roles: the 1 is 0 V and the 0s alternate, so the same stream gives <span class="mono">+ 0 − + 0 −</span>.</p>' +
              fig('ami,pseudoternary', '010010', 'Slide 32: 010010 in AMI (first 1 positive) and pseudoternary (first 0 positive).') +
              '<p>The box says <b>r = 1</b>: one data element rides on one signal element. With the average case factor c = ½:</p>' +
              '$$\\c{baud}{S} = c \\times \\c{rate}{N} \\times \\frac{1}{\\c{level}{r}} = \\frac{1}{2} \\times \\c{rate}{N} \\times \\frac{1}{\\c{level}{1}} = \\frac{\\c{rate}{N}}{2}$$' +
              '<p>For example $\\c{rate}{N} = \\c{rate}{1\\text{ Mbps}}$ gives $\\c{baud}{S} = \\c{baud}{500\\text{ kbaud}}$ and $\\c{bw}{B_{\\min}} = \\c{bw}{500\\text{ kHz}}$, the same as NRZ-I' + r('L03 p25') + '. The spectrum has <i>no power at f = 0</i>: the positive and negative pulses cancel, which is why bipolar coding has no DC component (slide 33).</p>' +
              '<p>The handwritten “not included” means pseudoternary will not be assessed: know AMI well and simply recognise pseudoternary as its mirror image.</p>',
            why: '<p>NRZ was left with a DC component and baseline wandering' + r('L03 p24') + ', and RZ and Manchester fixed synchronization only by doubling the bandwidth' + r('L03 p30') + '. Bipolar coding attacks the DC problem differently: alternating the pulse polarity keeps the running average at 0 while the bandwidth stays at the NRZ value N/2. The price is a third voltage level.</p>' +
              '<p>Slide 33 lists the properties; slides 57–61 (B8ZS and HDB3) repair the one weakness that remains, long runs of 0s, by building directly on this AMI waveform.</p>' +
              '<p><b>Exam angle:</b> hand-drawing AMI is a likely drawing item. Typical mistakes: alternating the polarity on every <i>bit</i> instead of every <i>1</i>, giving the 0s a pulse, or mixing up AMI and pseudoternary. Write your convention (first 1 positive) beside the drawing.</p>',
            tip: '<p>Count only the 1s: the 1st, 3rd, 5th … are +V and the 2nd, 4th, 6th … are −V. Every 0 stays on the axis. Pseudoternary is the same idea with the roles of 0 and 1 swapped (low priority: “not included”).</p>',
            example: { title: 'Draw AMI and pseudoternary (slide 32)', gen: 'l03a.draw', params: { bits: '010010', schemes: ['ami', 'pseudoternary'] },
              slideAnswer: 'AMI 0 + 0 0 − 0 · pseudoternary + 0 − + 0 −' } },

          { n: 33, title: 'Notes on bipolar encoding scheme',
            says: '<ul><li>It is a better alternative to NRZ.</li><li>Has no DC component or baseline wandering.</li>' +
              '<li>Has no self synchronization because long runs of “0”s result in no signal transitions.</li><li>No error detection.</li></ul>',
            means: '<p>Reading each bullet against the AMI waveform of slide 32:</p><ul>' +
              '<li><b>A better alternative to NRZ.</b> It keeps the NRZ-type rate (r = 1, S<sub>ave</sub> = N/2) but removes the DC problem that NRZ-L and NRZ-I have.</li>' +
              '<li><b>No DC component or baseline wandering.</b> Every second 1 is negative, so the pulses cancel and the receiver’s running average (its baseline' + r('L03 p11') + ') stays at 0 however many 1s arrive. A string of 1s even produces a lively + − + − signal.</li>' +
              '<li><b>No self-synchronization.</b> A 0 is simply 0 V. A long run of 0s is a flat line on the axis with no edge for the receiver to line its clock up on; slide 13 showed what a drifting clock does to such a stream.</li>' +
              '<li><b>No error detection.</b> The slide states it plainly, so keep it as the examinable answer.</li></ul>' +
              '<table class="tbl compact"><thead><tr><th>Problem</th><th>NRZ-L (slides 24, 46)</th><th>AMI (slide 33)</th></tr></thead><tbody>' +
              '<tr><td>DC component and baseline wandering</td><td>yes</td><td>no</td></tr>' +
              '<tr><td>Synchronization lost on</td><td>long 0s <i>or</i> long 1s</td><td>long 0s only</td></tr>' +
              '<tr><td>Error detection</td><td>no</td><td>no</td></tr></tbody></table>',
            why: '<p>AMI cures the DC problem and half of the synchronization problem (every 1 is a transition) but leaves long runs of 0s. The deck answers that weakness in three ways: more levels per symbol (multilevel, slides 34–42), forced transitions (multitransition, slides 43–45) and substituting a violation pattern for the zero run (scrambling, slides 57–61).</p>' +
              '<p><b>Exam angle:</b> a classic MCQ is “which code has no DC component but no self-synchronization for long runs of 0s?” (AMI). Be careful with the slide-46 summary table, which wrongly marks AMI with “DC”; slide 33 is the authority.</p>',
            tip: '<p>AMI in one line: the 1s cancel (no DC), the 0s are silent (no sync). All of its trouble comes from the zeros.</p>' }
        ],
        together: '<p><b>Bipolar coding in one picture.</b> AMI keeps the 0s at 0 V and alternates the polarity of the 1s, so the signal averages to zero and the spectrum is empty at f = 0.</p>' +
          '<table class="tbl compact"><thead><tr><th>Problem (earlier slides)</th><th>Idea</th><th>Mechanism</th><th>Trade-off</th></tr></thead><tbody>' +
          '<tr><td>NRZ has DC and baseline wandering</td><td>cancel the 1s against each other</td><td>1s alternate +V, −V; 0 = 0 V</td><td>three levels instead of two</td></tr>' +
          '<tr><td>Manchester doubled the bandwidth</td><td>keep S = N/2</td><td>r = 1, c = ½: $\\c{baud}{S} = \\frac{\\c{rate}{N}}{2}$</td><td>still no sync on long 0s</td></tr></tbody></table>' +
          '<p>The remaining flaw, long runs of 0s, is the starting point for the rest of this part of the deck. Slides 34–42 attack the baud rate directly by letting each signal element carry several bits (multilevel coding); slides 43–45 force transitions in a smarter way (MLT-3); slides 47–56 add redundancy before line coding (block coding); and slides 57–61 return to AMI with a patch for the zero runs (scrambling).</p>' },

      /* ================= PART 2: multilevel ================= */
      { title: 'Multilevel schemes: mBnL, 2B1Q, 8B6T, 4D-PAM5', slides: [34, 42],
        items: [
          { n: 34, title: 'Multilevel schemes',
            says: '<ul><li>In these schemes we increase the number of data bits per symbol, thereby increasing the bit rate.</li>' +
              '<li>Since we are dealing with binary data we only have 2 types of data element, a 1 or a 0.</li>' +
              '<li>We can combine the 2 data elements into a pattern of “m” elements to create “2<sup>m</sup>” symbols (printed “2m”).</li>' +
              '<li>If we have L signal levels, we can use “n” signal elements to create L<sup>n</sup> signal elements (printed “Ln”).</li></ul>',
            means: '<p>Every code so far gave each bit its own signal element (r ≤ 1). A <b>multilevel</b> scheme packs several bits into one signal element by using more than two voltage levels, so the bit rate rises without raising the baud rate.</p>' +
              '<p>The slide builds the idea with two counts:</p><ul>' +
              '<li><b>Data side.</b> Binary data has only two data elements, 1 and 0. A pattern of $\\c{level}{m}$ of them forms one of $2^{\\c{level}{m}}$ different <b>symbols</b>: m = 2 gives 4 (00, 01, 10, 11), m = 3 gives 8, m = 8 gives 256.</li>' +
              '<li><b>Signal side.</b> With $\\c{level}{L}$ voltage levels, a pattern of $\\c{level}{n}$ signal elements forms one of $\\c{level}{L}^{\\c{level}{n}}$ different <b>signal patterns</b>: L = 3 and n = 2 gives 9 (−−, −0, −+, 0−, 00, 0+, +−, +0, ++); L = 4 and n = 1 gives 4.</li></ul>' +
              '<p>A multilevel code is a lookup table that maps every data pattern onto its own signal pattern. The gain is the ratio $\\c{level}{r} = \\frac{\\c{level}{m}}{\\c{level}{n}}$ (data bits per signal element), which shrinks the baud rate in $\\c{baud}{S} = c \\times \\c{rate}{N} \\times \\frac{1}{\\c{level}{r}}$. For example, at $\\c{rate}{N} = \\c{rate}{8\\text{ Mbps}}$ and c = ½, an r = 1 code needs $\\c{baud}{S} = \\frac{1}{2} \\times \\c{rate}{8} \\times \\frac{1}{\\c{level}{1}} = \\c{baud}{4\\text{ Mbaud}}$, while an r = 2 code needs only $\\c{baud}{S} = \\frac{1}{2} \\times \\c{rate}{8} \\times \\frac{1}{\\c{level}{2}} = \\c{baud}{2\\text{ Mbaud}}$.</p>',
            why: '<p>Slides 3–8 set the goal of a high data rate with a low baud rate' + r('L03 p6') + '; every scheme so far had r ≤ 1, and this is the first family with r &gt; 1 (the cases r = 2 and r = 4/3 of slide 7). Slides 35–37 state the rule that makes such a code possible, and slides 38–42 give three named examples. A general trade-off, not stated on this slide: levels packed into the same voltage range sit closer together, so noise matters more, which is why the next slide prefers “more distinct” signal patterns.</p>' +
              '<p><b>Exam angle:</b> computing r = m/n for a named code and then S or B. A frequent slip is to read 2<sup>m</sup> as 2 × m; it is a power of two.</p>',
            error: { says: 'The bullets print “2m symbols” and “Ln signal elements” (the superscripts are lost).', correct: 'They mean 2<sup>m</sup> symbols and L<sup>n</sup> signal patterns; slide 36 prints the formula correctly.' } },

          { n: [35, 36], title: 'Code: 2^m versus L^n, and the mBnL note',
            says: '<p><b>Slide 35 (“Code”)</b></p><ul><li>Now we have 2<sup>m</sup> symbols and L<sup>n</sup> signals (printed “2m”, “Ln”).</li>' +
              '<li>If 2<sup>m</sup> &gt; L<sup>n</sup> we cannot represent the data elements: we do not have enough signals.</li>' +
              '<li>If 2<sup>m</sup> = L<sup>n</sup> we have an exact mapping of one symbol onto one signal.</li>' +
              '<li>If 2<sup>m</sup> &lt; L<sup>n</sup> we have more signals than symbols and can choose the signals that are more distinct, giving better noise immunity and error detection, as some signals are not valid.</li></ul>' +
              '<p><b>Slide 36 (“Note” box)</b>: in mBnL schemes, a pattern of <i>m</i> data elements is encoded as a pattern of <i>n</i> signal elements in which 2<sup>m</sup> ≤ L<sup>n</sup>.</p>',
            means: '<p>The three cases of slide 35 are the three possible outcomes of comparing the count of data patterns with the count of signal patterns:</p>' +
              '<table class="tbl compact"><thead><tr><th>Case</th><th>Meaning</th><th>Example</th></tr></thead><tbody>' +
              '<tr><td>$2^{\\c{level}{m}} \\gt \\c{level}{L}^{\\c{level}{n}}$</td><td>too few signal patterns: some data cannot be sent, so the code is <b>impossible</b></td><td>3 bits on one 4-level element: 8 &gt; 4 (an illustration of mine, not on the slide)</td></tr>' +
              '<tr><td>$2^{\\c{level}{m}} = \\c{level}{L}^{\\c{level}{n}}$</td><td><b>exact mapping</b>, no spare patterns</td><td>2B1Q: $2^{\\c{level}{2}} = 4 = \\c{level}{4}^{\\c{level}{1}}$</td></tr>' +
              '<tr><td>$2^{\\c{level}{m}} \\lt \\c{level}{L}^{\\c{level}{n}}$</td><td>spare patterns: <b>redundancy</b></td><td>8B6T: $2^{\\c{level}{8}} = 256 \\lt \\c{level}{3}^{\\c{level}{6}} = 729$</td></tr></tbody></table>' +
              '<p>The Note box combines the last two cases into the single test for a valid mBnL code:</p>' +
              '$$2^{\\c{level}{m}} \\le \\c{level}{L}^{\\c{level}{n}}$$' +
              '<p>When there are spare patterns, the number left unused is $\\c{level}{L}^{\\c{level}{n}} - 2^{\\c{level}{m}}$: for 8B6T that is 729 − 256 = 473. The slide gives two uses for the spare patterns. First, the designer can choose the patterns that are <i>most distinct</i> from each other, so a little noise is less likely to turn one valid pattern into another. Second, the unused patterns are <i>not valid</i>: if one arrives, the receiver knows an error happened (error detection).</p>',
            why: '<p>The inequality is the entry test for every multilevel code, and a natural MCQ or short-solving item: “is 3B2T valid?” (8 ≤ 9, yes) or “how many patterns go unused?”. Mistakes to avoid: reversing the inequality, swapping m and n, and computing L × n instead of L<sup>n</sup>.</p>' +
              '<p>The idea of spare patterns is the first appearance of <b>redundancy</b>; it returns on slide 39 (avoiding DC), in 8B6T on slide 40, and in block coding on slide 53, where 32 − 16 = 16 spare words appear. Slide 37 now gives the naming scheme.</p>',
            tip: '<p>Say it in words: “the data patterns must fit inside the signal patterns”. Equality is allowed.</p>' },

          { n: 37, title: 'Representing multilevel codes',
            says: '<ul><li>We use the notation mBnL, where m is the length of the binary pattern, B represents binary data, n represents the length of the signal pattern and L the number of levels.</li>' +
              '<li>L = B for binary, L = T for 3 (ternary), L = Q for 4 (quaternary).</li></ul>',
            means: '<p>Read an mBnL name from left to right. In <b>8B6T</b>: 8 data bits (m = 8), B for binary data, 6 signal elements (n = 6), T for ternary (L = 3 levels).</p>' +
              '<table class="tbl compact"><thead><tr><th>Letter</th><th>Levels L</th><th>Name</th><th>Code on the slides</th></tr></thead><tbody>' +
              '<tr><td>B</td><td>2</td><td>binary</td><td>(any NRZ-type code)</td></tr><tr><td>T</td><td>3</td><td>ternary</td><td>8B6T</td></tr><tr><td>Q</td><td>4</td><td>quaternary</td><td>2B1Q</td></tr></tbody></table>' +
              '<p>The letter B appears in two roles: the middle B means “binary data”, and a final B would mean “2 levels”. From the name you can also read the ratio $\\c{level}{r} = \\frac{\\c{level}{m}}{\\c{level}{n}}$: 2B1Q has $\\c{level}{r} = \\frac{2}{1} = 2$ and 8B6T has $\\c{level}{r} = \\frac{8}{6} = \\frac{4}{3}$, the r = 4/3 case of slide 7.</p>' +
              '<p>The worked example checks whether 8B6T is a valid code:</p><ol>' +
              '<li>Name → m = 8, n = 6, T → L = 3.</li>' +
              '<li>Data patterns: $2^{\\c{level}{8}} = 256$.</li>' +
              '<li>Signal patterns: $\\c{level}{3}^{\\c{level}{6}} = 729$ (3² = 9, 3⁴ = 81, 3⁶ = 9 × 81 = 729).</li>' +
              '<li>Compare: $256 \\le 729$, so the code is valid, with $729 - 256 = 473$ unused patterns.</li></ol>',
            why: '<p>Reading the notation is an easy Identification or MCQ item (“what do the 8, the 6 and the T in 8B6T stand for?”). Do not confuse it with block-coding notation: <b>mBnL</b> (no slash) maps bits to <i>signal levels</i> and the code names 2B1Q and 8B6T are written without a slash, while <b>mB/nB</b> (slash, slide 48) maps bits to <i>bits</i>, as in 4B/5B.</p>' +
              '<p>Slides 38, 40 and 42 now apply the notation: 2B1Q (2 bits → one of 4 levels), 8B6T (8 bits → six ternary elements) and 4D-PAM5, which uses a different name pattern because it spreads the signal over several links (slide 41).</p>',
            tip: '<p>m and n count <i>patterns’ lengths</i> (bits and signal elements); L counts <i>levels</i>. The exponent n belongs to L, the exponent m belongs to 2.</p>',
            example: { title: 'Is 8B6T a valid mBnL code?', gen: 'l03a.mbnl', params: { m: 8, n: 6, L: 3 },
              slideAnswer: '2⁸ = 256 ≤ 3⁶ = 729 → valid, with 473 unused patterns' } },

          { n: 38, title: 'Multilevel: 2B1Q scheme',
            says: '<p>Top: a <b>transition table</b>.</p>' +
              '<table class="tbl compact"><thead><tr><th>Next bits</th><th>Previous level positive → next level</th><th>Previous level negative → next level</th></tr></thead><tbody>' +
              '<tr><td class="mono">00</td><td>+1</td><td>−1</td></tr><tr><td class="mono">01</td><td>+3</td><td>−3</td></tr><tr><td class="mono">10</td><td>−1</td><td>+1</td></tr><tr><td class="mono">11</td><td>−3</td><td>+3</td></tr></tbody></table>' +
              '<p>Bottom left: the stream <span class="mono">00 11 01 10 01</span> as a waveform on levels +3, +1, −1, −3: <b>+1, −3, −3, +1, +3</b>, “assuming positive original level”. Bottom right: a yellow box “r = ½, S<sub>ave</sub> = N/4” and a bandwidth plot that peaks at f = 0 (P = 1), falls to 0 at f/N = ½ and has a small bump up to f/N = 1.</p>',
            means: '<p><b>2B1Q</b> = 2 binary bits → 1 quaternary level (m = 2, n = 1, L = 4): each <i>pair</i> of bits is sent as one of four levels, ±1 and ±3. Which level depends on the pair <i>and</i> on the sign of the previous level, which is what the transition table encodes. The slide assumes the starting (previous) level is positive.</p>' +
              '<p>Encoding 00 11 01 10 01:</p><ol>' +
              '<li>00 after + (assumed start) → <b>+1</b>.</li>' +
              '<li>11 after +1 (positive) → <b>−3</b>.</li>' +
              '<li>01 after −3 (negative) → <b>−3</b>.</li>' +
              '<li>10 after −3 (negative) → <b>+1</b>.</li>' +
              '<li>01 after +1 (positive) → <b>+3</b>.</li></ol>' +
              fig('2b1q', '0011011001', 'Slide 38: 00 11 01 10 01 → +1, −3, −3, +1, +3 (positive starting level).') +
              '<p>Signal rate: with 2 bits per level, $\\c{level}{r} = 2$, so</p>' +
              '$$\\c{baud}{S} = c \\times \\c{rate}{N} \\times \\frac{1}{\\c{level}{r}} = \\frac{1}{2} \\times \\c{rate}{N} \\times \\frac{1}{\\c{level}{2}} = \\frac{\\c{rate}{N}}{4}$$' +
              '<p>At $\\c{rate}{N} = \\c{rate}{8\\text{ Mbps}}$ that is $\\c{baud}{S} = \\c{baud}{2\\text{ Mbaud}}$, so $\\c{bw}{B_{\\min}} = \\c{bw}{2\\text{ MHz}}$, a quarter of the bit rate. The bandwidth plot peaks at f = 0, meaning a lot of energy at zero frequency: a DC component (slide 39).</p>',
            why: '<p>2B1Q is the first code whose r exceeds 1: four levels carry two bits each, halving the baud rate of an NRZ code (S = N/4 against N/2). The cost is that it uses all 4 patterns of 4¹ (no redundancy), so there is no error detection and DC is present (slide 39); the summary table adds “no self-synchronization for long same double bits”' + r('L03 p46') + '.</p>' +
              '<p><b>Exam angle:</b> drawing 2B1Q from a bit string and the table, and naming S<sub>avg</sub> = N/4. Typical slips: using the previous level’s <i>magnitude</i> instead of its sign, starting from a negative level, or reading the wrong column of the table.</p>',
            tip: '<p>Memory hook (derived from the table): the <b>first bit</b> decides the sign (0 = keep the previous sign, 1 = flip it) and the <b>second bit</b> decides the size (0 → 1, 1 → 3).</p>',
            error: { says: 'The yellow box reads “r = ½”.', correct: 'r = 2: two data bits ride on each level (½ is 1/r). With r = 2 the formula gives S<sub>avg</sub> = ½ × N × ½ = N/4, which is what the same box prints.' },
            example: { title: 'Draw 2B1Q (slide 38)', gen: 'l03a.draw', params: { bits: '0011011001', schemes: ['2b1q'] },
              slideAnswer: '+1 −3 −3 +1 +3 (positive starting level)' } },

          { n: 39, title: 'Redundancy',
            says: '<ul><li>In the 2B1Q scheme we have no redundancy and we see that a DC component is present.</li>' +
              '<li>If we use a code with redundancy we can decide to use only “0” or “+” weighted codes (more +’s than −’s in the signal element) and invert any code that would create a DC component. E.g. ‘+00++−’ → ‘−00−−+’.</li>' +
              '<li>The receiver will know when it receives a “−” weighted code that it should invert it, as it does not represent any valid symbol.</li></ul>',
            means: '<p><b>Redundancy</b> here means signal patterns beyond what the data strictly needs (slide 35’s case 2<sup>m</sup> &lt; L<sup>n</sup>). 2B1Q has none: 2² = 4 data patterns use all 4¹ = 4 levels, so the designer has no freedom to avoid anything, and the spectrum of slide 38 shows the DC component that results.</p>' +
              '<p>With spare patterns the designer can control the code’s <b>weight</b>, the number of +’s minus the number of −’s in a pattern. The rules on the slide:</p><ol>' +
              '<li>Allow only patterns of weight 0 or positive (“0” or “+” weighted).</li>' +
              '<li>When sending the next pattern would push the running total away from zero (a DC build-up), send its <b>inverse</b> instead (every + becomes −, every − becomes +).</li>' +
              '<li>The receiver sees a negative-weight pattern. None of the valid symbols has negative weight, so it knows the pattern was inverted and inverts it back.</li></ol>' +
              '<table class="tbl compact"><thead><tr><th>Pattern</th><th>+ count</th><th>− count</th><th>Weight</th></tr></thead><tbody>' +
              '<tr><td class="mono">+00++−</td><td>3</td><td>1</td><td>+2</td></tr><tr><td class="mono">−00−−+</td><td>1</td><td>3</td><td>−2</td></tr></tbody></table>' +
              '<p>Inverting turns weight +2 into −2: sent after a +2 pattern it cancels it, keeping the running average at 0. Slide 40 shows exactly this happening to the third 8B6T pattern.</p>',
            why: '<p>This slide explains <i>why</i> redundancy is worth paying for: spare patterns are what let a code dodge the DC component, on top of the error detection they enable (slide 35). It is the bridge from the exactly-filled 2B1Q to the redundant 8B6T, and the same trade (more symbols than data, choose the friendly ones) is made again with bits in block coding (slides 48–56).</p>' +
              '<p><b>Exam angle:</b> an essay or Identification item such as “how can a code with redundancy avoid a DC component?” Answer: restrict to 0/+ weighted patterns, invert when needed, and let the receiver recognise a − weighted pattern as an inverted one.</p>',
            tip: '<p>“Weight” is just the sum of the levels: +00++− = +1+0+0+1+1−1 = +2. The inverse always has the opposite weight.</p>' },

          { n: 40, title: 'Multilevel: 8B6T scheme',
            says: '<p>One waveform on levels +V, 0, −V, divided by dashed lines into three groups of data bits, each with its six ternary symbols underneath:</p>' +
              '<table class="tbl compact"><thead><tr><th>Data bits</th><th>Code</th></tr></thead><tbody>' +
              '<tr><td class="mono">00010001</td><td class="mono">−0−0++</td></tr><tr><td class="mono">01010011</td><td class="mono">−+−++0</td></tr><tr><td class="mono">01010000</td><td class="mono">+−−+0+ (yellow box “Inverted pattern”: the waveform drawn is −++−0−)</td></tr></tbody></table>',
            means: '<p><b>8B6T</b> sends each group of 8 data bits as 6 ternary signal elements (levels −V, 0, +V). 2⁸ = 256 data patterns fit into 3⁶ = 729 signal patterns, so there are 473 spare patterns to choose from (slide 36).</p>' +
              '<p>Slide 39’s weights, computed from the three patterns of the slide:</p>' +
              '<table class="tbl compact"><thead><tr><th>Bits</th><th>Code</th><th>Weight</th><th>Sent</th><th>Running total</th></tr></thead><tbody>' +
              '<tr><td class="mono">00010001</td><td class="mono">−0−0++</td><td>0</td><td class="mono">−0−0++</td><td>0</td></tr>' +
              '<tr><td class="mono">01010011</td><td class="mono">−+−++0</td><td>+1</td><td class="mono">−+−++0</td><td>+1</td></tr>' +
              '<tr><td class="mono">01010000</td><td class="mono">+−−+0+</td><td>+1</td><td class="mono">−++−0−</td><td>0</td></tr></tbody></table>' +
              '<p>Sending the third code as it stands would take the running total to +2. The encoder sends its inverse (weight −1) instead, which brings the total back to 0: DC balance. The receiver, seeing a − weighted pattern, inverts it back to +−−+0+ and looks up 01010000.</p>' +
              '<figure data-fig="wave" data-levels="-1,0,-1,0,1,1,-1,1,-1,1,1,0,-1,1,1,-1,0,-1" data-cpb="1" data-bits="−0−0++−+−++0−++−0−" data-set="1,0,-1" data-title="8B6T"></figure>' +
              '<p class="small">Slide 40 redrawn: groups 00010001, 01010011 and 01010000 (the last one sent inverted). Each cell is labelled with its ternary symbol.</p>' +
              '<p>In the summary table 8B6T has $\\c{bw}{B} = \\frac{3\\c{rate}{N}}{4}$ and r = 8/6 = 4/3.</p>',
            why: '<p>8B6T shows redundancy at work: the spare patterns (slide 35) buy self-synchronization and a zero DC component (slide 46) through the inversion trick of slide 39. The price is bandwidth: 3N/4 is <i>more</i> than the N/2 of NRZ or AMI, so multilevel coding does not automatically save bandwidth; 8B6T is chosen for its good DC and sync behaviour.</p>' +
              '<p><b>Exam angle:</b> Identification (“which code maps 8 bits to 6 ternary elements?”), explaining why the third pattern is inverted, or reading a table row. The slide gives only these three code words, not the whole 256-entry table, so no question can demand the full mapping.</p>',
            tip: '<p>Use B = 3N/4 for 8B6T whenever the table is the source. Plugging r = 4/3 and c = ½ into the S formula gives 3N/8 instead, so the table value does not follow from that formula; go with the table.</p>' },

          { n: 41, title: 'Multilevel using multiple channels',
            says: '<ul><li>In some cases we split the signal transmission up and distribute it over several links.</li>' +
              '<li>The separate segments are transmitted simultaneously. This reduces the signalling rate per link → lower bandwidth.</li>' +
              '<li>This requires all bits for a code to be stored.</li><li>xD: means that we use ‘x’ links.</li>' +
              '<li>YYYz: we use ‘z’ levels of modulation, where YYY represents the type of modulation (e.g. pulse amplitude modulation, PAM).</li>' +
              '<li>Codes are represented as: xD-YYYz.</li></ul>',
            means: '<p>Instead of one fast channel, the encoder cuts the data into parts and sends them <b>in parallel</b> over x separate links (wires). If the total data rate is $\\c{rate}{N}$ and x links share the load equally, each link carries only</p>' +
              '$$\\c{rate}{N_{\\text{link}}} = \\frac{\\c{rate}{N}}{x}$$' +
              '<p>so each link’s signalling rate, and therefore the bandwidth that link needs, is lower. The catch: the sender has to <b>store all the bits of one code word</b> before it can send, because the pieces must leave on all the links at the same instant.</p>' +
              '<p>The name <b>xD-YYYz</b> packs this into one label. Read 4D-PAM5 as: <b>4D</b> = four links; <b>PAM</b> = pulse amplitude modulation (the height of a pulse carries the data); <b>5</b> = five levels on each link. Compare with mBnL: there the name described bits and levels, here it describes links and modulation.</p>',
            why: '<p>This slide sets up slide 42, which applies it with real numbers (1 Gbps over four wires). It is the third way the multilevel family cuts the signalling rate: slide 38 packed more bits into each level, and now the work is also spread over several wires at once.</p>' +
              '<p><b>Exam angle:</b> MCQ or Identification (“what does the 4D in 4D-PAM5 mean?”, “what is the cost of splitting over several links?”). The usual error is to read the digit after PAM as the number of wires; it is the number of levels.</p>' },

          { n: 42, title: 'Multilevel: 4D-PAM5 scheme',
            says: '<p>A figure. The bit string <span class="mono">00011110</span> is drawn as a stepped waveform on levels +2, +1, −1, −2 (−2, +1, +2, −1 in time order); an arrow from each step leads to one of four boxes labelled Wire 1 … Wire 4. The whole stream is labelled <b>1 Gbps</b>; each wire carries <b>250 Mbps</b> and is labelled <b>125 MBd</b>.</p>',
            means: '<p><b>4D-PAM5</b> sends data over <b>four wires</b>, each using a pulse-amplitude signal with <b>five levels</b> (−2, −1, 0, +1, +2). Follow the arithmetic:</p><ol>' +
              '<li>The block <span class="mono">00011110</span> (8 bits) becomes <b>one level per wire</b>: −2 on wire 1, +1 on wire 2, +2 on wire 3, −1 on wire 4, all sent in the same signal interval.</li>' +
              '<li>The total rate of $\\c{rate}{N} = \\c{rate}{1\\text{ Gbps}}$ is shared by four wires: $\\c{rate}{N_{\\text{link}}} = \\frac{\\c{rate}{1000}}{4} = \\c{rate}{250\\text{ Mbps}}$ per wire.</li>' +
              '<li>Every interval consumes 8 bits, so there are $\\frac{\\c{rate}{1000\\text{ Mbps}}}{8} = \\c{baud}{125}$ million intervals per second: each wire signals at $\\c{baud}{125\\text{ MBd}}$, as printed.</li>' +
              '<li>Per wire, $\\c{level}{r} = \\frac{250\\text{ Mbps}}{125\\text{ MBd}} = \\c{level}{2}$ bits per signal element.</li></ol>' +
              '<figure data-fig="wave" data-levels="-2,1,2,-1" data-cpb="1" data-set="2,1,0,-1,-2" data-title="00011110"></figure>' +
              '<p class="small">The four levels of slide 42 in time order (−2, +1, +2, −1); each level goes to a different wire.</p>' +
              '<p>Validity check with slide 36’s rule (not printed on the slide): the four wires are four signal elements at five levels, so $2^{\\c{level}{8}} = 256 \\le \\c{level}{5}^{\\c{level}{4}} = 625$, which leaves 369 spare patterns. The summary table gives $\\c{bw}{B} = \\frac{\\c{rate}{N}}{8}$, the lowest of any scheme in the table: 125 MHz for 1 Gbps.</p>',
            why: '<p>4D-PAM5 is the extreme of the multilevel idea: many levels, many links, a very low signalling rate per link (N/8 in total against NRZ’s N/2). It needs all 8 bits stored before sending (slide 41) and a receiver that watches four wires together.</p>' +
              '<p><b>Exam angle:</b> Solving items such as “a 1 Gbps stream over 4D-PAM5: what is the rate per wire and the baud rate per wire?” (250 Mbps and 125 MBd), and the table fact B = N/8 with self-synchronization and no DC.</p>',
            tip: '<p>Two divisions: 1 Gbps ÷ 4 wires = 250 Mbps per wire, and 1 Gbps ÷ 8 bits per block = 125 M blocks per second = 125 MBd on each wire.</p>',
            beyond: '<p>Forouzan: 4D-PAM5 is the line code of Gigabit Ethernet over four twisted pairs (1000BASE-T). The slides do not say where it is used.</p>' }
        ],
        together: '<p><b>The multilevel family in one picture.</b> Problem: NRZ-type codes carry one bit per signal element, so a high bit rate needs a high baud rate and a wide bandwidth. Idea: let one signal element take one of L levels so that it carries r = m/n bits. Feasibility test: 2<sup>m</sup> ≤ L<sup>n</sup>. Spare patterns (2<sup>m</sup> &lt; L<sup>n</sup>) buy noise immunity, error detection and DC control.</p>' +
          '<table class="tbl compact"><thead><tr><th>Code</th><th>m → n, L</th><th>r</th><th>B (table)</th><th>What it shows</th></tr></thead><tbody>' +
          '<tr><td>2B1Q</td><td>2 → 1, 4 levels</td><td>2</td><td>$\\c{bw}{\\frac{N}{4}}$</td><td>exact fit, transition table, no redundancy, DC present</td></tr>' +
          '<tr><td>8B6T</td><td>8 → 6, 3 levels</td><td>4/3</td><td>$\\c{bw}{\\frac{3N}{4}}$</td><td>473 spare patterns, inversion for DC balance</td></tr>' +
          '<tr><td>4D-PAM5</td><td>8 bits → 4 wires × 5 levels</td><td>2 per wire</td><td>$\\c{bw}{\\frac{N}{8}}$</td><td>parallel links: 250 Mbps and 125 MBd per wire</td></tr></tbody></table>' +
          '<p>These codes reduce the baud rate by adding levels (or links). The next part of the deck takes a different route to synchronization without doubling the bandwidth: <b>multitransition</b> coding moves through three levels in a fixed cycle (MLT-3), and slide 46 then collects every scheme met so far into one summary table.</p>' },

      /* ================= PART 3: multitransition and the summary table ================= */
      { title: 'Multitransition coding (MLT-3) and the summary table', slides: [43, 46],
        items: [
          { n: 43, title: 'Multi-transition coding',
            says: '<ul><li>Because of synchronization requirements we force transitions. This can result in very high bandwidth requirements → more transitions than there are bits (e.g. a mid-bit transition with inversion).</li>' +
              '<li>Codes can be created that are differential at the bit level, forcing transitions at bit boundaries. This results in a bandwidth requirement that is equivalent to the bit rate.</li>' +
              '<li>In some instances the bandwidth requirement may even be lower, due to repetitive patterns resulting in a periodic signal.</li></ul>',
            means: '<p><b>Multitransition coding</b> is about controlling <i>where</i> and <i>how often</i> a signal changes, so that the receiver still gets transitions to synchronize on without paying for more transitions than necessary. The three bullets are three stages of the argument:</p><ol>' +
              '<li><b>Forcing transitions costs bandwidth.</b> Manchester guarantees an edge in the middle of every bit, and an extra edge at the bit boundary when two equal bits follow each other, so one bit can cause two changes: more transitions than bits. Its signal rate is S = N (r = ½), twice the NRZ value' + r('L03 p30') + '.</li>' +
              '<li><b>Differential coding at the bit level</b> puts the transitions at the bit boundaries instead, at most one per bit, and the bandwidth needed is then “equivalent to the bit rate”.</li>' +
              '<li><b>A periodic signal can be cheaper still.</b> When the pattern repeats, the signal is a repeating wave whose energy sits at one low frequency instead of being spread over a band. MLT-3 (slide 44) exploits this.</li></ol>',
            why: '<p>This slide only states the motivation; slide 44 delivers the code and slide 45 the numbers. It names the tension that the whole line-coding chapter keeps returning to: <b>synchronization needs transitions, and transitions cost bandwidth</b>. Manchester pays in bandwidth, AMI and NRZ-I pay in lost synchronization on long runs, and MLT-3 tries a third way.</p>' +
              '<p><b>Exam angle:</b> an MCQ or short answer on why multitransition coding exists. Answer in one line: to keep transitions for synchronization while keeping the bandwidth low, using a periodic pattern.</p>' },

          { n: 44, title: 'Multi-transition: MLT-3 scheme',
            says: '<p>Three panels. <b>(a) Typical case</b>: bits <span class="mono">0 1 0 1 1 0 1 1</span> on levels +V, 0 V, −V give <span class="mono">0 + + 0 − − 0 +</span>. ' +
              '<b>(b) Worse case</b>: <span class="mono">1 1 1 1 1 1 1 1</span> gives <span class="mono">+ 0 − 0 + 0 − 0</span>; the first four bits are shaded pink and the next four yellow (one repeat each). ' +
              '<b>(c) Transition states</b>: three states 0, +V and −V. From 0: next bit 0 → stay at 0; next bit 1 → go to −V if the last non-zero level was +V, or to +V if the last non-zero level was −V. From ±V: next bit 0 → stay; next bit 1 → go to 0.</p>',
            means: '<p><b>MLT-3</b> walks around a fixed cycle of three levels: <span class="mono">0 → +V → 0 → −V → 0 → …</span>. Its two rules (panel c):</p><ul>' +
              '<li>A <b>0</b> means “no change”: stay at the current level.</li>' +
              '<li>A <b>1</b> means “take the next step of the cycle”: from +V or −V go to 0; from 0 go to the <i>opposite</i> of the last non-zero level.</li></ul>' +
              '<table class="tbl compact"><thead><tr><th>Current level</th><th>Next bit 0</th><th>Next bit 1</th></tr></thead><tbody>' +
              '<tr><td>0 (last non-zero was −V)</td><td>0</td><td>+V</td></tr><tr><td>0 (last non-zero was +V)</td><td>0</td><td>−V</td></tr>' +
              '<tr><td>+V</td><td>+V</td><td>0</td></tr><tr><td>−V</td><td>−V</td><td>0</td></tr></tbody></table>' +
              '<p>The figure’s convention: the signal starts at 0 V and the last non-zero level is taken as −V, so the first 1 goes to +V. Encoding the typical case 01011011:</p><ol>' +
              '<li>0 → stay at 0.</li><li>1 → from 0, last non-zero was −V, so go to <b>+V</b>.</li><li>0 → stay at +V.</li><li>1 → from +V go to <b>0</b>.</li>' +
              '<li>1 → from 0, last non-zero was +V, so go to <b>−V</b>.</li><li>0 → stay at −V.</li><li>1 → from −V go to <b>0</b>.</li><li>1 → from 0, last non-zero was −V, so go to <b>+V</b>.</li></ol>' +
              fig('mlt3', '01011011', 'Slide 44 (a): 01011011 → 0, +, +, 0, −, −, 0, + (start at 0 V, last non-zero level −V).') +
              '<p>The worst case of panel (b) simply repeats the cycle: 11111111 → + 0 − 0 + 0 − 0.</p>',
            why: '<p>MLT-3 produces a change on every 1 (like NRZ-I) but spreads the changes over a three-step staircase, so a run of 1s becomes a slow wave instead of rapid alternation; slide 45 puts a number on it. Its weak spot is a run of 0s, which is a flat line, so synchronization can still fail on long 0s' + r('L03 p46') + '.</p>' +
              '<p><b>Exam angle:</b> drawing MLT-3 from a bit string. Typical slips: jumping straight from +V to −V (always pass through 0), choosing the wrong sign after 0 (it is the opposite of the <i>last non-zero</i> level, not of the level before), and changing level on a 0.</p>',
            tip: '<p>Picture a staircase with three positions in a loop, 0 → + → 0 → − → 0: every 1 advances one position, every 0 stands still.</p>',
            example: { title: 'Draw MLT-3 (slide 44 a, typical case)', gen: 'l03a.draw', params: { bits: '01011011', schemes: ['mlt3'] },
              slideAnswer: '0 + + 0 − − 0 +' } },

          { n: 45, title: 'MLT-3',
            says: '<ul><li>Signal rate is the same as NRZ-I.</li><li>But because of the resulting bit pattern, we have a periodic signal for the worst-case bit pattern: 1111.</li>' +
              '<li>This can be approximated as an analog signal at a frequency ¼ the bit rate!</li></ul>',
            means: '<p>The three claims, one at a time:</p><ul>' +
              '<li><b>Same signal rate as NRZ-I.</b> Like NRZ-I, MLT-3 changes level only on a 1, and at most once per bit.</li>' +
              '<li><b>1111 is periodic.</b> In panel (b) of slide 44 the pattern + 0 − 0 repeats every <b>four</b> bits.</li>' +
              '<li><b>That repeating signal behaves like an analog wave at ¼ of the bit rate.</b> One period lasts four bit times. With the bit time $\\c{time}{T_{\\text{bit}}} = \\frac{1}{\\c{rate}{N}}$:</li></ul>' +
              '$$\\c{time}{T} = 4 \\times \\c{time}{T_{\\text{bit}}} = \\frac{4}{\\c{rate}{N}} \\quad\\Rightarrow\\quad \\c{freq}{f} = \\frac{1}{\\c{time}{T}} = \\frac{\\c{rate}{N}}{4}$$' +
              '<p>For example (numbers of mine, for easy arithmetic) at $\\c{rate}{N} = \\c{rate}{100\\text{ Mbps}}$: $\\c{time}{T_{\\text{bit}}} = \\c{time}{10\\text{ ns}}$, $\\c{time}{T} = 4 \\times 10 = \\c{time}{40\\text{ ns}}$, so $\\c{freq}{f} = \\c{freq}{25\\text{ MHz}}$. NRZ-I with all 1s alternates every bit (period 2 bits), giving $\\c{freq}{f} = \\frac{\\c{rate}{N}}{2} = \\c{freq}{50\\text{ MHz}}$, twice as fast.</p>' +
              fig('nrzi,mlt3', '11111111', 'All 1s: NRZ-I alternates every bit (period 2 bits); MLT-3 repeats + 0 − 0 (period 4 bits).') +
              '<p>Do not confuse this with the summary table’s B = N/3 (slide 46): that is the <i>average</i> bandwidth of the code, while N/4 is the frequency of one specific periodic pattern.</p>',
            why: '<p>The point is that even MLT-3’s “worst” pattern, the one with the most activity, is a slow wave, so the code needs less bandwidth than NRZ-I while still producing a transition at every 1. This is slide 43’s third bullet made concrete.</p>' +
              '<p><b>Exam angle:</b> Identification (“which code’s worst case approximates an analog signal at ¼ of the bit rate?”) and the one-line derivation f = N/4. Slide 46 then lists MLT-3 with B = N/3.</p>',
            beyond: '<p>In practice, 100BASE-TX Fast Ethernet applies 4B/5B block coding and then MLT-3, the same “block code first, line code second” pairing that slide 50 shows with NRZ-I. The slides do not mention it.</p>',
            example: { title: 'Draw MLT-3 for the worst case (slide 44 b)', gen: 'l03a.draw', params: { bits: '11111111', schemes: ['mlt3'] },
              slideAnswer: '+ 0 − 0 + 0 − 0 (period of 4 bits)' } },

          { n: 46, title: 'Summary of line coding schemes',
            says: '<p>The slide’s table, reproduced as printed (including its category labels):</p>' +
              '<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Category</th><th>Scheme</th><th>Bandwidth (average)</th><th>Characteristics</th></tr></thead><tbody>' +
              '<tr><td>Unipolar</td><td>NRZ</td><td>B = N/2</td><td>Costly, no self-synchronization if long 0s or 1s, DC</td></tr>' +
              '<tr><td rowspan="3">Unipolar</td><td>NRZ-L</td><td>B = N/2</td><td>No self-synchronization if long 0s or 1s, DC</td></tr>' +
              '<tr><td>NRZ-I</td><td>B = N/2</td><td>No self-synchronization for long 0s, DC</td></tr>' +
              '<tr><td>Biphase</td><td>B = N</td><td>Self-synchronization, no DC, high bandwidth</td></tr>' +
              '<tr><td>Bipolar</td><td>AMI</td><td>B = N/2</td><td>No self-synchronization for long 0s, DC</td></tr>' +
              '<tr><td rowspan="3">Multilevel</td><td>2B1Q</td><td>B = N/4</td><td>No self-synchronization for long same double bits</td></tr>' +
              '<tr><td>8B6T</td><td>B = 3N/4</td><td>Self-synchronization, no DC</td></tr>' +
              '<tr><td>4D-PAM5</td><td>B = N/8</td><td>Self-synchronization, no DC</td></tr>' +
              '<tr><td>Multiline</td><td>MLT-3</td><td>B = N/3</td><td>No self-synchronization for long 0s</td></tr></tbody></table></div>',
            means: '<p>The table answers two questions for every scheme: <b>how much bandwidth</b> it needs and <b>what goes wrong</b>. Here are the bandwidths made concrete for a bit rate of $\\c{rate}{N} = \\c{rate}{24\\text{ Mbps}}$, sorted from smallest to largest:</p>' +
              '<table class="tbl compact"><thead><tr><th>Scheme</th><th>Bandwidth rule</th><th>At 24 Mbps</th></tr></thead><tbody>' +
              '<tr><td>4D-PAM5</td><td>$\\c{bw}{B} = \\frac{\\c{rate}{N}}{8}$</td><td>$\\c{bw}{3\\text{ MHz}}$</td></tr>' +
              '<tr><td>2B1Q</td><td>$\\c{bw}{B} = \\frac{\\c{rate}{N}}{4}$</td><td>$\\c{bw}{6\\text{ MHz}}$</td></tr>' +
              '<tr><td>MLT-3</td><td>$\\c{bw}{B} = \\frac{\\c{rate}{N}}{3}$</td><td>$\\c{bw}{8\\text{ MHz}}$</td></tr>' +
              '<tr><td>NRZ, NRZ-L, NRZ-I, AMI</td><td>$\\c{bw}{B} = \\frac{\\c{rate}{N}}{2}$</td><td>$\\c{bw}{12\\text{ MHz}}$</td></tr>' +
              '<tr><td>8B6T</td><td>$\\c{bw}{B} = \\frac{3\\c{rate}{N}}{4}$</td><td>$\\c{bw}{18\\text{ MHz}}$</td></tr>' +
              '<tr><td>Biphase (Manchester, differential Manchester)</td><td>$\\c{bw}{B} = \\c{rate}{N}$</td><td>$\\c{bw}{24\\text{ MHz}}$</td></tr></tbody></table>' +
              '<p>And the characteristics, grouped:</p><ul>' +
              '<li><b>Self-synchronizing, no DC:</b> biphase (but at the highest bandwidth), 8B6T and 4D-PAM5.</li>' +
              '<li><b>DC listed:</b> NRZ, NRZ-L, NRZ-I (and 2B1Q, from slide 39). AMI has none: slide 33 says so.</li>' +
              '<li><b>No self-synchronization:</b> on long 0s (NRZ-I, AMI, MLT-3), on long 0s <i>or</i> 1s (NRZ, NRZ-L), on long runs of the same two bits (2B1Q).</li></ul>' +
              '<p>RZ does not appear in the table (slide 27 gives S = N for it, the same as biphase).</p>',
            why: '<p>This is the slide to turn into a comparison essay or an MCQ bank: “which scheme needs B = N/4?”, “which has no DC and self-synchronization?”, “which is a bipolar scheme?”. The pattern behind the table is the chapter’s main trade-off: the cheapest codes (N/2 and below) leave a flaw, and the codes without flaws either double the bandwidth (biphase), need redundancy (8B6T) or use parallel links (4D-PAM5).</p>' +
              '<p>Slides 47–61 then fix the cheap codes’ flaws by <i>preparing the data</i> (block coding) or <i>patching the signal</i> (scrambling).</p>',
            tip: '<p>Bandwidth ladder to memorise: 4D-PAM5 N/8 · 2B1Q N/4 · MLT-3 N/3 · NRZ and AMI N/2 · 8B6T 3N/4 · biphase N.</p>',
            error: { says: 'NRZ-L, NRZ-I and Biphase are listed under “Unipolar”; AMI is marked “DC”; MLT-3’s category is “Multiline”.',
              correct: 'NRZ-L, NRZ-I and biphase are polar schemes; AMI has no DC component (slide 33); the category is multitransition (slides 43 and 44).' } }
        ],
        together: '<p><b>Multilevel and multitransition coding in one picture.</b> Every code answers the same question, “how do I get a high data rate, enough transitions and no DC for the least bandwidth?”, with a different compromise:</p>' +
          '<table class="tbl compact"><thead><tr><th>Scheme</th><th>Mechanism</th><th>Bandwidth</th><th>Remaining weakness</th></tr></thead><tbody>' +
          '<tr><td>AMI</td><td>alternating 1s</td><td>$\\c{bw}{\\frac{N}{2}}$</td><td>long 0s</td></tr>' +
          '<tr><td>2B1Q</td><td>4 levels, 2 bits each</td><td>$\\c{bw}{\\frac{N}{4}}$</td><td>no redundancy, DC</td></tr>' +
          '<tr><td>8B6T</td><td>spare patterns, inversion</td><td>$\\c{bw}{\\frac{3N}{4}}$</td><td>more bandwidth than NRZ</td></tr>' +
          '<tr><td>4D-PAM5</td><td>4 wires, 5 levels</td><td>$\\c{bw}{\\frac{N}{8}}$</td><td>store 8 bits, four wires</td></tr>' +
          '<tr><td>MLT-3</td><td>3-level staircase, periodic worst case</td><td>$\\c{bw}{\\frac{N}{3}}$</td><td>long 0s</td></tr></tbody></table>' +
          '<p>Slide 46 collects everything into one table. Reading it shows that no single line code is best on every count, which is exactly why the next part changes strategy. Instead of inventing yet another waveform, <b>block coding</b> rewrites the <i>bits</i> first (adding a few extra ones) so that an ordinary, cheap line code such as NRZ-I never meets the patterns it handles badly.</p>' },

      /* ================= PART 4: block coding ================= */
      { title: 'Block coding: 4B/5B and 8B/10B', slides: [47, 56],
        items: [
          { n: 47, kind: 'admin', title: 'Block Coding (section divider)', says: 'Section divider titled “Block Coding”.' },

          { n: 48, title: 'Block coding',
            says: '<ul><li>For a code to be capable of error detection, we need to add redundancy, i.e. extra bits to the data bits.</li>' +
              '<li>Synchronization also requires redundancy: transitions are important in the signal flow and must occur frequently.</li>' +
              '<li>Block coding is done in three steps: division, substitution and combination.</li>' +
              '<li>It is distinguished from multilevel coding by the use of the slash: xB/yB.</li>' +
              '<li>The resulting bit stream prevents certain bit combinations that, used with line encoding, would result in DC components or poor sync quality.</li>' +
              '<li>Block coding is normally referred to as mB/nB coding; it replaces each m-bit group with an n-bit group.</li></ul>',
            means: '<p><b>Redundancy</b> means sending more bits than the data strictly needs. Slide 15 said a code can detect errors if some patterns are illegal, and slide 13 said a receiver needs frequent transitions to stay in step; both need spare patterns, which is what redundancy provides. <b>Block coding</b> adds it at the bit level, <i>before</i> the line code, in three steps:</p><ol>' +
              '<li><b>Division</b>: cut the data stream into groups of m bits.</li>' +
              '<li><b>Substitution</b>: replace every m-bit group by an n-bit group from a fixed table, with n &gt; m.</li>' +
              '<li><b>Combination</b>: join the n-bit groups into one longer stream.</li></ol>' +
              '<p>With m = 4 and n = 5 (4B/5B), the stream <span class="mono">0000 1111</span> becomes <span class="mono">11110 11101</span>, joined as <span class="mono">1111011101</span>. Because every m bits become n bits, the bit rate grows by the factor n/m:</p>' +
              '$$\\c{rate}{N\'} = \\c{rate}{N} \\times \\frac{\\c{level}{n}}{\\c{level}{m}}, \\quad \\text{4B/5B: } \\c{rate}{N\'} = \\c{rate}{N} \\times \\frac{5}{4}$$' +
              '<p>The <b>slash</b> is the notation to remember: <b>mB/nB</b> (4B/5B, 8B/10B) maps bits to <i>bits</i>, while <b>mBnL</b> (2B1Q, 8B6T, slide 37) maps bits to <i>signal levels</i>.</p>',
            why: '<p>Block coding is not a line code: it only rewrites bits, so it is always followed by a line code (slide 50 pairs 4B/5B with NRZ-I). Its job is to stop the line code from ever seeing the bit combinations that hurt it, such as a long run of 0s. The price is the extra bits, which raise the rate N and therefore the bandwidth.</p>' +
              '<p><b>Exam angle:</b> naming the three steps in order, the slash notation, and the purpose (redundancy for error detection and synchronization). A common mistake is to think block coding changes the signal levels; it does not.</p>' },

          { n: 49, title: 'Block coding concept',
            says: '<p>A diagram in three layers. Top: “Division of a stream into m-bit groups”: boxes of m bits (110…1, 000…1, …, 010…1). Middle: a box “mB-to-nB substitution”. Bottom: n-bit groups (010…101, 000…001, …, 011…111) under “Combining n-bit groups into a stream”. Arrows point downwards.</p>',
            means: '<p>The picture is slide 48’s three steps drawn as a pipeline. Following one short stream through it with m = 4 and n = 5 (code words from the slide-51 table):</p>' +
              '<table class="tbl compact"><thead><tr><th>Step</th><th>What happens</th><th>Result for 00000001</th></tr></thead><tbody>' +
              '<tr><td>1. Division</td><td>split into m = 4 bit groups</td><td class="mono">0000 | 0001</td></tr>' +
              '<tr><td>2. Substitution</td><td>table: 0000 → 11110, 0001 → 01001</td><td class="mono">11110 | 01001</td></tr>' +
              '<tr><td>3. Combination</td><td>join the n = 5 bit groups</td><td class="mono">1111001001</td></tr></tbody></table>' +
              '<p>Three things to notice. Each group is substituted <i>independently</i> by a table lookup. The output is longer than the input (10 bits for 8). And the receiver reverses the process: split into n-bit groups, look each up, join the m-bit results.</p>',
            why: '<p>This template fits every block code, from 4B/5B on slides 50–54 to 8B/10B on slides 55–56. Keep it as the answer skeleton for an essay on “how does block coding work?”: divide, substitute, combine, then line-code.</p>' +
              '<p><b>Exam angle:</b> Identification (“which step replaces m-bit groups with n-bit groups?” → substitution) and ordering the steps.</p>' },

          { n: 50, title: 'Block coding 4B/5B with NRZ-I line coding scheme',
            says: '<p>A block diagram, left to right: <b>Sender</b> → <b>4B/5B encoding</b> (yellow) → <b>NRZ-I encoding</b> (blue) → <b>Link</b> carrying a digital signal → <b>NRZ-I decoding</b> → <b>4B/5B decoding</b> → <b>Receiver</b>.</p>',
            means: '<p>Two encoders work one after the other: 4B/5B turns data bits into <i>more bits</i>, and NRZ-I turns those bits into the <i>signal</i>. The receiver undoes them in the reverse order.</p>' +
              '<p>Why this pair? NRZ-I inverts the level on every 1, so a run of 1s is a string of transitions, but a run of 0s is a flat line, and slide 46 lists “no self-synchronization for long 0s”. 4B/5B repairs exactly that weakness: no data word of the slide-51 table starts with more than one 0 or ends with more than two, so after the words are joined no more than <b>three 0s</b> in a row remain, and the receiver sees a transition at least once in every four bit times.</p>' +
              '<p>The figures below show 00000000 sent with NRZ-I directly, and after 4B/5B (each 0000 becomes 11110):</p>' +
              fig('nrzi', '00000000', 'Without block coding: NRZ-I of 00000000 is a flat line, nothing to synchronize on.') +
              '<figure data-fig="l03a.blockcode" data-bits="00000000" data-caption="With 4B/5B: 0000 0000 → 11110 11110, then NRZ-I (the second row of the picture): transitions on every 1."></figure>',
            why: '<p>Slide 50 shows the architecture the exam expects in a drawing: block coding and line coding in series. It also shows why block coding exists: to make a cheap line code safe. NRZ-I needs only N/2 of bandwidth, so after the 5/4 expansion of slide 54 it still needs less than Manchester would.</p>' +
              '<p><b>Exam angle:</b> an essay or diagram question (“draw the sender and receiver for 4B/5B with NRZ-I”), or an MCQ on which line code 4B/5B is paired with. Do not swap the order: the block code comes first at the sender and last at the receiver.</p>' },

          { n: 51, title: '4B/5B mapping codes',
            says: '<p>A table with data sequences and encoded sequences on the left and control sequences on the right.</p>' +
              '<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Data</th><th>Code</th><th>Data</th><th>Code</th></tr></thead><tbody>' +
              '<tr><td class="mono">0000</td><td class="mono"><b>11110</b></td><td class="mono">1000</td><td class="mono"><b>10010</b></td></tr>' +
              '<tr><td class="mono">0001</td><td class="mono"><b>01001</b></td><td class="mono">1001</td><td class="mono"><b>10011</b></td></tr>' +
              '<tr><td class="mono">0010</td><td class="mono"><b>10100</b></td><td class="mono">1010</td><td class="mono"><b>10110</b></td></tr>' +
              '<tr><td class="mono">0011</td><td class="mono"><b>10101</b></td><td class="mono">1011</td><td class="mono"><b>10111</b></td></tr>' +
              '<tr><td class="mono">0100</td><td class="mono"><b>01010</b></td><td class="mono">1100</td><td class="mono"><b>11010</b></td></tr>' +
              '<tr><td class="mono">0101</td><td class="mono"><b>01011</b></td><td class="mono">1101</td><td class="mono"><b>11011</b></td></tr>' +
              '<tr><td class="mono">0110</td><td class="mono"><b>01110</b></td><td class="mono">1110</td><td class="mono"><b>11100</b></td></tr>' +
              '<tr><td class="mono">0111</td><td class="mono"><b>01111</b></td><td class="mono">1111</td><td class="mono"><b>11101</b></td></tr></tbody></table></div>' +
              '<p><b>Control sequences:</b> Q (Quiet) <span class="mono">00000</span> · I (Idle) <span class="mono">11111</span> · H (Halt) <span class="mono">00100</span> · J (Start delimiter) <span class="mono">11000</span> · K (Start delimiter) <span class="mono">10001</span> · T (End delimiter) <span class="mono">01101</span> · S (Set) <span class="mono">11001</span> · R (Reset) <span class="mono">00111</span>.</p>',
            means: '<p>Using the table is the “substitution” step of slide 48: find the 4-bit data group on the left, write the 5-bit code next to it. Encoding <span class="mono">0000 1111 0001</span>:</p><ol>' +
              '<li>Division: 0000 | 1111 | 0001.</li><li>Substitution: 0000 → 11110, 1111 → 11101, 0001 → 01001.</li>' +
              '<li>Combination: <span class="mono">11110 11101 01001</span>, which is 15 bits for 12 data bits, a ratio of 5/4.</li></ol>' +
              '<p>Two properties are visible in the table. First, <b>no data code word has more than one leading 0 or more than two trailing 0s</b>, so joined words never produce more than three 0s in a row (slide 50). Second, the eight control sequences are <b>control sequences</b> reserved for signalling (idle, start and end of a frame, and so on); they are not data. The words 00000 and 11111 appear here as Q and I, which is why slide 52 draws them unshaded.</p>' +
              '<p>The 16 data words and 8 control words use 24 of the 32 possible 5-bit words. The other eight (00001, 00010, 00011, 00101, 00110, 01000, 01100, 10000) appear nowhere in the table, so a receiver that sees one knows the data was corrupted. That list is my own derivation from the table, not something the slide prints.</p>',
            why: '<p>The table is the core of 4B/5B and the most likely “apply it” item for block coding: encode a short bit string, or decode 5-bit words back. Learn the method (split, look up, join) and the three code words the slides use as examples (0000 → 11110, 0001 → 01001, 1111 → 11101); a closed-notes exam may or may not supply the table, so ask your instructor.</p>' +
              '<p>Slide 52 draws three of these substitutions, slide 53 counts the spare words, and slide 54 uses the rate increase in a bandwidth calculation.</p>',
            example: { title: 'Encode with the 4B/5B table (slide 51)', gen: 'l03a.block', params: { dir: 'enc', bits: '000011110001', N: 1e6 },
              slideAnswer: '0000 1111 0001 → 11110 11101 01001; line rate 1.25 Mbps for a 1 Mbps data rate' } },

          { n: 52, title: 'Substitution in 4B/5B block coding',
            says: '<p>A diagram. Top box “4-bit blocks”: 1111, …, 0001, 0000. Bottom box “5-bit blocks”: 11111, 11110, 11101, …, 01001, …, 00000. Arrows lead 1111 → 11101, 0001 → 01001 and 0000 → 11110. The used code words (11110, 11101, 01001) are shaded yellow; 11111 and 00000 at the two ends are not.</p>',
            means: '<p>The slide shows substitution as a many-arrow mapping from the 16 possible 4-bit blocks to a chosen subset of the 32 possible 5-bit blocks. Three of the arrows:</p><ul>' +
              '<li><b>0000 → 11110</b>: the all-zero data group, the worst case for NRZ-I, is replaced by a word with four 1s.</li>' +
              '<li><b>1111 → 11101</b>: all 1s are mapped to a word that still contains a 0 and a transition pattern.</li>' +
              '<li><b>0001 → 01001</b>: a typical word with 0s and 1s mixed.</li></ul>' +
              '<p>The unshaded blocks at the ends, 11111 and 00000, are not data code words: slide 51 uses them as the control sequences I (Idle) and Q (Quiet).</p>' +
              '<figure data-fig="l03a.blockcode" data-bits="111100010000" data-caption="Slide 52: 1111 0001 0000 → 11101 01001 11110, followed by NRZ-I (second row). The run of four 0s in 0000 never reaches the line."></figure>',
            why: '<p>This is the picture to reproduce when an exam asks “what does substitution do in 4B/5B?”: arrows from 4-bit blocks into a subset of 5-bit blocks, chosen so that none has a long run of 0s. The shaded and unshaded blocks also visualise redundancy: only some of the 5-bit blocks are used for data.</p>' +
              '<p>Slide 53 turns that visual impression into a count of spare words.</p>' },

          { n: 53, title: 'Redundancy',
            says: '<ul><li>A 4 bit data word can have “24” combinations (printed “24”).</li><li>A 5 bit word can have “25 = 32” combinations.</li>' +
              '<li>We therefore have “32 − 26 = 16” extra words.</li><li>Some of the extra words are used for control/signalling purposes.</li></ul>',
            means: '<p>The slide counts patterns, the same idea as slide 35 but with bits instead of levels:</p>' +
              '$$2^{\\c{level}{4}} = 16 \\ \\text{data words}, \\quad 2^{\\c{level}{5}} = 32 \\ \\text{code words}, \\quad 32 - 16 = 16 \\ \\text{extra words}$$' +
              '<p>Slide 51 shows how the 16 extra words are spent: 8 are control sequences (Q, I, H, J, K, T, S, R) and the remaining 8 are not used at all. The extra words are the redundancy: half of all 5-bit patterns are never needed for data, so the designer can pick the 16 that never produce a long run of 0s.</p>' +
              '<p>Compare with mBnL: there the spare count was $\\c{level}{L}^{\\c{level}{n}} - 2^{\\c{level}{m}}$; here the signal alphabet is binary (L = 2), so the spare count is $2^{\\c{level}{n}} - 2^{\\c{level}{m}}$.</p>',
            why: '<p>This slide explains <i>what the 25% rate increase buys</i>: not more data, but freedom of choice and a way to spot invalid words. It is a good numerical MCQ or short-answer item: “how many extra words does 4B/5B have?” (16).</p>' +
              '<p>Slide 54 now uses the 5/4 factor in the one worked example of this section.</p>',
            error: { says: 'The printed text reads “24 combinations”, “25 = 32” and “32 − 26 = 16” (the superscripts are lost and 26 is a typo).', correct: '2⁴ = 16 data words, 2⁵ = 32 code words, and 32 − 16 = 16 extra words.' } },

          { n: 54, title: 'Example 4',
            says: '<p><i>We need to send data at a 1-Mbps rate. What is the minimum required bandwidth, using a combination of 4B/5B and NRZ-I or Manchester coding?</i></p>' +
              '<p><b>Solution:</b> first 4B/5B block coding increases the bit rate to 1.25 Mbps. The minimum bandwidth using NRZ-I is N/2 or 625 kHz. The Manchester scheme needs a minimum bandwidth of 1.25 MHz. The first choice needs a lower bandwidth, but has a DC component problem; the second choice needs a higher bandwidth, but does not have a DC component problem.</p>',
            means: '<p>Three steps, with each quantity in its colour (bit rate blue, signal rate orange, bandwidth green, r and levels violet):</p><ol>' +
              '<li><b>Block coding first.</b> $\\c{rate}{N\'} = \\c{rate}{N} \\times \\frac{5}{4} = \\c{rate}{1\\text{ Mbps}} \\times \\frac{5}{4} = \\c{rate}{1.25\\text{ Mbps}}$.</li>' +
              '<li><b>NRZ-I</b> (r = 1, c = ½): $\\c{baud}{S} = c \\times \\c{rate}{N\'} \\times \\frac{1}{\\c{level}{r}} = \\frac{1}{2} \\times \\c{rate}{1.25\\text{ Mbps}} \\times \\frac{1}{\\c{level}{1}} = \\c{baud}{625\\text{ kbaud}}$, so $\\c{bw}{B_{\\min}} = \\c{baud}{S} = \\c{bw}{625\\text{ kHz}}$.</li>' +
              '<li><b>Manchester</b> (r = ½, two signal elements per bit): $\\c{baud}{S} = \\frac{1}{2} \\times \\c{rate}{1.25\\text{ Mbps}} \\times \\frac{1}{\\c{level}{\\frac{1}{2}}} = \\c{baud}{1.25\\text{ Mbaud}}$, so $\\c{bw}{B_{\\min}} = \\c{bw}{1.25\\text{ MHz}}$.</li></ol>' +
              fig('nrzi,manchester', '1111001001', 'The same 4B/5B output (0000 0001 → 11110 01001) as NRZ-I and as Manchester: Manchester changes level twice as often.') +
              '<p>The comparison is the real answer: NRZ-I needs <b>half</b> of Manchester’s bandwidth (625 kHz against 1.25 MHz) but keeps a DC component problem, whereas Manchester has none (slide 46). Without block coding, NRZ-I at 1 Mbps would need 500 kHz (Example 3, slide 25), so the 5/4 expansion costs 125 kHz.</p>',
            why: '<p>This is the most exam-shaped item of the block-coding section: a Solving question with exactly one trap, <b>the N in “N/2” is 1.25 Mbps, not 1 Mbps</b>. Forgetting the 5/4 factor gives 500 kHz instead of 625 kHz. The closing sentence of the slide, the DC-versus-bandwidth trade-off, is a typical essay prompt.</p>' +
              '<p>It joins three earlier ideas: S = c × N × 1/r (slide 8), B<sub>min</sub> = S (slide 25) and the 4B/5B rate (slide 53).</p>',
            tip: '<p>Order of operations: block coding first (× 5/4), then the line code’s rule (N/2 for NRZ-I, N for Manchester), both applied to the <i>new</i> rate.</p>',
            example: { title: 'Example 4: 4B/5B with NRZ-I (the Manchester branch is worked above)', gen: 'l03a.baud', params: { scheme: 'nrzi', N: 1e6, block: true },
              slideAnswer: '1 Mbps → 1.25 Mbps; NRZ-I minimum bandwidth N/2 = 625 kHz (Manchester: 1.25 MHz)', slideValue: 625000, input: 'B' } },

          { n: 55, title: '8B/10B block encoding',
            says: '<p>A diagram of an “8B/10B encoder”: an <b>8-bit block</b> enters and splits into two parallel boxes, <b>5B/6B encoding</b> and <b>3B/4B encoding</b>; both feed a yellow <b>Disparity controller</b>, which outputs a <b>10-bit block</b>.</p>',
            means: '<p><b>8B/10B</b> is block coding with m = 8 and n = 10. The 8-bit block is split into 5 bits and 3 bits; the 5 bits go through a 5B/6B encoder (5 → 6 bits) and the 3 bits through a 3B/4B encoder (3 → 4 bits), and 6 + 4 = 10 bits leave the encoder.</p>' +
              '<p>The <b>disparity controller</b> looks at the stream so far. <b>Disparity</b> is the imbalance between the two voltage levels (more 1s than 0s, or the other way round); a stream with a long-running imbalance has a DC component. When the next code words would add to that imbalance, the controller picks the alternative that pulls it back toward balance (slide 56: it prevents long runs of one voltage level).</p>' +
              '<p>The rate grows by n/m:</p>' +
              '$$\\c{rate}{N\'} = \\c{rate}{N} \\times \\frac{\\c{level}{10}}{\\c{level}{8}} = \\c{rate}{N} \\times \\frac{5}{4}$$' +
              '<p>For example (mine) a 1 Gbps data stream becomes $\\c{rate}{N\'} = \\c{rate}{1\\text{ Gbps}} \\times \\frac{5}{4} = \\c{rate}{1.25\\text{ Gbps}}$ on the line, the same 25% overhead as 4B/5B.</p>',
            why: '<p>Slide 55 only names the parts; the useful exam facts are the structure (5B/6B + 3B/4B + disparity controller), the 8 → 10 bit sizes and the purpose, DC control. It is an easy Identification item (“which block code uses a disparity controller?”).</p>' +
              '<p>Slide 56 explains why the extra bits help.</p>',
            beyond: '<p>Splitting 8 bits into 5 + 3 means the encoder needs two small tables (32 and 8 entries) instead of one table of 256 entries. The slides do not say this.</p>' },

          { n: 56, title: 'More bits: better error detection',
            says: '<ul><li>The 8B10B block code adds more redundant bits and can thereby choose code words that would prevent a long run of a voltage level that would cause DC components.</li></ul>',
            means: '<p>Compare how much of the “code space” each code uses for data:</p>' +
              '<table class="tbl compact"><thead><tr><th>Code</th><th>Data words</th><th>All words</th><th>Share used</th><th>Extra bits per block</th><th>Rate factor</th></tr></thead><tbody>' +
              '<tr><td>4B/5B</td><td>$2^{4} = 16$</td><td>$2^{5} = 32$</td><td>½</td><td>1 per 4 bits</td><td>5/4</td></tr>' +
              '<tr><td>8B/10B</td><td>$2^{8} = 256$</td><td>$2^{10} = 1024$</td><td>¼</td><td>2 per 8 bits</td><td>10/8 = 5/4</td></tr></tbody></table>' +
              '<p>“More redundant bits” therefore means more bits <i>per block</i> (2 against 1), not a higher overhead: the rate factor is 5/4 for both. With 1024 − 256 = 768 unused words, 8B/10B has far more freedom to select words that avoid long runs and to keep the disparity near zero (slide 55), and a corrupted word is more likely to land on an unused, recognisably invalid pattern, which is the error-detection gain.</p>',
            why: '<p>The slide explains the trade-off the whole section is built on: redundancy buys DC control, synchronization and error detection, and the price is extra bits. Larger blocks use that redundancy more cleverly at the same percentage cost.</p>' +
              '<p><b>Exam angle:</b> a short answer such as “why does 8B/10B detect errors better than 4B/5B?” The shares in the table are my own arithmetic from the slides’ block sizes.</p>' }
        ],
        together: '<p><b>Block coding in one picture.</b> Block coding is a bits-to-bits pre-processor that always runs before a line code.</p>' +
          '<table class="tbl compact"><thead><tr><th>Problem</th><th>Idea</th><th>Mechanism</th><th>Trade-off</th></tr></thead><tbody>' +
          '<tr><td>NRZ-I loses sync on long 0s; DC and sync need redundancy</td><td>add redundant bits, then use the cheap line code</td><td>division → substitution (table) → combination</td><td>rate × n/m: $\\c{rate}{N\'} = \\c{rate}{N} \\times \\frac{5}{4}$</td></tr>' +
          '<tr><td>4B/5B</td><td>16 data words out of 32, no long 0 runs</td><td>0000 → 11110; at most three 0s in a row</td><td>Example 4: NRZ-I 625 kHz (DC), Manchester 1.25 MHz (no DC)</td></tr>' +
          '<tr><td>8B/10B</td><td>5B/6B + 3B/4B + disparity controller</td><td>pick words that keep the DC near zero</td><td>same 25% overhead, more freedom</td></tr></tbody></table>' +
          '<p>The chain is: data bits → block code → line code → signal. The deck’s second solution to the same weaknesses avoids the extra bits altogether. <b>Scrambling</b> (slides 57–61) leaves the bit rate and bandwidth untouched and instead replaces only the dangerous runs, on the fly, with a pattern the receiver can recognise and undo.</p>' },

      /* ================= PART 5: scrambling ================= */
      { title: 'Scrambling: B8ZS and HDB3', slides: [57, 61],
        items: [
          { n: 57, title: 'Scrambling',
            says: '<ul><li>The best code is one that does not increase the bandwidth for synchronization and has no DC components.</li>' +
              '<li>Scrambling is a technique used to create a sequence of bits that has the required c/c’s for transmission: self clocking, no low frequencies, no wide bandwidth.</li>' +
              '<li>It is implemented at the same time as encoding; the bit stream is created on the fly.</li>' +
              '<li>It replaces “unfriendly” runs of bits with a violation code that is easy to recognize and removes the unfriendly c/c.</li></ul>',
            means: '<p>“c/c’s” on the slide is shorthand for <i>characteristics</i>. The slide sets the target: a code that is <b>self-clocking</b> (enough transitions), has <b>no low frequencies</b> (no DC) and <b>no wide bandwidth</b> (no extra bits or doubled transitions). The earlier tools each fall short: Manchester doubles the bandwidth (slide 30), block coding adds 25% more bits (slide 54).</p>' +
              '<p><b>Scrambling</b> meets the target by working <i>inside</i> the line encoder:</p><ul>' +
              '<li>It runs <b>on the fly</b>, at the same time as encoding; there is no separate extra stage and nothing is lengthened. Eight 0s are replaced by eight pulse positions, four 0s by four, so $\\c{rate}{N\'} = \\c{rate}{N}$: the data rate and the bandwidth stay as they were (compare 4B/5B’s $\\c{rate}{N} \\times \\frac{5}{4}$).</li>' +
              '<li>It looks for “unfriendly” runs, meaning long strings of 0s that would give a flat line, and swaps each run for a <b>violation code</b>: a pattern that deliberately breaks the line code’s own rule, so legitimate data can never produce it.</li>' +
              '<li>Because the pattern is recognisable, the receiver spots it and turns it back into the original 0s.</li></ul>',
            why: '<p>This slide introduces the third and final fix of the chapter. Multilevel and multitransition coding changed the waveform, block coding added bits; scrambling needs neither, which is why the slide opens with “the best code does not increase the bandwidth”. Slide 58 says which line code it patches, and slides 59–61 give the two named techniques.</p>' +
              '<p><b>Exam angle:</b> definition and comparison questions: “what is scrambling?”, “how does it differ from block coding?” (no extra bits, done on the fly, substitutes a violation code), and “what does the receiver do?”.</p>' },

          { n: 58, title: 'AMI used with scrambling',
            says: '<p>A diagram: <b>Sender</b> → box “Modified AMI encoding” → <b>Link</b> carrying a “Violated digital signal” → box “Modified AMI encoding” (labelled the same way at the receiver) → <b>Receiver</b>.</p>',
            means: '<p><b>Modified AMI</b> is AMI plus scrambling: the line signal follows the usual AMI alternation of the 1s (slide 32), except that wherever the data has a long run of 0s, the encoder substitutes a pattern that contains a deliberate <b>violation</b> of the alternation rule. The waveform on the link is therefore called a “violated digital signal”.</p>' +
              '<p>The sequence in the diagram:</p><ol><li>The sender’s modified-AMI encoder scans the data. Ordinary 1s and 0s become ordinary AMI pulses.</li>' +
              '<li>A run of 0s (eight for B8ZS, four for HDB3) is replaced by a substitution pattern with violations, so the line now has transitions.</li>' +
              '<li>The receiver’s modified-AMI <i>decoder</i> recognises the violations and puts the original 0s back.</li></ol>',
            why: '<p>Why AMI? Because AMI already has no DC component (slide 33); its only weakness is a run of 0s. Scrambling patches that single weakness, which is why the two named techniques of slides 59 and 61 are both defined on top of AMI.</p>' +
              '<p><b>Exam angle:</b> a diagram question (“draw the sender and receiver for AMI with scrambling”) or an MCQ naming the line code that scrambling is used with.</p>',
            error: { says: 'The receiver’s box is labelled “Modified AMI encoding”.', correct: 'The receiver decodes: the box should read “Modified AMI decoding”.' } },

          { n: 59, title: 'Scrambling example: B8ZS',
            says: '<ul><li>B8ZS substitutes eight consecutive zeros with <b>000VB0VB</b>.</li><li>The V stands for violation: it violates the line encoding rule.</li>' +
              '<li>B stands for bipolar: it implements the bipolar line encoding rule.</li></ul>' +
              '<p>“Two cases of B8ZS scrambling technique”: the stream is a <b>1</b> followed by eight 0s (shaded yellow). <b>(a) Previous level is positive</b>: the 1 is +, then <span class="mono">0 0 0 + − 0 − +</span> (V, B, V, B labelled). <b>(b) Previous level is negative</b>: the 1 is −, then <span class="mono">0 0 0 − + 0 + −</span>.</p>',
            means: '<p>B8ZS (bipolar with 8-zero substitution) leaves AMI alone until it meets <b>eight 0s in a row</b>; then it sends the pattern <span class="mono">0 0 0 V B 0 V B</span>. Two kinds of pulse appear in it:</p><ul>' +
              '<li><b>V (violation)</b>: a pulse with the <i>same polarity</i> as the previous pulse, which breaks AMI’s alternation.</li>' +
              '<li><b>B (bipolar)</b>: a pulse with the <i>opposite polarity</i> to the previous pulse, as normal AMI would do.</li></ul>' +
              '<p>Case (a), the previous pulse (the 1) is +:</p><ol>' +
              '<li>0 0 0 → three 0 V cells.</li><li>V → same as the previous pulse (+) → <b>+</b>.</li><li>B → opposite of the previous pulse (+) → <b>−</b>.</li>' +
              '<li>0 → 0 V.</li><li>V → same as the previous pulse (the B, −) → <b>−</b>.</li><li>B → opposite of the previous pulse (−) → <b>+</b>.</li></ol>' +
              '<p>Result <span class="mono">0 0 0 + − 0 − +</span>. Case (b) is the mirror image: <span class="mono">0 0 0 − + 0 + −</span>.</p>' +
              '<figure data-fig="l03a.scramble" data-code="b8zs" data-bits="100000000" data-prev="-1" data-caption="Slide 59 (a): previous level positive, the 1 is + → 000+−0−+."></figure>' +
              '<figure data-fig="l03a.scramble" data-code="b8zs" data-bits="100000000" data-prev="1" data-caption="Slide 59 (b): previous level negative, the 1 is − → 000−+0+−."></figure>' +
              '<p>Why the pattern is well designed (reading it off the figure): it ends with a B of the same polarity as the pulse before the zeros, so AMI continues as if nothing had happened; the pulses inside, + − − + or − + + −, add up to zero, so no DC is introduced; and the four new pulses give the receiver transitions to synchronize on.</p>',
            why: '<p>B8ZS repairs AMI’s only flaw (slide 33) without any extra bits. Eight 0s become eight cells, so the bit rate and bandwidth are unchanged.</p>' +
              '<p><b>Exam angle:</b> a Solving item such as “apply B8ZS to 1 00000000 (previous pulse +/−)”. Steps: write the AMI polarity of the preceding 1, then fill in 000VB0VB. The classic mistake is giving V the <i>alternating</i> polarity; V repeats the previous pulse and B alternates.</p>',
            tip: '<p>“000 V B 0 V B”: V copies the polarity of the pulse before it, B flips it. A quick check of the answer is that it must end with the same polarity the stream had before the zeros.</p>',
            beyond: '<p>Forouzan notes that B8ZS is used in North America, and HDB3 (slide 60) in Europe and Japan. The slides do not mention this.</p>',
            example: { title: 'B8ZS (slide 59, case a: previous level positive)', gen: 'l03a.scramble', params: { code: 'b8zs', bits: '100000000', prev: -1 },
              slideAnswer: '+ 0 0 0 + − 0 − +' } },

          { n: 60, title: 'Scrambling example: HDB3',
            says: '<ul><li>HDB3 substitutes four consecutive zeros with <b>000V</b> or <b>B00V</b>, depending on the number of nonzero pulses after the last substitution.</li>' +
              '<li>If the number of non-zero pulses is even, the substitution is B00V, to make the total number of non-zero pulses even.</li>' +
              '<li>If the number of non-zero pulses is odd, the substitution is 000V, to make the total number of non-zero pulses even.</li></ul>',
            means: '<p>HDB3 reacts to <b>four</b> consecutive 0s (not eight) and has two possible patterns. Which one to use depends on a single count: <b>the number of non-zero pulses since the last substitution</b> (since the start of the stream for the first one).</p>' +
              '<table class="tbl compact"><thead><tr><th>Non-zero pulses since the last substitution</th><th>Pattern</th><th>Pulses it adds</th><th>Total afterwards</th></tr></thead><tbody>' +
              '<tr><td><b>even</b> (0, 2, 4, …)</td><td class="mono">B00V</td><td>2 (B and V)</td><td>even + 2 = <b>even</b></td></tr>' +
              '<tr><td><b>odd</b> (1, 3, 5, …)</td><td class="mono">000V</td><td>1 (V)</td><td>odd + 1 = <b>even</b></td></tr></tbody></table>' +
              '<p>The polarities follow the same rule as B8ZS: <b>V repeats the polarity of the pulse before it</b> and <b>B alternates</b> from the pulse before it. In B00V the V comes right after the B, so it has the B’s polarity. Two short cases (the pulse before the stream is −, so the first 1 is +):</p>' +
              '<figure data-fig="l03a.scramble" data-code="hdb3" data-bits="110000" data-prev="-1" data-parity="0" data-caption="Even count: 11 then 0000, 2 pulses so far → B00V → + − + 0 0 +."></figure>' +
              '<figure data-fig="l03a.scramble" data-code="hdb3" data-bits="10000" data-prev="-1" data-parity="0" data-caption="Odd count: 1 then 0000, 1 pulse so far → 000V → + 0 0 0 +."></figure>' +
              '<p>After every substitution the count <b>restarts at 0</b>. The pulses of the substitution itself (B and V) are not counted again.</p>',
            why: '<p>HDB3 is B8ZS’s lighter relative: it intervenes sooner (after four 0s, so at most three consecutive 0s survive; the slides do not spell out the name, but that is the usual reading of the “3”) and needs the extra count to keep the number of pulses even, which keeps the signal free of DC. Slide 61 works a complete example with all three situations.</p>' +
              '<p><b>Exam angle:</b> Identification (“which substitution when the count is odd?”) and the Solving item on slide 61. Typical mistakes: counting pulses from the start of the stream instead of since the last substitution, including the V and B pulses of an earlier substitution in the count, and swapping even and odd.</p>',
            tip: '<p>“Even → B00V. Odd → 000V.” Even needs <i>two</i> new pulses to stay even (B and V); odd needs <i>one</i> (V).</p>' },

          { n: 61, title: 'Different situations in HDB3 scrambling technique',
            says: '<p>The stream <span class="mono">1 1 0 0 0 0 1 0 0 0 0 0 0 0 0 0</span> with three shaded substitutions: the <b>first</b> (yellow) over 0000 right after the two 1s, the <b>second</b> (blue) over the four 0s after the next 1, and the <b>third</b> (green) over the next four 0s; a final 0 follows. The signal is <span class="mono">+ − | + 0 0 + | − | 0 0 0 − | + 0 0 + | 0</span> with B and V labelled. Markers under the baseline read Even (before the first substitution), Even (after it), Odd (before the second), Even (after the second) and Even (after the third).</p>',
            means: '<p>Following the figure step by step (the pulse before the stream is −, so the first 1 is +):</p>' +
              '<table class="tbl compact"><thead><tr><th>Part of the stream</th><th>Pulses since last substitution</th><th>Rule</th><th>Sent</th></tr></thead><tbody>' +
              '<tr><td class="mono">1 1</td><td>0, 1, 2 → <b>even</b></td><td>plain AMI</td><td class="mono">+ −</td></tr>' +
              '<tr><td>First 0000</td><td>2 (even)</td><td>B00V: B opposite of − → +, V repeats B → +</td><td class="mono">+ 0 0 +</td></tr>' +
              '<tr><td class="mono">1</td><td>count restarted: 1</td><td>AMI alternates from the V (+) → −</td><td class="mono">−</td></tr>' +
              '<tr><td>Second 0000</td><td>1 (<b>odd</b>)</td><td>000V: V repeats the previous pulse (−) → −</td><td class="mono">0 0 0 −</td></tr>' +
              '<tr><td>Third 0000</td><td>0 (even; count restarted at the V)</td><td>B00V: B opposite of − → +, V → +</td><td class="mono">+ 0 0 +</td></tr>' +
              '<tr><td class="mono">0</td><td>no group of four</td><td>stays 0 V</td><td class="mono">0</td></tr></tbody></table>' +
              '<p>Full output: <span class="mono">+ − + 0 0 + − 0 0 0 − + 0 0 + 0</span>. The non-zero pulses number 2 + 2 + 1 + 1 + 2 = 8, an even total, which is what the Even/Odd markers on the slide track.</p>',
            why: '<p>This is the slide that turns slide 60’s rule into a procedure, and the most likely scrambling item in a Solving question. The three coloured blocks are the three cases: first group counted from the start (even → B00V), a group after a single pulse (odd → 000V), and a group straight after another substitution (count 0, even → B00V).</p>' +
              '<p><b>Exam angle:</b> write the AMI pulses first, find each run of four 0s, count since the last substitution, then substitute and restart the count. The final stray 0 is left alone.</p>',
            tip: '<p>Check your answer: after every substitution the running total of non-zero pulses must be even, and no run of four 0s may remain.</p>',
            example: { title: 'HDB3 (slide 61)', gen: 'l03a.scramble', params: { code: 'hdb3', bits: '1100001000000000', prev: -1, parity: 0 },
              slideAnswer: '+ − + 0 0 + − 0 0 0 − + 0 0 + 0' } }
        ],
        together: '<p><b>Scrambling in one picture.</b> The chapter’s recurring problem is a flat line: a long run of 0s gives no transitions to synchronize on. AMI (slide 32) already has no DC component, so scrambling patches only its zero runs.</p>' +
          '<table class="tbl compact"><thead><tr><th>Technique</th><th>Replaces</th><th>Pattern</th><th>Decision rule</th></tr></thead><tbody>' +
          '<tr><td>B8ZS</td><td>eight 0s</td><td class="mono">000VB0VB</td><td>V repeats the previous pulse, B alternates; no count needed</td></tr>' +
          '<tr><td>HDB3</td><td>four 0s</td><td class="mono">000V or B00V</td><td>odd count since last substitution → 000V; even → B00V</td></tr></tbody></table>' +
          '<p>Compared with block coding (rate × 5/4), scrambling keeps $\\c{rate}{N\'} = \\c{rate}{N}$, so the bandwidth does not grow, at the price of a receiver that must recognise violations.</p>' +
          '<p><b>The whole digital-to-digital chapter, then, is a toolbox:</b> pick a waveform (NRZ, Manchester, AMI, 2B1Q, MLT-3), optionally prepare the bits (4B/5B, 8B/10B) or patch the signal (B8ZS, HDB3), and judge the result on bandwidth, DC, synchronization and error detection. In the handwritten marks of the deck, line coding is “Main Section 1”, data rate against signal rate “Main Section 2” and synchronization “Main Section 3”.</p>' +
          '<p>Everything so far started from bits that already exist. The next section of the deck (slide 62 onwards) asks where those bits come from when the source is an <b>analog</b> signal such as speech: <b>pulse code modulation (PCM)</b> samples the signal, quantizes the samples and encodes them as bits, which are then handed to exactly the line codes learned here. The handwritten “Main Section 7” marks PCM.</p>' }
    ],

    terms: [
      { term: '8B6T', def: 'Multilevel code mapping 8 data bits to 6 ternary signal elements (2⁸ = 256 ≤ 3⁶ = 729). Spare patterns allow DC balance: a positively weighted pattern is sent inverted when needed. Average bandwidth 3N/4 in the summary table.', ref: 'L03 p40' },
      { term: '4D-PAM5', def: 'Multilevel code using four wires with five-level pulse amplitude modulation. Slide example: 1 Gbps splits into 250 Mbps per wire at 125 MBd, and 00011110 becomes the levels −2, +1, +2, −1. Average bandwidth N/8.', ref: 'L03 p42' },
      { term: 'xD-YYYz', def: 'Naming pattern for multilevel codes that use several links: x is the number of links (D), YYY the type of modulation (for example PAM) and z the number of levels. Example: 4D-PAM5 = four links, five-level PAM.', ref: 'L03 p41' },
      { term: 'Weighted code', alt: ['code weight'], def: 'A signal pattern counted by its + and − levels; its weight is the number of + minus the number of −. A redundant code may use only 0 or + weighted patterns and send the inverse (− weighted) one to cancel DC. Example: +00++− becomes −00−−+.', ref: 'L03 p39' },
      { term: 'Redundant bits', alt: ['extra bits'], def: 'Extra bits added to the data so that some patterns are illegal. They allow error detection and frequent transitions for synchronization, and they raise the bit rate, e.g. 4B/5B turns N into N × 5/4.', ref: 'L03 p48' },
      { term: '8B/10B', def: 'Block code replacing every 8-bit block by a 10-bit block. It uses a 5B/6B encoder and a 3B/4B encoder in parallel plus a disparity controller, and chooses code words that prevent long runs of one voltage level (DC).', ref: 'L03 p55; L03 p56' },
      { term: 'Disparity controller', alt: ['disparity'], def: 'Part of the 8B/10B encoder that watches the imbalance between the two voltage levels in the stream (the disparity) and chooses code words that keep it near zero, so that no long run of one level builds up a DC component.', ref: 'L03 p55; L03 p56' },
      { term: 'Control sequence', alt: ['4B/5B control words'], def: 'A 5-bit word of the 4B/5B table reserved for signalling instead of data: Q (Quiet) 00000, I (Idle) 11111, H (Halt) 00100, J and K (start delimiters) 11000 and 10001, T (end delimiter) 01101, S (Set) 11001, R (Reset) 00111.', ref: 'L03 p51' },
      { term: 'Modified AMI', def: 'AMI combined with scrambling: runs of 0s are replaced by substitution patterns containing deliberate violations of the alternation rule (the “violated digital signal”), which the receiver recognises and replaces by the original 0s.', ref: 'L03 p58' }
    ],

    keyTerms: ['AMI', 'mBnL', '2B1Q', '8B6T', '4D-PAM5', 'MLT-3', 'Block coding', '4B/5B', '8B/10B', 'Redundant bits', 'Scrambling', 'B8ZS', 'HDB3', 'Violation (V)'],

    faq: [
      { q: 'How do I check that an mBnL code is valid, and what are the spare patterns for?',
        a: '<p>Compute the number of data patterns $2^{\\c{level}{m}}$ and signal patterns $\\c{level}{L}^{\\c{level}{n}}$; the code is valid when $2^{\\c{level}{m}} \\le \\c{level}{L}^{\\c{level}{n}}$. Equality is an exact mapping; when 2<sup>m</sup> is smaller (8B6T: 256 &lt; 729, so 473 spare), the designer can pick the most distinct patterns, treat unused patterns as errors and control the DC component.</p>', ref: 'L03 pp35-36' },
      { q: 'What is the fastest way to encode 2B1Q by hand?',
        a: '<p>Start from a positive level. Look at the sign of the previous level: a first bit of 0 keeps that sign and a 1 flips it; a second bit of 0 gives magnitude 1 and a 1 gives magnitude 3. This reproduces the slide’s table, so 00 11 01 10 01 gives +1, −3, −3, +1, +3.</p>', ref: 'L03 p38' },
      { q: 'What is the difference between mBnL (2B1Q, 8B6T) and mB/nB (4B/5B, 8B/10B)?',
        a: '<p>mBnL (no slash) maps m bits to n signal elements with L voltage levels, so it changes the waveform itself. mB/nB (slash) maps m bits to n bits with a lookup table and adds redundancy; a line code such as NRZ-I still has to turn the longer bit stream into a signal.</p>', ref: 'L03 p37; L03 p48' },
      { q: 'Why is 4B/5B paired with NRZ-I, and what does it cost?',
        a: '<p>NRZ-I loses synchronization only on long runs of 0s, and 4B/5B code words never produce more than three 0s in a row. The cost is that the bit rate grows by 5/4: at 1 Mbps NRZ-I needs 625 kHz instead of 500 kHz (Example 4), still below the 1.25 MHz of Manchester but with a DC component problem.</p>', ref: 'L03 p50; L03 p54' },
      { q: 'MLT-3’s worst case is described as N/4 on slide 45, but the summary table says N/3. Which one is used?',
        a: '<p>They answer different questions. N/4 is the frequency of the periodic worst-case pattern 1111 (period of 4 bits). N/3 is the code’s average bandwidth in the summary table; use N/3 for bandwidth questions and N/4 when asked about the analog equivalent of 1111.</p>', ref: 'L03 p45; L03 p46' },
      { q: 'In HDB3, how do I decide between B00V and 000V?',
        a: '<p>Count the non-zero pulses since the last substitution (from the start of the stream for the first one). Even → B00V, odd → 000V; either way the total number of non-zero pulses becomes even. After each substitution the count restarts at 0.</p>', ref: 'L03 p60; L03 p61' },
      { q: 'How does B8ZS keep the signal free of DC, and how does the receiver find the substitution?',
        a: '<p>000VB0VB contains the pulses V B V B with polarities + − − + (or − + + −), which cancel, and it ends with the polarity the stream had before the zeros. The two V pulses break AMI’s alternation, which a legitimate stream never does, so the receiver recognises them and restores the eight 0s.</p>', ref: 'L03 p59' },
      { q: 'How is scrambling different from block coding?',
        a: '<p>Block coding adds redundant bits before the line code (rate × n/m) and works on every group. Scrambling adds no bits: during line encoding it replaces only the unfriendly runs (eight or four 0s) by a violation pattern, so the data rate and bandwidth are unchanged.</p>', ref: 'L03 p48; L03 p57' }
    ]
  });
})();
