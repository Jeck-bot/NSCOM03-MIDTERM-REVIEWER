/* Diagnostic quiz — 20 items across Modules 1–4, from bank items tagged pool:'diag', in lecture order. Owner: Lead.
   Scores rank topics weakest-first (js/ui/diag.js). */
(function () {
  'use strict';
  var items = KIT.bank.query({ pool: 'diag' }).filter(function (q) { return q.type !== 'essay'; })
    .sort(function (a, b) { return KIT.TOPIC_IDS.indexOf(a.topic) - KIT.TOPIC_IDS.indexOf(b.topic) || (a.id < b.id ? -1 : 1); })
    .map(function (q) { return q.id; });
  KIT.exam({
    id: 'diag',
    kind: 'diag',
    status: 'final',
    title: 'Diagnostic — find your weak spots',
    minutes: 15,
    points: 20,
    instructions: 'Answer quickly and honestly. Mark each answer "sure" or "unsure" — a lucky guess still counts as a weak spot.',
    sections: [
      { id: 'all', type: 'mixed', title: 'Diagnostic', each: 1,
        quota: { l01: 3, l02: 5, l03a: 5, l03b: 3, l04: 4 }, items: items }
    ]
  });
})();
