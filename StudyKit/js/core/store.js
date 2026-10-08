/* Persistent progress store: localStorage under "nscom03.v1.*", with an in-memory fallback. */
(function () {
  'use strict';
  var PREFIX = 'nscom03.v1.';
  var mem = {};
  var backend = null;

  function probe() {
    try {
      if (typeof localStorage === 'undefined' || !localStorage) return null;
      localStorage.setItem(PREFIX + '__probe', '1');
      localStorage.removeItem(PREFIX + '__probe');
      return localStorage;
    } catch (e) { return null; }
  }
  backend = probe();

  function rawGet(key) {
    if (backend) { try { return backend.getItem(PREFIX + key); } catch (e) { /* fall through */ } }
    return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null;
  }
  function rawSet(key, raw) {
    if (backend) { try { backend.setItem(PREFIX + key, raw); return true; } catch (e) { /* quota or privacy mode */ } }
    mem[key] = raw;
    return false;
  }

  KIT.store = {
    get: function (key, dflt) {
      var raw = rawGet(key);
      if (raw === null || raw === undefined) return dflt;
      try { return JSON.parse(raw); } catch (e) { return dflt; }
    },
    set: function (key, val) { return rawSet(key, JSON.stringify(val)); },
    remove: function (key) {
      if (backend) { try { backend.removeItem(PREFIX + key); } catch (e) { /* ignore */ } }
      delete mem[key];
    },
    keys: function () {
      var out = [];
      if (backend) {
        try {
          for (var i = 0; i < backend.length; i++) {
            var k = backend.key(i);
            if (k && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length));
          }
        } catch (e) { /* ignore */ }
      }
      Object.keys(mem).forEach(function (k) { if (out.indexOf(k) < 0) out.push(k); });
      return out;
    },
    clear: function () { KIT.store.keys().forEach(KIT.store.remove); },
    export: function () {
      var o = {};
      KIT.store.keys().forEach(function (k) { o[k] = KIT.store.get(k, null); });
      return o;
    },
    import: function (obj) { Object.keys(obj || {}).forEach(function (k) { KIT.store.set(k, obj[k]); }); },
    backendName: function () { return backend ? 'localStorage' : 'memory'; },
    /** Tests only: swap the backend (pass null for the in-memory fallback). */
    _use: function (b) { backend = b || null; mem = {}; }
  };
})();
