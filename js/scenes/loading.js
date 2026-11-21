// Tela 1: Carregamento
LD.LoadingScene = {
  MIN_TIME: 2.0, // tempo mínimo na tela (s), para a arte ser vista

  enter() {
    this.progress = 0;   // progresso real dos arquivos
    this.shown = 0;      // progresso exibido (animado)
    this.loaded = false;
    this.bgReady = false;
    this.t = 0;
    this.leaving = 0;
    // 1º carrega só o fundo (aparece rápido); depois o resto
    LD.Assets.loadOne('loadingBg', () => {
      this.bgReady = true;
      LD.Assets.load(p => { this.progress = p; }, () => { this.loaded = true; });
    });
  },

  update(dt) {
    if (!this.bgReady) return;
    this.t += dt;
    // barra anima suavemente, respeitando o tempo mínimo
    const target = Math.min(this.progress, this.t / this.MIN_TIME);
    this.shown += (target - this.shown) * Math.min(1, dt * 8);
    if (this.loaded && this.shown > 0.985) {
      this.leaving += dt;
      if (this.leaving > 0.35) LD.Engine.go(LD.MenuScene);
    }
  },

  // Converte a moldura desenhada na imagem para coordenadas da tela
  frameRect(img) {
    const B = LD.LOADING_BAR;
    if (!B || !img) return null;
    const c = LD.Assets.coverRect(img);
    const sx = c.w / B.imgW, sy = c.h / B.imgH;
    const r = { x: c.x + B.x * sx, y: c.y + B.y * sy, w: B.w * sx, h: B.h * sy };
    // se a moldura ficar fora da tela (tela muito larga), usa a barra padrão
    if (r.x < 0 || r.x + r.w > LD.W || r.y < 0 || r.y + r.h > LD.H) return null;
    return r;
  },

  render(g) {
    const W = LD.W, H = LD.H, U = LD.UI;
    const img = LD.Assets.img('loadingBg');
    g.fillStyle = '#0b0618';
    g.fillRect(0, 0, W, H);
    if (!this.bgReady) return;

    const fadeIn = Math.min(1, this.t / 0.4);
    const fadeOut = Math.min(1, this.leaving / 0.35);
    g.globalAlpha = fadeIn;
    U.background(g, img ? 'loadingBg' : 'menuBg', this.t);

    // título no céu (acima do herói)
    const ty = img ? H * 0.12 : H * 0.36;
    if (img) {
      const gr = g.createLinearGradient(0, 0, 0, H * 0.3);
      gr.addColorStop(0, 'rgba(8,4,20,0.55)');
      gr.addColorStop(1, 'rgba(8,4,20,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, W, H * 0.3);
    } else {
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(0, 0, W, H);
    }
    const pulse = 1 + Math.sin(this.t * 3) * 0.02;
    g.save();
    g.translate(W / 2, ty);
    g.scale(pulse, pulse);
    U.outlined(g, 'Last Dawn', 0, 0, 104, '#ffd58a');
    g.restore();
    U.outlined(g, 'sobreviva até o amanhecer', W / 2, ty + 78, 30, '#f2d7ff');

    // barra de progresso
    const label = 'Carregando... ' + Math.round(this.shown * 100) + '%';
    const fr = this.frameRect(img);
    if (fr) {
      // preenche a moldura que já existe na arte
      const fw = fr.w * Math.max(0, Math.min(1, this.shown));
      if (fw > 1) {
        const gr = g.createLinearGradient(0, fr.y, 0, fr.y + fr.h);
        gr.addColorStop(0, '#ffe6a6');
        gr.addColorStop(0.5, '#ffb347');
        gr.addColorStop(1, '#d8742a');
        g.fillStyle = gr;
        g.fillRect(fr.x, fr.y, fw, fr.h);
        // brilho na ponta
        const spr = LD.Sprites.glow('#ffc870', 24, '#fffbe8');
        g.drawImage(spr, fr.x + fw - 24, fr.y + fr.h / 2 - 24);
      }
      U.outlined(g, label, W / 2, fr.y - 34, 26, '#fff');
    } else {
      const bw = W - 160, bh = 30, bx = 80, by = img ? H * 0.88 : H * 0.7;
      U.bar(g, bx, by, bw, bh, this.shown, '#ffb347');
      g.lineWidth = 3;
      g.strokeStyle = 'rgba(255,255,255,0.5)';
      U.roundRect(g, bx, by, bw, bh, bh / 2);
      g.stroke();
      U.outlined(g, label, W / 2, by - 36, 26, '#fff');
    }
    g.globalAlpha = 1;

    if (fadeOut > 0) {
      g.fillStyle = 'rgba(11,6,24,' + fadeOut + ')';
      g.fillRect(0, 0, W, H);
    }
  },
};
