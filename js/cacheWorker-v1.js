const APPVERSION = 'v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(APPVERSION).then((cache) => {
            return cache.addAll([
                '../index.html',
                '../css/main.css',
                './main.js',
                './modules/baseClass.obj.js',
                './modules/config.static.js',
                './modules/core.static.js',
                './modules/evidence.obj.js',
                './modules/ghost.obj.js',
                './modules/helpers.js',
                './modules/tactic.obj.js',
                './modules/ui.static.js',
                './seeders/evidence.seed.js',
                './seeders/ghost.seed.js',
                './seeders/tactic.seed.js'
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    var cacheKeeplist = [APPVERSION];

    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (cacheKeeplist.indexOf(key) === -1) {
                    console.log('delete: ' + key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((resp) => {
            return resp || fetch(event.request).then((response) => {
                return caches.open(APPVERSION).then((cache) => {
                    cache.put(event.request, response.clone());
                    console.log(event.request);
                    return response;
                });
            });
        })
    );
});