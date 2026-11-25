// Garaje Tu Estilo: la página abre rápido y funciona con mala señal (por ejemplo, en casa del cliente).
const CACHE = 'gte-prot-1795648565';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './img/tex-flat.webp', './img/tex-solid.webp', './img/tex-regular.webp', './img/tex-regular-overlay.webp', './img/tex-solid-detail.webp', './img/logo.webp', './img/tile-regular.webp', './img/rampa-esquinero.webp', './img/rampa-pieza.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => { const r = e.request; if (r.method !== 'GET') return; const url = new URL(r.url);
  // la página: primero internet (para recibir cambios), si no hay señal la copia guardada
  if (r.mode === 'navigate'){ e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return res; }).catch(() => caches.match('./index.html'))); return; }
  // 3D, fotos, autos y librerías: la copia guardada primero
  if (url.origin === location.origin || /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(url.hostname)){
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === 'opaque'){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }))); }
});
