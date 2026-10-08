/* Cheat sheet page (#/cheatsheet): the printable sheet, readable on screen. Owner: UI.
   It reuses the print renderer (KIT.print.cheatSheet), so what you read here is what prints. */
(function () {
  'use strict';
  var h = KIT.h;

  function pdfLink(docs, id, label) {
    var d = docs.filter(function (x) { return x.id === id; })[0];
    return d ? h('a', { class: 'btn', href: 'pdf/' + d.file, target: '_blank', title: 'Opens pdf/' + d.file }, label) : null;
  }

  KIT.page('cheatsheet', function (main) {
    var docs = KIT.print.docs();
    var printBtn = h('button', { class: 'btn primary', type: 'button', title: 'Opens the browser print dialog; choose “Save as PDF” to keep a copy' }, 'Print / save PDF');
    printBtn.addEventListener('click', function () { window.print(); });
    main.appendChild(h('div', { class: 'cheat-intro no-print' },
      h('h1', null, 'Cheat sheet'),
      h('p', { class: 'muted' }, 'Modules 1–4, one lecture per page: every formula as a real, color-coded equation with its symbols, when to use it and a slide example; then the key facts and conventions, symbol clashes, mental-math tips (no calculator) and unit traps. ' +
        'Print it, then test yourself with the recall drill — the same sheet with its key terms blanked out.'),
      h('div', { class: 'btn-row' },
        printBtn,
        h('a', { class: 'btn', href: '#/print/recall' }, 'Recall drill (blanks)'),
        h('a', { class: 'btn', href: '#/print/cheatsheet' }, 'Print preview page'),
        pdfLink(docs, 'cheatsheet', 'Cheat sheet PDF'),
        pdfLink(docs, 'recall', 'Recall drill PDF'))));
    main.appendChild(KIT.print.cheatSheet({ screen: true }));
  });
})();
