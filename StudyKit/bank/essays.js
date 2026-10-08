/* Essay practice for the topic pages (draw and/or explain). General pool only — never on Forms A/B or the diagnostic.
   Every claim comes from docs/source-digest.md; textbook-only material carries a "Beyond slides" badge. */
(function () {
  'use strict';
  KIT.bank.add([
    /* ===== L01: LAN vs WAN vs wireless ===== */
    { id: 'l01.e003', topic: 'l01', type: 'essay', diff: 2, ref: 'L01 pp6-12',
      q: 'Compare <b>LAN</b>, <b>WAN</b> and <b>wireless</b> networks: what each one covers, the media it typically uses, and examples of each. Sketch the three side by side if it helps. You may draw, explain, or both.',
      rubric: [
        { pts: 1, point: 'LAN coverage: a connection of computers typically within 5 km, with the computers normally adjacent to each other.' },
        { pts: 1, point: 'LAN media and standards: the computers are interconnected using copper or fiber media, and a LAN typically uses the IEEE 802 series (e.g. 802.3 Ethernet); the IEEE took over LAN standards for the physical and data link layers.' },
        { pts: 1, point: 'WAN: geographically long-distance connections — a long cable, normally fiber optic (dark fiber = unused fiber; examples: submarine cable, fiber laid beside roads or railways), or microwave through satellites (e.g. Starlink) and terrestrial microwave links.' },
        { pts: 1, point: 'Wireless: unguided media using radio signals (also microwave) over a short or long distance; it can be a personal, local or wide area network and uses a “cell” to interconnect mobile devices (examples: Bluetooth, the IEEE 802.11 series, the LTE mobile phone network).' },
        { pts: 1, point: 'A clear labelled sketch or comparison table that puts the three types side by side (coverage, medium, example) and shows the wireless network without a cable.' }],
      model: '<p>The slides sort the networks of the data link layer into three types: LAN, WAN and wireless. <span class="chip ref">L01 p6</span></p>' +
        '<table class="tbl compact"><thead><tr><th>Type</th><th>What it covers</th><th>Typical media</th><th>Examples</th></tr></thead><tbody>' +
        '<tr><td><b>LAN</b></td><td>Computers typically within <b>5 km</b>, normally adjacent to each other <span class="chip ref">L01 p7</span></td>' +
        '<td><b>Copper or fiber</b>; typically the IEEE 802 series <span class="chip ref">L01 p7</span></td>' +
        '<td>Ethernet (IEEE 802.3, CSMA/CD) <span class="chip ref">L01 p9</span></td></tr>' +
        '<tr><td><b>WAN</b></td><td>Geographically long-distance connections <span class="chip ref">L01 p6</span></td>' +
        '<td>A long cable, normally <b>fiber optic</b> (dark fiber = unused fiber); microwave through satellites and terrestrial links <span class="chip ref">L01 p10</span></td>' +
        '<td>Submarine cable; fiber laid beside roads or railways; satellites such as SpaceX Starlink (550 km above the earth); terrestrial microwave link <span class="chip ref">L01 p10</span> <span class="chip ref">L01 p11</span></td></tr>' +
        '<tr><td><b>Wireless</b></td><td>Short or long distance; can be a personal, local or wide area network <span class="chip ref">L01 p6</span> <span class="chip ref">L01 p12</span></td>' +
        '<td><b>Unguided</b> media: radio signals, also microwave; a “cell” interconnects mobile devices <span class="chip ref">L01 p12</span></td>' +
        '<td>Bluetooth; IEEE 802.11 series; LTE mobile phone network <span class="chip ref">L01 p12</span></td></tr></tbody></table>' +
        '<p><b>If drawn:</b> a LAN as a few computers joined by copper or fiber; a WAN as distant sites joined by a long fiber, a submarine cable and a satellite with its uplink and downlink; a wireless network as mobile devices linked through a cell, with no cable between them. <span class="chip ref">L01 p10</span> <span class="chip ref">L01 p12</span></p>' +
        '<p>The IEEE took over LAN standards — primarily for the physical and data link layers, using the OSI model as a framework — after an early period of proprietary, vendor-locked networks. <span class="chip ref">L01 p8</span> ' +
        'Of the 802 numbers, 802.3 is CSMA/CD Ethernet and 802.11 is wireless. <span class="chip ref">L01 p9</span></p>' +
        '<p>The types overlap: “wireless” describes the medium (unguided), and a wireless network can itself be a personal, local or wide area network. <span class="chip ref">L01 p12</span> ' +
        'If the terrestrial microwave link is drawn, show it as a line-of-sight path; the slide’s picture of ground and sky waves is wrong. <span class="chip ref">L01 p10</span></p>',
      explain: 'Award each rubric point independently.' },

    /* ===== L02: time domain vs frequency domain ===== */
    { id: 'l02.e003', topic: 'l02', type: 'essay', diff: 2, ref: 'L02 pp11-13; L02 p4; L02 p7',
      q: 'Draw a <b>composite signal</b> made of two sine waves, of frequency <i>f</i> and 3<i>f</i>, in the <b>time domain</b>, then draw its <b>frequency-domain</b> spectrum. Define <b>bandwidth</b> and work it out for the slide example whose components run from 1000 Hz to 5000 Hz. You may draw, explain, or both.',
      rubric: [
        { pts: 1, point: 'Composite signal: a combination of simple sine waves with different frequencies, amplitudes and phases (Fourier); here f is the main (fundamental) frequency and 3f the second component.' },
        { pts: 1, point: 'Time domain: time on the horizontal axis and the value (strength) of the signal on the vertical axis; the drawing shows the f wave, the faster 3f wave (three cycles for each cycle of f) and their sum, the composite.' },
        { pts: 1, point: 'Frequency domain: frequency on the horizontal axis and one vertical line per sine wave at its own frequency — two lines, at f and at 3f, with the height showing the amplitude.' },
        { pts: 1, point: 'Bandwidth: the range of frequencies contained in a composite signal, normally a difference between two numbers (highest minus lowest); for f and 3f it is 3f − f = 2f.' },
        { pts: 1, point: 'Slide example: components from 1000 Hz to 5000 Hz give B = 5000 − 1000 = 4000 Hz.' }],
      model: '<p>A <b>composite signal</b> is a combination of simple sine waves with different frequencies, amplitudes and phases (Fourier), and it can be periodic or nonperiodic. <span class="chip ref">L02 p11</span> ' +
        'Slide 12 builds one from <i>f</i>, 3<i>f</i> and 9<i>f</i>; the main frequency is the <b>fundamental frequency</b>. Here the signal has just <i>f</i> and 3<i>f</i>. <span class="chip ref">L02 p12</span></p>' +
        '<p><b>Time domain.</b> The vertical axis is the value (strength) of the signal and the horizontal axis is time. <span class="chip ref">L02 p4</span> ' +
        'Draw the <i>f</i> wave (one cycle in the period <i>T</i> = 1/<i>f</i>), <span class="chip ref">L02 p7</span> the 3<i>f</i> wave (three faster cycles in the same time), and add them point by point to get the composite. ' +
        'Because 3<i>f</i> completes exactly three cycles in each period of <i>f</i>, the composite repeats every <i>T</i> = 1/<i>f</i>.</p>' +
        '<p><b>Frequency domain.</b> The same signal drawn against frequency: each sine wave becomes one vertical line at its own frequency, and the height of the line shows its amplitude. ' +
        'This spectrum has two lines, one at <i>f</i> and one at 3<i>f</i>. The time view shows the shape of the signal; the frequency view shows which frequencies it contains. <span class="chip ref">L02 p12</span></p>' +
        '<figure data-fig="l02.composite" data-caption="Slide 12 uses f, 3f and 9f: time domain on top, frequency domain below. For an f and 3f signal, leave out the 9f wave and the 9f line."></figure>' +
        '<p><b>Bandwidth</b> is the range of frequencies contained in a composite signal; it is normally a difference between two numbers, the highest frequency minus the lowest. <span class="chip ref">L02 p13</span> ' +
        'For <i>f</i> and 3<i>f</i>: B = 3<i>f</i> − <i>f</i> = 2<i>f</i>. For the slide example, a spectrum running from 1000 Hz to 5000 Hz has B = 5000 − 1000 = <b>4000 Hz</b>.</p>' +
        '<figure data-fig="l02.spectrum" data-lo="1000" data-hi="5000"></figure>',
      explain: 'Award each rubric point independently.' },

    /* ===== L02: baseband vs broadband ===== */
    { id: 'l02.e004', topic: 'l02', type: 'essay', diff: 2, ref: 'L02 pp15-18; L01 p17',
      q: 'Compare <b>baseband</b> and <b>broadband</b> transmission. Draw a <b>low-pass</b> channel and a <b>bandpass</b> channel on a frequency axis, then explain when each kind of transmission is used. You may draw, explain, or both.',
      rubric: [
        { pts: 1, point: 'Baseband: sending a digital signal over a channel without changing it into an analog signal; it needs a wide-bandwidth medium, a dedicated medium whose bandwidth constitutes only one channel.' },
        { pts: 1, point: 'Low-pass channel with limited bandwidth: the digital signal can only be approximated by an analog signal, and how good the approximation is depends on the bandwidth available (the first harmonic alone needs B = N/2; adding 3N/2 and 5N/2 needs B = 5N/2 and gives a closer match).' },
        { pts: 1, point: 'Broadband: the digital signal is changed into an analog signal (modulation) for transmission, which lets us use a bandpass channel, a channel with a bandwidth that does not start from zero.' },
        { pts: 1, point: 'When each is used: baseband when a wide-bandwidth dedicated medium is available; broadband, with a modulator at the sender and a demodulator at the receiver, when the medium has limited bandwidth and cannot pass the digital signal as it is.' },
        { pts: 1, point: 'A labelled drawing (or description) of the two channels on a frequency axis: the low-pass band starting at 0 Hz and the bandpass band between two frequencies above 0 Hz.' }],
      model: '<p><b>Baseband transmission</b> means sending a digital signal over a channel <i>without</i> changing it into an analog signal. It is possible for a <b>wide-bandwidth</b> medium — a dedicated medium whose bandwidth constitutes only one channel. <span class="chip ref">L02 p16</span></p>' +
        '<p>A <b>low-pass</b> channel is one whose band starts at zero (a bandpass channel, below, is the kind that does not). When a low-pass channel has only limited bandwidth, the digital signal can only be <b>approximated</b> by an analog signal, ' +
        'and the level of approximation depends on the bandwidth available: the first harmonic alone needs B = N/2 (N is the bit rate), and adding the harmonics at 3N/2 and 5N/2 needs B = 5N/2 but gives a closer copy of the digital signal. <span class="chip ref">L02 p17</span></p>' +
        '<figure data-fig="l02.lowpass"></figure>' +
        '<p><b>Broadband transmission</b> means changing the digital signal into an analog signal for transmission. Modulation allows us to use a <b>bandpass channel</b> — a channel with a bandwidth that does not start from zero. <span class="chip ref">L02 p18</span></p>' +
        '<figure data-fig="l01.analog" data-caption="Same bits, two ways: baseband sends the digital levels as they are; broadband sends an analog signal whose amplitude or frequency carries the bits (modulation)."></figure>' +
        '<p><b>The two channels on a frequency axis:</b></p>' +
        '<table class="tbl compact"><thead><tr><th>Channel</th><th>Band on the frequency axis</th><th>Carries</th></tr></thead><tbody>' +
        '<tr><td><b>Low-pass</b></td><td>from 0 Hz up to an upper limit — the band starts at zero</td><td>Baseband: the digital signal itself, or an approximation of it <span class="chip ref">L02 p16</span> <span class="chip ref">L02 p17</span></td></tr>' +
        '<tr><td><b>Bandpass</b></td><td>between two frequencies f<sub>1</sub> and f<sub>2</sub>, both above 0 Hz — the band does not start from zero</td><td>Broadband: the modulated analog signal <span class="chip ref">L02 p18</span></td></tr></tbody></table>' +
        '<p><b>When each is used.</b> Baseband is used when the medium is a wide-bandwidth, dedicated one. When bandwidth is limited, the medium does not let the digital signal pass; the signal is then modulated into an analog signal that a bandpass channel can carry, ' +
        'with a modulator at the sender and a demodulator at the receiver (one pair for each direction) — broadband transmission. <span class="chip ref">L02 p16</span> <span class="chip ref">L02 p18</span> <span class="chip ref">L01 p17</span></p>',
      explain: 'Award each rubric point independently.' },

    /* ===== L03a: block coding ===== */
    { id: 'l03a.e003', topic: 'l03a', type: 'essay', diff: 2, ref: 'L03 pp47-57; L03 pp22-24; L03 p46; L03 p59',
      q: 'Draw the <b>block coding</b> process for <b>4B/5B</b> and explain its three steps. Say why 4B/5B is paired with <b>NRZ-I</b>, what it does to the bit rate, and how block coding differs from <b>scrambling</b>. You may draw, explain, or both.',
      rubric: [
        { pts: 1, point: 'The three steps of block coding (mB/nB): division of the bit stream into m-bit groups, substitution of each group by an n-bit group, and combination of the n-bit groups into one stream; the extra bits are redundancy that helps synchronization and error detection.' },
        { pts: 1, point: 'A clear labelled drawing of 4B/5B: 4-bit groups replaced by 5-bit code words from the table and joined into one stream (e.g. 0000 → 11110 and 0001 → 01001), then line-coded with NRZ-I.' },
        { pts: 1, point: 'Why NRZ-I: it inverts only for a 1, so a long run of 0s is a flat line with no self-synchronization; the 4B/5B code words never leave more than three 0s in a row (0000 becomes 11110), so NRZ-I keeps getting transitions while needing only N/2 bandwidth.' },
        { pts: 1, point: 'Rate: every 4 data bits become 5 code bits, so the rate rises by 5/4 (1 Mbps becomes 1.25 Mbps); NRZ-I then needs N/2 = 625 kHz, whereas Manchester would need 1.25 MHz (more bandwidth, but no DC component problem).' },
        { pts: 1, point: 'Versus scrambling: scrambling does not increase the bandwidth; it is done at the same time as the encoding, on the fly, and replaces only “unfriendly” runs of bits (e.g. B8ZS: eight 0s become 000VB0VB) with a violation code the receiver recognizes, whereas block coding substitutes every group from a table and so raises the bit rate.' }],
      model: '<p><b>Block coding</b> is written <b>mB/nB</b> (with a slash) and replaces each m-bit group with an n-bit group in three steps: <b>division</b> of the bit stream into m-bit groups, <b>substitution</b> of each group by an n-bit group, ' +
        'and <b>combination</b> of the n-bit groups into one stream. The extra bits are <b>redundancy</b>: they let the receiver stay synchronized and detect errors, and the code words are chosen to avoid bit combinations that would cause DC components or poor synchronization under the line code. ' +
        '<span class="chip ref">L03 p48</span> <span class="chip ref">L03 p49</span></p>' +
        '<p><b>Drawing 4B/5B</b> for the data <span class="mono">0000 1111 0001</span>: divide it into three 4-bit groups; substitute each with the table (0000 → 11110, 1111 → 11101, 0001 → 01001); combine them into <span class="mono">11110 11101 01001</span> (15 bits for 12) and send the result with NRZ-I. ' +
        '<span class="chip ref">L03 p50</span> <span class="chip ref">L03 p51</span></p>' +
        '<figure data-fig="l03a.blockcode" data-bits="000011110001"></figure>' +
        '<p><b>Why NRZ-I.</b> NRZ-I inverts the level for a 1 and keeps it for a 0, <span class="chip ref">L03 p22</span> so a long run of 0s is a flat line: no self-synchronization (and a DC component problem). <span class="chip ref">L03 p24</span> <span class="chip ref">L03 p46</span> ' +
        'Reading the slide-51 table, no code word starts with more than one 0 or ends with more than two, so the coded stream never has more than three 0s in a row — even 0000 is sent as 11110 — and NRZ-I gets a transition at least every four bits, while its bandwidth stays low (N/2). ' +
        '<span class="chip ref">L03 p50</span> <span class="chip ref">L03 p51</span></p>' +
        '<p><b>The cost: a higher bit rate.</b> Four data bits become five, so the line rate is multiplied by 5/4. Example 4 (slide 54): 1 Mbps becomes 1.25 Mbps, so NRZ-I needs a minimum bandwidth of N/2 = 625 kHz, while Manchester would need 1.25 MHz. ' +
        'NRZ-I needs less bandwidth but keeps the DC component problem; Manchester needs more but has no DC problem. <span class="chip ref">L03 p54</span> ' +
        'There are 2<sup>4</sup> = 16 data words and 2<sup>5</sup> = 32 code words, so 32 − 16 = 16 words are left over, and some of them are used for control and signalling. <span class="chip ref">L03 p53</span></p>' +
        '<p><b>Versus scrambling.</b> Block coding adds extra bits to every group, so the bit rate — and with it the bandwidth the line code needs — rises by n/m. ' +
        'Scrambling aims for a code that does <i>not</i> increase the bandwidth for synchronization and has no DC component: it is done at the same time as the encoding, creating the bit stream on the fly, and replaces only “unfriendly” runs of bits with a violation code that is easy to recognize. ' +
        '<span class="chip ref">L03 p57</span> Example: B8ZS replaces eight consecutive 0s with 000VB0VB, a pattern of the same length. <span class="chip ref">L03 p59</span></p>',
      explain: 'Award each rubric point independently.' },

    /* ===== L03b: delta modulation vs PCM ===== */
    { id: 'l03b.e002', topic: 'l03b', type: 'essay', diff: 2, ref: 'L03 pp84-88; L03 p79; L03 p80',
      q: 'Compare <b>delta modulation</b> (DM) with <b>PCM</b>. Draw a short DM staircase together with the bits it sends, say what DM sends for each sample, and explain the trade-off. You may draw, explain, or both.',
      rubric: [
        { pts: 1, point: 'What DM sends: only the difference between pulses, as a single bit per sample — 1 when the signal is higher (a positive change), 0 when it is lower.' },
        { pts: 1, point: 'The comparison rule, in both wordings: slide 84 compares each pulse (time t(n+1)) with the previous pulse (time t(n)); the slide-85 figure, like the textbook, compares the sample with the staircase built from the bits already sent.' },
        { pts: 1, point: 'A staircase drawing that steps up for every 1 and down for every 0, with the bits shown (e.g. the slide-85 bits 011111100000011: one step down, six up, six down, two up).' },
        { pts: 1, point: 'Against PCM: PCM sends a whole code word for every sample (bit rate = bits per sample × sampling rate, e.g. 8 bits × 8000 samples/s = 64 kbps for voice), whereas DM sends 1 bit per sample, so its bit rate is just the sampling rate.' },
        { pts: 1, point: 'Trade-off: DM works well for small changes between samples, but large changes in amplitude cause large errors; more bits (DPCM quantizes the difference) give more levels and higher accuracy.' }],
      model: '<p><b>What DM sends.</b> Delta modulation sends only the <i>difference</i> between pulses, using a <b>single bit per sample</b>: a 1 when the signal is higher than before and a 0 when it is lower. <span class="chip ref">L03 p84</span></p>' +
        '<p><b>The rule, in both wordings.</b> Slide 84 words it as comparing each pulse (at time t<sub>n+1</sub>) with the previous pulse (at time t<sub>n</sub>). ' +
        'The slide-85 figure, like the textbook, compares each sample with the <b>staircase</b>, the approximation built from the bits already sent: above it → send 1 and step up; below it → send 0 and step down. Use the staircase version when drawing. ' +
        '<span class="chip ref">L03 p84</span> <span class="chip ref">L03 p85</span></p>' +
        '<p><b>Drawing.</b> Write the bits under a time axis and draw one step per bit — up for a 1, down for a 0. The slide-85 bits <span class="mono">011111100000011</span> give one step down, six up, six down and two up. <span class="chip ref">L03 p85</span></p>' +
        '<figure data-fig="l03b.dm" data-caption="Slide 85 bits 0 1 1 1 1 1 1 0 0 0 0 0 0 1 1 (1 = step up, 0 = step down)."></figure>' +
        '<p><b>Against PCM.</b> PCM sends a whole code word for every sample: bit rate = bits per sample × sampling rate, e.g. 8 bits × 8000 samples/s = 64 kbps for digitized voice. <span class="chip ref">L03 p79</span> <span class="chip ref">L03 p80</span> ' +
        'DM sends 1 bit per sample, so with the same formula its bit rate is just the sampling rate — far fewer bits than PCM at the same sampling rate.</p>' +
        '<p><b>The trade-off.</b> One bit per sample is economical, and DM works well when the signal changes only a little between samples. When the amplitude changes a lot, the one-bit step cannot keep up and the result is <b>large errors</b>. <span class="chip ref">L03 p84</span> ' +
        'Spending more bits fixes this: DPCM quantizes the difference with several bits instead of one, so there are more levels and the accuracy is higher — at the cost of more bits per sample. <span class="chip ref">L03 p88</span></p>',
      explain: 'Award each rubric point independently.' },

    /* ===== L03b: transmission modes ===== */
    { id: 'l03b.e003', topic: 'l03b', type: 'essay', diff: 2, ref: 'L03 pp89-96',
      q: 'Compare <b>parallel</b> and <b>serial</b> transmission, and the three kinds of serial transmission: <b>asynchronous</b>, <b>synchronous</b> and <b>isochronous</b>. Draw an asynchronous frame, labelling the start and stop bits. You may draw, explain, or both.',
      rubric: [
        { pts: 1, point: 'Parallel: multiple bits are sent with each clock tick; serial: 1 bit is sent with each clock tick, in three subclasses — asynchronous, synchronous and isochronous.' },
        { pts: 1, point: 'Asynchronous: 1 start bit (0) at the beginning and 1 or more stop bits (1s) at the end of each byte, with possible gaps between bytes; it is asynchronous only at the byte level, since the bits themselves are still synchronized (same duration).' },
        { pts: 1, point: 'Synchronous: bits are sent one after another without start or stop bits or gaps; the receiver must group the bits, and many bytes are grouped in a frame identified by a start byte and an end byte.' },
        { pts: 1, point: 'Isochronous: no uneven gaps between frames; the transmission of bits is fixed, with equal gaps.' },
        { pts: 1, point: 'A labelled drawing of an asynchronous frame: start bit (0) first, then the data byte, then the stop bit(s) (1), with a gap before the next byte.' }],
      model: '<p><b>Parallel vs serial.</b> In <b>parallel</b> mode multiple bits are sent with each clock tick; in <b>serial</b> mode 1 bit is sent with each clock tick. ' +
        'Serial transmission has three subclasses: <b>asynchronous</b>, <b>synchronous</b> and <b>isochronous</b>. <span class="chip ref">L03 p89</span> ' +
        '<span class="badge beyond">Beyond slides</span> In the textbook, parallel mode uses n wires to send n bits at once: fast, but costly, so it is usually limited to short distances. ' +
        'Serial mode needs only one channel, with a parallel-to-serial converter at the sender and a serial-to-parallel converter at the receiver.</p>' +
        '<p><b>Asynchronous.</b> Send <b>1 start bit (0)</b> at the beginning and <b>1 or more stop bits (1s)</b> at the end of each byte; there may be a <b>gap</b> between bytes. ' +
        'It is “asynchronous at the byte level”, but the bits are still synchronized and last the same time. The start and stop bits add at least two extra bits to every byte. <span class="chip ref">L03 p92</span></p>' +
        '<p><b>Drawing an asynchronous frame.</b> Draw the start bit (0) first, then the eight data bits, then the stop bit (1) — more are allowed — and leave a gap before the next byte. ' +
        'Slide 93 draws each byte as [stop 1 | data | start 0] with the start bit first on the line, so on a left-to-right time axis the order is start 0, data, stop 1. <span class="chip ref">L03 p93</span></p>' +
        '<figure data-fig="l03b.async" data-caption="Top: asynchronous, with a start bit (0) in front of every byte, a stop bit (1) behind it and gaps allowed between bytes. Bottom: synchronous, with bytes back to back in a frame. Schematic only: in a real signal every bit lasts the same time."></figure>' +
        '<p><b>Synchronous.</b> Bits are sent one after another <b>without start or stop bits or gaps</b>; it is the receiver’s responsibility to group the bits. ' +
        'They are usually sent as bytes, and many bytes are grouped in a <b>frame</b> that is identified by a start byte and an end byte. <span class="chip ref">L03 p94</span></p>' +
        '<p><b>Isochronous.</b> There cannot be uneven gaps between frames: the transmission of bits is fixed, with equal gaps. <span class="chip ref">L03 p96</span> ' +
        '<span class="badge beyond">Beyond slides</span> The textbook uses it for real-time audio and video, where uneven delays between frames are not acceptable.</p>',
      explain: 'Award each rubric point independently.' }
  ]);
})();
