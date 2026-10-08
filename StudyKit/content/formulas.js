/* Formula cards: the typeset, color-coded equation (tex), a legend of every symbol (vars), when to use it and a slide
   example, added to each KIT.formula registered in content/l0x.js. Owner: Lead. Colors follow the unit (AUTHORING §3.8):
   bps blue (rate) · baud and samples/s orange (baud) · Hz green (bw/freq) · levels and bits-per violet (level) ·
   power, SNR, dB magenta (snr) · seconds amber (time). Data bits are blue and signal elements orange in mBnL too. */
(function () {
  'use strict';
  var CARDS = {
    /* ---------- L02 ---------- */
    'l02.freq': {
      tex: '\\c{freq}{f} = \\frac{1}{\\c{time}{T}} \\quad \\quad \\c{time}{T} = \\frac{1}{\\c{freq}{f}}',
      vars: [{ tex: 'f', role: 'freq', means: 'frequency — cycles per second', unit: 'Hz' },
        { tex: 'T', role: 'time', means: 'period — the time one cycle takes', unit: 's' }],
      use: 'Switch between how often a signal repeats and how long one cycle lasts. The prefixes flip: ms ↔ kHz, µs ↔ MHz.',
      example: 'Slide 7: 4 cycles in 1 s → $\\c{freq}{f} = 4$ Hz and $\\c{time}{T} = \\frac{1}{4}$ s.'
    },
    'l02.lambda': {
      tex: '\\lambda = \\frac{c}{\\c{freq}{f}} = c \\times \\c{time}{T}',
      vars: [{ tex: '\\lambda', means: 'wavelength — distance covered during one period', unit: 'm' },
        { tex: 'c', means: 'propagation speed (3 × 10⁸ m/s for light in free space)', unit: 'm/s' },
        { tex: 'f', role: 'freq', means: 'frequency', unit: 'Hz' }, { tex: 'T', role: 'time', means: 'period', unit: 's' }],
      use: 'How far the signal travels while it completes one cycle — it depends on the medium (through c) and on the frequency.',
      example: 'Slide 10: red light, $\\c{freq}{f} = 4 \\times 10^{14}$ Hz → $\\lambda = \\frac{3 \\times 10^8}{4 \\times 10^{14}} = 0.75$ µm.'
    },
    'l02.phase': {
      tex: '\\text{phase} = 360^\\circ \\times \\frac{\\c{time}{t}}{\\c{time}{T}}',
      vars: [{ tex: 't', role: 'time', means: 'time shift of the wave', unit: 's' }, { tex: 'T', role: 'time', means: 'period', unit: 's' }],
      use: 'A shift by a fraction of a period is the same fraction of 360°: ¼ T = 90°, ½ T = 180°, ¾ T = 270°.',
      example: '$\\c{freq}{f} = 250$ Hz → $\\c{time}{T} = 4$ ms; a shift of $\\c{time}{1}$ ms is ¼ of a period → 90°.'
    },
    'l02.bw': {
      tex: '\\c{bw}{B} = \\c{freq}{f_{\\text{high}}} - \\c{freq}{f_{\\text{low}}}',
      vars: [{ tex: 'B', role: 'bw', means: 'bandwidth — width of the range of frequencies', unit: 'Hz' },
        { tex: 'f_{\\text{high}}', role: 'freq', means: 'highest frequency in the composite signal', unit: 'Hz' },
        { tex: 'f_{\\text{low}}', role: 'freq', means: 'lowest frequency in the composite signal', unit: 'Hz' }],
      use: 'The span of frequencies a composite signal contains (or a medium passes) — not the highest frequency.',
      example: 'Slide 13: components from 1000 to 5000 Hz → $\\c{bw}{B} = \\c{freq}{5000} - \\c{freq}{1000} = \\c{bw}{4000}$ Hz.'
    },
    'l02.levels': {
      tex: '\\text{bits per level} = \\log_2 \\c{level}{L}',
      vars: [{ tex: 'L', role: 'level', means: 'number of signal levels' }],
      use: 'A digital signal with L levels carries log₂ L bits in each level: 2 levels → 1 bit, 4 → 2, 8 → 3.',
      example: 'Slide 14: $\\c{level}{L} = 4$ → $\\log_2 4 = 2$ bits per level; 8 levels in 1 s → $\\c{rate}{N} = 8 \\times 2 = 16$ bps.'
    },
    'l02.db': {
      tex: '\\c{snr}{\\text{dB}} = 10 \\log_{10} \\frac{\\c{snr}{P_2}}{\\c{snr}{P_1}}',
      vars: [{ tex: '\\text{dB}', role: 'snr', means: 'gain (+) or loss (−) between two points', unit: 'dB' },
        { tex: 'P_1', role: 'snr', means: 'power at the first point', unit: 'W' }, { tex: 'P_2', role: 'snr', means: 'power at the second point', unit: 'W' }],
      use: 'Compare two powers. Negative = attenuated, positive = amplified; the dB values of a chain of stages simply add.',
      example: 'Slide 22: power halved → $10 \\log_{10} 0.5 = 10 \\times (-0.3) = \\c{snr}{-3}$ dB.'
    },
    'l02.snr': {
      tex: '\\c{snr}{SNR} = \\frac{\\c{snr}{P_{\\text{signal}}}}{\\c{snr}{P_{\\text{noise}}}} \\quad \\quad \\c{snr}{SNR_{\\text{dB}}} = 10 \\log_{10} \\c{snr}{SNR}',
      vars: [{ tex: 'SNR', role: 'snr', means: 'signal-to-noise ratio, a plain ratio' },
        { tex: 'P_{\\text{signal}}', role: 'snr', means: 'average signal power', unit: 'W' }, { tex: 'P_{\\text{noise}}', role: 'snr', means: 'average noise power', unit: 'W' },
        { tex: 'SNR_{\\text{dB}}', role: 'snr', means: 'the same ratio in decibels', unit: 'dB' }],
      use: 'How far the signal stands above the noise. Shannon needs the plain ratio — convert from dB first.',
      example: 'Slide 26: $\\c{snr}{SNR} = \\frac{10,000 \\text{ µW}}{1 \\text{ µW}} = 10,000$ → $10 \\log_{10} 10^4 = \\c{snr}{40}$ dB.'
    },
    'l02.nyquist': {
      tex: '\\c{rate}{N} = 2 \\times \\c{bw}{B} \\times \\log_2 \\c{level}{L}',
      vars: [{ tex: 'N', role: 'rate', means: 'maximum bit rate of a noiseless channel', unit: 'bps' },
        { tex: 'B', role: 'bw', means: 'channel bandwidth', unit: 'Hz' }, { tex: 'L', role: 'level', means: 'number of signal levels' }],
      use: 'Noiseless channel: the most bits per second a bandwidth B can carry with L levels. More levels raise N, but the receiver must still tell them apart.',
      example: 'Slide 30: $\\c{rate}{N} = 2 \\times \\c{bw}{3000} \\times \\log_2 \\c{level}{2} = \\c{rate}{6000}$ bps.'
    },
    'l02.shannon': {
      tex: '\\c{rate}{C} = \\c{bw}{B} \\times \\log_2 (1 + \\c{snr}{SNR})',
      vars: [{ tex: 'C', role: 'rate', means: 'capacity — the upper limit on the bit rate', unit: 'bps' },
        { tex: 'B', role: 'bw', means: 'channel bandwidth', unit: 'Hz' }, { tex: 'SNR', role: 'snr', means: 'signal-to-noise ratio as a plain ratio (not dB)' }],
      use: 'Noisy channel: the highest possible bit rate, whatever the signalling. There is no L in it — use Shannon for the limit, then Nyquist to choose L.',
      example: 'Slide 32: $\\c{rate}{C} = \\c{bw}{3000} \\times \\log_2 (1 + \\c{snr}{3162}) \\approx 3000 \\times 11.62 = \\c{rate}{34,860}$ bps.'
    },
    'l02.latency': {
      tex: '\\c{time}{\\text{Latency}} = \\c{time}{T_{\\text{prop}}} + \\c{time}{T_{\\text{trans}}} + \\c{time}{T_{\\text{queue}}} + \\c{time}{T_{\\text{proc}}}',
      vars: [{ tex: 'T_{\\text{prop}}', role: 'time', means: 'propagation time = distance ÷ propagation speed', unit: 's' },
        { tex: 'T_{\\text{trans}}', role: 'time', means: 'transmission time = message size (bits) ÷ bandwidth (bps)', unit: 's' },
        { tex: 'T_{\\text{queue}}', role: 'time', means: 'waiting time in device queues', unit: 's' },
        { tex: 'T_{\\text{proc}}', role: 'time', means: 'processing time in devices', unit: 's' }],
      use: 'Total time for a whole message to arrive. Long distances make propagation dominate; large messages on slow links make transmission dominate.',
      example: 'Slide 37: 12,000 km at $2.4 \\times 10^8$ m/s → $\\c{time}{T_{\\text{prop}}} = 50$ ms; 2500 bytes at 1 Gbps → $\\c{time}{T_{\\text{trans}}} = 0.020$ ms.'
    },
    'l02.bitlength': {
      tex: '\\text{bit length} = v \\times \\c{time}{T_b} \\quad \\quad \\c{time}{T_b} = \\frac{1}{\\c{rate}{N}}',
      vars: [{ tex: 'v', means: 'propagation speed', unit: 'm/s' }, { tex: 'T_b', role: 'time', means: 'bit duration', unit: 's' },
        { tex: 'N', role: 'rate', means: 'bit rate', unit: 'bps' }],
      use: 'The distance one bit occupies on the medium.',
      example: '$\\c{rate}{N} = 1$ Mbps → $\\c{time}{T_b} = 1$ µs; at $2 \\times 10^8$ m/s one bit is 200 m long.'
    },
    /* ---------- L03a ---------- */
    'l03a.baud': {
      tex: '\\c{baud}{S} = c \\times \\c{rate}{N} \\times \\frac{1}{\\c{level}{r}}',
      vars: [{ tex: 'S', role: 'baud', means: 'signal rate — signal elements per second', unit: 'baud' },
        { tex: 'c', means: 'case factor: worst 1, best 0, average ½' },
        { tex: 'N', role: 'rate', means: 'data rate', unit: 'bps' }, { tex: 'r', role: 'level', means: 'data elements carried by one signal element' }],
      use: 'How many signal elements per second a line code needs for data rate N. Use the average case c = ½ unless the question says otherwise.',
      example: 'Slide 9: $\\c{baud}{S} = \\frac{1}{2} \\times \\c{rate}{100,000} \\times \\frac{1}{\\c{level}{1}} = \\c{baud}{50,000}$ baud = 50 kbaud.'
    },
    'l03a.bmin': {
      tex: '\\c{bw}{B_{\\min}} = \\c{baud}{S_{\\text{avg}}}',
      vars: [{ tex: 'B_{\\min}', role: 'bw', means: 'minimum bandwidth the line code needs', unit: 'Hz' },
        { tex: 'S_{\\text{avg}}', role: 'baud', means: 'average signal rate', unit: 'baud' }],
      use: 'Per scheme (slide 46): NRZ-L, NRZ-I, AMI → N/2 · RZ, Manchester, differential Manchester → N · 2B1Q → N/4 · MLT-3 → N/3 · 8B6T → 3N/4 · 4D-PAM5 → N/8.',
      example: 'Slide 25: NRZ-I at $\\c{rate}{N} = 1$ Mbps → $\\c{baud}{S} = 500$ kbaud → $\\c{bw}{B_{\\min}} = 500$ kHz.'
    },
    'l03a.nmax': {
      tex: '\\c{rate}{N_{\\max}} = 2 \\times \\c{bw}{B} \\times \\log_2 \\c{level}{L}',
      vars: [{ tex: 'N_{\\max}', role: 'rate', means: 'maximum data rate', unit: 'bps' }, { tex: 'B', role: 'bw', means: 'bandwidth', unit: 'Hz' },
        { tex: 'L', role: 'level', means: 'number of signal levels' }],
      use: 'The Nyquist limit from L02: a digital signal\'s effective bandwidth is finite, so its data rate is capped.',
      example: '$\\c{bw}{B} = 1$ MHz, $\\c{level}{L} = 4$ → $\\c{rate}{N_{\\max}} = 2 \\times 1 \\times 2 = 4$ Mbps.'
    },
    'l03a.mbnl': {
      tex: '2^{\\c{rate}{m}} \\le \\c{level}{L}^{\\c{baud}{n}}',
      vars: [{ tex: 'm', role: 'rate', means: 'data bits in a block (data elements)' }, { tex: 'n', role: 'baud', means: 'signal elements per block' },
        { tex: 'L', role: 'level', means: 'levels per signal element: B = 2, T = 3, Q = 4' }],
      use: 'An mBnL code works only if the Lⁿ signal patterns are at least as many as the 2ᵐ data patterns; the patterns left over are redundancy.',
      example: 'Slides 36–37: 8B6T → $2^{\\c{rate}{8}} = 256 \\le \\c{level}{3}^{\\c{baud}{6}} = 729$ → valid, 473 patterns unused.'
    },
    'l03a.4b5b': {
      tex: '\\c{rate}{N_{\\text{line}}} = \\c{rate}{N} \\times \\frac{5}{4}',
      vars: [{ tex: 'N_{\\text{line}}', role: 'rate', means: 'bit rate on the line after 4B/5B', unit: 'bps' },
        { tex: 'N', role: 'rate', means: 'data rate before block coding', unit: 'bps' }],
      use: 'Every 4 data bits become 5 code bits, so the line carries 25% more bits; then apply the line code to the new rate.',
      example: 'Slide 54: $\\c{rate}{N} = 1$ Mbps → $\\c{rate}{N_{\\text{line}}} = 1.25$ Mbps; with NRZ-I $\\c{bw}{B_{\\min}} = 625$ kHz.'
    },
    'l03a.drift': {
      tex: '\\text{extra bits per second} = \\c{rate}{N} \\times \\text{clock error}',
      vars: [{ tex: 'N', role: 'rate', means: 'data rate', unit: 'bps' }],
      use: 'A receiver clock that runs fast (or slow) by a fraction reads that fraction of extra (or missing) bits every second.',
      example: 'Slide 14: 0.1% fast → $\\c{rate}{1000} \\times 0.001 = 1$ extra bps at 1 kbps; 1000 extra bps at 1 Mbps.'
    },
    /* ---------- L03b ---------- */
    'l03b.fs': {
      tex: '\\c{baud}{f_s} = \\frac{1}{\\c{time}{T_s}}',
      vars: [{ tex: 'f_s', role: 'baud', means: 'sampling rate', unit: 'samples/s' }, { tex: 'T_s', role: 'time', means: 'sampling interval', unit: 's' }],
      use: 'Samples per second from the time between samples, and back.',
      example: 'Telephone voice: $\\c{baud}{f_s} = 8000$ samples/s → $\\c{time}{T_s} = 125$ µs.'
    },
    'l03b.nyquist': {
      tex: '\\c{baud}{f_s} \\ge 2 \\times \\c{bw}{f_{\\max}}',
      vars: [{ tex: 'f_s', role: 'baud', means: 'sampling rate', unit: 'samples/s' },
        { tex: 'f_{\\max}', role: 'bw', means: 'highest frequency in the signal', unit: 'Hz' }],
      use: 'Sample at least twice the highest frequency — for low-pass and bandpass signals alike. A bandpass signal\'s bandwidth alone is not enough: you need its highest frequency.',
      example: 'Slide 69: voice up to 4 kHz → $\\c{baud}{f_s} = 2 \\times \\c{bw}{4000} = \\c{baud}{8000}$ samples/s.'
    },
    'l03b.delta': {
      tex: '\\Delta = \\frac{V_{\\max} - V_{\\min}}{\\c{level}{L}}',
      vars: [{ tex: '\\Delta', means: 'zone height (quantization step)', unit: 'V' }, { tex: 'V_{\\max}', means: 'top of the amplitude range', unit: 'V' },
        { tex: 'V_{\\min}', means: 'bottom of the amplitude range', unit: 'V' }, { tex: 'L', role: 'level', means: 'number of zones (levels)' }],
      use: 'Split the amplitude range into L equal zones; each sample is replaced by the midpoint of its zone.',
      example: 'Slide 74: −20 V to +20 V with $\\c{level}{L} = 8$ → $\\Delta = \\frac{40}{8} = 5$ V.'
    },
    'l03b.nb': {
      tex: '\\c{level}{n_b} = \\log_2 \\c{level}{L}',
      vars: [{ tex: 'n_b', role: 'level', means: 'bits per sample' }, { tex: 'L', role: 'level', means: 'number of zones (levels)' }],
      use: 'The number of bits needed to give every zone its own code.',
      example: '$\\c{level}{L} = 8$ zones → $\\c{level}{n_b} = 3$ bits per sample (slide 76 codes 000 to 111).'
    },
    'l03b.bitrate': {
      tex: '\\c{rate}{N} = \\c{level}{n_b} \\times \\c{baud}{f_s}',
      vars: [{ tex: 'N', role: 'rate', means: 'PCM bit rate', unit: 'bps' }, { tex: 'n_b', role: 'level', means: 'bits per sample' },
        { tex: 'f_s', role: 'baud', means: 'sampling rate', unit: 'samples/s' }],
      use: 'The bit rate PCM produces: bits per sample × samples per second.',
      example: 'Slide 80: $\\c{rate}{N} = \\c{level}{8} \\times \\c{baud}{8000} = \\c{rate}{64,000}$ bps = 64 kbps.'
    },
    'l03b.bmin': {
      tex: '\\c{bw}{B_{\\min}} = \\c{level}{n_b} \\times \\c{bw}{f_{\\max}} = \\frac{\\c{rate}{N}}{2}',
      vars: [{ tex: 'B_{\\min}', role: 'bw', means: 'minimum bandwidth of the PCM signal', unit: 'Hz' }, { tex: 'n_b', role: 'level', means: 'bits per sample' },
        { tex: 'f_{\\max}', role: 'bw', means: 'highest frequency of the analog signal', unit: 'Hz' }, { tex: 'N', role: 'rate', means: 'PCM bit rate', unit: 'bps' }],
      use: 'Minimum bandwidth when the PCM bits are sent with an NRZ-type line code (c = ½, r = 1).',
      example: 'Slide 83: $\\c{bw}{B_{\\min}} = \\c{level}{8} \\times \\c{bw}{4}$ kHz $= \\c{bw}{32}$ kHz.'
    },
    'l03b.qerror': {
      tex: '|\\text{error}| \\le \\frac{\\Delta}{2}',
      vars: [{ tex: '\\Delta', means: 'zone height', unit: 'V' }],
      use: 'The midpoint of a zone is never more than half a zone away from the true sample.',
      example: 'Slide 76: $\\Delta = 5$ V, so the error is at most 2.5 V; −6.1 V becomes −7.5 V, an error of −1.4 V.'
    },
    'l03b.snqr': {
      tex: '\\c{snr}{SNQR_{\\text{dB}}} \\approx 6.02 \\, \\c{level}{n_b} + 1.76',
      vars: [{ tex: 'SNQR_{\\text{dB}}', role: 'snr', means: 'signal-to-quantization-noise ratio', unit: 'dB' }, { tex: 'n_b', role: 'level', means: 'bits per sample' }],
      use: 'Each extra bit per sample adds about 6 dB.',
      example: '$\\c{level}{n_b} = 8$ → about $6.02 \\times 8 + 1.76 \\approx \\c{snr}{49.9}$ dB.'
    },
    'l03b.async': {
      tex: '\\text{efficiency} = \\frac{\\text{data bits}}{\\text{start} + \\text{data} + \\text{stop bits}}',
      vars: [],
      use: 'The share of the line rate that carries data when each character travels in its own start/stop frame.',
      example: 'Slide 92 frame: 1 start + 8 data + 1 stop → $\\frac{8}{10} = 80$%.'
    },
    /* ---------- L04 ---------- */
    'l04.baud': {
      tex: '\\c{baud}{S} = \\c{rate}{N} \\times \\frac{1}{\\c{level}{r}}',
      vars: [{ tex: 'S', role: 'baud', means: 'baud rate — signal elements per second', unit: 'baud' }, { tex: 'N', role: 'rate', means: 'bit rate', unit: 'bps' },
        { tex: 'r', role: 'level', means: 'data bits carried by one signal element' }],
      use: 'Analog transmission of digital data: each signal element carries r bits, so S ≤ N.',
      example: 'Slide 6: $\\c{baud}{1000}$ baud × $\\c{level}{4}$ bits per element → $\\c{rate}{N} = \\c{rate}{4000}$ bps.'
    },
    'l04.levels': {
      tex: '\\c{level}{r} = \\log_2 \\c{level}{L} \\quad \\Leftrightarrow \\quad \\c{level}{L} = 2^{\\c{level}{r}}',
      vars: [{ tex: 'r', role: 'level', means: 'bits per signal element' }, { tex: 'L', role: 'level', means: 'number of distinct signal elements (levels, phases, frequencies)' }],
      use: 'Bits per signal element from the number of distinct elements, and back.',
      example: 'Slide 7: $\\c{rate}{8000}$ bps at $\\c{baud}{1000}$ baud → $\\c{level}{r} = 8$ → $\\c{level}{L} = 2^8 = 256$.'
    },
    'l04.ask': {
      tex: '\\c{bw}{B} = (1 + d) \\times \\c{baud}{S}',
      vars: [{ tex: 'B', role: 'bw', means: 'bandwidth', unit: 'Hz' }, { tex: 'd', means: 'modulation and filtering factor, 0 ≤ d ≤ 1' },
        { tex: 'S', role: 'baud', means: 'baud rate', unit: 'baud' }],
      use: 'Bandwidth of ASK and of PSK. With d = 0 the bandwidth is at its minimum, B = S.',
      example: 'Slide 12: a 100 kHz band with $d = 1$ → $\\c{baud}{S} = \\frac{\\c{bw}{100}}{2} = \\c{baud}{50}$ kbaud → $\\c{rate}{N} = 50$ kbps.'
    },
    'l04.fsk': {
      tex: '\\c{bw}{B} = (1 + d) \\times \\c{baud}{S} + 2\\c{freq}{\\Delta f}',
      vars: [{ tex: 'B', role: 'bw', means: 'bandwidth', unit: 'Hz' }, { tex: 'd', means: 'modulation and filtering factor, 0 ≤ d ≤ 1' },
        { tex: 'S', role: 'baud', means: 'baud rate', unit: 'baud' },
        { tex: '\\Delta f', role: 'freq', means: 'half the carrier spacing: bit 1 → f_c + Δf, bit 0 → f_c − Δf', unit: 'Hz' }],
      use: 'Binary FSK needs the ASK bandwidth plus the spacing 2Δf between its two carriers.',
      example: 'Slide 16: 100 kHz band, $2\\c{freq}{\\Delta f} = 50$ kHz, $d = 1$ → $2\\c{baud}{S} = 50$ kHz → $\\c{baud}{S} = 25$ kbaud, $\\c{rate}{N} = 25$ kbps.'
    },
    'l04.mfsk': {
      tex: '\\c{bw}{B} = (1 + d) \\times \\c{baud}{S} + (\\c{level}{L} - 1) \\times 2\\c{freq}{\\Delta f}',
      vars: [{ tex: 'B', role: 'bw', means: 'bandwidth', unit: 'Hz' }, { tex: 'S', role: 'baud', means: 'baud rate', unit: 'baud' },
        { tex: 'L', role: 'level', means: 'number of frequencies' }, { tex: '\\Delta f', role: 'freq', means: 'half the spacing between neighbouring frequencies', unit: 'Hz' }],
      use: 'L frequencies, each 2Δf apart. With d = 0 and the minimum spacing 2Δf = S, this becomes B = L × S.',
      example: 'Slide 19: 3 Mbps, 3 bits at a time → $\\c{level}{L} = 8$, $\\c{baud}{S} = 1$ Mbaud, $\\c{bw}{B} = \\c{level}{8} \\times \\c{baud}{1} = \\c{bw}{8}$ MHz.'
    },
    'l04.carrier': {
      tex: '\\c{freq}{f_c} = \\frac{\\c{freq}{f_{\\text{low}}} + \\c{freq}{f_{\\text{high}}}}{2}',
      vars: [{ tex: 'f_c', role: 'freq', means: 'carrier frequency', unit: 'Hz' }, { tex: 'f_{\\text{low}}', role: 'freq', means: 'bottom of the available band', unit: 'Hz' },
        { tex: 'f_{\\text{high}}', role: 'freq', means: 'top of the available band', unit: 'Hz' }],
      use: 'Put the carrier in the middle of the band. Full duplex: split the band into two halves with a carrier in the middle of each.',
      example: 'Slide 12: 200–300 kHz → $\\c{freq}{f_c} = 250$ kHz; full duplex (slide 13): 225 kHz and 275 kHz.'
    },
    'l04.polar': {
      tex: 'A = \\sqrt{I^2 + Q^2} \\quad \\quad \\theta = \\text{angle measured from the +I axis}',
      vars: [{ tex: 'A', means: 'peak amplitude — distance from the origin' }, { tex: 'I', means: 'in-phase coordinate (horizontal)' },
        { tex: 'Q', means: 'quadrature coordinate (vertical)' }, { tex: '\\theta', means: 'phase', unit: '°' }],
      use: 'Read a constellation point: its distance from the origin is the amplitude, its angle is the phase.',
      example: 'Slide 31, 16-QAM: the point 1100 lies on a diagonal at 225°.'
    }
  };
  Object.keys(CARDS).forEach(function (id) {
    var f = KIT.getFormula(id);
    if (!f) { KIT.report(new Error('formula card for unknown formula ' + id), 'formulas'); return; }
    var c = CARDS[id];
    f.tex = c.tex; f.vars = c.vars; f.use = c.use; f.example = c.example;
  });
})();
