// Telas do menu: Conquistas, Coleção, Loja, Créditos
// (Configurações fica em settings.js)

// ---------------- Conquistas ----------------
LD.AchievementsScene = LD.Panel.create({
  title: 'Conquistas',
  rowH: 112,

  subtitle() {
    const n = Object.keys(LD.Save.data.achievements).length;
    return n + ' de ' + LD.ACHIEVEMENTS.length + ' desbloqueadas';
  },

  contentHeight() { return LD.ACHIEVEMENTS.length * this.rowH + 10; },

  drawContent(g, top, w, left) {
    const U = LD.UI, got = LD.Save.data.achievements;
    let y = top + 10;
    for (const a of LD.ACHIEVEMENTS) {
      if (y > -this.rowH && y < LD.H) {
        const ok = !!got[a.id];
        U.roundRect(g, left + 10, y, w - 20, this.rowH - 12, 16);
        g.fillStyle = ok ? 'rgba(255,190,90,0.16)' : 'rgba(255,255,255,0.05)';
        g.fill();
        // medalha
        const cx = left + 62, cy = y + (this.rowH - 12) / 2;
        g.beginPath(); g.arc(cx, cy, 32, 0, Math.PI * 2);
        g.fillStyle = ok ? '#ffb347' : '#3b3350';
        g.fill();
        g.lineWidth = 3; g.strokeStyle = ok ? '#fff2c8' : '#5a5270'; g.stroke();
        U.text(g, ok ? '★' : '?', cx, cy + 2, 34, ok ? '#fff' : '#888');
        U.text(g, a.name, left + 112, y + 32, 30, ok ? '#fff' : '#a8a0b8', 'left');
        U.wrap(g, a.desc, left + 112, y + 54, w - 150, 22, ok ? '#e8dcff' : '#8a829a');
      }
      y += this.rowH;
    }
  },
});

// ---------------- Coleção ----------------
LD.CollectionScene = LD.Panel.create({
  title: 'Coleção',
  rowH: 124,

  onEnter() {
    this.entries = [{ header: 'Poderes' }].concat(LD.POWERS.map(d => ({ def: d })),
      [{ header: 'Melhorias' }], LD.PASSIVES.map(d => ({ def: d })));
  },

  subtitle() {
    const col = LD.Save.data.collection;
    const all = LD.POWERS.concat(LD.PASSIVES);
    const n = all.filter(d => col[d.id]).length;
    return n + ' de ' + all.length + ' descobertos';
  },

  contentHeight() {
    let h = 10;
    for (const e of this.entries) h += e.header ? 64 : this.rowH;
    return h;
  },

  drawContent(g, top, w, left) {
    const U = LD.UI, col = LD.Save.data.collection;
    let y = top + 10;
    for (const e of this.entries) {
      if (e.header) {
        U.text(g, e.header, left + w / 2, y + 30, 32, LD.COLORS.accent);
        y += 64;
        continue;
      }
      if (y > -this.rowH && y < LD.H) {
        const d = e.def, ok = !!col[d.id];
        U.roundRect(g, left + 10, y, w - 20, this.rowH - 12, 16);
        g.fillStyle = ok ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)';
        g.fill();
        U.icon(g, d, left + 62, y + (this.rowH - 12) / 2, 72, !ok);
        if (ok) {
          U.text(g, d.name, left + 115, y + 30, 30, '#fff', 'left');
          const extra = d.kind === 'power' ? '  (máx. Nv ' + d.maxLevel + ')' : '  (máx. Nv ' + d.max + ')';
          U.wrap(g, d.desc + extra, left + 115, y + 52, w - 150, 21, '#d8ccf0');
        } else {
          U.text(g, '???', left + 115, y + 34, 30, '#8a829a', 'left');
          U.text(g, 'Escolha este item em uma partida para descobri-lo.', left + 115, y + 72, 20, '#6a6280', 'left', 'normal');
        }
      }
      y += this.rowH;
    }
  },
});

// ---------------- Loja ----------------
LD.ShopScene = LD.Panel.create({
  title: 'Loja',
  contentHeight() { return 0; },
  drawContent(g, top, w, left) {
    const U = LD.UI, cy = this.view.y + this.view.h / 2;
    const s = 1 + Math.sin(this.t * 2) * 0.04;
    g.save();
    g.translate(left + w / 2, cy - 90);
    g.scale(s, s);
    const spr = LD.Sprites.glow('#ffb347', 90, '#fff4d0');
    g.drawImage(spr, -90, -90);
    g.restore();
    U.outlined(g, 'Em breve', left + w / 2, cy + 50, 64, '#ffd58a');
    U.text(g, 'Novos visuais e itens estão a caminho.', left + w / 2, cy + 120, 26, '#e8dcff', 'center', 'normal');
  },
});

// ---------------- Créditos ----------------
LD.CREDITS = [
  ['h', 'Last Dawn'],
  ['t', 'Um jogo de sobrevivência contra hordas.'],
  ['s', ''],
  ['h', 'Criação e direção'],
  ['t', 'Você!'],
  ['s', ''],
  ['h', 'Programação'],
  ['t', 'Feito em HTML5 Canvas + JavaScript puro'],
  ['t', 'com a ajuda do Claude (Anthropic)'],
  ['s', ''],
  ['h', 'Arte e som'],
  ['t', 'Placeholders gerados por código'],
  ['t', '(troque em js/data/assets.js)'],
  ['s', ''],
  ['h', 'Agradecimentos'],
  ['t', 'A todos que sobreviveram até o amanhecer.'],
  ['s', ''],
  ['t', 'Obrigado por jogar!'],
];

LD.CreditsScene = LD.Panel.create({
  title: 'Créditos',
  contentHeight() {
    let h = 30;
    for (const l of LD.CREDITS) h += l[0] === 'h' ? 56 : (l[0] === 's' ? 24 : 40);
    return h;
  },
  drawContent(g, top, w, left) {
    const U = LD.UI;
    let y = top + 40;
    for (const l of LD.CREDITS) {
      if (l[0] === 'h') { U.text(g, l[1], left + w / 2, y, 34, LD.COLORS.accent); y += 56; }
      else if (l[0] === 's') y += 24;
      else { U.text(g, l[1], left + w / 2, y, 26, '#e8dcff', 'center', 'normal'); y += 40; }
    }
  },
});
