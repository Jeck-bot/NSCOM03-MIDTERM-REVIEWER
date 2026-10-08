/* Slide-by-slide walkthrough: L03 slides 62–96 (topic l03b). Contract: docs/AUTHORING.md §3.7.
   Text is written with String.raw (R) so that TeX backslashes in $…$ stay intact. */
(function () {
  'use strict';
  var R = String.raw;
  function C(p) { return ' <span class="chip ref">' + p + '</span>'; }

  KIT.walk({
    id: 'l03b', topic: 'l03b', range: [62, 96],
    parts: [

      /* ============ PART 1: analog to digital — PCM, sampling, Nyquist (slides 62–71) ============ */
      { title: 'Analog to digital: PCM, sampling and the Nyquist theorem', slides: [62, 71],
        items: [
          { n: 62, title: 'PCM (Main Section 7)',
            says: R`<ul><li>PCM consists of three steps to digitize an analog signal: <b>sampling</b>, <b>quantization</b>, <b>binary encoding</b>.</li>
<li>Before we sample, we have to <b>filter</b> the signal to limit the maximum frequency of the signal, as it affects the sampling rate.</li>
<li>Filtering should ensure that we do not distort the signal, “ie remove high frequency components that affect the signal shape”.</li></ul>
<p>Handwritten on the slide: <b>“Main Section 7”</b> beside the title, and a bracket drawn around the three steps with three short dashes.</p>`,
            means: R`<p>Slides 3–61 converted <b>digital data into a digital signal</b> (line coding, block coding, scrambling). From this slide on the direction is reversed: the input is an <b>analog</b> signal, such as the continuously varying voltage from a microphone, and the output is a <b>stream of bits</b>. Turning an analog signal into bits is called <b>digitizing</b> (analog-to-digital conversion). <b>PCM</b> (pulse code modulation) is the standard method, and it always runs three steps in the same order:</p>
<ol><li><b>Sampling</b>: measure the height of the signal at regular instants. The result is a train of pulses, one per measurement.</li>
<li><b>Quantization</b>: round every measured height to the nearest of a limited set of allowed values.</li>
<li><b>Binary encoding</b>: write each allowed value as a short group of bits.</li></ol>
<p>Everyday version: read a thermometer every minute (sampling), round each reading to a whole degree (quantization), then write that whole number in binary (encoding).</p>
<p>The other two bullets add a step zero, the <b>filter</b>. How fast you must sample depends on the highest frequency the signal contains (the Nyquist theorem, slide 66). A real signal such as speech has components far above any useful range, so a <b>low-pass filter</b> first removes everything above a chosen limit. Telephone systems assume 4000 Hz (slide 69). That limit becomes $\c{bw}{f_{\max}}$ and it fixes the sampling rate $\c{baud}{f_s}$.</p>`,
            why: R`<p>This opens the part of the lecture the instructor marked <b>“Main Section 7”</b>, so treat PCM as a likely source of a problem-solving item. The bracket around the three steps suggests that you should be able to name them, in order, and say what each one does. The next slides take them one at a time: sampling (64–71), quantization (72–78), encoding (75–76), the resulting bit rate (79–83) and the reverse trip at the receiver (81–82).</p>
<p><b>Exam angle:</b> an identification or essay item such as “list the steps of PCM”. Typical mistakes are swapping quantization and sampling, forgetting that a filter comes first, and mixing PCM up with PAM (PAM is only what exists after step 1, slide 64).</p>`,
            tip: R`<p>Memory hook: <b>S</b>ample, <b>Q</b>uantize, <b>E</b>ncode, “Some Quiet Engineers”. Filter first, then S, Q, E.</p>`,
            error: { says: '“Filtering should ensure that we do not distort the signal, ie remove high frequency components that affect the signal shape”.',
              correct: 'Read it as: the filter must <i>not</i> distort the signal, so it must not remove the high-frequency components that shape it. It only cuts what lies above the chosen f<sub>max</sub>.' } },

          { n: 63, title: 'Components of the PCM encoder',
            says: R`<p>A block diagram. On the left an <b>Analog signal</b> plot (a smooth pink curve). A box labelled <b>PCM encoder</b> holds three blocks in a row: <b>Sampling</b> (yellow), <b>Quantizing</b> (light blue) and <b>Encoding</b> (green). Hanging below the Sampling block is a plot called <b>PAM signal</b> (pink vertical stems of different heights). Above the Quantizing block is a plot called <b>Quantized signal</b> (stems drawn on a grid of horizontal level lines). On the right the output is <b>Digital data</b>, shown as <span class="mono">11 ⋯ 1100</span>.</p>
<p>Handwritten: blue circles around the analog-signal plot, the Quantizing box, the PAM-signal plot and the digital data, plus a row of small hand-drawn stems under the figure.</p>`,
            means: R`<p>Follow one signal through the three blocks and ask two questions at every point: <i>is time still continuous?</i> and <i>is amplitude still continuous?</i></p>
<ol><li><b>Analog signal in.</b> Continuous in time and in amplitude: at every instant it can have any height.</li>
<li><b>Sampling block, output PAM signal.</b> Heights are read only at the sampling instants, so time is now <i>discrete</i>. Each height can still be any value, such as 2.7183 V. The stems in the PAM plot have all sorts of heights.</li>
<li><b>Quantizing block, output quantized signal.</b> Each stem is moved to the nearest line of a fixed grid. Now amplitude is discrete too: only a few heights are possible.</li>
<li><b>Encoding block, output digital data.</b> Each grid height is replaced by its binary number, so the output is the bit stream <span class="mono">11 ⋯ 1100</span>.</li></ol>
<table class="tbl compact"><thead><tr><th>Where</th><th>Time</th><th>Amplitude</th><th>Looks like</th></tr></thead><tbody>
<tr><td>Analog signal</td><td>continuous</td><td>continuous</td><td>a smooth curve</td></tr>
<tr><td>After sampling (PAM)</td><td>discrete</td><td>still any value</td><td>stems of any height</td></tr>
<tr><td>After quantizing</td><td>discrete</td><td>only a few values</td><td>stems on grid lines</td></tr>
<tr><td>After encoding</td><td>discrete</td><td>bits</td><td><span class="mono">1100…</span></td></tr></tbody></table>
<figure data-fig="l03b.pcm" data-caption="The slide-63 chain drawn for one signal: the analog curve, its PAM samples (stems) and the quantized values (dots on the zone midpoints, here 8 zones)."></figure>`,
            why: R`<p>The circles show where the instructor wants your eye: the signal at four points (analog, PAM, quantized, digital). A drawing or essay item could ask you to sketch this diagram and say what the signal looks like at each point.</p>
<p>The decoder on slide 82 runs the chain backwards. Slides 64–71 open up the Sampling block, and slides 72–78 the Quantizing and Encoding blocks. <b>Common mistake:</b> calling the PAM signal “digital”. Slide 64 says its values are still analog (non-integer), so nothing is digital until the Encoding block.</p>` },

          { n: 64, title: 'Sampling',
            says: R`<ul><li>The analog signal is sampled every T<sub>S</sub> seconds. T<sub>s</sub> is the <b>sampling interval</b>.</li>
<li>f<sub>s</sub> = 1/T<sub>s</sub> is the <b>sampling rate</b> or sampling frequency.</li>
<li>Three sampling methods: <b>Ideal</b> (an impulse at each sampling instant), <b>Natural</b> (a pulse of short width with varying amplitude), <b>Flat-top</b> (sample and hold, like natural but with a single amplitude value).</li>
<li>The process is called <b>pulse amplitude modulation (PAM)</b>; the outcome is a signal with analog (non-integer) values.</li></ul>`,
            means: R`<p><b>Sampling</b> means looking at the signal only at evenly spaced instants. The time between two looks is the <b>sampling interval</b> $\c{time}{T_s}$ (seconds). The number of looks per second is the <b>sampling rate</b> $\c{baud}{f_s}$ (samples per second). They are reciprocals:</p>
$$\c{baud}{f_s} = \frac{1}{\c{time}{T_s}}$$
<p>For example $\c{time}{T_s} = \c{time}{125\text{ µs}}$ gives $\c{baud}{f_s} = \frac{1}{\c{time}{125\text{ µs}}} = \c{baud}{8000}$ samples/s, and $\c{time}{T_s} = \c{time}{0.5\text{ ms}}$ gives $\c{baud}{2000}$ samples/s. Colour check: seconds are amber, samples per second are orange (they play the part of signal elements per second).</p>
<p>The slide lists three ways to realise a sample (pictured on slide 65). <b>Ideal</b>: an infinitely thin impulse, the textbook idealisation. <b>Natural</b>: the signal is let through for a short time, so the top of each pulse follows the signal during that short width. <b>Flat-top</b>: the same short pulse, but its top is held at one single height (sample and hold).</p>
<p>Whichever method is used, the heights of the pulses carry the signal's amplitude. That is <b>pulse amplitude modulation (PAM)</b>: amplitude information sitting in the height of a pulse train. The heights are still <i>analog</i> numbers (3.7, −1.25 …), which is why the PCM encoder needs the next two steps.</p>`,
            why: R`<p>This is step 1 of PCM (slide 62) and the Sampling block of slide 63. It introduces the two quantities that every later formula uses: $\c{baud}{f_s}$ goes straight into the bit-rate formula $\c{rate}{N} = \c{level}{n_b} \times \c{baud}{f_s}$ (slide 79). Slide 65 shows the three methods, slide 66 says how large $\c{baud}{f_s}$ must be.</p>
<p><b>Exam angle:</b> identification (“the sampled signal with analog heights is called …” gives PAM; ideal, natural and flat-top by their descriptions) and short solving items that go between $\c{time}{T_s}$ and $\c{baud}{f_s}$. The usual mistakes are inverting the reciprocal and treating PAM as already digital.</p>` },

          { n: 65, title: 'Three different sampling methods for PCM',
            says: R`<p>Three small plots on Amplitude-against-Time axes, each with a dashed “Analog signal” curve (it rises, peaks, falls through zero to a trough and rises again):</p>
<ul><li><b>a. Ideal sampling</b>: thin pink stems with a dot on top, equally spaced; the gap between two stems is marked T<sub>s</sub>.</li>
<li><b>b. Natural sampling</b>: a comb of narrow pulses whose tops follow the curve.</li>
<li><b>c. Flat-top sampling</b>: wider rectangular pulses, each with a flat top at one height.</li></ul>
<p>Handwritten: a blue oval around each of the three plots and a long bracket down the left side.</p>`,
            means: R`<p>All three pictures sample at the <b>same instants</b>, spaced $\c{time}{T_s}$ apart. They differ only in the <i>shape of each pulse</i>:</p>
<table class="tbl compact"><thead><tr><th>Method</th><th>One pulse is …</th><th>Top of the pulse</th></tr></thead><tbody>
<tr><td><b>Ideal</b> (a)</td><td>an impulse, with zero width: just a dot on a stem</td><td>the signal value at that instant</td></tr>
<tr><td><b>Natural</b> (b)</td><td>a short pulse with a little width</td><td>follows the curve of the signal while the pulse lasts (varying amplitude)</td></tr>
<tr><td><b>Flat-top</b> (c)</td><td>the same short pulse, widened into a rectangle</td><td>one single height (sample and hold)</td></tr></tbody></table>
<p>Read plot (c) as a staircase of little roofs: the sampler grabs the signal value and holds it for the pulse width, so the roof is flat even though the signal underneath is still moving. In plot (b) the roof is slanted because it keeps following the signal. Plot (a) is the mathematical ideal; a real circuit cannot make a pulse of zero width.</p>
<p>In all three the pulse heights follow the analog signal, so each plot is a <b>PAM signal</b> (slide 64).</p>`,
            why: R`<p>The ovals around all three plots and the bracket suggest the instructor wants you to <b>recognise or draw all three</b>. The likeliest items are matching the name to the description (ideal: impulse; natural: short pulse with varying amplitude; flat-top: single amplitude, sample and hold) and a sketch of one of them.</p>
<p>The common mistake is to think the methods use different sampling rates. They do not; rate and pulse shape are independent. What decides whether the samples are <i>enough</i> is the Nyquist rule of slide 66.</p>`,
            tip: R`<p>Ideal = a <i>dot</i> on a stick. Natural = a <i>comb</i> whose tooth tops follow the curve. Flat-top = <i>flat roofs</i>.</p>`,
            beyond: R`<p>Flat-top (sample and hold) is the method used in real converters, because the held value stays steady long enough for the next stage to measure it.</p>` },

          { n: 66, title: 'Nyquist theorem',
            says: R`<p>“According to the Nyquist theorem, the sampling rate must be at least 2 times the highest frequency contained in the signal.”</p>`,
            means: R`<p>In symbols, with $\c{bw}{f_{\max}}$ the highest frequency present in the signal:</p>
$$\c{baud}{f_s} \ge 2 \times \c{bw}{f_{\max}}$$
<p>Why “twice”? A sine wave of frequency $\c{bw}{f}$ goes up once and down once per cycle. To notice that it went up and down you need at least <b>two samples per cycle</b>: one on the upper half, one on the lower half. Fewer than that and the dots cannot tell the fast wave from a slower one (slide 68 shows this). The smallest allowed rate, $2 \times \c{bw}{f_{\max}}$, is called the <b>Nyquist rate</b>.</p>
<p>Worked by hand, a signal with $\c{bw}{f_{\max}} = \c{bw}{5\text{ kHz}}$ needs at least $\c{baud}{f_s} = 2 \times \c{bw}{5000} = \c{baud}{10,000}$ samples/s, which means one sample at least every $\c{time}{T_s} = \frac{1}{\c{baud}{10,000}} = \c{time}{100\text{ µs}}$. Turned around: a system that samples at $\c{baud}{8000}$ samples/s can handle signals only up to $\c{bw}{f_{\max}} \le \frac{\c{baud}{8000}}{2} = \c{bw}{4000}$ Hz.</p>
<p>Units: $\c{bw}{f_{\max}}$ is in hertz (green), $\c{baud}{f_s}$ in samples per second (orange).</p>`,
            why: R`<p>Slide 62 said to filter first because $\c{bw}{f_{\max}}$ fixes the sampling rate; this slide is that rule. Slide 67 extends it to two kinds of signal, slide 68 shows what goes wrong below it, and slides 69–71 plug in numbers.</p>
<p><b>Exam angle:</b> MCQ on “at least twice the highest frequency”, and a solving item to compute the minimum rate or the sampling interval. Watch two traps. First, it is the <i>highest frequency</i>, not the bandwidth (they coincide only for a low-pass signal, slide 67). Second, this is not the Nyquist bit rate of L02 ($N_{\max} = 2B\log_2 L$, slide 10): same scientist, different question. That one is about the capacity of a noiseless channel; this one is about how fast to sample.</p>`,
            tip: R`<p>Two samples per cycle of the fastest component: that is the whole theorem.</p>` },

          { n: 67, title: 'Nyquist sampling rate for low-pass and bandpass signals',
            says: R`<p>Two frequency-domain plots (Amplitude against Frequency), each with a pink rectangle showing which frequencies the signal occupies, and the caption “<b>Nyquist rate = 2 × f<sub>max</sub></b>” above each.</p>
<ul><li><b>Low-pass signal</b>: the rectangle runs from the origin (its left end is labelled f<sub>min</sub>) to f<sub>max</sub>.</li>
<li><b>Bandpass signal</b>: the axis starts at 0, and the rectangle sits between f<sub>min</sub> and f<sub>max</sub>, leaving a gap above 0.</li></ul>`,
            means: R`<p>A signal's <b>spectrum</b> (L02) lists the frequencies it contains. Two shapes matter here:</p>
<ul><li>A <b>low-pass signal</b> contains every frequency from 0 up to $\c{bw}{f_{\max}}$, like voice (0–4000 Hz). Its bandwidth is $\c{bw}{B} = \c{bw}{f_{\max}} - 0 = \c{bw}{f_{\max}}$. The left label “f<sub>min</sub>” on the slide sits at the origin, so it is 0 (slide 70 says “between 0 and f”).</li>
<li>A <b>bandpass signal</b> contains only a band between $\c{bw}{f_{\min}}$ and $\c{bw}{f_{\max}}$, with nothing below $\c{bw}{f_{\min}}$ (a radio channel, for example). Its bandwidth is $\c{bw}{B} = \c{bw}{f_{\max}} - \c{bw}{f_{\min}}$, which is <i>smaller</i> than $\c{bw}{f_{\max}}$.</li></ul>
<p>The slide gives the <b>same rule for both</b>: the Nyquist rate is $2 \times \c{bw}{f_{\max}}$. Example band from 1 MHz to 1.2 MHz:</p>
$$\c{bw}{B} = \c{bw}{1.2\text{ MHz}} - \c{bw}{1\text{ MHz}} = \c{bw}{0.2\text{ MHz}}, \quad quad \c{baud}{f_s} = 2 \times \c{bw}{1.2\text{ MHz}} = \c{baud}{2.4\text{ million}}\text{ samples/s}$$
<p>The width of this band is only 0.2 MHz, but the rate follows the <i>top edge</i>, 1.2 MHz. Using $2 \times \c{bw}{B} = 0.4$ million would be wrong by the slide's rule.</p>`,
            why: R`<p>This slide prepares the two contrasting examples: slide 70 (low-pass, where B equals f<sub>max</sub> so the answer is computable) and slide 71 (bandpass with only B known, which cannot be answered). If the question gives a band, find the <i>top</i> frequency first.</p>
<p><b>Exam angle:</b> MCQ or identification: “the Nyquist rate for a bandpass signal is 2 × f<sub>max</sub>”. A solving item may give f<sub>min</sub> and f<sub>max</sub>. The mistake to avoid is substituting the bandwidth for f<sub>max</sub>.</p>` },

          { n: 68, title: 'Example 5: sampling a sine wave at three rates (Sub section)',
            says: R`<p>“For an intuitive example of the Nyquist theorem, let us sample a simple sine wave at three sampling rates”:</p>
<ul><li>f<sub>s</sub> = 4f (2 times the Nyquist rate)</li><li>f<sub>s</sub> = 2f (Nyquist rate)</li><li>f<sub>s</sub> = f (one-half the Nyquist rate)</li></ul>
<ul><li>Sampling at the Nyquist rate can create a good approximation of the original sine wave (part a).</li>
<li>Oversampling (part b) can also create the same approximation, but it is redundant and unnecessary.</li>
<li>Sampling below the Nyquist rate (part c) does not produce a signal that looks like the original sine wave.</li></ul>
<p>The figure has three rows. Each shows the sine with black sample dots on the left and, on the right, the dots joined by pink dashed lines: (a) <i>Nyquist rate sampling: f<sub>s</sub> = 2f</i>, a zigzag at the right frequency; (b) <i>Oversampling: f<sub>s</sub> = 4f</i>, the same zigzag with extra dots; (c) <i>Undersampling: f<sub>s</sub> = f</i>, a few dots joined by a long, slow line. Handwritten: “Sub section”.</p>`,
            means: R`<p>Let the sine wave have frequency $\c{bw}{f}$. Count how many samples land in one cycle:</p>
<table class="tbl compact"><thead><tr><th>Part</th><th>Rate</th><th>Samples per cycle</th><th>Join the dots and you get …</th></tr></thead><tbody>
<tr><td>a</td><td>$\c{baud}{f_s} = 2\,\c{bw}{f}$</td><td>2</td><td>an up-down zigzag with the <b>right frequency</b>: a good approximation</td></tr>
<tr><td>b</td><td>$\c{baud}{f_s} = 4\,\c{bw}{f}$</td><td>4</td><td>the <b>same</b> zigzag; the extra dots add nothing (redundant)</td></tr>
<tr><td>c</td><td>$\c{baud}{f_s} = \c{bw}{f}$</td><td>1</td><td>a long, slow line: a <b>false</b>, much slower wave</td></tr></tbody></table>
<p>With real numbers, a 1000 Hz tone: (b) uses 4000 samples/s, (a) uses 2000 samples/s and (c) uses 1000 samples/s. Case (a) sits exactly on the Nyquist limit $2 \times \c{bw}{f}$. Case (b) is twice that limit, so the slide calls it “2 times the Nyquist rate”. Case (c) is half of it.</p>
<p>In (c) the dots catch the sine at one point of its cycle (or slowly drifting points) instead of both halves. Joining them draws a wave far slower than the real one. Nothing in the dots can tell you the truth, so no later processing can repair it.</p>
<figure data-fig="l03b.sampling" data-caption="Slide 68 redrawn: sampling a sine at 4f (oversampling), at 2f (the Nyquist rate) and below it. The slide labels its rows in the order a = 2f, b = 4f, c = f."></figure>`,
            why: R`<p>This is the picture behind slide 66: the answer to <i>why</i> twice. It is marked “Sub section”, so be ready to explain the three cases in your own words or sketch them: <b>2f is enough, 4f is wasteful, f is wrong</b>.</p>
<p>Oversampling is not an error, only a cost: more samples per second means a higher bit rate later ($\c{rate}{N} = \c{level}{n_b} \times \c{baud}{f_s}$, slide 79). <b>Exam angle:</b> MCQ on which case approximates the wave, which is redundant and which fails; identification of “sampling below the Nyquist rate” as undersampling.</p>`,
            error: { says: 'Part (c) is labelled f<sub>s</sub> = f, but the dots in the drawing land at different points of the wave (near a peak, a zero, a trough).',
              correct: 'Sampling at exactly f<sub>s</sub> = f would give the same value every time; the drawing matches a rate slightly below f. The lesson still holds: below 2f the samples trace a false, slower wave.' },
            beyond: R`<p>The false, slower wave produced by undersampling is called <b>aliasing</b>: the high frequency disguises itself as a low one. (Forouzan; the slides do not name it.)</p>` },

          { n: 69, title: 'Example 6: telephone voice (Sub-sec)',
            says: R`<ul><li>Telephone companies digitize voice by assuming a maximum frequency of 4000 Hz.</li><li>The sampling rate therefore is 8000 samples per second.</li></ul><p>Handwritten: “Sub-sec”.</p>`,
            means: R`<p>This is the first number-crunching use of the Nyquist rule, and the template for all later ones:</p>
<ol><li><b>Find the highest frequency.</b> Human speech has some energy above 4 kHz, but the telephone network <i>assumes</i> a maximum of 4000 Hz (the filter of slide 62 enforces it): $\c{bw}{f_{\max}} = \c{bw}{4000}$ Hz.</li>
<li><b>Double it.</b> $\c{baud}{f_s} = 2 \times \c{bw}{f_{\max}} = 2 \times \c{bw}{4000} = \c{baud}{8000}$ samples/s.</li>
<li><b>Convert to an interval if asked.</b> $\c{time}{T_s} = \frac{1}{\c{baud}{f_s}} = \frac{1}{\c{baud}{8000}} = \c{time}{125\text{ µs}}$: the signal is read once every 125 microseconds.</li></ol>
<p>Hold on to <b>8000 samples/s</b>: it returns on slide 80, where 8 bits per sample turns it into 64 kbps.</p>`,
            why: R`<p>“Sub-sec” again marks an example the instructor wants you to be able to reproduce. Together with Examples 7 and 8 (slides 70–71) it forms the whole Nyquist question family: given a highest frequency, a bandwidth or a band, give the sampling rate or say it cannot be determined.</p>
<p><b>Exam angle:</b> solving (“a voice signal up to 4 kHz is sampled at the Nyquist rate: find f<sub>s</sub> and T<sub>s</sub>”). Typical slips are forgetting the factor 2 (4000 instead of 8000) and mis-converting 125 µs.</p>`,
            example: { title: 'Telephone voice: Nyquist sampling rate (slide 69)', gen: 'l03b.sampling', params: { kind: 'lowpass', fmax: 4000 },
              slideAnswer: '8000 samples per second', slideValue: 8000, input: 'fs' } },

          { n: 70, title: 'Example 7: low-pass signal of 200 kHz (Sub-sec)',
            says: R`<p><b>Question:</b> “A complex low-pass signal has a bandwidth of 200 kHz. What is the minimum sampling rate for this signal?”</p>
<p><b>Solution:</b> “The bandwidth of a low-pass signal is between 0 and f, where f is the maximum frequency in the signal. Therefore, we can sample this signal at 2 times the highest frequency (200 kHz). The sampling rate is therefore 400,000 samples per second.” Handwritten: “Sub-sec”.</p>`,
            means: R`<p>“Complex” means a composite signal made of many sine components (L02). The logic is two short steps:</p>
<ol><li><b>Bandwidth to highest frequency.</b> A low-pass signal starts at 0 Hz, so $\c{bw}{B} = \c{bw}{f_{\max}} - 0$ and therefore $\c{bw}{f_{\max}} = \c{bw}{B} = \c{bw}{200\text{ kHz}}$.</li>
<li><b>Apply Nyquist.</b> $\c{baud}{f_s} = 2 \times \c{bw}{f_{\max}} = 2 \times \c{bw}{200,000} = \c{baud}{400,000}$ samples/s.</li></ol>
<p>The interval is $\c{time}{T_s} = \frac{1}{\c{baud}{400,000}} = \c{time}{2.5\text{ µs}}$. Compare with slide 69: 200 kHz is 50 times 4 kHz, so the interval shrinks 50 times, from 125 µs to 2.5 µs. A faster signal means a faster sampler.</p>`,
            why: R`<p>Only one fact is needed: <b>for a low-pass signal the bandwidth <i>is</i> the highest frequency</b>. That is why this problem has an answer while the next one does not. It is the standard solving item for the sampling step.</p>
<p><b>Exam angle:</b> the answer is a rate in samples per second (400,000), not 200,000. Forgetting the factor 2 is the classic loss of marks.</p>`,
            example: { title: 'Low-pass signal with a 200 kHz bandwidth (slide 70)', gen: 'l03b.sampling', params: { kind: 'lowpass', fmax: 200e3 },
              slideAnswer: '400,000 samples per second', slideValue: 400e3, input: 'fs' } },

          { n: 71, title: 'Example 8: bandpass signal of 200 kHz (Sub-sec)',
            says: R`<p><b>Question:</b> “A complex bandpass signal has a bandwidth of 200 kHz. What is the minimum sampling rate for this signal?”</p>
<p><b>Solution:</b> “We cannot find the minimum sampling rate in this case because we do not know where the bandwidth starts or ends. We do not know the maximum frequency in the signal.” Handwritten: “Sub-sec”.</p>`,
            means: R`<p>Same 200 kHz as slide 70, opposite verdict. A bandpass signal's band can sit anywhere, and the Nyquist rate needs its <i>top edge</i>:</p>
<table class="tbl compact"><thead><tr><th>Where the 200 kHz band sits</th><th>$\c{bw}{f_{\max}}$</th><th>$2 \times \c{bw}{f_{\max}}$</th></tr></thead><tbody>
<tr><td>0 to 200 kHz (low-pass)</td><td>200 kHz</td><td>400,000 samples/s</td></tr>
<tr><td>200 to 400 kHz</td><td>400 kHz</td><td>800,000 samples/s</td></tr>
<tr><td>1.0 to 1.2 MHz</td><td>1.2 MHz</td><td>2,400,000 samples/s</td></tr>
<tr><td>10.0 to 10.2 MHz</td><td>10.2 MHz</td><td>20,400,000 samples/s</td></tr></tbody></table>
<p>The bandwidth is identical in every row but the answers differ wildly, so the bandwidth alone fixes nothing. The slide's answer is therefore not a number: <b>the minimum sampling rate cannot be determined</b>. If a question also gave $\c{bw}{f_{\min}}$ and $\c{bw}{f_{\max}}$, you would answer $2 \times \c{bw}{f_{\max}}$ (slide 67).</p>`,
            why: R`<p>This slide is the deliberate trap of the sampling section. An MCQ will offer “400,000 samples per second” as the tempting wrong answer, and an identification item may simply ask for the reason: the maximum frequency is unknown.</p>
<p>Summary of slides 69–71: <b>know f<sub>max</sub> and double it; if you know only B of a bandpass signal, say it cannot be determined</b>.</p>`,
            beyond: R`<p>Advanced “bandpass sampling” can sometimes use rates below 2 × f<sub>max</sub> when the band position is known. The course follows the slide rule, 2 × f<sub>max</sub>.</p>`,
            example: { title: 'Bandpass signal with a 200 kHz bandwidth (slide 71)', gen: 'l03b.sampling', params: { kind: 'bandpass-unknown', bandwidth: 200e3 },
              slideAnswer: 'cannot be determined — we do not know where the band starts or ends' } }
        ],
        together: R`<p><b>Step one of PCM in one picture.</b> A microphone signal is continuous in time and amplitude, so the encoder first cuts it into discrete instants, then (next part) discrete heights, then bits.</p>
<table class="tbl compact"><thead><tr><th>Problem</th><th>Idea</th><th>Mechanism</th><th>Rule or trade-off</th></tr></thead><tbody>
<tr><td>Infinitely many points in time</td><td>measure only at regular instants</td><td>sample every $\c{time}{T_s}$; ideal, natural or flat-top pulses form a PAM signal</td><td>$\c{baud}{f_s} = 1/\c{time}{T_s}$</td></tr>
<tr><td>How fast is fast enough?</td><td>two samples per cycle of the fastest component</td><td>filter first, then $\c{baud}{f_s} \ge 2 \times \c{bw}{f_{\max}}$</td><td>below it the samples show a false, slower wave; far above it is redundant</td></tr>
<tr><td>Which frequency?</td><td>the top edge of the spectrum</td><td>low-pass: $\c{bw}{f_{\max}} = \c{bw}{B}$; bandpass: use its upper edge</td><td>bandpass with only B known: cannot be determined</td></tr></tbody></table>
<p>Numbers to keep: voice 4 kHz gives 8000 samples/s ($\c{time}{T_s} = 125$ µs); low-pass 200 kHz gives 400,000 samples/s; bandpass 200 kHz gives no answer. The PAM pulses still have analog heights, so the signal is <i>not digital yet</i>. Slides 72–78 fix that: they map every height onto one of $\c{level}{L}$ allowed values (quantization) and write each as $\c{level}{n_b}$ bits.</p>` }

      ,
      /* ============ PART 2: quantization and encoding (slides 72–78) ============ */
      { title: 'Quantization and encoding: from heights to bits', slides: [72, 78],
        items: [
          { n: 72, title: 'Quantization (Sub-section)',
            says: R`<ul><li>Sampling results in a series of pulses of varying amplitude values ranging between two limits: a <b>min</b> and a <b>max</b>.</li>
<li>The amplitude values are infinite between the two limits.</li>
<li>We need to map the <i>infinite</i> amplitude values onto a finite set of known values.</li>
<li>This is achieved by dividing the distance between min and max into <b>L zones</b>, each of <b>height Δ</b>: <b>Δ = (max − min)/L</b>.</li></ul>
<p>Handwritten: “Sub-section” beside the title, and a blue loop around the Δ formula.</p>`,
            means: R`<p><b>The problem.</b> The PAM pulses from slide 64 can have any height between a lowest value (min) and a highest value (max). Between 2 V and 3 V alone there are infinitely many heights (2.5, 2.51, 2.5001 …). A code word with a fixed number of bits can name only a <i>finite</i> list of values, so we must shrink the infinite set to a short list.</p>
<p><b>The fix.</b> Choose how many allowed values you want, $\c{level}{L}$, and cut the range from min to max into $\c{level}{L}$ equal slices called <b>zones</b>. Every sample that falls in a zone will later be treated as the same value (slide 73). The height of one zone is the <b>zone height</b>:</p>
$$\Delta = \frac{V_{\max} - V_{\min}}{\c{level}{L}}$$
<p>Tiny example by hand: range 0 V to 8 V and $\c{level}{L} = 4$ gives $\Delta = \frac{8 - 0}{\c{level}{4}} = 2$ V, so the zones are 0–2, 2–4, 4–6 and 6–8 V. Slide 74 uses −20 V to +20 V and $\c{level}{L} = 8$, which gives $\Delta = \frac{20 - (-20)}{\c{level}{8}} = \frac{40}{8} = 5$ V.</p>
<p>Keep the two roles apart: $\Delta$ is a <i>size</i> (in volts), while $\c{level}{L}$ is a <i>count</i> (violet, like every level count in the course). More zones means smaller zones: doubling $\c{level}{L}$ halves $\Delta$.</p>`,
            why: R`<p>The loop around Δ = (max − min)/L marks the formula to memorise, and “Sub-section” marks the slides that follow (74 and 76) as sub-topics worth working through. Slide 73 says what a zone is replaced by, slide 74 puts numbers in, slide 75 turns zones into bits and slide 76 runs nine samples through the whole process.</p>
<p><b>Exam angle:</b> a solving item computes Δ for a given range and L. The usual errors are dividing by L − 1 (you are counting the slices, not the cut lines), forgetting that the span is max − min even when min is negative (20 − (−20) = 40, not 0), and mixing up Δ with L.</p>`,
            tip: R`<p>Δ = span ÷ number of zones. For a symmetric range ±V it is 2V ÷ L.</p>` },

          { n: 73, title: 'Quantization levels',
            says: R`<ul><li>The midpoint of each zone is assigned a value from 0 to L−1 (resulting in L values).</li>
<li>Each sample falling in a zone is then approximated to the value of the midpoint.</li></ul>`,
            means: R`<p>Slide 72 made $\c{level}{L}$ zones. This slide gives each zone two things.</p>
<ol><li><b>A label.</b> Zones are numbered from the bottom: zone 0 is the lowest, zone $\c{level}{L} - 1$ the highest. That gives exactly $\c{level}{L}$ labels, and these numbers become the binary codes of slide 75.</li>
<li><b>A representative value.</b> Every sample that lands in a zone is replaced by that zone's <b>midpoint</b>, the centre of the zone. This rounding is the actual act of quantizing.</li></ol>
<p>Using the tiny example of slide 72 (0 to 8 V, $\c{level}{L} = 4$, $\Delta = 2$ V) the midpoints are 1, 3, 5 and 7 V. A sample of 4.9 V is in zone 2 (4–6 V) and becomes 5 V. A sample of 5.1 V is also in zone 2 and also becomes 5 V. A sample of 3.1 V is in zone 1 and becomes 3 V. Two different samples (4.9 and 5.1) have become identical: that is information thrown away, but never by more than half a zone.</p>
<p>Keep three numbers apart, because exam questions ask for each of them:</p>
<table class="tbl compact"><thead><tr><th>Number</th><th>For the 4.9 V sample</th><th>Role</th></tr></thead><tbody>
<tr><td>actual sample (PAM height)</td><td>4.9 V</td><td>what was measured</td></tr>
<tr><td>zone number</td><td>2</td><td>becomes the code that is sent (slide 75)</td></tr>
<tr><td>zone midpoint (quantized value)</td><td>5 V</td><td>what the receiver will rebuild (slide 81)</td></tr></tbody></table>`,
            why: R`<p>This slide defines the two outputs of the Quantizing block: a <b>midpoint</b> that the decoder will rebuild, and a <b>zone number</b> that is transmitted. The gap between the actual sample and the midpoint is the quantization error of slide 77.</p>
<p><b>Exam angle:</b> typical mistakes are quantizing to a zone <i>edge</i> instead of the midpoint, numbering zones from 1 or from the top, and quoting the zone number when the question asks for the quantized value in volts.</p>` },

          { n: 74, title: 'Quantization zones',
            says: R`<ul><li>Assume a voltage signal with amplitudes V<sub>min</sub> = −20 V and V<sub>max</sub> = +20 V.</li>
<li>We want to use L = 8 quantization levels.</li>
<li>Zone width Δ = (20 − −20)/8 = 5.</li>
<li>The 8 zones are: −20 to −15, −15 to −10, −10 to −5, −5 to 0, 0 to +5, +5 to +10, +10 to +15, +15 to +20.</li>
<li>The midpoints are: −17.5, −12.5, −7.5, −2.5, 2.5, 7.5, 12.5, 17.5.</li></ul>
<p>A small handwritten hook sits beside the zones bullet.</p>`,
            means: R`<p>Rebuild the slide in four moves.</p>
<ol><li><b>Span.</b> $V_{\max} - V_{\min} = 20 - (-20) = 40$ V. (The slide's “20 − −20” means “20 minus minus 20”.)</li>
<li><b>Zone height.</b> $\Delta = \frac{40}{\c{level}{8}} = 5$ V.</li>
<li><b>Zones.</b> Start at the bottom, −20 V, and keep adding $\Delta = 5$ V. After 8 steps you arrive at the top, +20 V, as a check: $-20 + 8 \times 5 = 20$.</li>
<li><b>Midpoints.</b> The midpoint of a zone is its bottom edge plus $\Delta/2 = 2.5$ V, so −20 + 2.5 = −17.5, and so on. Consecutive midpoints are exactly $\Delta = 5$ V apart.</li></ol>
<table class="tbl compact"><thead><tr><th>Zone</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr></thead><tbody>
<tr><th>from (V)</th><td>−20</td><td>−15</td><td>−10</td><td>−5</td><td>0</td><td>+5</td><td>+10</td><td>+15</td></tr>
<tr><th>to (V)</th><td>−15</td><td>−10</td><td>−5</td><td>0</td><td>+5</td><td>+10</td><td>+15</td><td>+20</td></tr>
<tr><th>midpoint (V)</th><td>−17.5</td><td>−12.5</td><td>−7.5</td><td>−2.5</td><td>+2.5</td><td>+7.5</td><td>+12.5</td><td>+17.5</td></tr></tbody></table>
<p>Another range for practice: −8 V to +8 V with $\c{level}{L} = 4$ gives $\Delta = \frac{16}{4} = 4$ V, zones −8…−4, −4…0, 0…4, 4…8 and midpoints −6, −2, +2, +6 V.</p>`,
            why: R`<p>This is the concrete setting reused on slides 75 and 76: ±20 V, L = 8, Δ = 5 V. Memorising “zones every 5 V, midpoints ±2.5, ±7.5, ±12.5, ±17.5” lets you check the whole slide-76 table in your head. Slide 74 is also the model for a solving item in which only the numbers change.</p>
<p><b>Exam angle:</b> compute Δ, list the zones or midpoints. Watch the double minus sign, and do not forget that the zones are equal in height, so no calculation is needed beyond adding Δ repeatedly.</p>` },

          { n: 75, title: 'Assigning codes to zones',
            says: R`<ul><li>Each zone is then assigned a binary code.</li>
<li>The number of bits required to encode the zones, or the number of bits per sample, is n<sub>b</sub> = log<sub>2</sub> L.</li>
<li>Given our example, n<sub>b</sub> = 3.</li>
<li>The 8 zone (or level) codes are therefore: 000, 001, 010, 011, 100, 101, 110 and 111.</li>
<li>Assigning codes to zones: 000 refers to zone −20 to −15; 001 to zone −15 to −10, etc.</li></ul>`,
            means: R`<p>A group of $\c{level}{n_b}$ bits can be written in $2^{\c{level}{n_b}}$ different ways, and every zone needs its own pattern, so we need $2^{\c{level}{n_b}} \ge \c{level}{L}$. The smallest such $\c{level}{n_b}$ is the base-2 logarithm:</p>
$$\c{level}{n_b} = \log_2 \c{level}{L} \quad quad \text{here:} \quad \c{level}{n_b} = \log_2 \c{level}{8} = \c{level}{3} \quad \text{because } 2^3 = 8$$
<table class="tbl compact"><thead><tr><th>$\c{level}{L}$</th><td>2</td><td>4</td><td>8</td><td>16</td><td>64</td><td>256</td></tr></thead><tbody>
<tr><th>$\c{level}{n_b}$</th><td>1</td><td>2</td><td>3</td><td>4</td><td>6</td><td>8</td></tr></tbody></table>
<p>This is the same rule as “bits per level = log₂ L” from L02 (slide 14), now applied to quantization zones. The <b>code of a zone is its zone number written in binary</b> with exactly $\c{level}{n_b}$ digits: zone 0 is 000, zone 1 is 001, zone 2 is 010, zone 3 is 011, zone 4 is 100, zone 5 is 101, zone 6 is 110, zone 7 is 111. So 000 is the lowest zone (−20 to −15 V) and 111 the highest (+15 to +20 V).</p>
<p>Decoding works in reverse: the code 101 is zone 5, which covers +5 to +10 V, so the receiver rebuilds the midpoint +7.5 V.</p>`,
            why: R`<p>This is step 3 of PCM (binary encoding). The number $\c{level}{n_b}$ is the link to the data rate: every sample costs $\c{level}{n_b}$ bits, so the bit rate is $\c{rate}{N} = \c{level}{n_b} \times \c{baud}{f_s}$ (slide 79). Slide 76 then encodes real samples with the codes you have just listed.</p>
<p><b>Exam angle:</b> “how many bits per sample for L = 16?” (4) is a quick MCQ or identification item. Mistakes: writing $\c{level}{n_b} = L/2$ or $L$, forgetting that 3 bits give 8 levels (not 3), and numbering zones from the top so that 000 lands on the wrong end.</p>`,
            beyond: R`<p>If L is not a power of 2, round $n_b$ up to the next whole number (Forouzan). The slides always use powers of 2.</p>`,
            example: { title: 'Encode and decode with the slide-74 zones (derived from slides 74–75)',
              html: R`<table class="tbl compact"><thead><tr><th>Step</th><th>Question</th><th>Work</th><th>Result</th></tr></thead><tbody>
<tr><td>1</td><td>How many bits per sample?</td><td>$\c{level}{n_b} = \log_2 \c{level}{8}$</td><td>$\c{level}{3}$ bits</td></tr>
<tr><td>2</td><td>Encode a sample of +12 V: which zone?</td><td>(12 − (−20))/5 = 32/5 = 6.4, whole part 6</td><td>zone 6 (+10 to +15 V)</td></tr>
<tr><td>3</td><td>Its code</td><td>6 in binary on 3 digits</td><td><span class="mono">110</span></td></tr>
<tr><td>4</td><td>What does the receiver rebuild?</td><td>midpoint of zone 6 = 10 + 2.5</td><td>+12.5 V (error +0.5 V)</td></tr>
<tr><td>5</td><td>Decode the code <span class="mono">011</span></td><td>011 = 3, zone 3 covers −5 to 0 V</td><td>midpoint −2.5 V</td></tr></tbody></table>` } },

          { n: 76, title: 'Quantization and encoding of a sampled signal',
            says: R`<p>A figure with a table underneath. The vertical axis is “Normalized amplitude”, marked −4Δ … 0 … +4Δ (shown as D), with eight horizontal bands in alternating yellow and blue; the band codes <b>7</b> (top) down to <b>0</b> (bottom) are listed at the left as “Quantization codes”. Nine pink stems are drawn over time, labelled with the original amplitudes <b>−6.1, 7.5, 16.2, 19.7, 11.0, −5.5, −11.3, −9.4, −6.0</b>. The table, as printed:</p>
<table class="tbl compact"><tbody>
<tr><th>Normalized PAM values</th><td>−1.22</td><td>1.50</td><td>3.24</td><td>3.94</td><td>2.20</td><td>−1.10</td><td>−2.26</td><td>−1.88</td><td>−1.20</td></tr>
<tr><th>Normalized quantized values</th><td>−1.50</td><td>1.50</td><td>3.50</td><td>3.50</td><td>2.50</td><td>−1.50</td><td>−2.50</td><td>−1.50</td><td>−1.50</td></tr>
<tr><th>Normalized error</th><td>−0.38</td><td>0</td><td>+0.26</td><td>−0.44</td><td>+0.30</td><td>−0.40</td><td>−0.24</td><td>+0.38</td><td>−0.30</td></tr>
<tr><th>Quantization code</th><td>2</td><td>5</td><td>7</td><td>7</td><td>6</td><td>2</td><td>1</td><td>2</td><td>2</td></tr>
<tr><th>Encoded words</th><td>010</td><td>101</td><td>111</td><td>111</td><td>110</td><td>010</td><td>001</td><td>010</td><td>010</td></tr></tbody></table>`,
            means: R`<p>This slide runs the whole process on the ±20 V, L = 8 setting of slides 74–75, with $\Delta = 5$ V. <b>Normalized</b> means “divided by Δ”, so the axis counts in whole zones: a normalized value of −1.22 is 1.22 zones below zero. In these units zone $k$ spans from $k-4$ to $k-3$ and its midpoint is $k - 3.5$; for example code 2 covers −2 to −1 with midpoint −1.5.</p>
<p><b>Sample 1 (−6.1 V), step by step.</b></p>
<ol><li>Normalize: $-6.1 / 5 = -1.22$.</li>
<li>Find the zone: −1.22 lies between −2 and −1, so it is zone 2, code 2.</li>
<li>Quantized value: the midpoint, −1.50 (that is −7.5 V).</li>
<li>Error (quantized − actual): $-1.50 - (-1.22) = -0.28$, which is −1.4 V. The slide prints −0.38 here.</li>
<li>Encoded word: zone 2 on 3 bits is 010.</li></ol>
<p><b>Other samples.</b> 7.5 V normalizes to exactly 1.50, the centre of zone 5, so its error is 0 and its code is 101. 16.2 V gives 3.24, zone 7 (3 to 4), midpoint 3.50, error +0.26, code 111. 19.7 V gives 3.94, zone 7 again, error −0.44. That is the largest error in the table: 0.44 zones or 2.2 V, safely under the limit of half a zone (0.5, or 2.5 V; slides 77–78).</p>
<p>Four different voltages (−6.1, −5.5, −9.4 and −6.0 V) all end up in zone 2 and become −7.5 V. The transmitted bit stream for the nine samples is <span class="mono">010 101 111 111 110 010 001 010 010</span>: 27 bits, 3 per sample.</p>
<figure data-fig="l03b.quant" data-caption="Slide 76 redrawn from the zone calculation: stems are the normalized PAM values, dots are the quantized midpoints labelled with their 3-bit codes."></figure>`,
            why: R`<p>This is the busiest slide of the lecture and the template for a PCM solving item (the instructor marked PCM “Main Section 7”). The recipe in four moves: <b>normalize → find the zone → read the midpoint and code → subtract for the error</b>. Slide 77 explains what the error means and slide 79 turns the 3 bits per sample into a bit rate.</p>
<p><b>Exam angle:</b> “give the code word and quantized value of a sample”. The classic traps are the zone of a <i>negative</i> value, mixing up the code (a zone number) with the quantized value (a voltage), and the sign of the error.</p>`,
            tip: R`<p>For a negative value such as −1.22, “round down” means towards <i>more negative</i>: it lies between −2 and −1, so its zone is the one whose lower edge is −2. Without normalizing, zone = whole part of (sample − min)/Δ = (−6.1 + 20)/5 = 2.78, so 2.</p>`,
            error: { says: 'First normalized error −0.38.', correct: '−1.50 − (−1.22) = −0.28 (= −1.4 V for the 5 V zone). Every other cell checks out.' },
            example: { title: 'Quantize −6.1 V, the first sample of slide 76', gen: 'l03b.quant', params: { vmax: 20, L: 8, value: -6.1 },
              slideAnswer: 'zone 2 → code 010, quantized −7.5 V (normalized −1.50), error −1.4 V (normalized −0.28)', slideValue: -7.5, input: 'mid' } },

          { n: 77, title: 'Quantization error',
            says: R`<ul><li>When a signal is quantized we introduce an error: the coded signal is an approximation of the actual amplitude value.</li>
<li>The difference between actual and coded value (midpoint) is referred to as the <b>quantization error</b>.</li>
<li>The more zones, the smaller Δ, which results in smaller errors.</li>
<li>BUT, the more zones the more bits required to encode the samples → higher bit rate.</li></ul>`,
            means: R`<p>The receiver only ever sees the midpoint, never the true sample, so a small error is built in. How big can it be? A sample sits somewhere inside a zone of height $\Delta$ and is replaced by the centre, so it is at most half a zone away:</p>
$$|\text{error}| \le \frac{\Delta}{2}$$
<p>With $\Delta = 5$ V that is 2.5 V. On slide 76 the worst case was 0.44 zones, which is 2.2 V. The error can never be removed, only made smaller.</p>
<p><b>The trade-off.</b> A smaller $\Delta$ needs more zones, and more zones need more bits per sample, $\c{level}{n_b} = \log_2 \c{level}{L}$. Take the ±20 V range of slide 74 and sampling at 8000 samples/s:</p>
<table class="tbl compact"><thead><tr><th>$\c{level}{L}$</th><th>$\c{level}{n_b}$</th><th>$\Delta$</th><th>largest error</th><th>$\c{rate}{N} = \c{level}{n_b} \times \c{baud}{8000}$</th></tr></thead><tbody>
<tr><td>8</td><td>3</td><td>5 V</td><td>2.5 V</td><td>24 kbps</td></tr>
<tr><td>16</td><td>4</td><td>2.5 V</td><td>1.25 V</td><td>32 kbps</td></tr>
<tr><td>32</td><td>5</td><td>1.25 V</td><td>0.625 V</td><td>40 kbps</td></tr></tbody></table>
<p>Every doubling of $\c{level}{L}$ halves the error but adds only <i>one</i> bit per sample.</p>
<p>Sign: slide 76's table computes quantized minus actual, while this slide's wording says “actual and coded”. State which sign you use; the size is what matters.</p>`,
            why: R`<p>This is the central trade-off of PCM: <b>accuracy against bit rate</b>. It is the likely point of an essay (“what happens when the number of quantization levels is increased?”): the error shrinks (Δ falls), n<sub>b</sub> rises by log₂ of the increase, so the bit rate and, via slide 83, the bandwidth rise too.</p>
<p>Slide 78 shows that the <i>fixed</i> size of this error is a problem for weak signals. <b>Exam angle:</b> identification of “quantization error” from its description; the bound Δ/2; the sign convention. Mistakes: believing more bits remove the error entirely, or that the error can reach a full Δ.</p>`,
            error: { says: 'Quantization error is “the difference between actual and coded value”.',
              correct: 'The slide-76 table uses quantized minus actual (3.24 → 3.50 gives +0.26). Either sign is acceptable if you state it; in both cases |error| ≤ Δ/2.' } },

          { n: 78, title: 'Quantization error and SNQR',
            says: R`<ul><li>Signals with lower amplitude values will suffer more from quantization error as the error range Δ/2 is fixed for all signal levels.</li>
<li>Non-linear quantization is used to alleviate this problem. The goal is to keep SN<sub>Q</sub>R fixed for all sample values.</li>
<li>Two approaches:<ul><li>The quantization levels follow a logarithmic curve: smaller Δ’s at lower amplitudes and larger Δ’s at higher amplitudes.</li>
<li><b>Companding</b>: the sample values are compressed at the sender into logarithmic zones, and then expanded at the receiver. The zones are fixed in height.</li></ul></li></ul>`,
            means: R`<p><b>SNQR</b> is the signal-to-quantization-noise ratio: the same idea as the SNR of L02, but the “noise” is the quantization error. It is large when the error is small compared with the signal.</p>
<p><b>Why low amplitudes suffer.</b> The error can be up to $\Delta/2$ <i>whatever</i> the sample size. With $\Delta = 5$ V the error is up to 2.5 V. On a 20 V sample that is a worst case of 2.5/20 = 12.5%; on a 5 V sample it is 2.5/5 = 50%. The same absolute error ruins a quiet sample far more than a loud one, so quiet signals have a worse SNQR.</p>
<p><b>The goal</b> is a fixed SNQR for every sample value. The error should therefore be roughly proportional to the amplitude: small zones near zero, big zones for big amplitudes. Two ways to get it:</p>
<ol><li><b>Non-linear quantization.</b> The zone boundaries themselves follow a logarithmic curve, so $\Delta$ is small at low amplitudes and large at high ones. (A mental picture, not from the slide: edges at 0, 1, 2, 4, 8, 16 V, each zone twice as wide as the one before.)</li>
<li><b>Companding</b> (compress + expand). The sender first passes the samples through a logarithmic curve that stretches small values and squeezes large ones, then quantizes with ordinary equal-height zones (“the zones are fixed in height”). The receiver applies the inverse curve to expand the values back. The end result is the same as the first approach, built from simpler parts.</li></ol>`,
            why: R`<p>Slides 77 and 78 are the conceptual half of quantization, and they feed MCQ, identification and essay items: <b>which technique keeps SNQR constant</b> (non-linear quantization), <b>what is companding</b> (compress at the sender, expand at the receiver), <b>why do low-amplitude signals suffer more</b> (the error range is fixed). There is no SNQR formula in the deck.</p>
<p>Mistakes: thinking companding adds bits, thinking it is done only at the receiver, or believing non-linear quantization changes the number of zones L. From here the lecture leaves quantization and counts bits per second (slide 79).</p>`,
            beyond: R`<p>A rule of thumb from the textbook (Forouzan): $\c{snr}{SNQR_{\text{dB}}} \approx 6.02\,\c{level}{n_b} + 1.76$. Each extra bit per sample adds about 6 dB.</p>` }
        ],
        together: R`<p><b>Quantization and encoding in one picture.</b> Sampling left us with heights that can take infinitely many values. Quantizing squeezes them into $\c{level}{L}$ equal zones, and encoding writes each zone number in binary.</p>
<table class="tbl compact"><thead><tr><th>Problem</th><th>Idea</th><th>Mechanism</th><th>Trade-off</th></tr></thead><tbody>
<tr><td>Infinitely many heights</td><td>a finite list of allowed values</td><td>$\Delta = \frac{V_{\max} - V_{\min}}{\c{level}{L}}$; every sample becomes its zone midpoint</td><td>error up to $\Delta/2$</td></tr>
<tr><td>The values must become bits</td><td>number the zones</td><td>$\c{level}{n_b} = \log_2 \c{level}{L}$; code = zone number in binary</td><td>more zones, more bits per sample</td></tr>
<tr><td>Quiet signals are hurt most</td><td>smaller zones where the signal is small</td><td>non-linear quantization or companding (compress, then expand)</td><td>more complex hardware</td></tr></tbody></table>
<p>The recipe on slide 76: normalize, find the zone (round down), read midpoint and code, subtract for the error. With ±20 V and $\c{level}{L} = 8$: $\Delta = 5$ V, 3 bits per sample, and −6.1 V becomes zone 2, code 010, −7.5 V, error −1.4 V.</p>
<p>We now know how many bits <i>each sample</i> costs. The next part multiplies by the samples per second to get the PCM <b>bit rate</b>, then asks what bandwidth that bit stream needs and how the receiver turns it back into an analog signal.</p>` }

      ,
      /* ============ PART 3: PCM bit rate, bandwidth and the decoder (slides 79–83) ============ */
      { title: 'PCM bit rate, bandwidth and the decoder', slides: [79, 83],
        items: [
          { n: 79, title: 'Bit rate and bandwidth requirements of PCM',
            says: R`<ul><li>The bit rate of a PCM signal is calculated from the number of bits per sample × the sampling rate: <b>Bit rate = n<sub>b</sub> × f<sub>s</sub></b>.</li>
<li>The bandwidth required to transmit this signal depends on the type of line encoding used. “Refer to previous section for discussion and formulas.”</li>
<li>A digitized signal will always need more bandwidth than the original analog signal. “Price we pay for robustness and other features of digital transmission.”</li></ul>`,
            means: R`<p><b>Bit rate.</b> Each sample is written with $\c{level}{n_b}$ bits and $\c{baud}{f_s}$ samples are produced every second, so $\c{baud}{f_s} \times \c{level}{n_b}$ bits leave the encoder per second. Units: (bits per sample) × (samples per second) = bits per second.</p>
$$\c{rate}{N} = \c{level}{n_b} \times \c{baud}{f_s}$$
<p>For example, $\c{level}{n_b} = \c{level}{4}$ bits per sample at $\c{baud}{f_s} = \c{baud}{10,000}$ samples/s gives $\c{rate}{N} = \c{level}{4} \times \c{baud}{10,000} = \c{rate}{40,000}$ bps.</p>
<p><b>Bandwidth.</b> A stream of bits is not yet a signal: it still has to go through a <i>line code</i> (slides 18–61), and the bandwidth depends on which one. “The previous section” gave the course formulas: the minimum bandwidth equals the signal rate (slide 25), and the signal rate is $\c{baud}{S} = c \times \c{rate}{N} \times \frac{1}{\c{level}{r}}$ (slide 8):</p>
$$\c{bw}{B_{\min}} = \c{baud}{S} = c \times \c{rate}{N} \times \frac{1}{\c{level}{r}}$$
<p>For an NRZ-type code, $c = \frac{1}{2}$ and $\c{level}{r} = 1$, so $\c{bw}{B_{\min}} = \frac{\c{rate}{N}}{2}$. A Manchester-type (biphase) code needs about $\c{rate}{N}$ (slide 46): the same bits, twice the bandwidth.</p>
<p><b>The price.</b> Whatever the code, the digitized signal needs more bandwidth than the analog signal did: slide 83 will show 4 kHz becoming 32 kHz. We accept this because a digital signal can be regenerated cleanly, which is the robustness the slide mentions.</p>`,
            why: R`<p>This slide sets up the two numbers that slides 80 and 83 compute: the bit rate $\c{rate}{N}$ (blue) and the minimum bandwidth $\c{bw}{B_{\min}}$ (green). Everything you learnt about sampling ($\c{baud}{f_s}$) and quantizing ($\c{level}{n_b}$) feeds the first formula, and everything from line coding (c and r) feeds the second.</p>
<p><b>Exam angle:</b> a solving item chains f<sub>s</sub> → N → B. MCQ: “a digitized signal needs more / less / the same bandwidth than the analog one” (more). Mistakes: forgetting that the bandwidth depends on the line code, and treating N in bps as if it were already a bandwidth in Hz.</p>` },

          { n: 80, title: 'Example 9: bit rate of digitized voice (Subsection)',
            says: R`<p><b>Question:</b> “We want to digitize the human voice. What is the bit rate, assuming 8 bits per sample?”</p>
<p><b>Solution:</b> “The human voice normally contains frequencies from 0 to 4000 Hz. So the sampling rate and bit rate are calculated as follows:” and, in a framed box: <b>Sampling rate = 4000 × 2 = 8000 samples/s</b> and <b>Bit rate = 8000 × 8 = 64,000 bps = 64 kbps</b>. Handwritten: “Subsection”.</p>`,
            means: R`<p>Four short steps, each with its own colour, so you can follow every number:</p>
<ol><li><b>Highest frequency.</b> Voice is a low-pass signal from 0 to 4000 Hz, so $\c{bw}{f_{\max}} = \c{bw}{4000}$ Hz.</li>
<li><b>Sampling rate (Nyquist).</b> $\c{baud}{f_s} = 2 \times \c{bw}{f_{\max}} = 2 \times \c{bw}{4000} = \c{baud}{8000}$ samples/s.</li>
<li><b>Bits per sample.</b> Given: $\c{level}{n_b} = \c{level}{8}$. (That means $\c{level}{L} = 2^8 = 256$ zones, an implication the slide does not spell out.)</li>
<li><b>Bit rate.</b> $\c{rate}{N} = \c{level}{n_b} \times \c{baud}{f_s} = \c{level}{8} \times \c{baud}{8000} = \c{rate}{64,000}$ bps $= \c{rate}{64}$ kbps.</li></ol>
<p>Cross-check with the sampling interval: $\c{time}{T_s} = 125$ µs, and 8 bits every 125 µs is $\frac{8}{125\text{ µs}} = 64,000$ bps. Scaling is easy in your head: 4 bits per sample would give 32 kbps, and 10 bits per sample 80 kbps. The sampling rate only changes if the highest frequency changes.</p>`,
            why: R`<p>This is the model PCM problem, in a lecture part the instructor marked “Main Section 7” with this example as a “Subsection”. It chains two formulas you already know ($\c{baud}{f_s} = 2\,\c{bw}{f_{\max}}$ from slide 66 and $\c{rate}{N} = \c{level}{n_b}\,\c{baud}{f_s}$ from slide 79); slide 83 adds the third, the bandwidth.</p>
<p><b>Exam angle:</b> solving with other numbers (another f<sub>max</sub>, or L given instead of n<sub>b</sub>, which needs one extra step n<sub>b</sub> = log₂L). Mistakes: forgetting the factor 2 (4000 × 8 = 32 kbps is wrong), and writing the answer in the wrong unit.</p>`,
            beyond: R`<p>64 kbps is the classic digital telephone channel (often called DS0).</p>`,
            example: { title: 'Digitized voice: sampling rate, bit rate and bandwidth', gen: 'l03b.pcm', params: { fmax: 4000, nb: 8 },
              slideAnswer: '8000 samples/s; 64 kbps (slide 80); minimum bandwidth 32 kHz (slide 83)', slideValue: 64000, input: 'N' } },

          { n: 81, title: 'PCM decoder',
            says: R`<ul><li>To recover an analog signal from a digitized signal we follow these steps:<ul>
<li>We use a <b>hold circuit</b> that holds the amplitude value of a pulse till the next pulse arrives.</li>
<li>We pass this signal through a <b>low-pass filter</b> with a cutoff frequency that is equal to the highest frequency in the pre-sampled signal.</li></ul></li>
<li>The higher the value of L, the less distorted a signal is recovered.</li></ul>`,
            means: R`<p>The <b>PCM decoder</b> undoes the encoder at the receiving end. Before the two steps on the slide, the received bits are cut into groups of $\c{level}{n_b}$, and each group is turned back into its zone midpoint (slide 75 in reverse). Then:</p>
<ol><li><b>Hold circuit.</b> It keeps each pulse's amplitude steady until the next pulse arrives. Joining the held values gives a <b>staircase</b>: flat steps whose heights are the midpoints. (It is the same idea as flat-top sampling, slide 65 c.)</li>
<li><b>Low-pass filter.</b> A <b>low-pass filter</b> lets frequencies below a <b>cutoff</b> pass and blocks those above it. The staircase has sharp corners, and sharp corners contain high frequencies that the original did not have. The slide sets the cutoff to the highest frequency of the <b>pre-sampled</b> signal, that is, $\c{bw}{f_{\max}}$ (4000 Hz for voice): everything the original contained survives, everything above it, which can only be an artefact, is removed. The result is a smooth curve.</li></ol>
<p>The last bullet ties this to slide 77: a larger $\c{level}{L}$ means a smaller $\Delta$, so the staircase hugs the original more closely and the recovered signal is less distorted. It never becomes perfect, because the quantization error cannot be recovered.</p>`,
            why: R`<p>This is the receiving half of Main Section 7. It reuses ideas from the encoder (midpoints, flat-top holding) and from earlier lectures (a low-pass filter passes 0 up to a cutoff, as in L02). Slide 82 draws the same two steps as a block diagram.</p>
<p><b>Exam angle:</b> identification (“the circuit that holds a pulse's amplitude until the next arrives” is the hold circuit); MCQ on the filter's cutoff (the highest frequency of the original signal); essay (“describe how a PCM signal is turned back into analog”). Mistakes: setting the cutoff at the sampling rate, or thinking the filter restores the exact original.</p>` },

          { n: 82, title: 'Figure 4.27: components of a PCM decoder',
            says: R`<p>A block diagram titled “Figure 4.27 Components of a PCM decoder”. <b>Digital data</b> <span class="mono">11 ⋯ 1100</span> enters a box labelled <b>PCM decoder</b> that holds two blocks: <b>Make and connect samples</b> (yellow) followed by <b>Low-pass filter</b> (yellow). Above the first block's output is a plot of a pink <b>staircase</b> waveform (Amplitude against Time). The output on the right is a smooth <b>Analog signal</b> curve. (The corner label “4.82” is a textbook page number.)</p>`,
            means: R`<p>Read the diagram from left to right:</p>
<ol><li><b>Digital data</b> arrives as bits.</li>
<li><b>Make and connect samples:</b> two jobs in one box. “Make” rebuilds one sample per code word (each code is replaced by its zone midpoint); “connect” holds each value until the next, which is slide 81's hold circuit. Its output is the staircase plotted above the box.</li>
<li><b>Low-pass filter:</b> removes the corners (frequencies above $\c{bw}{f_{\max}}$) and outputs a smooth analog signal.</li></ol>
<p>A quick run with the codes of slide 76, <span class="mono">010 101 111 111 110 010 001 010 010</span>: the decoded midpoints are −7.5, +7.5, +17.5, +17.5, +12.5, −7.5, −12.5, −7.5, −7.5 V, to be compared with the original samples −6.1, 7.5, 16.2, 19.7, 11.0, −5.5, −11.3, −9.4, −6.0 V. Holding these values gives the staircase; the filter rounds off its corners. Notice that the decoded values are close but not equal to the originals: that gap is the quantization error.</p>
<table class="tbl compact"><thead><tr><th>Encoder (slide 63)</th><th>Decoder (slide 82)</th></tr></thead><tbody>
<tr><td>analog signal in</td><td>analog signal out</td></tr>
<tr><td>sampling → PAM pulses</td><td>low-pass filter smooths the staircase</td></tr>
<tr><td>quantizing → heights on a grid</td><td>make and connect samples → staircase</td></tr>
<tr><td>encoding → bits out</td><td>bits in</td></tr></tbody></table>`,
            why: R`<p>Slide 63 is the encoder, this slide is its mirror. A drawing or essay item may ask for either block diagram, so practise both, with the signal sketched at every point (staircase before the filter, smooth curve after).</p>
<p>The box is called “Make and connect samples” here and “hold circuit” on slide 81; they are the same stage, so quote both names if the question words it either way. <b>Mistake to avoid:</b> putting the filter before the staircase maker, or omitting the filter altogether.</p>` },

          { n: 83, title: 'Example 10: bandwidth of digitized voice',
            says: R`<p>“We have a low-pass analog signal of 4 kHz. If we send the analog signal, we need a channel with a minimum bandwidth of 4 kHz. If we digitize the signal and send 8 bits per sample, we need a channel with a minimum bandwidth of 8 × 4 kHz = 32 kHz.”</p>`,
            means: R`<p>Compare the two ways of sending the same voice signal:</p>
<ul><li><b>As an analog signal:</b> a low-pass signal needs a channel as wide as its highest frequency, $\c{bw}{B} = \c{bw}{f_{\max}} = \c{bw}{4\text{ kHz}}$.</li>
<li><b>As PCM with 8 bits per sample:</b> the slide multiplies bits per sample by the highest frequency:</li></ul>
$$\c{bw}{B_{\min}} = \c{level}{n_b} \times \c{bw}{f_{\max}} = \c{level}{8} \times \c{bw}{4\text{ kHz}} = \c{bw}{32\text{ kHz}}$$
<p><b>Why that product works.</b> It is the line-code formula of slide 79 for an NRZ-type code ($c = \frac{1}{2}$, $\c{level}{r} = 1$; the slide itself does not state this assumption):</p>
$$\c{bw}{B_{\min}} = \frac{\c{rate}{N}}{2} = \frac{\c{level}{n_b} \times \c{baud}{f_s}}{2} = \frac{\c{level}{n_b} \times 2 \times \c{bw}{f_{\max}}}{2} = \c{level}{n_b} \times \c{bw}{f_{\max}}$$
<p>With numbers: $\c{rate}{N} = 64$ kbps from slide 80, and half of that is 32 kHz. Digitizing multiplied the bandwidth by $\c{level}{n_b} = 8$. With a biphase code (needs about N, slide 46) it would be 64 kHz.</p>`,
            why: R`<p>This is the “price we pay” of slide 79 turned into a number: <b>digital costs bandwidth</b>, in proportion to the bits per sample. It completes the three-formula PCM chain: $\c{baud}{f_s} = 2\,\c{bw}{f_{\max}}$, then $\c{rate}{N} = \c{level}{n_b}\,\c{baud}{f_s}$, then $\c{bw}{B_{\min}} = \c{level}{n_b}\,\c{bw}{f_{\max}}$.</p>
<p><b>Exam angle:</b> compute the minimum bandwidth for given n<sub>b</sub> and f<sub>max</sub>; MCQ “how does the bandwidth change after digitizing?” (it grows). Mistakes: answering 4 kHz, adding (8 + 4) instead of multiplying, or applying N/2 to a code that is not NRZ-type.</p>`,
            example: { title: 'Analog 4 kHz versus digitized voice (slide 83)',
              html: R`<table class="tbl compact"><thead><tr><th>Step</th><th>What we find</th><th>Work (colour = unit)</th><th>Result</th></tr></thead><tbody>
<tr><td>1</td><td>Channel for the analog signal</td><td>low-pass: $\c{bw}{B} = \c{bw}{f_{\max}}$</td><td>$\c{bw}{4}$ kHz</td></tr>
<tr><td>2</td><td>Sampling rate</td><td>$\c{baud}{f_s} = 2 \times \c{bw}{4000}$</td><td>$\c{baud}{8000}$ samples/s</td></tr>
<tr><td>3</td><td>Bit rate with 8 bits per sample</td><td>$\c{rate}{N} = \c{level}{8} \times \c{baud}{8000}$</td><td>$\c{rate}{64}$ kbps</td></tr>
<tr><td>4</td><td>Minimum bandwidth (NRZ-type: N/2)</td><td>$\c{bw}{B_{\min}} = \frac{\c{rate}{64}}{2}$ kHz = $\c{level}{8} \times \c{bw}{4}$ kHz</td><td>$\c{bw}{32}$ kHz</td></tr>
<tr><td>5</td><td>How much more than analog?</td><td>$\frac{\c{bw}{32}}{\c{bw}{4}}$</td><td>8 times (= n<sub>b</sub>)</td></tr></tbody></table>` } }
        ],
        together: R`<p><b>PCM numbers in one picture.</b> Sampling fixed how many samples per second, quantizing fixed how many bits per sample. Multiply them for the bit rate; halve it (NRZ-type line code) for the bandwidth; reverse the whole thing with a hold circuit and a low-pass filter.</p>
<table class="tbl compact"><thead><tr><th>Quantity</th><th>Formula</th><th>Voice example</th></tr></thead><tbody>
<tr><td>sampling rate</td><td>$\c{baud}{f_s} = 2 \times \c{bw}{f_{\max}}$</td><td>$2 \times \c{bw}{4000} = \c{baud}{8000}$ samples/s</td></tr>
<tr><td>bit rate</td><td>$\c{rate}{N} = \c{level}{n_b} \times \c{baud}{f_s}$</td><td>$\c{level}{8} \times \c{baud}{8000} = \c{rate}{64}$ kbps</td></tr>
<tr><td>minimum bandwidth</td><td>$\c{bw}{B_{\min}} = \c{level}{n_b} \times \c{bw}{f_{\max}} = \frac{\c{rate}{N}}{2}$</td><td>$\c{level}{8} \times \c{bw}{4}$ kHz $= \c{bw}{32}$ kHz</td></tr></tbody></table>
<p>The trade-off is clear: more levels give less distortion on the decoder side (slide 81) but cost bits per sample, and every extra bit raises both the bit rate and the bandwidth. Digitizing always widens the channel (4 kHz became 32 kHz); in exchange we get a signal that can be regenerated cleanly.</p>
<p>PCM sends a full $\c{level}{n_b}$-bit number for every sample. The next part asks whether we can get away with sending <i>much less</i> per sample: delta modulation sends just one bit, telling the receiver whether to step up or down.</p>` }

      ,
      /* ============ PART 4: delta modulation and DPCM (slides 84–88) ============ */
      { title: 'Delta modulation and DPCM: sending only the change', slides: [84, 88],
        items: [
          { n: 84, title: 'Delta modulation',
            says: R`<ul><li>This scheme sends only the <b>difference</b> between pulses: if the pulse at time t<sub>n+1</sub> is higher in amplitude than the pulse at time t<sub>n</sub>, a single bit, say a “1”, is used to indicate the positive value.</li>
<li>If the pulse is lower in value, resulting in a negative value, a “0” is used.</li>
<li>This scheme works well for small changes in signal values between samples.</li>
<li>If changes in amplitude are large, this will result in large errors.</li></ul>`,
            means: R`<p>PCM (slides 62–83) sends the full height of every sample, using $\c{level}{n_b}$ bits each time. <b>Delta modulation (DM)</b> takes a much cheaper route: for each new sample it sends <b>one bit</b>, saying only whether the signal went <i>up</i> (1) or <i>down</i> (0). “Delta” is the Greek letter for a change.</p>
<p>The slide states the rule as a comparison of two pulses, t<sub>n+1</sub> against t<sub>n</sub>. In the next slide's figure the comparison is made against a <b>staircase</b> that the receiver can rebuild: bit 1 moves the staircase <b>up</b> by one step $\delta$, bit 0 moves it <b>down</b> by $\delta$. The two readings agree as long as the staircase keeps up with the signal.</p>
<p>Tiny example with $\delta = 1$: the staircase stands at 5. The next sample is 5.4, higher, so send <b>1</b> and the staircase goes to 6. The next sample is 5.2, lower than 6, so send <b>0</b> and the staircase returns to 5. The slide does not say what to do on an exact tie; the kit treats “not higher” as 0.</p>
<p><b>Why large changes give large errors.</b> The staircase can move only $\delta$ per sampling interval. If the signal leaps by 3$\delta$ in one interval, the staircase needs three intervals to catch up and, meanwhile, the receiver's copy is wrong by up to 3$\delta$. DM is therefore good for slow, smooth signals only.</p>
<p><b>Cost.</b> One bit per sample means $\c{level}{n_b} = 1$, so $\c{rate}{N} = \c{level}{1} \times \c{baud}{f_s}$: at 8000 samples/s that is 8 kbps, against 64 kbps for 8-bit PCM at the same sampling rate.</p>`,
            why: R`<p>This opens the second way of digitizing an analog signal. Slides 85–87 show the staircase picture and the circuits, and slide 88 adds the middle road, DPCM. The accuracy-against-bit-rate trade-off of slide 77 appears again in a new form: DM is the cheapest per sample but the least able to follow fast signals.</p>
<p><b>Exam angle:</b> identification (“sends only the difference, using one bit” is delta modulation), MCQ on when DM works well (small changes between samples) and when it fails (large changes). Mistakes: reading the bit as the voltage instead of the direction, and forgetting the staircase moves by a <i>fixed</i> step.</p>` },

          { n: 85, title: 'The process of delta modulation',
            says: R`<p>A figure on a grid. A smooth pink <b>analog signal</b> rises to a peak, falls to a trough and rises slightly. A black <b>staircase</b> follows it with steps of height <b>d</b> (vertical marker on the left) and width <b>T</b> (marker at the top). Under the plot a row labelled <b>Generated binary data</b> reads:</p>
<p class="mono">0 1 1 1 1 1 1 0 0 0 0 0 0 1 1</p>
<p>The staircase climbs six steps while the signal rises, overshoots the peak slightly, steps down six times as the signal falls, then climbs two steps at the end.</p>`,
            means: R`<p>How to read the figure: the pink curve is what we want to send; the black staircase is what the receiver would rebuild from the bits so far. The grid squares are one step $\delta$ high (the slide's “d”) and one interval $T$ wide ($T = 1/\c{baud}{f_s}$). Each bit sits under the step it produces: <b>1 = that step goes up by one $\delta$, 0 = it goes down by one $\delta$</b>.</p>
<ol><li><b>Bit 1 is 0.</b> The staircase moves down to its lowest step (the slide shows no earlier step, so its starting level is one step higher).</li>
<li><b>Bits 2–7 are 1 1 1 1 1 1.</b> The signal climbs fast and the staircase sits below it, so every interval says “up”. Six steps up.</li>
<li><b>Bits 8–13 are 0 0 0 0 0 0.</b> Near the peak the staircase passes the curve and ends up above the signal, so the answer flips to “down”, and it stays “down” through six steps while the signal falls to its trough.</li>
<li><b>Bits 14–15 are 1 1.</b> The signal flattens and turns up; the staircase is now below it again, so two steps up.</li></ol>
<p>Fifteen intervals, fifteen bits: $0\,111111\,000000\,11$. PCM with 3 bits per sample would need 45 bits for the same 15 samples. The receiver reverses the rule (1 = up, 0 = down) to rebuild the staircase, and a low-pass filter (slide 87) smooths it.</p>
<figure data-fig="l03b.dm" data-caption="The slide-85 staircase rebuilt from its generated bits 0 1 1 1 1 1 1 0 0 0 0 0 0 1 1: one step down, six up, six down, two up."></figure>`,
            why: R`<p>This is the DM equivalent of slide 76: the picture to practise on. Two kinds of item follow from it: <b>solving</b> (given sample values, the step size and a starting level, write the bits and the final staircase value) and <b>drawing</b> (given bits, draw the staircase). The rule is: <b>staircase below the signal → 1 and step up; otherwise 0 and step down</b>.</p>
<p>Mistakes: comparing each sample with the previous <i>sample</i> instead of with the staircase (they differ whenever the staircase lags behind), forgetting to move the staircase after each bit, and drawing steps of unequal size. Slide 86 shows the circuit that makes the staircase.</p>`,
            example: { title: 'Delta-modulation bits for a sample sequence (slide 85 pattern)', gen: 'l03b.dm',
              params: { start: 2, delta: 1, samples: [1.6, 1.8, 2.5, 3.6, 4.5, 5.5, 6.3, 6.4, 5.6, 4.4, 3.5, 2.6, 1.8, 1.4, 2.3] },
              slideAnswer: '011111100000011 — the slide gives no sample values; these were chosen to reproduce its generated bits' } },

          { n: 86, title: 'Delta modulation components',
            says: R`<p>A block diagram of the <b>DM modulator</b>. An <b>Analog signal</b> plot enters a box that contains three blocks: a <b>Comparator</b> (yellow), a <b>Staircase maker</b> (green) and a <b>Delay unit</b> (light blue). The Comparator's output leaves the box as <b>Digital data</b> <span class="mono">11 ⋯ 1100</span> and also runs down into the Staircase maker. The Staircase maker feeds the Delay unit, and a loop from the Delay unit runs back to the Comparator (and into the Staircase maker).</p>`,
            means: R`<p>The modulator is a <b>feedback loop</b> that builds, inside the transmitter, the very staircase the receiver will build.</p>
<table class="tbl compact"><thead><tr><th>Block</th><th>Job</th></tr></thead><tbody>
<tr><td><b>Comparator</b></td><td>compares the incoming analog sample with the staircase value coming round the loop; outputs <b>1</b> if the signal is higher, otherwise <b>0</b></td></tr>
<tr><td><b>Staircase maker</b></td><td>takes that bit and makes the next staircase level: the previous level plus $\delta$ for a 1, minus $\delta$ for a 0</td></tr>
<tr><td><b>Delay unit</b></td><td>holds the staircase level for one interval $T$, so the next sample is compared with the <i>previous</i> level</td></tr></tbody></table>
<p>One trip round the loop, for each sample:</p>
<ol><li>The analog sample reaches the comparator.</li>
<li>The comparator compares it with the delayed staircase and outputs one bit. That bit leaves as digital data <i>and</i> goes to the staircase maker.</li>
<li>The staircase maker moves the level by $\pm\delta$; the delay unit stores the new level and feeds it back for the next sample.</li></ol>
<p>The delay unit is the circuit's one-step memory: without it the comparator would have nothing to compare the new sample against.</p>`,
            why: R`<p>This answers “how is the staircase of slide 85 produced?”. The comparator is the only block that looks at the analog input; the staircase maker and delay unit simply follow the bits, so the receiver can repeat them (slide 87).</p>
<p><b>Exam angle:</b> an identification or labelling item (name the three blocks and say what each does), or an essay that draws the modulator. The mistake to avoid is drawing a one-way chain: the feedback loop through the delay unit is the heart of the circuit.</p>` },

          { n: 87, title: 'Delta demodulation components',
            says: R`<p>A block diagram of the <b>DM demodulator</b>. <b>Digital data</b> <span class="mono">11 ⋯ 1100</span> enters the <b>Staircase maker</b> (green), whose output goes to a <b>Low-pass filter</b> (yellow) and then out as an <b>Analog signal</b> curve. A <b>Delay unit</b> (light blue) sits below: the Staircase maker's output also goes to the Delay unit, and the Delay unit feeds back into the Staircase maker.</p>`,
            means: R`<p>The receiver has no comparator, because the bits already carry the decisions:</p>
<ol><li>Each arriving bit goes to the <b>staircase maker</b>.</li>
<li>The maker adds $+\delta$ for a 1 or $-\delta$ for a 0 to the previous level, which the <b>delay unit</b> supplies by remembering the last output for one interval.</li>
<li>The resulting staircase passes through a <b>low-pass filter</b> that smooths its corners into an analog curve.</li></ol>
<p>Example with $\delta = 1$ and a starting level of 2: the bits 1, 1, 0 give 3, 4, 3. These are exactly the steps of slide 85, replayed.</p>
<table class="tbl compact"><thead><tr><th>Block</th><th>In the modulator (slide 86)</th><th>In the demodulator (slide 87)</th></tr></thead><tbody>
<tr><td>Comparator</td><td>yes</td><td>no</td></tr>
<tr><td>Staircase maker + delay unit</td><td>yes (feedback loop)</td><td>yes (same pair)</td></tr>
<tr><td>Low-pass filter</td><td>no</td><td>yes</td></tr></tbody></table>`,
            why: R`<p>Both ends build the same staircase from the same bits, which is why DM works without ever sending an amplitude. The low-pass filter at the end is the same finishing step as in the PCM decoder (slides 81–82).</p>
<p><b>Exam angle:</b> compare the two diagrams. A frequent slip is putting a comparator in the demodulator, or forgetting the filter. If asked to draw the demodulator, give three blocks and the delay-unit loop.</p>` },

          { n: 88, title: 'Delta PCM (DPCM)',
            says: R`<ul><li>Instead of using one bit to indicate positive and negative differences, we can use more bits → quantization of the difference.</li>
<li>Each bit code is used to represent the value of the difference.</li>
<li>The more bits the more levels → the higher the accuracy.</li></ul>`,
            means: R`<p>DM tells the receiver only the <i>direction</i> of the change, so it always moves by the same $\delta$. <b>DPCM</b> keeps the “send differences” idea but <b>quantizes the difference</b> like PCM quantizes an amplitude: a code of several bits says <i>how big</i> the change was.</p>
<p>With 1 bit there are only two possible differences (down $\delta$, up $\delta$): that is DM. With 2 bits there are four. As an illustration only, since the slide gives no table, they could mean big down, small down, small up and big up. With 3 bits there are eight, and so on. More bits, more levels, finer description of the change.</p>
<table class="tbl compact"><thead><tr><th>Method</th><th>What is sent per sample</th><th>Bits per sample</th></tr></thead><tbody>
<tr><td>PCM</td><td>the quantized <i>amplitude</i> (zone number)</td><td>$\c{level}{n_b} = \log_2 \c{level}{L}$</td></tr>
<tr><td>DM</td><td>the <i>sign</i> of the change (1 up, 0 down)</td><td>1</td></tr>
<tr><td>DPCM</td><td>the quantized <i>difference</i></td><td>several</td></tr></tbody></table>
<p>The slide's last line is the usual trade-off in a new place: more levels give higher accuracy but cost more bits, so the bit rate $\c{rate}{N} = (\text{bits per sample}) \times \c{baud}{f_s}$ rises with them.</p>`,
            why: R`<p>DPCM closes the digitizing methods: it sits between DM (one bit, cheap, fast changes break it) and PCM (full amplitude, accurate, most bits). The next slide begins a different subject, how the finished bits travel.</p>
<p><b>Exam angle:</b> identification (“quantization of the difference between samples” is DPCM), and MCQ comparing DM with DPCM (DPCM uses more bits and gets higher accuracy). The mistake is treating DPCM as just another name for DM.</p>`,
            beyond: R`<p>Because the differences between neighbouring samples are usually small, DPCM can often describe them with fewer bits than the amplitudes would need. (Forouzan.)</p>` }
        ],
        together: R`<p><b>Three ways to digitize, in one picture.</b> Every method begins by sampling; they differ in <i>what they send per sample</i>.</p>
<table class="tbl compact"><thead><tr><th>Method</th><th>Sends</th><th>Bits per sample</th><th>Strength</th><th>Weakness</th></tr></thead><tbody>
<tr><td>PCM</td><td>the zone number (quantized amplitude)</td><td>$\c{level}{n_b} = \log_2 \c{level}{L}$</td><td>follows any signal; error at most $\Delta/2$</td><td>most bits; widest bandwidth ($\c{bw}{B_{\min}} = \c{level}{n_b}\,\c{bw}{f_{\max}}$)</td></tr>
<tr><td>DM</td><td>1 = up $\delta$, 0 = down $\delta$</td><td>1</td><td>simplest circuit; fewest bits</td><td>large changes give large errors</td></tr>
<tr><td>DPCM</td><td>the quantized difference</td><td>several</td><td>accuracy rises with the bits</td><td>more bits than DM</td></tr></tbody></table>
<p>The decoders look alike: a staircase maker (hold circuit) followed by a low-pass filter. DM builds its staircase with a comparator, staircase maker and delay unit in a feedback loop; the receiver repeats the staircase maker and delay unit and adds the filter. Whichever method is chosen, the output is the same kind of object: a <b>stream of bits</b>, and the quantity that decides its cost is bits per sample times samples per second.</p>
<p>That stream now has to cross a link. The last part of the lecture asks how: all bits at once on several wires, or one after another on one wire, and how the receiver finds where each byte begins.</p>` }

      /* @@PART5@@ */
    ],
    terms: [],
    keyTerms: [],
    faq: []
  });
})();
