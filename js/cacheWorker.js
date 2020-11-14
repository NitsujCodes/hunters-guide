self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                './js/',
                './index.html',
                './css/main.css',
                './js/main.js',
                './js/modules/',
                './js/modules/baseClass.obj.js',
                './js/modules/config.static.js',
                './js/modules/core.static.js',
                './js/modules/evidence.obj.js',
                './js/modules/ghost.obj.js',
                './js/modules/helpers.js',
                './js/modules/tactic.obj.js',
                './js/modules/ui.static.js',
                './js/seeders/',
                './js/seeders/evidence.seed.js',
                './js/seeders/ghost.seed.js',
                './js/seeders/tactic.seed.js'
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    var cacheKeeplist = ['v1'];

    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (cacheKeeplist.indexOf(key) === -1) {
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
                return caches.open('v1').then((cache) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});