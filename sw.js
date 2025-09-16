/* Safari-friendly service worker
 * - Network-first for navigations (avoids stale pages, handles Netlify rewrites w/200)
 * - Cache-first for static assets
 * - No caching of redirect responses
 * - Instant updates via skipWaiting + clients.claim
 */
const VERSION = 'v5';
const STATIC_CACHE = 'static-' + VERSION;
const HTML_CACHE = 'html-' + VERSION;

// List core assets you want cached upfront
const CORE_ASSETS = [
  'index.html',
  'manifest.json',
  // Icons (adjust if your filenames differ)
  'icons/icon-72x72.png',
  'icons/icon-96x96.png',
  'icons/icon-128x128.png',
  'icons/icon-144x144.png',
  'icons/icon-152x152.png',
  'icons/icon-192x192.png',
  'icons/icon-384x384.png',
  'icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(
      CORE_ASSETS.filter(Boolean)
    ))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => {
      if (k !== STATIC_CACHE && k !== HTML_CACHE) return caches.delete(k);
    }));
    await self.clients.claim();
  })());
});

function isHTMLRequest(request) {
  return request.mode === 'navigate' ||
         (request.headers.get('accept') || '').includes('text/html');
}

async function cachePutIfOk(cacheName, request, response) {
  try {
    if (!response || !response.ok) return response;
    if (response.redirected) return response; // avoid storing redirects
    const clone = response.clone();
    const cache = await caches.open(cacheName);
    await cache.put(request, clone);
  } catch (_) {}
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  // Navigations: network first, fallback to cached index.html
  if (isHTMLRequest(request)) {
    event.respondWith((async () => {
      try {
        const network = await fetch(request, { redirect: 'follow' });
        await cachePutIfOk(HTML_CACHE, request, network);
        return network;
      } catch (err) {
        // offline fallback
        const cache = await caches.open(HTML_CACHE);
        const cached = await cache.match('index.html') || await caches.match('index.html');
        if (cached) return cached;
        // As last resort, try static cache
        const cachedStatic = await caches.match('index.html');
        if (cachedStatic) return cachedStatic;
        throw err;
      }
    })());
    return;
  }

  // Static assets: cache-first, then network
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const network = await fetch(request, { redirect: 'follow' });
      await cachePutIfOk(STATIC_CACHE, request, network);
      return network;
    } catch (err) {
      // final fallback: nothing
      throw err;
    }
  })());
});
