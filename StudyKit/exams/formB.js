/* Mock Midterm — Form B (100 points, 120 minutes). Owner: Lead. Same blueprint as Form A with different items (pool:'B'). */
(function () {
  'use strict';
  function pool(p, type, seed) {
    var ids = KIT.bank.query({ pool: p, type: type }).map(function (q) { return q.id; });
    return KIT.rng(seed).shuffle(ids);
  }
  KIT.exam({
    id: 'B',
    kind: 'form',
    status: 'final',
    title: 'Mock Midterm — Form B',
    minutes: 120,
    points: 100,
    instructions: 'Coverage: Modules 1–4. No calculator. Answer everything. Part III: draw on the grids and axes. ' +
      'Part IV: show complete solutions; final answers need units. Part V: draw, explain, or both. ' +
      'Unless a problem says otherwise, use the slide conventions (NRZ-L: 0 = +V; NRZ-I: a 1 inverts; Manchester: 0 = high→low; ' +
      'differential Manchester: 0 = transition at the start; AMI: first 1 is +V).',
    sections: [
      { id: 'mcq', type: 'mcq', title: 'Part I — Multiple choice', each: 1,
        quota: { l01: 5, l02: 8, l03a: 8, l03b: 4, l04: 5 }, items: pool('B', 'mcq', 'formB-mcq') },
      { id: 'id', type: 'id', title: 'Part II — Identification', each: 1,
        quota: { l01: 4, l02: 5, l03a: 5, l03b: 3, l04: 3 }, items: pool('B', 'id', 'formB-id') },
      { id: 'draw', type: 'gen', title: 'Part III — Draw: line encodings and waves', slots: 4, pts: 5,
        plan: ['l03a: one bit stream in 2B1Q, MLT-3 and RZ', 'l03a: HDB3 scrambling',
          'l03b: the quantized samples as a staircase', 'l02: a sine wave (amplitude, frequency, phase)'],
        items: [
          { gen: 'l03a.draw', params: { bits: '11010010', schemes: ['2b1q', 'mlt3', 'rz'] }, pts: 5, topic: 'l03a' },
          { gen: 'l03a.scramble', params: { code: 'hdb3', bits: '1000010000110000', prev: 1, parity: 0 }, pts: 5, topic: 'l03a' },
          { gen: 'l03b.sketch', params: { L: 4, vmax: 8, values: [5.4, -1.2, -6.6, 2.9, 7.1, -3.3] }, pts: 5, topic: 'l03b' },
          { gen: 'l02.sketch', params: { A: 2, f: 3, phase: 270 }, pts: 5, topic: 'l02' }
        ] },
      { id: 'ps', type: 'gen', title: 'Part IV — Problem solving (no calculator)', slots: 2, pts: 5,
        plan: ['l02: Shannon capacity → choose a rate → Nyquist levels', 'l04: FSK carrier and bit rate in a band'],
        items: [
          { gen: 'l02.capacity', params: { B: 4000, snr: 63, N: 16000 }, pts: 5, topic: 'l02' },
          { gen: 'l04.band', params: { scheme: 'fsk', fLow: 500e3, fHigh: 620e3, d: 0.5, twoDf: 30e3 }, pts: 5, topic: 'l04' }
        ] },
      { id: 'essay', type: 'essay', title: 'Part V — Essay (draw and/or explain)', each: 5, quota: { l01: 1, l02: 1, l03a: 1, l04: 1 }, items: pool('B', 'essay', 'formB-essay') }
    ]
  });
})();
