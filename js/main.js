// Ponto de entrada
(function () {
  LD.Save.load();
  LD.Keys.init();
  LD.Engine.init();
  LD.Engine.go(LD.LoadingScene);

  // PWA: registra o service worker (precisa de http/https, não funciona em file://)
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(e => console.warn('[Last Dawn] SW falhou:', e));
    });
  }
})();
