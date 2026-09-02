const CACHE_NAME = "runambiz-shell-v2";

/* Only paths this deployment actually serves. auth.html and
   onboarding.html live on www.runambiz.com now — a cross-origin
   URL can't go in a precache list, and one missing entry makes
   the whole addAll reject. */

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/runambizlogo.webp",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      /* Added one at a time so a single 404 doesn't fail the
         whole install — the worker still activates and the
         missing file just isn't cached. */
      return Promise.all(
        STATIC_ASSETS.map(function (url) {
          return cache.add(url).catch(function () {
            console.warn("SW: could not cache", url);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_NAME;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  /* Never touch Supabase or anything off-origin — caching auth
     calls is how you end up serving a stale session. */
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).catch(function () {
      /* Offline. SPA routes have no matching cache entry, so
         fall back to the shell and let the router sort it out. */
      if (event.request.mode === "navigate") {
        return caches.match("/index.html");
      }
      return caches.match(event.request);
    })
  );
});
