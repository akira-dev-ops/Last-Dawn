// Tela 1: Carregamento
LD.LoadingScene = {
  enter() {
    this.progress = 0;   // progresso real dos arquivos
    this.shown = 0;      // progresso exibido (animado)
    this.loaded = false;
    this.t = 0;
    this.leaving = 0;
    LD.Assets.load(p => { this.progress = p; }, () => { this.loaded = true; });
  },

  update(dt) {
    this.t += dt;
    // barra anima suavemente; duração mínima ~1.2s para a tela ser vista
    const target = Math.min(this.progress, this.t / 1.2);
    this.shown += (target - this.shown) * Math.min(1, dt * 8);
    if (this.loaded && this.shown > 0.985) {
      this.leaving += dt;
      if (this.leaving > 0.25) LD.Engine.go(LD.MenuScene);
    }
  },

  render(g) {
    const W = LD.W, H = LD.H, U = LD.UI;
    U.background(g, LD.Assets.img('loadingBg') ? 'loadingBg' : 'menuBg', this.t);
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.fillRect(0, 0, W, H);

    const pulse = 1 + Math.sin(this.t * 3) * 0.02;
    g.save();
    g.translate(W / 2, H * 0.36);
    g.scale(pulse, pulse);
    U.outlined(g, 'Last Dawn', 0, 0, 104, '#ffd58a');
    g.restore();
    U.text(g, 'sobreviva até o amanhecer', W / 2, H * 0.36 + 80, 30, '#f2d7ff', 'center', 'normal');

    const bw = W - 160, bh = 30, bx = 80, by = H * 0.7;
    U.bar(g, bx, by, bw, bh, this.shown, '#ffb347');
    g.lineWidth = 3;
    g.strokeStyle = 'rgba(255,255,255,0.5)';
    U.roundRect(g, bx, by, bw, bh, bh / 2);
    g.stroke();
    U.text(g, 'Carregando... ' + Math.round(this.shown * 100) + '%', W / 2, by + 70, 28, '#fff');
  },
};
