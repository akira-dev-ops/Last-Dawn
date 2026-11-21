// Service worker: deixa o jogo funcionando offline.
// IMPORTANTE: ao publicar uma nova versão, mude CACHE_VERSION
// para que os celulares baixem os arquivos atualizados.
const CACHE_VERSION = 'lastdawn-v1';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './js/config.js',
  './js/data/assets.js',
  './js/data/enemies.js',
  './js/core/save.js',
  './js/core/audio.js',
  './js/core/assets.js',
  './js/core/sprites.js',
  './js/core/input.js',
  './js/core/engine.js',
  './js/ui/ui.js',
  './js/ui/joystick.js',
  './js/entities/player.js',
  './js/entities/enemy.js',
  './js/scenes/loading.js',
  './js/scenes/menu.js',
  './js/scenes/game.js',
  './js/main.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Estratégia "stale-while-revalidate": responde do cache na hora (rápido e
// offline) e atualiza o cache em segundo plano quando houver internet.
// Arquivos novos (imagens/sons que você adicionar) entram no cache no 1º uso.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(cached => {
        const network = fetch(req)
          .then(res => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached || (req.mode === 'navigate' ? cache.match('./index.html') : undefined));
        return cached || network;
      })
    )
  );
});
