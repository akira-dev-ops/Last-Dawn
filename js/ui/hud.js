// HUD do jogo: XP, nível, tempo, abates, poderes, vida do chefe, avisos.
LD.HUD = {
  // faixa escura no topo (em cache, para leitura sobre o chão)
  topShade() {
    return LD.Sprites.get('hud_shade', LD.W, 230, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, 'rgba(6,4,9,0.82)');
      gr.addColorStop(0.5, 'rgba(6,4,9,0.35)');
      gr.addColorStop(1, 'rgba(6,4,9,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, w, h);
    });
  },

  draw(g, G) {
    const W = LD.W, U = LD.UI, C = LD.COLORS;
    g.drawImage(this.topShade(), 0, 0);

    // ----- XP + nível -----
    const bx = 88, by = 22, bw = W - bx - 20, bh = 14;
    U.bar(g, bx, by, bw, bh, G.xp / G.xpNext, '#3f8fc4', 'rgba(8,6,12,0.9)', '#a6e2ff');
    g.fillStyle = 'rgba(8,6,12,0.55)';
    for (let i = 1; i < 10; i++) g.fillRect(bx + (bw * i) / 10, by, 1, bh);
    // selo do nível
    U.diamond(g, 48, 29, 36, '#1a1410', C.gold);
    U.diamond(g, 48, 29, 29, null, 'rgba(241,215,154,0.4)');
    U.label(g, '' + G.level, 48, 31, G.level >= 100 ? 20 : 26, C.goldLight, 'center', 0, 900);

    // ----- tempo (centro) e abates -----
    U.outlined(g, LD.fmtTime(G.time), W / 2, 80, 44, '#f6eedd');
    U.glyph(g, 'skull', 112, 80, 24, C.dim);
    U.outlined(g, '' + G.kills, 130, 81, 26, C.text, 'left', 'body');

    // ----- poderes e melhorias -----
    let x = 46;
    for (let i = 0; i < G.powers.length; i++) {
      const inst = G.powers[i];
      U.icon(g, inst.def, x, 140, 50);
      U.pips(g, x, 172, Math.min(inst.level, 8), inst.def.maxLevel, 2.6);
      x += 60;
    }
    x = W - 40;
    const ids = Object.keys(G.passives);
    for (let i = ids.length - 1; i >= 0; i--) {
      const def = LD.PASSIVE[ids[i]];
      U.icon(g, def, x, 140, 38);
      U.outlined(g, '' + G.passives[ids[i]], x + 14, 156, 15, C.goldLight, 'center', 'body');
      x -= 46;
    }

    // ----- chefe -----
    const boss = G.currentBoss();
    if (boss) {
      const w = W - 120, y = 214;
      U.label(g, boss.def.name.toUpperCase(), W / 2, y, 18, '#f0a890', 'center', 4);
      U.bar(g, 60, y + 18, w, 14, boss.hp / boss.maxHp, '#9e2a26', 'rgba(8,6,12,0.9)', '#e86a52');
      U.diamond(g, 52, y + 25, 8, '#1a1410', C.gold);
      U.diamond(g, 68 + w, y + 25, 8, '#1a1410', C.gold);
    }

    G.pauseBtn && U.drawButton(g, G.pauseBtn);

    // ----- avisos -----
    for (let i = 0; i < G.toasts.length; i++) {
      const t = G.toasts[i];
      const a = Math.min(1, t.t * 2, (t.life - t.t) * 4 + 0.2);
      g.globalAlpha = Math.max(0, a);
      const y = LD.H * 0.3 + i * 74;
      const col = t.color || C.goldLight;
      const gr = g.createLinearGradient(0, 0, W, 0);
      gr.addColorStop(0, 'rgba(8,6,12,0)');
      gr.addColorStop(0.2, 'rgba(8,6,12,0.85)');
      gr.addColorStop(0.8, 'rgba(8,6,12,0.85)');
      gr.addColorStop(1, 'rgba(8,6,12,0)');
      g.fillStyle = gr;
      g.fillRect(0, y - 30, W, 60);
      g.fillStyle = 'rgba(201,164,92,0.5)';
      g.fillRect(W * 0.15, y - 30, W * 0.7, 1);
      g.fillRect(W * 0.15, y + 29, W * 0.7, 1);
      const txt = t.text.toUpperCase();
      U.label(g, txt, W / 2, y + 1, LD.LevelUp.fit(g, txt, W * 0.86, 20), col, 'center', 3);
      g.globalAlpha = 1;
    }
  },
};
