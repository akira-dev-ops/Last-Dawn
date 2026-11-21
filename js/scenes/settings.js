// Tela de Configurações: volume, vibração e opções de desempenho
LD.SettingsScene = {
  enter() {
    this.t = 0;
    this.confirmReset = 0;
    this.dragVol = null;
    this.layout();
  },

  onResize() { this.layout(); },
  onKey(code) { if (code === 'Escape') LD.Engine.go(LD.MenuScene); },

  layout() {
    const W = LD.W, H = LD.H, U = LD.UI, S = LD.Save.data.settings;
    this.slider = { x: 150, y: 270, w: W - 300, h: 60 };
    const toggle = (key, label, y) => {
      const b = U.button(70, y, W - 140, 86, '', () => {
        S[key] = !S[key];
        LD.Save.save();
        if (key === 'vibration' && S[key]) LD.vibrate(60);
        b.label = label + ': ' + (S[key] ? 'Sim' : 'Não');
      }, { fontSize: 32 });
      b.label = label + ': ' + (S[key] ? 'Sim' : 'Não');
      return b;
    };
    const vol = d => () => this.setVolume(Math.round((S.volume + d) * 10) / 10);
    this.buttons = [
      U.button(50, 258, 84, 84, '−', vol(-0.1), { fontSize: 48 }),
      U.button(W - 134, 258, 84, 84, '+', vol(0.1), { fontSize: 48 }),
      toggle('vibration', 'Vibração', 400),
      toggle('damageNumbers', 'Números de dano', 510),
      toggle('showFps', 'Mostrar FPS', 620),
      U.button(70, 760, W - 140, 80, 'Apagar progresso', b => {
        if (this.confirmReset > 0) {
          LD.Save.reset();
          LD.Audio.setVolume(LD.Save.data.settings.volume);
          this.layout();
          this.toast = 'Progresso apagado.';
          this.toastT = 2;
          return;
        }
        this.confirmReset = 3;
        b.label = 'Toque de novo para confirmar';
      }, { color: '#7a2a3a', fontSize: 28 }),
      U.button(W / 2 - 180, H - 120, 360, 86, 'Voltar', () => LD.Engine.go(LD.MenuScene)),
    ];
    this.resetBtn = this.buttons[5];
  },

  setVolume(v) {
    const S = LD.Save.data.settings;
    S.volume = Math.max(0, Math.min(1, v));
    LD.Audio.setVolume(S.volume);
    LD.Save.save();
  },

  onDown(x, y, id) {
    const s = this.slider;
    if (x >= s.x - 20 && x <= s.x + s.w + 20 && y >= s.y - 10 && y <= s.y + s.h + 10) {
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
      if (this.confirmReset <= 0) this.resetBtn.label = 'Apagar progresso';
    }
    if (this.toastT > 0) this.toastT -= dt;
  },

  render(g) {
    const W = LD.W, H = LD.H, U = LD.UI, S = LD.Save.data.settings, s = this.slider;
    U.background(g, 'menuBg', this.t);
    g.fillStyle = 'rgba(8,4,16,0.6)';
    g.fillRect(0, 0, W, H);
    U.outlined(g, 'Configurações', W / 2, 90, 58, '#ffd58a');

    U.text(g, 'Volume: ' + Math.round(S.volume * 100) + '%', W / 2, 220, 32, '#fff');
    U.bar(g, s.x, s.y + 18, s.w, 24, S.volume, LD.COLORS.accent);
    const kx = s.x + s.w * S.volume;
    g.beginPath(); g.arc(kx, s.y + 30, 24, 0, Math.PI * 2);
    g.fillStyle = '#fff'; g.fill();

    U.drawButtons(g, this.buttons);
    U.text(g, 'Desligue "Números de dano" se o jogo ficar lento.', W / 2, 875, 22, LD.COLORS.dim, 'center', 'normal');

    if (this.toastT > 0) {
      U.panel(g, 100, H - 250, W - 200, 70);
      U.text(g, this.toast, W / 2, H - 215, 28, '#fff');
    }
  },
};
