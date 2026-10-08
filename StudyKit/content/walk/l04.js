/* Slide-by-slide walkthrough: L04 slides 1–31 (topic l04). Contract: docs/AUTHORING.md §3.7.
   Text is written with String.raw (R) so that TeX backslashes in $…$ stay intact. */
(function () {
  'use strict';
  var R = String.raw;
  function C(p) { return ' <span class="chip ref">' + p + '</span>'; }

  KIT.walk({
    id: 'l04', topic: 'l04', range: [1, 31],
    parts: [
      /* ============================ PART 1: slides 1-7 ============================ */
      { title: 'Why modulate? Carrier, bit rate and baud rate', slides: [1, 7],
        items: [
          { n: 1, kind: 'admin', title: 'Title slide',
            says: 'Physical Communication Layer: NSCOM03 Data Communications, “Digital to Analog Transmission”, prepared by Jerome Gutierrez.' },

          { n: 2, title: 'Digital to Analog Conversion',
            says: R`<ul><li>Digital data needs to be carried on an analog signal.</li>
<li>A <b>carrier signal</b> (frequency fc) performs the function of transporting the digital data in an analog waveform.</li>
<li>The analog carrier signal is manipulated to <b>uniquely identify</b> the digital data being carried.</li></ul>`,
            means: R`<p><b>Why convert at all?</b> Digital data is only a list of bits. Lecture 3 put those bits on the wire as voltage levels, which needs a channel that starts at 0 Hz (a low-pass channel, baseband transmission). Many media cannot do that: ${C('L01 p17')} says analog transmission is needed when bandwidth is limited, and ${C('L02 p18')} says modulation lets us use a <b>bandpass channel</b>, one whose band does not start from zero. So the bits are placed on an analog wave that lives inside the channel's band.</p>
<p><b>The carrier.</b> The <b>carrier signal</b> is a plain sine wave of frequency $\c{freq}{f_c}$ with constant amplitude and constant phase. By itself it carries no information: a receiver that sees the same wave forever learns nothing. It is a delivery truck that is empty until someone loads it. $\c{freq}{f_c}$ is chosen inside the channel's band so that the wave can pass.</p>
<p><b>Modulation.</b> To load the truck, the sender <b>manipulates</b> the carrier in step with the bits. A sine wave has three characteristics ${C('L02 p6')}: amplitude, frequency and phase. Change one of them and you have changed the carrier. The rule is the third bullet: each data pattern must produce a <b>unique</b>, recognisable change, otherwise the receiver could not tell the patterns apart.</p>
<p>Everyday picture: a steady musical note says nothing, but if you play it louder or softer, higher or lower, or start it a fraction earlier or later, you can spell out a message in the changes.</p>`,
            why: R`<p>This slide sets the whole lecture. Slide 3 draws the sender-to-receiver pipeline; slide 4 lists the three ways to manipulate a carrier (ASK, FSK, PSK) plus QAM; slides 5–7 count what is sent per second; slides 8–31 take each scheme in turn.</p>
<p>Exam angle: identification items ask for the wave that transports the data (the <b>carrier</b>) or for the process of changing it (<b>modulation</b>). A usual slip is to think the carrier itself holds the data, or that modulation compresses or encrypts it. It only changes how the bits are represented on a bandpass channel. Another slip: confusing this with line coding (L03), where the signal is a digital stepped waveform, not a sine wave.</p>` },

          { n: 3, title: 'Digital to Analog Conversion: the modulator/demodulator pipeline',
            says: R`<p>A figure of the whole chain. A <b>Sender</b> computer holds <b>Digital data</b> <span class="mono">0101 ⋯ 101</span>. A <b>Modulator</b> box turns it into an <b>Analog signal</b> (a sine wave of changing amplitude drawn above the arrow) that travels along the <b>Link</b>. A <b>Demodulator</b> box in front of the <b>Receiver</b> computer turns the analog signal back into the <b>Digital data</b> <span class="mono">0101 ⋯ 101</span>.</p>`,
            means: R`<ol><li>The sender has bits, <span class="mono">0101 ⋯ 101</span>.</li>
<li>The <b>modulator</b> takes the bits and produces an analog signal: a carrier whose amplitude, frequency or phase has been set by the bits.</li>
<li>The analog signal crosses the <b>link</b> (the medium).</li>
<li>The <b>demodulator</b> measures the incoming wave, decides which bit pattern each stretch of it stands for and rebuilds the bits.</li>
<li>The receiver gets exactly the bit string the sender started with. Only the form in the middle changed.</li></ol>
<p>This is the same shape as the encoder/decoder picture of L03 slide 4, with one difference in the middle: there the link carried a <b>digital</b> signal (a few flat voltage levels); here it carries an <b>analog</b> one (a sine wave that has been altered). A modulator and a demodulator working as a pair are what people call a <b>modem</b> ${C('L01 p17')}. The L01 figure shows one modulator/demodulator pair <i>per direction</i>, which matters on slide 13.</p>`,
            why: R`<p>Everything after this slide is a different design for the box labelled <i>Modulator</i> (and its mirror image, the demodulator): ASK, FSK, PSK and QAM are four rules for it. An essay such as “Explain digital-to-analog conversion” earns marks for this diagram drawn and labelled: sender, digital data, modulator, analog signal on the link, demodulator, receiver, digital data.</p>
<p>The usual slip is to label the signal on the link “digital”. It is analog: that is the whole point of the box.</p>` },

          { n: 4, title: 'Types of Digital to Analog Conversion',
            says: R`<p>A tree. The top box is <b>Digital-to-analog conversion</b>. Below it, three yellow boxes: <b>Amplitude shift keying (ASK)</b>, <b>Frequency shift keying (FSK)</b> and <b>Phase shift keying (PSK)</b>. A green box underneath, <b>Quadrature amplitude modulation (QAM)</b>, receives dashed arrows from ASK and from PSK only.</p>`,
            means: R`<p>The three yellow boxes are the three characteristics of a sine wave ${C('L02 p6')}, each used as the one that carries the data:</p>
<table class="tbl"><thead><tr><th>Scheme</th><th>What the bits change</th><th>What stays fixed</th><th>Slides</th></tr></thead><tbody>
<tr><td><b>ASK</b> amplitude shift keying</td><td>peak amplitude</td><td>frequency, phase</td><td>8–13</td></tr>
<tr><td><b>FSK</b> frequency shift keying</td><td>frequency</td><td>amplitude, phase</td><td>14–20</td></tr>
<tr><td><b>PSK</b> phase shift keying</td><td>phase</td><td>amplitude, frequency</td><td>21–26</td></tr>
<tr><td><b>QAM</b> quadrature amplitude modulation</td><td>amplitude <i>and</i> phase</td><td>frequency</td><td>30–31</td></tr></tbody></table>
<p><b>Keying</b> means switching between a few fixed forms of the carrier, so “shift keying” reads as “switch the amplitude (or frequency, or phase) between preset values”. The dashed arrows show that QAM is a <b>combination of ASK and PSK</b> (the slide-30 wording): no arrow comes from FSK, so QAM does <i>not</i> vary frequency.</p>`,
            why: R`<p>This tree is the table of contents of the lecture and the first thing to draw in an essay that compares the schemes. Identification and MCQ items hang directly on it: <i>which characteristic does FSK change?</i> (frequency), <i>QAM combines which two?</i> (ASK and PSK).</p>
<p>Keep the two-level structure in mind as you read on: slides 5–7 are about <i>how many</i> bits each signal element carries, slides 8–31 are about <i>which</i> characteristic carries them and what each choice costs in bandwidth and noise robustness.</p>` },

          { n: 5, title: 'Bit Rate and Baud Rate',
            says: R`<ul><li>Bit rate, N, is the number of bits per second (bps) while baud rate is the number of signal elements per second (bauds).</li>
<li>In the analog transmission of digital data, the signal or baud rate is less than or equal to the bit rate.</li></ul>
<p>Formula, centred: <b>S = N × 1/r bauds</b>, where r is the number of data bits per signal element.</p>`,
            means: R`<p>Two counters watch the same stream. $\c{rate}{N}$, the <b>bit rate</b>, counts <b>bits</b> per second. $\c{baud}{S}$, the <b>baud rate</b> (also the signal or modulation rate), counts <b>signal elements</b> per second. A <b>signal element</b> is the shortest stretch of the modulated carrier that has its own fixed amplitude, frequency and phase; the demodulator makes one decision per element. The ratio between the two counters is $\c{level}{r}$, the number of <b>data bits carried by one signal element</b>.</p>
$$\c{baud}{S} = \c{rate}{N} \times \frac{1}{\c{level}{r}} \quad \Rightarrow \quad \c{rate}{N} = \c{baud}{S} \times \c{level}{r} \quad \Rightarrow \quad \c{level}{r} = \frac{\c{rate}{N}}{\c{baud}{S}}$$
<p>The three forms are the same equation turned round: use the first to find the baud rate, the second to find the bit rate, the third to find r. A table for one fixed bit rate, $\c{rate}{N} = 8,000$ bps, shows the pattern:</p>
<table class="tbl compact"><thead><tr><th>Bits per element $\c{level}{r}$</th><th>$\c{baud}{S} = \c{rate}{8,000} \times \frac{1}{\c{level}{r}}$</th></tr></thead><tbody>
<tr><td>$\c{level}{1}$</td><td>$\c{baud}{8,000}$ baud</td></tr><tr><td>$\c{level}{2}$</td><td>$\c{baud}{4,000}$ baud</td></tr>
<tr><td>$\c{level}{4}$</td><td>$\c{baud}{2,000}$ baud</td></tr><tr><td>$\c{level}{8}$</td><td>$\c{baud}{1,000}$ baud</td></tr></tbody></table>
<p>Why “less than or equal”? An element never carries less than one bit in analog transmission of digital data, so $\c{level}{r} \ge 1$ and $\c{baud}{S} \le \c{rate}{N}$, with equality at $\c{level}{r} = 1$. (In L03 line coding, r could be ½ and the baud rate could exceed the bit rate.) Note also that this version of the formula has no case factor $c$: it is simply $\c{baud}{S} = \c{rate}{N} \times \frac{1}{\c{level}{r}}$.</p>`,
            why: R`<p>This is the bridge variable of the lecture. Slides 9 and 21 will say that the <b>bandwidth follows the baud rate</b>, so a larger r, which means a smaller $\c{baud}{S}$ for the same $\c{rate}{N}$, shrinks the bandwidth needed. The price comes on slide 7: more bits per element needs more distinct elements, which are harder to tell apart.</p>
<p>Exam angle: the first step of almost every solving item in this lecture is “find S from N and r”. The classic mistake is using the bit rate in a bandwidth formula; convert to baud first. Another is the unit: baud is not bps, and r is “bits per baud”.</p>`,
            tip: R`<p>Baud counts signal elements, bps counts bits. If a question gives bps, ask “how many bits does each element carry?” before touching a bandwidth formula.</p>` },

          { n: 6, title: 'Example: bit rate from baud rate',
            says: R`<p><i>An analog signal carries 4 bits per signal element. If 1000 signal elements are sent per second, find the bit rate.</i></p>
<p>Solution: r = 4, S = 1000, and N is unknown. S = N × 1/r, or N = S × r = 1000 × 4 = <b>4000 bps</b>.</p>`,
            means: R`<ol><li><b>List what is given and what is asked.</b> $\c{level}{r} = 4$ bits per element, $\c{baud}{S} = 1,000$ baud, and the unknown is $\c{rate}{N}$.</li>
<li><b>Pick the form that isolates the unknown.</b> From $\c{baud}{S} = \c{rate}{N} \times \frac{1}{\c{level}{r}}$, multiply both sides by $\c{level}{r}$: $\c{rate}{N} = \c{baud}{S} \times \c{level}{r}$.</li>
<li><b>Substitute.</b> $\c{rate}{N} = \c{baud}{1,000} \times \c{level}{4} = \c{rate}{4,000}$ bps.</li></ol>
<p>Sanity checks that cost nothing: the units work out (baud × bits per baud = bits per second), and $\c{baud}{S} = 1,000 \le \c{rate}{N} = 4,000$ as slide 5 requires. In words, 1,000 elements go out every second and each carries 4 bits, so 4,000 bits go out every second. Carrying 4 bits needs 2<sup>4</sup> = 16 different elements (slide 7 will do that step).</p>`,
            why: R`<p>This is the easiest solving item the deck offers and the template for the harder ones: write the formula, substitute with units, check that S ≤ N. Variants you can do in your head: r = 2 and S = 1,200 gives 2,400 bps; r = 8 and S = 1,000 gives 8,000 bps (which is slide 7 run backwards).</p>
<p>The worked solution below is animated step by step. Hover a coloured quantity to see where it travels: $\c{baud}{S}$ (orange), $\c{level}{r}$ (violet) and $\c{rate}{N}$ (blue) keep their colours in every formula of the lecture.</p>`,
            example: { title: 'Bit rate from baud rate (slide 6)', gen: 'l04.rates', params: { find: 'N', S: 1000, r: 4 },
              slideAnswer: R`$\c{rate}{N} = \c{baud}{1,000} \times \c{level}{4} = \c{rate}{4,000}$ bps`, slideValue: 4000, input: 'N' } },

          { n: 7, title: 'Example: bits per element and number of signal elements',
            says: R`<p><i>An analog signal has a bit rate of 8000 bps and a baud rate of 1000 baud. How many data elements are carried by each signal element? How many signal elements do we need?</i></p>
<p>Solution: S = 1000, N = 8000, and r and L are unknown. Two boxed lines: S = N × 1/r → r = N/S = 8000/1000 = <b>8 bits/baud</b>; r = log<sub>2</sub> L → L = 2<sup>r</sup> = 2<sup>8</sup> = <b>256</b>.</p>`,
            means: R`<p>Two unknowns, solved one after the other:</p>
<ol><li><b>Find r</b> (data elements, i.e. bits, per signal element): $\c{level}{r} = \frac{\c{rate}{N}}{\c{baud}{S}} = \frac{\c{rate}{8,000}}{\c{baud}{1,000}} = \c{level}{8}$ bits per baud.</li>
<li><b>Find L</b>, the number of different signal elements. With r bits an element can stand for $2^{\c{level}{r}}$ different patterns, and each pattern needs its own recognisable element, so $\c{level}{r} = \log_2 \c{level}{L} \Leftrightarrow \c{level}{L} = 2^{\c{level}{r}}$. Here $\c{level}{L} = 2^{\c{level}{8}} = \c{level}{256}$.</li></ol>
<p>Read the second question carefully: “how many signal elements do we need” asks for <b>L</b>, the number of distinct forms the element can take (distinct amplitudes, frequencies or phases, or combinations). It does <i>not</i> ask for the number sent per second; that was S = 1,000. A small table makes L feel natural:</p>
<table class="tbl compact"><thead><tr><th>$\c{level}{r}$ (bits per element)</th><th>1</th><th>2</th><th>3</th><th>4</th><th>8</th></tr></thead><tbody>
<tr><td>$\c{level}{L} = 2^{\c{level}{r}}$ (distinct elements)</td><td>2</td><td>4</td><td>8</td><td>16</td><td>256</td></tr></tbody></table>
<p>These are the values met later: binary ASK, FSK and PSK have L = 2, QPSK has L = 4, the MFSK example has L = 8, and 16-QAM has L = 16.</p>`,
            why: R`<p>Slide 6 went from S and r to N; this slide goes the other way, from N and S to r, and then to L. Together they cover every rearrangement of $\c{baud}{S} = \c{rate}{N} / \c{level}{r}$ and $\c{level}{r} = \log_2 \c{level}{L}$ that can be asked without a calculator (always powers of 2).</p>
<p>The trade-off to remember: with $\c{level}{L} = 256$ forms the receiver must tell 256 elements apart, a much harder job in noise than telling 2 apart. That is the cost of a high r, and it comes back when slide 21 compares ASK with PSK and when slide 31 packs 16 points into a constellation. Exam slip: answering “8” for L, or “256” for r.</p>`,
            example: { title: 'Bits per element and number of levels (slide 7)', gen: 'l04.rates', params: { find: 'rL', N: 8000, S: 1000 },
              slideAnswer: R`$\c{level}{r} = \frac{\c{rate}{8,000}}{\c{baud}{1,000}} = \c{level}{8}$ bits/baud, $\c{level}{L} = 2^{\c{level}{8}} = \c{level}{256}$`, slideValue: 256, input: 'L' } }
        ],
        together: R`<p>One picture for slides 1–7: <b>bits must be carried by a changed analog wave, and the cost of carrying them is counted in signal elements per second.</b></p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Step</th><th>What happens</th><th>Slides</th></tr></thead><tbody>
<tr><td>1 Need</td><td>A bandpass channel cannot take baseband voltages, so digital data rides on an analog <b>carrier</b> of frequency $\c{freq}{f_c}$</td><td>2</td></tr>
<tr><td>2 Pipeline</td><td>Modulator (bits → changed carrier) → link → demodulator (changed carrier → bits)</td><td>3</td></tr>
<tr><td>3 Choice</td><td>Change amplitude (ASK), frequency (FSK) or phase (PSK); QAM combines ASK and PSK</td><td>4</td></tr>
<tr><td>4 Count</td><td>$\c{baud}{S} = \c{rate}{N} \times \frac{1}{\c{level}{r}}$, with $\c{baud}{S} \le \c{rate}{N}$</td><td>5–6</td></tr>
<tr><td>5 Levels</td><td>$\c{level}{r} = \log_2 \c{level}{L}$, so $\c{level}{L} = 2^{\c{level}{r}}$ distinct elements are needed</td><td>7</td></tr></tbody></table></div>
<p>Anchors: 4 bits per element at 1,000 baud is 4,000 bps; 8,000 bps at 1,000 baud is 8 bits per element and 256 elements. Remember that the <b>baud rate, not the bit rate, drives the bandwidth</b> (slides 9 and 21); a bigger r lowers the baud rate but needs more distinguishable elements.</p>
<p>Next comes the first and simplest scheme, ASK (slides 8–13): how amplitude carries the bits, how much bandwidth it needs, and how to place a carrier in a given band, for one direction and for full duplex.</p>` }
      ,
      /* ============================ PART 2: slides 8-13 ============================ */
      { title: 'Amplitude shift keying (ASK)', slides: [8, 13],
        items: [
          { n: 8, title: 'Amplitude Shift Keying (ASK)',
            says: R`<ul><li>ASK is implemented by changing the amplitude of a carrier signal to reflect amplitude levels in the digital signal.</li>
<li>For example: a digital “1” could not affect the signal, whereas a digital “0” would, by making it zero.</li>
<li>The line encoding will determine the values of the analog waveform to reflect the digital data being carried.</li></ul>`,
            means: R`<p><b>ASK</b> (amplitude shift keying) leaves the carrier's frequency and phase alone and lets the bits set its <b>amplitude</b>. The slide's example is the simplest case, <b>binary ASK</b>, with two amplitudes. A 1 “could not affect the signal”: the carrier goes out unchanged, at full amplitude. A 0 “would, by making it zero”: nothing is sent. Because the carrier is simply switched on and off, this is called <b>on-off keying (OOK)</b>, the name slide 29 uses.</p>
<p>The third bullet says the digital data does not reach the carrier directly: a <b>line encoding</b> first turns the bits into a digital signal, and the levels of that signal become the carrier's amplitudes. With the line code of slide 11, unipolar NRZ (1 = high, 0 = zero, as in L03 slide 21), the chain for the bits 1 0 1 1 0 is:</p>
<table class="tbl compact"><thead><tr><th>Bit</th><th>1</th><th>0</th><th>1</th><th>1</th><th>0</th></tr></thead><tbody>
<tr><td>Line-coded level</td><td>high</td><td>zero</td><td>high</td><td>high</td><td>zero</td></tr>
<tr><td>Carrier sent</td><td>full</td><td>none</td><td>full</td><td>full</td><td>none</td></tr></tbody></table>
<p>Two amplitudes is the minimum. With $\c{level}{L}$ amplitude levels each element would carry $\c{level}{r} = \log_2 \c{level}{L}$ bits; slide 18 hints at this when it says “similarly to ASK, FSK can use multiple bits per signal element”.</p>`,
            why: R`<p>ASK is the simplest of the three keying methods, so the lecture starts here: the same machinery (bandwidth formula, multiplier, carrier placement) is reused for PSK later. Its weakness is saved for slide 21: noise mostly disturbs amplitude, and amplitude is exactly what ASK uses to carry the data.</p>
<p>Exam angle: identification items describe “a carrier that is switched on for 1 and off for 0” (OOK / binary ASK), and drawing items ask you to sketch the waveform. The usual misreading of the first bullet is to think a 1 means “no signal”. It means the carrier is <i>unaffected</i>, i.e. present.</p>`,
            tip: R`<p>Drawing rule for binary ASK (follows slides 8 and 10): bit 1 gives the carrier at full amplitude for the whole bit, bit 0 gives a flat line at zero.</p>` },

          { n: 9, title: 'Bandwidth of ASK',
            says: R`<ul><li>The bandwidth B of ASK is proportional to the signal rate S.</li></ul>
<p>Formula, centred: <b>B = (1 + d)S</b>. “d” is due to modulation and filtering, lies between 0 and 1.</p>`,
            means: R`<p>The <b>bandwidth</b> $\c{bw}{B}$ is the width of the band of frequencies that the modulated signal occupies (L02: highest minus lowest). For ASK:</p>
$$\c{bw}{B} = (1 + d) \times \c{baud}{S}$$
<p>$\c{baud}{S}$ is the baud rate, so doubling the signal rate doubles the band. The factor $d$ is the part nobody can avoid: a real modulated signal cannot be cut off exactly at the edges of its band, and the modulation and the filter that limits it widen it a little. The slide says only that $d$ lies between 0 and 1. For a signal rate of $\c{baud}{S} = 1,000$ baud:</p>
<ul><li>$d = 0$ (best case): $\c{bw}{B} = (1 + 0) \times \c{baud}{1,000} = \c{bw}{1,000}$ Hz, so $\c{bw}{B} = \c{baud}{S}$.</li>
<li>$d = 0.5$: $\c{bw}{B} = 1.5 \times \c{baud}{1,000} = \c{bw}{1,500}$ Hz.</li>
<li>$d = 1$ (worst case): $\c{bw}{B} = 2 \times \c{baud}{1,000} = \c{bw}{2,000}$ Hz.</li></ul>
<p>Three things this formula does <b>not</b> contain. It has no bit rate: to start from bits, first get $\c{baud}{S} = \c{rate}{N} \times \frac{1}{\c{level}{r}}$ (slide 5). It has no carrier frequency: $\c{freq}{f_c}$ decides <i>where</i> the band sits, not how wide it is. And $d$ is just a number, never a frequency. For binary ASK, $\c{level}{r} = 1$, so $\c{baud}{S} = \c{rate}{N}$ and $\c{bw}{B} = (1 + d) \times \c{rate}{N}$ (slide 10).</p>`,
            why: R`<p>With $d = 0$ the formula says the bandwidth equals the signal rate, the same minimum as L03 slide 25 (<i>B<sub>min</sub> = S</i>). Slide 12 uses the formula backwards, from a given band to the baud rate; slide 21 shows PSK has the identical formula; slide 15 adds a term for FSK; slide 18 generalises it to many frequencies. It is the most reused formula of the lecture.</p>
<p>Exam angle: a solving item gives a bit rate and r, and asks for the bandwidth. Do N → S → B in that order. The common mistakes are putting N into the formula, forgetting that $(1 + d)$ is a multiplier (not an addend), and quoting d greater than 1.</p>` },

          { n: 10, title: 'Binary Amplitude Shift Keying',
            says: R`<p>Left: an amplitude-versus-time plot with the bits <b>1 0 1 1 0</b> across the top in five equal slots. A sine burst fills the slots of the three 1s; the slots of the two 0s are flat lines at zero. Each slot is labelled <b>1 signal element</b>. A bracket marks <b>Bit rate: 5</b> over the five bits and <b>1 s, Baud rate: 5</b> underneath.</p>
<p>Right: a yellow header reads <b>r = 1, S = N, B = (1 + d)S</b>. Below it a spectrum sketch has a frequency axis starting at 0 and a pink rounded hump marked <b>Bandwidth</b>, centred on <b>f<sub>c</sub></b> and well to the right of 0.</p>`,
            means: R`<p>Read the time plot slot by slot:</p>
<ol><li>Five bits give five equal slots, and each slot is one <b>signal element</b>: in a slot the carrier either runs at full amplitude (bit 1) or is silent (bit 0).</li>
<li>All five slots fit in 1 s, so the signal rate is 5 elements per second: $\c{baud}{S} = 5$ baud. Five bits per second also give $\c{rate}{N} = 5$ bps.</li>
<li>Because each element carries exactly one bit, $\c{level}{r} = 1$ and therefore $\c{baud}{S} = \c{rate}{N}$, as the yellow header says.</li></ol>
<figure data-fig="l04.modwaves" data-schemes="ook" data-bits="10110" data-caption="Binary ASK (on-off keying) for the slide's bits 1 0 1 1 0: the carrier is present for each 1 and absent for each 0."></figure>
<p>The spectrum on the right shows <i>where</i> the energy of this signal lives: one hump centred on the carrier frequency $\c{freq}{f_c}$, with width $\c{bw}{B} = (1 + d) \times \c{baud}{S}$. The hump does not start at 0 Hz, so this is a <b>bandpass</b> signal, exactly what a bandpass channel (L02 slide 18) can carry. The figure draws only a few carrier cycles per bit so the shape is visible; a few cycles per bit are enough in your own drawings too.</p>`,
            why: R`<p>This slide is the picture to reproduce when an essay asks you to “explain ASK” or to draw it for given bits: five slots, carrier in the 1s, flat in the 0s. The yellow header is the summary to memorise for binary ASK: $\c{level}{r} = 1$, $\c{baud}{S} = \c{rate}{N}$, $\c{bw}{B} = (1 + d)\,\c{baud}{S}$.</p>
<p>Slide 11 shows how to generate this waveform with a multiplier, and slide 22 draws the same five bits for BPSK so the two can be compared directly. Common error: drawing a 0 as a small-amplitude wave rather than a flat line. In binary ASK on the slides a 0 is zero amplitude.</p>` },

          { n: 11, title: 'Implementation of Binary ASK',
            says: R`<p>Left: three stacked plots over the bits <b>1 0 1 1 0</b>. Top (red): the digital signal, high for each 1 and at the zero line for each 0. Middle (black): the <b>Carrier signal</b>, a continuous sine wave. Bottom (blue): the <b>Modulated signal</b>, which copies the carrier in the 1 slots and is flat in the 0 slots.</p>
<p>Right: a block diagram. The digital pulse train enters a yellow <b>Multiplier</b> (a circle with ×). From below an <b>Oscillator</b> box feeds a signal of frequency <b>f<sub>c</sub></b> into the multiplier. Out of it comes a sine wave in bursts.</p>`,
            means: R`<p>A <b>multiplier</b> multiplies its two inputs at every instant: <i>modulated signal = digital signal × carrier</i>. The <b>oscillator</b> is the circuit that produces the carrier at $\c{freq}{f_c}$. With the red signal taking only the values 1 (high) and 0 (zero), the product behaves like a gate:</p>
<table class="tbl compact"><thead><tr><th>Bit</th><th>Red signal</th><th>Red × carrier</th><th>Result</th></tr></thead><tbody>
<tr><td class="mono">1</td><td>high (×1)</td><td>1 × carrier</td><td>carrier passes unchanged</td></tr>
<tr><td class="mono">0</td><td>zero (×0)</td><td>0 × carrier</td><td>flat line, no signal</td></tr></tbody></table>
<p>The point to retain is <b>which line code is used</b>: the red signal is <b>unipolar NRZ</b> (L03 slide 21: 1 = +V, 0 = 0 V), whose levels are 0 and a positive value. If the input were <i>polar</i> NRZ (+V and −V), multiplying by −V would turn the carrier upside down instead of silencing it, which is phase shift keying (slide 23). So the same circuit makes BASK or BPSK; only the input signal differs.</p>`,
            why: R`<p>This is the standard “implementation” question: <i>BASK = unipolar NRZ × carrier from an oscillator</i> (this slide) and <i>BPSK = polar NRZ × carrier</i> (slide 23). Keep that pair together: unipolar goes with ASK, polar with PSK. FSK uses a different device, a voltage-controlled oscillator (slide 18).</p>
<p>The link back is slide 8's third bullet: the line encoding (here unipolar NRZ) fixes the levels, and the multiplier turns those levels into carrier amplitudes. Typical mistake: naming the output as “digital”; it is the analog modulated signal.</p>` },

          { n: 12, title: 'Example: ASK in a 200–300 kHz band',
            says: R`<p><i>We have an available bandwidth of 100 kHz which spans from 200 to 300 kHz. What are the carrier frequency and the bit rate if we modulated our data by using ASK with d = 1?</i></p>
<p>Solution: the middle of the bandwidth is located at 250 kHz, so the carrier frequency can be at f<sub>c</sub> = 250 kHz. Use the bandwidth formula to find the bit rate (with d = 1 and r = 1): B = (1 + d) × S = 2 × N × 1/r = 2 × N = 100 kHz, so <b>N = 50 kbps</b>.</p>`,
            means: R`<p>The question gives a <i>band</i> and asks for two things, where to put the carrier and how fast the data can go. Work in this order:</p>
<ol><li><b>Bandwidth of the band.</b> $\c{bw}{B} = \c{freq}{300} - \c{freq}{200} = \c{bw}{100}$ kHz.</li>
<li><b>Carrier in the middle.</b> $\c{freq}{f_c} = \frac{\c{freq}{200} + \c{freq}{300}}{2} = \c{freq}{250}$ kHz. The ASK spectrum is a hump centred on the carrier (slide 10), reaching $\c{bw}{B}/2 = 50$ kHz each side: $250 \pm 50$ gives exactly 200 to 300.</li>
<li><b>Baud rate from the bandwidth formula.</b> $\c{bw}{100} = (1 + 1) \times \c{baud}{S}$, so $\c{baud}{S} = \c{baud}{50}$ kbaud.</li>
<li><b>Bit rate.</b> Binary ASK has $\c{level}{r} = 1$, so $\c{rate}{N} = \c{baud}{50} \times \c{level}{1} = \c{rate}{50}$ kbps.</li></ol>
<p>The slide compresses steps 3 and 4 into one line: $\c{bw}{B} = (1 + d) \times \c{baud}{S} = 2 \times \c{rate}{N} \times \frac{1}{\c{level}{r}} = 2 \times \c{rate}{N} = \c{bw}{100}$ kHz, which gives $\c{rate}{N} = \c{rate}{50}$ kbps. Check: with $d = 1$ the band is twice the baud rate, so half the available bandwidth is “wasted” on d. With $d = 0$ the same band would carry 100 kbps.</p>`,
            why: R`<p>This is the template for the solving item of the lecture, given a band, an ASK or FSK scheme and d, find the carrier and the bit rate. The order never changes: <b>carrier first (the middle), then B, then S, then N</b>. Slide 13 repeats it for full duplex and slide 16 for FSK, where one extra term appears.</p>
<p>Exam angle: no calculator is needed (100 ÷ 2 and (200 + 300) ÷ 2). The usual slips: giving the carrier as 200 or 300 kHz (an edge, not the middle), and answering 100 kbps by forgetting the $(1 + d)$ factor. Units: kHz of bandwidth gives kbaud, and with r = 1 that is kbps.</p>`,
            example: { title: 'ASK in a 200–300 kHz band (slide 12)', gen: 'l04.band', params: { scheme: 'ask', fLow: 200e3, fHigh: 300e3, d: 1 },
              slideAnswer: R`$\c{freq}{f_c} = \c{freq}{250}$ kHz, $\c{rate}{N} = \c{rate}{50}$ kbps`, slideValue: 50e3, input: 'N' } },

          { n: 13, title: 'Bandwidth in Full-Duplex Communication',
            says: R`<ul><li>In data communications, we normally use full-duplex links with communication in both directions.</li>
<li>There is a need to divide the bandwidth into two with two carrier frequencies.</li>
<li>The figure shows the positions of two carrier frequencies and the bandwidths.</li>
<li>The available bandwidth for each direction is now 50 kHz, which leaves us with a data rate of 25 kbps in each direction.</li></ul>
<p>Figure: two pink humps side by side on a frequency axis, each marked <b>B = 50 kHz</b>. The left one is centred on <b>f<sub>c1</sub></b> and the right one on <b>f<sub>c2</sub></b>. Axis labels: <b>200</b>, <b>(225)</b>, <b>(275)</b>, <b>300</b>.</p>`,
            means: R`<p>A <b>full-duplex</b> link carries data in both directions at the same time (L01 slide 17 drew one modulator/demodulator pair for each direction). Both signals must be on the line at once, so they cannot share the same frequencies, or they would mix. The fix is to <b>split the 100 kHz band into two halves</b>, one per direction:</p>
<ol><li><b>Halve the band.</b> $\c{bw}{B} = \frac{\c{bw}{100}}{2} = \c{bw}{50}$ kHz per direction: 200–250 kHz for one, 250–300 kHz for the other.</li>
<li><b>Carrier in the middle of each half.</b> $\c{freq}{f_{c1}} = \frac{\c{freq}{200} + \c{freq}{250}}{2} = \c{freq}{225}$ kHz and $\c{freq}{f_{c2}} = \frac{\c{freq}{250} + \c{freq}{300}}{2} = \c{freq}{275}$ kHz. These are the labels in brackets on the figure.</li>
<li><b>Baud rate per direction</b> (d = 1 as before). $\c{bw}{50} = (1 + 1) \times \c{baud}{S}$, so $\c{baud}{S} = \c{baud}{25}$ kbaud.</li>
<li><b>Bit rate per direction.</b> $\c{level}{r} = 1$, so $\c{rate}{N} = \c{baud}{25} \times \c{level}{1} = \c{rate}{25}$ kbps each way.</li></ol>
<p>Total traffic is 25 + 25 = 50 kbps, the same as the one-way answer of slide 12. Splitting a band does not create bandwidth; it divides it, so each direction gets half the bit rate.</p>`,
            why: R`<p>Slide 12 solved a one-way link; real links are normally full duplex, so slide 13 is the more realistic version of the same exercise. The rule to remember is <b>halve the band, then solve each half like slide 12</b>. A quick check of the carriers: they sit at one quarter and three quarters of the way up the band (225 and 275 in 200–300).</p>
<p>Exam angle: a solving variant gives a band and asks for “the two carrier frequencies and the bit rate in each direction”. The mistakes to avoid are putting both carriers at 250 kHz, and keeping 50 kbps per direction. The slide itself includes the answer: 25 kbps in each direction.</p>`,
            example: { title: 'Full-duplex ASK in the same band (slide 13)', gen: 'l04.band', params: { scheme: 'ask', fLow: 200e3, fHigh: 300e3, d: 1, duplex: true },
              slideAnswer: R`$\c{freq}{f_{c1}} = \c{freq}{225}$ kHz, $\c{freq}{f_{c2}} = \c{freq}{275}$ kHz, $\c{rate}{N} = \c{rate}{25}$ kbps each way`, slideValue: 25e3, input: 'N' } }
        ],
        together: R`<p>One picture for slides 8–13: <b>ASK writes the bits into the carrier's amplitude, needs a band as wide as the baud rate (plus d), and the carrier belongs in the middle of that band.</b></p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Question</th><th>Answer</th><th>Slides</th></tr></thead><tbody>
<tr><td>What changes?</td><td>Amplitude. Binary ASK = OOK: 1 = carrier, 0 = nothing</td><td>8, 10</td></tr>
<tr><td>How wide is the band?</td><td>$\c{bw}{B} = (1 + d) \times \c{baud}{S}$, with $0 \le d \le 1$; for binary ASK $\c{baud}{S} = \c{rate}{N}$</td><td>9, 10</td></tr>
<tr><td>How is it built?</td><td>Unipolar NRZ × oscillator at $\c{freq}{f_c}$ in a multiplier</td><td>11</td></tr>
<tr><td>Where does the carrier go?</td><td>$\c{freq}{f_c}$ = middle of the band: 200–300 kHz gives 250 kHz</td><td>12</td></tr>
<tr><td>Full duplex?</td><td>Halve the band: carriers at 225 and 275 kHz, 25 kbps each way</td><td>13</td></tr></tbody></table></div>
<p>Anchor numbers: with $d = 1$ the 100 kHz band carries $\c{rate}{50}$ kbps one way or $\c{rate}{25}$ kbps each way. The solving routine is always carrier, then $\c{bw}{B}$, then $\c{baud}{S}$, then $\c{rate}{N}$.</p>
<p>The next part keeps the same machinery but writes the bits into the carrier's frequency instead (FSK, slides 14–20). Because FSK needs two (or more) carriers, a new term appears in the bandwidth formula, and the same 100 kHz band carries only half the bit rate.</p>` }
      ,
      /* ============================ PART 3: slides 14-20 ============================ */
      { title: 'Frequency shift keying (FSK) and multilevel FSK', slides: [14, 20],
        items: [
          { n: 14, title: 'Frequency Shift Keying',
            says: R`<ul><li>The digital data stream changes the frequency of the carrier signal, f<sub>c</sub>.</li>
<li>For example, a “1” could be represented by f1 = f<sub>c</sub> + Δf, and a “0” could be represented by f2 = f<sub>c</sub> − Δf.</li></ul>
<p>Left: an amplitude-versus-time plot for the bits <b>1 0 1 1 0</b>. The wave has the same height throughout, but its cycles are packed tighter in the 1 slots and looser in the 0 slots. Each of the five slots is labelled <b>1 signal element</b>; <b>Bit rate: 5</b> above, <b>1 s, Baud rate: 5</b> below.</p>
<p>Right: a yellow header <b>r = 1, S = N, B = (1 + d)S + 2Df</b> (the slide writes Δf as “Df”). Below it, a spectrum with two pink humps, <b>f<sub>1</sub></b> on the left and <b>f<sub>2</sub></b> on the right. Each hump is marked <b>S(1 + d)</b>, the whole is marked <b>B = S(1 + d) + 2Df</b>, and the distance between the hump centres is marked <b>2Df</b>.</p>`,
            means: R`<p><b>FSK</b> (frequency shift keying) keeps amplitude and phase fixed and lets the bits choose the <b>frequency</b>. Binary FSK uses two frequencies placed symmetrically around the carrier $\c{freq}{f_c}$:</p>
<ul><li>bit 1 → $\c{freq}{f_1} = \c{freq}{f_c} + \c{freq}{\Delta f}$ (the higher frequency)</li>
<li>bit 0 → $\c{freq}{f_2} = \c{freq}{f_c} - \c{freq}{\Delta f}$ (the lower frequency)</li></ul>
<p>$\c{freq}{\Delta f}$ is the offset from the carrier, so the two frequencies are $2\c{freq}{\Delta f}$ apart. Notice that $\c{freq}{f_c}$ itself is never sent; it is the midpoint. For example, with $\c{freq}{f_c} = 250$ kHz and $\c{freq}{\Delta f} = 25$ kHz, a 1 is sent at 275 kHz and a 0 at 225 kHz.</p>
<figure data-fig="l04.modwaves" data-schemes="bfsk" data-bits="10110" data-caption="Binary FSK for the slide's bits 1 0 1 1 0: constant amplitude, more cycles per bit for a 1 (the higher frequency) and fewer for a 0."></figure>
<p>As in binary ASK, each bit is one signal element, so $\c{level}{r} = 1$ and $\c{baud}{S} = \c{rate}{N}$: five bits in one second is 5 baud and 5 bps. The spectrum shows what is new. Each of the two frequencies gives an ASK-sized hump of width $(1 + d)\,\c{baud}{S}$, and the humps are $2\c{freq}{\Delta f}$ apart, so the total width is $(1 + d)\,\c{baud}{S} + 2\c{freq}{\Delta f}$. Slide 15 states this as a formula.</p>`,
            why: R`<p>FSK is the second of the three keying methods, and the first one that needs <b>more than one carrier frequency</b>. That is why its band is wider than ASK's for the same baud rate (slide 15) and why the full-duplex bookkeeping of slide 13 does not apply to it directly.</p>
<p>Exam angle: drawing items. The convention that is graded is the one in the text: <b>1 uses the higher frequency</b> ($\c{freq}{f_c} + \c{freq}{\Delta f}$), 0 the lower, with constant amplitude. Mistakes: swapping the two, drawing a 0 as silence (that is ASK), or treating $\c{freq}{f_c}$ as one of the two frequencies.</p>`,
            error: { says: 'In the spectrum drawing, f<sub>1</sub> is the left (lower) hump and f<sub>2</sub> the right (higher) one; the figure also writes Δf as “Df”.',
              correct: 'The bullet text says f<sub>1</sub> = f<sub>c</sub> + Δf, the higher frequency, for a 1, and the waveform in the same figure also gives 1 the faster wave. Follow the text and the waveform; read the spectrum labels as unordered. “2Df” means 2Δf.' } },

          { n: 15, title: 'Bandwidth of FSK',
            says: R`<ul><li>If the difference between the two frequencies (f1 and f2) is 2Δf, then the required bandwidth B will be: <b>B = (1 + d) × S + 2Δf</b>.</li></ul>
<p>A stray “5.15” sits in the bottom-left corner.</p>`,
            means: R`<p>The formula can be read straight off the slide-14 spectrum. Each of the two frequencies carries a hump as wide as an ASK signal, $(1 + d)\,\c{baud}{S}$ (slide 9). The humps are centred $2\c{freq}{\Delta f}$ apart. Measured from the outer edge of one hump to the outer edge of the other, the width is half a hump, plus the gap between centres, plus half a hump:</p>
$$\c{bw}{B} = \frac{(1 + d)\,\c{baud}{S}}{2} + 2\c{freq}{\Delta f} + \frac{(1 + d)\,\c{baud}{S}}{2} = (1 + d) \times \c{baud}{S} + 2\c{freq}{\Delta f}$$
<p>Turn it round for a given band: $\c{baud}{S} = \frac{\c{bw}{B} - 2\c{freq}{\Delta f}}{1 + d}$. <b>Subtract $2\c{freq}{\Delta f}$ first, then divide by $(1 + d)$.</b> Numbers: with $d = 1$, $\c{baud}{S} = 25$ kbaud and $2\c{freq}{\Delta f} = 50$ kHz, $\c{bw}{B} = 2 \times \c{baud}{25} + \c{freq}{50} = \c{bw}{100}$ kHz.</p>
<p>Compared with ASK at the same baud rate, FSK always needs $2\c{freq}{\Delta f}$ more bandwidth. In this example each hump is 50 kHz wide and the centres are 50 kHz apart, so the two humps just touch. Note that $2\c{freq}{\Delta f}$ is added after the multiplication; it is not multiplied by $(1 + d)$.</p>`,
            why: R`<p>This is the only change from the ASK formula of slide 9, so the exam question is usually “ASK or FSK in a given band”, answered on slide 16. The three-step routine becomes carrier, subtract $2\c{freq}{\Delta f}$, then divide by $(1 + d)$.</p>
<p>The usual mistakes: forgetting the $2\c{freq}{\Delta f}$ term (which turns the answer into the ASK one), applying $(1 + d)$ to it, and using $\c{freq}{\Delta f}$ instead of $2\c{freq}{\Delta f}$. Slide 18 generalises the same idea from two frequencies to L.</p>`,
            error: { says: 'A stray “5.15” label at the bottom-left of the slide.', correct: 'It is a leftover textbook slide number; ignore it.' } },

          { n: 16, title: 'Example: FSK in a 200–300 kHz band',
            says: R`<p><i>We have an available bandwidth of 100 kHz which spans from 200 to 300 kHz. What should be the carrier frequency and the bit rate if we modulated our data by using FSK with d = 1?</i></p>
<p>Solution: this problem is similar to “Example 5.3”, but we are modulating by using FSK. The midpoint of the band is at 250 kHz. We choose 2Δf to be 50 kHz; this means B = (1 + d) × S + 2Δf = 100 → 2S = 50 kHz, S = 25 kbaud, <b>N = 25 kbps</b>.</p>`,
            means: R`<ol><li><b>Carrier in the middle</b>, exactly as on slide 12: $\c{freq}{f_c} = \frac{\c{freq}{200} + \c{freq}{300}}{2} = \c{freq}{250}$ kHz.</li>
<li><b>Choose $2\c{freq}{\Delta f}$.</b> The question does not give it; the slide says “we choose” and takes $2\c{freq}{\Delta f} = \c{freq}{50}$ kHz. If you meet this question you must state your choice too.</li>
<li><b>Bandwidth formula</b> (slide 15): $\c{bw}{100} = (1 + 1) \times \c{baud}{S} + \c{freq}{50}$, so $2\c{baud}{S} = \c{bw}{50}$ and $\c{baud}{S} = \c{baud}{25}$ kbaud.</li>
<li><b>Bit rate.</b> Binary FSK has $\c{level}{r} = 1$, so $\c{rate}{N} = \c{baud}{25} \times \c{level}{1} = \c{rate}{25}$ kbps.</li></ol>
<p>The slide stops there, but the two frequencies follow from slide 14: $\c{freq}{f_1} = 250 + 25 = 275$ kHz for a 1 and $\c{freq}{f_2} = 250 - 25 = 225$ kHz for a 0. Each hump is $(1 + d)\,\c{baud}{S} = 50$ kHz wide, so the two fill 200–250 and 250–300 kHz, the same layout as the full-duplex figure of slide 13.</p>
<p>The result is half the ASK answer for the same band (50 kbps on slide 12): the gap $2\c{freq}{\Delta f}$ takes half of the 100 kHz. A bigger gap would cost more; for example $2\c{freq}{\Delta f} = 60$ kHz would leave $\c{baud}{S} = \frac{100 - 60}{2} = 20$ kbaud.</p>`,
            why: R`<p>This is the second solving template of the lecture and the direct partner of slide 12: same band, same d, but FSK instead of ASK, so the carrier is the same (250 kHz) and the bit rate halves (25 kbps). A good exam habit is to say which $2\c{freq}{\Delta f}$ you assume when the question leaves it open.</p>
<p>“Example 5.3” in the text is the textbook's number for the ASK example on slide 12; it is a leftover reference, not another slide. Common slip: doing $100 \div (1 + d) = 50$ and answering 50 kbps, which ignores $2\c{freq}{\Delta f}$.</p>`,
            example: { title: 'FSK in a 200–300 kHz band (slide 16)', gen: 'l04.band', params: { scheme: 'fsk', fLow: 200e3, fHigh: 300e3, d: 1, twoDf: 50e3 },
              slideAnswer: R`$\c{freq}{f_c} = \c{freq}{250}$ kHz, $\c{baud}{S} = \c{baud}{25}$ kbaud, $\c{rate}{N} = \c{rate}{25}$ kbps`, slideValue: 25e3, input: 'N' } },

          { n: 17, title: 'Coherent and Non Coherent',
            says: R`<ul><li>In a non-coherent FSK scheme, when we change from one frequency to the other, we do not adhere to the current phase of the signal.</li>
<li>In coherent FSK, the switch from one frequency signal to the other only occurs at the same phase in the signal.</li></ul>`,
            means: R`<p>Look only at the instant when the bit changes, say from a 1 (frequency $\c{freq}{f_1}$) to a 0 ($\c{freq}{f_2}$). The old wave is partway through a cycle; its position in the cycle is its <b>phase</b> at that instant (L02 slide 8). The two kinds of FSK differ in what the new wave does:</p>
<table class="tbl"><thead><tr><th></th><th>Non-coherent FSK</th><th>Coherent FSK</th></tr></thead><tbody>
<tr><td>When does the frequency change?</td><td>Whenever the bit changes</td><td>Only when the signal is at the same phase</td></tr>
<tr><td>Phase of the new wave</td><td>Ignores the current phase</td><td>Matches the current phase</td></tr>
<tr><td>Waveform at the switch</td><td>May jump</td><td>Stays continuous</td></tr></tbody></table>
<p>A picture to hold on to (an illustration, not from the slide): if the 1-wave is at its peak when the bit ends and the 0-wave simply starts from its own beginning at zero, the signal drops suddenly from the peak to zero, which is the break of the non-coherent case. If the switch is arranged so that the 0-wave also starts at a peak, the line continues smoothly, the coherent case. The slide gives no bandwidth formula for either, so B of slide 15 is all you need.</p>`,
            why: R`<p>This slide is pure vocabulary, but it is the kind that turns up as an MCQ or identification item: “the type of FSK in which the switch only occurs at the same phase” is <b>coherent</b>; the one that ignores the current phase is <b>non-coherent</b>. Memory hook: coherent = the phase stays consistent through the switch.</p>
<p>It links back to slide 14 (two frequencies) and forward to slide 18 (a VCO, whose output frequency follows its input voltage). Do not mix this pair up with “coherent” in other contexts; on this deck it only describes how FSK switches between its frequencies.</p>` },

          { n: 18, title: 'Multi level FSK',
            says: R`<ul><li>Similarly to ASK, FSK can use multiple bits per signal element.</li>
<li>That means we need to provision for multiple frequencies, each one to represent a group of data bits.</li>
<li>The bandwidth for FSK can be higher.</li>
<li>B = (1 + d) × S + (L − 1)/2Δf = L × S</li></ul>
<p>Figure: left, bits <b>1 0 1 1 0</b> with a red digital signal (high for 1, low for 0), the black <b>carrier signal</b> and a blue modulated wave whose cycles are packed tighter where the bit is 1. Right: the digital signal enters a box labelled <b>VCO</b> (“Voltage-controlled oscillator”), and a modulated wave comes out.</p>`,
            means: R`<p><b>MFSK</b> (multilevel FSK) groups r bits into one signal element and gives each group its own frequency. With $\c{level}{r}$ bits there are $\c{level}{L} = 2^{\c{level}{r}}$ groups, so $\c{level}{L}$ frequencies (r = 2 means four frequencies, r = 3 means eight, slide 19). The frequencies are $2\c{freq}{\Delta f}$ apart, so between the lowest and the highest there are $(\c{level}{L} - 1)$ gaps. One hump of width $(1 + d)\,\c{baud}{S}$ plus those gaps gives the corrected formula:</p>
$$\c{bw}{B} = (1 + d) \times \c{baud}{S} + (\c{level}{L} - 1) \times 2\c{freq}{\Delta f}$$
<p>Two checks. For $\c{level}{L} = 2$ it becomes $(1 + d)\,\c{baud}{S} + 2\c{freq}{\Delta f}$, the binary formula of slide 15. And with $d = 0$ and the minimum spacing $2\c{freq}{\Delta f} = \c{baud}{S}$ (the humps just touch) it becomes $\c{baud}{S} + (\c{level}{L} - 1)\,\c{baud}{S} = \c{level}{L} \times \c{baud}{S}$, which is the “= L × S” on the slide.</p>
<p><b>The VCO</b> is an oscillator whose output frequency follows its input voltage; feeding it the digital signal makes the frequency follow the bits. The slide's drawing shows only two voltage levels and two frequencies, so it is the binary case.</p>
<p>“The bandwidth for FSK can be higher” is the contrast with ASK and PSK. For a fixed $\c{rate}{N} = 3$ Mbps with $d = 0$ and minimum spacing:</p>
<table class="tbl compact"><thead><tr><th>$\c{level}{r}$</th><th>$\c{level}{L}$</th><th>$\c{baud}{S} = \frac{\c{rate}{3}}{\c{level}{r}}$ Mbaud</th><th>$\c{bw}{B} = \c{level}{L} \times \c{baud}{S}$ MHz</th></tr></thead><tbody>
<tr><td>$\c{level}{1}$</td><td>$\c{level}{2}$</td><td>$\c{baud}{3}$</td><td>$\c{bw}{6}$</td></tr><tr><td>$\c{level}{2}$</td><td>$\c{level}{4}$</td><td>$\c{baud}{1.5}$</td><td>$\c{bw}{6}$</td></tr>
<tr><td>$\c{level}{3}$</td><td>$\c{level}{8}$</td><td>$\c{baud}{1}$</td><td>$\c{bw}{8}$</td></tr><tr><td>$\c{level}{4}$</td><td>$\c{level}{16}$</td><td>$\c{baud}{0.75}$</td><td>$\c{bw}{12}$</td></tr></tbody></table>
<p>In ASK and PSK a larger r lowers the baud rate and so shrinks the band; in MFSK the number of frequencies doubles with every extra bit, and the band grows.</p>`,
            why: R`<p>The slide's last line is a <b>misprint</b>, and you can prove it with units: $\c{bw}{B}$ is in hertz, but $(\c{level}{L} - 1)/2\c{freq}{\Delta f}$ would be in 1/hertz. The product $(\c{level}{L} - 1) \times 2\c{freq}{\Delta f}$ is what the slide-19 and slide-20 numbers use. Exam answers should write the product.</p>
<p>The “multiple bits per signal element” idea is the same one as slide 5, now applied to frequencies. Slide 19 puts numbers in it. Exam angle: identification of the VCO; solving for L, S and B (slide 19); and the conceptual point that MFSK buys bits per element with bandwidth, while PSK and QAM buy them with distinguishability.</p>`,
            error: { says: 'B = (1 + d) × S + (L − 1)/2Δf = L × S, i.e. (L − 1) divided by 2Δf.',
              correct: 'B = (1 + d) × S + (L − 1) × 2Δf. It equals L × S only for d = 0 and 2Δf = S, the case of slide 19.' } },

          { n: 19, title: 'Example: MFSK, 3 bits at a time',
            says: R`<p><i>We need to send data 3 bits at a time at a bit rate of 3 Mbps. The carrier frequency is 10 MHz. Calculate the number of levels (different frequencies), the baud rate, and the bandwidth.</i></p>
<p>Solution: we can have L = 2<sup>3</sup> = 8. The baud rate is S = 3 Mbps / 3 = 1 Mbaud. This means that the carrier frequencies must be 1 MHz apart (2Δf = 1 MHz). The bandwidth is B = 8 × 1M = <b>8M</b>.</p>`,
            means: R`<ol><li><b>Levels.</b> Three bits at a time means $\c{level}{r} = 3$, so $\c{level}{L} = 2^{\c{level}{3}} = \c{level}{8}$ different frequencies.</li>
<li><b>Baud rate.</b> $\c{baud}{S} = \c{rate}{N} \times \frac{1}{\c{level}{r}} = \c{rate}{3} \times \frac{1}{\c{level}{3}} = \c{baud}{1}$ Mbaud.</li>
<li><b>Spacing.</b> The slide puts the carriers $2\c{freq}{\Delta f} = \c{freq}{1}$ MHz apart, equal to $\c{baud}{S}$: each frequency gets a slot exactly as wide as the signal rate. This is the minimum spacing and the case $d = 0$ (the slide does not say so explicitly; its answer implies it).</li>
<li><b>Bandwidth.</b> $\c{bw}{B} = \c{level}{L} \times \c{baud}{S} = \c{level}{8} \times \c{baud}{1} = \c{bw}{8}$ MHz.</li></ol>
<p>Cross-check with the full formula of slide 18: $(1 + 0) \times \c{baud}{1} + (\c{level}{8} - 1) \times \c{freq}{1} = 1 + 7 = 8$ MHz, the same. The carrier $\c{freq}{f_c} = 10$ MHz is not used in the arithmetic; it only says where the band is centred, which slide 20 draws.</p>
<p>Notice the size of the answer: 3 Mbps needs 8 MHz. Multilevel FSK spends bandwidth to get its bits per element, whereas QPSK (slide 26) carries 12 Mbps in 6 MHz.</p>`,
            why: R`<p>This is the solving template for multilevel FSK: <b>r → L = 2<sup>r</sup> → S = N/r → B = L × S</b>. It uses every relationship introduced so far: slide 5 (S from N and r), slide 7 (L from r) and slide 18 (B from L and S).</p>
<p>Exam angle: the slide fixes d = 0 and minimum spacing, so use B = L × S when a question says the same; if the question gives another d or spacing, use the full formula of slide 18. Typical errors: giving L = 3, using $\c{rate}{N}$ instead of $\c{baud}{S}$ in the final product (24 MHz), or dividing by $2\c{freq}{\Delta f}$ as the misprint suggests.</p>`,
            example: { title: 'MFSK: 3 bits at a time (slide 19)', gen: 'l04.mlevel', params: { scheme: 'mfsk', N: 3e6, r: 3, fc: 10e6 },
              slideAnswer: R`$\c{level}{L} = 8$, $\c{baud}{S} = \c{baud}{1}$ Mbaud, $\c{bw}{B} = \c{bw}{8}$ MHz`, slideValue: 8e6, input: 'B' } },

          { n: 20, title: 'Bandwidth Allocation from Example',
            says: R`<p>Figure: a frequency axis with <b>eight pink humps</b> side by side. Underneath, the labels <b>f<sub>1</sub> 6.5 MHz, f<sub>2</sub> 7.5, f<sub>3</sub> 8.5, f<sub>4</sub> 9.5, f<sub>5</sub> 10.5, f<sub>6</sub> 11.5, f<sub>7</sub> 12.5, f<sub>8</sub> 13.5</b>. A thin teal line between f<sub>4</sub> and f<sub>5</sub> is labelled <b>f<sub>c</sub> 10 MHz</b>. A double-headed arrow above all eight humps reads <b>Bandwidth = 8 MHz</b>.</p>`,
            means: R`<p>This figure is the answer to slide 19 drawn out. Each hump is $\c{baud}{S} = 1$ MHz wide and centred on one of the eight frequencies, so $f_1$ occupies 6.0–7.0 MHz, $f_2$ occupies 7.0–8.0 MHz, and so on up to $f_8$ at 13.0–14.0 MHz. Eight slots of 1 MHz fill 6 to 14 MHz, a band of $\c{bw}{B} = \c{bw}{8}$ MHz.</p>
<p>The carrier $\c{freq}{f_c} = 10$ MHz is the midpoint of that band: $\frac{6 + 14}{2} = 10$. It falls <b>between</b> $f_4$ and $f_5$ and is <b>not one of the eight frequencies that carry data</b>. The eight frequencies sit symmetrically around it:</p>
$$\c{freq}{f_i} = \c{freq}{f_c} + (i - 4.5) \times \c{freq}{1\,\text{MHz}} \quad i = 1, 2, \ldots, 8$$
<table class="tbl compact"><thead><tr><th>i</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr></thead><tbody>
<tr><td>Offset from $\c{freq}{f_c}$ (MHz)</td><td>−3.5</td><td>−2.5</td><td>−1.5</td><td>−0.5</td><td>+0.5</td><td>+1.5</td><td>+2.5</td><td>+3.5</td></tr>
<tr><td>$\c{freq}{f_i}$ (MHz)</td><td>6.5</td><td>7.5</td><td>8.5</td><td>9.5</td><td>10.5</td><td>11.5</td><td>12.5</td><td>13.5</td></tr></tbody></table>
<p>The slide does not say which 3-bit pattern uses which frequency; any one-to-one assignment works.</p>`,
            why: R`<p>This is the visual proof that $\c{bw}{B} = \c{level}{L} \times \c{baud}{S}$: L slots, each one signal rate wide. It also repeats the rule you have used since slide 12, that the carrier sits at the middle of the band; here the middle falls in the gap between two slots.</p>
<p>Exam angle: “what is the lowest (or highest) frequency used?” The answer is 6.5 (or 13.5) MHz, the <i>centres</i> of the end slots, not the band edges 6 and 14. Another trap is to list $\c{freq}{f_c} = 10$ MHz as a ninth carrier.</p>` }
        ],
        together: R`<p>One picture for slides 14–20: <b>FSK writes the bits into the carrier's frequency; each frequency needs its own ASK-sized hump, so the band grows by the gaps between them.</b></p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Scheme</th><th>Bandwidth</th><th>Bits per element</th><th>Slides</th></tr></thead><tbody>
<tr><td>Binary FSK</td><td>$\c{bw}{B} = (1 + d) \times \c{baud}{S} + 2\c{freq}{\Delta f}$</td><td>$\c{level}{r} = 1$, $\c{baud}{S} = \c{rate}{N}$</td><td>14–16</td></tr>
<tr><td>Multilevel FSK</td><td>$\c{bw}{B} = (1 + d)\,\c{baud}{S} + (\c{level}{L} - 1) \times 2\c{freq}{\Delta f}$, which is $\c{level}{L} \times \c{baud}{S}$ for $d = 0$, $2\c{freq}{\Delta f} = \c{baud}{S}$</td><td>$\c{level}{L} = 2^{\c{level}{r}}$ frequencies</td><td>18–20</td></tr></tbody></table></div>
<p>The rules to carry forward: bit 1 is the higher frequency $\c{freq}{f_c} + \c{freq}{\Delta f}$; the carrier $\c{freq}{f_c}$ is the midpoint and is not itself sent; coherent FSK switches at the same phase, non-coherent ignores it (slide 17); a VCO makes the frequency follow the input (slide 18). The slide-18 formula prints a division where a product belongs.</p>
<p>Numbers to remember: in the 200–300 kHz band with $d = 1$, FSK gives $\c{rate}{25}$ kbps against ASK's $\c{rate}{50}$ kbps; 3 bits at a time at 3 Mbps give $\c{level}{L} = 8$, $\c{baud}{S} = 1$ Mbaud and $\c{bw}{B} = 8$ MHz, with the frequencies 6.5 to 13.5 MHz.</p>
<p>The next part changes the third characteristic, phase. PSK uses the same bandwidth formula as ASK but is far more robust, and its multilevel form QPSK doubles the bit rate for the same band.</p>` }
      ,
      /* ============================ PART 4: slides 21-26 ============================ */
      { title: 'Phase shift keying (PSK): BPSK and QPSK', slides: [21, 26],
        items: [
          { n: 21, title: 'Phase Shift Keying',
            says: R`<ul><li>We vary the phase shift of the carrier signal to represent digital data.</li>
<li>The bandwidth requirement, B, is: <b>B = (1 + d) × S</b>.</li>
<li>PSK is much more robust than ASK as it is not that vulnerable to noise, which changes the amplitude of the signal.</li></ul>`,
            means: R`<p><b>Phase</b> is where in its cycle a sine wave starts, measured in degrees (L02 slide 6: “the position of the waveform relative to time 0”; slide 8 shows 0° starting at zero and rising, 180° starting at zero and falling). <b>PSK</b> (phase shift keying) keeps amplitude and frequency fixed and lets the bits choose the starting phase.</p>
<p>The bandwidth is the same formula as for ASK, with the same meaning of $d$:</p>
$$\c{bw}{B} = (1 + d) \times \c{baud}{S}$$
<p><b>Why is PSK more robust?</b> The slide's argument, step by step:</p>
<ol><li>Noise added to a signal mostly shows up as random changes in its <b>amplitude</b>.</li>
<li>ASK stores the bits in the amplitude, so that noise lands exactly where the data is: enough of it can make a 0 look like a 1.</li>
<li>PSK stores the bits in the phase, and the amplitude carries no data at all. The amplitude can wobble without changing what the receiver reads.</li></ol>
<table class="tbl"><thead><tr><th></th><th>ASK</th><th>FSK</th><th>PSK</th></tr></thead><tbody>
<tr><td>Data lives in</td><td>amplitude</td><td>frequency</td><td>phase</td></tr>
<tr><td>Bandwidth</td><td>$\c{bw}{B} = (1 + d)\,\c{baud}{S}$</td><td>$(1 + d)\,\c{baud}{S} + 2\c{freq}{\Delta f}$</td><td>$\c{bw}{B} = (1 + d)\,\c{baud}{S}$</td></tr>
<tr><td>Hurt by amplitude noise?</td><td>yes, the data is there</td><td>slide silent</td><td>much less (slide 21)</td></tr></tbody></table>`,
            why: R`<p>PSK is the scheme the rest of the lecture builds on: BPSK (slide 22), QPSK (slide 24) and, through QAM, the constellations of slides 27–31 all vary the phase. The robustness sentence is the one exam fact of this slide: an MCQ or essay asks “which of ASK and PSK is more robust to noise, and why?” The answer is PSK, because noise changes amplitude and PSK does not keep data there.</p>
<p>Careful with the other claim students invent: PSK does <b>not</b> need less bandwidth than ASK; the two formulas are identical. The slide says nothing about FSK's robustness, so do not claim it as a slide fact.</p>` },

          { n: 22, title: 'Binary Phase Shift Keying',
            says: R`<p>Left: an amplitude-versus-time plot for the bits <b>1 0 1 1 0</b>. Five equal slots, each labelled <b>1 signal element</b>; the 1 slots are drawn in blue and the 0 slots in black. The wave has the same height and the same frequency throughout. <b>Bit rate: 5</b> above, <b>1 s, Baud rate: 5</b> below.</p>
<p>Right: a yellow header <b>r = 1, S = N, B = (1 + d)S</b> and a spectrum with a single pink hump labelled <b>Bandwidth</b>, centred on <b>f<sub>c</sub></b> and away from 0.</p>`,
            means: R`<p><b>BPSK</b> (binary PSK) has two signal elements: the same carrier at two phases <b>180° apart</b>. With the convention of slide 29 (bit 1 at +I, bit 0 at −I) a 1 is the carrier at <b>0°</b> and a 0 is the carrier at <b>180°</b>.</p>
<p>A 180° shift is half a cycle, and it turns a sine wave upside down: where the 1-wave rises, the 0-wave falls. That is why the slide needs only two colours. Check the five slots against the bits:</p>
<table class="tbl compact"><thead><tr><th>Bit</th><th>1</th><th>0</th><th>1</th><th>1</th><th>0</th></tr></thead><tbody>
<tr><td>Phase</td><td>0°</td><td>180°</td><td>0°</td><td>0°</td><td>180°</td></tr>
<tr><td>Start of the element</td><td>zero, rising</td><td>zero, falling</td><td>zero, rising</td><td>zero, rising</td><td>zero, falling</td></tr></tbody></table>
<figure data-fig="l04.modwaves" data-schemes="bpsk" data-bits="10110" data-caption="BPSK for the slide's bits 1 0 1 1 0: the 0 elements are the 1 elements turned upside down. Amplitude and frequency never change."></figure>
<p>The rest of the figure repeats binary ASK (slide 10): five bits in 1 s are 5 baud and 5 bps, so $\c{level}{r} = 1$ and $\c{baud}{S} = \c{rate}{N}$, and the bandwidth is the single hump $\c{bw}{B} = (1 + d)\,\c{baud}{S}$ around $\c{freq}{f_c}$.</p>`,
            why: R`<p>Put this figure next to slide 10 (same bits, same five slots). The difference tells you everything: ASK silences the 0 elements, BPSK flips them, so the BPSK amplitude is constant and a burst of amplitude noise does not touch the data (slide 21).</p>
<p>Exam angle: drawing BPSK for a bit string, or identifying BPSK from a description (“two elements 180° apart”). BPSK is also the building block of QPSK on slides 24–25: QPSK is two BPSKs added. The usual drawing errors are showing a 0 as silence (ASK) or as a different frequency (FSK).</p>`,
            tip: R`<p>Drawing rule for BPSK: bit 1 starts at zero going up (0°), bit 0 starts at zero going down (180°); same height and same frequency throughout.</p>` },

          { n: 23, title: 'Implementation of PSK',
            says: R`<p>Left: three stacked plots over the bits <b>1 0 1 1 0</b>. Top (red): a digital signal that is above the axis for each 1 and below the axis for each 0. Middle (black): the <b>Carrier signal</b>. Bottom: the <b>Modulated signal</b>, blue in the 1 slots and gray in the 0 slots.</p>
<p>Right: the same block diagram as slide 11. The red pulse train, now going above and below zero, enters the <b>Multiplier</b>; the <b>Oscillator</b> feeds f<sub>c</sub> into it; out comes a wave in two shades.</p>`,
            means: R`<p>It is the circuit of slide 11 with a different input. The red signal is now <b>polar NRZ</b>: a positive level for a 1 and a negative level for a 0, as drawn on this slide. The multiplier computes <i>modulated = polar signal × carrier</i>:</p>
<table class="tbl compact"><thead><tr><th>Bit</th><th>Red signal</th><th>Red × carrier</th><th>Phase</th></tr></thead><tbody>
<tr><td class="mono">1</td><td>positive (+V)</td><td>carrier unchanged</td><td>0°</td></tr>
<tr><td class="mono">0</td><td>negative (−V)</td><td>carrier turned upside down</td><td>180°</td></tr></tbody></table>
<p>Multiplying a wave by a negative number flips it, and a flipped sine wave is the same wave shifted by 180°. The two circuits side by side:</p>
<table class="tbl compact"><thead><tr><th></th><th>Binary ASK (slide 11)</th><th>BPSK (this slide)</th></tr></thead><tbody>
<tr><td>Input to the multiplier</td><td><b>unipolar</b> NRZ (0 and +V)</td><td><b>polar</b> NRZ (−V and +V)</td></tr>
<tr><td>Bit 0 becomes</td><td>silence (× 0)</td><td>inverted carrier (× −V)</td></tr>
<tr><td>Amplitude of the output</td><td>changes</td><td>constant</td></tr></tbody></table>`,
            why: R`<p>This pair of slides gives the cleanest “implementation” item of the lecture: <b>BASK = unipolar NRZ × carrier; BPSK = polar NRZ × carrier</b>, same multiplier, same oscillator. It also explains the robustness claim of slide 21 in hardware terms: the output of BPSK never goes silent, its amplitude is constant, and only its sign (phase) carries data.</p>
<p>Common slips: saying BPSK needs a different oscillator (it does not), or swapping unipolar and polar. Slide 25 builds QPSK from two of these multipliers.</p>` },

          { n: 24, title: 'Quadrature PSK',
            says: R`<ul><li>To increase the bit rate, we can code 2 or more bits onto one signal element.</li>
<li>In QPSK, we parallelize the bit stream so that every two incoming bits are split up and PSK a carrier frequency. One carrier frequency is phase shifted 90° from the other — in quadrature.</li>
<li>The two PSKed signals are then added to produce one of 4 signal elements. L = 4 here.</li></ul>`,
            means: R`<p>BPSK carries one bit per signal element ($\c{level}{r} = 1$). To carry more bits in each element, <b>QPSK</b> (quadrature PSK) does this in three steps:</p>
<ol><li><b>Parallelize.</b> Cut the incoming bit stream into pairs. The first bit of each pair goes to branch 1 and the second bit to branch 2.</li>
<li><b>Two BPSKs.</b> Each branch is BPSK-modulated as on slide 23, but branch 2's carrier is shifted by 90°: the two carriers are <b>in quadrature</b>. Branch 1 uses the unshifted (in-phase) carrier, branch 2 the quadrature carrier. Slide 25 shows that both come from one oscillator, so they have the same frequency $\c{freq}{f_c}$ and differ only by the 90° shift, although the slide's wording says “carrier frequency” twice.</li>
<li><b>Add.</b> The two modulated signals are added, giving one wave per pair.</li></ol>
<p>Why exactly 4 elements: each branch has two possible signs, and $2 \times 2 = 4$ combinations, so $\c{level}{L} = 4$ and $\c{level}{r} = \log_2 \c{level}{4} = \c{level}{2}$ bits per element. Then $\c{rate}{N} = \c{baud}{S} \times \c{level}{2}$: for the same baud rate (and the same bandwidth, since $\c{bw}{B} = (1 + d)\,\c{baud}{S}$ is unchanged) the bit rate is twice that of BPSK.</p>`,
            why: R`<p>The first bullet is the principle behind the rest of the deck: more bits per signal element means a higher bit rate for the same baud rate, hence the same bandwidth. QPSK is the first scheme to deliver it ($\c{level}{r} = 2$); 16-QAM on slide 31 pushes it to $\c{level}{r} = 4$. Slide 25 shows the circuit, slide 26 the numbers, and slides 27–29 give the picture (the constellation).</p>
<p>Exam angle: an essay on “explain how QPSK works” should contain exactly the three steps, with “90°” and “L = 4”. Mistakes: saying QPSK uses two different frequencies, or that it needs twice the bandwidth of BPSK (it needs the same for twice the bit rate).</p>`,
            beyond: R`<p>Why the two added carriers do not scramble each other: a sine and a cosine of the same frequency are independent of one another, so the receiver can separate the two branches again (Forouzan).</p>` },

          { n: 25, title: 'QPSK and Its Implementation',
            says: R`<p>Left: the signals for four pairs, <b>00, 10, 01, 11</b>, in time order. A first bit stream <b>0 1 0 1</b> is drawn as a red step wave (low, high, low, high), above its black carrier and a blue modulated wave. A second bit stream <b>0 0 1 1</b> (low, low, high, high) is drawn the same way. At the bottom a green wave is the sum, with phase labels under the four elements: <b>−135, −45, 135, 45</b>.</p>
<p>Right: a block diagram. The input goes into a <b>2/1 converter</b> with two outputs. The upper output goes to a multiplier ⊗ fed directly by the <b>Oscillator</b>; the lower output goes to a second multiplier fed by the oscillator through a <b>90°</b> box. Both products (blue) feed an adder <b>Σ</b>, whose output is the green wave.</p>`,
            means: R`<p>Follow the four pairs from left to right. As drawn, bit 1 is the higher step and bit 0 the lower one, so a 1 is a <b>positive</b> branch and a 0 a <b>negative</b> branch. Following slide 29, the first bit sets the in-phase branch I and the second the quadrature branch Q:</p>
<table class="tbl compact"><thead><tr><th>Pair</th><th>1st bit → I</th><th>2nd bit → Q</th><th>Point (I, Q)</th><th>Phase on the slide</th></tr></thead><tbody>
<tr><td class="mono">00</td><td>0 → −</td><td>0 → −</td><td>(−, −)</td><td>−135°</td></tr>
<tr><td class="mono">10</td><td>1 → +</td><td>0 → −</td><td>(+, −)</td><td>−45°</td></tr>
<tr><td class="mono">01</td><td>0 → −</td><td>1 → +</td><td>(−, +)</td><td>135°</td></tr>
<tr><td class="mono">11</td><td>1 → +</td><td>1 → +</td><td>(+, +)</td><td>45°</td></tr></tbody></table>
<figure data-fig="l04.modwaves" data-schemes="qpsk" data-bits="00100111" data-caption="The kit's redraw of QPSK for the slide's four pairs 00 10 01 11: constant amplitude, with the phase jumping at each pair boundary."></figure>
<p>The sum of a branch that is +1 or −1 on the in-phase carrier and one that is +1 or −1 on the quadrature carrier always lands at an angle of 45°, 135°, −135° or −45°, and always with the same height (that is why the green wave has constant amplitude). The <b>2/1 converter</b> is the block that takes the one incoming bit stream and presents two bits side by side (the parallelizing of slide 24); the slide's label reads as “two bits in, one element out”.</p>`,
            why: R`<p>This slide is dense because it joins three things: the time diagram (what each pair does to the wave), the phase labels (the answer to “what is the phase of 10?”) and the circuit (two multipliers, one oscillator, one 90° shifter, one adder). Slide 29 will redraw the same four phases as points on a circle, so memorise the pairs now: <b>00 → −135°, 10 → −45°, 01 → 135°, 11 → 45°</b>.</p>
<p>Exam angle: identification of the 2/1 converter, the 90° box and the adder in the block diagram; drawing items need only the phase of each pair. Typical error: sending the second bit to I instead of Q, which swaps 10 and 01.</p>` },

          { n: 26, title: 'Example: QPSK bandwidth',
            says: R`<p><i>Find the bandwidth for a signal transmitting at 12 Mbps for QPSK. The value of d = 0.</i></p>
<p>Solution: for QPSK, 2 bits is carried by one signal element, so r = 2. The signal rate (baud rate) is S = N × (1/r) = 6 Mbaud. With d = 0 we have B = S = <b>6 MHz</b>.</p>`,
            means: R`<ol><li><b>Bits per element.</b> QPSK has $\c{level}{L} = 4$ elements, so $\c{level}{r} = \log_2 \c{level}{4} = \c{level}{2}$.</li>
<li><b>Baud rate.</b> $\c{baud}{S} = \c{rate}{N} \times \frac{1}{\c{level}{r}} = \c{rate}{12} \times \frac{1}{\c{level}{2}} = \c{baud}{6}$ Mbaud.</li>
<li><b>Bandwidth</b> (slide 21): $\c{bw}{B} = (1 + d) \times \c{baud}{S} = (1 + 0) \times \c{baud}{6} = \c{bw}{6}$ MHz.</li></ol>
<p>Compare with BPSK at the same 12 Mbps: $\c{level}{r} = 1$ gives $\c{baud}{S} = \c{baud}{12}$ Mbaud and $\c{bw}{B} = \c{bw}{12}$ MHz. QPSK halves the bandwidth. Equivalently, QPSK sends 2 bits per hertz here (12 Mbps in 6 MHz) while the MFSK example of slide 19 sent 3 Mbps in 8 MHz. With $d = 1$ the 100 kHz band of slide 12 would carry $\c{baud}{S} = 50$ kbaud, i.e. $\c{rate}{100}$ kbps with QPSK, against $\c{rate}{50}$ kbps for ASK or BPSK.</p>`,
            why: R`<p>This is the solving template for multilevel PSK: <b>r from L, then S = N/r, then B = (1 + d)S</b>. The example is the proof of slide 24's claim that more bits per element means less bandwidth for the same bit rate. It sits on the exam checklist next to slide 19 (multilevel FSK): same method, opposite conclusion, since MFSK's band grows with r and QPSK's shrinks.</p>
<p>Typical errors: using $\c{rate}{N} = 12$ MHz as the bandwidth, forgetting that d = 0 here (so no factor 2), and answering 24 MHz by multiplying instead of dividing by r.</p>`,
            example: { title: 'QPSK bandwidth (slide 26)', gen: 'l04.mlevel', params: { scheme: 'qpsk', N: 12e6, d: 0 },
              slideAnswer: R`$\c{level}{r} = 2$, $\c{baud}{S} = \c{baud}{6}$ Mbaud, $\c{bw}{B} = \c{bw}{6}$ MHz`, slideValue: 6e6, input: 'B' } }
        ],
        together: R`<p>One picture for slides 21–26: <b>PSK writes the bits into the carrier's phase; the amplitude never changes, so noise has little to attack; QPSK doubles the bit rate for the same bandwidth by sending two BPSKs in quadrature.</b></p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th></th><th>BPSK</th><th>QPSK</th></tr></thead><tbody>
<tr><td>Elements $\c{level}{L}$ / bits $\c{level}{r}$</td><td>$\c{level}{2}$ / $\c{level}{1}$</td><td>$\c{level}{4}$ / $\c{level}{2}$</td></tr>
<tr><td>Phases</td><td>1 = 0°, 0 = 180°</td><td>11 = 45°, 01 = 135°, 00 = −135°, 10 = −45°</td></tr>
<tr><td>Built from</td><td>polar NRZ × carrier</td><td>2/1 converter, two polar NRZ × carriers 90° apart, adder</td></tr>
<tr><td>For 12 Mbps and $d = 0$</td><td>$\c{baud}{S} = \c{baud}{12}$ Mbaud, $\c{bw}{B} = \c{bw}{12}$ MHz</td><td>$\c{baud}{S} = \c{baud}{6}$ Mbaud, $\c{bw}{B} = \c{bw}{6}$ MHz</td></tr></tbody></table></div>
<p>Facts to carry forward: PSK has the ASK bandwidth, $\c{bw}{B} = (1 + d)\,\c{baud}{S}$, but is much more robust to noise; BASK uses unipolar NRZ and BPSK uses polar NRZ in the same multiplier circuit; the first bit of a QPSK pair drives I and the second drives Q.</p>
<p>The next part gives all these phases and amplitudes a common picture. A constellation diagram puts every signal element on an I–Q plane, where distance from the origin is the amplitude and the angle is the phase. Plotting ASK, BPSK and QPSK that way leads naturally to QAM, which uses both.</p>` }
      ,
      /* ============================ PART 5: slides 27-31 ============================ */
      { title: 'Constellation diagrams and QAM', slides: [27, 31],
        items: [
          { n: 27, title: 'Constellation Diagrams',
            says: R`<ul><li>A constellation diagram helps us to define the amplitude and phase of a signal when we are using two carriers, one in quadrature of the other.</li>
<li>The X-axis represents the in-phase carrier and the Y-axis represents the quadrature carrier.</li></ul>`,
            means: R`<p><b>The problem.</b> ASK changes amplitude, PSK changes phase, and QAM (slide 30) changes both. A time plot of such a wave is hard to read, so we need a compact picture that shows <i>which</i> amplitude and phase each signal element has.</p>
<p><b>The two carriers.</b> Slides 24 and 25 used two carriers of the same frequency, 90° apart: the <b>in-phase carrier (I)</b>, the unshifted reference, and the <b>quadrature carrier (Q)</b>, the one shifted by 90°. Every signal element is built as “some amount of I plus some amount of Q”.</p>
<p><b>The diagram.</b> Draw a plane whose horizontal axis is the I amount and whose vertical axis is the Q amount. Each signal element is one <b>dot</b>, placed at (its I amount, its Q amount), with the bits it carries written beside it. A diagram with $\c{level}{L}$ dots describes a scheme with $\c{level}{L}$ signal elements, so it carries $\c{level}{r} = \log_2 \c{level}{L}$ bits per element.</p>
<p>It works like map coordinates: “3 east and 4 north” and “5 away, in that direction” describe the same spot. A dot at (I, Q) can likewise be read as “this much of each carrier” or, as slide 28 shows, as an amplitude and a phase.</p>`,
            why: R`<p>This slide opens the last part of the lecture, and its two axis names are the easiest marks to lose: <b>x = in-phase (I), y = quadrature (Q)</b>, never the reverse. The diagram is the common language for the three examples of slide 29 and for QAM on slides 30–31, and it is a natural essay answer, because you can draw it and annotate it.</p>
<p>It also closes a loop: the QPSK branches of slide 25 are exactly the two axes here, with the first bit of each pair on I and the second on Q.</p>` },

          { n: 28, title: 'Concept of Constellation Diagram',
            says: R`<p>Figure: a vertical axis labelled <b>Y (Quadrature carrier)</b> and a horizontal axis labelled <b>X (In-phase carrier)</b>. One pink dot sits in the upper right. Dashed lines drop from it to each axis: the horizontal extent is labelled <b>Amplitude of I component</b> and the vertical extent <b>Amplitude of Q component</b>. A dashed line from the origin to the dot is labelled <b>Length: amplitude</b>, and an arc between the +X axis and that line is labelled <b>Angle: phase</b>.</p>`,
            means: R`<p>There are two ways to locate the same dot:</p>
<ul><li><b>By components:</b> go the I amount across and the Q amount up. These are the two dashed lines to the axes.</li>
<li><b>By length and angle:</b> the length of the line from the origin is the <b>amplitude</b> of the signal element, and the angle from the +I axis to that line, counted counter-clockwise, is its <b>phase</b>.</li></ul>
<p>The length comes from Pythagoras, because I and Q are at right angles:</p>
$$A = \sqrt{I^2 + Q^2} \qquad \theta = \text{angle measured from the } {+I} \text{ axis}$$
<p>Two calculator-free examples. A dot at $I = 3$, $Q = 4$ has $A = \sqrt{9 + 16} = 5$. A dot with $I = Q = 1$ lies on the diagonal, so its phase is 45° and its amplitude is $\sqrt{2} \approx 1.4$. Landmarks to know: +I is 0°, +Q is 90°, −I is 180° and −Q is 270°, which is the same as −90°. Angles in the third quadrant can be written either way (225° = −135°), as slides 25 and 31 do.</p>`,
            why: R`<p>This slide is the decoder for every constellation: <b>length = amplitude, angle = phase</b> (the digest and slide labels, word for word). Exam questions ask exactly that in identification form, and then ask you to read a point (slide 31).</p>
<p>The common trap is to take a <i>coordinate</i> for the amplitude. The I amount and the Q amount are only the components; the amplitude is the longer diagonal. Slide 31's inset makes this mistake itself (25% for a point whose components are 25%), as noted there.</p>` },

          { n: 29, title: 'Example: constellation diagrams for ASK (OOK), BPSK and QPSK',
            says: R`<p><i>Show the constellation diagrams for an ASK (OOK), BPSK, and QPSK signals.</i></p>
<p>Three small plots with axes: <b>a. ASK (OOK)</b> has a dot at the origin labelled <b>0</b> and a dot on the positive horizontal axis labelled <b>1</b>. <b>b. BPSK</b> has a dot on the negative horizontal axis labelled <b>0</b> and one on the positive horizontal axis labelled <b>1</b>. <b>c. QPSK</b> has four dots on a dashed circle: <b>01</b> upper left, <b>11</b> upper right, <b>00</b> lower left, <b>10</b> lower right.</p>`,
            means: R`<div class="grid3">
<figure data-fig="l04.constellation" data-scheme="ook" data-caption="a. ASK (OOK): 0 at the origin, 1 on +I."></figure>
<figure data-fig="l04.constellation" data-scheme="bpsk" data-caption="b. BPSK: 0 at −I, 1 at +I."></figure>
<figure data-fig="l04.constellation" data-scheme="qpsk" data-caption="c. QPSK: four points 90° apart."></figure></div>
<ol><li><b>ASK (OOK).</b> Both dots are on the I axis. The 0 is at the origin (length 0: no signal), the 1 farther right (full amplitude). Only the <b>distance</b> differs; a dot at the origin has no meaningful phase. $\c{level}{L} = 2$, $\c{level}{r} = 1$.</li>
<li><b>BPSK.</b> Both dots are the same distance from the origin (the same amplitude) on opposite sides: 1 at +I (phase 0°) and 0 at −I (phase 180°), matching slide 22. $\c{level}{L} = 2$.</li>
<li><b>QPSK.</b> Four dots on a circle: the circle says the amplitude is the same for all four, and the dots are 90° apart at 45° (11), 135° (01), −135° (00) and −45° (10), the phases of slide 25. $\c{level}{L} = 4$, $\c{level}{r} = 2$.</li></ol>
<table class="tbl compact"><thead><tr><th>Scheme</th><th>Dots</th><th>What differs between dots</th></tr></thead><tbody>
<tr><td>ASK</td><td>2</td><td>distance from the origin (amplitude)</td></tr><tr><td>BPSK</td><td>2</td><td>angle (phase), 180° apart</td></tr>
<tr><td>QPSK</td><td>4</td><td>angle (phase), 90° apart</td></tr></tbody></table>
<p>ASK slides along a line; PSK moves around a circle. QAM (slide 30) will use both movements.</p>`,
            why: R`<p>This is the slide-29 drawing exercise, and it is a likely drawing or essay item: sketch the three diagrams with axes labelled (I and Q) and the dots labelled exactly as here. The details that score are: OOK's 0 at the <b>origin</b>, BPSK's 1 on the <b>right</b>, and QPSK's labels in the order <b>01 11 / 00 10</b>.</p>
<p>The QPSK dots tie the lecture together: the phases come from slide 25's circuit, the “same amplitude” from slide 21's idea that PSK keeps the amplitude constant, and the four dots from L = 4 on slide 24. Typical error: swapping 00 and 11, which puts them in the wrong quadrants.</p>`,
            beyond: R`<p>Going counter-clockwise from 45° the labels run 11, 01, 00, 10, so neighbours differ in exactly one bit. This is Gray coding: a small phase error then flips at most one bit (Forouzan).</p>` },

          { n: 30, title: 'QAM',
            says: R`<ul><li>Quadrature amplitude modulation is a combination of ASK and PSK.</li></ul>
<p>Four constellation panels, each with I and Q axes and grey squares joining the dots: <b>a. 4-QAM</b>: four dots at the corners of a small square with one corner on the origin, so dots at the origin, on +I, on +Q and on the diagonal. <b>b. 4-QAM</b>: four dots at the corners of a larger square centred on the origin, one in each quadrant. <b>c. 4-QAM</b>: four dots at the corners of a small square entirely inside the upper-right quadrant. <b>d. 16-QAM</b>: four small squares, one in each quadrant, each with four dots at its corners (16 dots in all).</p>`,
            means: R`<p><b>QAM</b> (quadrature amplitude modulation) changes <b>both</b> the amplitude and the phase of the carrier, which is why slide 4 drew dashed arrows into it from ASK and from PSK. In constellation terms, its dots differ in both distance from the origin and angle.</p>
<p>Why combine? One characteristic alone limits how many dots you can fit. With two to vary, you can place many more distinguishable dots, and more dots means more bits per signal element. Reading the panels:</p>
<table class="tbl compact"><thead><tr><th>Panel</th><th>Layout</th><th>Dots $\c{level}{L}$</th><th>Bits $\c{level}{r} = \log_2 \c{level}{L}$</th></tr></thead><tbody>
<tr><td>a. 4-QAM</td><td>square with a corner at the origin: distances 0, 1, 1 and about 1.4 (in units of the square's side)</td><td>$\c{level}{4}$</td><td>$\c{level}{2}$</td></tr>
<tr><td>b. 4-QAM</td><td>four corners around the origin: the same four-corner layout as QPSK on slide 29, so all dots at the same distance</td><td>$\c{level}{4}$</td><td>$\c{level}{2}$</td></tr>
<tr><td>c. 4-QAM</td><td>small square off to one side: all phases between 0° and 90°, different distances</td><td>$\c{level}{4}$</td><td>$\c{level}{2}$</td></tr>
<tr><td>d. 16-QAM</td><td>four groups of four, one per quadrant</td><td>$\c{level}{16}$</td><td>$\c{level}{4}$</td></tr></tbody></table>
<p>The slides give no separate bandwidth formula for QAM; slide 31 shows only the labelled 16-QAM layout.</p>`,
            why: R`<p>The identification fact of this slide is the one-line definition: <b>QAM = a combination of ASK and PSK</b> (not FSK). The second fact is counting: dots → L → $\c{level}{r} = \log_2 \c{level}{L}$ bits, so 16-QAM carries 4 bits per element, twice QPSK's 2 and four times BPSK's 1.</p>
<p>Slide 31 labels panel d, so you can read real bit patterns. Remember that three of the four panels here are 4-QAM; a question that says “4-QAM” may refer to any of them, and 4-QAM with equal distances is simply QPSK.</p>`,
            beyond: R`<p>The textbook gives QAM the same bandwidth formula as ASK and PSK, $B = (1 + d) \times S$, so 16-QAM at 12 Mbps would need $S = 3$ Mbaud (Forouzan). Packing more dots closer together makes them easier for noise to confuse.</p>` },

          { n: 31, title: 'QAM: reading the 16-QAM constellation',
            says: R`<ul><li>Quadrature amplitude modulation is a combination of ASK and PSK.</li></ul>
<p>Figure: a 4 × 4 grid of cyan dots on I and Q axes, with tick labels <b>25%</b>, <b>50%</b> and <b>75%</b> along the positive I axis. Each dot carries a 4-bit label. Rows from the top: <b>1011 1001 | 0010 0011</b>, <b>1010 1000 | 0000 0001</b>, <b>1101 1100 | 0100 0110</b>, <b>1111 1110 | 0101 0111</b>. A red arc labelled <b>Phase°</b> sweeps counter-clockwise from the +I axis, over the top and round the left, ending at the dot <b>1100</b>, which is joined to the origin by a black line. A small table beside the grid reads <b>Amp 25%, Phase 225°, Data 1100</b>.</p>`,
            means: R`<figure data-fig="l04.constellation" data-scheme="16qam" data-highlight="1100" data-caption="The slide's 16-QAM (1 unit = 25%). Highlighted: 1100 at I = Q = −25%, phase 225°."></figure>
<p>The dots sit at $\pm 25\%$ and $\pm 75\%$ of full scale on each axis. To read a point, work in steps:</p>
<ol><li><b>Find the dot.</b> 1100 is in the second column from the left ($I = -25\%$) and the third row from the top ($Q = -25\%$).</li>
<li><b>Phase.</b> $I = Q$ and both are negative, so the dot is on the diagonal of the third quadrant: $180^\circ + 45^\circ = 225^\circ$, which is the arc on the slide (the same as −135°).</li>
<li><b>Amplitude.</b> The components are 25% and 25%, so the length is $A = \sqrt{25^2 + 25^2} = 25\sqrt{2} \approx 35\%$.</li></ol>
<p>Where the bits sit: the <b>first two bits</b> pick the quadrant (00 upper right, 10 upper left, 11 lower left, 01 lower right) and the <b>last two bits</b> pick one of the four dots in it. How the last two bits map inside each quadrant is not the same in every quadrant, so read it from the grid:</p>
<table class="tbl compact"><thead><tr><th>Q ↓ / I →</th><th>−75%</th><th>−25%</th><th>+25%</th><th>+75%</th></tr></thead><tbody>
<tr><th>+75%</th><td class="mono">1011</td><td class="mono">1001</td><td class="mono">0010</td><td class="mono">0011</td></tr>
<tr><th>+25%</th><td class="mono">1010</td><td class="mono">1000</td><td class="mono">0000</td><td class="mono">0001</td></tr>
<tr><th>−25%</th><td class="mono">1101</td><td class="mono">1100</td><td class="mono">0100</td><td class="mono">0110</td></tr>
<tr><th>−75%</th><td class="mono">1111</td><td class="mono">1110</td><td class="mono">0101</td><td class="mono">0111</td></tr></tbody></table>
<p>This is QAM in action: 0000 at (+25%, +25%) and 0011 at (+75%, +75%) have the <b>same phase</b>, 45°, but 0011 is three times farther out, so it differs in amplitude. Each dot carries $\c{level}{r} = \log_2 \c{level}{16} = \c{level}{4}$ bits.</p>`,
            why: R`<p>This is the slide to practise on. Typical items: “what phase does 1100 have?” (225°), “which bits are sent at I = −75%, Q = +25%?” (1010), and “how many bits per element?” (4). The earlier slides give you the tools: slide 28 for amplitude and phase, slide 30 for the meaning of QAM, slide 7 for $\c{level}{r} = \log_2 \c{level}{L}$.</p>
<p>It is also the slide with a known mistake: the inset's “Amp 25%” is the I and Q <b>component</b>, not the length. If a question follows the slide, 25% is the expected value; if it asks for the distance from the origin, it is about 35%. The phase of 225° is right either way. Last slide of the lecture: after this, the kit's practice generators and the formula sheet are what is left to master.</p>`,
            error: { says: 'The inset table gives point 1100 an amplitude of 25%.',
              correct: '25% is the I component and also the Q component of 1100. Its amplitude, the distance from the origin, is √2 × 25% ≈ 35%. The phase, 225°, is correct.' },
            example: { title: 'Reading the 16-QAM constellation (slide 31)', gen: 'l04.constellation', params: { scheme: '16qam', bits: '1100', ask: 'phase' },
              slideAnswer: R`1100 sits at $I = Q = -25\%$, so its phase is $225^\circ$ (the slide's inset)` } }
        ],
        together: R`<p>One picture for slides 27–31: <b>a constellation diagram puts every signal element on an I–Q plane, where distance from the origin is the amplitude and the angle is the phase; ASK moves along a line, PSK around a circle, QAM uses both.</b></p>
<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Scheme</th><th>Dots</th><th>Dots differ in</th><th>Bits per element</th></tr></thead><tbody>
<tr><td>ASK (OOK)</td><td>0 at the origin, 1 on +I</td><td>amplitude</td><td>$\c{level}{1}$</td></tr>
<tr><td>BPSK</td><td>0 at −I, 1 at +I</td><td>phase (180° apart)</td><td>$\c{level}{1}$</td></tr>
<tr><td>QPSK</td><td>11 45°, 01 135°, 00 −135°, 10 −45°</td><td>phase (90° apart)</td><td>$\c{level}{2}$</td></tr>
<tr><td>16-QAM</td><td>4 × 4 grid at ±25%, ±75%</td><td>amplitude and phase</td><td>$\c{level}{4}$</td></tr></tbody></table></div>
<p>Rules to keep: x-axis = in-phase (I), y-axis = quadrature (Q); length = amplitude and angle = phase; $\c{level}{r} = \log_2 \c{level}{L}$ where $\c{level}{L}$ is the number of dots; 1100 in 16-QAM is at 225° (its amplitude is about 35%, not the 25% of the inset).</p>
<p>The whole lecture in one chain: a bandpass channel needs a <b>carrier</b>; the bits change its amplitude, frequency or phase (or amplitude and phase, QAM); the bandwidth follows the baud rate, $\c{baud}{S} = \c{rate}{N} / \c{level}{r}$: $\c{bw}{B} = (1 + d)\,\c{baud}{S}$ for ASK and PSK, plus $2\c{freq}{\Delta f}$ for FSK, plus $(\c{level}{L} - 1)$ gaps for MFSK. This is the last deck inside the midterm coverage, so the next steps are in the kit itself: the L04 formula sheet and the practice generators, which repeat slides 6, 7, 12, 13, 16, 19, 26 and 31 with fresh numbers.</p>` }
    ],
    terms: [
      { term: 'Modulation', alt: ['modulated signal'],
        def: 'Changing a characteristic of the carrier (amplitude, frequency or phase) according to the data bits, so that each bit pattern gives a unique, recognisable signal element. The modulated signal is the carrier after the change; the demodulator reverses it at the receiver.', ref: 'L04 p2; L04 p3' },
      { term: 'Shift keying', alt: ['keying'],
        def: 'Switching one characteristic of the carrier between a few fixed values, one per data pattern: amplitude (ASK), frequency (FSK) or phase (PSK). The word “keying” appears in the titles of slides 4, 8, 14 and 21.', ref: 'L04 p4' },
      { term: 'Oscillator',
        def: 'The circuit that generates the carrier at frequency f<sub>c</sub>. In binary ASK and BPSK it feeds the multiplier; in QPSK the same oscillator also feeds a second multiplier through a 90° shift.', ref: 'L04 p11; L04 p25' },
      { term: 'Multiplier',
        def: 'The block, drawn as a circle with ×, that multiplies the digital signal by the carrier. Unipolar NRZ (0 and +V) gives binary ASK; polar NRZ (−V and +V) gives BPSK, which turns the carrier upside down for a 0.', ref: 'L04 p11; L04 p23' },
      { term: 'Frequency offset (Δf)', alt: ['Δf'],
        def: 'In FSK, the distance from the carrier f<sub>c</sub> to each of the two frequencies: f<sub>1</sub> = f<sub>c</sub> + Δf for a 1 and f<sub>2</sub> = f<sub>c</sub> − Δf for a 0. The two are 2Δf apart, and 2Δf is added to the FSK bandwidth.', ref: 'L04 p14; L04 p15' },
      { term: 'Full duplex', alt: ['full-duplex'],
        def: 'A link with communication in both directions at once. Each direction needs its own carrier, so the available band is split in two: 200–300 kHz becomes two 50 kHz halves with carriers at 225 and 275 kHz, giving 25 kbps each way for ASK with d = 1.', ref: 'L04 p13' },
      { term: '2/1 converter',
        def: 'The block at the QPSK input that parallelizes the bit stream: from every pair of incoming bits it sends the first to the in-phase branch and the second to the quadrature branch, which is then shifted by 90°.', ref: 'L04 p24; L04 p25' },
      { term: '16-QAM',
        def: 'QAM with 16 signal elements, so r = log₂ 16 = 4 bits per element. On slide 31 I and Q take the values ±25% and ±75%; the first two bits give the quadrant and the last two the dot inside it. Point 1100 lies at 225°.', ref: 'L04 p30; L04 p31' }
    ],
    keyTerms: ['Carrier signal', 'Modulation', 'Bit rate (N)', 'Baud rate (S)', 'd (modulation factor)', 'ASK', 'OOK', 'FSK', 'Frequency offset (Δf)',
      'MFSK', 'PSK', 'BPSK', 'QPSK', 'Constellation diagram', 'QAM'],
    faq: [
      { q: R`What is the difference between bit rate and baud rate, and why can the baud rate not be larger?`,
        a: R`<p>The bit rate $\c{rate}{N}$ counts <b>bits</b> per second; the baud rate $\c{baud}{S}$ counts <b>signal elements</b> per second. They are tied by $\c{baud}{S} = \c{rate}{N} \times \frac{1}{\c{level}{r}}$. In analog transmission each element carries at least one bit ($\c{level}{r} \ge 1$), so $\c{baud}{S} \le \c{rate}{N}$. Example: 4 bits per element at 1,000 baud is 4,000 bps.</p>`, ref: 'L04 p5; L04 p6' },
      { q: R`Why do the bandwidth formulas use S and not N, and how does a larger r help?`,
        a: R`<p>For ASK and PSK, $\c{bw}{B} = (1 + d) \times \c{baud}{S}$: the band follows the number of signal elements per second. More bits per element lowers $\c{baud}{S} = \c{rate}{N} / \c{level}{r}$ and so the band: QPSK at 12 Mbps needs 6 MHz (d = 0) where BPSK would need 12 MHz. The price is $\c{level}{L} = 2^{\c{level}{r}}$ elements that the receiver must tell apart.</p>`, ref: 'L04 p9; L04 p21; L04 p26' },
      { q: R`Where do I put the carrier in a band, and what changes for full duplex?`,
        a: R`<p>Put $\c{freq}{f_c}$ at the middle: $\frac{f_{\text{low}} + f_{\text{high}}}{2}$, so 250 kHz for 200–300 kHz. For full duplex split the band in two halves, each with its own carrier in the middle: 225 and 275 kHz, and each direction gets half the bandwidth, so 25 kbps instead of 50 kbps for ASK with d = 1.</p>`, ref: 'L04 p12; L04 p13' },
      { q: R`Why does FSK get only half the ASK bit rate in the same 200–300 kHz band?`,
        a: R`<p>FSK has the extra term $2\c{freq}{\Delta f}$: $\c{bw}{B} = (1 + d)\,\c{baud}{S} + 2\c{freq}{\Delta f}$. With the slide's choice $2\c{freq}{\Delta f} = 50$ kHz, half of the 100 kHz is the gap, leaving $(1 + 1)\,\c{baud}{S} = 50$ kHz, so $\c{baud}{S} = 25$ kbaud and $\c{rate}{N} = 25$ kbps against 50 kbps for ASK. Subtract $2\c{freq}{\Delta f}$ first, then divide by $(1 + d)$.</p>`, ref: 'L04 p15; L04 p16' },
      { q: R`What is wrong with the MFSK bandwidth formula on slide 18, and what is the bandwidth for 8 frequencies?`,
        a: R`<p>The slide prints $(L - 1)/2\Delta f$; it is a product, $(\c{level}{L} - 1) \times 2\c{freq}{\Delta f}$ (a division by a frequency would not even give hertz). With $d = 0$ and the minimum spacing $2\c{freq}{\Delta f} = \c{baud}{S}$ it reduces to $\c{bw}{B} = \c{level}{L} \times \c{baud}{S}$: for 3 Mbps at 3 bits per element, $\c{level}{L} = 8$, $\c{baud}{S} = 1$ Mbaud and $\c{bw}{B} = 8$ MHz.</p>`, ref: 'L04 p18; L04 p19' },
      { q: R`Why is PSK more robust than ASK, and do the two need the same bandwidth?`,
        a: R`<p>Noise mostly changes a signal's amplitude. ASK stores the data in the amplitude, so noise attacks the data directly; PSK stores it in the phase and keeps the amplitude constant, so it is much more robust. The bandwidth is the same for both: $\c{bw}{B} = (1 + d) \times \c{baud}{S}$.</p>`, ref: 'L04 p21' },
      { q: R`How do the implementations of binary ASK and BPSK differ?`,
        a: R`<p>Both multiply an NRZ signal by the carrier from an oscillator. BASK multiplies a <b>unipolar</b> NRZ signal (0 and +V): a 0 gives silence. BPSK multiplies a <b>polar</b> NRZ signal (−V and +V): a 0 gives the carrier turned upside down, a 180° phase shift, so the amplitude stays constant.</p>`, ref: 'L04 p11; L04 p23' },
      { q: R`How do I read a point on a constellation diagram, and what are the QPSK and 16-QAM labels?`,
        a: R`<p>The length of the line from the origin is the amplitude and its angle from the +I axis is the phase; x is I and y is Q. QPSK: 11 at 45°, 01 at 135°, 00 at −135°, 10 at −45° (first bit on I). In 16-QAM the first two bits give the quadrant; 1100 is at I = Q = −25%, phase 225°, amplitude about 35% although the inset says 25%.</p>`, ref: 'L04 p28; L04 p29; L04 p31' }
    ]
  });
})();
