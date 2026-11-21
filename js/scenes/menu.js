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
    const bw = 460, bh = 84, gap = 18;
    const x = (W - bw) / 2;
    let y = H * 0.34;
    const go = scene => () => LD.Engine.go(scene);
    const soon = name => () => { this.toast = { text: name + ': em breve', t: 2 }; };
    const items = [
      ['Jogar', () => { LD.tryFullscreen(); LD.Engine.go(LD.GameScene); }, '#d8642a'],
      ['Configurações', LD.SettingsScene ? go(LD.SettingsScene) : soon('Configurações')],
      ['Conquistas', LD.AchievementsScene ? go(LD.AchievementsScene) : soon('Conquistas')],
      ['Coleção', LD.CollectionScene ? go(LD.CollectionScene) : soon('Coleção')],
      ['Loja', LD.ShopScene ? go(LD.ShopScene) : soon('Loja')],
      ['Créditos', LD.CreditsScene ? go(LD.CreditsScene) : soon('Créditos')],
    ];
    this.buttons = items.map((it, i) => {
      const b = U.button(x, y, bw, i === 0 ? bh + 16 : bh, it[0], it[1], { color: it[2] || '#5a3a9a' });
      if (i === 0) b.fontSize = 46;
      y += b.h + gap;
      return b;
    });
  },

  update(dt) {
    this.t += dt;
    if (this.toast) { this.toast.t -= dt; if (this.toast.t <= 0) this.toast = null; }
  },

  render(g) {
    const W = LD.W, H = LD.H, U = LD.UI;
    U.background(g, 'menuBg', this.t);
    const ty = H * 0.12 + Math.sin(this.t * 1.5) * 6;
    U.outlined(g, 'Last Dawn', W / 2, ty, 112, '#ffd58a');
    U.text(g, 'sobreviva até o amanhecer', W / 2, ty + 82, 30, '#f2d7ff', 'center', 'normal');

    const st = LD.Save.data.stats;
    if (st.bestTime > 0) {
      U.outlined(g, 'Recorde: ' + LD.fmtTime(st.bestTime) + '  •  ' + st.bestKills + ' abates', W / 2, ty + 140, 26, '#fff');
    }

    U.drawButtons(g, this.buttons);
    U.text(g, 'v' + LD.VERSION, W - 20, H - 24, 22, 'rgba(255,255,255,0.6)', 'right', 'normal');

    if (this.toast) {
      g.globalAlpha = Math.min(1, this.toast.t * 2);
      U.panel(g, 90, H - 190, W - 180, 80);
      U.text(g, this.toast.text, W / 2, H - 150, 30, '#fff');
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
