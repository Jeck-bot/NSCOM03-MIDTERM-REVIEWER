/* L03b — PCM, delta modulation, transmission modes (L03 slides 62–96). Owner: Lead. */
(function () {
  'use strict';
  var T = 'l03b';
  function ref(p) { return ' <span class="chip ref">' + p + '</span>'; }

  KIT.formula({ id: 'l03b.fs', topic: T, name: 'Sampling rate', html: 'f<sub>s</sub> = 1 / T<sub>s</sub>', where: 'T<sub>s</sub> = sampling interval (s); f<sub>s</sub> in samples/s', ref: 'L03 p64', sheet: true });
  KIT.formula({ id: 'l03b.nyquist', topic: T, name: 'Nyquist sampling theorem', html: 'f<sub>s</sub> ≥ 2 × f<sub>max</sub>',
    where: 'f<sub>max</sub> = highest frequency in the signal — for low-pass and bandpass signals alike', ref: 'L03 p66; L03 p67', sheet: true });
  KIT.formula({ id: 'l03b.delta', topic: T, name: 'Zone height (quantization step)', html: 'Δ = (max − min) / L', where: 'L = number of zones (levels)', ref: 'L03 p72', sheet: true });
  KIT.formula({ id: 'l03b.nb', topic: T, name: 'Bits per sample', html: 'n<sub>b</sub> = log<sub>2</sub> L', where: 'L is a power of 2 in the slides; otherwise round up (textbook)', ref: 'L03 p75', sheet: true });
  KIT.formula({ id: 'l03b.bitrate', topic: T, name: 'PCM bit rate', html: 'N = n<sub>b</sub> × f<sub>s</sub>', where: 'bits/sample × samples/s', ref: 'L03 p79', sheet: true });
  KIT.formula({ id: 'l03b.bmin', topic: T, name: 'Minimum PCM bandwidth', html: 'B<sub>min</sub> = n<sub>b</sub> × f<sub>max</sub>',
    where: 'NRZ-type line code (c = ½, r = 1): B<sub>min</sub> = N/2', note: 'Slide example 10: 8 × 4 kHz = 32 kHz.', ref: 'L03 p83', sheet: true });
  KIT.formula({ id: 'l03b.qerror', topic: T, name: 'Quantization error bound', html: '|error| ≤ Δ / 2', where: 'error = quantized (midpoint) − actual', ref: 'L03 p76; L03 p78', sheet: true });
  KIT.formula({ id: 'l03b.snqr', topic: T, name: 'SNQR (textbook)', html: 'SNQR<sub>dB</sub> ≈ 6.02 n<sub>b</sub> + 1.76', where: 'each extra bit per sample adds about 6 dB', ref: 'Forouzan', beyond: true, sheet: false });
  KIT.formula({ id: 'l03b.async', topic: T, name: 'Asynchronous efficiency', html: 'efficiency = data bits / (start + data + stop bits)', where: '8 data bits + 1 start + 1 stop → 8/10 = 80%', note: 'Worked out from the slide-92 frame; the slides give no formula.', ref: 'L03 p92; derived', sheet: false });

  var P76 = KIT.calc.pcm.quantizeSeries([-6.1, 7.5, 16.2, 19.7, 11.0, -5.5, -11.3, -9.4, -6.0], -20, 20, 8);
  function f2(x) { var s = KIT.fmt.num(x, 3); return x > 0 ? '+' + s : s; }
  var p76rows = [
    ['Original amplitude (V)', P76.map(function (r) { return KIT.fmt.num(r.value, 3); })],
    ['Normalized PAM value', P76.map(function (r) { return KIT.fmt.num(r.normalized, 3); })],
    ['Normalized quantized value', P76.map(function (r) { return KIT.fmt.num(r.normalizedQuantized, 3); })],
    ['Normalized error', P76.map(function (r, i) { return f2(r.normalizedError) + (i === 0 ? ' ⚠' : ''); })],
    ['Quantization code', P76.map(function (r) { return String(r.k); })],
    ['Encoded word', P76.map(function (r) { return '<span class="mono">' + r.code + '</span>'; })]
  ];
  var p76html = '<div class="table-wrap"><table class="tbl compact"><tbody>' + p76rows.map(function (row) {
    return '<tr><th>' + row[0] + '</th>' + row[1].map(function (c) { return '<td class="num">' + c + '</td>'; }).join('') + '</tr>';
  }).join('') + '</tbody></table></div>';

  KIT.topic({
    id: T,
    lecture: 3,
    title: 'Digital Transmission II: PCM, Delta Modulation & Transmission Modes',
    blurb: 'Turning an analog signal into bits (sample → quantize → encode), the one-bit delta-modulation alternative, and how bits travel: parallel vs serial, asynchronous vs synchronous.',
    highYield: ['Nyquist: f_s ≥ 2·f_max', 'Δ, zones and codes (slides 74–76)', 'N = n_b × f_s and B_min = n_b × f_max', 'Start/stop bits'],
    glance: [
      'PCM = <b>sampling → quantization → binary encoding</b>; filter first so the highest frequency is known. (Marked “Main Section 7” — expect a PCM problem.)',
      'Nyquist: sample at <b>f<sub>s</sub> ≥ 2 × f<sub>max</sub></b>, for low-pass and bandpass signals. Voice up to 4 kHz → 8000 samples/s. A bandpass signal with only its bandwidth known → the rate <b>cannot be determined</b>.',
      'Quantization: <b>Δ = (max − min)/L</b>; zones 0 … L−1 from the bottom; each sample becomes its zone’s <b>midpoint</b>; <b>n<sub>b</sub> = log₂L</b> bits; error ≤ Δ/2. More levels → less error but more bits.',
      '<b>N = n<sub>b</sub> × f<sub>s</sub></b> (8-bit voice → 64 kbps). Digitizing costs bandwidth: <b>B<sub>min</sub> = n<sub>b</sub> × f<sub>max</sub></b> with an NRZ-type line code (32 kHz instead of 4 kHz).',
      '<b>Delta modulation</b> sends 1 bit per sample (1 = step up δ, 0 = step down δ): fine for slow changes, poor for fast ones. <b>DPCM</b> quantizes the difference with more bits.',
      '<b>Parallel</b>: n bits per clock tick over n wires. <b>Serial</b>: 1 bit per tick — <b>asynchronous</b> (start 0 + byte + stop 1, gaps allowed), <b>synchronous</b> (no start/stop or gaps, frames), <b>isochronous</b> (equal, fixed gaps).'
    ],
    ask: [
      '<b>Solving:</b> minimum sampling rate for a low-pass or bandpass signal; sampling interval.',
      '<b>Solving:</b> Δ, zones, code word, quantized value and error for a sample (slides 74–76 style).',
      '<b>Solving:</b> PCM bit rate and minimum bandwidth (the voice example), sometimes from L instead of n<sub>b</sub>.',
      '<b>Solving:</b> delta-modulation bits for a sample sequence; asynchronous framing overhead.',
      '<b>MCQ / Identification:</b> ideal, natural and flat-top sampling; PAM; companding; hold circuit; DPCM; isochronous.',
      '<b>Essay:</b> explain the PCM steps and the trade-off between quantization error and bit rate; compare asynchronous and synchronous transmission.'
    ],
    sections: [
      { kind: 'intuition', title: 'Snapshots and a ruler', viz: 'l03b.pcm', params: { ratio: 4, L: 8 },
        analogy: '<b>Sampling</b> is a flip-book: with enough snapshots per second the motion looks smooth; with too few, the motion lies to you (like wagon wheels that seem to spin backwards in films). ' +
          '<b>Quantizing</b> is rounding every snapshot to the nearest tick on a ruler — more ticks mean smaller rounding errors, but every reading needs more digits (bits).',
        predict: [
          { q: 'A voice signal contains frequencies up to 4 kHz. You sample it 5000 times per second. What happens?',
            choices: ['It is perfectly recoverable', 'It cannot be recovered correctly — the samples trace a false, slower wave', 'It is recoverable if you use more quantization levels'], answer: 1,
            explain: 'Nyquist requires f<sub>s</sub> ≥ 2 × 4 kHz = 8000 samples/s. At 5000 the signal is undersampled, as in part (c) of slide 68 — more quantization levels cannot fix that. [L03 p66; L03 p68]',
            set: { ratio: 1.25 } },
          { q: 'You double the quantization levels from L = 8 to L = 16 at the same sampling rate. What happens to the bit rate?',
            choices: ['It doubles', 'It rises by one third (3 → 4 bits per sample)', 'It stays the same'], answer: 1,
            explain: 'n<sub>b</sub> = log₂L goes from 3 to 4, so N = n<sub>b</sub> × f<sub>s</sub> grows by 4/3. Doubling L adds just one bit per sample. [L03 p75; L03 p79]',
            set: { ratio: 4, L: 16 } }
        ] },

      { kind: 'notes', id: 'pcm', title: 'Pulse code modulation (PCM): three steps', ref: 'L03 pp62-63', html:
        '<p>PCM converts an analog signal into digital data in three steps: <b>sampling</b>, <b>quantization</b> and <b>binary encoding</b>.' + ref('L03 p62') + '</p>' +
        '<p>Before sampling, the signal is <b>filtered</b> to limit its maximum frequency, because f<sub>max</sub> decides the sampling rate. The filter must not distort the signal — ' +
        'it should not remove the high-frequency components that shape it.' + ref('L03 p62') + '</p>' +
        '<p>The encoder chain (slide 63): analog signal → <b>sampling</b> → PAM signal → <b>quantizing</b> → quantized signal → <b>encoding</b> → digital data — the figure in “Intuition first” above.' + ref('L03 p63') + '</p>' +
        '<div class="callout key"><div class="callout-label">★ High yield</div>The instructor marked PCM “Main Section 7” and its worked examples as sub-sections — expect a PCM computation.</div>' },

      { kind: 'notes', id: 'sampling', title: 'Sampling and the Nyquist theorem', ref: 'L03 pp64-68', html:
        '<p>The analog signal is sampled every <b>T<sub>s</sub></b> seconds (the sampling interval); <b>f<sub>s</sub> = 1/T<sub>s</sub></b> is the sampling rate. ' +
        'The process is called <b>pulse amplitude modulation (PAM)</b>, and its output still has analog (non-integer) values.' + ref('L03 p64') + '</p>' +
        '<table class="tbl compact"><thead><tr><th>Method</th><th>Each sample is …</th></tr></thead><tbody>' +
        '<tr><td><b>Ideal</b></td><td>an impulse at the sampling instant</td></tr>' +
        '<tr><td><b>Natural</b></td><td>a short pulse whose top follows the signal</td></tr>' +
        '<tr><td><b>Flat-top</b></td><td>a short pulse held at one amplitude (sample and hold)</td></tr></tbody></table>' +
        '<p><b>Nyquist theorem:</b> the sampling rate must be at least <b>2 times the highest frequency</b> in the signal: f<sub>s</sub> ≥ 2·f<sub>max</sub>.' + ref('L03 p66') +
        ' The slides give the Nyquist rate as 2 × f<sub>max</sub> for both <b>low-pass</b> and <b>bandpass</b> signals — so you must know f<sub>max</sub>.' + ref('L03 p67') + '</p>' +
        '<figure data-fig="l03b.sampling" data-caption="Slide 68: sampling a sine wave at 4f, at the Nyquist rate 2f, and below it."></figure>' +
        '<p>Sampling at the Nyquist rate gives a good approximation; oversampling gives the same approximation but is redundant; undersampling does not produce a signal that looks like the original.' + ref('L03 p68') + '</p>' },
      { kind: 'example', title: 'Telephone voice', ref: 'L03 p69', gen: 'l03b.sampling', params: { kind: 'lowpass', fmax: 4000 },
        slideAnswer: '8000 samples per second', slideValue: 8000, input: 'fs' },
      { kind: 'example', title: 'Low-pass signal with a 200 kHz bandwidth', ref: 'L03 p70', gen: 'l03b.sampling', params: { kind: 'lowpass', fmax: 200e3 },
        slideAnswer: '400,000 samples per second', slideValue: 400e3, input: 'fs' },
      { kind: 'example', title: 'Bandpass signal with a 200 kHz bandwidth', ref: 'L03 p71', gen: 'l03b.sampling', params: { kind: 'bandpass-unknown', bandwidth: 200e3 },
        slideAnswer: 'cannot be determined — we do not know where the band starts or ends' },

      { kind: 'notes', id: 'quantization', title: 'Quantization and encoding', ref: 'L03 pp72-78', html:
        '<p>Sampling gives pulses whose amplitudes can be any value between a minimum and a maximum. Quantization maps them onto a finite set: divide the range into <b>L zones</b> of height ' +
        '<b>Δ = (max − min)/L</b>.' + ref('L03 p72') + ' Each zone’s <b>midpoint</b> is the value that every sample in that zone becomes; zones are numbered 0 to L − 1.' + ref('L03 p73') + '</p>' +
        '<p><b>Slide example:</b> −20 V to +20 V with L = 8 → Δ = (20 − (−20))/8 = <b>5 V</b>. Zones: −20 to −15, −15 to −10, … , +15 to +20; midpoints −17.5, −12.5, −7.5, −2.5, 2.5, 7.5, 12.5, 17.5.' + ref('L03 p74') + '</p>' +
        '<p><b>Encoding:</b> n<sub>b</sub> = log₂L bits per sample — here 3. The codes run 000 (−20 to −15 V), 001 (−15 to −10 V), … , 111 (+15 to +20 V).' + ref('L03 p75') + '</p>' +
        '<figure data-fig="l03b.quant" data-caption="Slide 76: nine samples, their zone midpoints and 3-bit codes."></figure>' + p76html +
        '<div class="callout slide-error"><div class="callout-label">⚠ Slide says / correct</div><div class="says-correct"><b>Slide 76</b><span>first normalized error −0.38</span>' +
        '<b>Correct</b><span>−1.50 − (−1.22) = <b>−0.28</b>. Every other cell checks out.</span></div></div>' +
        '<h4>Quantization error</h4><ul>' +
        '<li>The coded value (midpoint) is only an approximation: the difference is the <b>quantization error</b>, at most Δ/2 in size.' + ref('L03 p77') + '</li>' +
        '<li>More zones → smaller Δ → smaller error, <b>but</b> more bits per sample → higher bit rate.' + ref('L03 p77') + '</li>' +
        '<li>Because the error range Δ/2 is fixed, <b>low-amplitude signals suffer more</b> (worse SNQR). Fixes: <b>non-linear quantization</b> (smaller Δ at low amplitudes, logarithmic zones) and ' +
        '<b>companding</b> (compress at the sender, expand at the receiver).' + ref('L03 p78') + '</li>' +
        '<li><span class="badge beyond">Beyond slides</span> Textbook rule of thumb: SNQR ≈ 6.02 n<sub>b</sub> + 1.76 dB — each extra bit adds about 6 dB.</li></ul>' },
      { kind: 'example', title: 'Quantize −6.1 V (the first sample of slide 76)', ref: 'L03 p74; L03 p76', gen: 'l03b.quant', params: { vmax: 20, L: 8, value: -6.1 },
        slideAnswer: 'zone 2 → code 010, quantized −7.5 V (normalized −1.50), error −1.4 V (normalized −0.28)', slideValue: -7.5, input: 'mid' },

      { kind: 'notes', id: 'bitrate', title: 'PCM bit rate, bandwidth and decoding', ref: 'L03 pp79-83', html:
        '<p><b>Bit rate = n<sub>b</sub> × f<sub>s</sub></b>. The bandwidth needed depends on the line code (see L03a). A digitized signal always needs <b>more bandwidth</b> than the original analog signal — ' +
        'the price of robustness and the other features of digital transmission.' + ref('L03 p79') + '</p>' +
        '<ul><li><b>Example 9:</b> voice (0–4000 Hz), 8 bits per sample → f<sub>s</sub> = 8000 samples/s → N = 8000 × 8 = <b>64 kbps</b>.' + ref('L03 p80') + '</li>' +
        '<li><b>Example 10:</b> sending the 4 kHz analog signal needs 4 kHz; digitized with 8 bits per sample it needs at least 8 × 4 kHz = <b>32 kHz</b> (B<sub>min</sub> = N/2 for an NRZ-type code).' + ref('L03 p83') + '</li></ul>' +
        '<p><b>PCM decoder:</b> a <b>hold circuit</b> keeps each pulse’s amplitude until the next pulse arrives (a staircase), then a <b>low-pass filter</b> with cutoff equal to the highest frequency of the pre-sampled ' +
        'signal smooths it. The higher L, the less distorted the recovered signal.' + ref('L03 p81') + ref('L03 p82') + '</p>' },
      { kind: 'example', title: 'Digitized voice: bit rate and bandwidth', ref: 'L03 p80; L03 p83', gen: 'l03b.pcm', params: { fmax: 4000, nb: 8 },
        slideAnswer: '8000 samples/s; 64 kbps (slide 80); minimum bandwidth 32 kHz (slide 83)', slideValue: 64000, input: 'N' },

      { kind: 'notes', id: 'dm', title: 'Delta modulation (DM) and DPCM', ref: 'L03 pp84-88', html:
        '<p>Delta modulation sends <b>only the change</b> between samples: if the next sample is higher than the current staircase, send <b>1</b> (step up by δ); if lower — or equal — send <b>0</b> (step down by δ). ' +
        'Slide 84 words it as comparing each pulse with the previous pulse; the slide-85 figure, like the textbook, compares the sample with the staircase — the two agree while the staircase keeps up with the signal. ' +
        'It works well for small changes between samples, but large changes cause large errors.' + ref('L03 p84') + '</p>' +
        '<figure data-fig="l03b.dm" data-caption="Slide 85: the generated bits 0 1 1 1 1 1 1 0 0 0 0 0 0 1 1 — one step down, six up, six down, two up."></figure>' +
        '<ul><li><b>Modulator:</b> comparator + staircase maker + delay unit (the delayed staircase is compared with the next sample).' + ref('L03 p86') + '</li>' +
        '<li><b>Demodulator:</b> staircase maker + delay unit + low-pass filter.' + ref('L03 p87') + '</li>' +
        '<li><b>DPCM:</b> instead of one bit, quantize the difference with several bits — more bits, more levels, higher accuracy.' + ref('L03 p88') + '</li></ul>' },
      { kind: 'example', title: 'Delta-modulation bits', ref: 'L03 p85', gen: 'l03b.dm',
        params: { start: 2, delta: 1, samples: [1.6, 1.8, 2.5, 3.6, 4.5, 5.5, 6.3, 6.4, 5.6, 4.4, 3.5, 2.6, 1.8, 1.4, 2.3] },
        slideAnswer: '011111100000011 — the samples were chosen to reproduce the slide’s generated bits' },

      { kind: 'notes', id: 'modes', title: 'Transmission modes: parallel and serial', ref: 'L03 pp89-96', html:
        '<p>Binary data crosses a link in <b>parallel</b> or <b>serial</b> mode.' + ref('L03 p89') + '</p>' +
        '<table class="tbl compact"><thead><tr><th>Mode</th><th>How</th><th>Notes</th></tr></thead><tbody>' +
        '<tr><td><b>Parallel</b></td><td>multiple bits with each clock tick</td><td>8 bits sent together need 8 lines' + ref('L03 p90') + '</td></tr>' +
        '<tr><td><b>Serial</b></td><td>1 bit with each clock tick</td><td>one line; parallel/serial converters at each end' + ref('L03 p91') + '</td></tr>' +
        '<tr><td>&nbsp;↳ <b>Asynchronous</b></td><td>1 start bit (0) at the beginning and 1 or more stop bits (1) at the end of every byte</td><td>gaps between bytes allowed; “asynchronous at the byte level”, ' +
        'but bits inside a byte keep equal durations' + ref('L03 p92') + '</td></tr>' +
        '<tr><td>&nbsp;↳ <b>Synchronous</b></td><td>bits one after another, no start/stop bits, no gaps</td><td>the receiver groups the bits; bytes are grouped into frames marked by start and end bytes' + ref('L03 p94') + '</td></tr>' +
        '<tr><td>&nbsp;↳ <b>Isochronous</b></td><td>no uneven gaps between frames</td><td>bits sent at fixed, equal gaps' + ref('L03 p96') + '</td></tr></tbody></table>' +
        '<figure data-fig="l03b.async" data-caption="Slide 93: start bit first on the line, then the data, then the stop bit; gaps between bytes. Synchronous frames pack bytes back to back."></figure>' },
      { kind: 'example', title: 'Asynchronous framing overhead', ref: 'L03 p92', gen: 'l03b.async', params: { dataBits: 8, stopBits: 1, rate: 2400, chars: 480 } },

      { kind: 'formulas', ids: ['l03b.fs', 'l03b.nyquist', 'l03b.delta', 'l03b.nb', 'l03b.bitrate', 'l03b.bmin', 'l03b.qerror', 'l03b.snqr', 'l03b.async'] },
      { kind: 'practice', gens: ['l03b.sampling', 'l03b.quant', 'l03b.sketch', 'l03b.pcm', 'l03b.dm', 'l03b.async'] },
      { kind: 'quick', n: 8 },
      { kind: 'traps', items: [
        { trap: 'Using the bandwidth of a bandpass signal as f<sub>max</sub>', fix: 'Nyquist needs the highest frequency; with only the bandwidth known, the rate cannot be determined.', ref: 'L03 p71' },
        { trap: 'Thinking that doubling L doubles the bit rate', fix: 'Doubling L adds one bit per sample (n<sub>b</sub> = log₂L).', ref: 'L03 p75' },
        { trap: 'Numbering zones from the top, or starting at 1', fix: 'Zones are 0 … L − 1 from the bottom; 000 is the lowest zone (−20 to −15 V on slide 75).', ref: 'L03 p75' },
        { trap: 'Quantizing to a zone edge', fix: 'Each sample becomes its zone’s <b>midpoint</b>.', ref: 'L03 p73' },
        { trap: 'Assuming the digitized signal needs only f<sub>max</sub> of bandwidth', fix: 'It needs n<sub>b</sub> × f<sub>max</sub> — 32 kHz for 8-bit voice, not 4 kHz.', ref: 'L03 p83' },
        { trap: 'Start bit = 1, stop bit = 0', fix: 'The start bit is 0 and the stop bits are 1.', ref: 'L03 p92' },
        { trap: '“Asynchronous” means the bits are not synchronized', fix: 'It is asynchronous at the byte level (gaps between bytes); bits inside a byte still have equal durations.', ref: 'L03 p92' }
      ] },
      { kind: 'mnemonics', items: [
        'PCM = <b>S</b>ample, <b>Q</b>uantize, <b>E</b>ncode — “Some Quiet Engineers”.',
        'Nyquist doubles: highest frequency × 2 = the fewest samples per second.',
        'Δ = range ÷ levels · bits = log₂ levels · bit rate = bits × samples/s.',
        'Asynchronous: “start low, stop high” — a 0 opens every byte, a 1 closes it.',
        'Ideal / natural / flat-top = impulse / follows the curve / holds one value.'
      ] },
      { kind: 'recall', prompts: [
        'List the three PCM steps and what the signal looks like after each (PAM → quantized → bits).',
        'State the Nyquist theorem. Why can’t slide 71’s bandpass signal be given a sampling rate?',
        'Rebuild slides 74–75 from memory: zones, midpoints and codes for −20 … +20 V with L = 8.',
        'Quantize −6.1 V from slide 76: zone, code, quantized value, error.',
        'Compute the bit rate and minimum bandwidth for 8-bit voice (0–4 kHz).',
        'Explain delta modulation and when it fails. What does DPCM change?',
        'Compare asynchronous, synchronous and isochronous serial transmission.'
      ] }
    ],
    slideErrors: [
      { ref: 'L03 p62', says: '“Filtering should ensure that we do not distort the signal, ie remove high frequency components that affect the signal shape”', correct: 'Read it as: the filter must not distort the signal, so it must not remove the high-frequency components that shape it — it only limits f<sub>max</sub> for sampling.' },
      { ref: 'L03 p76', says: 'First normalized error −0.38', correct: '−1.50 − (−1.22) = −0.28. All other cells are correct.' },
      { ref: 'L03 p77', says: 'Quantization error = “the difference between actual and coded value”', correct: 'The slide-76 table uses quantized − actual (3.24 → 3.50 gives +0.26). State your sign; either way |error| ≤ Δ/2.' },
      { ref: 'L03 p68', says: 'Undersampling is labelled f<sub>s</sub> = f, but its samples sit at a peak, a zero and a trough', correct: 'Sampling at exactly f<sub>s</sub> = f would give the same value every time; the drawing matches a rate slightly below f. The lesson holds: below 2f the samples trace a false, slower wave.' }
    ],
    glossary: [
      { term: 'PCM', alt: ['pulse code modulation'], def: 'Pulse code modulation: digitizing an analog signal by sampling, quantization and binary encoding.', ref: 'L03 p62' },
      { term: 'Sampling interval (T_s)', def: 'Time between samples; f<sub>s</sub> = 1/T<sub>s</sub>.', ref: 'L03 p64' },
      { term: 'Sampling rate (f_s)', def: 'Samples taken per second.', ref: 'L03 p64' },
      { term: 'Ideal sampling', def: 'Each sample is an impulse at the sampling instant.', ref: 'L03 p64' },
      { term: 'Natural sampling', def: 'Each sample is a short pulse whose top follows the signal.', ref: 'L03 p64' },
      { term: 'Flat-top sampling', alt: ['sample and hold'], def: 'Each sample is a short pulse held at a single amplitude (sample and hold).', ref: 'L03 p64' },
      { term: 'PAM', alt: ['pulse amplitude modulation'], def: 'Pulse amplitude modulation — the sampled signal, with analog (non-integer) pulse heights.', ref: 'L03 p64' },
      { term: 'Nyquist theorem', def: 'The sampling rate must be at least twice the highest frequency in the signal.', ref: 'L03 p66' },
      { term: 'Quantization', def: 'Mapping the infinite range of sample values onto L zones; each sample becomes its zone midpoint.', ref: 'L03 p72; L03 p73' },
      { term: 'Zone height (Δ)', def: 'Δ = (max − min)/L — the size of each quantization zone.', ref: 'L03 p72' },
      { term: 'Quantization error', def: 'The difference between the actual sample and its coded (midpoint) value; at most Δ/2.', ref: 'L03 p77' },
      { term: 'SNQR', def: 'Signal-to-quantization-noise ratio; worse for low-amplitude signals because the error range is fixed.', ref: 'L03 p78' },
      { term: 'Non-linear quantization', def: 'Zones that follow a logarithmic curve: smaller Δ at low amplitudes, larger at high amplitudes.', ref: 'L03 p78' },
      { term: 'Companding', def: 'Compressing sample values at the sender (logarithmic zones) and expanding them at the receiver.', ref: 'L03 p78' },
      { term: 'Hold circuit', def: 'PCM decoder stage that holds each pulse amplitude until the next pulse arrives.', ref: 'L03 p81' },
      { term: 'Delta modulation', alt: ['DM'], def: 'Sends one bit per sample: 1 if the signal is above the staircase (step up δ), 0 if not (step down δ).', ref: 'L03 p84' },
      { term: 'DPCM', alt: ['delta PCM', 'differential PCM'], def: 'Quantizes the difference between samples with several bits for higher accuracy.', ref: 'L03 p88' },
      { term: 'Parallel transmission', def: 'Several bits sent with each clock tick, one per line.', ref: 'L03 p89; L03 p90' },
      { term: 'Serial transmission', def: 'One bit sent with each clock tick over a single line.', ref: 'L03 p89; L03 p91' },
      { term: 'Asynchronous transmission', def: 'Each byte framed by a start bit (0) and one or more stop bits (1); gaps allowed between bytes.', ref: 'L03 p92' },
      { term: 'Synchronous transmission', def: 'Bits sent back to back without start/stop bits or gaps; bytes grouped into frames.', ref: 'L03 p94' },
      { term: 'Isochronous transmission', def: 'No uneven gaps between frames — bits sent at fixed, equal intervals.', ref: 'L03 p96' }
    ],
    cheat: [
      { title: 'L03b · PCM', html: '<ul>' +
        '<li>PCM = <em class="k">sample → quantize → encode</em>; filter first</li>' +
        '<li>f<sub>s</sub> = 1/T<sub>s</sub>; Nyquist <em class="k">f<sub>s</sub> ≥ 2·f<sub>max</sub></em> (low-pass and bandpass); voice 4 kHz → <em class="k">8000 sps</em></li>' +
        '<li>Bandpass with only B known → rate <em class="k">cannot be determined</em></li>' +
        '<li>Sampling: ideal (impulse) · natural (follows curve) · <em class="k">flat-top</em> (sample and hold) → PAM</li>' +
        '<li><em class="k">Δ = (max − min)/L</em>; zones 0 … L−1 from the bottom; sample → <em class="k">midpoint</em>; <em class="k">n<sub>b</sub> = log₂L</em></li>' +
        '<li>−20 … +20 V, L = 8 → Δ = 5 V; 000 = −20 to −15 V … 111 = +15 to +20 V</li>' +
        '<li>|error| ≤ Δ/2; low amplitudes suffer → non-linear quantization, <em class="k">companding</em></li></ul>' },
      { title: 'L03b · Rates, DM, modes', html: '<ul>' +
        '<li><em class="k">N = n<sub>b</sub> × f<sub>s</sub></em> — voice, 8 bits → <em class="k">64 kbps</em></li>' +
        '<li><em class="k">B<sub>min</sub> = n<sub>b</sub> × f<sub>max</sub></em> (NRZ-type) — 8 × 4 kHz = <em class="k">32 kHz</em></li>' +
        '<li>Decoder: <em class="k">hold circuit</em> + low-pass filter (cutoff = f<sub>max</sub>)</li>' +
        '<li>DM: 1 bit per sample, 1 = up δ, 0 = down δ; DPCM = quantized difference</li>' +
        '<li>Parallel: n bits per tick on n wires · Serial: 1 bit per tick</li>' +
        '<li>Async: <em class="k">start 0</em> + byte + <em class="k">stop 1</em>, gaps OK · Sync: no start/stop, frames · Isochronous: equal gaps</li></ul>' }
    ]
  });
})();
