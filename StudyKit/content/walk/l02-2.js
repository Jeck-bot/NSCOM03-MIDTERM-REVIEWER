/* Slide-by-slide walkthrough: L02 slides 20–39 (topic l02). Contract: docs/AUTHORING.md §3.7.
   Math is written with String.raw (R) so that TeX backslashes (\c{role}{…}, \frac, \times) stay exactly as typed. */
(function () {
  'use strict';
  var R = String.raw;
  function ref(p) { return ' <span class="chip ref">' + p + '</span>'; }

  KIT.walk({
    id: 'l02-2', topic: 'l02', range: [20, 39],
    parts: [
      /* ============================ PART 1 ============================ */
      { title: 'What goes wrong on the way: attenuation, distortion and noise', slides: [20, 24],
        items: [
          { n: 20, title: 'Attenuation',
            says: R`<ul>
<li>When a signal, simple or composite, travels through a medium, it loses some of its energy in overcoming the resistance of the medium.
  <ul><li><b>Attenuation</b> means a loss of energy.</li></ul></li>
<li>To compensate for this loss, <b>amplifiers</b> are used to amplify the signal.</li>
<li>To show that a signal has lost or gained strength, engineers use the unit of the <b>deciBel</b> (written “db” on the slide).</li>
</ul>
<p><b>Figure.</b> A transmission line with three marked points. At <b>Point 1</b> the “Original” wave is large. Along the “Transmission medium” to <b>Point 2</b> the wave is “Attenuated”: the same wiggly shape, drawn much smaller. An “Amplifier” triangle sits between Point 2 and <b>Point 3</b>, where the wave is “Amplified” and back to about its original size.</p>`,
            means: R`<p>A signal is energy moving through a medium (copper, fiber or air). The medium resists the movement, so part of the energy is used up on the way and the signal arrives weaker; the longer the path, the more is lost. That loss is <b>attenuation</b>. The slide says it happens to a <i>simple</i> signal (one sine wave, slide 6) and to a <i>composite</i> one (slide 11) alike.</p>
<p>Walk through the figure from left to right:</p>
<ol>
<li><b>Point 1</b> is the start of the line: the “Original” wave at full strength.</li>
<li><b>Point 1 to Point 2</b>: the medium takes energy out of the signal. At Point 2 the wave has the same shape but a smaller height, because less energy (less power) is left in it.</li>
<li><b>Amplifier</b>: a device that adds energy to a weak signal and so boosts it again.</li>
<li><b>Point 3</b>: the wave is big again, so the amplifier has compensated for the loss between Points 1 and 2.</li>
</ol>
<figure data-fig="l02.attenuation"></figure>
<p>The last bullet names the tool for putting a number on this: the <b>decibel</b> (dB), a unit that says how much stronger or weaker a signal is at one point compared with another. Slide 21 gives its formula. All you need for now is the sign rule that slide 21 states: a loss is a <i>negative</i> number of dB and a gain is a <i>positive</i> one. In the figure, the stretch of medium would be negative and the amplifier positive.</p>`,
            why: R`<p>Slide 19 showed the symptom: bits sent as 1011110 came back as “Heck”. Slides 20 to 24 give the three causes, one at a time: attenuation here (the signal gets <i>weaker</i>), distortion on slide 23 (its <i>shape</i> changes) and noise on slide 24 (<i>unwanted energy</i> is added). Attenuation is why long links need amplifiers along the way. A weak signal is not a disaster by itself; it becomes one when it is no longer much stronger than the noise, which is what the signal-to-noise ratio on slide 25 measures.</p>
<p><b>Exam angle.</b> Identification: “a loss of energy” → attenuation; “the device used to compensate for it” → amplifier; “the unit used to show a gain or loss” → decibel. Essay: attenuation is the first of the three impairments in the slide-38 summary${ref('L02 p38')}. The usual mistakes are to say that attenuation changes the <i>shape</i> (that is distortion) and to write the unit as “db”.</p>`,
            tip: R`<p>Attenuation makes the signal smaller, not different. Amplifiers are the slide’s cure for attenuation, and they say nothing about shape changes or noise.</p>`,
            error: { says: R`The unit is written “deciBel (db)”.`, correct: R`The symbol is <b>dB</b> (lower-case d, capital B): decibel.` } },

          { n: 21, title: 'DeciBel',
            says: R`<ul>
<li>DeciBel measures the relative strengths of two signals or one signal at two different points.
  <ul><li>Note that the decibel is negative if a signal is attenuated and positive if a signal is amplified.</li></ul></li>
</ul>
$$\c{snr}{\text{dB}} = 10 \log_{10} \frac{\c{snr}{P_2}}{\c{snr}{P_1}}$$
<ul><li>Variables $\c{snr}{P_1}$ and $\c{snr}{P_2}$ are the powers of a signal at points 1 and 2.</li></ul>`,
            means: R`<p>A <b>decibel</b> is not a unit of power. It is a unit for a <i>comparison</i>: how many times stronger or weaker is the signal at point 2 than at point 1? To compute it:</p>
<ol>
<li>Divide the power after by the power before: the ratio $\frac{\c{snr}{P_2}}{\c{snr}{P_1}}$. It is below 1 if the signal lost power, above 1 if it gained power, and exactly 1 if nothing changed.</li>
<li>Take the base-10 logarithm. $\log_{10} x$ asks “10 to which power gives $x$?”. So $\log_{10} 100 = 2$ because $10^2 = 100$, $\log_{10} 1 = 0$ and $\log_{10} 0.1 = -1$.</li>
<li>Multiply by 10.</li>
</ol>
<p>Why a logarithm? Powers on a link differ by huge factors, from watts down to microwatts, and the logarithm squeezes that range into small numbers. Values to know by heart (no calculator needed):</p>
<table class="tbl">
<thead><tr><th>Ratio $\frac{\c{snr}{P_2}}{\c{snr}{P_1}}$</th><th>1000</th><th>100</th><th>10</th><th>2</th><th>1</th><th>½</th><th>0.1</th><th>0.01</th></tr></thead>
<tbody><tr><td>$\c{snr}{\text{dB}}$</td><td>$\c{snr}{+30}$</td><td>$\c{snr}{+20}$</td><td>$\c{snr}{+10}$</td><td>$\approx \c{snr}{+3}$</td><td>$\c{snr}{0}$</td><td>$\approx \c{snr}{-3}$</td><td>$\c{snr}{-10}$</td><td>$\c{snr}{-20}$</td></tr></tbody>
</table>
<p>The sign gives the direction. $\c{snr}{P_2}$ is the power <i>after</i> the stage and $\c{snr}{P_1}$ the power <i>before</i>, so a loss gives $\c{snr}{P_2} \lt \c{snr}{P_1}$, a ratio below 1, a negative logarithm and therefore a <b>negative</b> dB. Swapping $\c{snr}{P_1}$ and $\c{snr}{P_2}$ flips the sign, so put the later point on top. Going backwards, $\c{snr}{P_2} = \c{snr}{P_1} \times 10^{\c{snr}{\text{dB}}/10}$: every +10 dB multiplies the power by 10 and every −10 dB divides it by 10.</p>
<p>Apply it to slide 20’s picture with numbers. A 2 mW signal crosses a cable with a 10 dB loss, then an amplifier with a 30 dB gain, then another cable with a 10 dB loss. The decibels of stages in a row simply add (a textbook rule${ref('Forouzan')}), so the net change is $\c{snr}{-10} + \c{snr}{30} - \c{snr}{10} = \c{snr}{+10}$ dB, a net <i>gain</i> of ×10, and 2 mW becomes 20 mW. The animation below follows the power through each stage.</p>`,
            why: R`<p>Slide 20 introduced the unit; slide 21 is where it becomes arithmetic. The same formula comes back on slide 25 for SNR, with the signal power playing P<sub>2</sub> and the noise power playing P<sub>1</sub>. Slide 22 applies the formula to a signal that loses half its power.</p>
<p><b>Exam angle.</b> Solving (no calculator): the dB of a ratio you can do by hand (½, 2, 10, 100, 0.1), or the output power from an input power and a dB figure. Identification: “negative if attenuated, positive if amplified”. Mistakes: swapping P<sub>1</sub> and P<sub>2</sub> (wrong sign), dropping the factor 10, using $\log_2$ or $\ln$ instead of $\log_{10}$, and forgetting the sign in the answer.</p>`,
            tip: R`<p>Four anchors give almost every exam value: +10 dB = ×10, −10 dB = ÷10, +3 dB = ×2, −3 dB = ÷2. For stages in a row, add the dB first and convert once at the end.</p>`,
            example: { title: 'A chain of losses and an amplifier (slide 20’s picture with numbers; adding dB is the textbook rule)', gen: 'l02.db', params: { find: 'chain', Pin: 0.002, stages: [-10, 30, -10] } } },

          { n: 22, title: 'Attenuation Example',
            says: R`<p>“Suppose a signal travels through a transmission medium and its power is reduced to one-half. This means that P2 = P1.” (as printed; the ½ is missing from the sentence). The slide then works the formula:</p>
$$10 \log_{10} \frac{\c{snr}{P_2}}{\c{snr}{P_1}} = 10 \log_{10} \frac{0.5\,\c{snr}{P_1}}{\c{snr}{P_1}} = 10 \log_{10} 0.5 = 10(-0.3) = \c{snr}{-3\text{ dB}}$$`,
            means: R`<p>This is slide 21’s formula applied to a medium that halves the power. Read it left to right, one equals sign at a time:</p>
<ol>
<li><b>“Reduced to one-half”</b> means $\c{snr}{P_2} = 0.5\,\c{snr}{P_1}$. That is the second expression on the slide, and the sentence above it should say the same (see the correction).</li>
<li><b>Substitute</b> into the ratio: $\frac{\c{snr}{P_2}}{\c{snr}{P_1}} = \frac{0.5\,\c{snr}{P_1}}{\c{snr}{P_1}} = 0.5$. The power $\c{snr}{P_1}$ cancels, so the answer does not depend on how big the signal was: halving 1 W and halving 1 µW are both the same change in dB.</li>
<li><b>Take the logarithm.</b> Because $0.5 = \frac{1}{2}$ and $\log_{10} 2 \approx 0.3$, we get $\log_{10} 0.5 \approx -0.3$. The slide writes this as $10(-0.3)$.</li>
<li><b>Multiply by 10</b>: $10 \times (-0.3) = \c{snr}{-3}$ dB. Negative, so the signal was attenuated (slide 21’s sign rule).</li>
</ol>
<p>The exact value is −3.01 dB; the slide rounds to −3. The result is the most reusable fact in the lecture: <b>half the power is −3 dB, double the power is +3 dB</b>. A 3 dB loss followed by a 3 dB amplifier gain restores the original power, which is the situation drawn on slide 20.</p>`,
            why: R`<p>Slide 21 gave the formula; this slide shows how it is actually evaluated, and it is the one dB calculation the lecture spells out. Expect it, or a variation with a different clean ratio (a quarter of the power is −6 dB, a tenth is −10 dB, a hundredth is −20 dB), as a solving item.</p>
<p><b>Exam angle.</b> The answer must carry its <b>sign and unit</b>: “−3 dB”. Usual mistakes: answering +3 dB (forgetting that a loss is negative), −0.3 (forgetting the factor 10), or reading the slide’s “P2 = P1” literally, which would mean no change at all and 0 dB.</p>`,
            tip: R`<p>Memory hook: “half = minus three”. Halving the power twice (a quarter) is −3 − 3 = −6 dB.</p>`,
            error: { says: R`“its power is reduced to one-half. This means that P2 = P1.”`, correct: R`$\c{snr}{P_2} = 0.5\,\c{snr}{P_1}$. The ½ is missing in the sentence, but the equation below it uses 0.5 P<sub>1</sub>, which is why the answer is −3 dB and not 0 dB.` },
            example: { title: 'Power halved: attenuation in dB (slide 22)', gen: 'l02.db', params: { find: 'dB', P1: 1, P2: 0.5 },
              slideAnswer: '10 log₁₀ 0.5 = 10(−0.3) = −3 dB', slideValue: -3.0103, input: 'dB' } },

          { n: 23, title: 'Distortion',
            says: R`<ul>
<li><b>Distortion</b> means that the signal changes its form or shape.
  <ul><li>Distortion can occur in a composite signal made of different frequencies.</li>
  <li>Signals in a composite signal may arrive at different times because of different propagation speed per frequency.</li></ul></li>
</ul>
<p><b>Figure.</b> “At the sender”: on the left the “Composite signal sent” (a pulse-like wave with small ripples on its flat parts), and beside it three stacked sine waves labelled “Components, in phase” (one slow, one medium, one fast). “At the receiver”: the same three components, now labelled “Components, out of phase”, and on the right the “Composite signal received”, whose ripples sit in different places, so its shape differs from the one sent.</p>`,
            means: R`<p>Slide 11 showed that a composite signal is a sum of sine waves, and slide 12 that the <i>shape</i> of the sum depends on the components being lined up in time (their phases, slide 8). <b>Distortion</b> is what happens when that lineup is broken.</p>
<ol>
<li><b>At the sender</b> the components start together, “in phase”. Adding them gives the composite signal on the left.</li>
<li><b>In the medium</b> each frequency travels at its own propagation speed (the speed of a wave in the medium, slide 9). Components that left together therefore arrive at different times.</li>
<li><b>At the receiver</b> each component is still a sine wave of the same frequency, but it is shifted in time relative to the others: they are now “out of phase”.</li>
<li><b>Adding the shifted components</b> gives a different curve, the “Composite signal received”. The shape has changed, which is exactly the slide’s definition of distortion.</li>
</ol>
<figure data-fig="l02.impairments" data-caption="Drawn for this walkthrough, not on the slide. The dashed curve is what was sent. Top: attenuation (slide 20) keeps the shape and shrinks it. Middle: distortion (this slide) delays the faster component, so the shape changes. Bottom: noise (slide 24) adds unwanted wiggles."></figure>
<p>Compare with attenuation: there the shape stayed and only the size shrank; here the shape changes even if no energy is lost. A single sine wave cannot be distorted this way, because delaying a sine wave only slides it sideways and it is still the same sine wave; that is why the slide says distortion occurs in a <i>composite</i> signal.</p>
<p>A digital signal is especially exposed: slide 38 calls it a composite signal with an infinite bandwidth, and its sharp edges exist only because many components add up in step. Components that arrive out of step blur or ripple the edges, and the receiver may then misread a bit.</p>`,
            why: R`<p>Slides 20, 23 and 24 are three different failures of the same signal. Attenuation is about <i>size</i> and is cured by an amplifier; distortion is about <i>shape</i> and comes from the medium treating frequencies differently; noise (next slide) is about <i>extra energy</i>. Slide 17 showed a different way to lose shape: a channel that <i>drops</i> some frequencies rounds the corners of a digital pulse. Distortion keeps all the frequencies but <i>delays</i> them differently.</p>
<p><b>Exam angle.</b> Identification: “the signal changes its form or shape” → distortion; “components arrive at different times because of different propagation speed per frequency” → distortion. Essay: an answer that draws the sent and received composite signals scores well. Mistake: describing distortion as a loss of energy or as added noise.</p>`,
            tip: R`<p>Attenuation changes the <i>size</i>, distortion changes the <i>shape</i>. Distortion needs a composite signal (several frequencies); delaying every component by the same amount is just a delay, not a new shape.</p>` },

          { n: 24, title: 'Noise',
            says: R`<ul>
<li>Noise corrupts the signal at the receiving end.</li>
<li>There are several types of noise:
  <ul><li><b>Thermal noise</b> is the random motion of electrons in a wire.</li>
  <li><b>Induced noise</b> comes from sources such as motors and appliances, which act as a sending antenna while the medium acts as a receiving antenna.</li>
  <li><b>Cross talk</b> has signals jumping from one wire to another, normally happening with adjacent wires.</li>
  <li><b>Impulse noise</b> is a spike that comes from power lines, lightning and the like.</li></ul></li>
</ul>
<p><b>Figure.</b> A line from “Point 1” to “Point 2” over the “Transmission medium”. Left, “Transmitted”: a clean wave. Middle, “Noise”: an irregular, jagged wave with one tall spike, and an arrow from it down onto the medium. Right, “Received”: the wave with extra ripples and a distorted, taller peak.</p>`,
            means: R`<p><b>Noise</b> is unwanted energy that gets into the signal on its way and ruins it at the receiver. Attenuation <i>removes</i> energy; noise <i>adds</i> energy that carries no data. The figure shows the idea as a sum: the received wave is the transmitted wave plus the noise wave, point by point. Once added, the receiver cannot tell which part was data.</p>
<p>The slide names four kinds. Each has a cue that identifies it:</p>
<table class="tbl">
<thead><tr><th>Type</th><th>Where it comes from</th><th>Cue</th></tr></thead>
<tbody>
<tr><td><b>Thermal</b></td><td>random motion of electrons in a wire</td><td>always present, like a constant hiss</td></tr>
<tr><td><b>Induced</b></td><td>motors and appliances act as a sending antenna; the medium is the receiving antenna</td><td>“antenna”</td></tr>
<tr><td><b>Crosstalk</b></td><td>a signal jumps from one wire to another, normally an adjacent one</td><td>“another wire”, like hearing someone else’s call on your line</td></tr>
<tr><td><b>Impulse</b></td><td>power lines, lightning and the like</td><td>a sudden short, strong spike</td></tr>
</tbody>
</table>
<p>The tall spike in the figure’s “Noise” picture looks like the impulse kind, and where it lands the “Received” picture gets its oversized peak. A bit read wrongly because of such a spike is how 1011110 can become “Heck” on slide 19. How strong the noise is <i>compared with the signal</i> is what decides whether the receiver can still read the bits; slide 25 turns that into a number.</p>`,
            why: R`<p>This is the third impairment and the one that matters most for the rest of the lecture. Slide 25 measures noise against the signal (SNR), slide 28 lists noise as one of the three limits on data rate, and slide 31’s Shannon formula contains the SNR directly. The summary on slide 38 lists “attenuation, distortion and noise”.</p>
<p><b>Exam angle.</b> MCQ or identification: a one-line description of a noise type, such as “signals jumping to an adjacent wire” (crosstalk) or “a spike from lightning” (impulse). Mistakes: mixing up induced (an appliance or motor acts as an antenna) and crosstalk (wire to wire), and treating thermal noise as something a better cable removes: it comes from electrons moving in any wire.</p>`,
            tip: R`<p>Memory hook TICI: <b>T</b>hermal (electrons), <b>I</b>nduced (antenna), <b>C</b>rosstalk (neighbour wire), <b>I</b>mpulse (spike).</p>`,
            beyond: R`<p>Textbook: an amplifier boosts whatever arrives, noise included, so amplifying a noisy signal does not improve its signal-to-noise ratio.</p>` }
        ],
        together: R`<p>Part 1 explains why the bits of slide 19 do not always arrive intact. A signal can be damaged in three different ways.</p>
<table class="tbl">
<thead><tr><th>Impairment</th><th>What happens to the signal</th><th>Cause</th><th>Picture</th><th>Measure</th></tr></thead>
<tbody>
<tr><td><b>Attenuation</b> (slide 20)</td><td>loses energy: same shape, smaller</td><td>resistance of the medium</td><td>big wave, small wave, an amplifier restores it</td><td>$\c{snr}{\text{dB}} = 10 \log_{10} \frac{\c{snr}{P_2}}{\c{snr}{P_1}}$, negative for a loss (slides 21–22)</td></tr>
<tr><td><b>Distortion</b> (slide 23)</td><td>changes shape: components out of step</td><td>each frequency has its own propagation speed</td><td>components in phase, then out of phase</td><td>none on the slides</td></tr>
<tr><td><b>Noise</b> (slide 24)</td><td>unwanted energy is added</td><td>thermal, induced, crosstalk, impulse</td><td>sent wave plus noise wave</td><td>SNR (slide 25)</td></tr>
</tbody>
</table>
<p>The chain to remember: <b>smaller → differently shaped → polluted</b>. An amplifier cures only the first. Only attenuation has a number so far, the decibel, whose rule “half the power is −3 dB” is the one calculation to do by hand. Noise is the impairment that cannot be simply cured, so it needs a number too: how strong is the signal compared with the noise? That ratio is the signal-to-noise ratio, and it is the subject of the next part.</p>` },

      /* ============================ PART 2 ============================ */
      { title: 'How bad is the noise? The signal-to-noise ratio', slides: [25, 26],
        items: [
          { n: 25, title: 'Signal to Noise Ratio (SNR)',
            says: R`<ul>
<li>SNR is the ratio of what is wanted (signal) to what is not wanted (noise).
  <ul><li>A high SNR means the signal is less corrupted by noise; a low SNR means the signal is more corrupted by noise.</li></ul></li>
<li>SNR is defined as the two formulas below (the slide prints the dB formula first, then “where” the plain SNR):</li>
</ul>
$$\c{snr}{SNR_{\text{dB}}} = 10 \log_{10} \c{snr}{SNR} \quad\quad \text{where} \quad\quad \c{snr}{SNR} = \frac{\c{snr}{\text{average signal power}}}{\c{snr}{\text{average noise power}}}$$
<p><b>Figure.</b> Two rows of three small graphs, each headed “Signal”, “Noise”, “Signal + noise”. Row <b>a. High SNR</b>: a tall square-wave signal, a small noise wiggle, and their sum, which is the square wave with slightly wobbly tops. Row <b>b. Low SNR</b>: a much smaller square-wave signal, a noise wiggle of the same size as before, and a sum in which the wobble is as large as the signal and the square shape is hard to see.</p>`,
            means: R`<p>Slide 24 listed the noise that can get in; <b>SNR</b> (signal-to-noise ratio) says how much it matters. It compares two <i>average powers</i> measured at the receiver: the power of the signal you want and the power of the noise you do not. Both are powers in the same unit, so the units cancel and SNR is a plain number with no unit:</p>
<ul>
<li>SNR = 1: signal and noise are equally strong, so the bits are buried.</li>
<li>SNR = 10: the signal has ten times the power of the noise.</li>
<li>SNR = 10,000: the signal is ten thousand times stronger than the noise (slide 26).</li>
</ul>
<p><b>Reading the figure.</b> In both rows the noise graph is the same size. In row <b>a</b> the signal is big, so adding the noise only roughens it: the levels are still clearly high or low, a high SNR. In row <b>b</b> the signal has shrunk but the noise has not, so the noise wobbles are as large as the signal itself and the receiver cannot be sure what it is looking at, a low SNR. Making the signal weaker (attenuation, slide 20) lowers the SNR just as stronger noise does.</p>
<p><b>The dB form.</b> Slide 21’s decibel formula is used again, now with the signal power on top and the noise power below: $\c{snr}{SNR_{\text{dB}}} = 10 \log_{10} \c{snr}{SNR}$. Going backwards, $\c{snr}{SNR} = 10^{\c{snr}{SNR_{\text{dB}}}/10}$. Values you can do by hand:</p>
<table class="tbl">
<thead><tr><th>$\c{snr}{SNR}$ (plain ratio)</th><th>1</th><th>2</th><th>10</th><th>100</th><th>1000</th><th>10,000</th></tr></thead>
<tbody><tr><td>$\c{snr}{SNR_{\text{dB}}}$</td><td>$\c{snr}{0}$</td><td>$\approx \c{snr}{3}$</td><td>$\c{snr}{10}$</td><td>$\c{snr}{20}$</td><td>$\c{snr}{30}$</td><td>$\c{snr}{40}$</td></tr></tbody>
</table>
<p>The two forms describe the same quality but are used differently: the dB form is the convenient way to quote an SNR, while formulas that need the SNR, such as Shannon’s on slide 31, need the <b>plain ratio</b>.</p>`,
            why: R`<p>SNR is how “the quality of the channel (the level of noise)”, the third factor on slide 28, enters a formula. Slides 20 to 24 described impairments in words and pictures; this slide gives the one that matters most a number, and slide 31 uses that number to put a ceiling on the data rate.</p>
<p><b>Exam angle.</b> Identification: “the ratio of what is wanted to what is not wanted” → SNR. Drawing or explaining: a high-SNR and a low-SNR picture, as on the slide. Solving: SNR and SNR<sub>dB</sub> from two powers (next slide) and back from dB to ratio. Mistakes: inverting the ratio (noise over signal), putting the dB value into Shannon’s formula, and mixing power units (mW against µW) before dividing.</p>`,
            tip: R`<p>Two numbers for one quality: SNR is the plain ratio, SNR<sub>dB</sub> is 10 log<sub>10</sub> of it. 0 dB is a ratio of 1, and every +10 dB multiplies the ratio by 10.</p>` },

          { n: 26, title: 'SNR Example',
            says: R`<p>The power of a signal is 10 mW and the power of the noise is 1 µW; what are the values of SNR and SNR<sub>dB</sub>? The slide works it as:</p>
$$\c{snr}{SNR} = \frac{\c{snr}{10,000}\,\text{µW}}{\c{snr}{1}\,\text{µW}} = \c{snr}{10,000} \quad\quad \c{snr}{SNR_{\text{dB}}} = 10 \log_{10} 10,000 = 10 \log_{10} 10^{4} = \c{snr}{40}$$`,
            means: R`<p>Work it in four steps, all by hand:</p>
<ol>
<li><b>Put both powers in the same unit.</b> 1 mW = 1000 µW, so the signal is $10 \times 1000 = \c{snr}{10,000}\,\text{µW}$. This is the slide’s first move.</li>
<li><b>Divide the average powers.</b> $\c{snr}{SNR} = \frac{\c{snr}{10,000}\,\text{µW}}{\c{snr}{1}\,\text{µW}} = \c{snr}{10,000}$. The µW cancel, so SNR has no unit. The signal is ten thousand times stronger than the noise.</li>
<li><b>Write the ratio as a power of ten.</b> $10,000 = 10^{4}$, so $\log_{10} 10,000 = 4$.</li>
<li><b>Multiply by 10.</b> $\c{snr}{SNR_{\text{dB}}} = 10 \times 4 = \c{snr}{40}$ dB.</li>
</ol>
<p>Both answers describe the same channel: <b>SNR = 10,000 and SNR<sub>dB</sub> = 40 dB</b>. That is a high SNR in the sense of slide 25, so the signal is only slightly corrupted. If the question gave the dB figure instead, you would go back with $\c{snr}{SNR} = 10^{40/10} = 10^{4}$.</p>`,
            why: R`<p>This is the lecture’s one SNR calculation, and it uses only slide 21’s tools: a ratio, a power of ten and the factor 10. In an exam it is the natural way to ask for both forms, and the plain ratio you find here is what you would feed into Shannon’s formula on slide 31 (never the 40).</p>
<p><b>Exam angle.</b> Solving with clean powers of ten. The classic slip is the unit step: using 10 for the signal against 1 for the noise, which is a thousand times too small (SNR 10 instead of 10,000, 10 dB instead of 40 dB). Always convert to a common unit first. Do not forget “dB” after the 40.</p>`,
            tip: R`<p>Convert units before dividing: 10 mW = 10,000 µW. The ratio is 10,000 = 10<sup>4</sup>, so the dB value is 10 × 4 = 40.</p>`,
            error: { says: R`The powers are written “μw” (lower-case w) and the final answer is just “40”.`, correct: R`The unit is <b>µW</b> (microwatt, capital W for watt) and the answer is <b>40 dB</b>: SNR<sub>dB</sub> is a decibel value.` },
            example: { title: 'SNR and SNR in dB (slide 26)', gen: 'l02.db', params: { find: 'snr', Ps: 0.01, Pn: 0.000001 },
              slideAnswer: 'SNR = 10,000 µW / 1 µW = 10,000; SNR<sub>dB</sub> = 10 log₁₀ 10⁴ = 40 dB', slideValue: 40, input: 'SNRdB' } }
        ],
        together: R`<p>Part 2 gives noise a number.</p>
<table class="tbl">
<thead><tr><th>Quantity</th><th>Formula</th><th>Slide’s example</th><th>What it tells you</th></tr></thead>
<tbody>
<tr><td>SNR (plain ratio)</td><td>$\c{snr}{SNR} = \frac{\c{snr}{P_{\text{signal}}}}{\c{snr}{P_{\text{noise}}}}$</td><td>$\frac{10,000\,\text{µW}}{1\,\text{µW}} = \c{snr}{10,000}$</td><td>how many times stronger the signal is than the noise; used in Shannon (slide 31)</td></tr>
<tr><td>SNR in dB</td><td>$\c{snr}{SNR_{\text{dB}}} = 10 \log_{10} \c{snr}{SNR}$</td><td>$10 \log_{10} 10^{4} = \c{snr}{40}$ dB</td><td>the same fact on the decibel scale, the usual way to quote it</td></tr>
<tr><td>High / low</td><td>picture of slide 25</td><td>big signal over small noise / the reverse</td><td>less / more corrupted</td></tr>
</tbody>
</table>
<p>The chain: <b>noise pollutes the signal → what counts is signal power against noise power → SNR, in plain form or in dB</b>. With attenuation (slide 21), distortion and noise now understood, the lecture can answer the question it has been building towards: <i>how fast can data go through a real channel?</i> The next part gives two theoretical formulas: Nyquist, which ignores noise, and Shannon, which has the SNR you just learned to compute inside it.</p>` },

      /* ============================ PART 3 ============================ */
      { title: 'Data-rate limits: Nyquist and Shannon', slides: [27, 33],
        items: [
          { n: 27, kind: 'admin', title: 'Section divider: Data Rate',
            says: R`Section divider “Data Rate”, with the line “1000 kbps = 1 Mbps” under the title.` },

          { n: 28, title: 'Data Rate Limits',
            says: R`<ul>
<li>An important consideration in data communications is how fast we can send data over a channel (bits per second).</li>
<li>Data rate depends on three factors:
  <ul><li>the bandwidth available</li>
  <li>the level of the signals we use</li>
  <li>the quality of the channel (the level of noise)</li></ul></li>
<li>Two theoretical formulas were developed to calculate the data rate:
  <ul><li>Nyquist theorem</li>
  <li>Shannon theorem</li></ul></li>
</ul>`,
            means: R`<p>The <b>data rate</b> is how many bits per second a channel can carry; it is the bit rate of slide 14, measured in bps. The slide says it is limited by three things, and each has already appeared in this lecture:</p>
<table class="tbl">
<thead><tr><th>Factor</th><th>Plain meaning</th><th>Seen on</th></tr></thead>
<tbody>
<tr><td><b>Bandwidth available</b> $\c{bw}{B}$</td><td>how wide the band of frequencies is, in Hz; the wider it is, the more can be sent</td><td>slides 13, 17</td></tr>
<tr><td><b>Level of the signals</b> $\c{level}{L}$</td><td>how many distinct levels each signal element can take; each carries $\log_2 \c{level}{L}$ bits</td><td>slide 14</td></tr>
<tr><td><b>Quality of the channel</b> $\c{snr}{SNR}$</td><td>how much noise there is compared with the signal</td><td>slides 24, 25</td></tr>
</tbody>
</table>
<p>Picture a pipe: the bandwidth is its width, the levels are how many bits you pack into each pulse you push through, and the noise is how hard it is for the receiver to tell the packed values apart.</p>
<p>The two formulas each use <i>some</i> of the three factors, which is the key to choosing between them:</p>
<table class="tbl">
<thead><tr><th></th><th>Bandwidth</th><th>Levels</th><th>Noise</th></tr></thead>
<tbody>
<tr><td><b>Nyquist</b> (slide 29)</td><td>yes</td><td>yes</td><td>none assumed: noiseless channel</td></tr>
<tr><td><b>Shannon</b> (slide 31)</td><td>yes</td><td>not in the formula</td><td>yes, through the SNR</td></tr>
</tbody>
</table>
<p>Both are <b>theoretical</b>: they give the most a channel could carry, not what a real network delivers (slide 34 returns to that). The divider on slide 27 fixed the prefixes: 1000 bps = 1 kbps and 1000 kbps = 1 Mbps, so 1 Mbps is $10^{6}$ bps and 1 Gbps (slide 36) is $10^{9}$ bps. The same decimal prefixes apply to hertz: 1 MHz is $10^{6}$ Hz.</p>`,
            why: R`<p>Slide 28 is the agenda for slides 29 to 33: Nyquist, an example, Shannon, an example, and then both together. It also states the question the whole lecture has been building to. Slides 6 to 18 described signals and the bandwidth they need, slides 20 to 26 what the channel does to them, and now the two are combined into a limit on speed.</p>
<p><b>Exam angle.</b> MCQ or identification: the three factors the data rate depends on, and which theorem belongs to which situation (noiseless → Nyquist, noisy → Shannon, slide 38). Essay: compare the two formulas using the table above. A common mistake is to treat them as two methods for the same problem; they answer different questions, and the presence of noise decides which one to use.</p>` },

          { n: 29, title: 'Nyquist Bit Rate',
            says: R`<ul>
<li>Nyquist theorem states that the bit rate of a noiseless channel can be computed as:</li>
</ul>
$$\c{rate}{\text{BitRate}} = 2 \times \c{bw}{\text{bandwidth}} \times \log_2 \c{level}{L}$$
<p>Where: bandwidth = bandwidth of the channel; L = levels of the signal.</p>
<ul>
<li>This formula does not assume any noise in the channel.</li>
<li>Increasing the number of levels can increase the bit rate, but the receiver should be able to distinguish the levels.</li>
</ul>`,
            means: R`<p>Nyquist’s formula answers: <i>what is the fastest a channel can carry bits if there is no noise at all?</i> With the course’s short names, $\c{rate}{N}$ for BitRate and $\c{bw}{B}$ for bandwidth:</p>
$$\c{rate}{N} = 2 \times \c{bw}{B} \times \log_2 \c{level}{L}$$
<ul>
<li>$\c{bw}{B}$ is the channel’s bandwidth in <b>hertz</b> (green, as on slide 13). Convert prefixes first: 3 kHz is 3000 Hz.</li>
<li>$\log_2 \c{level}{L}$ is the number of bits each signal level carries (slide 14): 2 levels give 1 bit, 4 give 2, 8 give 3, 16 give 4.</li>
<li>The <b>2</b> comes from slide 17: with two levels (one bit per element) the fastest pattern 0 1 0 1 needs a frequency of $\frac{\c{rate}{N}}{2}$, so $\c{bw}{B} = \frac{\c{rate}{N}}{2}$, which is $\c{rate}{N} = 2 \c{bw}{B}$. Nyquist multiplies that by the bits per level.</li>
<li>The result $\c{rate}{N}$ is in bits per second (blue).</li>
</ul>
<p>What the formula says about speed, for $\c{bw}{B} = \c{bw}{3000}$ Hz:</p>
<table class="tbl">
<thead><tr><th>Levels $\c{level}{L}$</th><th>$\log_2 \c{level}{L}$</th><th>$\c{rate}{N} = 2 \times \c{bw}{3000} \times \log_2 \c{level}{L}$</th></tr></thead>
<tbody>
<tr><td>$\c{level}{2}$</td><td>$\c{level}{1}$</td><td>$\c{rate}{6,000}$ bps</td></tr>
<tr><td>$\c{level}{4}$</td><td>$\c{level}{2}$</td><td>$\c{rate}{12,000}$ bps</td></tr>
<tr><td>$\c{level}{8}$</td><td>$\c{level}{3}$</td><td>$\c{rate}{18,000}$ bps</td></tr>
<tr><td>$\c{level}{16}$</td><td>$\c{level}{4}$</td><td>$\c{rate}{24,000}$ bps</td></tr>
</tbody>
</table>
<p>There are two ways to go faster. <b>Widen the bandwidth</b>: the rate grows in direct proportion, so twice the $\c{bw}{B}$ gives twice the $\c{rate}{N}$. <b>Add levels</b>: the rate grows slowly, because doubling $\c{level}{L}$ adds only one bit per level (the table: 2 → 4 → 8 → 16 adds 6,000 bps each step). The slide’s last bullet is the catch: more levels only help if the receiver can still tell neighbouring levels apart, and noise can push one level onto the next. Without noise the formula would allow endless levels; real channels have noise, which is why slide 31 needs a second formula.</p>
<p>Rearranged for the unknown you are asked for: $\log_2 \c{level}{L} = \frac{\c{rate}{N}}{2\,\c{bw}{B}}$, so $\c{level}{L} = 2^{\c{rate}{N}/(2\,\c{bw}{B})}$, and $\c{bw}{B} = \frac{\c{rate}{N}}{2 \log_2 \c{level}{L}}$. For instance 12 kbps over 3 kHz gives $\frac{12,000}{2 \times 3000} = 2$, so $\c{level}{L} = 2^{2} = 4$.</p>`,
            why: R`<p>Nyquist is the slide-38 bullet for noiseless channels, and it supplies the “levels” and “bandwidth” factors of slide 28. It reuses two earlier ideas: $\log_2 \c{level}{L}$ bits per level (slide 14) and $\c{bw}{B} = \frac{\c{rate}{N}}{2}$ (slide 17). Lecture 3 will take up the same product, signal elements per second times bits per element.</p>
<p><b>Exam angle.</b> Solving: $\c{rate}{N}$ from $\c{bw}{B}$ and $\c{level}{L}$, $\c{level}{L}$ from $\c{rate}{N}$ and $\c{bw}{B}$ (slide 33), or $\c{bw}{B}$ from $\c{rate}{N}$ and $\c{level}{L}$. Essay: why more levels cannot raise the rate without limit (the receiver must distinguish them). Mistakes: forgetting the factor 2, using $\c{level}{L}$ instead of $\log_2 \c{level}{L}$, leaving the bandwidth in kHz, and using Nyquist on a noisy channel.</p>`,
            tip: R`<p>Nyquist = <b>N</b>oiseless, with a <b>2</b> in front: N = 2 · B · log<sub>2</sub> L. Shannon, two slides on, is the noisy one.</p>`,
            beyond: R`<p>Textbook: Nyquist proved that a channel of bandwidth B can carry at most 2B independent signal elements per second; each element carries log<sub>2</sub> L bits, which gives the formula.</p>` },

          { n: 30, title: 'Nyquist Example',
            says: R`<p>Consider a noiseless channel with a bandwidth of 3000 Hz transmitting a signal with two signal levels; what is the theoretical data rate?</p>
$$\c{rate}{\text{BitRate}} = 2 \times \c{bw}{3000} \times \log_2 \c{level}{2} = \c{rate}{6000}\text{ bps}$$`,
            means: R`<p>Four steps, all by hand:</p>
<ol>
<li><b>Choose the formula.</b> The channel is noiseless, so Nyquist: $\c{rate}{N} = 2 \times \c{bw}{B} \times \log_2 \c{level}{L}$.</li>
<li><b>Read off the values.</b> $\c{bw}{B} = \c{bw}{3000}$ Hz (already in hertz) and $\c{level}{L} = \c{level}{2}$ levels.</li>
<li><b>Evaluate the logarithm.</b> $\log_2 \c{level}{2} = \c{level}{1}$ bit per level, because $2^{1} = 2$.</li>
<li><b>Multiply.</b> $\c{rate}{N} = 2 \times \c{bw}{3000} \times \c{level}{1} = \c{rate}{6000}$ bps.</li>
</ol>
<p>Two checks. With two levels the formula collapses to $\c{rate}{N} = 2 \c{bw}{B}$, so a 3000 Hz channel carries 6000 bps; slide 17’s $\c{bw}{B} = \frac{\c{rate}{N}}{2}$ gives back $\frac{6000}{2} = 3000$ Hz. And if the same channel used four levels, $\log_2 \c{level}{4} = \c{level}{2}$ and the rate would double to $\c{rate}{12,000}$ bps (the second row of the table on the slide-29 card).</p>`,
            why: R`<p>This is the cleanest number to remember for Nyquist: <b>3000 Hz, two levels → 6000 bps</b>. It is the first of the lecture’s solving templates: identify the channel type, pick the formula, convert units, evaluate the logarithm, multiply.</p>
<p><b>Exam angle.</b> Expect the same shape with other clean numbers (for example 4000 Hz with 4 levels, or a rate and bandwidth given and the levels asked for). Mistakes: dropping the 2, writing $\log_2 2 = 2$ (it is 1), and answering in Hz instead of bps.</p>`,
            example: { title: 'Nyquist: noiseless 3000 Hz channel, 2 levels (slide 30)', gen: 'l02.nyquist', params: { find: 'N', B: 3000, L: 2 },
              slideAnswer: '2 × 3000 × log₂2 = 6000 bps', slideValue: 6000, input: 'N' } },

          { n: 31, title: 'Shannon Capacity',
            says: R`<ul>
<li>Shannon theorem states the capacity of a channel can be computed as:</li>
</ul>
$$\c{rate}{\text{Capacity}} = \c{bw}{\text{bandwidth}} \times \log_2 (1 + \c{snr}{SNR})$$
<p>Where: Capacity = capacity of the channel in bits per second; bandwidth = bandwidth of the channel; SNR = signal-to-noise ratio of the channel.</p>
<ul>
<li>Note that there is no indication of the signal level; this means that the levels of the signal do not dictate the capacity of the channel.</li>
</ul>`,
            means: R`<p>Shannon’s formula answers: <i>what is the most a <b>noisy</b> channel can carry, however cleverly the signal is designed?</i> In short form:</p>
$$\c{rate}{C} = \c{bw}{B} \times \log_2 (1 + \c{snr}{SNR})$$
<ul>
<li>$\c{bw}{B}$: the bandwidth in hertz, as in Nyquist.</li>
<li>$\c{snr}{SNR}$: the <b>plain ratio</b> of slide 25, never the dB value.</li>
<li>$\c{rate}{C}$: the <b>capacity</b>, a bit rate in bps that the channel cannot exceed.</li>
</ul>
<p>The logarithm turns the SNR into the number of bits per second that each hertz can carry. It is easy by hand when $1 + \c{snr}{SNR}$ is a power of 2, which exam numbers usually arrange:</p>
<table class="tbl">
<thead><tr><th>$\c{snr}{SNR}$</th><th>$1 + \c{snr}{SNR}$</th><th>$\log_2 (1 + \c{snr}{SNR})$</th><th>$\c{rate}{C}$ for $\c{bw}{B} = \c{bw}{1}$ MHz</th></tr></thead>
<tbody>
<tr><td>$\c{snr}{1}$ (0 dB)</td><td>2</td><td>1</td><td>$\c{rate}{1}$ Mbps</td></tr>
<tr><td>$\c{snr}{3}$</td><td>4</td><td>2</td><td>$\c{rate}{2}$ Mbps</td></tr>
<tr><td>$\c{snr}{15}$</td><td>16</td><td>4</td><td>$\c{rate}{4}$ Mbps</td></tr>
<tr><td>$\c{snr}{63}$</td><td>64</td><td>6</td><td>$\c{rate}{6}$ Mbps</td></tr>
<tr><td>$\c{snr}{255}$</td><td>256</td><td>8</td><td>$\c{rate}{8}$ Mbps</td></tr>
</tbody>
</table>
<p>Look at the growth: doubling the bandwidth doubles $\c{rate}{C}$, but each extra bit per hertz needs $1 + \c{snr}{SNR}$ to <i>double</i> (the column above runs 4 → 16 → 64 → 256: four times as much for every two more bits). A cleaner channel pays back slowly.</p>
<p><b>Why there is no $\c{level}{L}$ in it.</b> The slide’s note says the number of signal levels does not dictate the capacity. Capacity is a property of the <i>channel</i>, its bandwidth and its noise, not of the signaling scheme you choose. However many levels you use, noise limits how many can be told apart, and Shannon’s formula already contains that limit. Contrast Nyquist, whose formula has $\c{level}{L}$ and only warns in words that the receiver must distinguish the levels.</p>
<p>If an SNR is given in decibels, convert it first with slide 25’s formula backwards: 30 dB is $10^{30/10} = 1000$, not 30. Then $\log_2 1001$ is about 10, because $2^{10} = 1024$ is close to 1000.</p>`,
            why: R`<p>Slide 28 listed noise as the third limit on the data rate; this slide is where it enters a formula, and slide 38 assigns it its role: for a noisy channel we need to use the Shannon capacity to find the maximum bit rate. It builds directly on slide 25 (SNR) and slide 13 (bandwidth).</p>
<p><b>Exam angle.</b> Identification or MCQ: “the formula that has no signal level in it” → Shannon; “maximum bit rate of a noisy channel” → Shannon capacity. Solving: $\c{rate}{C}$ from $\c{bw}{B}$ and $\c{snr}{SNR}$ (next slide). Mistakes: using the dB value, forgetting the “1 +”, leaving $\c{bw}{B}$ in kHz, and believing that more signal levels raise the capacity.</p>`,
            tip: R`<p>Shannon needs the <b>plain</b> SNR. If the question gives dB, convert first: 10 dB = 10, 20 dB = 100, 30 dB = 1000. The formula has no L; Nyquist’s does.</p>` },

          { n: 32, title: 'Shannon Example',
            says: R`<p>“We can calculate the theoretical highest bit rate of a regular telephone line. A telephone line normally has a bandwidth of 3000 Hz (300 to 3300 Hz) assigned for data communications. The signal-to-noise ratio is usually 3162. For this channel the capacity is calculated as”</p>
$$\c{rate}{C} = \c{bw}{B} \log_2 (1 + \c{snr}{SNR}) = \c{bw}{3000} \log_2 (1 + \c{snr}{3162}) = \c{bw}{3000} \times 11.62 = \c{rate}{34,860}\text{ bps}$$`,
            means: R`<p>Follow it line by line:</p>
<ol>
<li><b>Bandwidth.</b> The line is assigned 300 to 3300 Hz, and a bandwidth is a difference (slide 13): $3300 - 300 = \c{bw}{3000}$ Hz.</li>
<li><b>Formula.</b> A real telephone line is noisy, so use Shannon. The SNR of 3162 is already a plain ratio.</li>
<li><b>Add 1.</b> $1 + \c{snr}{3162} = 3163$.</li>
<li><b>The logarithm, without a calculator.</b> $2^{11} = 2048$ and $2^{12} = 4096$, so $\log_2 3163$ lies between 11 and 12. Since 3163 is about 1.5 times 2048, it is about $11 + 0.6 = 11.6$. The slide quotes 11.62.</li>
<li><b>Multiply.</b> $\c{rate}{C} = \c{bw}{3000} \times 11.62 = \c{rate}{34,860}$ bps, about 35 kbps.</li>
</ol>
<p>The meaning: whatever signaling scheme and however many levels are used, this line can carry at most about 35 kbps. The slide says “theoretical highest bit rate”, so it is a ceiling.</p>
<p>Notice the rounding: the exact value is $\log_2 3163 = 11.627$, which gives $\c{rate}{34,881}$ bps. The slide cut the logarithm to 11.62 and got 34,860. Both round to about 35 kbps, and the slide’s figure is the one to quote if the question follows the slide.</p>`,
            why: R`<p>This is the worked example for slide 31, and the number most likely to appear in an answer key for it. Seeing the logarithm evaluated between $2^{11}$ and $2^{12}$ also shows how an exam can ask for Shannon without a calculator: either the SNR will be one less than a power of 2, or an approximation (“about 35 kbps”) will be accepted.</p>
<p><b>Exam angle.</b> Solving. Mistakes: using 3300 Hz as the bandwidth, adding 1 to the wrong thing (forgetting it inside the logarithm), reading the 3162 as dB, and being thrown by 34,860 versus 34,881: both are the same answer within rounding.</p>`,
            tip: R`<p>If your answer is 34,881 and the slide says 34,860, you are right and the slide rounded. State the slide’s value as well.</p>`,
            error: { says: R`$\c{bw}{3000} \log_2 (1 + 3162) = 3000 \times 11.62 = 34,860$ bps.`, correct: R`$\log_2 3163 = 11.627$, so $\c{bw}{3000} \times 11.627 = \c{rate}{34,881}$ bps. The slide rounds the logarithm down to 11.62, which makes the product 21 bps too small. Both are about 35 kbps.` },
            beyond: R`<p>Derived from slide 25’s formula: $3162 \approx 10^{3.5}$, so $\c{snr}{SNR_{\text{dB}}} = 10 \times 3.5 = \c{snr}{35}$ dB. The slide quotes only the plain ratio.</p>`,
            example: { title: 'Shannon: telephone line, B = 3000 Hz, SNR = 3162 (slide 32)', gen: 'l02.shannon', params: { find: 'C', B: 3000, snr: 3162 },
              slideAnswer: '3000 × 11.62 = 34,860 bps on the slide (it rounds log₂3163 to 11.62); exact 34,881 bps', slideValue: 34881.23, input: 'C' } },

          { n: 33, title: 'Using Nyquist and Shannon',
            says: R`<p>We have a channel with a 1-MHz bandwidth. The SNR for this channel is 63. What are the appropriate bit rate and signal level?</p>
$$\c{rate}{C} = \c{bw}{B} \log_2 (1 + \c{snr}{SNR}) = \c{bw}{10^{6}} \log_2 (1 + \c{snr}{63}) = \c{bw}{10^{6}} \log_2 64 = \c{rate}{6}\text{ Mbps}$$
<p>“6 Mbps is the upper limit, let’s use 4 Mbps for better performance”:</p>
$$\c{rate}{4}\text{ Mbps} = 2 \times \c{bw}{1}\text{ MHz} \times \log_2 \c{level}{L} \quad\Rightarrow\quad \c{level}{L} = \c{level}{4}$$`,
            means: R`<p>The two theorems cooperate. Shannon says <i>how fast at most</i>; Nyquist then says <i>how many levels</i> that speed needs.</p>
<ol>
<li><b>Which formula first?</b> The question gives an SNR, so the channel is noisy: Shannon sets the ceiling. $1 + \c{snr}{63} = 64 = 2^{6}$, so $\log_2 64 = 6$ and $\c{rate}{C} = \c{bw}{10^{6}} \times 6 = \c{rate}{6}$ Mbps. This is the <b>upper limit</b>.</li>
<li><b>Choose a rate below it.</b> The slide picks 4 Mbps “for better performance”: a theoretical limit is not something to run at, and slide 34 will say real rates are always lower.</li>
<li><b>Nyquist for the levels.</b> $\c{rate}{4}$ Mbps $= 2 \times \c{bw}{1}$ MHz $\times \log_2 \c{level}{L}$. In plain units, $4 \times 10^{6} = 2 \times 10^{6} \times \log_2 \c{level}{L}$, so $\log_2 \c{level}{L} = 2$ and $\c{level}{L} = 2^{2} = \c{level}{4}$ levels.</li>
<li><b>Check.</b> $2 \times \c{bw}{10^{6}} \times \log_2 \c{level}{4} = \c{rate}{4}$ Mbps, as wanted.</li>
</ol>
<p>Why 4 and not 8? Sending at the ceiling, 6 Mbps, would need $\log_2 \c{level}{L} = 3$, so 8 levels, with the channel exactly at its limit. Four levels are easier for the receiver to tell apart (slide 29’s last bullet), so the link is safer and still fast. The final answer to “appropriate bit rate and signal level” is <b>4 Mbps with 4 levels</b>, under an upper limit of 6 Mbps.</p>`,
            why: R`<p>Slides 29 and 31 were two separate tools; here they are chained, which is the best summary of how the lecture’s second half works: noise sets the ceiling (Shannon), then the signaling is designed under it (Nyquist). It uses the unit habits of slide 28 (MHz to Hz, Mbps to bps).</p>
<p><b>Exam angle.</b> This is the kind of multi-step item that suits a solving question: an SNR and a bandwidth given, the capacity and then a number of levels asked for. Always state the order: Shannon first, then Nyquist. Mistakes: using Nyquist first (no ceiling), choosing a rate above the capacity, answering 2 (the bits per level) instead of 4 levels, and forgetting the “1 +” so that $\log_2 63$ is not a whole number.</p>`,
            tip: R`<p>Order matters: <b>Shannon</b> (ceiling) → pick a lower rate → <b>Nyquist</b> solved for $\c{level}{L}$. The levels come out as a power of 2.</p>`,
            example: { title: 'Nyquist and Shannon together (slide 33)', gen: 'l02.capacity', params: { B: 1e6, snr: 63, N: 4e6 },
              slideAnswer: 'C = 10⁶ log₂64 = 6 Mbps (upper limit); use 4 Mbps → 4 Mbps = 2 × 1 MHz × log₂L → L = 4', slideValue: 4, input: 'L' } }
        ],
        together: R`<p>Part 3 turns the lecture’s signals into a speed limit. Two formulas, chosen by one question: <b>is there noise?</b></p>
<table class="tbl">
<thead><tr><th></th><th>Nyquist (slides 29–30)</th><th>Shannon (slides 31–32)</th></tr></thead>
<tbody>
<tr><td>Channel</td><td>noiseless</td><td>noisy</td></tr>
<tr><td>Formula</td><td>$\c{rate}{N} = 2 \c{bw}{B} \log_2 \c{level}{L}$</td><td>$\c{rate}{C} = \c{bw}{B} \log_2 (1 + \c{snr}{SNR})$</td></tr>
<tr><td>Inputs</td><td>bandwidth and levels</td><td>bandwidth and SNR (plain ratio)</td></tr>
<tr><td>Gives</td><td>the bit rate for L levels</td><td>the capacity, an upper limit</td></tr>
<tr><td>Slide example</td><td>$\c{bw}{3000}$ Hz, $\c{level}{2}$ levels → $\c{rate}{6000}$ bps</td><td>$\c{bw}{3000}$ Hz, $\c{snr}{3162}$ → about $\c{rate}{34,860}$ bps</td></tr>
</tbody>
</table>
<p>Together (slide 33): $\c{bw}{1}$ MHz and $\c{snr}{63}$ give $\c{rate}{C} = 6$ Mbps as the ceiling; send 4 Mbps instead, and Nyquist says $\c{level}{L} = 4$.</p>
<p>The chain: <b>bandwidth, levels and noise limit the data rate → Nyquist ignores noise, Shannon ignores levels → use Shannon for the ceiling, then Nyquist to design the levels</b>. All of this is theory: the highest rate a channel could carry. What a real network delivers, and how long a message actually takes to arrive, is the question of the next part.</p>` },

      /* ============================ PART 4 ============================ */
      { title: 'Performance: bandwidth, throughput, latency and jitter', slides: [34, 37],
        items: [
          { n: 34, title: 'Performance Relationships',
            says: R`<ul>
<li><b>Bandwidth</b> can be in hertz or in bits per second; the higher the bandwidth in hertz, the higher the bit rate.</li>
<li><b>Throughput</b> is a measure of how fast we can actually send data through a network.
  <ul><li>A link may have a bandwidth of <i>B</i> bps, but we can only send <i>T</i> bps through this link, with <i>T</i> always less than <i>B</i>.</li></ul></li>
<li><b>Latency</b> or delay defines how long it takes for an entire message to completely arrive at the destination from the time the first bit is sent out from the source.</li>
<li><b>Jitter</b> is the difference in delay or latency per packet.</li>
</ul>`,
            means: R`<p>Slides 28 to 33 asked how fast a channel <i>could</i> go. This slide gives the words for how a network <i>does</i> perform, and the first one is a trap because it has two meanings.</p>
<table class="tbl">
<thead><tr><th>Measure</th><th>Unit</th><th>What it describes</th><th>Example</th></tr></thead>
<tbody>
<tr><td><b>Bandwidth in hertz</b> $\c{bw}{B}$</td><td>Hz</td><td>the range of frequencies a channel or signal covers (slides 13, 29, 31)</td><td>a telephone line of 3000 Hz (slide 32)</td></tr>
<tr><td><b>Bandwidth in bps</b></td><td>bps</td><td>the bit rate a link is rated for, “a link of $B$ bps”</td><td>a 1 Gbps network (slide 36)</td></tr>
<tr><td><b>Throughput</b></td><td>bps</td><td>the rate actually achieved; always less than the bandwidth in bps</td><td>a 1 Gbps link that really delivers, say, 600 Mbps</td></tr>
<tr><td><b>Latency</b> (delay)</td><td>seconds</td><td>time for the <i>entire</i> message to arrive, counted from the moment its first bit leaves the source</td><td>about 50 ms for the e-mail of slide 37 (50 ms of propagation plus 0.020 ms of transmission)</td></tr>
<tr><td><b>Jitter</b></td><td>seconds</td><td>the <i>difference</i> in latency from one packet to the next</td><td>packets arriving after 50, 50 and 70 ms differ by up to 20 ms</td></tr>
</tbody>
</table>
<p>The link between the two bandwidths is the one the slide states: the higher the bandwidth in hertz, the higher the bit rate. That is slides 29 and 31 in words, since both formulas have $\c{bw}{B}$ as a factor, so doubling the hertz doubles the bps. By colour, the hertz meaning is green and the bps meaning is blue.</p>
<p><b>Throughput</b> is the measured, real rate, and the slide insists that $T$ is always less than $B$. The slide does not say why; in practice real links are shared, and packets wait, get lost and are resent${ref('Forouzan')}. Bandwidth is the rating on the box; throughput is what you get. Careful: the slide’s $T$ is throughput here and has nothing to do with the period $T$ of slide 6.</p>
<p><b>Latency</b> measures time, not rate: from the first bit leaving the sender until the whole message has arrived. Slide 35 splits it into four parts. <b>Jitter</b> is not the delay itself but how much the delay varies between packets. A link can have a large latency and no jitter (every packet takes exactly 200 ms), or a small latency with plenty of jitter.</p>`,
            why: R`<p>These are the lecture’s performance definitions, and they feed the formulas on slide 35. The sentence “bandwidth can be in hertz or in bits per second” explains a change of meaning you will meet: in Nyquist and Shannon (slides 29 to 33) $\c{bw}{B}$ is in hertz, while in the transmission-time formula (slide 35) “bandwidth” is the bit rate of the link in bps.</p>
<p><b>Exam angle.</b> MCQ or identification: a one-line description of throughput, latency or jitter (“T always less than B”, “time for an entire message to arrive”, “the difference in delay per packet”). Essay: distinguish the four. Mistakes: treating bandwidth and throughput as the same, claiming that throughput can exceed the link’s bandwidth, calling propagation time “latency” (it is only one of its four parts), and confusing jitter (variation) with latency (the delay itself).</p>`,
            tip: R`<p>Bandwidth and throughput are rates (bps): the rating and the reality, with throughput below bandwidth. Latency and jitter are times: the delay, and the <i>variation</i> of the delay between packets.</p>`,
            beyond: R`<p>Textbook: jitter matters most for real-time audio and video, which need their packets to arrive evenly spaced.</p>` },

          { n: 35, title: 'Latency, Propagation Time and Transmission Time',
            says: R`<p>Three formulas, as printed:</p>
<p>Latency</p>
$$\c{time}{\text{Latency}} = \c{time}{\text{propagation time}} + \c{time}{\text{transmission time}} + \c{time}{\text{queuing time}} + \c{time}{\text{processing delay}}$$
<p>Propagation time</p>
$$\c{time}{\text{Propagation time}} = \frac{\text{Distance}}{\text{Propagation Speed}}$$
<p>Transmission time</p>
$$\c{time}{\text{Transmission time}} = \frac{\text{Message size}}{\c{rate}{\text{Bandwidth}}}$$`,
            means: R`<p>A message is delayed in four ways between the sender and the receiver, and latency is simply their sum. The slide gives formulas only for the first two.</p>
<table class="tbl">
<thead><tr><th>Component</th><th>What it is</th><th>Depends on</th></tr></thead>
<tbody>
<tr><td><b>Propagation time</b> $\c{time}{T_p} = \frac{\text{distance}}{\text{speed}}$</td><td>how long a signal needs to travel the distance through the medium</td><td>the distance and the propagation speed (slide 9: 3 × 10<sup>8</sup> m/s in free space; slide 36 uses 2.4 × 10<sup>8</sup>), <b>not</b> the message size</td></tr>
<tr><td><b>Transmission time</b> $\c{time}{T_t} = \frac{\text{message size}}{\c{rate}{\text{bandwidth}}}$</td><td>how long it takes to push every bit of the message onto the link</td><td>the message size and the bandwidth, <b>not</b> the distance</td></tr>
<tr><td><b>Queuing time</b></td><td>time the message waits in line at a device (a router, say) before it can be sent on${ref('Forouzan')}</td><td>how busy the device is</td></tr>
<tr><td><b>Processing delay</b></td><td>time a device needs to examine the message and decide what to do with it${ref('Forouzan')}</td><td>the device</td></tr>
</tbody>
</table>
<p>Think of moving a pile of boxes by truck. <b>Transmission time</b> is the time to load the whole pile: more boxes or a slower loading rate take longer. <b>Propagation time</b> is the drive: a longer road or a slower truck take longer. <b>Queuing</b> is waiting in line at the depot and <b>processing</b> is the paperwork there. Loading faster does not shorten the drive, and a shorter road does not shorten the loading.</p>
<p>In the transmission-time formula the <b>bandwidth is the link’s bit rate in bps</b> (blue), the second meaning from slide 34, not hertz. So the message size must be in <b>bits</b> and the distance in <b>metres</b>: bytes × 8 and km × 1000. When a question gives only the distance, the speed, the message size and the bandwidth, there is no queuing or processing delay to add, and latency is $\c{time}{T_p} + \c{time}{T_t}$.</p>`,
            why: R`<p>Slide 34 defined latency in words; slide 35 turns it into arithmetic, and slide 37 applies it. Every quantity here is a time in seconds, so in this walkthrough they are all amber, and the bandwidth, a rate in bps, is blue.</p>
<p><b>Exam angle.</b> MCQ: which delay depends on the distance (propagation), which on the message size (transmission), and the list of four parts. Solving: compute each time and add them. Mistakes: using hertz for the bandwidth, leaving the message in bytes, leaving the distance in km, swapping the two formulas, and forgetting that latency is a sum, not just the propagation time.</p>`,
            tip: R`<p>Propagation = distance ÷ speed (the road). Transmission = size ÷ bandwidth (the loading). Latency = propagation + transmission + queuing + processing; a missing term counts as 0.</p>` },

          { n: [36, 37], title: 'Example: propagation and transmission time of an e-mail',
            says: R`<p>Slide 36 poses the question and slide 37 repeats it with the answers.</p>
<p>What are the propagation time and the transmission time for a 2.5-KB (kilobyte) message (an email) if the bandwidth of the network is 1 Gbps? Assume that the distance between the sender and the receiver is 12,000 km and that light travels at 2.4 × 10<sup>8</sup> m/s.</p>
$$\c{time}{\text{Propagation time}} = \frac{12,000 \times 1000}{2.4 \times 10^{8}} = \c{time}{50\text{ ms}}$$
$$\c{time}{\text{Transmission time}} = \frac{2500 \times 8}{\c{rate}{10^{9}}} = \c{time}{0.020\text{ ms}}$$`,
            means: R`<p>List what is given, then use the two formulas of slide 35:</p>
<ol>
<li><b>Given.</b> Message 2.5 KB; bandwidth 1 Gbps $= \c{rate}{10^{9}}$ bps; distance 12,000 km; speed $2.4 \times 10^{8}$ m/s.</li>
<li><b>Propagation time.</b> Distance in metres: $12,000 \times 1000 = 1.2 \times 10^{7}$ m. Then $\c{time}{T_p} = \frac{1.2 \times 10^{7}}{2.4 \times 10^{8}} = 0.5 \times 10^{-1} = \c{time}{0.05}$ s $= \c{time}{50}$ ms. The slide writes the numerator as $12,000 \times 1000$.</li>
<li><b>Transmission time.</b> The slides treat 1 KB as 1000 bytes, so 2.5 KB is 2500 bytes, and $2500 \times 8 = 20,000$ bits. Then $\c{time}{T_t} = \frac{20,000}{\c{rate}{10^{9}}} = 2 \times 10^{-5}$ s $= \c{time}{0.020}$ ms (which is 20 µs).</li>
<li><b>Compare.</b> 50 ms is 2500 times 0.020 ms. For this e-mail almost the whole delay is the trip, and a faster link would hardly change anything; only a shorter path would.</li>
<li><b>Latency</b> (not asked on the slide). With no queuing or processing delay it would be $\c{time}{50} + \c{time}{0.020} = \c{time}{50.02}$ ms.</li>
</ol>
<figure data-fig="l02.latency" data-caption="Drawn for this walkthrough from slide 37’s numbers: the 0.020 ms transmission slice is a sliver next to the 50 ms propagation slice."></figure>
<p>Which delay wins depends on the numbers. Send the same e-mail 12 km over a 1 Mbps link (my numbers, not the slide’s): $\c{time}{T_p} = \frac{12,000}{2.4 \times 10^{8}} = 0.05$ ms but $\c{time}{T_t} = \frac{20,000}{10^{6}} = 20$ ms, so now the loading dominates. A long path with a fast link is propagation-bound; a short path with a slow link or a big message is transmission-bound.</p>`,
            why: R`<p>This is the lecture’s one latency calculation and the cleanest solving item of the performance part: two formulas, two unit conversions, two answers in different units. The lesson underneath is the comparison in step 4: bandwidth only attacks the transmission time, distance only the propagation time.</p>
<p><b>Exam angle.</b> Solving with the same numbers or new clean ones. Mistakes: forgetting km to m (a factor of 1000), forgetting bytes to bits (a factor of 8), using 1024 for KB when the slide uses 1000, and slipping between seconds and milliseconds (0.05 s is 50 ms, and 2 × 10<sup>−5</sup> s is 0.02 ms).</p>`,
            tip: R`<p>Before dividing, convert: km → m (× 1000), bytes → bits (× 8), Gbps → 10<sup>9</sup> bps. Then 12,000 km at 2.4 × 10<sup>8</sup> m/s is 50 ms, and 2.5 KB at 1 Gbps is 0.020 ms.</p>`,
            beyond: R`<p>Textbook: the <b>bandwidth-delay product</b>, bandwidth × delay, is the number of bits that fit in the link at one moment. Here $\c{rate}{10^{9}} \times \c{time}{0.05} = 5 \times 10^{7}$ bits, which is 50 Mbit in flight along the 12,000 km.</p>`,
            example: { title: 'Propagation and transmission time of an e-mail (slides 36–37)', gen: 'l02.latency', params: { d: 12e6, v: 2.4e8, bytes: 2500, bw: 1e9 },
              slideAnswer: 'Propagation = (12,000 × 1000) / (2.4 × 10⁸) = 50 ms; transmission = (2500 × 8) / 10⁹ = 0.020 ms', slideValue: 0.05, input: 'Tp' } }
        ],
        together: R`<p>Part 4 moves from what a channel <i>could</i> carry to how a network <i>performs</i>.</p>
<table class="tbl">
<thead><tr><th>Measure</th><th>Meaning</th><th>Unit</th><th>Formula or rule</th><th>Slide’s numbers</th></tr></thead>
<tbody>
<tr><td>Bandwidth (Hz)</td><td>frequency range of the channel</td><td>Hz</td><td>more hertz → more bit rate</td><td>3000 Hz</td></tr>
<tr><td>Bandwidth (bps)</td><td>rated bit rate of the link</td><td>bps</td><td>appears in $\c{time}{T_t} = \frac{\text{size}}{\c{rate}{\text{bandwidth}}}$</td><td>1 Gbps</td></tr>
<tr><td>Throughput</td><td>actual rate achieved</td><td>bps</td><td>always below the bandwidth</td><td>none</td></tr>
<tr><td>Latency</td><td>time for the whole message to arrive</td><td>s</td><td>$\c{time}{T_p} + \c{time}{T_t} + \text{queuing} + \text{processing}$</td><td>50.02 ms without queuing and processing</td></tr>
<tr><td>Propagation time</td><td>the trip</td><td>s</td><td>$\c{time}{T_p} = \frac{\text{distance}}{\text{speed}}$</td><td>50 ms</td></tr>
<tr><td>Transmission time</td><td>the loading</td><td>s</td><td>$\c{time}{T_t} = \frac{\text{size}}{\c{rate}{\text{bandwidth}}}$</td><td>0.020 ms</td></tr>
<tr><td>Jitter</td><td>variation of latency between packets</td><td>s</td><td>difference, not a sum</td><td>none</td></tr>
</tbody>
</table>
<p>The chain: <b>the theory limit (Nyquist, Shannon) → what a link is rated for (bandwidth in bps) → what it really delivers (throughput) → how long a message takes (latency, built from propagation, transmission, queuing and processing) → how steady that delay is (jitter)</b>. The whole lecture can now be read in one pass, and slide 38 does exactly that in five bullets.</p>` },

      /* ============================ PART 5 ============================ */
      { title: 'Summary: the whole lecture in five lines', slides: [38, 39],
        items: [
          { n: 38, title: 'Summary',
            says: R`<ul>
<li>In data communications, we commonly use periodic analog signals and nonperiodic digital signals.</li>
<li>A digital signal is a composite analog signal with an infinite bandwidth.</li>
<li>For a noiseless channel, the Nyquist bit rate formula defines the theoretical maximum bit rate.</li>
<li>For a noisy channel, we need to use the Shannon capacity to find the maximum bit rate.</li>
<li>Attenuation, distortion, and noise can impair a signal.</li>
</ul>`,
            means: R`<p>Each bullet compresses a part of the lecture. For each, here is what it means and the slides to go back to:</p>
<table class="tbl">
<thead><tr><th>Bullet</th><th>What it means</th><th>Back to</th></tr></thead>
<tbody>
<tr><td><b>1.</b> Periodic analog and nonperiodic digital</td><td>The analog signals we use repeat, like the sine wave with its amplitude, frequency and phase. The digital signals we send are the data itself and do not repeat, so they are described by a bit rate, not a frequency.</td><td>5–8, 14</td></tr>
<tr><td><b>2.</b> A digital signal is a composite analog signal with infinite bandwidth</td><td>Its sharp edges need sine waves out towards infinity, so no real channel passes it perfectly: a low-pass channel gives an approximation (baseband), or the signal is modulated onto a bandpass channel (broadband).</td><td>11–13, 16–18</td></tr>
<tr><td><b>3.</b> Noiseless channel: Nyquist</td><td>$\c{rate}{N} = 2 \c{bw}{B} \log_2 \c{level}{L}$; 3000 Hz with 2 levels gives 6000 bps.</td><td>29–30</td></tr>
<tr><td><b>4.</b> Noisy channel: Shannon</td><td>$\c{rate}{C} = \c{bw}{B} \log_2 (1 + \c{snr}{SNR})$ with the plain SNR; 3000 Hz at SNR 3162 gives about 34,860 bps. Use it for the ceiling, then Nyquist for the levels.</td><td>31–33</td></tr>
<tr><td><b>5.</b> Attenuation, distortion and noise</td><td>Energy lost (measured in dB), shape changed (components out of step), and unwanted energy added (measured by the SNR).</td><td>20–26</td></tr>
</tbody>
</table>
<p>Slides 34 to 37 (throughput, latency, jitter and the latency formulas) are not among the five bullets, but they are on the slides and the examples of slides 30, 32, 33 and 37 are the numbers to be able to redo.</p>`,
            why: R`<p>A summary slide is the list an examiner can turn straight into questions: each bullet is a possible multiple-choice statement, an identification (“which formula applies to a noiseless channel?”) or the outline of a short essay. A good essay answer takes each bullet in turn and backs it with the formula or the picture from the slide listed above.</p>
<p><b>Exam angle.</b> Mistakes: using Nyquist for a noisy channel (bullet 4 says Shannon), saying a digital signal has a finite bandwidth (bullet 2: infinite), reversing the pairing in bullet 1 (it is periodic <i>analog</i> and nonperiodic <i>digital</i>), and listing the impairments as “attenuation, distortion and interference” (the slide’s word is noise).</p>` },

          { n: 39, kind: 'admin', title: 'Closing slide',
            says: R`Closing slide, the same as the title slide: “Physical Communication Layer”, NSCOM03 Data Communications, “Signals, Bandwidth, Transmission, Noise, Data Rate”, dated 2024-09-17, prepared by Jerome Gutierrez.` }
        ],
        together: R`<p>The whole of Lecture 2 is one question asked in stages: <b>what does it take to get bits across a physical channel, and how fast can it be done?</b></p>
<table class="tbl">
<thead><tr><th>Step</th><th>Idea</th><th>Slides</th></tr></thead>
<tbody>
<tr><td>Signals</td><td>analog or digital, periodic or not; the sine wave has amplitude, frequency, phase</td><td>4–10</td></tr>
<tr><td>Composite and bandwidth</td><td>any signal is a sum of sine waves; $\c{bw}{B} = \c{freq}{f_{\text{high}}} - \c{freq}{f_{\text{low}}}$; a digital signal needs infinite bandwidth</td><td>11–14</td></tr>
<tr><td>Crossing a channel</td><td>baseband (low-pass) or broadband (bandpass)</td><td>16–18</td></tr>
<tr><td>What goes wrong</td><td>attenuation (dB), distortion, noise (SNR)</td><td>20–26</td></tr>
<tr><td>How fast</td><td>$\c{rate}{N} = 2 \c{bw}{B} \log_2 \c{level}{L}$ (noiseless), $\c{rate}{C} = \c{bw}{B} \log_2 (1 + \c{snr}{SNR})$ (noisy), then both</td><td>28–33</td></tr>
<tr><td>How a network performs</td><td>bandwidth, throughput, latency, jitter</td><td>34–37</td></tr>
</tbody>
</table>
<p>Read as a story: <b>bits become a signal → a signal is a sum of sine waves with a bandwidth → the channel passes only a band, and damages what passes → bandwidth, levels and noise cap the data rate → a real network delivers less, and with delay</b>. Lecture 3 starts exactly where slides 14 and 16 left the digital signal. If we send the digital signal as it is (baseband), how do we turn bits into voltage levels so that the signal needs little bandwidth, the receiver can keep time and the average voltage stays near zero? Those rules are the line codes (NRZ, Manchester, AMI and the rest), and the bit rate, levels and bandwidth you now know are what they trade off. Lecture 4 covers the broadband half of slide 18: bits to analog signals.</p>` }

    ],
    terms: [
      { term: 'Transmission impairment', alt: ['impairment'], def: 'Anything on the way that makes the received signal differ from the one sent. The slides name three: attenuation (energy lost), distortion (shape changed) and noise (unwanted energy added). They are why bits can arrive wrong.', ref: 'L02 p19; L02 p38' },
      { term: 'Amplifier', def: 'A device that adds energy to a weakened signal to compensate for attenuation. On slide 20 it sits between Point 2 and Point 3, and its effect is a positive number of decibels, a gain.', ref: 'L02 p20' },
      { term: 'Noise', def: 'Unwanted energy that corrupts the signal at the receiving end. The slides give four kinds: thermal, induced, crosstalk and impulse. How strong it is compared with the signal is measured by the SNR.', ref: 'L02 p24' },
      { term: 'SNR in dB', alt: ['SNRdB', 'SNR_dB'], def: 'The signal-to-noise ratio on the decibel scale: SNR_dB = 10 log₁₀ SNR, so a ratio of 10,000 is 40 dB. Shannon’s formula needs the plain ratio, so convert back with SNR = 10^(SNR_dB/10).', ref: 'L02 p25; L02 p26' },
      { term: 'Data rate', def: 'How many bits per second a channel carries, the same quantity as the bit rate. The slides say it depends on the bandwidth available, the signal levels used and the quality (noise) of the channel.', ref: 'L02 p28' },
      { term: 'Noiseless channel', def: 'An ideal channel with no noise, the case Nyquist’s formula assumes: N = 2 × B × log₂L. Real channels are noisy, so for them the Shannon capacity gives the maximum bit rate.', ref: 'L02 p29; L02 p38' },
      { term: 'Bandwidth in bps', alt: ['link bandwidth'], def: 'The second meaning of bandwidth on slide 34: the bit rate a link is rated for, such as 1 Gbps. Throughput is the lower rate actually achieved. In the transmission-time formula, “bandwidth” means this rate, not hertz.', ref: 'L02 p34; L02 p35' },
      { term: 'Propagation time', def: 'The time a signal takes to travel the distance through the medium: distance divided by propagation speed. It does not depend on message size. 12,000 km at 2.4 × 10⁸ m/s takes 50 ms.', ref: 'L02 p35; L02 p37' },
      { term: 'Transmission time', def: 'The time to push all bits of a message onto the link: message size in bits divided by the bandwidth in bps. It does not depend on distance. 2500 bytes at 1 Gbps takes 0.020 ms.', ref: 'L02 p35; L02 p37' },
      { term: 'Queuing time', def: 'The time a message waits in line at a device before it can be forwarded, the third part of latency. The slide names it without a formula; the e-mail example assumes none.', ref: 'L02 p35' },
      { term: 'Processing delay', def: 'The time a device needs to examine a message and decide what to do with it, the fourth part of latency. The slide names it without a formula, and the e-mail example assumes none.', ref: 'L02 p35' },
      { term: 'Kilobyte (KB)', alt: ['KB'], def: 'A unit of message size. The slides use 1 KB = 1000 bytes, so a 2.5-KB e-mail is 2500 bytes, which is 20,000 bits after multiplying by 8, before dividing by the bandwidth.', ref: 'L02 p36; L02 p37' }
    ],
    keyTerms: ['Transmission impairment', 'Attenuation', 'Decibel', 'Distortion', 'Noise', 'SNR', 'Nyquist bit rate', 'Shannon capacity', 'Throughput', 'Latency', 'Propagation time', 'Transmission time', 'Jitter'],
    faq: [
      { q: 'What is the difference between attenuation, distortion and noise?',
        a: R`<p>Attenuation is a loss of energy: the signal keeps its shape but gets smaller, and an amplifier compensates. Distortion changes the shape: the components of a composite signal travel at different speeds and arrive at different times. Noise adds unwanted energy (thermal, induced, crosstalk or impulse). Attenuation is measured in decibels and noise by the SNR.</p>`, ref: 'L02 p20; L02 p23; L02 p24' },
      { q: 'Why is a loss negative in dB, and what does −3 dB mean?',
        a: R`<p>In $\c{snr}{\text{dB}} = 10 \log_{10} \frac{\c{snr}{P_2}}{\c{snr}{P_1}}$, $\c{snr}{P_2}$ is the power after and $\c{snr}{P_1}$ the power before, so a loss gives a ratio below 1 and a negative logarithm. For half the power, $10 \log_{10} 0.5 = 10(-0.3) = \c{snr}{-3}$ dB. So −3 dB halves the power, +3 dB doubles it, and ±10 dB multiplies or divides it by 10.</p>`, ref: 'L02 p21; L02 p22' },
      { q: 'How do I convert between SNR and SNR in dB, and which one goes into Shannon’s formula?',
        a: R`<p>$\c{snr}{SNR_{\text{dB}}} = 10 \log_{10} \c{snr}{SNR}$, and back, $\c{snr}{SNR} = 10^{\c{snr}{SNR_{\text{dB}}}/10}$: 10 dB is 10, 20 dB is 100, 30 dB is 1000 and 40 dB is 10,000 (slide 26). Shannon’s formula needs the plain ratio, so a dB value must be converted first.</p>`, ref: 'L02 p25; L02 p26; L02 p31' },
      { q: 'When do I use Nyquist and when Shannon?',
        a: R`<p>Nyquist, $\c{rate}{N} = 2 \c{bw}{B} \log_2 \c{level}{L}$, is for a noiseless channel and takes the bandwidth and the number of levels. Shannon, $\c{rate}{C} = \c{bw}{B} \log_2 (1 + \c{snr}{SNR})$, is for a noisy channel and takes the bandwidth and the SNR. If a problem gives an SNR, start with Shannon.</p>`, ref: 'L02 p29; L02 p31; L02 p38' },
      { q: 'Why does Shannon’s formula not contain the number of signal levels?',
        a: R`<p>Capacity belongs to the channel, to its bandwidth and noise, and not to the signaling scheme. Whatever the number of levels, noise limits how many can be told apart, and the SNR already carries that limit. The slide states that the levels do not dictate the capacity. Nyquist’s formula does contain $\c{level}{L}$, but warns that the receiver must be able to distinguish the levels.</p>`, ref: 'L02 p29; L02 p31' },
      { q: 'How do I use Nyquist and Shannon together, as on slide 33?',
        a: R`<p>Shannon first: $\c{rate}{C} = 10^{6} \log_2 (1 + 63) = \c{rate}{6}$ Mbps is the upper limit. Pick a lower rate such as 4 Mbps, then solve Nyquist for the levels: $4\text{ Mbps} = 2 \times 1\text{ MHz} \times \log_2 \c{level}{L}$ gives $\log_2 \c{level}{L} = 2$, so $\c{level}{L} = 4$.</p>`, ref: 'L02 p33' },
      { q: 'What is the difference between bandwidth, throughput, latency and jitter?',
        a: R`<p>Bandwidth is the range of frequencies of a channel (hertz) or the rated bit rate of a link (bps). Throughput is the rate actually achieved, always less than the bandwidth in bps. Latency is the time for an entire message to arrive. Jitter is the difference in latency between packets.</p>`, ref: 'L02 p34' },
      { q: 'What are the four parts of latency, and which one dominated on slide 37?',
        a: R`<p>Latency is propagation time plus transmission time plus queuing time plus processing delay. Propagation is distance over speed, and transmission is message size over bandwidth. On slide 37 the propagation time (50 ms) was 2500 times the transmission time (0.020 ms), because the path is 12,000 km and the e-mail is tiny.</p>`, ref: 'L02 p35; L02 p37' }
    ]
  });
})();
