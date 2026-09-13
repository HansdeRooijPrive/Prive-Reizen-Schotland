/* Service worker voor Interactieve reiskaarten.
   - App-schil + routedata: stale-while-revalidate (instant laden, op de achtergrond bijgewerkt).
   - Kaarttegels (Stadia Maps): cache-first met begrensde omvang (offline + minder verzoeken).
   Bump VERSION bij elke release zodat oude caches opruimen. */
const VERSION = 'v2.2';
// Per omgeving gescheiden (OTAP-platform): cachenamen beginnen met de opslagsleutel
// van de omgeving, en de productie-worker blijft van /acceptatie/ en /test/ af.
const ENV     = '{{ENV}}';
const PREFIX  = '{{STORAGE_KEY}}-';
const SHELL   = PREFIX + 'shell-' + VERSION;
const DATA    = PREFIX + 'data-'  + VERSION;
const TILES   = PREFIX + 'tiles-' + VERSION;
const SHELL_ASSETS = ['./', './index.html', './manifest.json'];
// Caches van de worker van voor het platform (zonder omgeving in de naam).
const OUDE_CACHE = /^(shell|data|tiles)-v/;
const TILE_MAX = 800;

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(SHELL).then(function (c) { return c.addAll(SHELL_ASSETS).catch(function(){}); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        var eigenOud = k.indexOf(PREFIX) === 0 && k.indexOf(VERSION) === -1;
        var vanVoorPlatform = ENV === 'prod' && OUDE_CACHE.test(k);
        return eigenOud || vanVoorPlatform;
      })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function trimCache(name, max) {
  caches.open(name).then(function (c) {
    c.keys().then(function (keys) {
      if (keys.length > max) { c.delete(keys[0]).then(function () { trimCache(name, max); }); }
    });
  });
}

function swr(cacheName, req) {
  return caches.open(cacheName).then(function (c) {
    return c.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200) c.put(req, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  // Productie-worker: pagina's en bestanden van acceptatie en test niet aanraken.
  if (ENV === 'prod') {
    var scope = self.registration.scope;
    if (url.href.indexOf(scope + 'acceptatie/') === 0 || url.href.indexOf(scope + 'test/') === 0) return;
  }

  // Kaarttegels: cache-first, begrensd
  if (url.hostname.indexOf('stadiamaps.com') !== -1) {
    e.respondWith(
      caches.open(TILES).then(function (c) {
        return c.match(req).then(function (hit) {
          if (hit) return hit;
          return fetch(req).then(function (res) {
            if (res && res.status === 200) { c.put(req, res.clone()); trimCache(TILES, TILE_MAX); }
            return res;
          });
        });
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Navigatie (app-schil): stale-while-revalidate
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.open(SHELL).then(function (c) {
        return c.match(req).then(function (hit) {
          var net = fetch(req).then(function (res) {
            if (res && res.status === 200) c.put(req, res.clone());
            return res;
          }).catch(function () { return hit || c.match('./index.html'); });
          return hit || net;
        });
      })
    );
    return;
  }

  // Routedata en overige same-origin bestanden: stale-while-revalidate
  var cache = (url.pathname.indexOf('/data/') !== -1) ? DATA : SHELL;
  e.respondWith(swr(cache, req));
});
