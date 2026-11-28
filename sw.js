/* Pashvena app helper: makes the site installable and opens fast, even on weak signal. */
const V = "pashvena-v4";
const CORE = ["/", "/favicon.svg", "/logo.svg", "/icon-192.png", "/icon-512.png", "/site.webmanifest", "/qr.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;           // never touch Firebase, payments, fonts
  if (r.mode === "navigate") {                                                    // pages: always try the newest first
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match("/"))));
    return;
  }
  if (/\.(png|svg|ico|webmanifest|js)$/.test(u.pathname) && !u.pathname.endsWith("sw.js"))
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })));
});
