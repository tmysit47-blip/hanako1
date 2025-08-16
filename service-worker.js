// 版数を上げるとキャッシュ更新されます
const CACHE_NAME = "tower-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./matter.min.js",
  "./manifest.webmanifest",
  "./ball.jpg",
  "./target.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  // 優先: キャッシュ → ネット（オフライン可）
  e.respondWith(
    caches.match(request).then(res => res || fetch(request).then(r => {
      const copy = r.clone();
      caches.open(CACHE_NAME).then(c => c.put(request, copy)).catch(()=>{});
      return r;
    }).catch(() => caches.match("./index.html")))
  );
});
