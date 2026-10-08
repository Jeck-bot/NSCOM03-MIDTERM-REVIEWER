/* L03a — Digital transmission I: line coding, block coding, scrambling (L03 slides 1–61). Owner: Lead (taken over from O2). */
(function () {
  'use strict';
  var T = 'l03a';
  function ref(p) { return ' <span class="chip ref">' + p + '</span>'; }
  function fig(schemes, bits, caption) { return '<figure data-fig="l03a.linecode" data-scheme="' + schemes + '" data-bits="' + bits + '" data-caption="' + caption + '"></figure>'; }
  function seCallout(slide, says, correct) {
    return '<div class="callout slide-error"><div class="callout-label">⚠ Slide says / correct</div><div class="says-correct"><b>' + slide + '</b><span>' + says + '</span><b>Correct</b><span>' + correct + '</span></div></div>';
  }
  var LC = KIT.calc.linecode;
  var table4b5b = (function () {
    var data = Object.keys(LC.TABLE_4B5B).sort();
    var half = Math.ceil(data.length / 2), rows = '';
    for (var i = 0; i < half; i++) {
      var a = data[i], b = data[i + half];
      rows += '<tr><td class="mono">' + a + '</td><td class="mono"><b>' + LC.TABLE_4B5B[a] + '</b></td>' +
        (b ? '<td class="mono">' + b + '</td><td class="mono"><b>' + LC.TABLE_4B5B[b] + '</b></td>' : '<td></td><td></td>') + '</tr>';
    }
    var ctrl = Object.keys(LC.CONTROL_4B5B).map(function (k) { return k + ' (' + LC.CONTROL_NAMES[k] + ') = <span class="mono">' + LC.CONTROL_4B5B[k] + '</span>'; }).join(' · ');
    return '<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Data</th><th>Code</th><th>Data</th><th>Code</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="small"><b>Control codes:</b> ' + ctrl + '.' + ref('L03 p51') + '</p>';
  })();

  KIT.formula({ id: 'l03a.baud', topic: T, name: 'Signal (baud) rate', html: 'S = c × N × <sup>1</sup>&frasl;<sub>r</sub>',
    where: 'N = data rate (bps); r = data elements per signal element; c = case factor (worst 1, best 0, average ½)', ref: 'L03 p8', sheet: true });
  KIT.formula({ id: 'l03a.bmin', topic: T, name: 'Minimum bandwidth', html: 'B<sub>min</sub> = S<sub>avg</sub>',
    where: 'NRZ-L/NRZ-I/AMI N/2 · RZ, Manchester N · 2B1Q N/4 · MLT-3 N/3 · 8B6T 3N/4 · 4D-PAM5 N/8', ref: 'L03 p25; L03 p46', sheet: true });
  KIT.formula({ id: 'l03a.nmax', topic: T, name: 'Nyquist reminder', html: 'N<sub>max</sub> = 2 × B × log<sub>2</sub> L', where: 'the effective bandwidth of a digital signal is finite', ref: 'L03 p10', sheet: false });
  KIT.formula({ id: 'l03a.mbnl', topic: T, name: 'mBnL code condition', html: '2<sup>m</sup> ≤ L<sup>n</sup>',
    where: 'm data bits → n signal elements with L levels (B = 2, T = 3, Q = 4)', ref: 'L03 p36; L03 p37', sheet: true });
  KIT.formula({ id: 'l03a.4b5b', topic: T, name: '4B/5B rate', html: 'N<sub>line</sub> = N × 5/4', where: 'every 4 data bits become 5 code bits', ref: 'L03 p54', sheet: true });
  KIT.formula({ id: 'l03a.drift', topic: T, name: 'Clock drift', html: 'extra bits/s = N × (clock error)', where: '0.1% fast at 1 kbps → 1 extra bps', ref: 'L03 p14', sheet: false });

  KIT.topic({
    id: T,
    lecture: 3,
    title: 'Digital Transmission I: Line Coding, Block Coding & Scrambling',
    blurb: 'How bits become a digital signal: the line-coding schemes and what makes one good (no DC, no baseline wander, self-clocking), then block coding and scrambling to fix the weak spots.',
    highYield: ['Draw NRZ-L / NRZ-I / Manchester / diff. Manchester / AMI', 'S = c·N/r and B_min', '4B/5B + NRZ-I (Example 4)', 'B8ZS and HDB3'],
    glance: [
      '<b>Line coding</b> turns data bits into signal levels. <b>r</b> = data elements per signal element; signal rate <b>S = c × N × 1/r</b> (c: worst 1, best 0, average ½). Goal: high data rate with a low baud rate. (Main Section 2)',
      'A good line code avoids <b>baseline wandering</b> and <b>DC components</b> (long runs of one level), is <b>self-synchronizing</b> (transitions to clock on), may <b>detect errors</b>, resists noise, and is not too complex. (Main Section 3)',
      'Slide-figure conventions: <b>NRZ-L</b> 0 = +V, 1 = −V · <b>NRZ-I</b> a 1 inverts · <b>RZ</b> 1 = +V→0, 0 = −V→0 · <b>Manchester</b> 0 = high→low, 1 = low→high · <b>Diff. Manchester</b> 0 = transition at the start · <b>AMI</b> 0 = 0 V, 1s alternate.',
      'Average baud / minimum bandwidth: NRZ-L, NRZ-I, AMI <b>N/2</b>; RZ, Manchester, diff. Manchester <b>N</b>; 2B1Q <b>N/4</b>; MLT-3 <b>N/3</b>; 8B6T <b>3N/4</b>; 4D-PAM5 <b>N/8</b>.',
      '<b>Block coding</b> mB/nB adds redundancy: 4B/5B maps 4 bits to 5 (rate × 5/4) so NRZ-I never sees long runs of 0s. 1 Mbps → 1.25 Mbps → NRZ-I needs 625 kHz, Manchester 1.25 MHz.',
      '<b>Scrambling</b> keeps the bandwidth and removes long zero runs on the fly: <b>B8ZS</b> 8 zeros → 000VB0VB; <b>HDB3</b> 4 zeros → 000V (odd count since last substitution) or B00V (even).'
    ],
    ask: [
      '<b>Solving (draw):</b> encode a bit stream in NRZ-L, NRZ-I, RZ, Manchester, differential Manchester, AMI (and 2B1Q, MLT-3).',
      '<b>Solving:</b> average baud rate and minimum bandwidth for a scheme, with or without 4B/5B (Examples 1, 3, 4); clock drift (Example 2).',
      '<b>Solving:</b> apply B8ZS or HDB3 to a bit stream; encode with the 4B/5B table.',
      '<b>MCQ / Identification:</b> baseline wandering, DC component, self-synchronization, which scheme has which property, mBnL notation, violation/bipolar pulses.',
      '<b>Essay:</b> compare schemes on DC, baseline wandering and synchronization; explain why block coding or scrambling is used.'
    ],
    sections: [
      { kind: 'intuition', title: 'Same bits, different shapes', viz: 'l03a.linecode', params: { bits: '01001110', schemes: 'nrzl,nrzi,manchester,dmanchester,ami' },
        analogy: 'Imagine sending bits by Morse-like light flashes to a friend counting seconds in their head. If you hold the light ON for a long time, they lose count (<b>no synchronization</b>) and their eyes adjust to the “new normal” (<b>baseline wandering</b>). ' +
          'Codes that <b>blink in the middle of every bit</b> (Manchester) keep the friend’s count in step — but blinking twice as often needs twice the bandwidth.',
        predict: [
          { q: 'You send <b>00000000</b> with NRZ-L. What does the receiver see?',
            choices: ['A transition in every bit', 'One long constant level — no transitions to stay in sync, and the baseline drifts', 'Alternating pulses'], answer: 1,
            explain: 'NRZ-L holds one level for the whole run, so there are no transitions (no self-synchronization) and the running average drifts (baseline wandering). [L03 p11; L03 p24]',
            set: { bits: '00000000', schemes: 'nrzl,nrzi,manchester,ami' } },
          { q: 'Which scheme has a transition in the <b>middle of every bit</b>, no matter what the data is?',
            choices: ['NRZ-I', 'AMI', 'Manchester', 'Unipolar NRZ'], answer: 2,
            explain: 'Manchester (and differential Manchester) always change level mid-bit — that transition is the clock. The cost: twice the bandwidth of NRZ. [L03 p28; L03 p30]',
            set: { bits: '01001110', schemes: 'nrzl,manchester,dmanchester' } }
        ] },

      { kind: 'notes', id: 'elements', title: 'Line coding: data elements vs signal elements', ref: 'L03 pp3-8', html:
        '<p><b>Line coding</b> converts a string of 1s and 0s (digital data) into a sequence of signals — e.g. a high voltage (+V) for “1” and a low voltage (0 or −V) for “0”. ' +
        'The sender’s encoder makes the signal; the receiver’s decoder recovers the bits.' + ref('L03 p3') + ref('L03 p4') + '</p>' +
        '<p>A <b>data element</b> (data symbol) is one bit or a group of bits — 1, 0 or 11, 10, 01, …; it is coded into one or more <b>signal elements</b> (1 → +V, or 1 → +V then −V). The ratio <b>r</b> = data elements carried per signal element.' + ref('L03 p5') + '</p>' +
        '<table class="tbl compact"><thead><tr><th>Slide 7 case</th><th>r</th><th>Example</th></tr></thead><tbody>' +
        '<tr><td>(a) one data element per signal element</td><td><b>1</b></td><td>NRZ-type codes</td></tr>' +
        '<tr><td>(b) one data element per two signal elements</td><td><b>½</b></td><td>Manchester, RZ (two halves per bit)</td></tr>' +
        '<tr><td>(c) two data elements per signal element</td><td><b>2</b></td><td>11 | 01 | 11 → three signal elements (multilevel codes; 2B1Q is the slides’ r = 2 code)</td></tr>' +
        '<tr><td>(d) four data elements per three signal elements</td><td><b>4/3</b></td><td>8B6T-style multilevel codes</td></tr></tbody></table>' +
        '<p><b>Data rate N</b> = bits per second (bit rate). <b>Signal rate S</b> = signal elements per second, in <b>baud</b> (also called the modulation rate). The goal is to increase the data rate while reducing the baud rate.' + ref('L03 p6') + '</p>' +
        '<p class="mono">S = c × N × 1/r (baud)</p><p>c is the <b>case factor</b>: worst case 1, best case 0, and the <b>average case ½</b>, which is what the examples use.' + ref('L03 p8') + '</p>' +
        '<div class="callout key"><div class="callout-label">★ High yield</div>The handwritten marks call line coding “Main Section 1”, data rate vs signal rate “Main Section 2” and synchronization “Main Section 3”, with the examples as sub-sections.</div>' },
      { kind: 'example', title: 'Example 1: average baud rate', ref: 'L03 p9', gen: 'l03a.baud', params: { rCase: 'a', N: 100000 },
        slideAnswer: 'S = ½ × 100,000 × 1 = 50 kbaud', slideValue: 50000, input: 'S' },

      { kind: 'notes', id: 'bandwidth', title: 'Bandwidth of a digital signal', ref: 'L03 p10', html:
        '<p>The actual bandwidth of a digital signal is infinite, but its <b>effective bandwidth is finite</b>. The minimum bandwidth follows the signal rate: <b>B<sub>min</sub> = S</b> ' +
        '(Example 3), and the Nyquist limit still applies: <b>N<sub>max</sub> = 2 × B × log₂ L</b> for a noiseless channel (L02).' + ref('L03 p10') + ref('L03 p25') + '</p>' },

      { kind: 'notes', id: 'goodcode', title: 'What makes a good line code', ref: 'L03 pp11-17', html:
        '<ul><li><b>Baseline wandering</b> — the receiver computes a running average of the received signal power, the <b>baseline</b>. A long string of 0s or 1s makes the baseline drift and decoding hard. ' +
        'A good code prevents long runs of one amplitude.' + ref('L03 p11') + '</li>' +
        '<li><b>DC components</b> — when the voltage stays constant for a long time, low frequencies increase. Most channels are bandpass and cannot pass them, so the DC component must be removed.' + ref('L03 p12') + '</li>' +
        '<li><b>Self-synchronization</b> — sender and receiver clocks must use the same bit interval; a faster or slower receiver clock misreads the stream. Transitions in the signal let the receiver keep its clock aligned.' + ref('L03 p13') + '</li>' +
        '<li><b>Error detection</b> — some codes make certain transitions illegal, so the receiver notices a symbol error.' + ref('L03 p15') + '</li>' +
        '<li><b>Noise and interference immunity</b> — some codes make the signal “immune” to noise, which is stronger than just detecting errors.' + ref('L03 p16') + '</li>' +
        '<li><b>Complexity</b> — the more robust the code, the more complex it is, often paid for in baud rate or bandwidth.' + ref('L03 p17') + '</li></ul>' +
        '<figure data-fig="l03a.drift"></figure>' },
      { kind: 'example', title: 'Example 2: a receiver clock 0.1% fast', ref: 'L03 p14', gen: 'l03a.drift', params: { pct: 0.1, dir: 'fast', N1: 1000, N2: 1e6 },
        slideAnswer: '1001 bps instead of 1000 (1 extra bps); 1,001,000 bps instead of 1,000,000 (1000 extra bps)', slideValue: 1, input: 'x1' },

      { kind: 'notes', id: 'nrz', title: 'Unipolar and polar NRZ (NRZ-L, NRZ-I)', ref: 'L03 pp18-25', html:
        '<p>The schemes fall into five families (slide 19): <b>unipolar</b> (NRZ), <b>polar</b> (NRZ, RZ, biphase: Manchester and differential Manchester), <b>bipolar</b> (AMI, pseudoternary), ' +
        '<b>multilevel</b> (2B1Q, 8B6T, 4D-PAM5) and <b>multitransition</b> (MLT-3).' + ref('L03 p19') + '</p>' +
        '<p><b>Unipolar NRZ</b> — all levels on one side of the axis: 1 = +V, 0 = 0 V, and the level does not return to zero during a bit. Prone to baseline wandering and DC; no synchronization or error detection; ' +
        'simple but <b>costly in power</b> (normalized power ½V²).' + ref('L03 p20') + ref('L03 p21') + '</p>' +
        '<p><b>Polar NRZ</b> uses +V and −V:</p><ul>' +
        '<li><b>NRZ-L</b> (level): the voltage <b>level</b> decides the bit. Slide-figure convention: <b>0 = +V, 1 = −V</b>.</li>' +
        '<li><b>NRZ-I</b> (inversion): a <b>1 inverts</b> the level at the start of the bit; a 0 keeps it. The figure starts at +V.</li></ul>' +
        fig('nrzl,nrzi', '01001110', 'Slide 23: 01001110 in NRZ-L (0 = +V) and NRZ-I (a 1 inverts; starts at +V).') +
        '<ul><li>Both: average signal rate <b>N/2</b>, DC component and baseline wandering (<b>worse for NRZ-L</b>), no self-synchronization (NRZ-I loses sync only on long 0s), no error detection, simple.' + ref('L03 p24') + '</li></ul>' +
        seCallout('Slide 22 (text)', '“+V for 1 and −V for 0”', 'The NRZ-L figure on slide 23 uses 0 = +V and 1 = −V. Either polarity is a convention — state which one you use when drawing.') },
      { kind: 'example', title: 'Example 3: NRZ-I at 1 Mbps', ref: 'L03 p25', gen: 'l03a.baud', params: { scheme: 'nrzi', N: 1e6 },
        slideAnswer: 'S = ½ × 1 Mbps × 1 = 500 kbaud; B<sub>min</sub> = S = 500 kHz', slideValue: 500000, input: 'S' },
      { kind: 'example', title: 'Draw NRZ-L and NRZ-I (slide 23)', ref: 'L03 p23', gen: 'l03a.draw', params: { bits: '01001110', schemes: ['nrzl', 'nrzi'] },
        slideAnswer: 'NRZ-L + − + + − − − + · NRZ-I + − − − + − + +' },

      { kind: 'notes', id: 'rz', title: 'Polar RZ and biphase (Manchester, differential Manchester)', ref: 'L03 pp26-30', html:
        '<p><b>RZ (return to zero)</b> uses three values +, 0, −. Every bit has a transition in the middle — <b>1 = +V then 0</b>, <b>0 = −V then 0</b>. Two transitions per bit → wider bandwidth; ' +
        'no DC or baseline wandering; self-synchronizing; more complex (three levels); no error detection. r = ½, S = N.' + ref('L03 p26') + ref('L03 p27') + '</p>' +
        fig('rz', '01001', 'Slide 27: 01001 in RZ.') +
        '<p><b>Manchester</b> = NRZ-L + RZ: every bit has a level transition in the middle, using only two levels. Slide legend: <b>0 = high → low</b>, <b>1 = low → high</b>.' + ref('L03 p28') + ref('L03 p29') + '</p>' +
        '<p><b>Differential Manchester</b> = NRZ-I + RZ: a transition in the middle of every bit, and the value is decided at the <b>start</b> of the bit — a <b>0 changes level</b> at the start, a 1 does not.' + ref('L03 p28') + '</p>' +
        fig('manchester,dmanchester', '010011', 'Slide 29: 010011 in Manchester and differential Manchester (level before the first bit: +).') +
        '<ul><li>The mid-bit transition is used for <b>synchronization</b>; minimum bandwidth is <b>2 × that of NRZ</b> (S = N); <b>no DC</b> and no baseline wandering; no error detection.' + ref('L03 p30') + '</li></ul>' +
        seCallout('Slide 5 (text)', '“1 → +V and −V, 0 → −V and +V” (1 = high→low)', 'The Manchester legend on slide 29 is 0 = high→low, 1 = low→high. Follow the figure, and state your convention.') },
      { kind: 'example', title: 'Draw Manchester and differential Manchester (slide 29)', ref: 'L03 p29', gen: 'l03a.draw', params: { bits: '010011', schemes: ['manchester', 'dmanchester'] },
        slideAnswer: 'Manchester (+−)(−+)(+−)(+−)(−+)(−+) · diff. Manchester (−+)(+−)(+−)(+−)(−+)(+−)' },

      { kind: 'notes', id: 'bipolar', title: 'Bipolar: AMI and pseudoternary', ref: 'L03 pp31-33', html:
        '<p>Three voltage levels +, 0, −, but no return to zero within a bit. One symbol is 0 V and the other <b>alternates</b> between + and −.' + ref('L03 p31') + '</p><ul>' +
        '<li><b>AMI</b> (alternate mark inversion): <b>0 = 0 V</b>, <b>1s alternate +V, −V</b> (the first 1 is +V in the slide figure).</li>' +
        '<li><b>Pseudoternary</b>: the reverse — 1 = 0 V, 0s alternate. <span class="badge low">Low priority</span> the handwritten note on slide 32 says “not included”.</li></ul>' +
        fig('ami,pseudoternary', '010010', 'Slide 32: 010010 in AMI and pseudoternary.') +
        '<ul><li>A better alternative to NRZ: <b>no DC component or baseline wandering</b>; but <b>no self-synchronization</b> for long runs of 0s (no transitions), and no error detection. S = N/2.' + ref('L03 p33') + '</li></ul>' },

      { kind: 'notes', id: 'multilevel', title: 'Multilevel schemes: mBnL, 2B1Q, 8B6T, 4D-PAM5', ref: 'L03 pp34-42', html:
        '<p>Multilevel schemes pack more data bits into each symbol. m data bits give <b>2<sup>m</sup></b> data patterns; n signal elements with L levels give <b>L<sup>n</sup></b> signal patterns:</p><ul>' +
        '<li>2<sup>m</sup> &gt; L<sup>n</sup>: not enough signal patterns — impossible.</li><li>2<sup>m</sup> = L<sup>n</sup>: an exact mapping, no redundancy.</li>' +
        '<li>2<sup>m</sup> &lt; L<sup>n</sup>: extra patterns — choose the most distinct ones for noise immunity, and the unused ones signal errors.</li></ul>' +
        '<p>So an <b>mBnL</b> code needs <b>2<sup>m</sup> ≤ L<sup>n</sup></b>. In the name, m = binary pattern length, B = binary data, n = signal pattern length, and L is written B (2 levels), T (3, ternary) or Q (4, quaternary).' + ref('L03 p36') + ref('L03 p37') + '</p>' +
        '<h4>2B1Q (2 bits → 1 quaternary symbol)</h4><table class="tbl compact"><thead><tr><th>Next bits</th><th>Previous level +</th><th>Previous level −</th></tr></thead><tbody>' +
        '<tr><td class="mono">00</td><td>+1</td><td>−1</td></tr><tr><td class="mono">01</td><td>+3</td><td>−3</td></tr><tr><td class="mono">10</td><td>−1</td><td>+1</td></tr><tr><td class="mono">11</td><td>−3</td><td>+3</td></tr></tbody></table>' +
        fig('2b1q', '0011011001', 'Slide 38: 00 11 01 10 01 → +1, −3, −3, +1, +3 (positive starting level). Average signal rate N/4.') +
        seCallout('Slide 38', 'The box says r = 1/2', 'r = 2 (two bits per level); that is the only value consistent with S<sub>avg</sub> = N/4.') +
        '<p><b>Redundancy:</b> 2B1Q has none, so a DC component is present. Codes with redundancy can use only “0- or +-weighted” patterns and invert any pattern that would create DC — e.g. +00++− is sent as −00−−+; ' +
        'the receiver inverts it back.' + ref('L03 p39') + '</p>' +
        '<p><b>8B6T</b> maps 8 bits to 6 ternary symbols (slide examples: 00010001 → −0−0++; 01010011 → −+−++0; 01010000 → +−−+0+, sent inverted as −++−0− to keep the DC balance).' + ref('L03 p40') + '</p>' +
        '<p><b>Multiple channels (xD-YYYz):</b> split the signal across x links at once, lowering the signal rate per link; YYYz = z levels of a modulation type such as PAM. ' +
        '<b>4D-PAM5</b> sends 00011110 as −2, +1, +2, −1 on four wires: 1 Gbps → 250 Mbps per wire at 125 Mbaud.' + ref('L03 p41') + ref('L03 p42') + '</p>' },
      { kind: 'example', title: 'Is 8B6T a valid mBnL code?', ref: 'L03 pp34-37', gen: 'l03a.mbnl', params: { m: 8, n: 6, L: 3 },
        slideAnswer: '2⁸ = 256 ≤ 3⁶ = 729 → valid, with 473 unused patterns' },

      { kind: 'notes', id: 'mlt3', title: 'Multitransition: MLT-3', ref: 'L03 pp43-45', html:
        '<p>MLT-3 cycles through three levels. Rules: a <b>0 keeps the level</b>; a <b>1 moves</b> — from +V or −V to 0, and from 0 to the opposite of the last nonzero level. The slide trace starts at 0 V with its first 1 going to +V.' + ref('L03 p44') + '</p>' +
        fig('mlt3', '01011011', 'Slide 44 (a): typical case 01011011 → 0, +, +, 0, −, −, 0, +.') +
        fig('mlt3', '11111111', 'Slide 44 (b): worst case 11111111 → +, 0, −, 0, +, 0, −, 0 — periodic, one period every 4 bits.') +
        '<p>Its signal rate is the same as NRZ-I, but the worst-case pattern 1111 is periodic and behaves like an analog signal at <b>¼ of the bit rate</b>.' + ref('L03 p45') + ' The summary table lists B = N/3.' + ref('L03 p46') + '</p>' },

      { kind: 'notes', id: 'summary', title: 'Summary of line coding schemes', ref: 'L03 p46', html:
        '<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Category</th><th>Scheme</th><th>Bandwidth (avg)</th><th>Characteristics</th></tr></thead><tbody>' +
        '<tr><td>Unipolar</td><td>NRZ</td><td>B = N/2</td><td>Costly, no self-synchronization if long 0s or 1s, DC</td></tr>' +
        '<tr><td>Polar</td><td>NRZ-L</td><td>B = N/2</td><td>No self-synchronization if long 0s or 1s, DC</td></tr>' +
        '<tr><td>Polar</td><td>NRZ-I</td><td>B = N/2</td><td>No self-synchronization for long 0s, DC</td></tr>' +
        '<tr><td>Polar</td><td>Biphase</td><td>B = N</td><td>Self-synchronization, no DC, high bandwidth</td></tr>' +
        '<tr><td>Bipolar</td><td>AMI</td><td>B = N/2</td><td>No self-synchronization for long 0s (no DC — slide 33)</td></tr>' +
        '<tr><td>Multilevel</td><td>2B1Q</td><td>B = N/4</td><td>No self-synchronization for long same double bits</td></tr>' +
        '<tr><td>Multilevel</td><td>8B6T</td><td>B = 3N/4</td><td>Self-synchronization, no DC</td></tr>' +
        '<tr><td>Multilevel</td><td>4D-PAM5</td><td>B = N/8</td><td>Self-synchronization, no DC</td></tr>' +
        '<tr><td>Multitransition</td><td>MLT-3</td><td>B = N/3</td><td>No self-synchronization for long 0s</td></tr></tbody></table></div>' +
        seCallout('Slide 46', 'NRZ-L, NRZ-I and biphase are labelled “Unipolar”; AMI is marked “DC”; MLT-3’s category is “Multiline”', 'They are polar codes; AMI has no DC component (slide 33); the category is multitransition.') +
        '<p class="small">8B6T: the slide table gives <b>B = 3N/4</b> — use it for questions on this table. The general formula with c = ½ and r = 4/3 would give S = 3N/8; the textbook still puts 8B6T’s minimum bandwidth at about 6N/8 = 3N/4.</p>' },

      { kind: 'notes', id: 'block', title: 'Block coding: 4B/5B and 8B/10B', ref: 'L03 pp47-56', html:
        '<p>Error detection and synchronization both need <b>redundancy</b>. Block coding adds it in three steps — <b>division</b> into m-bit groups, <b>substitution</b> with n-bit groups, ' +
        '<b>combination</b> into one stream. It is written <b>mB/nB</b> (with a slash, unlike multilevel mBnL) and avoids bit patterns that would cause DC or poor synchronization in the line code.' + ref('L03 p48') + ref('L03 p49') + '</p>' +
        '<p><b>4B/5B</b> is used with <b>NRZ-I</b>: NRZ-I fails on long runs of 0s, and no code word in the slide-51 table starts with more than one 0 or ends with more than two, so the coded stream never has more than three 0s in a row.' + ref('L03 p50') + '</p>' +
        table4b5b +
        '<figure data-fig="l03a.blockcode" data-bits="000011110001"></figure>' +
        '<p><b>Redundancy:</b> 2⁴ = 16 data words, 2⁵ = 32 code words → 32 − 16 = 16 extra words, some used for control and signalling.' + ref('L03 p53') + '</p>' +
        seCallout('Slide 53', '“24 combinations … 25 = 32 … 32 − 26 = 16”', '2⁴ = 16, 2⁵ = 32, and 32 − 16 = 16 (lost superscripts and a typo).') +
        '<p><b>8B/10B</b> = a 5B/6B encoder plus a 3B/4B encoder and a <b>disparity controller</b>; more redundant bits let it pick code words that prevent long runs of one voltage (DC).' + ref('L03 p55') + ref('L03 p56') + '</p>' },
      { kind: 'example', title: 'Example 4: 4B/5B with NRZ-I', ref: 'L03 p54', gen: 'l03a.baud', params: { scheme: 'nrzi', N: 1e6, block: true },
        slideAnswer: '1 Mbps → 1.25 Mbps; NRZ-I minimum bandwidth N/2 = 625 kHz', slideValue: 625000, input: 'B' },
      { kind: 'example', title: 'Example 4 (other choice): 4B/5B with Manchester', ref: 'L03 p54', gen: 'l03a.baud', params: { scheme: 'manchester', N: 1e6, block: true },
        slideAnswer: 'Manchester needs 1.25 MHz — more bandwidth, but no DC problem', slideValue: 1.25e6, input: 'B' },
      { kind: 'example', title: 'Encode with the 4B/5B table', ref: 'L03 p51', gen: 'l03a.block', params: { dir: 'enc', bits: '000011110001', N: 1e6 } },

      { kind: 'notes', id: 'scrambling', title: 'Scrambling: B8ZS and HDB3', ref: 'L03 pp57-61', html:
        '<p>The best code adds no bandwidth for synchronization and has no DC. <b>Scrambling</b> creates such a stream on the fly, during encoding: it replaces “unfriendly” runs of bits with a ' +
        '<b>violation code</b> that is easy to recognize. It is used with AMI (“modified AMI”).' + ref('L03 p57') + ref('L03 p58') + '</p>' +
        '<ul><li><b>B8ZS</b> replaces <b>eight consecutive zeros with 000VB0VB</b>. <b>V</b> = violation (breaks the AMI rule: same polarity as the previous pulse); <b>B</b> = bipolar (follows the AMI rule).' + ref('L03 p59') + '</li></ul>' +
        '<figure data-fig="l03a.scramble" data-code="b8zs" data-bits="100000000" data-prev="-1" data-caption="Slide 59 (a): previous level positive → 000+−0−+."></figure>' +
        '<figure data-fig="l03a.scramble" data-code="b8zs" data-bits="100000000" data-prev="1" data-caption="Slide 59 (b): previous level negative → 000−+0+−."></figure>' +
        '<ul><li><b>HDB3</b> replaces <b>four consecutive zeros</b> with <b>000V</b> or <b>B00V</b>, depending on the number of nonzero pulses since the last substitution: ' +
        '<b>even → B00V</b>, <b>odd → 000V</b> — either way the total number of nonzero pulses becomes even.' + ref('L03 p60') + '</li></ul>' +
        '<figure data-fig="l03a.scramble" data-code="hdb3" data-bits="1100001000000000" data-prev="-1" data-parity="0" data-caption="Slide 61: 11 0000 1 0000 0000 0 → + − | +00+ | − | 000− | +00+ | 0."></figure>' +
        seCallout('Slide 58', 'The receiver box says “Modified AMI encoding”', 'The receiver decodes — it should say decoding.') },
      { kind: 'example', title: 'B8ZS (slide 59, case a)', ref: 'L03 p59', gen: 'l03a.scramble', params: { code: 'b8zs', bits: '100000000', prev: -1 },
        slideAnswer: '+ 0 0 0 + − 0 − +' },
      { kind: 'example', title: 'HDB3 (slide 61)', ref: 'L03 p61', gen: 'l03a.scramble', params: { code: 'hdb3', bits: '1100001000000000', prev: -1, parity: 0 },
        slideAnswer: '+ − + 0 0 + − 0 0 0 − + 0 0 + 0' },

      { kind: 'formulas', ids: ['l03a.baud', 'l03a.bmin', 'l03a.nmax', 'l03a.mbnl', 'l03a.4b5b', 'l03a.drift'] },
      { kind: 'practice', gens: ['l03a.draw', 'l03a.baud', 'l03a.decode', 'l03a.scramble', 'l03a.block', 'l03a.drift', 'l03a.mbnl'] },
      { kind: 'quick', n: 8 },
      { kind: 'traps', items: [
        { trap: 'Mixing NRZ-L polarities between parts of an answer', fix: 'Pick one convention (slide figure: 0 = +V) and state it in a legend.', ref: 'L03 p23' },
        { trap: 'Flipping Manchester’s direction', fix: 'Slide 29 legend: 0 = high→low, 1 = low→high. Differential Manchester: a 0 changes level at the START of the bit.', ref: 'L03 p29' },
        { trap: 'Inverting NRZ-I on a 0', fix: 'Only a 1 inverts, at the beginning of the bit.', ref: 'L03 p22' },
        { trap: 'Using the bit rate as the bandwidth', fix: 'B<sub>min</sub> follows the average signal rate: N/2 for NRZ, N for Manchester.', ref: 'L03 p25; L03 p46' },
        { trap: 'Taking 2B1Q’s r as ½ (as the slide box says)', fix: 'r = 2 — two bits per level — so S<sub>avg</sub> = N/4.', ref: 'L03 p38' },
        { trap: 'Forgetting that 4B/5B raises the rate first', fix: 'Multiply by 5/4 before applying the line code’s bandwidth rule (1 Mbps → 1.25 Mbps → 625 kHz with NRZ-I).', ref: 'L03 p54' },
        { trap: 'B8ZS: giving V the AMI polarity', fix: 'V violates AMI (same polarity as the previous pulse); B obeys AMI.', ref: 'L03 p59' },
        { trap: 'HDB3: counting pulses from the start of the stream', fix: 'Count nonzero pulses since the LAST substitution: even → B00V, odd → 000V.', ref: 'L03 p60' }
      ] },
      { kind: 'mnemonics', items: [
        'NRZ-I: “<b>I</b>nvert on <b>one</b>”.',
        'Manchester: “one goes <b>up</b>, zero goes <b>down</b>” (mid-bit). Differential Manchester: “<b>zero changes</b> at the start”.',
        'AMI: “<b>zeros are zero</b>, ones alternate”. Pseudoternary swaps the roles.',
        'Bandwidth ladder: 4D-PAM5 N/8 · 2B1Q N/4 · MLT-3 N/3 · NRZ & AMI N/2 · 8B6T 3N/4 · Manchester & RZ N.',
        'B8ZS = “000 V B 0 V B”; HDB3 = “Even? B00V. Odd? 000V.”'
      ] },
      { kind: 'recall', prompts: [
        'Write S = c·N·(1/r), say what c and r mean, and redo Examples 1 and 3.',
        'List the six characteristics of a good line code and explain baseline wandering and DC components.',
        'Draw 01001110 in NRZ-L and NRZ-I, and 010011 in Manchester and differential Manchester, from memory.',
        'Rebuild the slide-46 summary table: scheme, average bandwidth, sync/DC behaviour.',
        'Encode 0000 1111 with 4B/5B; explain why 4B/5B is paired with NRZ-I; redo Example 4.',
        'Apply B8ZS to 1 00000000 and HDB3 to slide 61’s stream.'
      ] }
    ],
    slideErrors: [
      { ref: 'L03 p22', says: 'NRZ-L text: “+V for 1 and −V for 0” (and “NZR – Level”)', correct: 'The slide-23 figure uses 0 = +V, 1 = −V; state your convention. “NZR” is a typo for NRZ.' },
      { ref: 'L03 p5', says: 'Example mapping 1 → +V then −V (1 = high→low)', correct: 'The Manchester legend on slide 29: 0 = high→low, 1 = low→high.' },
      { ref: 'L03 p38', says: '2B1Q box: r = 1/2', correct: 'r = 2 (two bits per level), giving S<sub>avg</sub> = N/4.' },
      { ref: 'L03 p46', says: 'NRZ-L, NRZ-I and biphase listed under “Unipolar”', correct: 'They are polar schemes.' },
      { ref: 'L03 p46', says: 'AMI marked “DC”', correct: 'Slide 33: AMI has no DC component.' },
      { ref: 'L03 p46', says: 'Category “Multiline” for MLT-3', correct: 'Multitransition (slides 19 and 44).' },
      { ref: 'L03 p53', says: '“24 … 25 = 32 … 32 − 26 = 16”', correct: '2⁴ = 16, 2⁵ = 32, 32 − 16 = 16.' },
      { ref: 'L03 p58', says: 'Receiver box: “Modified AMI encoding”', correct: 'It should say decoding.' },
      { ref: 'L03 p19', says: '“2B/1Q, 8B/6T” written with a slash', correct: 'The slash marks block coding (mB/nB); multilevel codes are written 2B1Q and 8B6T.' },
      { ref: 'L03 p25', says: '“S = c × N × R”', correct: 'S = c × N × 1/r.' }
    ],
    glossary: [
      { term: 'Line coding', def: 'Converting a string of bits into a sequence of signal levels.', ref: 'L03 p3' },
      { term: 'Data element', def: 'A data symbol: one bit or a group of bits (1, 0 or 11, 10, 01, …) that is mapped onto signal levels.', ref: 'L03 p5' },
      { term: 'Signal element', def: 'The unit of the signal that carries data elements; a data symbol is coded into one or more signal elements.', ref: 'L03 p5' },
      { term: 'Ratio r', def: 'Number of data elements carried by each signal element.', ref: 'L03 p5' },
      { term: 'Signal rate', alt: ['baud rate', 'modulation rate'], def: 'Signal elements per second (baud); S = c × N × 1/r.', ref: 'L03 p6; L03 p8' },
      { term: 'Case factor (c)', def: 'Worst case 1, best case 0, average ½ in S = c × N × 1/r.', ref: 'L03 p8' },
      { term: 'Baseline wandering', def: 'Drift of the receiver’s running-average power (the baseline) caused by long runs of 0s or 1s.', ref: 'L03 p11' },
      { term: 'DC component', def: 'Low-frequency energy from a constant voltage held for long periods; bandpass channels cannot pass it.', ref: 'L03 p12' },
      { term: 'Self-synchronization', def: 'Transitions in the signal that keep the receiver’s clock aligned with the sender’s bit intervals.', ref: 'L03 p13' },
      { term: 'NRZ-L', def: 'Polar NRZ where the level decides the bit (slide figure: 0 = +V, 1 = −V).', ref: 'L03 p22; L03 p23' },
      { term: 'NRZ-I', def: 'Polar NRZ where a 1 inverts the level and a 0 keeps it.', ref: 'L03 p22' },
      { term: 'RZ', alt: ['return to zero'], def: 'Polar code with three levels; the signal returns to zero in the middle of every bit.', ref: 'L03 p26' },
      { term: 'Manchester', def: 'Biphase code (NRZ-L + RZ): mid-bit transition every bit; 0 = high→low, 1 = low→high.', ref: 'L03 p28; L03 p29' },
      { term: 'Differential Manchester', def: 'Biphase code (NRZ-I + RZ): mid-bit transition every bit; a 0 changes level at the start of the bit.', ref: 'L03 p28' },
      { term: 'AMI', alt: ['alternate mark inversion'], def: 'Bipolar code: 0 = 0 V, 1s alternate between +V and −V.', ref: 'L03 p31' },
      { term: 'Pseudoternary', def: 'Bipolar code, the reverse of AMI: 1 = 0 V, 0s alternate.', ref: 'L03 p31' },
      { term: 'mBnL', def: 'Multilevel code: m data bits → n signal elements with L levels; requires 2^m ≤ L^n.', ref: 'L03 p36; L03 p37' },
      { term: '2B1Q', def: 'Two bits per quaternary level (four levels), coded relative to the previous level; S = N/4.', ref: 'L03 p38' },
      { term: 'MLT-3', def: 'Multitransition code cycling through +V, 0, −V: a 0 keeps the level, a 1 moves to the next level.', ref: 'L03 p44' },
      { term: 'Block coding', def: 'mB/nB substitution adding redundancy for synchronization and error detection (division, substitution, combination).', ref: 'L03 p48' },
      { term: '4B/5B', def: 'Block code replacing every 4 bits with a 5-bit code word; raises the rate by 5/4; used with NRZ-I.', ref: 'L03 p50; L03 p51' },
      { term: 'Scrambling', def: 'Replacing unfriendly bit runs on the fly with recognizable violation codes, without adding bandwidth.', ref: 'L03 p57' },
      { term: 'B8ZS', def: 'Bipolar with 8-zero substitution: 00000000 → 000VB0VB.', ref: 'L03 p59' },
      { term: 'HDB3', def: 'High-density bipolar 3-zero: 0000 → 000V (odd pulses since last substitution) or B00V (even).', ref: 'L03 p60' },
      { term: 'Violation (V)', def: 'A pulse that breaks the AMI rule (same polarity as the previous pulse), so the receiver recognizes a substitution.', ref: 'L03 p59' }
    ],
    cheat: [
      { title: 'L03a · Rates & properties', html: '<ul>' +
        '<li><em class="k">S = c × N × 1/r</em> (baud); c = ½ average; B<sub>min</sub> = S</li>' +
        '<li>r: NRZ 1 · RZ/Manchester ½ · <em class="k">2B1Q 2</em> · 8B6T 4/3</li>' +
        '<li>Avg B: NRZ-L/I, AMI <em class="k">N/2</em> · RZ, biphase <em class="k">N</em> · 2B1Q N/4 · MLT-3 N/3 · 8B6T 3N/4 · 4D-PAM5 N/8</li>' +
        '<li>Good code: no <em class="k">baseline wandering</em>, no <em class="k">DC</em>, self-sync, error detection, noise immunity, low complexity</li>' +
        '<li>Ex 1: 100 kbps, r = 1 → <em class="k">50 kbaud</em> · Ex 2: 0.1% fast → 1001 bps / 1,001,000 bps · Ex 3: NRZ-I 1 Mbps → <em class="k">500 kbaud, 500 kHz</em></li></ul>' },
      { title: 'L03a · Scheme rules (slide figures)', html: '<ul>' +
        '<li>Unipolar NRZ 1 = +V, 0 = 0 · <em class="k">NRZ-L 0 = +V, 1 = −V</em> · <em class="k">NRZ-I: 1 inverts</em> (start +)</li>' +
        '<li>RZ: 1 = +V→0, 0 = −V→0 · <em class="k">Manchester 0 = high→low, 1 = low→high</em></li>' +
        '<li><em class="k">Diff. Manchester: 0 = transition at start</em>, always mid-bit transition</li>' +
        '<li><em class="k">AMI 0 = 0 V, 1s alternate</em> (first +) · pseudoternary = reverse (low priority)</li>' +
        '<li>2B1Q (prev +): 00 +1, 01 +3, 10 −1, 11 −3 (prev −: signs flip)</li>' +
        '<li>MLT-3: 0 stays; 1 → 0 from ±V, or → opposite of last nonzero from 0</li>' +
        '<li>mBnL needs <em class="k">2^m ≤ L^n</em>; B = 2, T = 3, Q = 4 levels</li></ul>' },
      { title: 'L03a · Block coding & scrambling', html: '<ul>' +
        '<li>Block coding mB/nB: division → substitution → combination; adds redundancy</li>' +
        '<li><em class="k">4B/5B + NRZ-I</em>; rate × 5/4; 16 spare codes (control: I 11111, Q 00000, H 00100, J 11000, K 10001, T 01101)</li>' +
        '<li>Ex 4: 1 Mbps → <em class="k">1.25 Mbps</em> → NRZ-I <em class="k">625 kHz</em> / Manchester 1.25 MHz</li>' +
        '<li>8B/10B = 5B/6B + 3B/4B + disparity controller</li>' +
        '<li><em class="k">B8ZS: 8 zeros → 000VB0VB</em> (V same polarity as previous pulse)</li>' +
        '<li><em class="k">HDB3: 4 zeros → B00V if even, 000V if odd</em> (pulses since last substitution)</li></ul>' }
    ]
  });
})();
