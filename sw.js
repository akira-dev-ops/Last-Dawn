// Service worker: deixa o jogo funcionando offline.
// IMPORTANTE: ao publicar uma nova versão, mude CACHE_VERSION
// para que os celulares baixem os arquivos atualizados.
const CACHE_VERSION = 'lastdawn-v0.1.0';

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
  './js/data/powers.js',
  './js/data/passives.js',
  './js/data/waves.js',
  './js/data/achievements.js',
  './js/core/save.js',
  './js/core/audio.js',
  './js/core/assets.js',
  './js/core/sprites.js',
  './js/core/input.js',
  './js/core/pool.js',
  './js/core/grid.js',
  './js/core/engine.js',
  './js/ui/ui.js',
  './js/ui/joystick.js',
  './js/ui/hud.js',
  './js/ui/levelup.js',
  './js/ui/panel.js',
  './js/entities/player.js',
  './js/entities/enemy.js',
  './js/entities/projectile.js',
  './js/powers/behaviors.js',
  './js/scenes/loading.js',
  './js/scenes/menu.js',
  './js/scenes/game.js',
  './js/scenes/gameover.js',
  './js/scenes/settings.js',
  './js/scenes/panels.js',
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
