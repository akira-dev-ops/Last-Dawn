// HUD do jogo: XP, nível, tempo, abates, poderes, vida do chefe, avisos.
LD.HUD = {
  draw(g, G) {
    const W = LD.W, U = LD.UI;
    // Barra de XP
    U.bar(g, 8, 8, W - 16, 26, G.xp / G.xpNext, LD.COLORS.xp, 'rgba(10,6,20,0.8)');
    U.outlined(g, 'Nv ' + G.level, W - 24, 21, 22, '#fff', 'right');

    // Tempo e abates
    U.outlined(g, LD.fmtTime(G.time), W / 2, 74, 46, '#fff');
    U.outlined(g, 'Abates ' + G.kills, 20, 74, 26, '#ffd9a0', 'left');

    // Ícones dos poderes e melhorias
    let x = 34;
    for (let i = 0; i < G.powers.length; i++) {
      const inst = G.powers[i];
      U.icon(g, inst.def, x, 124, 44);
      U.outlined(g, '' + inst.level, x + 16, 140, 18, '#fff');
      x += 50;
    }
    x = 30;
    for (const id in G.passives) {
      const def = LD.PASSIVE[id];
      U.icon(g, def, x, 170, 34);
      U.outlined(g, '' + G.passives[id], x + 12, 182, 15, '#ffd27a');
      x += 40;
    }

    // Vida do chefe
    const boss = G.currentBoss();
    if (boss) {
      const bw = W - 80;
      U.outlined(g, boss.def.name, W / 2, 214, 26, '#ffb3a0');
      U.bar(g, 40, 232, bw, 20, boss.hp / boss.maxHp, '#ff5470', 'rgba(10,6,20,0.8)');
    }

    // Botão de pausa
    G.pauseBtn && U.drawButton(g, G.pauseBtn);

    // Avisos (toasts)
    for (let i = 0; i < G.toasts.length; i++) {
      const t = G.toasts[i];
      const a = Math.min(1, t.t * 2, (t.life - t.t) * 4 + 0.2);
      g.globalAlpha = Math.max(0, a);
      const y = LD.H * 0.30 + i * 70;
      U.panel(g, 60, y - 30, W - 120, 60, 'rgba(20,10,35,0.85)', t.color || LD.COLORS.panelBorder);
      U.text(g, t.text, W / 2, y, 26, t.color || '#fff');
      g.globalAlpha = 1;
    }
  },
};
