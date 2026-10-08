/* Slide-by-slide walkthrough: L02 slides 1–19 (topic l02). Contract: docs/AUTHORING.md §3.7.
   Math is written with String.raw so that TeX backslashes (\c{role}{…}, \frac, \times) stay exactly as typed. */
(function () {
  'use strict';
  var R = String.raw;
  function ref(p) { return ' <span class="chip ref">' + p + '</span>'; }

  KIT.walk({
    id: 'l02-1', topic: 'l02', range: [1, 19],
    parts: [
      /* ============================ PART 1 ============================ */
      { title: 'The physical layer and the vocabulary of signals', slides: [1, 6],
        items: [
          { n: 1, kind: 'admin', title: 'Title slide',
            says: R`Physical Communication Layer, NSCOM03 Data Communications; subtitle “Signals, Bandwidth, Transmission, Noise, Data Rate” (the five topics of this lecture); dated 2024-09-17, prepared by Jerome Gutierrez.` },

          { n: 2, title: 'Physical Layer',
            says: R`<ul>
<li>Lowest layer of the OSI Reference Model.</li>
<li>It is responsible for transmitting bit sequences through the network medium to the physical layer of the remote node.
  <ul><li>Where frames are reconstructed and passed to the data link layer.</li></ul></li>
<li>All aspects related to a transmission medium used for data communications are defined by physical layer protocols and specifications.
  <ul><li>This is for both wired and wireless environments.</li>
  <li>It includes the type of cable and connectors used, the electrical signals associated with each pin and connector, and the manner in which bit values are converted into physical signals.</li></ul></li>
</ul>`,
            means: R`<p>The <b>OSI reference model</b> splits networking into layers, and the <b>physical layer</b> is layer 1, the bottom one${ref('L01 p2')}. It is the only layer that touches the real world. Above it, the data link layer builds <b>frames</b>, which are just long strings of 1s and 0s to the layer below. The physical layer pushes those bits across a <b>transmission medium</b> (copper cable, optical fiber, or open air) and, at the far end, turns the arriving signal back into bits; frames are reconstructed there and passed up to the data link layer, as the sub-bullet says.</p>
<p>The slide’s last bullet is a checklist of what a physical layer specification must fix:</p>
<ol>
<li><b>The hardware</b>: the type of cable and connectors.</li>
<li><b>The electrical signals on each pin and connector</b>: which voltage or pulse means what.</li>
<li><b>The conversion rule</b>: the manner in which bit values are converted into physical signals.</li>
</ol>
<p>The third item is the subject of the whole run of lectures that starts here. <b>Data</b> is the information (the bits 1001…); a <b>signal</b> is the physical, time-varying quantity that carries it (a voltage, a light intensity, a radio wave). Lecture 2 explains what signals are and what limits a channel, Lecture 3 converts bits into digital signals (line coding), and Lecture 4 converts bits into analog signals (modulation).</p>`,
            why: R`<p>Slide 2 fixes where this lecture sits: the one place where “a 1” becomes “a voltage”. Because the specifications cover <b>both wired and wireless</b> media, the same ideas (frequency, bandwidth, noise, data-rate limits) describe a copper pair and a Wi-Fi channel alike.</p>
<p><b>Exam angle.</b> Identification or MCQ: “Which layer defines the cable type, the connectors and the electrical signal on each pin?” and “Which layer converts bit values into physical signals?” both answer <i>physical layer</i>. The usual mistake is to give these jobs to the data link layer, whose unit is the frame; the physical layer deals in bits and signals.${ref('L01 p2')}</p>` },

          { n: 3, kind: 'admin', title: 'Section divider: Signals',
            says: R`Section divider “Signals”: a squiggly analog wave with an arrow to the bit string 1001010101001101, a wave on one side and bits on the other.` },

          { n: 4, title: 'Analog and Digital Signals',
            says: R`<ul>
<li>Signals can be either <b>analog</b> or <b>digital</b>.</li>
<li>An analog signal has infinitely many levels of intensity over a period of time.</li>
<li>A digital signal, on the other hand, can have only a limited number of defined values.</li>
<li>The simplest way to show signals is by plotting them on a pair of perpendicular axes: the vertical axis represents the value or strength of a signal, the horizontal axis represents time.</li>
</ul>
<p><b>Figure.</b> Two plots, both “Value” against “Time”. Left, “Analog signal”: a smooth curve that wobbles up and down, with varying height and spacing. Right, “Digital signal”: a blocky line made of flat segments joined by vertical jumps: a small positive value, then zero, then a larger positive value, zero again for a long stretch, a negative value, and zero.</p>`,
            means: R`<p>A <b>signal</b> is a quantity that changes over time and can be measured: a voltage on a wire, the brightness of a light, the strength of a radio wave. The slide gives the plotting convention used for every waveform in this course: <b>time on the horizontal axis, value (strength) on the vertical axis</b>. To read a signal, pick a moment on the time axis and read the height of the curve above it.</p>
<p>The two plots differ in what the <i>vertical</i> axis is allowed to do:</p>
<ul>
<li><b>Analog signal</b>: infinitely many levels of intensity. At any instant it may sit at any height in its range and it glides smoothly from one height to the next (the left curve). Think of a dimmer knob, or the voltage from a microphone.</li>
<li><b>Digital signal</b>: only a limited number of defined values. It stays flat at one allowed value, then jumps straight to another (the right plot uses just four heights: zero, a small positive value, a larger positive value and a negative value). Think of a light switch, or a selector with a few fixed positions.</li>
</ul>
<p><b>Data versus signal.</b> The bits you want to send are <i>data</i>; the signal is the physical carrier of those bits. Either kind of signal can carry digital data: slide 16 sends it as a digital signal and slide 18 converts it into an analog one. “Analog” and “digital” describe the <i>signal</i> (how many values it may take), not the information inside it.</p>`,
            why: R`<p>Every later slide assumes this vocabulary. Slide 14 shows that a digital signal may have <b>more than two</b> levels, so “digital” means a limited set of values, not specifically 0 and 1. Slides 16–18 contrast sending a digital signal as it is (baseband) with converting it into an analog one (broadband).</p>
<p><b>Exam angle.</b> Identification: “a signal with infinitely many levels of intensity” is analog; “a signal with a limited number of defined values” is digital. The classic mistakes are to decide by shape (“it looks like a wave, so it is analog”) or by count (“digital means two levels”). Decide by how many values the vertical axis may take.</p>`,
            tip: R`<p>Analog versus digital is about the <i>vertical</i> axis (how many values are allowed). Periodic versus nonperiodic, on the next slide, is about repetition over <i>time</i>. They are two separate questions.</p>` },

          { n: 5, title: 'Periodic and Non-Periodic Signals',
            says: R`<ul>
<li>A <b>periodic signal</b> has a repeating pattern within a time frame.
  <ul><li>That time frame is called a <b>period</b>.</li></ul></li>
<li>And repeats that pattern over subsequent identical periods.</li>
<li>Completion of one full pattern is called a <b>cycle</b>.</li>
<li>A <b>nonperiodic signal</b> changes without exhibiting a pattern or cycle that repeats over time.</li>
<li>Both analog and digital signals can be periodic or nonperiodic.</li>
</ul>`,
            means: R`<p>Ask one question of any signal: <i>if I slide a copy of it along the time axis by some fixed amount, does it land exactly on itself?</i> If yes, it is <b>periodic</b>; the smallest such amount of time is the <b>period</b>, and one stretch of the pattern is a <b>cycle</b>. If no, it is <b>nonperiodic</b>. A clock tick (1 0 1 0 1 0 …) is periodic; a message such as 1001010101001101 is not.</p>
<p>The last bullet is the one to remember: the two classifications are independent, so there are four combinations.</p>
<table class="tbl">
<thead><tr><th></th><th>Periodic</th><th>Nonperiodic</th></tr></thead>
<tbody>
<tr><td><b>Analog</b></td><td>a sine wave (slide 7)</td><td>a voice-like curve that never repeats, such as the left plot on slide 4</td></tr>
<tr><td><b>Digital</b></td><td>a steady alternating pulse train</td><td>an arbitrary bit stream, such as the right plot on slide 4</td></tr>
</tbody>
</table>
<p>Periodic matters because only a periodic signal has a <b>period</b> and therefore a <b>frequency</b> (slide 7). Slide 14 draws the consequence: most digital signals are nonperiodic, so period and frequency are “not appropriate characteristics” for them and we use bit rate instead.</p>`,
            why: R`<p>This slide supplies two words, <b>period</b> and <b>cycle</b>, that slides 6–8 rely on, and the “both can be either” sentence that exam writers like to turn into a true/false item. It also sets up the headline of the summary slide: <b>periodic analog</b> signals and <b>nonperiodic digital</b> signals are the pair we commonly use in data communications${ref('L02 p38')}. Intuitively, the data we send is unpredictable (nonperiodic), while the analog signal that carries it in broadband is a clean repeating wave (periodic).</p>
<p><b>Exam angle.</b> MCQ/identification: “a signal that repeats a pattern over identical periods” → periodic; “one full pattern” → cycle. Mistake: assuming digital implies nonperiodic or analog implies periodic. Neither is true.</p>`,
            tip: R`<p>Period = the <i>time</i> a pattern takes; cycle = the <i>pattern</i> itself. “Periodic” needs the whole pattern to repeat identically, not just to wiggle.</p>` },

          { n: 6, title: 'The Sine Wave',
            says: R`<ul>
<li>A sine wave can be represented by three parameters: <b>frequency, amplitude and phase</b>.</li>
<li><b>Amplitude</b> of a signal is the absolute value of its highest intensity, proportional to the energy it carries.</li>
<li><b>Frequency</b> refers to the number of periods in 1 s.
  <ul><li><b>Period</b> refers to the amount of time, in seconds, a signal needs to complete 1 cycle.</li>
  <li>Frequency is formally expressed in <b>Hertz (Hz)</b>, which is cycle per second.</li></ul></li>
<li><b>Phase</b>, or phase shift, describes the position of the waveform relative to time 0.
  <ul><li>Phase is measured in degrees or radians.</li></ul></li>
</ul>`,
            means: R`<p>The <b>sine wave</b> is the simplest periodic analog signal: a smooth, endlessly repeating up-and-down curve. It matters more than its simplicity suggests, because slide 11 will show that <i>every</i> composite signal is built out of sine waves. Three numbers describe one completely. A musical note is a good picture: the amplitude is how loud it is, the frequency is its pitch, and the phase is <i>when</i> it starts.</p>
<ul>
<li><b>Amplitude</b> (peak amplitude): the largest height the wave reaches, measured as an absolute value from the zero line. The slide says it is proportional to the energy the signal carries, so a bigger swing means more energy.</li>
<li><b>Frequency</b> $\c{freq}{f}$: how many periods fit in 1 s, in <b>hertz</b> (Hz = cycles per second). A wave with $\c{freq}{f} = \c{freq}{4}$ Hz repeats four times every second.</li>
<li><b>Period</b> $\c{time}{T}$: the time, in seconds, of one cycle. It is the reverse view of frequency: $\c{freq}{f} = \frac{1}{\c{time}{T}}$ and $\c{time}{T} = \frac{1}{\c{freq}{f}}$ (written out on slide 7).</li>
<li><b>Phase</b>: where in its cycle the wave already is at time 0. It is an angle: degrees, or <b>radians</b> (one full cycle is 360°, which is 2π radians).</li>
</ul>
<p><b>Colour key for every equation in this walkthrough</b> (colour follows the unit): frequency and bandwidth in Hz, $\c{freq}{f}$ and $\c{bw}{B}$, are green; period and time in seconds, $\c{time}{T}$, are amber; bit rate in bps, $\c{rate}{N}$, is blue; signal elements per second, $\c{baud}{S}$, is orange; levels and bits per level, $\c{level}{L}$ and $\c{level}{r}$, are violet.</p>`,
            why: R`<p>Slide 6 is the definition slide for the rest of the lecture, and its three parameters return in Lecture 4: ASK changes the <b>amplitude</b>${ref('L04 p9')}, FSK the <b>frequency</b>${ref('L04 p14')} and PSK the <b>phase</b>${ref('L04 p22')} of a sine wave to carry bits. Slides 7 and 8 draw the wave, slides 9–10 measure it in space, and slides 11–13 add many of them together.</p>
<p><b>Exam angle.</b> Identification: “the three parameters of a sine wave” → amplitude, frequency, phase. “Amplitude is proportional to…” → the energy carried. Common mistakes: listing <i>wavelength</i> or <i>period</i> as a third parameter (the period is just 1/frequency), and forgetting that phase is measured relative to <b>time 0</b>.</p>`,
            tip: R`<p>A sine wave = amplitude + frequency + phase. The period is not a fourth parameter; it is 1/frequency.</p>` }
        ],
        together: R`<p>Part 1 gives the vocabulary that the rest of the lecture works with.</p>
<table class="tbl">
<thead><tr><th>Step</th><th>Idea</th><th>Slide</th></tr></thead>
<tbody>
<tr><td>Job</td><td>The physical layer turns bits into physical signals and carries them across a wired or wireless medium</td><td>2</td></tr>
<tr><td>Signal</td><td>A value plotted against time (value up, time across)</td><td>4</td></tr>
<tr><td>How many values?</td><td>Analog: infinitely many levels. Digital: a limited number of defined values</td><td>4</td></tr>
<tr><td>Does it repeat?</td><td>Periodic: a pattern (a cycle) repeats every period. Nonperiodic: it never repeats. Any combination is possible</td><td>5</td></tr>
<tr><td>Simplest signal</td><td>The sine wave: amplitude, frequency ($\c{freq}{f} = \frac{1}{\c{time}{T}}$, in Hz) and phase (an angle at time 0)</td><td>6</td></tr>
</tbody>
</table>
<p>The chain to hold on to is <b>bits are data → a signal carries them → a signal is analog or digital, periodic or not → the sine wave is the building block</b>. The sine wave is built from three numbers, but so far they are only words. The next part turns them into pictures and arithmetic: counting cycles to get frequency and period (slide 7), reading phase from where a wave starts (slide 8), and measuring how long a wave is in space (slides 9–10).</p>` },

      /* ============================ PART 2 ============================ */
      { title: 'Measuring a sine wave: frequency, phase and wavelength', slides: [7, 10],
        items: [
          { n: 7, title: 'Sine Wave – Frequency and Amplitude',
            says: R`<p><b>Figure.</b> One sine wave drawn across a 1 s window (a bracket marked “1s”) that holds four complete cycles. Labels on the figure:</p>
<ul>
<li>“Period / Cycle”: a double-headed arrow over one cycle, with “Period = 1/4 s”;</li>
<li>“Peak Amplitude”: an arrow from the time axis up to a crest;</li>
<li>“Amplitude”: a red double arrow on the left that spans the whole height, crest to trough;</li>
<li>a blue box around the first cycle, and a stray “textbox” label left over from editing;</li>
<li>“Frequency = 4 period in 1s or 4Hz”.</li>
</ul>
<p><b>Note on the slide:</b> Period (p) = Time (t); Frequency (f) = 1/t; Time = 1/f.</p>`,
            means: R`<p>This slide turns slide 6’s words into numbers with one picture. <b>Frequency</b> is how many cycles happen in one second, so count the complete cycles inside the 1 s window: four. <b>Period</b> is how long one cycle lasts, which the green arrow marks.</p>
<figure data-fig="l02.sine" data-caption="Slide 7 redrawn: four cycles in 1 s, so f = 4 Hz and T = 1/4 s. Peak amplitude is measured from the axis to a crest."></figure>
<ol>
<li>Count the cycles in the window: 4 cycles in 1 s.</li>
<li>Frequency is cycles per second: $\c{freq}{f} = \frac{4\text{ cycles}}{\c{time}{1\text{ s}}} = \c{freq}{4\text{ Hz}}$.</li>
<li>Period is the reciprocal: $\c{time}{T} = \frac{1}{\c{freq}{f}} = \frac{1}{\c{freq}{4\text{ Hz}}} = \c{time}{\frac{1}{4}\text{ s}}$, which is 0.25 s, the slide’s “Period = 1/4 s”.</li>
<li>Check: four cycles of 0.25 s each fill $4 \times \c{time}{0.25\text{ s}} = \c{time}{1\text{ s}}$.</li>
</ol>
<p>Frequency and period are two descriptions of the same wave, so they flip into each other: $\c{freq}{f} = \frac{1}{\c{time}{T}}$ and $\c{time}{T} = \frac{1}{\c{freq}{f}}$. A fast wave has a short period. Two more pairs you can do by hand: 1 kHz = 1000 Hz has a period of 1 ms, and a 50 Hz wave has a period of 1/50 s = 0.02 s = 20 ms.</p>
<p>The “Peak Amplitude” arrow runs from the axis to a crest: that distance is the amplitude defined on slide 6 (the highest intensity).</p>`,
            why: R`<p>This is the lecture’s first worked picture, and its numbers (4 Hz and ¼ s) are the ones most likely to be reused in an exam. The skill, “count cycles in a window”, gives the frequency of any periodic signal drawn on a time axis. Frequency returns three more times: in wavelength (slides 9–10), as the position of each component of a composite signal (slide 12) and as the two ends of a bandwidth (slide 13).</p>
<p><b>Exam angle.</b> Solving: “a signal completes N cycles in t seconds; find f and T”. Mistakes: dividing the wrong way round, mixing units (a period in ms with a frequency in Hz), reading “amplitude” as the full crest-to-trough height, and quoting the cycle count without dividing by the length of the window.</p>`,
            tip: R`<p>Frequency and period are reciprocals: 4 Hz ↔ ¼ s. If you know one, flip it. High frequency means short period.</p>`,
            error: { says: R`The note reads “Period (p) = Time (t)” and “Frequency (f) = 1/t”, the red “Amplitude” arrow runs from crest to trough, and the label says “4 period in 1s”.`,
              correct: R`The period is written $\c{time}{T}$: $\c{freq}{f} = \frac{1}{\c{time}{T}}$ and $\c{time}{T} = \frac{1}{\c{freq}{f}}$ (the slide’s “t” is the period, not a general time). Amplitude is measured from the axis to the crest, which is the “Peak Amplitude” arrow; a crest-to-trough span would be twice that. It is “4 periods in 1 s”.` },
            example: { title: 'Frequency and period (slide 7)', gen: 'l02.wave', params: { find: 'fT', cycles: 4, seconds: 1 },
              slideAnswer: 'f = 4 Hz, T = 1/4 s', slideValue: 4, input: 'f' } },

          { n: 8, title: 'Sine Wave – Phase',
            says: R`<p><b>Figure.</b> Four panels, each a copy of the same four-cycle sine wave on a time axis with “0” marked at the left edge: “0 degrees” (top left), “180 degrees” (top right), “90 degrees” (bottom left) and “270 degrees” (bottom right). The panels differ only in where the wave is at time 0:</p>
<table class="tbl">
<thead><tr><th>Label</th><th>Where the wave is at time 0</th></tr></thead>
<tbody>
<tr><td>0 degrees</td><td>on the zero line, rising</td></tr>
<tr><td>90 degrees</td><td>at the peak, about to fall</td></tr>
<tr><td>180 degrees</td><td>on the zero line, falling</td></tr>
<tr><td>270 degrees</td><td>at the trough, about to rise</td></tr>
</tbody>
</table>`,
            means: R`<p><b>Phase</b> is the wave’s <i>starting position</i>, expressed as an angle. Picture the wave as a point going round a clock face: one full trip is one cycle, which is 360°. Phase says how far round the trip the wave already is at time 0.</p>
<ul>
<li><b>0°</b>: the trip has not started; the wave is on the zero line and rising.</li>
<li><b>90°</b>: a quarter of the trip is done; the wave is at its peak.</li>
<li><b>180°</b>: half done; back on the zero line, now falling.</li>
<li><b>270°</b>: three quarters done; at the trough.</li>
<li><b>360°</b>: a full trip, identical to 0°.</li>
</ul>
<p>In radians, 360° is 2π, so 180° is π, 90° is π/2 and 270° is 3π/2. Amplitude and frequency are identical in all four panels: changing the phase only slides the wave sideways in time, by a quarter of a period per panel.</p>
<figure data-fig="l02.phase" data-caption="Slide 8 redrawn: the same sine wave at four phases."></figure>
<p>The slide only draws the four waves, but the idea converts directly into a rule for a time shift $\c{time}{t}$ measured against the period $\c{time}{T}$: $\text{phase} = 360^\circ \times \frac{\c{time}{t}}{\c{time}{T}}$. For example, at $\c{freq}{250\text{ Hz}}$ the period is $\c{time}{T} = \frac{1}{\c{freq}{250\text{ Hz}}} = \c{time}{4\text{ ms}}$, and a copy of the wave that starts $\c{time}{1\text{ ms}}$ earlier has phase $360^\circ \times \frac{\c{time}{1\text{ ms}}}{\c{time}{4\text{ ms}}} = 360^\circ \times \frac{1}{4} = 90^\circ$: the 90° panel.</p>`,
            why: R`<p>Phase completes the three-parameter description from slide 6. Two waves with the same amplitude and frequency can still differ, and that difference is the phase. The same four angles come back on slide 17, where each three-bit pattern is approximated by a sine wave with a particular frequency <i>and phase</i> (for example “f = N/4, p = 270”), and in Lecture 4, where PSK sends bits by choosing the phase (BPSK: 1 = 0°, 0 = 180°).${ref('L04 p22')}</p>
<p><b>Exam angle.</b> Drawing or identification: “sketch a sine wave with a phase of 90°” (start at the peak), “which phase starts at the trough?” (270°). Mistakes: swapping 90° and 270° (peak versus trough), believing a phase change alters the frequency, and forgetting that phase is measured relative to <b>time 0</b>.</p>`,
            tip: R`<p>Read phase from the starting point: 0° rising through zero, 90° at the peak, 180° falling through zero, 270° at the trough.</p>`,
            beyond: R`<p>Textbook form: a sine wave is $A \sin(2 \pi \c{freq}{f} \c{time}{t} + \phi)$ with peak amplitude $A$ and phase $\phi$. At $\c{time}{t} = 0$ it equals $A \sin \phi$: zero for $\phi = 0^\circ$, the peak $A$ for $90^\circ$, zero again for $180^\circ$ and the trough $-A$ for $270^\circ$, which are exactly the four panels.</p>`,
            example: { title: 'Phase from a time shift (the slide gives no numbers; this uses the textbook rule)', gen: 'l02.wave', params: { find: 'phase', f: 250, shift: 0.001 } } },

          { n: 9, title: 'Wavelength',
            says: R`<ul>
<li>Another characteristic of a signal traveling through a transmission medium.</li>
<li>Wavelength binds the period or the frequency of a simple sine wave to the <b>propagation speed</b> of the medium.</li>
</ul>
<p><b>Figure.</b> Left: a transmission medium drawn twice, “At time t” and “At time t + T”, each with a short wave train; in the lower row the wave has moved to the right (“Direction of propagation”) and a marker labelled “Wavelength” spans one cycle. Right: <i>Wavelength = (propagation speed) × period = propagation speed / frequency</i>, and <i>λ = c / f</i>. Note: c is equal to 3x10<sup>8</sup>.</p>`,
            means: R`<p>Slides 7 and 8 watched the wave <i>over time</i> at one spot. <b>Wavelength</b> $\lambda$ is the same wave seen <i>over distance</i>: freeze the cable at one instant and the wave appears as a repeating pattern along it; the length of one cycle of that pattern is the wavelength, in metres.</p>
<p>The <b>propagation speed</b> is how fast the wave travels through the medium. In free space it is $c = 3 \times 10^{8}$ m/s, the speed of light (the slide’s note leaves out the unit).</p>
<p>The figure holds the whole derivation. At time $t$ the wave is drawn; after one period $\c{time}{T}$ (the lower row, “time $t + T$”) it has travelled forward and the pattern looks the same again, one cycle later. So in one period the wave moves exactly one wavelength, and distance = speed × time gives:</p>
$$\lambda = \text{propagation speed} \times \c{time}{T} = \frac{\text{propagation speed}}{\c{freq}{f}} = \frac{c}{\c{freq}{f}}$$
<p>Unit check: speed in m/s divided by frequency in 1/s leaves metres. At the same speed, a higher frequency means a shorter wavelength; a slower medium (slide 36 uses 2.4 × 10<sup>8</sup> m/s) also shortens it.</p>`,
            why: R`<p>Wavelength is the third way to measure the same sine wave: in time (period $\c{time}{T}$), in rate (frequency $\c{freq}{f}$) and in space (wavelength $\lambda$). The idea “speed × time = distance” returns on slide 35, where propagation time = distance / propagation speed.</p>
<p><b>Exam angle.</b> Identification: “binds the period or frequency to the propagation speed of the medium” → wavelength. Solving: $\lambda = \frac{c}{\c{freq}{f}}$ (next slide). Mistakes: inverting the fraction (frequency over speed), forgetting that c = 3 × 10<sup>8</sup> m/s, and using a speed other than c when the question gives one.</p>`,
            tip: R`<p>Distance = speed × time: in one period the wave travels exactly one wavelength.</p>` },

          { n: 10, title: 'Wavelength Example',
            says: R`<ul>
<li>Assume that the frequency of red light is 4x10<sup>14</sup>.</li>
<li>What is the wavelength of red light?</li>
<li>Let us assume that the propagation of red light in free space is 3x10<sup>8</sup>.
  <ul><li>Note that it is also the speed of light.</li></ul></li>
</ul>
<p>Worked on the slide: <i>λ = c / f = 3x10<sup>8</sup> / 4x10<sup>14</sup> = 0.75 x10<sup>-6</sup> m = 0.75 µm</i>. (The slide writes no units on the frequency or the speed.)</p>`,
            means: R`<p>Do it exactly as you would on paper, with no calculator: take the numbers in front and the powers of ten separately.</p>
$$\lambda = \frac{c}{\c{freq}{f}} = \frac{3 \times 10^{8}}{\c{freq}{4 \times 10^{14}}}$$
<ol>
<li>Units: $\c{freq}{f} = 4 \times 10^{14}$ Hz and $c = 3 \times 10^{8}$ m/s.</li>
<li>Numbers in front: $3 \div 4 = 0.75$.</li>
<li>Powers of ten: $\frac{10^{8}}{10^{14}} = 10^{8-14} = 10^{-6}$.</li>
<li>Combine: $\lambda = 0.75 \times 10^{-6}$ m. The prefix µ (micro) means $10^{-6}$, so this is <b>0.75 µm</b>. Equivalent forms: $7.5 \times 10^{-7}$ m (what the generator below prints) and 750 nm.</li>
</ol>
<p>Cross-check through the period, which uses the other form of the formula. $\c{time}{T} = \frac{1}{\c{freq}{4 \times 10^{14}}} = \c{time}{2.5 \times 10^{-15}}$ s, and $\lambda = c \times \c{time}{T} = 3 \times 10^{8} \times \c{time}{2.5 \times 10^{-15}} = 7.5 \times 10^{-7}$ m. The same answer, as it must be.</p>`,
            why: R`<p>This is the only wavelength calculation on the slides, so it is the template for a solving item: write the formula, substitute with units, handle numbers and exponents separately, then attach the right prefix. The size of the answer is also a sanity check: a wave oscillating 4 × 10<sup>14</sup> times a second is shorter than a micrometre.</p>
<p><b>Exam angle.</b> Expect the same shape with new numbers or with the unknown moved (find f from λ and c). Mistakes: a wrong sign on the exponent (0.75 × 10<sup>6</sup>), reading µ as 10<sup>-3</sup>, and dividing 4 by 3 instead of 3 by 4.</p>`,
            tip: R`<p>Divide the numbers in front first (3 ÷ 4 = 0.75), then subtract exponents (8 − 14 = −6).</p>`,
            example: { title: 'Wavelength of red light (slide 10)', gen: 'l02.wave', params: { find: 'lambda', f: 4e14, v: 3e8 },
              slideAnswer: 'λ = 3×10⁸ / 4×10¹⁴ = 0.75×10⁻⁶ m = 0.75 µm', slideValue: 7.5e-7, input: 'lambda' } }
        ],
        together: R`<p>Part 2 puts numbers on the sine wave of slide 6. One wave, three measuring sticks:</p>
<table class="tbl">
<thead><tr><th>What you measure</th><th>Rule</th><th>Slide example</th></tr></thead>
<tbody>
<tr><td>How often (Hz)</td><td>$\c{freq}{f} = \frac{\text{cycles}}{\c{time}{\text{seconds}}}$</td><td>4 cycles in 1 s: $\c{freq}{4\text{ Hz}}$ (slide 7)</td></tr>
<tr><td>How long one cycle lasts</td><td>$\c{time}{T} = \frac{1}{\c{freq}{f}}$</td><td>$\c{time}{\frac{1}{4}\text{ s}}$ (slide 7)</td></tr>
<tr><td>Where it starts</td><td>phase: 0°, 90°, 180°, 270° = 0, ¼, ½, ¾ of a cycle already done</td><td>four panels (slide 8)</td></tr>
<tr><td>How long it is in space</td><td>$\lambda = \frac{c}{\c{freq}{f}} = c \times \c{time}{T}$</td><td>red light: 0.75 µm (slides 9–10)</td></tr>
</tbody>
</table>
<p>The link between all four rows is the pair $\c{freq}{f} = \frac{1}{\c{time}{T}}$: switch between a count per second and a time per cycle, and a wavelength follows by multiplying the period by the propagation speed. Everything so far, though, describes <i>one</i> pure sine wave, which has a single frequency. Real signals are not that tidy. The next part adds sine waves together (composite signals), measures the spread of frequencies that results (bandwidth), and then returns to the digital signals of slide 4 to count levels and bits.</p>` },

      /* ============================ PART 3 ============================ */
      { title: 'Composite signals, bandwidth and digital signals', slides: [11, 14],
        items: [
          { n: 11, title: 'Composite Signals',
            says: R`<ul>
<li>A <b>composite signal</b> is made of many simple sine waves.</li>
<li>In the early 1900s, the French mathematician Jean-Baptiste Fourier showed that a composite signal is a combination of simple sine waves with different frequencies, amplitudes, and phases.</li>
<li>A composite signal can be periodic or nonperiodic.</li>
</ul>`,
            means: R`<p>Until now every wave was a pure sine wave with a single frequency. A <b>composite signal</b> is what you get by <i>adding</i> several sine waves, each with its own frequency, amplitude and phase (the three parameters of slide 6). The adding is literal: at every instant, the value of the composite is the sum of the values of its sine waves at that instant.</p>
<p>The slide credits <b>Fourier</b> with the key result, which also works backwards: a composite signal can be <i>taken apart</i> into simple sine waves, and the list of those sine waves (their frequencies, amplitudes and phases) describes the signal completely. Think of the sine waves as ingredients and the composite signal as the dish; the list is the recipe.</p>
<p>The last bullet reuses slide 5: a composite signal can repeat (the f, 3f, 9f example on slide 12 does) or never repeat.</p>`,
            why: R`<p>This slide is the doorway to bandwidth. If a signal is a set of sine waves, the natural question is <i>which frequencies it contains</i> (slide 13), and a channel can be described in the same terms, as something that passes some frequencies and not others (slides 16–18). Slide 23 will explain distortion this way too: the sine waves inside a composite travel at different speeds. The payoff is on the summary slide: a digital signal is a composite analog signal with an infinite bandwidth.${ref('L02 p38')}</p>
<p><b>Exam angle.</b> Identification: “a signal made of many simple sine waves” → composite; “showed that a composite signal is a combination of sine waves” → Fourier. A true/false item may claim that a composite signal must be periodic: false. If a question quotes the slide’s date, follow the question’s wording but know the correction below.</p>`,
            error: { says: R`“In the early 1900s, the French mathematician Jean-Baptiste Fourier showed…”`,
              correct: R`Fourier’s work dates from the early 1800s.` } },

          { n: 12, title: 'Composite Signal',
            says: R`<ul>
<li>Signal is actually composed of several sine waves.</li>
<li>The sine waves also have different amplitudes.</li>
<li>It is possible that there are three sine waves in the example: f, 3f and 9f.</li>
<li>The main frequency is normally called the <b>fundamental frequency</b>.</li>
</ul>
<p><b>Figures.</b> Top: a repeating wave that is nearly a square wave (a dotted square wave sits behind it) with ripples on its flat parts, on a “Time” axis with “…” showing it continues. Middle, “a. Time-domain decomposition of a composite signal”: amplitude against time, with three sine waves in the legend, “Frequency f” (large and slow), “Frequency 3f” (smaller, three times as fast) and “Frequency 9f” (smallest, nine times as fast). Bottom, “b. Frequency-domain decomposition of the composite signal”: amplitude against frequency, three vertical spikes at f, 3f and 9f, each shorter than the one before.</p>`,
            means: R`<p>The slide shows <i>one</i> signal in two ways, and the names of the two views are worth learning.</p>
<ul>
<li><b>Time domain</b>: amplitude plotted against <i>time</i>, the wave as an oscilloscope would draw it. The top figure and part (a) are time-domain views.</li>
<li><b>Frequency domain</b>: amplitude plotted against <i>frequency</i>. Each sine wave becomes one spike: its position is the wave’s frequency and its height is the wave’s amplitude. Part (b) is the frequency-domain view of the same three waves.</li>
</ul>
<figure data-fig="l02.composite" data-caption="Slide 12 redrawn: f, 3f and 9f added together (time domain, top) and the three spikes of the frequency domain (bottom)."></figure>
<ol>
<li>Part (a): the <b>fundamental frequency</b> $\c{freq}{f}$ is the big slow wave. The 3f wave makes three cycles while f makes one, and is smaller; the 9f wave makes nine and is smaller still.</li>
<li>Add the three at every instant and the top figure appears: nearly a square wave, flat on top, with small ripples left over from 3f and 9f.</li>
<li>Part (b): throw time away and keep only “which frequencies, how big”. Three spikes at $\c{freq}{f}$, $\c{freq}{3f}$ and $\c{freq}{9f}$, falling in height.</li>
</ol>
<p>The 3f and 9f components are <b>harmonics</b>, whole-number multiples of the fundamental. The lesson to carry forward: sharp edges need <i>more and higher-frequency</i> sine waves. Slide 17 uses the same trick for a digital pulse (N/2, 3N/2, 5N/2).</p>
<p>A number to hold on to: if $\c{freq}{f} = \c{freq}{1000\text{ Hz}}$, the spikes sit at 1000, 3000 and 9000 Hz, so the bandwidth (next slide) is $\c{bw}{B} = \c{freq}{9f} - \c{freq}{f} = \c{bw}{8f} = \c{bw}{8000\text{ Hz}}$.</p>`,
            why: R`<p>Frequency-domain pictures are how every later slide in this lecture describes a signal and a channel: slide 13 reads a bandwidth off one, slides 16–18 draw the band a channel supports as a frequency-domain box, and slide 17 shows the bandwidth growing as harmonics are added. Learn to move between the views: a wave you see in time is a set of spikes in frequency.</p>
<p><b>Exam angle.</b> Identification: “the main frequency of a composite signal” → fundamental frequency; “a plot of amplitude against frequency” → frequency domain. Drawing: three spikes at f, 3f, 9f, falling. Mistake: calling 9f the bandwidth. It is the <i>highest frequency</i>; the bandwidth is the difference, 9f − f = 8f.</p>`,
            tip: R`<p>Time domain: amplitude against time, the wave you see. Frequency domain: amplitude against frequency, one spike per sine wave.</p>`,
            beyond: R`<p>The textbook figure behind this slide gives the three components amplitudes in the ratio 1 : 1/3 : 1/9. The slide itself only shows that they fall.</p>`,
            example: { title: 'Bandwidth of the f, 3f, 9f signal (the slide gives no numbers; here f = 1 kHz)', gen: 'l02.bandwidth', params: { find: 'harm', f: 1000 } } },

          { n: 13, title: 'Bandwidth',
            says: R`<ul>
<li>The range of frequencies contained in a composite signal is its <b>bandwidth</b>.</li>
<li>Bandwidth is normally a difference between two numbers.</li>
</ul>
<p><b>Figure.</b> “Amplitude” against “Frequency”: a dense comb of vertical lines that starts at 1000 and ends at 5000. The lines rise from short to tall, “…” marks lines left out, the tallest are in the middle, and they fall again towards 5000. A double arrow underneath reads “Bandwidth = 5000 – 1000 = 4000 Hz”, and the caption is “Bandwidth of a periodic signal”.</p>`,
            means: R`<p><b>Bandwidth</b> is the width of the band of frequencies a composite signal occupies: from the lowest frequency it contains to the highest. It is read straight off the frequency-domain picture of slide 12.</p>
<ol>
<li>Find the lowest frequency present: the leftmost line, 1000 Hz.</li>
<li>Find the highest frequency present: the rightmost line, 5000 Hz.</li>
<li>Subtract: $\c{bw}{B} = \c{freq}{f_{\text{high}}} - \c{freq}{f_{\text{low}}} = \c{freq}{5000} - \c{freq}{1000} = \c{bw}{4000}$ Hz.</li>
</ol>
<figure data-fig="l02.spectrum" data-caption="Slide 13 redrawn: components from 1000 Hz to 5000 Hz, so B = 4000 Hz."></figure>
<p>Why “a difference between two numbers”: bandwidth is a <i>width</i>, like the width of a road rather than its address. A signal spanning 11,000–15,000 Hz also has $\c{bw}{B} = \c{bw}{4000}$ Hz. The many lines come from the signal being periodic and having many components; the “…” hides lines in between, which do not change the answer, because only the two end lines count. A single pure sine wave has one frequency, so its bandwidth is zero. If the lowest frequency is 0 Hz, the bandwidth equals the highest frequency, a special case that slide 17 uses.</p>`,
            why: R`<p>Bandwidth is the single most reused quantity in the lecture. A <i>signal</i> occupies a bandwidth; a <i>channel</i> supports one (slides 16–18); the data-rate limits on slides 29 and 31 are written in terms of it, and slide 32 applies it to a telephone line whose 300 to 3300 Hz gives a 3000 Hz bandwidth. Slide 34 will also use the word for bits per second, a different sense of the word, so always check the unit: Hz here.</p>
<p><b>Exam angle.</b> Solving: given the lowest and highest frequencies, find B; or given B and one end, find the other end. Mistakes: answering 5000 Hz (the highest frequency), adding instead of subtracting, dropping the unit, and counting the lines instead of measuring the span.</p>`,
            tip: R`<p>Bandwidth is a width, not a position: highest − lowest, in Hz.</p>`,
            beyond: R`<p>The slide’s caption says “periodic signal” because a periodic composite has separate lines. In the textbook a nonperiodic composite signal has a continuous spectrum, but it is still measured the same way, highest minus lowest.</p>`,
            example: { title: 'Bandwidth of a periodic signal (slide 13)', gen: 'l02.bandwidth', params: { find: 'B', fLow: 1000, fHigh: 5000 },
              slideAnswer: 'B = 5000 − 1000 = 4000 Hz', slideValue: 4000, input: 'B' } },

          { n: 14, title: 'Digital Signal',
            says: R`<ul>
<li>Information can also be represented by a digital signal.
  <ul><li>A digital signal can have more than two levels.</li></ul></li>
<li>In general, if a signal has <i>L</i> levels, each level needs log<sub>2</sub> <i>L</i> bits.</li>
<li>Most digital signals are nonperiodic, and thus period and frequency are not appropriate characteristics.</li>
<li><b>Bit rate</b> is the number of bits sent in 1 s, expressed in bits per second (bps).</li>
<li><b>Bit length</b> is the distance one bit occupies on the transmission medium.</li>
</ul>
<p><b>Figures.</b> Top, “A digital signal with two levels”: Level 1 (low) and Level 2 (high), eight equal slots separated by dashed lines carrying the bits 1 0 1 1 0 0 0 1 (1 sits at Level 2, 0 at Level 1), labelled “8 bits sent in 1 s, Bit rate = 8 bps”. Bottom, “A digital signal with four levels”: Levels 1 to 4 and eight slots carrying 11 10 01 01 00 00 00 10 (11 at Level 4, 10 at Level 3, 01 at Level 2, 00 at Level 1), labelled “16 bits sent in 1 s, Bit rate = 16 bps”. Both end at “1 s” with “…”.</p>`,
            means: R`<p>A <b>level</b> is one of the allowed values of a digital signal, and $\c{level}{L}$ is how many there are. Each flat segment of the picture shows one level for one time slot. The slide’s rule answers: how many bits can one segment carry?</p>
<p>To tell $\c{level}{L}$ levels apart you need enough bits to give each one its own label: $2^{\c{level}{r}} = \c{level}{L}$, so $\c{level}{r} = \log_2 \c{level}{L}$ bits per level. Two levels need 1 bit, four need 2 (00, 01, 10, 11), eight need 3, sixteen need 4.</p>
<figure data-fig="wave" data-levels="2,1,2,2,1,1,1,2" data-bits="10110001" data-set="2,1" data-title="2 levels"></figure>
<figure data-fig="wave" data-levels="4,3,2,2,1,1,1,3" data-cpb="0.5" data-bits="1110010100000010" data-set="4,3,2,1" data-title="4 levels"></figure>
<p class="small">Slide 14 redrawn. The labels on the left (+4 to +1) are level numbers, the slide’s Level 4 to Level 1, not volts.</p>
<ol>
<li><b>Top figure.</b> Two levels: $\c{level}{r} = \log_2 \c{level}{2} = \c{level}{1}$ bit per level. Eight segments per second, so $\c{rate}{N} = \c{baud}{8} \times \c{level}{1} = \c{rate}{8}$ bps.</li>
<li><b>Bottom figure.</b> Four levels: $\c{level}{r} = \log_2 \c{level}{4} = \c{level}{2}$ bits per level. Still eight segments per second, so $\c{rate}{N} = \c{baud}{8} \times \log_2 \c{level}{4} = \c{baud}{8} \times \c{level}{2} = \c{rate}{16}$ bps.</li>
</ol>
<p>The orange 8 is the number of segments per second. The slide only counts bits, but Lecture 3 calls this count the signal rate $\c{baud}{S}$. The pictures show the point of multilevel signalling: the same eight segments per second carry twice the data when each segment has four levels instead of two.</p>
<p><b>Bit rate</b> is the bits sent in one second. Because most digital signals are nonperiodic (slide 5), period and frequency do not describe them, and bit rate takes their place. <b>Bit length</b> is the stretch of the medium one bit occupies; the slide only defines it.</p>`,
            why: R`<p>Slide 14 connects the analog half of the lecture to the digital half and to what comes next. It extends slide 4: digital means “a limited number of values”, here two or four, not necessarily two. It prepares Nyquist on slide 29, $\c{rate}{N} = 2 \c{bw}{B} \log_2 \c{level}{L}$, which contains the same $\log_2 \c{level}{L}$: more levels mean more bits per segment and so more bits per second through the same bandwidth. And it prepares Lecture 3, where bit rate = signal elements per second × bits per element, the rule $\c{baud}{S} = \frac{\c{rate}{N}}{\c{level}{r}}$ rearranged.${ref('L04 p5')}</p>
<p><b>Exam angle.</b> Solving: given the number of levels and the segments per second, find the bit rate; or find the number of levels from the bits per level. Identification: “the number of bits sent in 1 s” → bit rate; “the distance one bit occupies on the medium” → bit length. Mistakes: reading 4 levels as 4 bits per level (it is log<sub>2</sub> 4 = 2), and confusing bit rate (bps) with bandwidth (Hz).</p>`,
            tip: R`<p>L levels carry log<sub>2</sub> L bits each: 2 → 1, 4 → 2, 8 → 3, 16 → 4. The answer is a number of <i>bits</i>, not a number of levels.</p>`,
            beyond: R`<p>Textbook: bit length = propagation speed × bit duration. A bit that lasts 1 µs on a medium with a propagation speed of 2 × 10<sup>8</sup> m/s therefore occupies 200 m of the medium.</p>`,
            example: { title: 'Four levels: bits per level and bit rate (slide 14)', gen: 'l02.nyquist', params: { find: 'digital', elements: 8, L: 4 },
              slideAnswer: '2 bits per level; 16 bits sent in 1 s → 16 bps', slideValue: 16, input: 'N' } }
        ],
        together: R`<p>Part 3 explains what a signal is made of, and what “size” means for it.</p>
<table class="tbl">
<thead><tr><th>Idea</th><th>What it says</th><th>The numbers</th><th>Slide</th></tr></thead>
<tbody>
<tr><td>Composite signal</td><td>A sum of sine waves with different frequencies, amplitudes and phases (Fourier)</td><td>f, 3f, 9f</td><td>11–12</td></tr>
<tr><td>Two views</td><td>Time domain: amplitude against time. Frequency domain: one spike per sine wave</td><td>spikes at f, 3f, 9f</td><td>12</td></tr>
<tr><td>Bandwidth</td><td>$\c{bw}{B} = \c{freq}{f_{\text{high}}} - \c{freq}{f_{\text{low}}}$, a width in Hz</td><td>$\c{freq}{5000} - \c{freq}{1000} = \c{bw}{4000}$ Hz</td><td>13</td></tr>
<tr><td>Digital signal</td><td>$\c{level}{L}$ levels carry $\c{level}{r} = \log_2 \c{level}{L}$ bits each; bit rate = bits sent in 1 s</td><td>2 levels: 8 bps; 4 levels: 16 bps</td><td>14</td></tr>
</tbody>
</table>
<p>The chain: <b>any signal can be taken apart into sine waves → the spread of their frequencies is the bandwidth → a digital signal has sharp edges, and sharp edges need many high-frequency sine waves</b>. The summary on slide 38 states the extreme case: a digital signal is a composite analog signal with an <i>infinite</i> bandwidth. That creates a puzzle for the part that follows. Every real channel supports only a limited band of frequencies, so a digital signal cannot cross it untouched. Slides 15–18 give the two answers: send the digital signal as it is and accept an approximation (baseband), or convert it into an analog signal that fits the band (broadband).</p>` },

      /* ============================ PART 4 ============================ */
      { title: 'Transmitting digital signals: baseband and broadband', slides: [15, 19],
        items: [
          { n: 15, kind: 'admin', title: 'Section divider: Transmitting Digital Signals',
            says: R`Section divider “Transmitting Digital Signals”: the message Hello goes to a wave, then to the bits 1010110, and comes out as Hello.` },

          { n: 16, title: 'Baseband Transmission',
            says: R`<ul>
<li>Baseband transmission means sending a digital signal over a channel without changing the digital signal to an analog signal.
  <ul><li>This is possible for wide-bandwidth medium.</li>
  <li>A dedicated medium with a bandwidth constituting only one channel.</li></ul></li>
</ul>
<p><b>Figure.</b> Top row, three frequency-domain boxes: “Input signal bandwidth” (a flat-topped shape that runs from 0 to ∞ with “…” inside), “Bandwidth supported by medium” (a rectangle from f<sub>1</sub> to f<sub>2</sub>) and “Output signal bandwidth” (a rounded rectangle from f<sub>1</sub> to f<sub>2</sub>). Bottom row, the matching time-domain pictures: “Input signal” (a short positive pulse followed by a longer negative one, with sharp corners), “Wide-bandwidth channel” (a cable) and “Output signal” (the same shape with rounded, smoothed corners).</p>`,
            means: R`<p><b>Baseband transmission</b> puts the digital signal on the medium <i>as it is</i>: the voltage levels of slide 14 travel down the wire, with no conversion to an analog signal and no converter hardware. It only works on a <b>wide-bandwidth medium</b>, because a digital signal needs a lot of bandwidth (see the figure). The slide’s last line says the medium is dedicated, with a bandwidth that makes up just one channel: the whole band of the cable serves this one signal.</p>
<p>Read the figure from left to right:</p>
<ol>
<li><b>Input spectrum</b>: the digital signal contains frequencies from 0 up towards infinity, because its sharp corners are made of very high-frequency sine waves (slide 12; slide 38 calls this an infinite bandwidth).</li>
<li><b>The medium</b> supports only a limited band of frequencies, drawn as the rectangle between f<sub>1</sub> and f<sub>2</sub>.</li>
<li><b>Output spectrum</b>: only the frequencies inside that band got through; the rest were lost.</li>
<li><b>In time</b>, the lost high frequencies were the corners, so the output is a rounded copy of the input pulse. It still has a positive part followed by a negative part, so the receiver can recover the bits as long as the rounding is small.</li>
</ol>
<p>The wider the band the channel supports, the fewer frequencies are lost and the closer the output is to the input. Slide 17 puts a number on that.</p>`,
            why: R`<p>Baseband is the simplest way to send a digital signal: no modulation, nothing to convert. It is the setting for Lecture 3, whose line codes (NRZ, Manchester, AMI and the rest) are different ways of shaping the digital signal that goes onto the wire. Baseband is also the first half of the lecture’s contrast; the second half is broadband (slide 18).</p>
<p><b>Exam angle.</b> MCQ/identification: “sending a digital signal over a channel without changing it to an analog signal” → baseband transmission; “a dedicated medium whose bandwidth forms only one channel” → the baseband setting. Mistakes: describing baseband as analog, or giving it a bandpass channel (that is broadband, slide 18).</p>`,
            tip: R`<p>Baseband = the digital signal sent as it is, over a wide-bandwidth, low-pass channel (a channel that starts at 0 Hz).</p>`,
            error: { says: R`The medium’s supported band is drawn from f<sub>1</sub> to f<sub>2</sub>, and the output spectrum also starts at f<sub>1</sub>.`,
              correct: R`A baseband channel is <b>low-pass</b>: its band starts at 0 Hz (slide 17 itself says “low-pass channel”). A band that does not start from zero is a bandpass channel, the broadband case of slide 18.` } },

          { n: 17, title: 'Baseband Transmission (approximation in a low-pass channel)',
            says: R`<ul>
<li>In a low-pass channel with limited bandwidth, we approximate the digital signal with an analog signal.</li>
<li>The level of approximation depends on the bandwidth available.</li>
</ul>
<p><b>Left figure, “Bandwidth = N/2”.</b> A spectrum with lines at 0, N/4 and N/2 (the N/2 line highlighted). Below it, eight pairs: a three-bit digital pattern at “bit rate N”, and the analog sine wave that approximates it:</p>
<table class="tbl">
<thead><tr><th>Bits</th><th>000</th><th>001</th><th>010</th><th>011</th><th>100</th><th>101</th><th>110</th><th>111</th></tr></thead>
<tbody>
<tr><td>Analog f</td><td>0</td><td>N/4</td><td>N/2</td><td>N/4</td><td>N/4</td><td>N/2</td><td>N/4</td><td>0</td></tr>
<tr><td>Phase p</td><td>180</td><td>180</td><td>180</td><td>270</td><td>90</td><td>0</td><td>0</td><td>0</td></tr>
</tbody>
</table>
<p><b>Right figure, “Bandwidth = 5N/2”.</b> A spectrum with lines at 0, N/4, N/2, 3N/4, 3N/2, 5N/4 and 5N/2, falling in height, with the N/2, 3N/2 and 5N/2 lines highlighted. Below it, the digital pattern 0 1 0 at bit rate N and three analog approximations: “f = N/2” (one smooth hump), “f = N/2 and 3N/2” (a flatter top and steeper sides) and “f = N/2, 3N/2, and 5N/2” (closer still, with ripples on the flat parts).</p>`,
            means: R`<p>A <b>low-pass channel</b> passes every frequency from 0 Hz up to some limit. The digital signal, with its infinite spread of frequencies (slide 13 and slide 38), cannot fit through it, so what the receiver gets is an <i>analog approximation</i> built from the few sine waves the channel can pass. The slide shows how good that approximation is as the bandwidth grows.</p>
<p><b>Left figure: why $\c{bw}{B} = \frac{\c{rate}{N}}{2}$.</b></p>
<ol>
<li>At bit rate $\c{rate}{N}$ one bit lasts $\c{time}{T_{\text{bit}}} = \frac{1}{\c{rate}{N}}$ seconds.</li>
<li>The fastest-changing pattern alternates, 0 1 0 1 …: one full cycle takes two bits, so the frequency is $\c{freq}{f} = \frac{1}{2\,\c{time}{T_{\text{bit}}}} = \frac{\c{rate}{N}}{2}$. This is the 010 column (and 101) in the table.</li>
<li>Slower patterns (001, 011, 100, 110) are matched by a sine wave of $\c{freq}{f} = \frac{\c{rate}{N}}{4}$, and the steady patterns (000, 111) by $\c{freq}{f} = 0$, a flat line.</li>
<li>The phase p picks where each sine wave starts, from the four angles of slide 8 (for instance 000 uses p = 180, a flat low line; 111 uses p = 0, a flat high line).</li>
</ol>
<p>All eight patterns need only frequencies from 0 to N/2. The lowest frequency is 0, so by slide 13 the bandwidth equals the highest frequency: $\c{bw}{B} = \frac{\c{rate}{N}}{2}$.</p>
<p><b>Right figure: better shapes cost more bandwidth.</b> One sine wave at N/2 turns the pattern 0 1 0 into a rough hump. Adding 3N/2 flattens the top and steepens the sides. Adding 5N/2 gets closer again. Each harmonic reaches a higher frequency, so the bandwidth the channel must pass grows with it; the slide labels the third case $\c{bw}{B} = \frac{5\,\c{rate}{N}}{2}$.</p>
<figure data-fig="l02.lowpass" data-caption="The right-hand figure of slide 17 redrawn: bits 0 1 0 approximated by N/2 alone, then with 3N/2, then with 5N/2 added."></figure>`,
            why: R`<p>This slide is the physical reason that bandwidth limits speed. The needed bandwidth is proportional to the bit rate ($\c{bw}{B} = \frac{\c{rate}{N}}{2}$, so doubling the bit rate doubles the bandwidth), and a narrower channel gives a worse copy. It sets up slide 28 (data rate depends on the bandwidth, the signal levels and the noise) and slide 29: for two levels, Nyquist’s $\c{rate}{N} = 2 \c{bw}{B} \log_2 \c{level}{L}$ gives $\c{rate}{N} = 2 \c{bw}{B}$, the same $\c{bw}{B} = \frac{\c{rate}{N}}{2}$.</p>
<p><b>Exam angle.</b> MCQ: “the level of approximation depends on the…” → bandwidth available. Solving: $\c{bw}{B} = \frac{\c{rate}{N}}{2}$ for the first harmonic and $\frac{5\,\c{rate}{N}}{2}$ for N/2, 3N/2 and 5N/2. Mistakes: using B = N instead of N/2, and treating the table’s f = N/4 patterns as a different bandwidth (they sit inside 0 to N/2).</p>`,
            tip: R`<p>First harmonic only: B = N/2. With N/2, 3N/2 and 5N/2: B = 5N/2. More bandwidth, closer to the digital shape.</p>`,
            example: { title: 'How much bandwidth for N = 1 Mbps? (slide 17 gives the rule; these numbers are mine)',
              html: R`<table class="tbl">
<thead><tr><th>Harmonics kept</th><th>Bandwidth needed</th><th>The received 0 1 0</th></tr></thead>
<tbody>
<tr><td>N/2 only</td><td>$\c{bw}{B} = \frac{\c{rate}{N}}{2} = \frac{\c{rate}{1,000,000}}{2} = \c{bw}{500,000}$ Hz</td><td>one smooth hump</td></tr>
<tr><td>N/2 and 3N/2</td><td>$\c{bw}{B} = \frac{3\,\c{rate}{N}}{2} = \frac{3 \times \c{rate}{1,000,000}}{2} = \c{bw}{1,500,000}$ Hz</td><td>flatter top, steeper sides</td></tr>
<tr><td>N/2, 3N/2 and 5N/2</td><td>$\c{bw}{B} = \frac{5\,\c{rate}{N}}{2} = \frac{5 \times \c{rate}{1,000,000}}{2} = \c{bw}{2,500,000}$ Hz</td><td>closest to the pulse, ripples on the flat parts</td></tr>
</tbody>
</table>
<p class="small">The highest frequency kept is the bandwidth, because the band starts at 0 Hz. Five times the bandwidth buys the better shape.</p>` } },

          { n: 18, title: 'Broadband Transmission',
            says: R`<ul>
<li>Broadband transmission means changing the digital signal to an analog signal for transmission.
  <ul><li>Modulation allows us to use a <b>bandpass channel</b>—a channel with a bandwidth that does not start from zero.</li></ul></li>
</ul>
<p><b>Figure.</b> Left column: “Input digital signal” (a single pulse), an arrow down through a “Digital/analog converter” to the “Input analog signal”, shown with its bandwidth between f<sub>1</sub> and f<sub>2</sub> and its waveform (a burst of oscillation settling into a steady oscillation). Middle: “Available bandwidth” between f<sub>1</sub> and f<sub>2</sub> above a pipe labelled “Bandpass channel”. Right column: the same analog signal with bandwidth f<sub>1</sub> to f<sub>2</sub> (its waveform is labelled “Input analog signal”), an arrow up through an “Analog/digital converter” to the “Output digital signal”, the same single pulse.</p>`,
            means: R`<p><b>Broadband transmission</b> converts the digital signal into an analog one before sending it. The conversion is called <b>modulation</b>: the data is used to change a property of an analog signal (its amplitude, frequency or phase, the parameters of slide 6). The figure is a pipeline:</p>
<ol>
<li><b>Input digital signal</b>: the bits as a digital signal (here a single pulse).</li>
<li><b>Digital/analog converter</b>: modulates, producing an <b>analog signal whose frequencies lie between f<sub>1</sub> and f<sub>2</sub></b>.</li>
<li><b>Bandpass channel</b>: a channel whose available band is f<sub>1</sub> to f<sub>2</sub>. It does <i>not</i> start from zero, which is why the digital signal could not go through directly.</li>
<li><b>Analog/digital converter</b> at the receiver: demodulates the arriving analog signal back to bits.</li>
<li><b>Output digital signal</b>: the same pulse as the input.</li>
</ol>
<p>Compare the two ways of sending a digital signal:</p>
<table class="tbl">
<thead><tr><th></th><th>Baseband (slides 16–17)</th><th>Broadband (slide 18)</th></tr></thead>
<tbody>
<tr><td>What travels</td><td>the digital signal itself</td><td>an analog signal made from it (modulation)</td></tr>
<tr><td>Channel</td><td>low-pass: the band starts at 0 Hz</td><td>bandpass: f<sub>1</sub> to f<sub>2</sub>, not starting from zero</td></tr>
<tr><td>Extra hardware</td><td>none</td><td>a converter at each end (the modulator/demodulator pair of slide 17 in Lecture 1)${ref('L01 p17')}</td></tr>
</tbody>
</table>`,
            why: R`<p>Broadband answers the puzzle that part 3 ended with: the channel passes only a band that does not start at 0 Hz, so the digital signal is converted into an analog signal that fits it. Lecture 4 is exactly the content of the “Digital/analog converter” box: ASK, FSK and PSK change the amplitude, frequency or phase of the sine wave from slide 6, and QAM combines them.</p>
<p><b>Exam angle.</b> Essay or identification: compare baseband and broadband (what is sent, what channel it needs, what converts it). Mistakes: reading “broadband” as “fast internet” (here it only means that the digital signal is converted to an analog one), and mixing up low-pass (starts at 0) with bandpass (does not).</p>`,
            tip: R`<p>Baseband: digital signal, low-pass channel. Broadband: analog (modulated) signal, bandpass channel.</p>`,
            beyond: R`<p>Because a bandpass channel occupies only f<sub>1</sub> to f<sub>2</sub>, several of them can share one medium side by side, each in its own band. That is the idea of multiplexing in a later lecture.</p>`,
            error: { says: R`The waveform on the right (receiver) side is labelled “Input analog signal”.`,
              correct: R`It is the <b>output</b> analog signal; the heading above it correctly says “Output analog signal bandwidth”.` } },

          { n: 19, kind: 'admin', title: 'Section divider: Transmission Impairment',
            says: R`Section divider “Transmission Impairment”: Hello goes to a wave, then to the bits 1011110, and comes out as Heck (slide 15 sent 1010110 and got Hello back).` }
        ],
        together: R`<p>Part 4 answers a practical question: <b>how does a digital signal cross a channel?</b></p>
<table class="tbl">
<thead><tr><th>Step</th><th>Statement</th><th>Slide</th></tr></thead>
<tbody>
<tr><td>Problem</td><td>A digital signal has sharp edges, so it contains frequencies out towards infinity; a channel supports only a limited band</td><td>16, 38</td></tr>
<tr><td>Answer 1: baseband</td><td>Send the digital signal as it is over a wide-bandwidth, low-pass channel; the output is an approximation, and more bandwidth means a better one</td><td>16–17</td></tr>
<tr><td>The price</td><td>First harmonic only: $\c{bw}{B} = \frac{\c{rate}{N}}{2}$; with N/2, 3N/2 and 5N/2: $\c{bw}{B} = \frac{5\,\c{rate}{N}}{2}$</td><td>17</td></tr>
<tr><td>Answer 2: broadband</td><td>Modulate the digital signal into an analog one that fits a bandpass channel (f<sub>1</sub> to f<sub>2</sub>, not from zero), then convert it back at the receiver</td><td>18</td></tr>
</tbody>
</table>
<p>Together with parts 1 to 3, this closes the loop of the first half of the lecture: bits are data, a signal carries them, a signal is built from sine waves with a bandwidth, and a channel passes only some of those frequencies. All of this assumed that the signal arrives as it was sent, and the divider on slide 19 shows that it does not. On slide 15, 1010110 came back as Hello; on slide 19, 1011110 comes back as Heck, one bit wrong. The slides that follow explain why: <b>attenuation</b> (the signal loses energy, measured in decibels), <b>distortion</b> (the sine waves of a composite signal arrive at different times) and <b>noise</b> (unwanted energy added on the way), and then how much data a channel can still carry despite them (Nyquist and Shannon).</p>` }
    ],
    terms: [
      { term: 'Cycle', def: 'One complete repetition of a periodic signal’s pattern. The time one cycle takes is the period, and the number of cycles per second is the frequency.', ref: 'L02 p5' },
      { term: 'Hertz', alt: ['Hz'], def: 'The unit of frequency: one hertz is one cycle per second. Four cycles in 1 s is 4 Hz, and 1 kHz is 1000 Hz.', ref: 'L02 p6' },
      { term: 'Sine wave', def: 'The simplest periodic analog signal, a smooth repeating curve described completely by three parameters: peak amplitude, frequency and phase. Every composite signal is a sum of sine waves.', ref: 'L02 p6; L02 p11' },
      { term: 'Radian', def: 'A unit for angles and phase: 360° equals 2π radians, so 180° is π, 90° is π/2 and 270° is 3π/2. Slide 6 says phase is measured in degrees or radians.', ref: 'L02 p6' },
      { term: 'Propagation speed', def: 'How fast a signal travels through a medium; in free space c = 3 × 10⁸ m/s, the speed of light. It ties wavelength to frequency (λ = c/f) and gives propagation time = distance / speed.', ref: 'L02 p9; L02 p35' },
      { term: 'Time domain', def: 'A plot of a signal’s amplitude against time, the wave as an oscilloscope would draw it. Slide 12 draws the three sine waves of a composite signal this way.', ref: 'L02 p12' },
      { term: 'Frequency domain', def: 'A plot of amplitude against frequency in which each sine wave of a signal is one spike at its frequency. The bandwidth of slide 13 is read from this view.', ref: 'L02 p12' },
      { term: 'Harmonic', def: 'A sine-wave component whose frequency is a whole-number multiple of the fundamental: 3f and 9f on slide 12, 3N/2 and 5N/2 on slide 17. Adding harmonics sharpens the edges of the sum. (Textbook word for the slides’ components.)', ref: 'L02 p12; L02 p17' },
      { term: 'Fourier analysis', def: 'The result that a composite signal can be split into simple sine waves with different frequencies, amplitudes and phases, and that this list describes the signal completely. Credited to Fourier on slide 11 (early 1800s, not 1900s).', ref: 'L02 p11' },
      { term: 'Signal levels (L)', def: 'The distinct values a digital signal may take. With L levels each level carries log₂ L bits: two levels give 1 bit, four give 2, eight give 3.', ref: 'L02 p14' },
      { term: 'Low-pass channel', def: 'A channel whose band starts at 0 Hz and runs up to a limit. Baseband transmission needs one; the more bandwidth it has, the closer the received analog signal is to the digital input.', ref: 'L02 p17' },
      { term: 'Digital/analog converter', alt: ['D/A converter'], def: 'The block in broadband transmission that turns the input digital signal into an analog signal (modulation) before the bandpass channel; an analog/digital converter at the receiver turns it back.', ref: 'L02 p18' }
    ],
    keyTerms: ['Analog signal', 'Digital signal', 'Periodic signal', 'Amplitude', 'Frequency', 'Period', 'Phase', 'Wavelength', 'Composite signal', 'Bandwidth', 'Bit rate', 'Baseband transmission', 'Broadband transmission', 'Bandpass channel', 'Low-pass channel'],
    faq: [
      { q: 'Can a digital signal be periodic, and can an analog signal be nonperiodic?',
        a: R`<p>Yes to both. Slide 5 says both analog and digital signals can be periodic or nonperiodic, because “how many values?” (analog or digital) and “does it repeat?” (periodic or not) are separate questions. In data communications we commonly use periodic analog and nonperiodic digital signals, and since most digital signals are nonperiodic they are described by a bit rate rather than a frequency.</p>`, ref: 'L02 p5; L02 p14' },
      { q: 'How do I get the frequency and the period from a picture of a wave?',
        a: R`<p>Count the complete cycles in a known time window: $\c{freq}{f} = \frac{\text{cycles}}{\c{time}{\text{seconds}}}$, then $\c{time}{T} = \frac{1}{\c{freq}{f}}$. Slide 7: 4 cycles in 1 s is 4 Hz, so the period is 1/4 s.</p>`, ref: 'L02 p7' },
      { q: 'What do phases of 0°, 90°, 180° and 270° look like?',
        a: R`<p>Look at where the wave is at time 0: 0° starts on the zero line rising, 90° starts at the peak, 180° starts on the zero line falling and 270° starts at the trough. Each step is a quarter of a period, and the frequency and amplitude do not change.</p>`, ref: 'L02 p8' },
      { q: 'Why is the wavelength equal to c divided by f?',
        a: R`<p>In one period $\c{time}{T}$ the wave travels one wavelength at the propagation speed, so $\lambda = c \times \c{time}{T}$, and since $\c{time}{T} = \frac{1}{\c{freq}{f}}$ this is $\lambda = \frac{c}{\c{freq}{f}}$. For red light, $\frac{3 \times 10^{8}}{4 \times 10^{14}} = 0.75\ \mu\text{m}$.</p>`, ref: 'L02 p9; L02 p10' },
      { q: 'What is the difference between the time domain and the frequency domain?',
        a: R`<p>The time domain plots amplitude against time, so you see the wave itself. The frequency domain plots amplitude against frequency, so each sine wave of a composite signal is one spike. Slide 12 shows the same f, 3f, 9f signal both ways.</p>`, ref: 'L02 p12' },
      { q: 'How do I compute a bandwidth, and why is it not just the highest frequency?',
        a: R`<p>Bandwidth is the range of frequencies in the signal: $\c{bw}{B} = \c{freq}{f_{\text{high}}} - \c{freq}{f_{\text{low}}}$. On slide 13, 5000 − 1000 = 4000 Hz. It equals the highest frequency only when the lowest frequency is 0 Hz.</p>`, ref: 'L02 p13' },
      { q: 'How many bits does one level carry, and how do I get the bit rate of a multilevel signal?',
        a: R`<p>A level carries $\c{level}{r} = \log_2 \c{level}{L}$ bits (2 levels: 1, 4 levels: 2, 8 levels: 3). The bit rate is the bits sent in one second: on slide 14, 8 segments per second with 4 levels give 8 × 2 = 16 bps.</p>`, ref: 'L02 p14' },
      { q: 'What is the difference between baseband and broadband transmission?',
        a: R`<p>Baseband sends the digital signal as it is, over a wide-bandwidth low-pass channel that starts at 0 Hz; the receiver gets an approximation whose quality depends on the bandwidth. Broadband modulates the digital signal into an analog signal so that it can use a bandpass channel, whose band does not start from zero, and converts it back at the receiver.</p>`, ref: 'L02 p16; L02 p18' }
    ]
  });
})();
