/* Visual Lab (#/lab) and single-visual page (#/viz/<id>). Owner: Lead. */
(function () {
  'use strict';
  var h = KIT.h;

  KIT.page('lab', function (main) {
    main.appendChild(h('h1', null, 'Visual lab'));
    main.appendChild(h('p', { class: 'muted' }, 'Every interactive visual in one place. Each one also opens its topic page\'s "Intuition first" section. ' +
      'Try the predict questions before touching the controls.'));
    var any = false;
    KIT.TOPIC_IDS.forEach(function (tid) {
      var list = KIT.viz.list({ topic: tid });
      if (!list.length) return;
      any = true;
      main.appendChild(h('h2', null, KIT.ui.deckLabel(tid) + ' · ' + (KIT.getTopic(tid) ? KIT.getTopic(tid).title : KIT.META[tid].title)));
      var grid = h('div', { class: 'grid2' });
      list.forEach(function (v) {
        grid.appendChild(h('a', { class: 'card topic-card', href: '#/viz/' + encodeURIComponent(v.id) },
          h('div', { class: 'ttl' }, v.title || v.id),
          v.blurb ? h('div', { class: 'bl' }, v.blurb) : null));
      });
      main.appendChild(grid);
    });
    if (!any) main.appendChild(h('div', { class: 'callout' }, h('div', { class: 'callout-label' }, 'Coming in Phase 2'),
      'The interactive visuals are being built. Static figures are already in each topic\'s "Intuition first" section.'));
  });

  KIT.page('viz', function (main, route) {
    var id = route.path[1];
    var v = KIT.viz.get(id);
    if (!v) { main.appendChild(h('h1', null, 'Unknown visual')); main.appendChild(h('a', { class: 'btn', href: '#/lab' }, '← Visual lab')); return; }
    main.appendChild(h('div', { class: 'deck-line muted small' }, KIT.ui.deckLabel(v.topic)));
    main.appendChild(h('h1', null, v.title || v.id));
    if (v.blurb) main.appendChild(h('p', { class: 'muted' }, v.blurb));
    var stage = h('div', { class: 'viz-stage card' });
    main.appendChild(stage);
    KIT.viz.mount(id, stage, { static: KIT.env.static, params: route.query });
    main.appendChild(h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#/topic/' + v.topic }, 'Open the ' + KIT.ui.deckLabel(v.topic) + ' notes'),
      h('a', { class: 'btn ghost', href: '#/lab' }, '← All visuals')));
  });
})();
