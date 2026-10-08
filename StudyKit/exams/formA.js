/* Mock Midterm — Form A (100 points, 120 minutes). Owner: Lead.
   Coverage: Modules 1–4. Mirrors the real exam: MCQ, Identification, 1–2 solving problems (no calculator) and essays answered by drawing
   and/or explaining; a drawing part trains line encodings and waves.
   MCQ / Identification / Essay items are drawn from bank items tagged pool:'A' (quotas checked by test/exam.test.js),
   mixed across topics with a fixed seed. Solving slots are generator instances, so every key is computed. */
(function () {
  'use strict';
  function pool(p, type, seed) {
    var ids = KIT.bank.query({ pool: p, type: type }).map(function (q) { return q.id; });
    return KIT.rng(seed).shuffle(ids);
  }
  KIT.exam({
    id: 'A',
    kind: 'form',
    status: 'final',
    title: 'Mock Midterm — Form A',
    minutes: 120,
    points: 100,
    instructions: 'Coverage: Modules 1–4. No calculator. Answer everything. Part III: draw on the grids and axes. ' +
      'Part IV: show complete solutions; final answers need units. Part V: draw, explain, or both. ' +
      'Unless a problem says otherwise, use the slide conventions (NRZ-L: 0 = +V; NRZ-I: a 1 inverts; Manchester: 0 = high→low; ' +
      'differential Manchester: 0 = transition at the start; AMI: first 1 is +V).',
    sections: [
      { id: 'mcq', type: 'mcq', title: 'Part I — Multiple choice', each: 1,
        quota: { l01: 5, l02: 8, l03a: 8, l03b: 4, l04: 5 }, items: pool('A', 'mcq', 'formA-mcq') },
      { id: 'id', type: 'id', title: 'Part II — Identification', each: 1,
        quota: { l01: 4, l02: 5, l03a: 5, l03b: 3, l04: 3 }, items: pool('A', 'id', 'formA-id') },
      { id: 'draw', type: 'gen', title: 'Part III — Draw: line encodings and waves', slots: 4, pts: 5,
        plan: ['l03a: one bit stream in NRZ-I, Manchester and differential Manchester', 'l03a: HDB3 scrambling',
          'l04: a binary FSK signal', 'l02: a sine wave (amplitude, frequency, phase)'],
        items: [
          { gen: 'l03a.draw', params: { bits: '10110010', schemes: ['nrzi', 'manchester', 'dmanchester'] }, pts: 5, topic: 'l03a' },
          { gen: 'l03a.scramble', params: { code: 'hdb3', bits: '1010000100001000', prev: -1, parity: 0 }, pts: 5, topic: 'l03a' },
          { gen: 'l04.sketch', params: { scheme: 'bfsk', bits: '1011' }, pts: 5, topic: 'l04' },
          { gen: 'l02.sketch', params: { A: 5, f: 2, phase: 90 }, pts: 5, topic: 'l02' }
        ] },
      { id: 'ps', type: 'gen', title: 'Part IV — Problem solving (no calculator)', slots: 2, pts: 5,
        plan: ['l02: Shannon capacity → choose a rate → Nyquist levels', 'l03b: PCM sampling rate, bits per sample, bit rate and bandwidth'],
        items: [
          { gen: 'l02.capacity', params: { B: 2e6, snr: 255, N: 12e6 }, pts: 5, topic: 'l02' },
          { gen: 'l03b.pcm', params: { fmax: 15e3, L: 64 }, pts: 5, topic: 'l03b' }
        ] },
      { id: 'essay', type: 'essay', title: 'Part V — Essay (draw and/or explain)', each: 5, quota: { l01: 1, l02: 1, l03a: 1, l03b: 1 }, items: pool('A', 'essay', 'formA-essay') }
    ]
  });
})();
