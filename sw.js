/* ============================================
   PYTHON ZERO - SERVICE WORKER
   Offline functionality and caching
   ============================================ */

const CACHE_NAME = 'python-zero-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/editor.css',
    '/css/mobile.css',
    '/js/app.js',
    '/js/editor.js',
    '/js/runner.js',
    '/js/errors.js',
    '/js/lessons.js',
    '/manifest.json',
    // CDN resources will be cached on first use
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[ServiceWorker] Installation complete');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('[ServiceWorker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Activation complete');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests (CDN)
    if (url.origin !== location.origin) {
        // Cache CDN resources for offline use
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        return response;
                    }

                    return fetch(request)
                        .then((response) => {
                            // Cache successful responses
                            if (response && response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        })
                        .catch(() => {
                            // Network failed and no cache - return offline page
                            return new Response('Offline - CDN resource unavailable', {
                                status: 503,
                                statusText: 'Service Unavailable'
                            });
                        });
                })
        );
        return;
    }

    // For same-origin requests, use cache-first strategy
    event.respondWith(
        caches.match(request)
            .then((response) => {
                if (response) {
                    // Return cached version
                    return response;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then((response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone response (can only be consumed once)
                        const responseToCache = response.clone();

                        // Cache the fetched response
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Cache lesson JSON files
                                if (request.url.includes('/lessons/')) {
                                    cache.put(request, responseToCache);
                                }
                            });

                        return response;
                    })
                    .catch(() => {
                        // Network failed and no cache
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Message event - handle messages from app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_LESSON') {
        // Cache a specific lesson
        const lessonUrl = event.data.url;
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.add(lessonUrl);
            })
            .then(() => {
                console.log('[ServiceWorker] Cached lesson:', lessonUrl);
            })
            .catch((error) => {
                console.error('[ServiceWorker] Failed to cache lesson:', error);
            });
    }
});

console.log('[ServiceWorker] Loaded');
