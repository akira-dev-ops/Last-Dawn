// Tela 2: Menu principal
LD.MenuScene = {
  enter() {
    this.t = 0;
    this.toast = null;
    this.layout();
    LD.Audio.playMusic('music_menu');
  },

  onResize() { this.layout(); },

  layout() {
    const W = LD.W, H = LD.H, U = LD.UI;
    const go = scene => () => LD.Engine.go(scene);
    const gw = 290, gh = 84, gap = 20;
    const gx = (W - (gw * 2 + gap)) / 2;
    const gy2 = H - 150 - gh;       // 2ª linha da grade
    const gy1 = gy2 - gh - gap;     // 1ª linha
    const py = gy1 - 52 - 112;      // botão Jogar
    this.logoY = Math.min(H * 0.15, py - 300) + 10;
    if (this.logoY < 120) this.logoY = 120;

    this.buttons = [
      U.button(gx + 10, py, gw * 2 + gap - 20, 112, 'JOGAR', () => { LD.tryFullscreen(); LD.Engine.go(LD.GameScene); },
        { style: 'primary', fontSize: 46 }),
      U.button(gx, gy1, gw, gh, 'Coleção', go(LD.CollectionScene), { glyph: 'book' }),
      U.button(gx + gw + gap, gy1, gw, gh, 'Conquistas', go(LD.AchievementsScene), { glyph: 'trophy' }),
      U.button(gx, gy2, gw, gh, 'Loja', go(LD.ShopScene), { glyph: 'coin' }),
      U.button(gx + gw + gap, gy2, gw, gh, 'Ajustes', go(LD.SettingsScene), { glyph: 'gear' }),
      U.button(W / 2 - 110, H - 82, 220, 50, 'CRÉDITOS', go(LD.CreditsScene), { style: 'ghost', fontSize: 20 }),
    ];
    this.recordY = py - 46;
  },

  update(dt) {
    this.t += dt;
    if (this.toast) { this.toast.t -= dt; if (this.toast.t <= 0) this.toast = null; }
  },

  render(g) {
    const W = LD.W, H = LD.H, U = LD.UI, C = LD.COLORS;
    U.background(g, 'menuBg', this.t);
    U.vignette(g, 0.55);

    // logotipo com leve flutuação
    U.logo(g, W / 2, this.logoY + Math.sin(this.t * 1.2) * 3, 1);
    U.label(g, 'SOBREVIVA ATÉ O AMANHECER', W / 2, this.logoY + 100, 19, C.dim, 'center', 5, 600);

    // recorde
    const st = LD.Save.data.stats;
    if (st.bestTime > 0) {
      U.label(g, 'RECORDE', W / 2 - 18, this.recordY, 16, C.gold, 'right', 3);
      U.text(g, LD.fmtTime(st.bestTime) + '  ·  ' + st.bestKills + ' abates', W / 2, this.recordY + 1, 24, C.text, 'left', 500);
    }

    U.drawButtons(g, this.buttons);
    U.text(g, 'v' + LD.VERSION, W - 24, H - 57, 18, C.muted, 'right', 500);

    if (this.toast) {
      g.globalAlpha = Math.min(1, this.toast.t * 2);
      U.frame(g, 90, H * 0.42, W - 180, 76, { ornaments: true });
      U.text(g, this.toast.text, W / 2, H * 0.42 + 38, 28, C.text);
      g.globalAlpha = 1;
    }
  },
};

// Tela cheia e trava retrato (quando o navegador permite)
LD.tryFullscreen = function () {
  try {
    const d = document.documentElement;
    if (!document.fullscreenElement && d.requestFullscreen && !window.matchMedia('(display-mode: fullscreen)').matches) {
      d.requestFullscreen({ navigationUI: 'hide' }).then(() => {
        if (screen.orientation && screen.orientation.lock) screen.orientation.lock('portrait').catch(() => { });
      }).catch(() => { });
    }
  } catch (e) { }
};
