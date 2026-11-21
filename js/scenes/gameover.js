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
      U.button(70, H - 270, W - 140, 108, 'RECOMEÇAR', () => LD.Engine.go(LD.GameScene), { style: 'primary', fontSize: 42 }),
      U.button(150, H - 140, W - 300, 78, 'Menu', () => LD.Engine.go(LD.MenuScene)),
    ];
  },

  update(dt) { this.t += dt; },

  render(g) {
    const W = LD.W, H = LD.H, U = LD.UI, C = LD.COLORS, r = this.run;
    const k = Math.min(1, this.t / 0.6); // animação de entrada
    U.background(g, 'menuBg', this.t);
    g.fillStyle = 'rgba(12,4,6,0.7)';
    g.fillRect(0, 0, W, H);
    U.vignette(g, 0.4);

    g.globalAlpha = k;
    U.label(g, 'A NOITE VENCEU', W / 2, 118, 50, '#e58a6a', 'center', 6, 900);
    U.text(g, 'O amanhecer não chegou desta vez.', W / 2, 170, 24, C.dim, 'center', 400);
    U.divider(g, W / 2, 210, 360, '#b8735a');

    // estatísticas
    const bx = 56, bw = W - 112, by = 246;
    const rows = [
      ['TEMPO', LD.fmtTime(r.time), this.recordTime],
      ['ABATES', '' + r.kills, this.recordKills],
      ['NÍVEL', '' + r.level, false],
      ['CHEFES', '' + r.bossKills, false],
    ];
    U.frame(g, bx, by, bw, rows.length * 64 + 20, { fill: 'rgba(10,8,14,0.85)' });
    let y = by + 10;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      U.label(g, row[0], bx + 36, y + 32, 20, C.dim, 'left', 4);
      U.text(g, row[1], bx + bw - 36, y + 32, 36, C.text, 'right', 700);
      if (row[2]) {
        g.font = U.font(36, 700);
        const vw = g.measureText(row[1]).width;
        U.frame(g, bx + bw - 36 - vw - 132, y + 18, 112, 28, { c: 6, fill: 'rgba(201,164,92,0.2)', inner: false });
        U.label(g, 'RECORDE', bx + bw - 36 - vw - 76, y + 33, 13, C.goldLight, 'center', 2);
      }
      if (i < rows.length - 1) {
        g.fillStyle = 'rgba(201,164,92,0.15)';
        g.fillRect(bx + 24, y + 63, bw - 48, 1);
      }
      y += 64;
    }

    // poderes usados
    y = by + rows.length * 64 + 20 + 52;
    U.label(g, 'PODERES', W / 2, y, 16, C.gold, 'center', 4);
    const n = r.powerList.length;
    let x = W / 2 - ((n - 1) * 92) / 2;
    for (const p of r.powerList) {
      U.icon(g, p.def, x, y + 58, 70);
      U.pips(g, x, y + 106, p.level, p.def.maxLevel, 3.5);
      x += 92;
    }

    // conquistas novas
    if (r.newAchievements.length) {
      let ay = y + 150;
      const list = r.newAchievements.slice(0, 2);
      U.label(g, r.newAchievements.length > 1 ? r.newAchievements.length + ' CONQUISTAS' : 'NOVA CONQUISTA', W / 2, ay, 16, C.gold, 'center', 4);
      ay += 38;
      for (const a of list) {
        g.font = U.font(24, 500);
        const tw = g.measureText(a.name).width;
        U.glyph(g, 'trophy', W / 2 - tw / 2 - 20, ay, 24, C.goldLight);
        U.text(g, a.name, W / 2 + 14, ay, 24, C.text, 'center', 500);
        ay += 36;
      }
    }
    g.globalAlpha = 1;

    U.drawButtons(g, this.buttons);
  },
};
