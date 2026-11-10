var CACHE = 'venta-cupo-v3'; // súbele la versión cada vez que cambies index.html
var ARCHIVOS = ['./', 'index.html', 'manifest.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return; // la API no se cachea
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r && r.ok) { // no cachear 404/500
        var copia = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      }
      return r;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (r) {
        return r || caches.match('index.html');
      });
    })
  );
});
