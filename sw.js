// App shell cached for offline use; network-first so updates arrive straight away.
// Bump VERSION on every deploy so old caches are cleared.
const VERSION = 'regrow-v3';
const SHELL = ['./', 'index.html', 'app.css', 'manifest.webmanifest', 'js/content.js', 'js/store.js', 'js/meadow.js', 'js/app.js', 'icons/icon-180.png', 'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request, { cache: 'no-cache' }).then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; });
    if (!hit) return net;
    const slow = new Promise(r => setTimeout(() => r(hit), 1500));
    return Promise.race([net.catch(() => hit), slow]);
  }));
});
