// キャッシュ名を更新すると古いキャッシュは自動破棄
const CACHE_NAME = 'tower-cache-v3';
const ASSETS = [
  './',
  './index.html',
  './matter.min.js',
  './ball.jpg',
  './target.jpg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// キャッシュ優先（オフラインで動く）
self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      // 同一オリジンのみキャッシュ追記
      if (res.ok && new URL(req.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => cached || new Response('', {status:404})))
  );
});
