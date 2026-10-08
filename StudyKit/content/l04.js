/* L04 — Digital-to-Analog Conversion (golden slice — copy this structure). Owner: Lead.
   Facts come from the L04 slides (refs on everything); textbook-only material is marked beyond:true. */
(function () {
  'use strict';
  var T = 'l04';

  /* ---------- formulas (feed the cheat sheet when sheet:true) ---------- */
  KIT.formula({ id: 'l04.baud', topic: T, name: 'Baud (signal) rate', html: 'S = N × <sup>1</sup>&frasl;<sub>r</sub>',
    where: 'S in baud; N = bit rate (bps); r = data bits per signal element', note: 'Analog transmission of digital data: S ≤ N.', ref: 'L04 p5', sheet: true });
  KIT.formula({ id: 'l04.levels', topic: T, name: 'Bits per element ↔ levels', html: 'r = log<sub>2</sub> L &nbsp;⇔&nbsp; L = 2<sup>r</sup>',
    where: 'L = number of distinct signal elements (levels, phases, frequencies)', ref: 'L04 p7', sheet: true });
  KIT.formula({ id: 'l04.ask', topic: T, name: 'ASK / PSK bandwidth', html: 'B = (1 + d) × S',
    where: '0 ≤ d ≤ 1 (modulation and filtering); d = 0 gives the minimum, B = S', ref: 'L04 p9; L04 p21', sheet: true });
  KIT.formula({ id: 'l04.fsk', topic: T, name: 'Binary FSK bandwidth', html: 'B = (1 + d) × S + 2Δf',
    where: '2Δf = f<sub>1</sub> − f<sub>2</sub>; bit 1 → f<sub>c</sub> + Δf, bit 0 → f<sub>c</sub> − Δf', ref: 'L04 p14; L04 p15', sheet: true });
  KIT.formula({ id: 'l04.mfsk', topic: T, name: 'Multilevel FSK bandwidth', html: 'B = (1 + d) × S + (L − 1) × 2Δf',
    where: 'with d = 0 and the minimum spacing 2Δf = S: B = L × S', note: '⚠ Slide 18 prints “(L − 1)/2Δf” — it is a product.', ref: 'L04 p18; L04 p19', sheet: true });
  KIT.formula({ id: 'l04.carrier', topic: T, name: 'Carrier in an available band', html: 'f<sub>c</sub> = (f<sub>low</sub> + f<sub>high</sub>) / 2',
    where: 'full duplex: split the band in two halves, one carrier in the middle of each', ref: 'L04 p12; L04 p13', sheet: true });
  KIT.formula({ id: 'l04.polar', topic: T, name: 'Reading a constellation point', html: 'A = √(I² + Q²), &nbsp; θ = angle from the +I axis',
    where: 'distance from the origin = amplitude; angle = phase', ref: 'L04 p28', sheet: false });

  KIT.topic({
    id: T,
    lecture: 4,
    title: 'Digital-to-Analog: ASK, FSK, PSK & QAM',
    blurb: 'How a carrier wave is changed to carry bits — and how bit rate, baud rate, levels and bandwidth trade off.',
    highYield: ['S = N/r and r = log₂L', 'Carrier + bit rate in a band (ASK/FSK)', 'QPSK / MFSK bandwidth', 'Reading constellations'],
    glance: [
      'A <b>carrier</b> of frequency f<sub>c</sub> is modified to carry bits: change its <b>amplitude</b> (ASK), <b>frequency</b> (FSK), <b>phase</b> (PSK), or amplitude and phase together (<b>QAM</b>).',
      '<b>N</b> = bit rate, <b>S</b> = baud rate (signal elements/s), <b>r</b> = bits per element: <b>S = N/r</b> and <b>r = log₂L</b>. In analog transmission, S ≤ N.',
      'Bandwidth follows the <b>baud rate</b>: ASK/PSK <b>B = (1 + d)S</b>; FSK adds the spacing, <b>B = (1 + d)S + 2Δf</b>; MFSK <b>B = (1 + d)S + (L − 1)2Δf</b> (= L × S at minimum spacing).',
      'Put the carrier in the <b>middle</b> of the band; for <b>full duplex</b>, split the band in two (200–300 kHz → carriers at 225 and 275 kHz).',
      '<b>PSK is more robust than ASK</b> (noise mostly changes amplitude). <b>QPSK</b> sends 2 bits per element on two carriers 90° apart (I and Q).',
      'A <b>constellation diagram</b> plots each signal element: distance from the origin = amplitude, angle = phase.'
    ],
    ask: [
      '<b>Solving:</b> “r bits per element at S baud — find N” or “N and S given — find r and L”.',
      '<b>Solving:</b> “Band from f<sub>1</sub> to f<sub>2</sub>, ASK/FSK with d = … — find the carrier and the bit rate” (sometimes full duplex).',
      '<b>Solving:</b> QPSK / 16-QAM baud rate and bandwidth; MFSK levels, baud rate and bandwidth.',
      '<b>MCQ / Identification:</b> which scheme varies what; OOK; coherent vs non-coherent FSK; I and Q carriers; why PSK beats ASK on noise.',
      '<b>Essay:</b> compare ASK, FSK and PSK (what changes, bandwidth, noise robustness); explain the bit-rate/baud-rate trade-off.'
    ],
    sections: [
      { kind: 'intuition', title: 'Three knobs on one carrier', viz: 'l04.constellation', params: { bits: '10110010', scheme: 'bpsk' },
        analogy: 'Think of the carrier as a steady musical note. To send bits you can change how <b>loud</b> it is (ASK), its <b>pitch</b> (FSK), ' +
          'or <b>when its peaks happen</b> — its phase (PSK). QAM changes loudness <i>and</i> phase at once, so each note can carry more bits.',
        predict: [
          { q: 'Noise mostly adds random changes to a signal’s <b>amplitude</b>. Which scheme is <i>more</i> robust to noise?',
            choices: ['ASK', 'PSK', 'They are equally robust'], answer: 1,
            explain: 'PSK keeps the amplitude constant and puts the data in the phase, so amplitude noise does much less damage. The slide: “PSK is much more robust than ASK as it is not that vulnerable to noise, which changes amplitude.” [L04 p21]',
            set: { scheme: 'bpsk' } },
          { q: 'Switch from BPSK to QPSK and keep the <b>baud rate</b> the same. What happens to the bit rate?',
            choices: ['It halves', 'It stays the same', 'It doubles'], answer: 2,
            explain: 'QPSK carries r = 2 bits per signal element (L = 4) while BPSK carries 1. With the same S, N = r × S doubles — and the bandwidth, which follows S, stays the same. [L04 p24; L04 p26]',
            set: { scheme: 'qpsk' } }
        ] },

      { kind: 'notes', id: 'd2a', title: 'Digital-to-analog conversion', ref: 'L04 pp2-4', html:
        '<p>Digital data sometimes has to travel as an <b>analog</b> signal — for example over a <b>bandpass</b> channel that does not start at 0 Hz <span class="chip ref">L02 p18</span>. ' +
        'A <b>carrier signal</b> of frequency f<sub>c</sub> transports the data: the sender’s <b>modulator</b> changes the carrier to encode the bits and the receiver’s ' +
        '<b>demodulator</b> recovers them. <span class="chip ref">L04 p2</span> <span class="chip ref">L04 p3</span></p>' +
        '<p>A sine wave has three characteristics (amplitude, frequency, phase — L02), so there are three basic schemes, plus QAM, which combines two: <span class="chip ref">L04 p4</span></p>' +
        '<table class="tbl"><thead><tr><th>Scheme</th><th>What changes</th><th>What stays fixed</th></tr></thead><tbody>' +
        '<tr><td><b>ASK</b> — amplitude shift keying</td><td>peak amplitude</td><td>frequency, phase</td></tr>' +
        '<tr><td><b>FSK</b> — frequency shift keying</td><td>frequency</td><td>amplitude, phase</td></tr>' +
        '<tr><td><b>PSK</b> — phase shift keying</td><td>phase</td><td>amplitude, frequency</td></tr>' +
        '<tr><td><b>QAM</b> — quadrature amplitude modulation</td><td>amplitude <i>and</i> phase (ASK + PSK)</td><td>frequency</td></tr></tbody></table>' +
        '<figure data-fig="l04.modwaves" data-bits="10110" data-caption="The bits 1 0 1 1 0 on ASK (OOK), binary FSK and BPSK — compare slides 10, 14 and 22."></figure>' },

      { kind: 'notes', id: 'rates', title: 'Bit rate vs baud rate', ref: 'L04 pp5-7', html:
        '<p><b>Bit rate N</b> is the number of bits per second (bps). <b>Baud rate S</b> is the number of <b>signal elements</b> per second (baud) — also called the signal or modulation rate. ' +
        'If each element carries <b>r</b> bits: <b>S = N × 1/r</b>. <span class="chip ref">L04 p5</span></p>' +
        '<p>An element that can take <b>L</b> different forms carries <b>r = log₂ L</b> bits, so <b>L = 2<sup>r</sup></b>. In analog transmission of digital data the baud rate is ' +
        '<b>less than or equal to</b> the bit rate. <span class="chip ref">L04 p7</span></p>' +
        '<div class="callout key"><div class="callout-label">Why it matters</div>Bandwidth depends on the <b>baud rate</b>. Packing more bits into each element (larger r) raises the bit rate ' +
        'without widening the band for ASK, PSK and QAM (MFSK is the exception: its band grows with L, B = L × S) — the price is more levels that the receiver must tell apart.</div>' },
      { kind: 'example', title: 'Bit rate from baud rate', ref: 'L04 p6', gen: 'l04.rates', params: { find: 'N', S: 1000, r: 4 },
        slideAnswer: '4000 bps', slideValue: 4000, input: 'N' },
      { kind: 'example', title: 'Bits per element and number of levels', ref: 'L04 p7', gen: 'l04.rates', params: { find: 'rL', N: 8000, S: 1000 },
        slideAnswer: 'r = 8 bits/baud, L = 256', slideValue: 256, input: 'L' },

      { kind: 'notes', id: 'ask', title: 'Amplitude shift keying (ASK)', ref: 'L04 pp8-13', html:
        '<p>ASK changes the <b>amplitude</b> of the carrier to reflect the data. In <b>binary ASK (BASK)</b>, a 1 leaves the carrier on and a 0 makes it zero — ' +
        'this is <b>on-off keying (OOK)</b>. <span class="chip ref">L04 p8</span> <span class="chip ref">L04 p10</span></p>' +
        '<ul><li><b>Bandwidth:</b> B = (1 + d) × S, where d (between 0 and 1) comes from modulation and filtering. BASK has r = 1, so S = N. <span class="chip ref">L04 p9</span></li>' +
        '<li><b>Implementation:</b> multiply a <b>unipolar NRZ</b> signal by the carrier from an oscillator. <span class="chip ref">L04 p11</span></li>' +
        '<li><b>Carrier choice:</b> put f<sub>c</sub> in the middle of the available band. <span class="chip ref">L04 p12</span></li>' +
        '<li><b>Full duplex:</b> both directions need a carrier, so split the band in two — each direction gets half the bandwidth. <span class="chip ref">L04 p13</span></li></ul>' },
      { kind: 'example', title: 'ASK in a 200–300 kHz band', ref: 'L04 p12', gen: 'l04.band', params: { scheme: 'ask', fLow: 200e3, fHigh: 300e3, d: 1 },
        slideAnswer: 'f<sub>c</sub> = 250 kHz, N = 50 kbps', slideValue: 50e3, input: 'N' },
      { kind: 'example', title: 'Full-duplex ASK in the same band', ref: 'L04 p13', gen: 'l04.band', params: { scheme: 'ask', fLow: 200e3, fHigh: 300e3, d: 1, duplex: true },
        slideAnswer: 'carriers at 225 kHz and 275 kHz; 25 kbps each way', slideValue: 25e3, input: 'N' },

      { kind: 'notes', id: 'fsk', title: 'Frequency shift keying (FSK)', ref: 'L04 pp14-20', html:
        '<p>FSK changes the <b>frequency</b> of the carrier. Binary FSK uses two frequencies around f<sub>c</sub>: <b>bit 1 → f<sub>1</sub> = f<sub>c</sub> + Δf</b> and ' +
        '<b>bit 0 → f<sub>2</sub> = f<sub>c</sub> − Δf</b>. <span class="chip ref">L04 p14</span></p>' +
        '<ul><li><b>Bandwidth:</b> B = (1 + d) × S + 2Δf, where 2Δf is the gap between f<sub>1</sub> and f<sub>2</sub>. Binary FSK has r = 1, so S = N. <span class="chip ref">L04 p15</span></li>' +
        '<li><b>Non-coherent FSK</b> switches frequency without regard to the current phase; <b>coherent FSK</b> switches only at the same phase, so the wave stays continuous. <span class="chip ref">L04 p17</span></li>' +
        '<li><b>Implementation:</b> a voltage-controlled oscillator (VCO) changes its frequency with the NRZ input. <span class="chip ref">L04 p18</span></li>' +
        '<li><b>Multilevel FSK (MFSK):</b> send r bits per element with L = 2<sup>r</sup> frequencies. B = (1 + d) × S + (L − 1) × 2Δf; with d = 0 and the minimum spacing 2Δf = S, ' +
        '<b>B = L × S</b>. <span class="chip ref">L04 p18</span> <span class="chip ref">L04 p19</span></li></ul>' +
        '<div class="callout slide-error"><div class="callout-label">⚠ Slide says / correct</div><div class="says-correct"><b>Slide 18</b><span>B = (1+d)×S + (L−1)/2Δf = L×S</span>' +
        '<b>Correct</b><span>B = (1+d)×S + (L−1)×2Δf, which equals L×S only when d = 0 and 2Δf = S (the slide example’s case).</span></div></div>' },
      { kind: 'example', title: 'FSK in a 200–300 kHz band', ref: 'L04 p16', gen: 'l04.band', params: { scheme: 'fsk', fLow: 200e3, fHigh: 300e3, d: 1, twoDf: 50e3 },
        slideAnswer: 'f<sub>c</sub> = 250 kHz, N = 25 kbps', slideValue: 25e3, input: 'N' },
      { kind: 'example', title: 'MFSK: 3 bits at a time', ref: 'L04 p19', gen: 'l04.mlevel', params: { scheme: 'mfsk', N: 3e6, r: 3, fc: 10e6 },
        slideAnswer: 'L = 8, S = 1 Mbaud, B = 8 MHz (carriers 6.5 … 13.5 MHz, slide 20)', slideValue: 8e6, input: 'B' },

      { kind: 'notes', id: 'psk', title: 'Phase shift keying: BPSK and QPSK', ref: 'L04 pp21-26', html:
        '<p>PSK changes the <b>phase</b> of the carrier; amplitude and frequency stay constant. Its bandwidth is the same as ASK: <b>B = (1 + d) × S</b>. ' +
        'PSK is <b>much more robust than ASK</b>, because noise mostly changes amplitude. <span class="chip ref">L04 p21</span></p>' +
        '<ul><li><b>BPSK:</b> two elements 180° apart — bit 1 → 0°, bit 0 → 180°. <span class="chip ref">L04 p22</span> Implementation: multiply a <b>polar NRZ</b> signal by the carrier ' +
        '(BASK uses <i>unipolar</i> NRZ). <span class="chip ref">L04 p23</span></li>' +
        '<li><b>QPSK:</b> 2 bits per element (L = 4). The stream is split into pairs: the <b>first bit</b> drives the <b>in-phase (I)</b> carrier and the <b>second bit</b> the ' +
        '<b>quadrature (Q)</b> carrier, which is shifted 90°. The two BPSK signals are added. <span class="chip ref">L04 p24</span> <span class="chip ref">L04 p25</span></li></ul>' +
        '<table class="tbl compact"><thead><tr><th>Dibit</th><th>I (1st bit)</th><th>Q (2nd bit)</th><th>Phase</th></tr></thead><tbody>' +
        '<tr><td class="mono">11</td><td>+</td><td>+</td><td>45°</td></tr><tr><td class="mono">01</td><td>−</td><td>+</td><td>135°</td></tr>' +
        '<tr><td class="mono">00</td><td>−</td><td>−</td><td>−135° (225°)</td></tr><tr><td class="mono">10</td><td>+</td><td>−</td><td>−45° (315°)</td></tr></tbody></table>' },
      { kind: 'example', title: 'QPSK bandwidth', ref: 'L04 p26', gen: 'l04.mlevel', params: { scheme: 'qpsk', N: 12e6, d: 0 },
        slideAnswer: 'S = 6 Mbaud, B = 6 MHz', slideValue: 6e6, input: 'B' },

      { kind: 'notes', id: 'constellation', title: 'Constellation diagrams', ref: 'L04 pp27-29', html:
        '<p>A constellation diagram defines the amplitude and phase of each signal element when two carriers are used, one in quadrature with the other: ' +
        'the <b>x-axis is the in-phase (I) carrier</b> and the <b>y-axis the quadrature (Q) carrier</b>. <span class="chip ref">L04 p27</span> ' +
        'For any point, the <b>length</b> of the line from the origin is the <b>amplitude</b> and its <b>angle</b> is the <b>phase</b>. <span class="chip ref">L04 p28</span></p>' +
        '<div class="grid3">' +
        '<figure data-fig="l04.constellation" data-scheme="ook" data-caption="ASK (OOK): 0 at the origin, 1 on +I."></figure>' +
        '<figure data-fig="l04.constellation" data-scheme="bpsk" data-caption="BPSK: 0 at −I, 1 at +I (180° apart)."></figure>' +
        '<figure data-fig="l04.constellation" data-scheme="qpsk" data-caption="QPSK: four points 90° apart."></figure></div>' +
        '<p>Going counter-clockwise from 45°, the QPSK labels run <b>11 → 01 → 00 → 10</b>. <span class="chip ref">L04 p29</span> <span class="badge beyond">Beyond slides</span> Neighbours differ in one bit (Gray coding), so a small phase error flips at most one bit.</p>' },

      { kind: 'notes', id: 'qam', title: 'Quadrature amplitude modulation (QAM)', ref: 'L04 pp30-31', html:
        '<p>QAM is a combination of <b>ASK and PSK</b>: both amplitude and phase change, using the I and Q carriers. Slide 30 shows several 4-QAM layouts — four unipolar points, ' +
        'four points at (±1, ±1) (the same as QPSK), or four points in one quadrant — and a 16-QAM layout. <span class="chip ref">L04 p30</span></p>' +
        '<p>The labelled <b>16-QAM</b> on slide 31 puts I and Q at ±25% and ±75% of full scale. The <b>first two bits pick the quadrant</b> (00 upper right, 10 upper left, 11 lower left, ' +
        '01 lower right) and the last two pick the point inside it. 16-QAM carries r = log₂16 = <b>4 bits</b> per element. <span class="chip ref">L04 p31</span></p>' +
        '<figure data-fig="l04.constellation" data-scheme="16qam" data-highlight="1100" data-caption="16-QAM from slide 31 (1 unit = 25%). Highlighted: 1100 at I = Q = −25%, phase 225°."></figure>' +
        '<table class="tbl compact"><thead><tr><th>Q ↓ / I →</th><th>−75%</th><th>−25%</th><th>+25%</th><th>+75%</th></tr></thead><tbody>' +
        '<tr><th>+75%</th><td class="mono">1011</td><td class="mono">1001</td><td class="mono">0010</td><td class="mono">0011</td></tr>' +
        '<tr><th>+25%</th><td class="mono">1010</td><td class="mono">1000</td><td class="mono">0000</td><td class="mono">0001</td></tr>' +
        '<tr><th>−25%</th><td class="mono">1101</td><td class="mono">1100</td><td class="mono">0100</td><td class="mono">0110</td></tr>' +
        '<tr><th>−75%</th><td class="mono">1111</td><td class="mono">1110</td><td class="mono">0101</td><td class="mono">0111</td></tr></tbody></table>' },
      { kind: 'example', title: 'Reading the 16-QAM constellation', ref: 'L04 p31', gen: 'l04.constellation', params: { scheme: '16qam', bits: '1100', ask: 'phase' },
        slideAnswer: '225° (slide inset)' },

      { kind: 'formulas', ids: ['l04.baud', 'l04.levels', 'l04.ask', 'l04.fsk', 'l04.mfsk', 'l04.carrier', 'l04.polar'] },
      { kind: 'practice', gens: ['l04.sketch', 'l04.rates', 'l04.band', 'l04.mlevel', 'l04.constellation'] },
      { kind: 'quick', n: 8 },
      { kind: 'traps', items: [
        { trap: 'Plugging the bit rate N into B = (1 + d)S', fix: 'Bandwidth uses the <b>baud rate</b>. Convert first: S = N / r.', ref: 'L04 p9' },
        { trap: 'MFSK: dividing by 2Δf because slide 18 prints “(L − 1)/2Δf”', fix: 'It is (L − 1) × 2Δf; with the minimum spacing, B = L × S.', ref: 'L04 p18' },
        { trap: 'FSK: forgetting the 2Δf term', fix: 'Subtract 2Δf from B before dividing by (1 + d).', ref: 'L04 p15' },
        { trap: 'Full duplex: giving one direction the whole band', fix: 'Split the band in two; each direction gets half and its own carrier.', ref: 'L04 p13' },
        { trap: 'QPSK: sending the first bit on Q', fix: 'Slide convention: first bit → I (x-axis), second bit → Q (y-axis). 01 is at 135°.', ref: 'L04 p25' },
        { trap: 'Calling ASK as robust as PSK', fix: 'Noise mostly changes amplitude, so ASK suffers more; PSK is much more robust than ASK.', ref: 'L04 p21' },
        { trap: 'Taking 25% as the amplitude of 16-QAM’s 1100', fix: '25% is each axis component; the distance from the origin is √2 × 25% ≈ 35%. The 225° phase is right.', ref: 'L04 p31' }
      ] },
      { kind: 'mnemonics', items: [
        'ASK, FSK, PSK = <b>A</b>mplitude, <b>F</b>requency, <b>P</b>hase — the three characteristics of a sine wave from L02.',
        '“Bits ride on bauds”: <b>N = r × S</b>. More bits per element → more data on the same bandwidth (ASK, PSK, QAM).',
        '<b>L = 2<sup>r</sup></b>: 2 → 1 bit, 4 → 2, 8 → 3, 16 → 4, 256 → 8.',
        'QPSK counter-clockwise from 45°: <b>11, 01, 00, 10</b> — each step changes one bit.',
        'FSK: “one is high” — bit 1 uses f<sub>c</sub> + Δf.'
      ] },
      { kind: 'recall', prompts: [
        'Write the relationship between N, S, r and L, then redo slide 7 (N = 8000 bps, S = 1000 baud).',
        'Write the bandwidth formulas for ASK, binary FSK, MFSK and PSK. Which ones depend on Δf?',
        'Sketch the OOK, BPSK and QPSK constellations with the slide labels.',
        'Explain why PSK is more robust than ASK, and why QPSK doubles BPSK’s bit rate at the same baud rate.',
        'Solve without notes: band 200–300 kHz, ASK, d = 1, full duplex. Carriers? Bit rate per direction?'
      ] }
    ],
    slideErrors: [
      { ref: 'L04 p18', says: 'B = (1+d)×S + (L−1)/2Δf = L×S', correct: 'B = (1+d)×S + (L−1)×2Δf; it equals L×S only when d = 0 and 2Δf = S.' },
      { ref: 'L04 p14', says: 'The figure writes Δf as “Df” (and the extracted text drops Δ entirely)', correct: 'Read “2Df” as 2Δf, the spacing between f<sub>1</sub> and f<sub>2</sub>.' },
      { ref: 'L04 p14', says: 'Text: bit 1 → f<sub>1</sub> = f<sub>c</sub> + Δf, but the spectrum draws f<sub>1</sub> below f<sub>2</sub>', correct: 'Follow the text: bit 1 uses the higher frequency f<sub>c</sub> + Δf; bit 0 uses f<sub>c</sub> − Δf.' },
      { ref: 'L04 p31', says: 'Inset: point 1100 has amplitude 25%', correct: '25% is the I and the Q component; the magnitude is √2 × 25% ≈ 35%. The 225° phase is correct.' },
      { ref: 'L04 p15', says: 'A stray “5.15” label', correct: 'A leftover textbook slide number — ignore it.' }
    ],
    glossary: [
      { term: 'Carrier signal', def: 'The analog sine wave (frequency f<sub>c</sub>) whose amplitude, frequency or phase is changed to carry the data.', ref: 'L04 p2' },
      { term: 'Bit rate (N)', def: 'Bits sent per second (bps).', ref: 'L04 p5' },
      { term: 'Baud rate (S)', def: 'Signal elements sent per second (baud); also the signal or modulation rate. S = N/r.', ref: 'L04 p5' },
      { term: 'ASK', def: 'Amplitude shift keying — the carrier’s amplitude encodes the data. B = (1 + d)S.', ref: 'L04 p8; L04 p9' },
      { term: 'OOK', alt: ['on-off keying', 'BASK'], def: 'On-off keying: binary ASK where a 1 sends the carrier and a 0 sends nothing.', ref: 'L04 p8; L04 p10' },
      { term: 'd (modulation factor)', def: 'A value between 0 and 1 that depends on modulation and filtering; it widens the bandwidth from S to (1 + d)S.', ref: 'L04 p9' },
      { term: 'FSK', def: 'Frequency shift keying — the carrier’s frequency encodes the data. B = (1 + d)S + 2Δf.', ref: 'L04 p14; L04 p15' },
      { term: 'Coherent FSK', def: 'FSK that switches frequency only at the same phase of the signal, so the waveform stays continuous.', ref: 'L04 p17' },
      { term: 'Non-coherent FSK', def: 'FSK that switches frequency without adhering to the current phase.', ref: 'L04 p17' },
      { term: 'MFSK', def: 'Multilevel FSK: L = 2<sup>r</sup> frequencies, each carrying r bits.', ref: 'L04 p18' },
      { term: 'VCO', alt: ['voltage-controlled oscillator'], def: 'Voltage-controlled oscillator — produces a frequency that follows its input voltage; used to implement FSK.', ref: 'L04 p18' },
      { term: 'PSK', def: 'Phase shift keying — the carrier’s phase encodes the data. B = (1 + d)S; more noise-robust than ASK.', ref: 'L04 p21' },
      { term: 'BPSK', def: 'Binary PSK: two elements 180° apart (bit 1 → 0°, bit 0 → 180°); polar NRZ × carrier.', ref: 'L04 p22; L04 p23' },
      { term: 'QPSK', def: 'Quadrature PSK: 2 bits per element on I and Q carriers 90° apart; L = 4.', ref: 'L04 p24' },
      { term: 'In-phase carrier (I)', def: 'The reference carrier; the x-axis of a constellation diagram.', ref: 'L04 p27' },
      { term: 'Quadrature carrier (Q)', def: 'The carrier shifted 90° from the in-phase carrier; the y-axis of a constellation diagram.', ref: 'L04 p24; L04 p27' },
      { term: 'Constellation diagram', def: 'A plot of the signal elements: distance from the origin = amplitude, angle = phase.', ref: 'L04 p27; L04 p28' },
      { term: 'QAM', def: 'Quadrature amplitude modulation — a combination of ASK and PSK (amplitude and phase both change).', ref: 'L04 p30' }
    ],
    cheat: [
      { title: 'L04 · Digital → analog', html: '<ul>' +
        '<li><b>ASK</b> amplitude · <b>FSK</b> frequency · <b>PSK</b> phase · <b>QAM</b> amplitude + phase</li>' +
        '<li><em class="k">S = N/r</em> (baud); <em class="k">r = log₂L</em>, L = 2<sup>r</sup>; S ≤ N</li>' +
        '<li>ASK/PSK: <em class="k">B = (1+d)S</em>, 0 ≤ d ≤ 1; BASK = OOK, r = 1</li>' +
        '<li>FSK: <em class="k">B = (1+d)S + 2Δf</em>; bit 1 → f<sub>c</sub> + Δf, bit 0 → f<sub>c</sub> − Δf</li>' +
        '<li>MFSK: <em class="k">B = (1+d)S + (L−1)·2Δf</em> = L·S when d = 0, 2Δf = S</li>' +
        '<li>Carrier at band middle; full duplex → halve the band (200–300 kHz → 225 and 275 kHz)</li>' +
        '<li>BASK = <em class="k">unipolar</em> NRZ × carrier; BPSK = <em class="k">polar</em> NRZ × carrier; FSK via VCO</li>' +
        '<li>PSK more robust than ASK (noise hits amplitude)</li></ul>' },
      { title: 'L04 · Constellations & examples', html: '<ul>' +
        '<li>x = I (in-phase), y = Q (quadrature); length = amplitude, angle = phase</li>' +
        '<li>OOK: 0 at origin, 1 on +I · BPSK: 0 at −I, 1 at +I</li>' +
        '<li>QPSK (1st bit → I): <em class="k">11 → 45°, 01 → 135°, 00 → −135°, 10 → −45°</em></li>' +
        '<li>16-QAM (slide 31): first 2 bits = quadrant (00 I, 10 II, 11 III, 01 IV); 1100 → 225°</li>' +
        '<li>r = 4, S = 1000 → <em class="k">4000 bps</em> · N = 8000, S = 1000 → <em class="k">r = 8, L = 256</em></li>' +
        '<li>ASK 200–300 kHz, d = 1 → <em class="k">250 kHz, 50 kbps</em> · FSK, 2Δf = 50 kHz → <em class="k">25 kbps</em></li>' +
        '<li>QPSK 12 Mbps, d = 0 → <em class="k">6 MHz</em> · MFSK 3 bits, 3 Mbps → <em class="k">L = 8, 1 Mbaud, 8 MHz</em></li></ul>' }
    ]
  });
})();
