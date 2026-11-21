// Ponto de entrada
(function () {
  LD.Save.load();
  LD.Keys.init();
  LD.Engine.init();
  LD.Engine.go(LD.LoadingScene);
})();
