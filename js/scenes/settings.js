// Tela de Ajustes: volume, vibração e opções de desempenho
LD.SettingsScene = {
  enter() {
    this.t = 0;
    this.confirmReset = 0;
    this.dragVol = null;
    this.toastT = 0;
    this.layout();
  },

  onResize() { this.layout(); },
  onKey(code) { if (code === 'Escape') LD.Engine.go(LD.MenuScene); },

  layout() {
    const W = LD.W, U = LD.UI, C = LD.COLORS, S = LD.Save.data.settings;
    this.box = { x: 36, y: 186, w: W - 72 };
    const bx = this.box.x, bw = this.box.w;
    this.slider = { x: bx + 40, y: this.box.y + 104, w: bw - 80, h: 12 };

    // linha com interruptor (a linha inteira é clicável)
    const toggleRow = (key, title, hint, y) => U.button(bx, y, bw, 104, '', () => {
      S[key] = !S[key];
      LD.Save.save();
      if (key === 'vibration' && S[key]) LD.vibrate(60);
    }, {
      draw: (g, b) => {
        if (b.pressed) { g.fillStyle = 'rgba(201,164,92,0.08)'; g.fillRect(b.x + 2, b.y, b.w - 4, b.h); }
        U.label(g, title, b.x + 40, b.y + 40, 22, C.text, 'left', 3);
        U.text(g, hint, b.x + 40, b.y + 72, 20, C.dim, 'left', 400);
        U.toggle(g, b.x + b.w - 132, b.y + 30, S[key]);
        g.fillStyle = 'rgba(201,164,92,0.14)';
        g.fillRect(b.x + 24, b.y + b.h - 1, b.w - 48, 1);
      },
    });

    let y = this.box.y + 160;
    this.rows = [
      toggleRow('vibration', 'VIBRAÇÃO', 'Ao tomar dano e subir de nível', y),
      toggleRow('damageNumbers', 'NÚMEROS DE DANO', 'Desligue se o jogo ficar lento', y + 104),
      toggleRow('showFps', 'MOSTRAR FPS', 'Exibe o desempenho na tela', y + 208),
    ];
    this.box.h = 160 + 104 * 3 + 20;

    this.resetBtn = U.button(W / 2 - 200, this.box.y + this.box.h + 44, 400, 56, 'APAGAR PROGRESSO', b => {
      if (this.confirmReset > 0) {
        LD.Save.reset();
        LD.Audio.setVolume(LD.Save.data.settings.volume);
        this.confirmReset = 0;
        b.label = 'APAGAR PROGRESSO';
        this.toast = 'Progresso apagado.';
        this.toastT = 2;
        return;
      }
      this.confirmReset = 3;
      b.label = 'TOQUE DE NOVO PARA CONFIRMAR';
    }, { style: 'ghost', fontSize: 18, textColor: '#d07a6a' });

    this.buttons = [U.backButton(() => LD.Engine.go(LD.MenuScene))].concat(this.rows, [this.resetBtn]);
  },

  setVolume(v) {
    const S = LD.Save.data.settings;
    S.volume = Math.max(0, Math.min(1, v));
    LD.Audio.setVolume(S.volume);
    LD.Save.save();
  },

  onDown(x, y, id) {
    const s = this.slider;
    if (x >= s.x - 30 && x <= s.x + s.w + 30 && y >= s.y - 40 && y <= s.y + s.h + 40) {
      this.dragVol = id;
      this.onMove(x, y, id);
    }
  },
  onMove(x, y, id) {
    if (this.dragVol !== id) return;
    const s = this.slider;
    this.setVolume(Math.round(((x - s.x) / s.w) * 20) / 20);
  },
  onUp(x, y, id) {
    if (this.dragVol === id) { this.dragVol = null; LD.Audio.play('pickup'); }
  },

  update(dt) {
    this.t += dt;
    if (this.confirmReset > 0) {
      this.confirmReset -= dt;
      if (this.confirmReset <= 0) this.resetBtn.label = 'APAGAR PROGRESSO';
    }
    if (this.toastT > 0) this.toastT -= dt;
  },

  render(g) {
    const W = LD.W, H = LD.H, U = LD.UI, C = LD.COLORS, S = LD.Save.data.settings, s = this.slider, b = this.box;
    U.background(g, 'menuBg', this.t);
    g.fillStyle = 'rgba(7,5,10,0.62)';
    g.fillRect(0, 0, W, H);
    U.vignette(g, 0);
    U.header(g, 'AJUSTES');

    U.frame(g, b.x, b.y, b.w, b.h, { fill: 'rgba(10,8,14,0.82)' });

    // volume
    U.label(g, 'VOLUME', b.x + 40, b.y + 52, 22, C.text, 'left', 3);
    U.text(g, Math.round(S.volume * 100) + '%', b.x + b.w - 40, b.y + 52, 26, C.goldLight, 'right', 700);
    U.bar(g, s.x, s.y, s.w, s.h, S.volume, '#b54a22', null, '#f0b070');
    const kx = s.x + s.w * S.volume, ky = s.y + s.h / 2;
    U.diamond(g, kx, ky, 17, '#1a1210', C.goldLight);
    U.diamond(g, kx, ky, 8, this.dragVol !== null ? '#fff2cf' : C.gold);
    g.fillStyle = 'rgba(201,164,92,0.14)';
    g.fillRect(b.x + 24, b.y + 159, b.w - 48, 1);

    U.drawButtons(g, this.buttons);

    if (this.toastT > 0) {
      g.globalAlpha = Math.min(1, this.toastT * 2);
      U.frame(g, 110, H - 170, W - 220, 70, { ornaments: true });
      U.text(g, this.toast, W / 2, H - 135, 26, C.text);
      g.globalAlpha = 1;
    }
  },
};
