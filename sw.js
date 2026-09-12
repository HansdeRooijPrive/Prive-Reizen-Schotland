/* Service worker voor Interactieve reiskaarten.
   - App-schil + routedata: stale-while-revalidate (instant laden, op de achtergrond bijgewerkt).
   - Kaarttegels (Stadia Maps): cache-first met begrensde omvang (offline + minder verzoeken).
   Bump VERSION bij elke release zodat oude caches opruimen. */
const VERSION = 'v2.0';
const SHELL   = 'shell-' + VERSION;
const DATA    = 'data-'  + VERSION;
const TILES   = 'tiles-' + VERSION;
const SHELL_ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
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
      return Promise.all(keys.filter(function (k) { return k.indexOf(VERSION) === -1; })
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
