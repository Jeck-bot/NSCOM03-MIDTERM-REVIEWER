/* L02 — Signals, bandwidth, transmission impairments, data-rate limits (39 slides). Owner: Lead (taken over from O1). */
(function () {
  'use strict';
  var T = 'l02';
  function ref(p) { return ' <span class="chip ref">' + p + '</span>'; }
  function seCallout(slide, says, correct) {
    return '<div class="callout slide-error"><div class="callout-label">⚠ Slide says / correct</div><div class="says-correct"><b>' + slide + '</b><span>' + says + '</span><b>Correct</b><span>' + correct + '</span></div></div>';
  }

  KIT.formula({ id: 'l02.freq', topic: T, name: 'Frequency and period', html: 'f = 1/T &nbsp;·&nbsp; T = 1/f', where: 'f in Hz (cycles per second); T in seconds', ref: 'L02 p6; L02 p7', sheet: true });
  KIT.formula({ id: 'l02.lambda', topic: T, name: 'Wavelength', html: 'λ = c / f = c × T', where: 'c = propagation speed (3×10⁸ m/s in free space)', ref: 'L02 p9', sheet: true });
  KIT.formula({ id: 'l02.phase', topic: T, name: 'Phase from a time shift', html: 'phase = 360° × t / T', where: '¼ period = 90°, ½ period = 180°', note: 'Slide 8 only shows the four phase pictures (the 90° wave is a quarter period ahead); the formula is the textbook’s.', ref: 'L02 p8; Forouzan', beyond: true, sheet: false });
  KIT.formula({ id: 'l02.bw', topic: T, name: 'Bandwidth', html: 'B = f<sub>high</sub> − f<sub>low</sub>', where: 'range of frequencies in a composite signal', ref: 'L02 p13', sheet: true });
  KIT.formula({ id: 'l02.levels', topic: T, name: 'Bits per level', html: 'bits per level = log<sub>2</sub> L', where: 'L signal levels; bit rate = bits sent in 1 s', ref: 'L02 p14', sheet: true });
  KIT.formula({ id: 'l02.db', topic: T, name: 'Decibel', html: 'dB = 10 log<sub>10</sub>(P<sub>2</sub> / P<sub>1</sub>)', where: 'negative = attenuated, positive = amplified; half power = −3 dB', ref: 'L02 p21; L02 p22', sheet: true });
  KIT.formula({ id: 'l02.snr', topic: T, name: 'Signal-to-noise ratio', html: 'SNR = P<sub>signal</sub> / P<sub>noise</sub> &nbsp;·&nbsp; SNR<sub>dB</sub> = 10 log<sub>10</sub> SNR',
    where: 'average powers; SNR is a plain ratio', ref: 'L02 p25', sheet: true });
  KIT.formula({ id: 'l02.nyquist', topic: T, name: 'Nyquist bit rate (noiseless)', html: 'BitRate = 2 × B × log<sub>2</sub> L', where: 'B = channel bandwidth (Hz); L = signal levels', ref: 'L02 p29', sheet: true });
  KIT.formula({ id: 'l02.shannon', topic: T, name: 'Shannon capacity (noisy)', html: 'C = B × log<sub>2</sub>(1 + SNR)', where: 'SNR as a plain ratio, NOT dB; no levels in the formula', ref: 'L02 p31', sheet: true });
  KIT.formula({ id: 'l02.latency', topic: T, name: 'Latency', html: 'Latency = T<sub>prop</sub> + T<sub>trans</sub> + T<sub>queue</sub> + T<sub>proc</sub>',
    where: 'T<sub>prop</sub> = distance / propagation speed; T<sub>trans</sub> = message size / bandwidth', ref: 'L02 p35', sheet: true });
  KIT.formula({ id: 'l02.bitlength', topic: T, name: 'Bit length (textbook)', html: 'bit length = propagation speed × bit duration', where: 'bit duration = 1 / bit rate', ref: 'Forouzan', beyond: true, sheet: false });

  KIT.topic({
    id: T,
    lecture: 2,
    title: 'Signals, Bandwidth, Noise & Data-Rate Limits',
    blurb: 'What a signal is, how sine waves combine into composite signals with a bandwidth, what impairs a signal on the way, and how fast a channel can possibly go (Nyquist and Shannon).',
    highYield: ['Nyquist & Shannon (slides 29–33)', 'dB and SNR', 'Latency: propagation vs transmission', 'Wavelength / period / phase', 'Summary slide 38'],
    glance: [
      'Signals are <b>analog</b> (infinitely many levels) or <b>digital</b> (a limited number of levels), and <b>periodic</b> or <b>nonperiodic</b>. Data communications uses periodic analog and nonperiodic digital signals.',
      'A sine wave = <b>amplitude</b> (peak), <b>frequency</b> f = 1/T in Hz, <b>phase</b> (position at time 0: 0°, 90°, 180°, 270°). <b>Wavelength</b> λ = c/f (c = 3×10⁸ m/s): red light at 4×10¹⁴ Hz → 0.75 µm.',
      'A <b>composite signal</b> is a sum of sine waves (Fourier); its <b>bandwidth</b> = highest − lowest frequency (5000 − 1000 = 4000 Hz). A digital signal is a composite analog signal with <b>infinite bandwidth</b>.',
      '<b>Baseband</b>: send the digital signal as is over a low-pass channel (the first harmonic needs B = N/2). <b>Broadband</b>: modulate it onto a bandpass channel.',
      'Impairments: <b>attenuation</b> (dB = 10 log₁₀ P₂/P₁; half power = −3 dB), <b>distortion</b>, <b>noise</b> (thermal, induced, crosstalk, impulse). <b>SNR</b> = signal/noise; SNR<sub>dB</sub> = 10 log₁₀ SNR (10 mW / 1 µW → 40 dB).',
      '<b>Nyquist</b> (noiseless): N = 2B log₂L. <b>Shannon</b> (noisy): C = B log₂(1 + SNR). Use Shannon for the ceiling, then Nyquist for the levels (1 MHz, SNR 63 → 6 Mbps; use 4 Mbps → L = 4). <b>Latency</b> = propagation + transmission + queuing + processing.'
    ],
    ask: [
      '<b>Solving:</b> Shannon capacity, then a safe rate and the Nyquist levels (slide 33); Nyquist bit rate or levels.',
      '<b>Solving:</b> dB of a gain/loss (or a chain of them), SNR and SNR<sub>dB</sub> from powers.',
      '<b>Solving:</b> propagation and transmission time (and total latency); wavelength, period, frequency, phase.',
      '<b>MCQ / Identification:</b> types of noise, attenuation vs distortion, baseband vs broadband, throughput vs bandwidth vs latency vs jitter, analog vs digital, periodic vs nonperiodic.',
      '<b>Essay:</b> Nyquist vs Shannon — when each applies and why more levels can’t raise the rate forever; the summary points on slide 38.'
    ],
    sections: [
      { kind: 'intuition', title: 'Notes, chords and how much road you need', viz: 'l02.sine',
        analogy: 'A sine wave is a single musical note: its <b>loudness</b> is the amplitude, its <b>pitch</b> the frequency, and <i>when</i> it starts is the phase. A real sound is a <b>chord</b> — many notes at once (a composite signal) — and the spread from its lowest to its highest note is its <b>bandwidth</b>. ' +
          'Sharp-edged digital pulses need many high “notes”, so they need a wide road.',
        predict: [
          { q: 'You add the odd harmonics 3f, 5f, 7f and 9f to a sine wave of frequency f. What happens?',
            choices: ['The signal stays a sine wave', 'It approaches a square wave and its bandwidth grows', 'The frequency doubles'], answer: 1,
            explain: 'Fourier: a composite signal is a combination of sine waves. Adding odd harmonics with falling amplitudes sharpens the edges toward a square wave, and the bandwidth (highest − lowest frequency) grows. [L02 p11; L02 p12]',
            set: { harm: [3, 5, 7, 9] } },
          { q: 'A channel has SNR<sub>dB</sub> = 0 dB. What is its Shannon capacity?',
            choices: ['0 bps', 'B bps (because SNR = 1 and log₂2 = 1)', 'Infinite'], answer: 1,
            explain: '0 dB means SNR = 10⁰ = 1, so C = B log₂(1 + 1) = B. Shannon needs the plain ratio — never put the dB value into the formula. [L02 p31]' }
        ] },

      { kind: 'notes', id: 'signals', title: 'Analog vs digital, periodic vs nonperiodic', ref: 'L02 pp3-5', html:
        '<p>An <b>analog signal</b> has infinitely many levels of intensity over a period of time; a <b>digital signal</b> can have only a limited number of defined values. Signals are plotted with value (strength) on the vertical axis and time on the horizontal.' + ref('L02 p4') + '</p>' +
        '<p>A <b>periodic signal</b> repeats a pattern within a time frame called a <b>period</b>; one full pattern is a <b>cycle</b>. A <b>nonperiodic signal</b> changes without a repeating pattern. Both analog and digital signals can be periodic or nonperiodic.' + ref('L02 p5') + '</p>' },

      { kind: 'notes', id: 'sine', title: 'The sine wave: amplitude, frequency, period, phase', ref: 'L02 pp6-8', html:
        '<p>A sine wave is described by three parameters — <b>amplitude</b>, <b>frequency</b> and <b>phase</b>.' + ref('L02 p6') + '</p><ul>' +
        '<li><b>(Peak) amplitude</b>: the absolute value of the highest intensity, proportional to the energy carried.</li>' +
        '<li><b>Frequency</b>: the number of periods in 1 s, in hertz (Hz = cycles per second). <b>Period</b>: the time in seconds to complete one cycle. <b>f = 1/T</b>, <b>T = 1/f</b>.</li>' +
        '<li><b>Phase</b> (phase shift): the position of the waveform relative to time 0, in degrees or radians.</li></ul>' +
        '<figure data-fig="l02.sine"></figure>' +
        '<figure data-fig="l02.phase" data-caption="Slide 8: the same sine wave shifted by 0°, 90°, 180° and 270°."></figure>' },
      { kind: 'example', title: 'Frequency and period (slide 7)', ref: 'L02 p7', gen: 'l02.wave', params: { find: 'fT', cycles: 4, seconds: 1 },
        slideAnswer: 'f = 4 Hz, T = 1/4 s', slideValue: 4, input: 'f' },
      { kind: 'example', title: 'Phase from a time shift', ref: 'L02 p8', gen: 'l02.wave', params: { find: 'phase', f: 250, shift: 0.001 } },

      { kind: 'notes', id: 'wavelength', title: 'Wavelength', ref: 'L02 pp9-10', html:
        '<p><b>Wavelength</b> binds the period or frequency of a sine wave to the propagation speed of the medium: λ = propagation speed × period = <b>c / f</b>, with c = 3×10⁸ m/s in free space (the speed of light).' + ref('L02 p9') + '</p>' },
      { kind: 'example', title: 'Wavelength of red light', ref: 'L02 p10', gen: 'l02.wave', params: { find: 'lambda', f: 4e14, v: 3e8 },
        slideAnswer: 'λ = 3×10⁸ / 4×10¹⁴ = 0.75×10⁻⁶ m = 0.75 µm', slideValue: 7.5e-7, input: 'lambda' },

      { kind: 'notes', id: 'composite', title: 'Composite signals and bandwidth', ref: 'L02 pp11-13', html:
        '<p>A <b>composite signal</b> is made of many simple sine waves with different frequencies, amplitudes and phases (Fourier); it can be periodic or nonperiodic.' + ref('L02 p11') +
        ' Slide 12’s signal is built from f, 3f and 9f; the main frequency is the <b>fundamental frequency</b>.' + ref('L02 p12') + '</p>' +
        '<figure data-fig="l02.composite"></figure>' +
        '<p>The <b>bandwidth</b> of a composite signal is the range of frequencies it contains — a <b>difference between two numbers</b>: highest − lowest.' + ref('L02 p13') + '</p>' +
        '<figure data-fig="l02.spectrum"></figure>' +
        seCallout('Slide 11', 'Fourier showed this “in the early 1900s”', 'Fourier’s work dates from the early 1800s (a slide-based question may still say 1900s).') },
      { kind: 'example', title: 'Bandwidth of a periodic signal', ref: 'L02 p13', gen: 'l02.bandwidth', params: { find: 'B', fLow: 1000, fHigh: 5000 },
        slideAnswer: 'B = 5000 − 1000 = 4000 Hz', slideValue: 4000, input: 'B' },

      { kind: 'notes', id: 'digital', title: 'Digital signals: levels, bit rate, bit length', ref: 'L02 p14', html:
        '<p>A digital signal can have more than two levels: with <b>L levels</b>, each level carries <b>log₂ L bits</b>. Most digital signals are nonperiodic, so period and frequency don’t describe them; we use:</p><ul>' +
        '<li><b>Bit rate</b> — the number of bits sent in 1 s (bps). Slide 14: two levels, 8 signal elements in 1 s → 8 bps; four levels → 16 bps.</li>' +
        '<li><b>Bit length</b> — the distance one bit occupies on the medium. <span class="badge beyond">Beyond slides</span> textbook formula: bit length = propagation speed × bit duration.</li></ul>' + ref('L02 p14') },
      { kind: 'example', title: 'Four levels: bits per level and bit rate', ref: 'L02 p14', gen: 'l02.nyquist', params: { find: 'digital', elements: 8, L: 4 },
        slideAnswer: '2 bits per level; 16 bits sent in 1 s → 16 bps', slideValue: 16, input: 'N' },

      { kind: 'notes', id: 'transmission', title: 'Baseband and broadband transmission', ref: 'L02 pp15-18', html:
        '<p><b>Baseband transmission</b> sends a digital signal without changing it to an analog signal. It needs a wide-bandwidth (low-pass) channel — a dedicated medium whose bandwidth forms a single channel.' + ref('L02 p16') +
        ' In a low-pass channel with limited bandwidth the digital signal is approximated by an analog signal; how good the approximation is depends on the bandwidth available.' + ref('L02 p17') + '</p>' +
        '<figure data-fig="l02.lowpass"></figure>' +
        '<p><b>Broadband transmission</b> changes the digital signal to an analog signal (modulation), which lets us use a <b>bandpass channel</b> — one whose bandwidth does not start from zero.' + ref('L02 p18') + '</p>' +
        seCallout('Slides 16 and 18', 'The baseband channel is drawn from f₁ to f₂, and the receiver’s waveform on slide 18 is labelled “input”', 'A baseband channel is low-pass (it starts at 0 Hz); the receiver side shows the output signal.') },

      { kind: 'notes', id: 'impairments', title: 'Transmission impairments: attenuation, distortion, noise', ref: 'L02 pp19-24', html:
        '<p><b>Attenuation</b> is a loss of energy: a signal loses some energy overcoming the resistance of the medium. Amplifiers compensate for the loss. Engineers express gain or loss in <b>decibels</b>.' + ref('L02 p20') + '</p>' +
        '<p class="mono">dB = 10 log₁₀ (P₂ / P₁)</p><p>The decibel measures the relative strength of two signals, or of one signal at two points; it is <b>negative when the signal is attenuated</b> and <b>positive when it is amplified</b>.' + ref('L02 p21') + '</p>' +
        '<figure data-fig="l02.attenuation"></figure>' +
        '<p><b>Distortion</b> means the signal changes its form or shape. It happens in composite signals: the component frequencies travel at different speeds and arrive at different times.' + ref('L02 p23') + '</p>' +
        '<p><b>Noise</b> corrupts the signal at the receiver:' + ref('L02 p24') + '</p><ul>' +
        '<li><b>Thermal</b> — random motion of electrons in a wire.</li>' +
        '<li><b>Induced</b> — from motors and appliances: the source acts as a sending antenna and the medium as a receiving antenna.</li>' +
        '<li><b>Crosstalk</b> — signals jumping from one wire to an adjacent one.</li>' +
        '<li><b>Impulse</b> — a spike from power lines, lightning and the like.</li></ul>' +
        seCallout('Slide 22', '“its power is reduced to one-half. This means that P2 = P1.”', 'P₂ = 0.5 P₁ (the ½ is missing), so 10 log₁₀ 0.5 = −3 dB.') },
      { kind: 'example', title: 'Power halved: attenuation in dB', ref: 'L02 p22', gen: 'l02.db', params: { find: 'dB', P1: 1, P2: 0.5 },
        slideAnswer: '10 log₁₀ 0.5 = 10(−0.3) = −3 dB', slideValue: -3.0103, input: 'dB' },
      { kind: 'example', title: 'A chain of losses and an amplifier', ref: 'L02 p21', gen: 'l02.db', params: { find: 'chain', Pin: 0.002, stages: [-10, 30, -10] } },

      { kind: 'notes', id: 'snr', title: 'Signal-to-noise ratio (SNR)', ref: 'L02 pp25-26', html:
        '<p>SNR is the ratio of what is wanted (signal) to what is not wanted (noise): <b>SNR = average signal power / average noise power</b>, and <b>SNR<sub>dB</sub> = 10 log₁₀ SNR</b>. ' +
        'A high SNR means the signal is less corrupted by noise; a low SNR means it is more corrupted.' + ref('L02 p25') + '</p>' },
      { kind: 'example', title: 'SNR and SNR in dB', ref: 'L02 p26', gen: 'l02.db', params: { find: 'snr', Ps: 0.01, Pn: 0.000001 },
        slideAnswer: 'SNR = 10,000 µW / 1 µW = 10,000; SNR<sub>dB</sub> = 10 log₁₀ 10⁴ = 40 dB', slideValue: 40, input: 'SNRdB' },

      { kind: 'notes', id: 'limits', title: 'Data-rate limits: Nyquist and Shannon', ref: 'L02 pp27-33', html:
        '<p>How fast we can send data (bps) depends on three things: the <b>bandwidth</b> available, the <b>number of signal levels</b>, and the <b>quality of the channel</b> (its noise). Two theoretical formulas apply.' + ref('L02 p28') + ' (Data rates use decimal prefixes: 1000 kbps = 1 Mbps.)' + ref('L02 p27') + '</p>' +
        '<h4>Nyquist bit rate — noiseless channel</h4><p class="mono">BitRate = 2 × bandwidth × log₂ L</p>' +
        '<p>It assumes no noise. More levels raise the bit rate, but the receiver must still be able to tell the levels apart.' + ref('L02 p29') + '</p>' +
        '<h4>Shannon capacity — noisy channel</h4><p class="mono">Capacity = bandwidth × log₂(1 + SNR)</p>' +
        '<p>There is no signal level in it: the number of levels does not change the capacity of the channel. SNR here is the plain ratio, not dB.' + ref('L02 p31') + '</p>' +
        '<h4>Using both (slide 33)</h4><p>Shannon gives the <b>upper limit</b>; choose a lower rate for better performance, then use Nyquist to find the number of signal levels.' + ref('L02 p33') + '</p>' },
      { kind: 'example', title: 'Nyquist: noiseless 3000 Hz channel, 2 levels', ref: 'L02 p30', gen: 'l02.nyquist', params: { find: 'N', B: 3000, L: 2 },
        slideAnswer: '2 × 3000 × log₂2 = 6000 bps', slideValue: 6000, input: 'N' },
      { kind: 'example', title: 'Shannon: telephone line, B = 3000 Hz, SNR = 3162', ref: 'L02 p32', gen: 'l02.shannon', params: { find: 'C', B: 3000, snr: 3162 },
        slideAnswer: '3000 × 11.62 = 34,860 bps on the slide (it rounds log₂3163 to 11.62); exact 34,881 bps', slideValue: 34881.23, input: 'C' },
      { kind: 'example', title: 'Nyquist and Shannon together', ref: 'L02 p33', gen: 'l02.capacity', params: { B: 1e6, snr: 63, N: 4e6 },
        slideAnswer: 'C = 10⁶ log₂64 = 6 Mbps (upper limit); use 4 Mbps → 4 Mbps = 2 × 1 MHz × log₂L → L = 4', slideValue: 4, input: 'L' },

      { kind: 'notes', id: 'performance', title: 'Performance: bandwidth, throughput, latency, jitter', ref: 'L02 pp34-37', html:
        '<ul><li><b>Bandwidth</b> can be in hertz or in bits per second — the higher the bandwidth in Hz, the higher the bit rate.</li>' +
        '<li><b>Throughput</b> is how fast we can actually send data: a link of bandwidth B bps carries only T bps, with T always less than B.</li>' +
        '<li><b>Latency</b> (delay) is how long a whole message takes to arrive, from the moment its first bit is sent.</li>' +
        '<li><b>Jitter</b> is the difference in delay (latency) between packets.</li></ul>' + ref('L02 p34') +
        '<p class="mono">Latency = propagation time + transmission time + queuing time + processing delay</p>' +
        '<p><b>Propagation time</b> = distance / propagation speed. <b>Transmission time</b> = message size / bandwidth.' + ref('L02 p35') + '</p>' +
        '<figure data-fig="l02.latency"></figure>' },
      { kind: 'example', title: 'Propagation and transmission time of an e-mail', ref: 'L02 p37', gen: 'l02.latency', params: { d: 12e6, v: 2.4e8, bytes: 2500, bw: 1e9 },
        slideAnswer: 'Propagation = (12,000 × 1000) / (2.4 × 10⁸) = 50 ms; transmission = (2500 × 8) / 10⁹ = 0.020 ms', slideValue: 0.05, input: 'Tp' },

      { kind: 'notes', id: 'summary', title: 'Summary (slide 38)', ref: 'L02 p38', html:
        '<div class="callout key"><div class="callout-label">★ Likely assessed — the slide-38 summary</div><ul>' +
        '<li>In data communications we commonly use <b>periodic analog</b> signals and <b>nonperiodic digital</b> signals.</li>' +
        '<li>A digital signal is a <b>composite analog signal with an infinite bandwidth</b>.</li>' +
        '<li>For a <b>noiseless</b> channel, the <b>Nyquist</b> bit-rate formula gives the theoretical maximum bit rate.</li>' +
        '<li>For a <b>noisy</b> channel, use the <b>Shannon</b> capacity to find the maximum bit rate.</li>' +
        '<li><b>Attenuation, distortion and noise</b> impair a signal.</li></ul></div>' },

      { kind: 'formulas', ids: ['l02.freq', 'l02.lambda', 'l02.phase', 'l02.bw', 'l02.levels', 'l02.db', 'l02.snr', 'l02.nyquist', 'l02.shannon', 'l02.latency', 'l02.bitlength'] },
      { kind: 'practice', gens: ['l02.sketch', 'l02.wave', 'l02.bandwidth', 'l02.db', 'l02.nyquist', 'l02.shannon', 'l02.capacity', 'l02.latency'] },
      { kind: 'quick', n: 8 },
      { kind: 'traps', items: [
        { trap: 'Putting SNR in dB into Shannon’s formula', fix: 'Convert first: SNR = 10^(dB/10). 30 dB → 1000, not 30.', ref: 'L02 p31' },
        { trap: 'Using Nyquist on a noisy channel to get the maximum rate', fix: 'Nyquist assumes no noise; the noisy-channel ceiling is Shannon’s. Use Shannon first, then Nyquist for L.', ref: 'L02 p38' },
        { trap: 'Thinking more levels always raise the rate', fix: 'Nyquist grows with log₂L, but the receiver must distinguish the levels; Shannon’s limit has no L at all.', ref: 'L02 p29; L02 p31' },
        { trap: 'Forgetting the sign in dB', fix: 'Loss → negative dB, gain → positive. Half power = −3 dB.', ref: 'L02 p21; L02 p22' },
        { trap: 'Mixing bytes and bits in transmission time', fix: 'Message size in bits = bytes × 8 (2.5 KB = 2500 × 8 = 20,000 bits).', ref: 'L02 p37' },
        { trap: 'Adding powers instead of dB', fix: 'Gains and losses of cascaded stages add in dB; powers multiply.', ref: 'L02 p21; Forouzan' },
        { trap: 'Confusing attenuation with distortion', fix: 'Attenuation = loss of energy; distortion = change of shape (components arrive at different times).', ref: 'L02 p20; L02 p23' }
      ] },
      { kind: 'mnemonics', items: [
        'Nyquist is <b>N</b>oiseless and has <b>2</b> in front: N = <b>2</b>B log₂L. Shannon is for <b>S</b>tatic (noise): C = B log₂(1 + SNR).',
        '“3 dB = half”: every −3 dB halves the power; every −10 dB divides it by 10.',
        'Latency = “<b>P</b>lease <b>T</b>ake <b>Q</b>uick <b>P</b>ictures”: propagation + transmission + queuing + processing.',
        'Noise types — “<b>T</b>hermal <b>I</b>nduced <b>C</b>ross<b>t</b>alk <b>I</b>mpulse”: TICI.',
        'Phase: 0° up from zero, 90° at the peak, 180° down through zero, 270° at the trough.'
      ] },
      { kind: 'recall', prompts: [
        'Define amplitude, frequency, period, phase and wavelength; redo the red-light wavelength example.',
        'What is a composite signal? Compute the bandwidth of the slide-13 signal.',
        'Explain baseband vs broadband transmission and low-pass vs bandpass channels.',
        'Write the dB and SNR formulas; redo slides 22 and 26.',
        'Write the Nyquist and Shannon formulas and redo slides 30, 32 and 33.',
        'Define throughput, latency and jitter; redo the slide-37 latency example.',
        'Recite the five summary points of slide 38.'
      ] }
    ],
    slideErrors: [
      { ref: 'L02 p11', says: 'Fourier showed this “in the early 1900s”', correct: 'Early 1800s.' },
      { ref: 'L02 p22', says: '“This means that P2 = P1.”', correct: 'P₂ = 0.5 P₁ — the ½ is missing; the answer is −3 dB.' },
      { ref: 'L02 p20', says: 'Unit written “db”', correct: 'dB (decibel).' },
      { ref: 'L02 p7', says: 'The note writes the period as “t”, and one “Amplitude” arrow spans crest to trough', correct: 'Period T = 1/f; peak amplitude is measured from the axis to the crest.' },
      { ref: 'L02 p26', says: 'Answer written as “40” with units “μw”', correct: 'SNR<sub>dB</sub> = 40 dB; the powers are in µW.' },
      { ref: 'L02 p16', says: 'Baseband channel drawn from f₁ to f₂', correct: 'A baseband (low-pass) channel starts at 0 Hz.' }
    ],
    glossary: [
      { term: 'Analog signal', def: 'A signal with infinitely many levels of intensity over a period of time.', ref: 'L02 p4' },
      { term: 'Digital signal', def: 'A signal that can take only a limited number of defined values.', ref: 'L02 p4' },
      { term: 'Periodic signal', def: 'A signal that repeats a pattern every period; one full pattern is a cycle.', ref: 'L02 p5' },
      { term: 'Nonperiodic signal', def: 'A signal that changes without a repeating pattern.', ref: 'L02 p5' },
      { term: 'Amplitude', alt: ['peak amplitude'], def: 'The absolute value of a signal’s highest intensity, proportional to the energy it carries.', ref: 'L02 p6' },
      { term: 'Frequency', def: 'The number of periods in 1 s, in hertz (Hz); f = 1/T.', ref: 'L02 p6' },
      { term: 'Period', def: 'The time, in seconds, a signal needs to complete one cycle; T = 1/f.', ref: 'L02 p6' },
      { term: 'Phase', def: 'The position of the waveform relative to time 0, in degrees or radians.', ref: 'L02 p6' },
      { term: 'Wavelength', def: 'λ = propagation speed × period = c/f; binds frequency to the medium’s propagation speed.', ref: 'L02 p9' },
      { term: 'Composite signal', def: 'A signal made of many simple sine waves with different frequencies, amplitudes and phases (Fourier).', ref: 'L02 p11' },
      { term: 'Fundamental frequency', def: 'The main (lowest) frequency of a composite signal.', ref: 'L02 p12' },
      { term: 'Bandwidth', def: 'The range of frequencies in a composite signal: highest minus lowest.', ref: 'L02 p13' },
      { term: 'Bit rate', def: 'The number of bits sent in 1 s (bps).', ref: 'L02 p14' },
      { term: 'Bit length', def: 'The distance one bit occupies on the transmission medium.', ref: 'L02 p14' },
      { term: 'Baseband transmission', def: 'Sending a digital signal over a (low-pass) channel without converting it to analog.', ref: 'L02 p16' },
      { term: 'Broadband transmission', def: 'Changing the digital signal to an analog one (modulation) so it can use a bandpass channel.', ref: 'L02 p18' },
      { term: 'Bandpass channel', def: 'A channel whose bandwidth does not start from zero.', ref: 'L02 p18' },
      { term: 'Attenuation', def: 'Loss of signal energy while overcoming the resistance of the medium; measured in dB.', ref: 'L02 p20' },
      { term: 'Decibel', alt: ['dB'], def: 'dB = 10 log₁₀(P₂/P₁): relative strength of two signals, negative for a loss and positive for a gain.', ref: 'L02 p21' },
      { term: 'Distortion', def: 'A change in a signal’s form or shape; components of a composite signal arrive at different times.', ref: 'L02 p23' },
      { term: 'Thermal noise', def: 'Noise from the random motion of electrons in a wire.', ref: 'L02 p24' },
      { term: 'Induced noise', def: 'Noise from motors and appliances acting as sending antennas, with the medium as the receiving antenna.', ref: 'L02 p24' },
      { term: 'Crosstalk', def: 'Noise from signals jumping from one wire to an adjacent wire.', ref: 'L02 p24' },
      { term: 'Impulse noise', def: 'A spike from power lines, lightning and the like.', ref: 'L02 p24' },
      { term: 'SNR', alt: ['signal-to-noise ratio'], def: 'Average signal power / average noise power; SNR_dB = 10 log₁₀ SNR.', ref: 'L02 p25' },
      { term: 'Nyquist bit rate', def: 'Maximum bit rate of a noiseless channel: 2 × B × log₂L.', ref: 'L02 p29' },
      { term: 'Shannon capacity', def: 'Maximum bit rate of a noisy channel: B × log₂(1 + SNR); independent of the number of levels.', ref: 'L02 p31' },
      { term: 'Throughput', def: 'How fast data can actually be sent through a network; always less than the link’s bandwidth.', ref: 'L02 p34' },
      { term: 'Latency', def: 'Time for an entire message to arrive: propagation + transmission + queuing + processing.', ref: 'L02 p34; L02 p35' },
      { term: 'Jitter', def: 'The difference in delay (latency) between packets.', ref: 'L02 p34' }
    ],
    cheat: [
      { title: 'L02 · Signals & bandwidth', html: '<ul>' +
        '<li>Analog = infinite levels · digital = limited levels; periodic vs nonperiodic</li>' +
        '<li><em class="k">f = 1/T</em> (Hz) · 4 cycles in 1 s → 4 Hz, T = ¼ s · phase 0°/90°/180°/270° = 0↑ / peak / 0↓ / trough</li>' +
        '<li><em class="k">λ = c/f</em>, c = 3×10⁸ m/s · red light 4×10¹⁴ Hz → <em class="k">0.75 µm</em></li>' +
        '<li>Composite = sum of sines (Fourier); <em class="k">B = f<sub>high</sub> − f<sub>low</sub></em> (5000 − 1000 = 4000 Hz)</li>' +
        '<li>Digital signal = composite with <em class="k">infinite bandwidth</em>; L levels → log₂L bits per level</li>' +
        '<li>Baseband → low-pass channel (first harmonic B = N/2) · broadband → modulation onto a <em class="k">bandpass</em> channel</li></ul>' },
      { title: 'L02 · dB, SNR & noise', html: '<ul>' +
        '<li><em class="k">dB = 10 log₁₀(P₂/P₁)</em>; loss negative, gain positive; half power = <em class="k">−3 dB</em></li>' +
        '<li>dB of cascaded stages add; P<sub>out</sub> = P<sub>in</sub> × 10^(dB/10)</li>' +
        '<li><em class="k">SNR = P<sub>s</sub>/P<sub>n</sub></em>; SNR<sub>dB</sub> = 10 log₁₀ SNR · 10 mW / 1 µW → 10,000 → <em class="k">40 dB</em></li>' +
        '<li>Noise: <em class="k">thermal</em> (electrons), <em class="k">induced</em> (motors), <em class="k">crosstalk</em> (adjacent wire), <em class="k">impulse</em> (spikes)</li>' +
        '<li>Attenuation = energy loss · distortion = shape change</li></ul>' },
      { title: 'L02 · Rate limits & latency', html: '<ul>' +
        '<li>Nyquist (noiseless): <em class="k">N = 2B log₂L</em> · 3000 Hz, L = 2 → <em class="k">6000 bps</em></li>' +
        '<li>Shannon (noisy): <em class="k">C = B log₂(1 + SNR)</em>, SNR linear · 3000 Hz, 3162 → <em class="k">≈34.86 kbps</em></li>' +
        '<li>Slide 33: 1 MHz, SNR 63 → C = <em class="k">6 Mbps</em>; use 4 Mbps → <em class="k">L = 4</em></li>' +
        '<li><em class="k">Latency = T<sub>prop</sub> + T<sub>trans</sub> + T<sub>queue</sub> + T<sub>proc</sub></em></li>' +
        '<li>T<sub>prop</sub> = d/v · T<sub>trans</sub> = size/bandwidth · 12,000 km at 2.4×10⁸ m/s → <em class="k">50 ms</em>; 2.5 KB at 1 Gbps → <em class="k">0.020 ms</em></li>' +
        '<li>Throughput &lt; bandwidth · jitter = variation in delay</li></ul>' }
    ]
  });
})();
