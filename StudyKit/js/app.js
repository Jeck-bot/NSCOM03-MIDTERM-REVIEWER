/* Boot: apply the saved theme and start the router. The ONLY file that touches the DOM at load. Loaded last. */
(function () {
  'use strict';
  if (KIT.ui.applyTheme) KIT.ui.applyTheme();
  KIT.router.start(document.getElementById('app'));
})();
