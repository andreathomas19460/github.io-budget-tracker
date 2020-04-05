const FILES_TO_CACHE = [
    `/`,
    `/index.html`,
    `/manifest.webmanifest`,
    `/assets/tinyPig.png`,
    `/assets/pig.png`,
    `/index.js`,
    `/db.js`,
    `/style.css`
  ];
  
  const CACHE_NAME = `static-cache-v1`;
  const DATA_CACHE_NAME = `data-cache-v3`;
  
  //install
  self.addEventListener(`install`, event => {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  //activate
  self.addEventListener(`activate`, event => {
    event.waitUntil(
      caches.keys().then(keyList =>
        Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              return caches.delete(key);
            }
            return undefined;
          })
        )
      )
    );
  
    self.clients.claim();
  });
  //fetch
  self.addEventListener('fetch', event => {
    console.log('begin fetch');
    if(event.request.url.includes('/api/')){
        event.respondWith(
            caches.open(DATA_CACHE_NAME)
            .then(cache => fetch(event.request)
            .then(response => {
                if (response.status === 200){
                    cache.put(event.request.url, response.clone());
                }
                return response;
            })
            .catch(() => 
            cache.match(event.request)
            ))
            .catch(err => console.error())
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(response => response || fetch (event.request))
        );
    }
});



