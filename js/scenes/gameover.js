// Tela 4: Fim de jogo
LD.GameOverScene = {
  enter(run) {
    this.run = run;
    this.t = 0;
    const st = LD.Save.data.stats;
    this.recordTime = run.time >= st.bestTime && run.time > 0;
    this.recordKills = run.kills >= st.bestKills && run.kills > 0;
    this.layout();
  },

  onResize() { this.layout(); },

  layout() {
    const W = LD.W, H = LD.H, U = LD.UI;
    this.buttons = [
      U.button(W / 2 - 230, H - 290, 460, 100, 'Recomeçar', () => LD.Engine.go(LD.GameScene), { color: '#d8642a', fontSize: 44 }),
      U.button(W / 2 - 230, H - 168, 460, 86, 'Menu', () => LD.Engine.go(LD.MenuScene)),
    ];
  },

  update(dt) { this.t += dt; },

  render(g) {
    const W = LD.W, H = LD.H, U = LD.UI, r = this.run;
    U.background(g, 'menuBg', this.t);
    g.fillStyle = 'rgba(10,0,10,0.6)';
    g.fillRect(0, 0, W, H);

    U.outlined(g, 'O amanhecer', W / 2, 110, 60, '#ff8a6a');
    U.outlined(g, 'não chegou...', W / 2, 178, 60, '#ff8a6a');

    U.panel(g, 50, 235, W - 100, 285);
    const rows = [
      ['Tempo sobrevivido', LD.fmtTime(r.time), this.recordTime],
      ['Inimigos derrotados', '' + r.kills, this.recordKills],
      ['Nível alcançado', '' + r.level, false],
      ['Chefes derrotados', '' + r.bossKills, false],
    ];
    let y = 285;
    for (const row of rows) {
      U.text(g, row[0], 90, y, 30, LD.COLORS.dim, 'left', 'normal');
      U.text(g, row[1], W - 90, y, 38, '#fff', 'right');
      if (row[2]) U.text(g, 'RECORDE!', W - 215, y + 2, 20, LD.COLORS.accent, 'right');
      y += 62;
    }

    // poderes usados
    let x = W / 2 - ((r.powerList.length - 1) * 70) / 2;
    for (const p of r.powerList) {
      U.icon(g, p.def, x, 575, 58);
      U.outlined(g, '' + p.level, x + 22, 595, 20, '#fff');
      x += 70;
    }

    if (r.newAchievements.length) {
      const n = r.newAchievements.length;
      U.outlined(g, n > 1 ? n + ' conquistas desbloqueadas!' : 'Conquista desbloqueada!', W / 2, 648, 26, LD.COLORS.accent);
      let ay = 686;
      for (const a of r.newAchievements.slice(0, 2)) {
        U.outlined(g, '★ ' + a.name, W / 2, ay, 26, '#fff');
        ay += 36;
      }
    }

    U.drawButtons(g, this.buttons);
  },
};
