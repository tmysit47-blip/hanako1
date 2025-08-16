// service-worker.js
const CACHE_NAME = 'tower-v3'; // 更新時は名前を変える
const ASSETS = [
  './',
  './index.html',
  './matter.min.js',
  './manifest.webmanifest',
  './ball.jpg',     // ある場合
  './target.jpg'    // ある場合
];

// インストール：必要ファイルをキャッシュ
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 古いキャッシュの整理
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME) && caches.delete(k)))
    )
  );
  self.clients.claim();
});

// オフライン応答（Cache優先 → ネット）
self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then((res) => {
      return res || fetch(req).then((netRes) => {
        // 同一オリジンのみ動的キャッシュ（容量対策）
        if (new URL(req.url).origin === self.location.origin) {
          const copy = netRes.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return netRes;
      }).catch(() => {
        // ここで必要ならオフライン時のフォールバックを返す
        return caches.match('./index.html');
      });
    })
  );
});
