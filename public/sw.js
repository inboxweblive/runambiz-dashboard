const CACHE_NAME =
  "runambiz-shell-v1";


const STATIC_ASSETS = [
  "/",
  "/dashboard.html",
  "/auth.html",
  "/onboarding.html",
  "/Runambizlogo.webp",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];



self.addEventListener(
  "install",
  function(event) {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(function(cache) {

          return cache.addAll(
            STATIC_ASSETS
          );

        })

    );


    self.skipWaiting();

  }
);



self.addEventListener(
  "activate",
  function(event) {

    event.waitUntil(

      caches
        .keys()
        .then(function(keys) {

          return Promise.all(

            keys
              .filter(function(key) {

                return key !==
                  CACHE_NAME;

              })
              .map(function(key) {

                return caches.delete(
                  key
                );

              })

          );

        })

    );


    self.clients.claim();

  }
);



self.addEventListener(
  "fetch",
  function(event) {


    if (
      event.request.method !== "GET"
    ) {

      return;

    }


    event.respondWith(

      fetch(
        event.request
      )
        .then(function(response) {

          return response;

        })
        .catch(function() {

          return caches.match(
            event.request
          );

        })

    );

  }
);