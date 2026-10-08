/* Slide-by-slide walkthrough: L03 slides 1–31 (topic l03a). Contract: docs/AUTHORING.md §3.7.
   Text is written with String.raw (R) so that TeX backslashes in $…$ stay intact. */
(function () {
  'use strict';
  var R = String.raw;
  function C(p) { return ' <span class="chip ref">' + p + '</span>'; }
  function fig(schemes, bits, caption) {
    return '<figure data-fig="l03a.linecode" data-scheme="' + schemes + '" data-bits="' + bits + '" data-caption="' + caption + '"></figure>';
  }

  KIT.walk({
    id: 'l03a-1', topic: 'l03a', range: [1, 31],
    parts: [
      /* ============================ PART 1: slides 1-10 ============================ */
      { title: 'From bits to signal elements: data rate, baud rate and bandwidth', slides: [1, 10],
        items: [
          { n: 1, kind: 'admin', title: 'Title slide',
            says: 'Physical Communication Layer: NSCOM03 Data Communications, “Digital Encoding / Transmission”, prepared by Jerome Gutierrez.' },
          { n: 2, kind: 'admin', title: 'Section divider: Digital to Digital Transmission',
            says: 'Divider titled “Digital to Digital Transmission” with the caption 101010101 → 101010101 (a bit string goes in, the same bit string comes out).' },

          { n: 3, title: 'Line coding (Main Section 1)',
            says: R`<ul><li>Line coding means converting a string of 1s and 0s (digital data) into a sequence of signals that denote the 1s and 0s.</li>
<li>Example: a high voltage level (+V) could represent a “1” and a low voltage level (0 or −V) could represent a “0”.</li></ul>
<p>Handwritten beside the title: <b>“Main section 1”</b>.</p>`,
            means: R`<p><b>Digital data</b> is only a list of bits, an idea with no physical form. A cable, fiber or radio link can carry only something physical (here, a voltage), so every bit has to be turned into a voltage pattern before it is sent. <b>Line coding</b> is the rule that does this: bit in, voltage out. The receiver applies the same rule backwards to get the bits again (slide 4).</p>
<p>The slide's example is just <i>one</i> possible rule: 1 → +V, 0 → −V. A second rule, 1 → +V and 0 → 0 V, is just as valid (slide 21 calls it unipolar NRZ). Send the bits <span class="mono">1 0 1</span> and you get +V, −V, +V under the first rule but +V, 0, +V under the second: same data, two different signals. The rest of the lecture is a catalogue of such rules, each with different strengths and weaknesses.</p>
<p>Two things line coding is <b>not</b>. It does not compress or encrypt anything (the bits are only represented differently), and it is not modulation onto a carrier: in “digital to digital” the signal itself is digital, a few discrete levels. Digital-to-analog conversion comes later, in L04.</p>`,
            why: R`<p>The handwritten <b>“Main section 1”</b> marks line coding as the first of the big headline topics. Together with data rate versus signal rate (“Main Section 2”, slide 8) and synchronization (“Main Section 3”, slide 13), it is where the lecturer is signalling what to study hardest. The exam asks for line encodings drawn by hand, so the goal for slides 3–61 is: given a bit string and a scheme name, draw the waveform; given a waveform, name the scheme and its weaknesses.</p>
<p>The question this slide sets up is “which rule is best?”. Slides 11–17 give the checklist, and slides 20–46 grade each scheme against it. A typical identification item: “the conversion of a string of 1s and 0s into a sequence of signals” → <i>line coding</i>.</p>` },

          { n: 4, title: 'Line coding and decoding',
            says: R`<p>A figure of the whole chain. A <b>Sender</b> computer holds digital data <span class="mono">0101 ⋯ 101</span>. An <b>Encoder</b> box turns it into a <b>digital signal</b> (a pink stepped waveform with a “…” gap, drawn between axes) that travels over the <b>Link</b>. A <b>Decoder</b> box in front of the <b>Receiver</b> computer turns the signal back into digital data <span class="mono">0101 ⋯ 101</span>.</p>`,
            means: R`<ol><li>The sender has the bits <span class="mono">0101 ⋯ 101</span>.</li>
<li>The <b>encoder</b> maps those bits to signal levels using a line-coding rule and puts the resulting digital signal on the <b>link</b> (the cable or other medium).</li>
<li>The <b>decoder</b> at the receiving end measures the incoming signal, applies the rule in reverse and rebuilds the bits.</li>
<li>The receiver ends up with exactly the bit string the sender started with. Only the form in the middle is different.</li></ol>
<p>The decoder faces two hard questions all the time: <i>what level am I looking at?</i> (it needs a trustworthy reference, slide 11) and <i>where does one bit end and the next begin?</i> (it needs timing, slide 13). The rest of the lecture is about designing encoders whose output makes both answers easy.</p>
<p>The two ends must also agree in advance on the rule and on conventions such as the starting level. That is why, when you draw a waveform in the exam, you should write down the convention you used.</p>`,
            why: R`<p>This picture is the frame for every scheme from slide 20 on: each scheme is a different rule inside the encoder box, and the decoder undoes it. The scrambling slides near the end of the deck (slide 58) redraw the same sender → encoder → decoder pipeline.</p>
<p>Exam angle: an essay such as “Explain line coding” earns marks for this diagram, drawn and labelled (sender, encoder, digital signal on the link, decoder, receiver). The data going in and out are identical; only the representation in between changes. A usual slip is to label the link signal “analog”; here it carries a digital signal.</p>` },

          { n: 5, title: 'Mapping data symbols onto signal levels',
            says: R`<ul><li>A <b>data symbol (or element)</b> can consist of a number of data bits: <span class="mono">1, 0</span> or <span class="mono">11, 10, 01, …</span></li>
<li>A data symbol can be coded into a <b>single signal element or multiple signal elements</b>: <span class="mono">1 → +V, 0 → −V</span> or <span class="mono">1 → +V and −V, 0 → −V and +V</span>.</li>
<li>The ratio <b>‘r’</b> is the number of data elements carried by a signal element.</li></ul>`,
            means: R`<p>Two units keep everything in this lecture straight:</p>
<ul><li>A <b>data element</b> is a unit of <i>information</i> the sender wants to deliver: one bit (<span class="mono">1</span> or <span class="mono">0</span>), or a group of bits treated as one symbol (<span class="mono">11</span>, <span class="mono">10</span>, <span class="mono">01</span>, …).</li>
<li>A <b>signal element</b> is a unit of the <i>signal</i>: the shortest stretch of waveform with a constant level. It is what the hardware actually puts on the wire.</li></ul>
<p>The encoder maps data elements onto signal elements. The slide shows two styles, and slide 7 adds a third:</p>
<table class="tbl compact"><thead><tr><th>Mapping</th><th>Data elements</th><th>Signal elements</th><th>$\c{level}{r}$</th></tr></thead><tbody>
<tr><td><span class="mono">1 → +V, 0 → −V</span></td><td>1 bit</td><td>1 level</td><td>$\c{level}{r} = 1$</td></tr>
<tr><td><span class="mono">1 → +V and −V, 0 → −V and +V</span></td><td>1 bit</td><td>2 levels (two halves)</td><td>$\c{level}{r} = \frac{1}{2}$</td></tr>
<tr><td>11, 10, 01 … → one level each (slide 7c)</td><td>2 bits</td><td>1 level</td><td>$\c{level}{r} = 2$</td></tr></tbody></table>
<p>The ratio is $\c{level}{r} = \frac{\text{data elements}}{\text{signal elements}}$. A big $\c{level}{r}$ means each signal element carries more information, so fewer elements per second are needed. It is the same thought as in L02, where $\c{level}{L}$ levels can carry $\log_2 \c{level}{L}$ bits each.${C('L02 p14')}</p>`,
            why: R`<p>Slide 6 names the two quantities (bits per second, signal elements per second); slide 8 joins them through $\c{level}{r}$. So r is the bridge variable, and nearly every “solving” item in this lecture starts with <i>what is r for this scheme?</i> (NRZ: 1; RZ and Manchester: ½; 2B1Q: 2, on later slides).</p>
<p>Exam angle: MCQ or identification on “data element versus signal element” (information versus voltage) and on “r = data elements per signal element”. The usual slip is inverting the ratio: a scheme that spends <i>two</i> signal elements on one bit has r = ½, not 2.</p>`,
            error: { says: 'The second mapping, “1 → +V and −V, 0 → −V and +V”, makes a 1 a high→low pair.',
              correct: 'The Manchester legend on slide 29 is the opposite: 0 is high→low and 1 is low→high. Slide 5 only illustrates “two signal elements per bit”; for drawings follow slide 29 and state your convention.' } },

          { n: 6, title: 'Relationship between data rate and signal rate',
            says: R`<ul><li>The <b>data rate</b> defines the number of bits sent per second (bps). It is often referred to as the <b>bit rate</b>.</li>
<li>The <b>signal rate</b> is the number of signal elements sent in a second and is measured in <b>bauds</b>. It is also referred to as the <b>modulation rate</b>.</li>
<li>Goal: increase the data rate whilst reducing the baud rate.</li></ul>`,
            means: R`<p>Two counters watch the same stream:</p>
<table class="tbl compact"><thead><tr><th></th><th>Counts</th><th>Unit</th><th>Other names</th><th>Symbol</th></tr></thead><tbody>
<tr><td><b>Data rate</b></td><td>bits per second</td><td>bps</td><td>bit rate</td><td>$\c{rate}{N}$</td></tr>
<tr><td><b>Signal rate</b></td><td>signal elements per second</td><td>baud</td><td>baud rate, modulation rate</td><td>$\c{baud}{S}$</td></tr></tbody></table>
<p>Picture a bus company. Bits are passengers, signal elements are bus trips, and $\c{level}{r}$ is how many passengers fit on one bus. With 1,000 passengers per second and 2 per bus you need only 500 trips per second; with a tiny bus that carries half a passenger (each bit needs two signal elements) you need 2,000 trips. Ignoring the case factor for now (it arrives on slide 8):</p>
<ul><li>$\c{level}{r} = 1$: $\c{rate}{1,000} \times \frac{1}{1} = \c{baud}{1,000}$ baud</li>
<li>$\c{level}{r} = 2$: $\c{rate}{1,000} \times \frac{1}{2} = \c{baud}{500}$ baud</li>
<li>$\c{level}{r} = \frac{1}{2}$: $\c{rate}{1,000} \times 2 = \c{baud}{2,000}$ baud</li></ul>
<p><b>Why that goal?</b> A higher data rate is the point of the link. A lower baud rate means the signal changes less often, which, as slide 25 will state, means a narrower bandwidth. Raising r (more bits per signal element) achieves both, but slide 17 warns it costs complexity.</p>`,
            why: R`<p>The next slide's heading, “Main Section 2”, is data rate versus signal rate, so the vocabulary here is examinable word for word: <i>bits per second = data rate = bit rate</i>; <i>signal elements per second = signal rate = baud rate = modulation rate</i>. Identification items give the definition and ask for the term, or the reverse.</p>
<p>Forward links: slide 8 turns the relationship into a formula, slide 25 turns baud into minimum bandwidth, and slide 46 tabulates the signal rate of every scheme. Typical mistake: answering a baud question in bps (or the other way round).</p>`,
            tip: R`<p>Baud counts signal elements, bps counts bits. They are the same number only when $c \times \frac{1}{\c{level}{r}} = 1$, so never write “baud” and “bps” interchangeably.</p>` },

          { n: 7, title: 'Signal element versus data element',
            says: R`<p>Four panels, each with a bit pattern on top and a stepped waveform below; cyan marks show the signal elements.</p>
<ul><li><b>a.</b> One data element per one signal element (<b>r = 1</b>): bits 1 0 1 drawn as three flat levels.</li>
<li><b>b.</b> One data element per two signal elements (<b>r = ½</b>): bits 1 0 1, each bit drawn as two signal elements.</li>
<li><b>c.</b> Two data elements per one signal element (<b>r = 2</b>): bits 11 | 01 | 11 drawn as three levels (11 → +, 01 → −, 11 → +).</li>
<li><b>d.</b> Four data elements per three signal elements (<b>r = 4/3</b>): the four bits 1101 spread over three signal elements at different levels.</li></ul>
<p>Handwritten at the left: <b>“sub section”</b>.</p>`,
            means: R`<p>Read each panel as “how many bits sit on each flat piece of signal?”:</p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Panel</th><th>Data elements</th><th>Signal elements</th><th>$\c{level}{r}$</th><th>Signal elements for 1,000 data elements</th></tr></thead><tbody>
<tr><td>a</td><td>1</td><td>1</td><td>$\c{level}{r} = 1$</td><td>1,000</td></tr>
<tr><td>b</td><td>1</td><td>2</td><td>$\c{level}{r} = \frac{1}{2}$</td><td>2,000</td></tr>
<tr><td>c</td><td>2</td><td>1</td><td>$\c{level}{r} = 2$</td><td>500</td></tr>
<tr><td>d</td><td>4</td><td>3</td><td>$\c{level}{r} = \frac{4}{3}$</td><td>750</td></tr></tbody></table></div>
<ul><li><b>Panel a</b> is the straight mapping used by the NRZ codes (slides 20–25).</li>
<li><b>Panel b</b> is what RZ and the biphase codes do (slides 26–30): each bit takes two signal elements, so there are more signal elements than bits and r falls below 1.</li>
<li><b>Panel c</b> packs two bits into one level. To tell the four bit pairs apart you need four levels, which is the multilevel idea of 2B1Q (slide 38); the panel happens to show only two of the four pairs.</li>
<li><b>Panel d</b> is a fractional ratio: 4 bits over 3 elements, like 8B6T (slide 40: 8 bits over 6 ternary elements).</li></ul>
<p>Counting trick: mark the boundaries between data elements, then count how many flat stretches of the signal fall between two boundaries. One stretch per data element is r = 1; two stretches is r = ½; one stretch spanning two data elements is r = 2.</p>`,
            why: R`<p>This is the figure behind the whole ratio idea. If you can look at a waveform and say “two flat pieces per bit”, you can read r off the picture and put it into the formula on slide 8; slide 9's example is panel a.</p>
<p>The handwritten “sub section” tag says it is a supporting point to know. Expect an identification or MCQ item that shows one of the four panels and asks for r or for the number of signal elements, or gives r and asks which panel matches. The trap is the same as on slide 5: r is data over signal, so panel b is ½, not 2.</p>` },

          { n: 8, title: 'Data rate and baud rate (Main Section 2)',
            says: R`<ul><li>The baud or signal rate can be expressed as: <b>S = c × N × 1/r bauds</b>.</li></ul>
<ul><li>where N is the data rate</li><li>c is the case factor (worst, best &amp; avg.)</li><li>r is the ratio between data element &amp; signal element</li></ul>
<p>Handwritten above the formula: <b>“Main Section 2”</b>.</p>`,
            means: R`$$\c{baud}{S} = c \times \c{rate}{N} \times \frac{1}{\c{level}{r}}$$
<ul><li>$\c{baud}{S}$: the signal rate in <b>baud</b>, i.e. signal elements per second (orange throughout the kit).</li>
<li>$\c{rate}{N}$: the data rate in <b>bps</b> (blue).</li>
<li>$\c{level}{r}$: data elements per signal element (violet), read from slide 5 or 7.</li>
<li>$c$: the <b>case factor</b>, a plain number between 0 and 1 (uncoloured, as it is not a physical quantity): worst case 1, best case 0, <b>average ½</b>. The slides use ½ in every example.${C('L03 p25')}</li></ul>
<p>Reading the formula: more bits per second means more signal elements per second; a bigger r means fewer. The case factor c says how the actual data pattern scales the signal rate: the worst pattern gives the highest rate (c = 1), the best pattern the lowest (c = 0), and a typical one lies half way.</p>
<p><b>Recipe for any rate question:</b></p>
<ol><li>Find r (from the scheme or the figure).</li><li>Take c = ½ unless the question says worst or best case.</li><li>Compute $\c{baud}{S} = c \times \c{rate}{N} \times \frac{1}{\c{level}{r}}$ and give the answer in baud.</li><li>If a bandwidth is asked, $\c{bw}{B_{\text{min}}} = \c{baud}{S}$ (slide 25).</li></ol>
<p>Try all four r values of slide 7 at the same data rate, $\c{rate}{8,000}$ bps, with c = ½:</p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Panel</th><th>Calculation</th></tr></thead><tbody>
<tr><td>a, r = 1</td><td>$\c{baud}{S} = \frac{1}{2} \times \c{rate}{8,000} \times \frac{1}{\c{level}{1}} = \c{baud}{4,000}$ baud</td></tr>
<tr><td>b, r = ½</td><td>$\c{baud}{S} = \frac{1}{2} \times \c{rate}{8,000} \times \frac{1}{\c{level}{1/2}} = \c{baud}{8,000}$ baud</td></tr>
<tr><td>c, r = 2</td><td>$\c{baud}{S} = \frac{1}{2} \times \c{rate}{8,000} \times \frac{1}{\c{level}{2}} = \c{baud}{2,000}$ baud</td></tr>
<tr><td>d, r = 4/3</td><td>$\c{baud}{S} = \frac{1}{2} \times \c{rate}{8,000} \times \frac{1}{\c{level}{4/3}} = \c{baud}{3,000}$ baud</td></tr></tbody></table></div>
<p>The pattern to memorise: r = ½ doubles the signal rate relative to r = 1, r = 2 halves it. These are exactly the N/2, N and N/4 entries of the summary table on slide 46 (NRZ, Manchester, 2B1Q).</p>`,
            why: R`<p>“Main Section 2” is this formula: it is the single most computable item in the lecture. Example 1 (slide 9) and Example 3 (slide 25) are direct applications, and Example 4 on slide 54 applies it after block coding has multiplied N by 5/4. In the exam this is the “solving” item: show the formula, substitute with units, and state the answer in baud (and in Hz if bandwidth is asked).</p>
<p>Typical mistakes: flipping r (using r instead of 1/r), forgetting c = ½, and mixing up S (baud) with N (bps). Slide 25 also prints the formula with a typo (“× R”); the correct term is 1/r.</p>`,
            tip: R`<p>r is in the denominator: if r doubles, S halves. Bigger buses, fewer trips. If you can say that sentence, you will not flip the ratio.</p>`,
            beyond: R`<p>Forouzan explains that the case factor depends on the data pattern and the scheme: the worst case is the pattern that makes the signal change most often. The slides only use the three named values 1, ½ and 0.</p>` },

          { n: 9, title: 'Example 1: average baud rate (sub section)',
            says: R`<p><b>Problem.</b> A signal is carrying data in which one data element is encoded as one signal element (r = 1). If the bit rate is 100 kbps, what is the average value of the baud rate if c is between 0 and 1?</p>
<p><b>Solution on the slide.</b> Assume the average value of c is ½. The baud rate is then S = c × N × 1/r = ½ × 100,000 × 1/1 = 50,000 = <b>50 kbaud</b>.</p>
<p>Handwritten next to the title: <b>“Sub section”</b>.</p>`,
            means: R`<ol><li><b>Read off r.</b> “One data element encoded as one signal element” is panel a of slide 7, so $\c{level}{r} = 1$.</li>
<li><b>Read off N.</b> 100 kbps $= \c{rate}{100,000}$ bps.</li>
<li><b>Choose c.</b> The problem says only that c lies between 0 and 1, so take the average, $c = \frac{1}{2}$.</li>
<li><b>Substitute.</b> $\c{baud}{S} = \frac{1}{2} \times \c{rate}{100,000} \times \frac{1}{\c{level}{1}} = \c{baud}{50,000}$ baud $= 50$ kbaud.</li></ol>
<p>In words: one signal element per bit would be 100 kbaud at most (c = 1, the worst case), but for typical data the slides count half of that, 50 kbaud. Slide 25 will say that the channel needs at least as many hertz as this baud rate, so about 50 kHz here.</p>`,
            why: R`<p>This is the template for the “solving” item of this lecture: identify r, take c = ½, multiply, write the unit. The arithmetic is one line (half of 100,000), so the marks are in setting it up correctly and stating baud, not bps. The handwritten “Sub section” says worked examples are fair game.</p>
<p>Variants you can do without a calculator: r = 1 and N = 1 Mbps gives 500 kbaud (Example 3, slide 25); r = ½ doubles the answer (Manchester); r = 2 halves it; if the question asks for the worst case, drop the ½.</p>`,
            example: { title: 'Example 1: average baud rate', gen: 'l03a.baud', params: { rCase: 'a', N: 100000 },
              slideAnswer: R`$\c{baud}{S} = \frac{1}{2} \times \c{rate}{100,000} \times \frac{1}{\c{level}{1}} = \c{baud}{50,000}$ baud = 50 kbaud`, slideValue: 50000, input: 'S' } },

          { n: 10, title: 'Note on bandwidth with a digital signal',
            says: R`<ul><li>Although the actual bandwidth of a digital signal is infinite, the effective bandwidth is finite.</li>
<li>Remember that the maximum data rate of a channel according to Nyquist in a noiseless channel is $\c{rate}{N_{\max}} = 2 \times \c{bw}{B} \times \log_2 \c{level}{L}$.</li></ul>
<p>Handwritten under the formula: <b>“sub-section”</b>.</p>`,
            means: R`<p><b>Why “infinite”?</b> A digital signal jumps instantly from one level to another. L02 showed that such a sharp edge can only be built from infinitely many sine waves: a square wave is a sum of f, 3f, 9f, … with falling amplitudes.${C('L02 p12')} So, strictly, no real channel can carry a digital signal untouched.</p>
<p><b>Why “finite” in practice?</b> Nearly all of the signal's power sits in a limited range of frequencies. That range is the <b>effective bandwidth</b>. The curves of power $\c{snr}{P}$ against $\c{freq}{f}/\c{rate}{N}$ on slides 23, 27 and 29 are exactly this idea: the shaded hump is the part the channel must pass.</p>
<p><b>Nyquist.</b> For a noiseless channel with bandwidth $\c{bw}{B}$ and $\c{level}{L}$ signal levels, $\c{rate}{N_{\max}} = 2 \times \c{bw}{B} \times \log_2 \c{level}{L}$ (L02 p29). Rearranged:</p>
$$\c{bw}{B} = \frac{\c{rate}{N}}{2 \log_2 \c{level}{L}}$$
<ul><li>Two levels, $\log_2 2 = 1$: $\c{bw}{B} = \frac{\c{rate}{N}}{2}$. That is exactly the minimum bandwidth NRZ turns out to need (slide 25: 1 Mbps needs 500 kHz).</li>
<li>Four levels, $\log_2 4 = 2$: $\c{bw}{B} = \frac{\c{rate}{N}}{4}$, the N/4 that 2B1Q reaches on slide 46.</li></ul>
<p>(That last step is a consistency check using the slide's own formula, not something the slide states.) Do not confuse this with Shannon's formula, which is for noisy channels (L02 p31).</p>`,
            why: R`<p>Slide 8 gave the signal rate; this slide ties it to the physical channel, and slide 25 will state the working rule $\c{bw}{B_{\text{min}}} = \c{baud}{S}$. So “lower the baud rate” (slide 6's goal) is not an abstract nicety: it directly lowers the bandwidth you need.</p>
<p>The handwritten “sub-section” under the Nyquist formula says the lecturer wants this linked to line coding. Exam angle: identification or true/false (“the effective bandwidth of a digital signal is finite”, “its actual bandwidth is infinite”) and a Nyquist computation for a given B and L. Mistake: using Shannon's capacity where Nyquist is asked, or the reverse.</p>`,
            ref: 'L02 p29; L02 p12' }
        ],
        together: R`<p>One picture for slides 1–10: <b>bits go in, a signal comes out, and the channel must carry that signal.</b></p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Step</th><th>What happens</th><th>Slides</th></tr></thead><tbody>
<tr><td>1 Encode</td><td>The encoder maps data elements to signal elements by a line-coding rule; the decoder reverses it and returns the same bits</td><td>3–5</td></tr>
<tr><td>2 Count</td><td>The data rate $\c{rate}{N}$ (bps) counts bits, the signal rate $\c{baud}{S}$ (baud) counts signal elements, and $\c{level}{r}$ links them</td><td>6–7</td></tr>
<tr><td>3 Formula</td><td>$\c{baud}{S} = c \times \c{rate}{N} \times \frac{1}{\c{level}{r}}$, with $c = \frac{1}{2}$ on average</td><td>8–9</td></tr>
<tr><td>4 Channel</td><td>The effective bandwidth is finite and follows the signal rate; Nyquist caps the data rate for a given $\c{bw}{B}$ and $\c{level}{L}$</td><td>10</td></tr></tbody></table></div>
<p>Anchor example: 100 kbps with r = 1 gives 50 kbaud. Rules of thumb: a larger r gives a lower baud rate and so a lower bandwidth; r below 1, as when each bit is sent as two halves, gives a higher baud rate. The handwritten marks so far are Main Section 1 (line coding, slide 3) and Main Section 2 (data rate versus signal rate, slide 8), with “sub section” on slides 7, 9 and 10.</p>
<p>That leaves the design question: <i>what makes one mapping better than another?</i> Slides 11–17 answer it with a checklist: baseline wandering, DC component, self-synchronization, error detection, noise immunity and complexity.</p>` },
      /* ============================ PART 2: slides 11-17 ============================ */
      { title: 'What makes a good line code?', slides: [11, 17],
        items: [
          { n: 11, title: 'Baseline wandering',
            says: R`<ul><li>A good line encoding scheme will prevent long runs of fixed amplitude.</li>
<li>This is to prevent <b>baseline wandering</b> (highlighted in blue on the slide).
<ul><li>In decoding a digital signal, the receiver calculates a running average of the received signal power; this average is called the <b>baseline</b>.</li>
<li>A long string of 0s or 1s can cause a drift in the baseline (baseline wandering) and make it difficult for the receiver to decode correctly.</li></ul></li></ul>`,
            means: R`<p>To decide whether a received level is a 1 or a 0, the receiver compares it with a reference. It is not told this reference in advance; it <i>computes</i> it as a running average of the signal power it has been receiving, the <b>baseline</b>. If highs and lows arrive about equally often, the average sits between them and every comparison is easy.</p>
<p>Now send a long run of one level, for example eight 0s in NRZ-L (where 0 = +V). The running average slowly slides toward that level: the baseline <i>drifts</i>, which is <b>baseline wandering</b>. With levels +1 V and −1 V:</p>
<ol><li>Mixed data: the average stays near 0 V, so +1 V and −1 V are each a full volt from the reference.</li>
<li>After a long run of +1 V the average creeps toward +1 V, so the very same +1 V is only a small fraction of a volt above the reference.</li>
<li>A little noise is now enough to push a reading across the reference, and the receiver decodes a wrong bit.</li></ol>
${fig('nrzl,nrzi,manchester', '00000000', 'Eight 0s. NRZ-L and NRZ-I hold one level for the whole run (a long fixed amplitude, drawn with NRZ-L 0 = +V and NRZ-I starting at +V). Manchester keeps changing level, so its average stays put.')}
<p>The cure is in the slide's first sentence: a good code <b>prevents long runs of fixed amplitude</b>, because a signal that keeps changing level keeps the running average steady.</p>`,
            why: R`<p>This opens the six-point checklist of slides 11–17, and it is the first reason better schemes exist. Unipolar NRZ and NRZ-L suffer most (slides 20 and 24); RZ, the biphase codes and AMI are listed as free of baseline wandering (slides 26, 30 and 33).</p>
<p>Exam angle: definitions (“the running average of the received signal power is called the ___” → <i>baseline</i>) and “which problem does a long string of 0s or 1s cause?” → baseline wandering. Do not confuse it with the DC component on the next slide: wandering is what the receiver's average does; the DC component is the zero-frequency content of the signal.</p>` },

          { n: 12, title: 'DC components',
            says: R`<ul><li>When the voltage level remains constant for long periods of time, there is an increase in the low frequencies of the signal.
<ul><li>Most channels are bandpass and may not support the low frequencies.</li></ul></li>
<li>This will require the removal of the dc component of a transmitted signal.</li></ul>`,
            means: R`<p><b>DC</b> (direct current) means “zero frequency”: the steady, average part of a signal. A waveform that holds one voltage for a long time has a large average, so its spectrum has a lot of energy at very low frequencies, close to 0 Hz. The power curve on slide 23 shows this directly: for NRZ the power $\c{snr}{P}$ is greatest at $\c{freq}{f} = 0$.</p>
<p>The trouble is the channel. A <b>bandpass</b> channel passes only a band of frequencies that starts above 0 Hz,${C('L02 p18')} and the slide says most channels are of this kind. Energy placed where the channel does not pass is lost or distorted, so long flat stretches sag and decoding errors follow, the same symptom as on slide 11 seen from the channel's side.</p>
<p>The remedy is a code with <b>no DC component</b>: its average level over time is zero, i.e. it spends as much time positive as negative. Compare four 1s in a row:</p>
<ul><li>Unipolar NRZ (1 = +V): +V, +V, +V, +V, average +V. Pure DC.</li>
<li>NRZ-L (1 = −V on slide 23): −V, −V, −V, −V, average −V. Still DC.</li>
<li>Manchester (1 = low→high): (−+)(−+)(−+)(−+), half the time −V and half +V, average 0. No DC, whatever the data.</li></ul>`,
            why: R`<p>“Has a DC component or not” is one of the columns of the slide-46 summary table, so it is a staple of MCQ and identification items. Codes with a DC problem in this part of the deck: unipolar NRZ, NRZ-L and NRZ-I (slides 20 and 24). Codes without: RZ, Manchester, differential Manchester (slides 26 and 30) and the bipolar codes (slide 33).</p>
<p>Mistake: reading “DC” as direct current flowing in the wire. Here it is the zero-frequency part of the signal's spectrum, and “removal of the DC component” means choosing a code (or a filter) so that this part is absent. Baseline wandering (slide 11) and DC (this slide) are two views of the same cause, long runs of one level; keep both in your definitions.</p>`,
            ref: 'L02 p18' },

          { n: 13, title: 'Self synchronization (Main Section 3, “replicate”)',
            says: R`<ul><li>Clocks at the sender and the receiver must have the same bit interval.</li>
<li>If the receiver clock is faster or slower it will misinterpret the incoming bit stream.</li></ul>
<p><b>Figure “Effects of Lack of Synchronization”</b> (time axis, dashed lines at the bit boundaries):</p>
<ul><li><b>a. Sent:</b> bits 1 0 1 1 0 0 0 1 …, drawn high for 1 and low for 0.</li>
<li><b>b. Received:</b> the same waveform read by a faster clock as 1 1 0 1 1 1 0 0 0 0 1 1 …, which is 12 bit slots where 8 were sent.</li></ul>
<p>Handwritten: <b>“Main Section 3”</b> with a blue line running down toward the received waveform, and the word <b>“replicate”</b> at the bottom left.</p>`,
            means: R`<p>A digital link has no separate clock wire. The receiver has its own clock and uses it to decide <i>when</i> to look at the line. If its tick is not exactly the sender's <b>bit interval</b> (the duration of one bit), it samples too often or too rarely.</p>
<p>Walk through the figure:</p>
<ol><li>The sender transmits 8 bits in a fixed time: <span class="mono">1 0 1 1 0 0 0 1</span>.</li>
<li>A faster receiver clock ticks 12 times in the same time, so it reads some sender bits more than once.</li>
<li>Reading the received waveform slot by slot gives <span class="mono">1 1 0 1 1 1 0 0 0 0 1 1</span>.</li>
<li>Run by run against the sender: the first 1 is read twice (<span class="mono">11</span>), the 0 once, the pair 11 three times (<span class="mono">111</span>), the run 000 four times (<span class="mono">0000</span>) and the last 1 twice (<span class="mono">11</span>). That is 2 + 1 + 3 + 4 + 2 = 12 slots.</li>
<li>The result is a different, longer bit string. The receiver has silently inserted bits, and everything after the first slip is shifted.</li></ol>
${'<figure data-fig="l03a.drift"></figure>'}
<p>The damage is worst inside <b>long runs</b>. With no edges to look at, the receiver can only count its own ticks, so any clock error piles up. If the signal changed level often, every change would give the receiver a chance to re-align its clock. A code whose signal carries enough transitions for that is <b>self-synchronizing</b>. Slides 26 and 30 (RZ and Manchester) have a guaranteed transition in every bit; slides 24 and 33 flag the codes that lack it.</p>`,
            why: R`<p>Of the handwritten “Main Section” marks, this is the third: <b>synchronization</b>. The line from the heading to the received waveform, plus the word <b>replicate</b>, say: be able to reproduce this figure and explain it. A likely essay prompt: <i>what happens when the receiver clock is faster or slower than the sender's, and how does a line code prevent it?</i> Answer with the picture, the 8 → 12 bits result and “self-synchronization through transitions”.</p>
<p>Slide 14 puts numbers on the same effect; slides 24 and 33 mark NRZ and bipolar codes as lacking synchronization on long runs; slides 26 and 30 give RZ and Manchester their cure. Mistake to avoid: a faster receiver clock <i>adds</i> bits (a slower one drops them); neither “loses the signal”.</p>`,
            tip: R`<p><b>“replicate” means: be able to redraw this.</b> Draw 8 equal bit cells for <span class="mono">10110001</span> (high for 1, low for 0) and label it Sent. Underneath draw the same waveform divided into 12 narrower cells, copy the level the sent waveform has in each cell, and you get <span class="mono">110111000011</span>. Label it Received and note that the receiver clock is faster.</p>` },

          { n: 14, title: 'Example 2: a receiver clock that is 0.1% fast (sub-section)',
            says: R`<p><b>Problem.</b> In a digital transmission, the receiver clock is 0.1 percent faster than the sender clock. How many extra bits per second does the receiver receive if the data rate is 1 kbps? How many if the data rate is 1 Mbps?</p>
<p><b>Solution on the slide.</b> At 1 kbps the receiver receives 1001 bps instead of 1000 bps (1000 bits sent, 1001 bits received, <b>1 extra bps</b>). At 1 Mbps it receives 1,001,000 bps instead of 1,000,000 bps (1,000,000 bits sent, 1,001,000 received, <b>1000 extra bps</b>).</p>
<p>Handwritten next to the title: <b>“Sub-section”</b>.</p>`,
            means: R`<ol><li><b>Convert the error.</b> 0.1 percent $= 0.1 \div 100 = 0.001 = \frac{1}{1000}$. The receiver counts one extra bit for every 1,000 sent.</li>
<li><b>At 1 kbps.</b> $\c{rate}{1,000} \times 0.001 = 1$ extra bit per second, so the receiver gets $\c{rate}{1,001}$ bps instead of $\c{rate}{1,000}$ bps.</li>
<li><b>At 1 Mbps.</b> $\c{rate}{1,000,000} \times 0.001 = 1,000$ extra bits per second, so the receiver gets $\c{rate}{1,001,000}$ bps instead of $\c{rate}{1,000,000}$ bps.</li></ol>
<p><b>The lesson.</b> The relative error is identical, but the number of bad bits per second is 1,000 times larger on the 1,000 times faster link. A clock “accurate to 0.1%” is tolerable at 1 kbps (one stray bit per second) and hopeless at 1 Mbps (a thousand per second). Fast links therefore cannot rely on free-running clocks; the signal itself has to carry timing, which is self-synchronization. If the receiver clock were 0.1% <i>slower</i>, the same count of bits would be <i>missing</i> instead of extra (999 received per 1,000 sent).</p>`,
            why: R`<p>This is a likely small “solving” item (marked “Sub-section”), and it needs no calculator: move the decimal point. The usual mistakes are reading 0.1% as 0.1 instead of 0.001, and subtracting instead of adding when the receiver clock is faster.</p>
<p>It also gives the numbers behind slide 13's picture: slide 13 showed <i>what</i> goes wrong, this slide shows <i>how fast</i> it grows with the data rate, and slides 26 and 30 show the codes that fix it.</p>`,
            example: { title: 'Example 2: a receiver clock that is 0.1% fast', gen: 'l03a.drift', params: { pct: 0.1, dir: 'fast', N1: 1000, N2: 1e6 },
              slideAnswer: R`At $\c{rate}{1,000}$ bps: $\c{rate}{1,001}$ bps received, 1 extra bps. At $\c{rate}{1,000,000}$ bps: $\c{rate}{1,001,000}$ bps received, 1000 extra bps.`, slideValue: 1, input: 'x1' } },

          { n: 15, title: 'Error detection',
            says: R`<ul><li>Errors occur during transmission due to line impairments.</li>
<li>Some codes are constructed such that when an error occurs it can be detected.</li>
<li>For example: a particular signal transition is not part of the code. When it occurs, the receiver will know that a symbol error has occurred.</li></ul>`,
            means: R`<p><b>Line impairments</b> are the things L02 listed that damage a signal on its way: attenuation, distortion and noise.${C('L02 p38')} A damaged level can look like a different but legal level, so the receiver may silently decode a wrong bit.</p>
<p>The slide's idea is <b>detection by illegal patterns</b>. A code defines which signal patterns are allowed. If the line corrupts a pattern into one the code can never produce, the receiver knows a <b>symbol error</b> has occurred. A made-up toy code makes it concrete: if a code sends 1 as +V and 0 as −V and <i>never</i> uses 0 V, then receiving 0 V cannot be legal, so it must be an error.</p>
<p>Two limits. First, detection only <i>notices</i> an error; the slide says nothing about correcting it. Second, it needs spare patterns (<b>redundancy</b>): if every possible pattern is legal, no error can be recognised. None of the codes on slides 20–30 has spare patterns, and each of their slides says so: unipolar NRZ (slide 20), NRZ-L and NRZ-I (slide 24), RZ (slide 26), Manchester and differential Manchester (slide 30), all “no error detection”. Detection arrives later with codes that leave signal patterns unused (the multilevel codes, slide 36) and with block coding (slide 48 onwards).</p>`,
            why: R`<p>This is the fourth item of the checklist. In this stretch of the deck the answer is always “none”, and those summary lines are free marks in identification and MCQ items. The distinction to keep is between <b>detecting</b> an error (this slide: the receiver knows something went wrong) and being <b>immune</b> to it (next slide: the error does not happen).</p>
<p>Do not claim Manchester or AMI detect errors because they have “rules”; the slides say they do not.</p>`,
            ref: 'L02 p38' },

          { n: 16, title: 'Noise and interference',
            says: R`<ul><li>There are line encoding techniques that make the transmitted signal “immune” to noise and interference.</li>
<li>This means that the signal cannot be corrupted; it is stronger than error detection.</li></ul>`,
            means: R`<p>Two different defences against line impairments:</p>
<table class="tbl compact"><thead><tr><th></th><th>Error detection (slide 15)</th><th>Noise and interference immunity (slide 16)</th></tr></thead><tbody>
<tr><td>When it acts</td><td>After the damage: the receiver notices an illegal pattern</td><td>Before it: the damage does not change what is decoded</td></tr>
<tr><td>Outcome</td><td>“An error happened” (the bit is still wrong)</td><td>The right bit is still recovered</td></tr>
<tr><td>The slide's verdict</td><td>Possible with some codes</td><td>“Stronger than error detection”</td></tr></tbody></table>
<p>How can a code be immune? By making the legal signals so different from each other that noise of the size expected on the line cannot turn one into another. With only +V and −V, for example, noise must exceed V in size, and in the right direction, to flip a bit. A code that has more signal patterns than data patterns can pick only the most distinct patterns, which is the idea slide 36 uses for multilevel codes.</p>
<p>Read “cannot be corrupted” as “strongly resistant”. Taken literally it overstates the case: no code makes a signal physically untouchable by noise; the point is that decoding stays correct until the noise gets very large.</p>`,
            why: R`<p>This is the fifth item of the checklist. Exam angle: an MCQ or essay asks you to differentiate error detection from noise immunity; the clean answer is “detection is after the fact, immunity is prevention, which is stronger”. It also sets up slide 36, where unused signal patterns of a multilevel code serve as error detectors while the chosen ones are spaced for noise immunity. Mistake: treating the two as synonyms.</p>`,
            beyond: R`<p>Forouzan adds that differential codes (NRZ-I, differential Manchester) keep working if the two wires are swapped, because the data is in the <i>change</i> of level, not in its polarity.</p>` },

          { n: 17, title: 'Complexity',
            says: R`<ul><li>The more robust and resilient the code, the more complex it is to implement, and the price is often paid in baud rate or required bandwidth.</li></ul>`,
            means: R`<p>This is the “no free lunch” slide: every good property of slides 11–16 has to be paid for. The slide names two currencies, <b>baud rate</b> and <b>bandwidth</b> (they move together, since $\c{bw}{B_{\text{min}}} = \c{baud}{S}$ on slide 25), plus the cost of building a more complicated encoder and decoder. Examples you are about to meet:</p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>You want</th><th>How a code gets it</th><th>The price</th><th>Slides</th></tr></thead><tbody>
<tr><td>Self-synchronization and no DC</td><td>A level transition in every bit (RZ, Manchester)</td><td>Two signal elements per bit, so $\c{baud}{S} = \c{rate}{N}$ and the bandwidth is twice NRZ's $\c{rate}{N}/2$</td><td>26, 30</td></tr>
<tr><td>No DC and a transition per bit</td><td>Three voltage levels (RZ)</td><td>“More complex as it uses three voltage level”</td><td>26</td></tr>
<tr><td>A low baud rate and bandwidth</td><td>More bits per signal element (large r)</td><td>More levels to tell apart: the multilevel codes</td><td>34–42</td></tr>
<tr><td>Error detection</td><td>Spare, unused patterns</td><td>Redundancy: extra signal patterns or bits</td><td>36, 48</td></tr></tbody></table></div>
<p>The design skill is to choose the cheapest code that fixes the problem you actually have, not the most robust code available.</p>`,
            why: R`<p>This closes the checklist and is the sentence to end every “compare the line codes” essay with: name the property gained, then the price (bandwidth, baud rate, complexity). Slide 46's summary table later lays the same trade-offs side by side.</p>
<p>Exam angle: MCQ or true/false such as “a more robust code is simpler to implement” (false) or “the price of robustness is often paid in bandwidth” (true). Mistake: describing any scheme as best on every count; the slides never do.</p>` }
        ],
        together: R`<p>Slides 11–17 are one checklist for judging a line code. Keep the six properties and the slide each lives on:</p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Property</th><th>The problem</th><th>What a good code does</th><th>Slide</th></tr></thead><tbody>
<tr><td>Baseline wandering</td><td>Long runs drag the receiver's running average</td><td>Avoids long runs of fixed amplitude</td><td>11</td></tr>
<tr><td>DC component</td><td>Constant level means low-frequency energy that bandpass channels cannot pass</td><td>Averages to zero</td><td>12</td></tr>
<tr><td>Self-synchronization</td><td>Clocks must share the bit interval (0.1% off is 1,000 stray bits per second at 1 Mbps)</td><td>Puts transitions in the signal</td><td>13–14</td></tr>
<tr><td>Error detection</td><td>Impairments change symbols</td><td>Makes some patterns illegal</td><td>15</td></tr>
<tr><td>Noise immunity</td><td>Noise and interference</td><td>Spaces the legal signals widely (stronger than detection)</td><td>16</td></tr>
<tr><td>Complexity</td><td>Robustness is not free</td><td>Pays in baud rate, bandwidth, hardware</td><td>17</td></tr></tbody></table></div>
<p>The first three are the ones the handwritten marks stress (“replicate” and Main Section 3 on slide 13, “Sub-section” on the clock-drift example), and the first two both come from the same cause: long runs of one level. Every scheme from now on is graded on this list, and most are better at some items than others.</p>
<p>Slide 18 starts the catalogue. Slide 19 shows the family tree, and the first schemes (unipolar, then polar NRZ) will score badly on baseline wandering, DC and synchronization, which motivates everything after them.</p>` },
      /* ============================ PART 3: slides 18-25 ============================ */
      { title: 'The line-coding schemes begin: unipolar and polar NRZ', slides: [18, 25],
        items: [
          { n: 18, kind: 'admin', title: 'Section divider: Line Coding Schemes',
            says: 'Divider titled “Line Coding Schemes”; the catalogue of schemes starts on the next slide.' },

          { n: 19, title: 'Line coding schemes: the family tree',
            says: R`<p>A tree diagram: <b>Line coding</b> branches into five yellow boxes, each with its example schemes in pink:</p>
<ul><li><b>Unipolar</b>: NRZ</li>
<li><b>Polar</b>: NRZ, RZ, and biphase (Manchester, and differential Manchester)</li>
<li><b>Bipolar</b>: AMI and pseudoternary</li>
<li><b>Multilevel</b>: 2B/1Q, 8B/6T and 4D-PAM5</li>
<li><b>Multitransition</b>: MLT-3</li></ul>
<p>Handwritten marks: “Line Coding: Un…” above the diagram, a tall bracket down the left side and a few scribbles beside the first three branches (too faint to quote reliably).</p>`,
            means: R`<p>This tree is the table of contents for the rest of the lecture. Each box is a <b>family</b>, grouped by how its signal levels are used:</p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Family</th><th>How the levels are used</th><th>Schemes</th><th>Slides</th></tr></thead><tbody>
<tr><td><b>Unipolar</b></td><td>All levels on one side of the time axis</td><td>NRZ</td><td>20–21</td></tr>
<tr><td><b>Polar</b></td><td>Levels on both sides of the axis (+V and −V)</td><td>NRZ-L, NRZ-I, RZ, Manchester, differential Manchester</td><td>22–30</td></tr>
<tr><td><b>Bipolar</b></td><td>Three levels +, 0, −; one symbol is 0 V, the other alternates + and −</td><td>AMI, pseudoternary</td><td>31–33</td></tr>
<tr><td><b>Multilevel</b></td><td>Several levels, so each signal element carries more bits</td><td>2B1Q, 8B6T, 4D-PAM5</td><td>34–42</td></tr>
<tr><td><b>Multitransition</b></td><td>Cycles through three levels with a rule for each move</td><td>MLT-3</td><td>43–45</td></tr></tbody></table></div>
<p>A memory aid for the names (not slide text): <i>uni</i> = one side of the axis, <i>polar</i> = two sides, <i>bi</i>polar = positive, zero and negative with the non-zero symbol alternating. This slide is the authority on classification: RZ, Manchester and differential Manchester are <i>polar</i> codes, and slides 20–33 of this lecture cover the first three families.</p>`,
            why: R`<p>The tree turns “draw this scheme” and “name this scheme” into a map: if you can place every scheme in its family, you can recall its levels, its rules and its slide. The scribbles and the bracket show the lecturer marked this slide up, so treat the whole tree as examinable. Typical MCQ or identification items: “Manchester is a ___ code” (polar, biphase), “AMI is a ___ code” (bipolar), “the family whose levels lie on only one side of the axis” (unipolar).</p>
<p>Careful with the summary table on slide 46, which mislabels NRZ-L, NRZ-I and biphase as “Unipolar”; this tree is right.</p>`,
            error: { says: 'The multilevel box writes the codes as “2B/1Q, 8B/6T”, with a slash.',
              correct: 'The slash belongs to block codes (mB/nB, such as 4B/5B). Multilevel codes are written 2B1Q and 8B6T (mBnL).' } },

          { n: [20, 21], title: 'Unipolar NRZ',
            says: R`<p><b>Slide 20, Unipolar:</b></p>
<ul><li>All signal levels are on one side of the time axis, either above or below.</li>
<li>NRZ (Non Return to Zero) is an example of this code. The signal level does not return to zero during a symbol transmission.</li>
<li>The scheme is prone to baseline wandering and DC components. It has no synchronization or any error detection. It is simple but costly in power consumption.</li></ul>
<p><b>Slide 21, Unipolar NRZ scheme:</b> amplitude against time for the bits 1 0 1 1 0 with dashed bit boundaries: a 1 is at level V, a 0 is at 0. Beside it a yellow box, “Normalized power”: ½V² + ½(0)² = ½V².</p>`,
            means: R`<p><b>Unipolar</b> means every signal level lies on one side of the time axis; here 0 V and +V. <b>NRZ</b> (non-return-to-zero) means the level is held for the whole bit and does not drop back to zero in the middle. Rule: <b>1 → +V, 0 → 0 V</b>.</p>
<p>The slide's bits, one by one: <span class="mono">1 0 1 1 0</span> → V, 0, V, V, 0.</p>
${fig('unipolar', '10110', 'Slide 21: 10110 in unipolar NRZ (1 = +V, 0 = 0 V).')}
<p><b>Normalized power.</b> Assume 1s and 0s are equally likely. A 1 delivers power $V^2$ and a 0 delivers none, so the average is $\frac{1}{2}V^2 + \frac{1}{2} \times 0 = \frac{1}{2}V^2$. The slide only calls the scheme “costly in power consumption”; the box is the number behind that remark.</p>
<p>Check the scheme against the slide 11–17 checklist: long runs of 1s or 0s are flat (baseline wandering), a nonzero average means DC, nothing marks the bit boundaries (no synchronization), and every pattern is legal (no error detection). It scores well on one thing only: simplicity.</p>`,
            why: R`<p>Unipolar NRZ is the baseline against which later codes are judged, and each fix in the deck answers one of its flaws: use both polarities (polar, slide 22), add transitions (RZ and biphase, slides 26–30), alternate polarity (bipolar, slide 31). As an exam item it appears as identification (“all levels on one side of the time axis”) and as a drawing rule (1 = +V, 0 = 0 V).</p>
<p>Common mistake: drawing the 0 as −V, which makes it polar. The summary table of slide 46 lists unipolar NRZ at an average bandwidth of N/2.</p>`,
            ref: 'L03 p46' },

          { n: 22, title: 'Polar NRZ: NRZ-L and NRZ-I',
            says: R`<ul><li>The voltages are on both sides of the time axis.</li>
<li>Polar NRZ can be implemented with two voltages, e.g. +V for 1 and −V for 0.</li>
<li>There are two versions:
<ul><li><b>NRZ-Level (NRZ-L)</b>: a positive voltage for one symbol and negative for the other.</li>
<li><b>NRZ-Inversion (NRZ-I)</b>: the change or lack of change in polarity determines the value of a symbol; e.g. a “1” symbol inverts the polarity, a “0” does not.</li></ul></li></ul>
<p>(The footer “4.22” is a leftover textbook slide number.)</p>`,
            means: R`<p><b>Polar</b> means the signal uses voltages on both sides of the axis, here +V and −V. Both versions still use two levels held for the whole bit, so each bit is one signal element: $\c{level}{r} = 1$.</p>
<ul><li><b>NRZ-L</b> (level): the <i>level itself</i> is the bit. Like a light switch, the position says on or off. Decode by looking at the voltage.</li>
<li><b>NRZ-I</b> (inversion): the <i>change</i> is the bit. Like a toggle button, a press (an inversion of the polarity) means 1 and no press means 0. Decode by comparing each bit's level with the previous level.</li></ul>
<p>“Inversion” is the flip of the polarity, +V to −V or −V to +V, made at the <b>start</b> of the bit. Because NRZ-I is relative, the first bit needs a reference: the slide's figure (slide 23) assumes the signal was at +V before the first bit.</p>
<p>The slide's own wording and its figure disagree on which polarity belongs to 1 in NRZ-L (see the error note). For the exam, follow the figure on slide 23 (0 = +V, 1 = −V) and write that convention next to your drawing.</p>`,
            why: R`<p>Polar NRZ fixes one thing about unipolar NRZ: the signal now has both polarities, so the average can be near zero. It does not fix long runs, so the problems of slides 11–13 remain (slide 24). Slide 23 draws both versions for the same bits, and that drawing is the most likely hand-drawn item in the first half of this lecture.</p>
<p>Exam angle: “which NRZ version uses the change in polarity to carry the bit?” → NRZ-I. Mistake: inverting NRZ-I on a 0, or inverting at the end of the bit instead of the start.</p>`,
            error: { says: 'Text: “+V for 1 and −V for 0”, and “NZR – Level (NRZ-L)”.',
              correct: 'The NRZ-L figure on slide 23 draws 0 = +V and 1 = −V; either polarity is only a convention, so state yours. “NZR” is a typo for NRZ.' },
            tip: R`<p>NRZ-L: <b>L</b>evel tells the bit. NRZ-I: <b>I</b>nvert on a one (and a zero leaves the level alone).</p>` },

          { n: 23, title: 'Polar NRZ-L and NRZ-I schemes (the drawing)',
            says: R`<p>A figure for the bits <b>0 1 0 0 1 1 1 0</b> with dashed bit boundaries:</p>
<ul><li><b>NRZ-L:</b> high for the first 0, low for the 1, high for 0 0, low for 1 1 1, high for the last 0.</li>
<li><b>NRZ-I:</b> starts high; at each bit boundary a dot marks the decision. A <b>filled dot</b> means “Inversion: next bit is 1”, an <b>open dot</b> means “No inversion: next bit is 0”.</li>
<li>Inset (yellow box): <b>r = 1</b> and <b>S<sub>ave</sub> = N/2</b>, with a power curve P against f/N: P = 1 at f = 0, falling to 0 near f/N = 1, with a small bump out to 2; the area under it is labelled “Bandwidth”.</li></ul>`,
            means: R`<p>Build both waveforms one bit at a time. NRZ-L needs only the bit; NRZ-I needs the previous level (start at +).</p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Bit</th><th class="mono">0</th><th class="mono">1</th><th class="mono">0</th><th class="mono">0</th><th class="mono">1</th><th class="mono">1</th><th class="mono">1</th><th class="mono">0</th></tr></thead><tbody>
<tr><td>NRZ-L (0 = +V, 1 = −V)</td><td>+</td><td>−</td><td>+</td><td>+</td><td>−</td><td>−</td><td>−</td><td>+</td></tr>
<tr><td>NRZ-I: action at the start of the bit</td><td>keep</td><td>invert</td><td>keep</td><td>keep</td><td>invert</td><td>invert</td><td>invert</td><td>keep</td></tr>
<tr><td>NRZ-I level (start +)</td><td>+</td><td>−</td><td>−</td><td>−</td><td>+</td><td>−</td><td>+</td><td>+</td></tr></tbody></table></div>
${fig('nrzl,nrzi', '01001110', 'Slide 23: 01001110 in NRZ-L (0 = +V) and NRZ-I (a 1 inverts; the level before the first bit is +V).')}
<p>Reading the dots: the dot sits on the boundary and names the <i>next</i> bit. Filled dots appear before the 1s at bits 2, 5, 6 and 7, where the NRZ-I line flips; open dots appear before the 0s, where it holds.</p>
<p>The inset says r = 1 (one signal element per bit) and $\c{baud}{S_{\text{avg}}} = \frac{\c{rate}{N}}{2}$, from $\frac{1}{2} \times \c{rate}{N} \times \frac{1}{\c{level}{1}}$. The power curve peaks at $\c{freq}{f} = 0$: most of NRZ's power sits at very low frequencies, which is the DC problem of slide 12 drawn as a graph.</p>`,
            why: R`<p>This is a classic hand-drawn exam item: “draw this bit string in NRZ-L and NRZ-I”. Mark yourself on: (1) one level per bit; (2) NRZ-L follows the 0 = +V, 1 = −V figure; (3) NRZ-I flips at the start of each 1 and holds on each 0; (4) the starting level is stated. Checking by decoding is easy: for NRZ-I, count a 1 wherever the level changed.</p>
<p>Typical errors: inverting on 0s, forgetting that a leading 1 flips from the starting level, drawing NRZ-I transitions in the middle of a bit, and mixing the NRZ-L polarity halfway through an answer.</p>`,
            tip: R`<p>For NRZ-I write the previous level, then ask of each bit “is it a 1?”: if so, flip, otherwise copy. The first bit is compared with the assumed starting level +.</p>`,
            example: { title: 'Draw NRZ-L and NRZ-I (slide 23)', gen: 'l03a.draw', params: { bits: '01001110', schemes: ['nrzl', 'nrzi'] },
              slideAnswer: 'NRZ-L: + − + + − − − + · NRZ-I: + − − − + − + +' } },

          { n: 24, title: 'Note on NRZ schemes',
            says: R`<ul><li>In NRZ-L the level of the voltage determines the value of the bit.</li>
<li>In NRZ-I the inversion or the lack of inversion determines the value of the bit.</li>
<li>NRZ-L and NRZ-I both have an average signal rate of N/2 baud.</li>
<li>NRZ-L and NRZ-I both have a DC component problem and baseline wandering; it is worse for NRZ-L.
<ul><li>Both have no self-synchronization and no error detection. Both are relatively simple to implement.</li></ul></li></ul>`,
            means: R`<div class="table-wrap"><table class="tbl compact"><thead><tr><th></th><th>NRZ-L</th><th>NRZ-I</th></tr></thead><tbody>
<tr><td>Bit value is decided by</td><td>the level of the voltage</td><td>the inversion, or lack of it</td></tr>
<tr><td>Average signal rate</td><td>$\c{baud}{S_{\text{avg}}} = \frac{\c{rate}{N}}{2}$</td><td>$\c{baud}{S_{\text{avg}}} = \frac{\c{rate}{N}}{2}$</td></tr>
<tr><td>DC component and baseline wandering</td><td>yes, the worse of the two</td><td>yes</td></tr>
<tr><td>Self-synchronization</td><td>none</td><td>none</td></tr>
<tr><td>Error detection</td><td>none</td><td>none</td></tr>
<tr><td>Implementation</td><td>relatively simple</td><td>relatively simple</td></tr></tbody></table></div>
<p><b>Why S<sub>avg</sub> = N/2:</b> r = 1 and c = ½ give $\c{baud}{S} = \frac{1}{2} \times \c{rate}{N} \times 1$. Example 3 on the next slide plugs in numbers.</p>
<p><b>Why NRZ-L is worse.</b> Take the bits 1 1 1 1 0 0 0 0. NRZ-L is flat for the four 1s <i>and</i> flat for the four 0s. NRZ-I flips at every 1, so it is busy during the 1s and flat only during the 0s. Hence NRZ-I's DC and wandering trouble is milder, and slide 46 spells out the matching synchronization difference: NRZ-L loses synchronization on long runs of either bit, NRZ-I only on long runs of 0s.${C('L03 p46')}</p>
${fig('nrzl,nrzi', '11110000', 'Bits 11110000: NRZ-L is flat for each run; NRZ-I flips on every 1 and is flat only for the 0s (same conventions as slide 23).')}`,
            why: R`<p>This slide is a ready-made answer to “describe the NRZ schemes” and a source of MCQ and true/false items. Memorise it as a row of the slide-46 table: NRZ-L and NRZ-I, B = N/2, DC and no self-synchronization, simple. The one comparative claim is “worse for NRZ-L”.</p>
<p>Links: the problems named here are the slide 11, 12 and 13 items; the cure is on slides 26–30. Mistake: saying NRZ-I has no DC problem. It has a milder one, but it does not disappear.</p>` },

          { n: 25, title: 'Example 3: NRZ-I at 1 Mbps (sub section)',
            says: R`<p><b>Problem.</b> A system is using NRZ-I to transfer 1-Mbps data. What are the average signal rate and the minimum bandwidth?</p>
<p><b>Solution on the slide.</b> The average signal rate is S = c × N × R = ½ × N × 1 = <b>500 kbaud</b>. The minimum bandwidth for this average baud rate is B<sub>min</sub> = S = <b>500 kHz</b>.</p>
<p>Note on the slide: c = ½ for the average case, as the worst case is 1 and the best case is 0. Handwritten next to the title: <b>“Sub section”</b>.</p>`,
            means: R`<ol><li><b>r.</b> NRZ-I sends one signal element per bit (slide 23): $\c{level}{r} = 1$.</li>
<li><b>c.</b> Average case: $c = \frac{1}{2}$.</li>
<li><b>Signal rate.</b> $\c{baud}{S} = c \times \c{rate}{N} \times \frac{1}{\c{level}{r}} = \frac{1}{2} \times \c{rate}{1,000,000} \times \frac{1}{\c{level}{1}} = \c{baud}{500,000}$ baud, i.e. 500 kbaud.</li>
<li><b>Bandwidth.</b> The new rule on this slide: the minimum bandwidth in hertz equals the average signal rate in baud, $\c{bw}{B_{\text{min}}} = \c{baud}{S} = \c{bw}{500,000}$ Hz $= 500$ kHz.</li></ol>
<p>So NRZ-I squeezes 2 bits into every hertz, consistent with Nyquist for two levels (slide 10: $\c{bw}{B} = \frac{\c{rate}{N}}{2}$). The worst case, c = 1, would give 1 Mbaud and 1 MHz; the best case, c = 0, would give none. For comparison, slide 30 says Manchester needs twice as much, here 1 MHz.</p>`,
            why: R`<p>This is the full solving template: <i>r → c → S → B<sub>min</sub></i>, with units baud then hertz. It is marked “Sub section”, so expect a version with another scheme or rate (change r and the result changes: Manchester doubles it, 2B1Q quarters it). Example 4 on slide 54 first multiplies N by 5/4 for 4B/5B and then applies exactly these steps.</p>
<p>Mistakes: answering in bps; forgetting that B<sub>min</sub> equals S rather than N; and halving twice. Check yourself: for NRZ the bandwidth is always half the bit rate.</p>`,
            error: { says: 'The solution writes the formula as “S = c × N × R”.',
              correct: 'The formula is S = c × N × 1/r. With r = 1 the number is unaffected (500 kbaud), but the slide-8 formula is the one to use.' },
            example: { title: 'Example 3: NRZ-I at 1 Mbps', gen: 'l03a.baud', params: { scheme: 'nrzi', N: 1e6 },
              slideAnswer: R`$\c{baud}{S} = \frac{1}{2} \times \c{rate}{1,000,000} \times 1 = \c{baud}{500,000}$ baud; $\c{bw}{B_{\text{min}}} = \c{baud}{S} = \c{bw}{500,000}$ Hz`, slideValue: 500000, input: 'S' } }
        ],
        together: R`<p>Slides 18–25 open the catalogue with the two simplest families. The tree on slide 19 organises everything: unipolar, polar, bipolar, multilevel, multitransition. The first three codes you can now draw:</p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Scheme</th><th>Rule</th><th>$\c{baud}{S_{\text{avg}}}$</th><th>Weak on</th></tr></thead><tbody>
<tr><td>Unipolar NRZ</td><td>1 = +V, 0 = 0 V</td><td>$\frac{\c{rate}{N}}{2}$</td><td>DC, wandering, no sync, no error detection; costly in power</td></tr>
<tr><td>NRZ-L</td><td>The level is the bit (figure: 0 = +V, 1 = −V)</td><td>$\frac{\c{rate}{N}}{2}$</td><td>DC and wandering (worse), no sync on long runs of either bit</td></tr>
<tr><td>NRZ-I</td><td>A 1 inverts at the start of the bit, a 0 holds (start +)</td><td>$\frac{\c{rate}{N}}{2}$</td><td>DC and wandering, no sync on long 0s</td></tr></tbody></table></div>
<p>The anchor drawing is the one bit string <span class="mono">01001110</span>: NRZ-L gives + − + + − − − + and NRZ-I gives + − − − + − + +. The anchor calculation is Example 3: NRZ-I at 1 Mbps needs $\c{baud}{S} = \c{baud}{500}$ kbaud and $\c{bw}{B_{\text{min}}} = \c{bw}{500}$ kHz, using $\c{bw}{B_{\text{min}}} = \c{baud}{S}$.</p>
<p>All three are narrow (N/2) and simple, but none keeps the receiver in step during a long run, and their power sits at low frequencies. The next slides fix that by forcing a transition into every bit: RZ (slides 26–27), then Manchester and differential Manchester (slides 28–30). The price, as slide 17 warned, is a signal rate that doubles to N.</p>` },
      /* ============================ PART 4: slides 26-31 ============================ */
      { title: 'A transition in every bit: RZ, Manchester, differential Manchester, and the start of bipolar', slides: [26, 31],
        items: [
          { n: [26, 27], title: 'Polar RZ (return to zero)',
            says: R`<p><b>Slide 26, Polar – RZ</b> (handwritten: “sub section”):</p>
<ul><li>The Return to Zero (RZ) scheme uses three voltage values: +, 0, −.</li>
<li>Each symbol has a transition in the middle, either from high to zero or from low to zero.</li>
<li>This scheme has more signal transitions (two per symbol) and therefore requires a wider bandwidth.</li>
<li>No DC components or baseline wandering.</li>
<li>Self-synchronization: the transition indicates the symbol value.</li>
<li>More complex as it uses three voltage levels. It has no error detection capability.</li></ul>
<p><b>Slide 27, Polar RZ scheme:</b> the bits 0 1 0 0 1. A 0 is a short pulse below the axis (−V, then back to 0) and a 1 is a short pulse above it (+V, then back to 0). Inset: <b>r = ½</b>, <b>S<sub>ave</sub> = N</b>, and a power curve P against f/N that starts at 0 at f = 0, peaks at 1 around f/N = 1 and returns to 0 by f/N = 2, labelled “Bandwidth”. Blue pen marks highlight the voltage levels and the bit row.</p>`,
            means: R`<p>RZ gives every bit <b>two halves</b>. The first half carries the value, <b>1 → +V</b> and <b>0 → −V</b>; the second half is always <b>0 V</b>, so the signal “returns to zero”. For the slide's bits <span class="mono">0 1 0 0 1</span> the waveform is (−0)(+0)(−0)(−0)(+0), where each bracket is one bit and 0 means 0 V.</p>
${fig('rz', '01001', 'Slide 27: 01001 in RZ (1 = +V then 0, 0 = −V then 0).')}
<p>Each slide bullet has a consequence you can work out:</p>
<ul><li><b>Three levels</b> (+, 0, −) for binary data: more complicated hardware than a two-level code.</li>
<li><b>Two signal elements per bit</b>, so $\c{level}{r} = \frac{1}{2}$ and $\c{baud}{S} = \frac{1}{2} \times \c{rate}{N} \times \frac{1}{\c{level}{1/2}} = \c{baud}{N}$. The minimum bandwidth is $\c{bw}{B_{\text{min}}} = \c{baud}{S} = \c{rate}{N}$, twice NRZ's $\frac{\c{rate}{N}}{2}$. The hump of the inset, centred on f/N = 1, is this wider bandwidth.</li>
<li><b>Self-synchronization</b>: every bit contains a transition to zero in the middle, even inside a long run: 0 0 0 0 gives (−0)(−0)(−0)(−0), so the line still toggles between −V and 0. Those regular transitions are the receiver's clock ticks.</li>
<li><b>No DC component or baseline wandering</b>: the power curve here starts at 0 when f = 0, whereas the NRZ curve on slide 23 was at its maximum there.</li>
<li><b>No error detection</b>, as the slide states.</li></ul>`,
            why: R`<p>RZ is the first code that attacks the problems of slides 11–13 by brute force: put a transition in every bit. It buys self-synchronization and no DC, and pays with double bandwidth (slide 17's trade-off) and three levels. That cost motivates the biphase codes on slide 28, which get the same benefits with only two levels.</p>
<p>Exam angle (marked “sub section”): identification (“three levels, a transition in the middle of every bit, self-synchronizing” → RZ), a drawing item (1 = +V then 0, 0 = −V then 0) and an MCQ on its bandwidth (N, twice NRZ's). Do not confuse RZ with bipolar (slide 31), which also uses three levels but never returns to zero inside a bit.</p>`,
            example: { title: 'Draw RZ (slide 27)', gen: 'l03a.draw', params: { bits: '01001', schemes: ['rz'] },
              slideAnswer: 'RZ: (−0)(+0)(−0)(−0)(+0)' } },

          { n: 28, title: 'Polar biphase: Manchester and differential Manchester',
            says: R`<ul><li><b>Manchester</b> coding consists of combining the NRZ-L and RZ schemes.
<ul><li>Every symbol has a level transition in the middle: from high to low or low to high. It uses only two voltage levels.</li></ul></li>
<li><b>Differential Manchester</b> coding consists of combining the NRZ-I and RZ schemes.
<ul><li>Every symbol has a level transition in the middle. But the level at the beginning of the symbol is determined by the symbol value. One symbol causes a level change, the other does not.</li></ul></li></ul>`,
            means: R`<p><b>Biphase</b> means each bit is made of two phases (halves) at opposite levels. Take RZ's guaranteed middle transition, but instead of dropping to 0 V swing to the <i>opposite</i> level, so only two voltages are needed.</p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th></th><th>Manchester</th><th>Differential Manchester</th></tr></thead><tbody>
<tr><td>Built from</td><td>NRZ-L + RZ (an absolute rule)</td><td>NRZ-I + RZ (a relative rule)</td></tr>
<tr><td>Transition in the middle of every bit</td><td>always: it is the clock</td><td>always: it is the clock</td></tr>
<tr><td>Where the data is</td><td>in the <b>direction</b> of the mid-bit transition</td><td>in whether there is a transition at the <b>start</b> of the bit</td></tr>
<tr><td>Levels used</td><td>two</td><td>two</td></tr></tbody></table></div>
<p>The slide says only that “one symbol causes a level change, the other does not” in differential Manchester; which symbol is which comes from the figure on slide 29: a <b>0</b> has a transition at the start of the bit, a 1 does not. Likewise for Manchester, slide 29's legend says 0 is a high→low step and 1 a low→high step.</p>
<p>Both give every bit two signal elements, so $\c{level}{r} = \frac{1}{2}$ and $\c{baud}{S_{\text{avg}}} = \c{rate}{N}$, the same as RZ (slide 30 confirms the doubled bandwidth).</p>`,
            why: R`<p>These two are the most-asked drawing items after NRZ-L and NRZ-I, and the slide 28 definitions (“Manchester = NRZ-L + RZ”, “differential Manchester = NRZ-I + RZ”) are textbook identification answers. The key distinction for MCQs: in Manchester the information is the <i>direction</i> of the mid-bit transition; in differential Manchester it is the <i>presence or absence of a transition at the start</i> of the bit, while the mid-bit transition is only the clock.</p>
<p>Mistake: thinking the mid-bit transition carries the data in <i>both</i> schemes. Slide 29 gives the legends and the drawing.</p>`,
            beyond: R`<p>Forouzan notes that classic 10 Mbps Ethernet (IEEE 802.3) uses Manchester and that token ring (IEEE 802.5) uses differential Manchester; the IEEE 802 family is listed in L01.</p>`,
            ref: 'L01 p9' },

          { n: 29, title: 'Manchester and differential Manchester (the drawing)',
            says: R`<p>A figure for the bits <b>0 1 0 0 1 1</b>.</p>
<ul><li>A yellow legend at the top: “<b>0 is</b>” followed by a step-down symbol (high→low) and “<b>1 is</b>” followed by a step-up symbol (low→high).</li>
<li><b>Manchester:</b> every bit crosses the axis in the middle; a 0 goes high then low, a 1 goes low then high.</li>
<li><b>Differential Manchester:</b> also a mid-bit transition in every bit; dots at the bit boundaries: an <b>open dot</b> is “No inversion: next bit is 1”, a <b>filled dot</b> is “Inversion: next bit is 0”.</li>
<li>Inset: <b>r = ½</b>, <b>S<sub>ave</sub> = N</b>, power curve P against f/N: a hump (peak about 0.5) between 0 and about 2, with P = 0 at f = 0, labelled “Bandwidth”.</li></ul>`,
            means: R`<p>Write each bit as a pair (first half, second half). <b>Manchester</b> is read straight off the legend: 0 → (+ −), 1 → (− +). <b>Differential Manchester</b> needs the level the previous bit <i>ended</i> on (assumed + before the first bit): a 0 starts with a transition away from that level, a 1 starts at the same level, and then the mid-bit transition always follows.</p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Bit</th><th class="mono">0</th><th class="mono">1</th><th class="mono">0</th><th class="mono">0</th><th class="mono">1</th><th class="mono">1</th></tr></thead><tbody>
<tr><td>Manchester</td><td>(+ −)</td><td>(− +)</td><td>(+ −)</td><td>(+ −)</td><td>(− +)</td><td>(− +)</td></tr>
<tr><td>Diff. Manchester: previous bit ended at</td><td>+ (assumed)</td><td>+</td><td>−</td><td>−</td><td>−</td><td>+</td></tr>
<tr><td>Diff. Manchester: transition at the start?</td><td>yes (0)</td><td>no (1)</td><td>yes (0)</td><td>yes (0)</td><td>no (1)</td><td>no (1)</td></tr>
<tr><td>Diff. Manchester cell</td><td>(− +)</td><td>(+ −)</td><td>(+ −)</td><td>(+ −)</td><td>(− +)</td><td>(+ −)</td></tr></tbody></table></div>
${fig('manchester,dmanchester', '010011', 'Slide 29: 010011 in Manchester (0 = high→low, 1 = low→high) and differential Manchester (a 0 changes level at the start of the bit; the level before the first bit is +V).')}
<p>Check the first differential bit: before it the level is +, the bit is 0, so the signal first drops to −, and the mid-bit transition takes it up to +: cell (− +). The dots on the slide confirm the rule: open dots (no inversion) sit before the 1s, filled dots (inversion) before the 0s. Note this is the <i>opposite</i> association from NRZ-I, where an inversion marks a 1.</p>
<p>The inset shows $\c{baud}{S_{\text{avg}}} = \c{rate}{N}$ with $\c{level}{r} = \frac{1}{2}$, and no power at $\c{freq}{f} = 0$, the picture behind “no DC component”.</p>`,
            why: R`<p>This figure is the single most likely hand-drawn exam item: “draw this bit string in Manchester and differential Manchester”. A reliable method is to draw the mid-bit transitions first as a skeleton, then settle each bit's start level (Manchester: from the legend; differential: from the previous end level and the bit). State your starting level and legend.</p>
<p>Typical errors: reversing the Manchester direction (slide 5's text has it the other way round, but follow the slide 29 legend); forgetting the extra jump at a bit boundary when two equal bits follow each other (that is correct and unavoidable); treating differential Manchester's first bit as if there were no earlier level.</p>`,
            tip: R`<p>Manchester: “one goes <b>up</b>, zero goes down” in the middle. Differential Manchester: “<b>zero changes</b> at the start”, and a mid-bit change always.</p>`,
            example: { title: 'Draw Manchester and differential Manchester (slide 29)', gen: 'l03a.draw', params: { bits: '010011', schemes: ['manchester', 'dmanchester'] },
              slideAnswer: 'Manchester: (+−)(−+)(+−)(+−)(−+)(−+) · differential Manchester: (−+)(+−)(+−)(+−)(−+)(+−)' } },

          { n: 30, title: 'Notes on Manchester encoding',
            says: R`<ul><li>In Manchester and differential Manchester encoding, the transition at the middle of the bit is used for synchronization.</li>
<li>The minimum bandwidth of Manchester and differential Manchester is 2 times that of NRZ.
<ul><li>There is no DC component and no baseline wandering. None of these codes has error detection.</li></ul></li></ul>`,
            means: R`<ul><li><b>Synchronization.</b> A guaranteed edge in every bit time means the receiver can re-align its clock at least once per bit, even across a long run (0 0 0 0 gives high-low, high-low, …). Slide 13's drift cannot accumulate.</li>
<li><b>Twice NRZ's bandwidth.</b> Two signal elements per bit: $\c{baud}{S_{\text{avg}}} = \frac{1}{2} \times \c{rate}{N} \times \frac{1}{\c{level}{1/2}} = \c{rate}{N}$, against NRZ's $\frac{\c{rate}{N}}{2}$. At 1 Mbps: Manchester $\c{bw}{B_{\text{min}}} = \c{bw}{1}$ MHz, NRZ-I 500 kHz (Example 3).</li>
<li><b>No DC and no baseline wandering.</b> In every bit the signal spends half its time high and half low, so its average is zero whatever the data.</li>
<li><b>No error detection</b> in any of these codes.</li></ul>
<p>All five schemes met so far side by side (slides 24, 26 and 30):</p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th></th><th>Levels</th><th>r</th><th>$\c{baud}{S_{\text{avg}}}$</th><th>DC and wandering</th><th>Self-sync</th><th>Error detection</th></tr></thead><tbody>
<tr><td>NRZ-L</td><td>2</td><td>1</td><td>$\frac{\c{rate}{N}}{2}$</td><td>yes (worse)</td><td>no</td><td>no</td></tr>
<tr><td>NRZ-I</td><td>2</td><td>1</td><td>$\frac{\c{rate}{N}}{2}$</td><td>yes</td><td>no (long 0s)</td><td>no</td></tr>
<tr><td>RZ</td><td>3</td><td>½</td><td>$\c{rate}{N}$</td><td>no</td><td>yes</td><td>no</td></tr>
<tr><td>Manchester</td><td>2</td><td>½</td><td>$\c{rate}{N}$</td><td>no</td><td>yes</td><td>no</td></tr>
<tr><td>Differential Manchester</td><td>2</td><td>½</td><td>$\c{rate}{N}$</td><td>no</td><td>yes</td><td>no</td></tr></tbody></table></div>`,
            why: R`<p>This is the pay-off slide for Part 2's checklist: Manchester and differential Manchester solve baseline wandering, DC and synchronization in one move, and pay with double bandwidth, exactly the trade-off slide 17 announced. Expect MCQ or essay items such as “why does Manchester need twice the bandwidth of NRZ?” (two signal elements per bit) and “which codes are self-synchronizing and DC-free?”.</p>
<p>Trap: the slide says <i>none</i> of these codes has error detection. Some textbooks argue a missing mid-bit transition reveals an error; for this exam follow the slide. Also note the slide's typo “The is no DC component”.</p>`,
            tip: R`<p>If an answer asks for the cost of Manchester, say “twice the bandwidth of NRZ (S = N instead of N/2)”, and for the benefit say “mid-bit transition: self-synchronization, no DC, no baseline wandering”.</p>` },

          { n: 31, title: 'Bipolar: AMI and pseudoternary',
            says: R`<ul><li>The code uses 3 voltage levels: +, 0, −, to represent the symbols (note: not transitions to zero as in RZ).</li>
<li>The voltage level for one symbol is at “0” and the other alternates between + and −.</li>
<li>Bipolar <b>Alternate Mark Inversion (AMI)</b>: the “0” symbol is represented by zero voltage and the “1” symbol alternates between +V and −V.</li>
<li><b>Pseudoternary</b> is the reverse of AMI.</li></ul>
<p>(The footer “4.31” is a leftover textbook slide number.)</p>`,
            means: R`<p><b>Bipolar</b> codes use three levels, but not the way RZ does. In RZ the signal drops to 0 V in the middle of <i>every</i> bit. In bipolar codes a bit is one flat level, and the symbol that is <i>not</i> 0 V takes alternating polarities.</p>
<ul><li><b>AMI</b> (alternate mark inversion; “mark” is the old telegraph word for a 1): <b>0 → 0 V</b>, and the <b>1s alternate</b> +V, −V, +V, … Each 1 inverts the polarity used by the previous 1. In the slide-32 figure the first 1 is +V; applying the rule to the bits 0 1 0 0 1 0 gives 0, +, 0, 0, −, 0.</li>
<li><b>Pseudoternary</b>: the mirror image: <b>1 → 0 V</b>, and the <b>0s alternate</b> between + and −. It is low priority for the exam (the next slide carries a handwritten “not included”), so know it as “the reverse of AMI”.</li></ul>
<p>Why alternate? Pulses of opposite sign cancel, so the average stays near 0 V however many 1s are sent: the next slides list bipolar codes as having no DC component and no baseline wandering. The encoder must remember the polarity of the last non-zero pulse, a little like NRZ-I remembering the last level.</p>`,
            why: R`<p>This slide is the third family on the tree of slide 19 and the last slide of this part of the lecture. It introduces the idea of <i>alternation</i> as a way to cancel DC without extra bandwidth: AMI keeps NRZ's N/2 (one signal element per bit) yet has no DC. Its weak spot is the run of 0s, which is flat at 0 V and gives the receiver no transitions; that gap is what scrambling (B8ZS, HDB3, slides 57–61) later fills.</p>
<p>Exam angle: identification (“alternate mark inversion”), drawing (0 = 0 V, 1s alternate starting +) and the polar-versus-bipolar distinction. Mistake: drawing AMI's 0 as −V, or letting two 1s in a row share a polarity.</p>`,
            tip: R`<p>AMI: “zeros are zero, ones alternate”. Pseudoternary swaps the two roles.</p>` }
        ],
        together: R`<p>Slides 26–31 add a transition to every bit and then open the bipolar family. Side by side with the NRZ codes:</p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Scheme</th><th>Levels</th><th>r</th><th>$\c{baud}{S_{\text{avg}}}$</th><th>DC and wandering</th><th>Self-sync</th><th>Drawing rule</th></tr></thead><tbody>
<tr><td>NRZ-L</td><td>2</td><td>1</td><td>$\frac{\c{rate}{N}}{2}$</td><td>yes (worse)</td><td>no</td><td>0 = +V, 1 = −V</td></tr>
<tr><td>NRZ-I</td><td>2</td><td>1</td><td>$\frac{\c{rate}{N}}{2}$</td><td>yes</td><td>no (long 0s)</td><td>1 inverts at the start</td></tr>
<tr><td>RZ</td><td>3</td><td>½</td><td>$\c{rate}{N}$</td><td>no</td><td>yes</td><td>1 = +V then 0, 0 = −V then 0</td></tr>
<tr><td>Manchester</td><td>2</td><td>½</td><td>$\c{rate}{N}$</td><td>no</td><td>yes</td><td>0 = high→low, 1 = low→high</td></tr>
<tr><td>Differential Manchester</td><td>2</td><td>½</td><td>$\c{rate}{N}$</td><td>no</td><td>yes</td><td>mid-bit transition always; 0 also at the start</td></tr>
<tr><td>AMI</td><td>3</td><td>1</td><td>$\frac{\c{rate}{N}}{2}$</td><td>no</td><td>no (long 0s)</td><td>0 = 0 V, 1s alternate</td></tr></tbody></table></div>
<p>The trade-off in one line: a transition in every bit buys self-synchronization and a zero average, and costs <b>twice the bandwidth</b> ($\c{baud}{S} = \c{rate}{N}$ instead of $\frac{\c{rate}{N}}{2}$; at 1 Mbps, 1 MHz instead of 500 kHz). Anchor drawings: <span class="mono">01001</span> in RZ gives (−0)(+0)(−0)(−0)(+0), and <span class="mono">010011</span> gives Manchester (+−)(−+)(+−)(+−)(−+)(−+) and differential Manchester (−+)(+−)(+−)(+−)(−+)(+−). (The AMI row's properties come from slides 33 and 46; slide 31 gives only the rule.)</p>
<p>Next: slide 32 draws AMI and pseudoternary for 010010 (pseudoternary carries the handwritten “not included”), and slide 33 lists their properties. After that the multilevel codes (slides 34–42) try to win back the bandwidth that Manchester spent (2B1Q gets down to N/4), MLT-3 follows (slides 43–45), and the summary table on slide 46 puts every scheme in one grid.</p>` }
    ],
    terms: [
      { term: 'Encoder / decoder', alt: ['encoder', 'decoder'],
        def: 'The encoder at the sender maps data bits to a digital signal using a line-coding rule; the decoder at the receiver applies the rule in reverse and returns the same bits.', ref: 'L03 p4' },
      { term: 'Effective bandwidth',
        def: 'The finite range of frequencies that holds most of a digital signal’s power. The actual bandwidth of a digital signal is infinite, so the channel must carry the effective bandwidth; its minimum equals the average signal rate.', ref: 'L03 p10; L03 p25' },
      { term: 'Baseline',
        def: 'The receiver’s running average of the received signal power, used as the reference for telling levels apart. A long run of one level drags it toward that level (baseline wandering).', ref: 'L03 p11' },
      { term: 'Bit interval',
        def: 'The time one bit occupies on the line. Sender and receiver clocks must use the same bit interval; if the receiver clock is faster or slower, it misreads the incoming bit stream.', ref: 'L03 p13' },
      { term: 'Symbol error',
        def: 'A received signal element that line impairments changed, so the decoded symbol is wrong. Some codes make it detectable because the altered pattern is not part of the code.', ref: 'L03 p15' },
      { term: 'Noise immunity', alt: ['immunity to noise and interference'],
        def: 'A property of some line codes that makes the transmitted signal “immune” to noise and interference. The slides call it stronger than error detection because the signal is not corrupted in the first place.', ref: 'L03 p16' },
      { term: 'NRZ', alt: ['non-return-to-zero'],
        def: 'Non-return-to-zero: the signal level is held for the whole bit and does not return to zero in the middle. Unipolar NRZ uses 1 = +V and 0 = 0 V; polar NRZ comes as NRZ-L and NRZ-I.', ref: 'L03 p20' },
      { term: 'Unipolar',
        def: 'Family of line codes whose signal levels all lie on one side of the time axis, above or below it. NRZ is the example: simple, but prone to baseline wandering and DC, with no synchronization or error detection.', ref: 'L03 p20' },
      { term: 'Polar',
        def: 'Family of line codes that use voltages on both sides of the time axis, such as +V and −V. It includes NRZ (NRZ-L, NRZ-I), RZ and biphase (Manchester, differential Manchester).', ref: 'L03 p19; L03 p22' },
      { term: 'Bipolar',
        def: 'Family of line codes with three levels +, 0, −: one symbol is sent as 0 V and the other alternates between + and −. AMI and pseudoternary are the examples. Unlike RZ, there is no transition to zero inside a bit.', ref: 'L03 p31' },
      { term: 'Biphase',
        def: 'Polar codes in which every bit has a level transition in the middle and uses only two voltages: Manchester (NRZ-L + RZ) and differential Manchester (NRZ-I + RZ). Their average signal rate is N.', ref: 'L03 p28' },
      { term: 'Mid-bit transition',
        def: 'The change of level in the middle of every bit in RZ, Manchester and differential Manchester. It is the timing mark used for synchronization, and it costs two signal elements per bit, so twice the NRZ bandwidth.', ref: 'L03 p26; L03 p30' },
      { term: 'Normalized power',
        def: 'Average power of a line code over equally likely 1s and 0s, computed without a specific load. For unipolar NRZ the slide gives ½V² + ½(0)² = ½V².', ref: 'L03 p21' }
    ],
    keyTerms: ['Line coding', 'Data element', 'Signal element', 'Signal rate', 'Case factor (c)', 'Baseline wandering', 'DC component',
      'Self-synchronization', 'NRZ-L', 'NRZ-I', 'RZ', 'Manchester', 'Differential Manchester', 'Mid-bit transition'],
    faq: [
      { q: R`What is the difference between the data rate and the signal (baud) rate?`,
        a: R`<p>The data rate $\c{rate}{N}$ counts <b>bits</b> per second (bps); the signal rate $\c{baud}{S}$ counts <b>signal elements</b> per second (baud). They are linked by $\c{baud}{S} = c \times \c{rate}{N} \times \frac{1}{\c{level}{r}}$, so they differ whenever $c \times \frac{1}{\c{level}{r}} \ne 1$. The goal is a high data rate with a low baud rate.</p>`, ref: 'L03 p6; L03 p8' },
      { q: R`Why do the examples use c = ½, and what are the other values of c?`,
        a: R`<p>The case factor c is 1 in the worst case and 0 in the best case, so the <b>average case</b> is $c = \frac{1}{2}$, which every example uses (for instance 100 kbps with r = 1 gives 50 kbaud). Use c = 1 only if the question asks for the worst case.</p>`, ref: 'L03 p9; L03 p25' },
      { q: R`How do I read r from a figure such as slide 7?`,
        a: R`<p>Count data elements per signal element: one bit per flat level is $\c{level}{r} = 1$, one bit over two levels is $\frac{1}{2}$, two bits on one level is 2, four bits over three levels is $\frac{4}{3}$. Then $\c{baud}{S}$ follows from the slide-8 formula; a smaller r means a higher baud rate.</p>`, ref: 'L03 p7; L03 p8' },
      { q: R`What is the difference between baseline wandering and a DC component?`,
        a: R`<p>Both come from long runs of one level. <b>Baseline wandering</b> is the receiver's running-average reference drifting toward that level, making decoding unreliable. The <b>DC component</b> is the low-frequency energy such a constant voltage puts into the signal, which bandpass channels cannot carry.</p>`, ref: 'L03 p11; L03 p12' },
      { q: R`Why does a faster receiver clock matter more on a faster link?`,
        a: R`<p>The relative error is the same but the number of misread bits per second scales with the data rate: a clock 0.1% fast gives 1 extra bit per second at 1 kbps but 1,000 at 1 Mbps. Transitions in the signal (self-synchronization) let the receiver re-align its clock continually.</p>`, ref: 'L03 p13; L03 p14' },
      { q: R`How do NRZ-L and NRZ-I differ, and which handles long runs better?`,
        a: R`<p>NRZ-L encodes the bit in the <b>level</b> (slide figure: 0 = +V, 1 = −V); NRZ-I encodes it in the <b>change</b> (a 1 inverts at the start of the bit, a 0 holds). Both have $\c{baud}{S_{\text{avg}}} = \frac{\c{rate}{N}}{2}$ and no self-synchronization; NRZ-I is flat only for runs of 0s, NRZ-L for runs of either bit, so NRZ-L's DC and wandering problem is worse.</p>`, ref: 'L03 p22; L03 p23; L03 p24' },
      { q: R`Why does Manchester need twice the bandwidth of NRZ, and what does it gain?`,
        a: R`<p>Every bit uses two signal elements (r = ½), so $\c{baud}{S_{\text{avg}}} = \c{rate}{N}$ against NRZ's $\frac{\c{rate}{N}}{2}$. In return the mid-bit transition gives self-synchronization, and the average level is zero, so there is no DC component or baseline wandering.</p>`, ref: 'L03 p29; L03 p30' },
      { q: R`Do any of the schemes on slides 20–30 detect errors?`,
        a: R`<p>No. Unipolar NRZ (slide 20), NRZ-L and NRZ-I (slide 24), RZ (slide 26) and Manchester and differential Manchester (slide 30) are each stated to have no error detection. The slides add detection later through redundancy. Error detection (noticing an error) is also weaker than noise immunity (preventing it).</p>`, ref: 'L03 p15; L03 p16; L03 p30' }
    ]
  });
})();
