// Telas do menu: Conquistas, Coleção, Loja, Créditos
// (Configurações fica em settings.js)

// ---------------- Conquistas ----------------
LD.AchievementsScene = LD.Panel.create({
  title: 'CONQUISTAS',
  rowH: 108,

  subtitle() {
    const n = Object.keys(LD.Save.data.achievements).length;
    return n + ' de ' + LD.ACHIEVEMENTS.length + ' desbloqueadas';
  },

  // desbloqueadas primeiro
  ordered() {
    const got = LD.Save.data.achievements;
    return LD.ACHIEVEMENTS.slice().sort((a, b) => (got[b.id] ? 1 : 0) - (got[a.id] ? 1 : 0));
  },

  contentHeight() { return LD.ACHIEVEMENTS.length * this.rowH; },

  drawContent(g, top, w, left) {
    const U = LD.UI, C = LD.COLORS, got = LD.Save.data.achievements;
    let y = top;
    const list = this.ordered();
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (y > -this.rowH && y < LD.H) {
        const ok = !!got[a.id];
        const cy = y + this.rowH / 2;
        if (ok) {
          const gr = g.createLinearGradient(left, 0, left + w, 0);
          gr.addColorStop(0, 'rgba(201,164,92,0.16)');
          gr.addColorStop(1, 'rgba(201,164,92,0)');
          g.fillStyle = gr;
          g.fillRect(left, y + 6, w, this.rowH - 12);
        }
        // medalha em losango
        const mx = left + 56;
        U.diamond(g, mx, cy, 34, ok ? '#3a2a14' : '#17131c', ok ? C.gold : '#3e3746');
        U.diamond(g, mx, cy, 27, null, ok ? 'rgba(241,215,154,0.35)' : 'rgba(255,255,255,0.05)');
        U.glyph(g, ok ? 'trophy' : 'lock', mx, cy, 28, ok ? C.goldLight : '#5d5664');
        U.label(g, a.name.toUpperCase(), left + 110, cy - 16, 21, ok ? C.goldLight : '#8a8174', 'left', 2);
        U.text(g, a.desc, left + 110, cy + 16, 22, ok ? C.text : C.muted, 'left', 400);
        if (i < list.length - 1) {
          g.fillStyle = 'rgba(201,164,92,0.14)';
          g.fillRect(left + 20, y + this.rowH - 1, w - 40, 1);
        }
      }
      y += this.rowH;
    }
  },
});

// ---------------- Coleção (grade + detalhes) ----------------
LD.CollectionScene = LD.Panel.create({
  title: 'COLEÇÃO',
  bottomSpace: 210,
  cols: 4,
  cellH: 156,
  headH: 58,

  onEnter() {
    this.sections = [
      { title: 'PODERES', items: LD.POWERS },
      { title: 'MELHORIAS', items: LD.PASSIVES },
    ];
    const col = LD.Save.data.collection;
    this.selected = LD.POWERS.concat(LD.PASSIVES).find(d => col[d.id]) || null;
  },

  subtitle() {
    const col = LD.Save.data.collection;
    const all = LD.POWERS.concat(LD.PASSIVES);
    return all.filter(d => col[d.id]).length + ' de ' + all.length + ' descobertos';
  },

  rows(n) { return Math.ceil(n / this.cols); },

  contentHeight() {
    let h = 0;
    for (const s of this.sections) h += this.headH + this.rows(s.items.length) * this.cellH;
    return h + 10;
  },

  // percorre as células chamando fn(def, x, y, w)
  eachCell(top, w, left, fn) {
    const cw = w / this.cols;
    let y = top;
    for (const s of this.sections) {
      fn(null, left, y, w, s.title);
      y += this.headH;
      s.items.forEach((d, i) => {
        const cx = left + (i % this.cols) * cw;
        const cy = y + Math.floor(i / this.cols) * this.cellH;
        fn(d, cx, cy, cw);
      });
      y += this.rows(s.items.length) * this.cellH;
    }
  },

  onTap(x, y) {
    const col = LD.Save.data.collection;
    this.eachCell(0, this.view.w, 0, (d, cx, cy, cw) => {
      if (!d) return;
      if (x >= cx && x < cx + cw && y >= cy && y < cy + this.cellH) {
        this.selected = d;
        if (!col[d.id]) this.selected = { locked: true, def: d };
        LD.Audio.play('click');
      }
    });
  },

  drawContent(g, top, w, left) {
    const U = LD.UI, C = LD.COLORS, col = LD.Save.data.collection;
    this.eachCell(top, w, left, (d, cx, cy, cw, title) => {
      if (!d) {
        U.label(g, title, left + w / 2, cy + 32, 20, C.gold, 'center', 5);
        g.fillStyle = 'rgba(201,164,92,0.25)';
        g.fillRect(left + 30, cy + 52, w / 2 - 110, 1);
        g.fillRect(left + w / 2 + 80, cy + 52, w / 2 - 110, 1);
        return;
      }
      if (cy < -this.cellH || cy > LD.H) return;
      const ok = !!col[d.id];
      const sel = this.selected && (this.selected === d || this.selected.def === d);
      const ix = cx + cw / 2, iy = cy + 58;
      if (sel) {
        g.fillStyle = 'rgba(201,164,92,0.12)';
        U.chamfer(g, cx + 6, cy + 4, cw - 12, this.cellH - 8, 10);
        g.fill();
        g.lineWidth = 1.5; g.strokeStyle = 'rgba(241,215,154,0.6)'; g.stroke();
      }
      U.icon(g, d, ix, iy, 86, !ok);
      const name = ok ? d.name : '???';
      g.font = U.font(18, 500);
      g.fillStyle = ok ? C.text : C.muted;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      // nome em até 2 linhas
      const words = name.split(' ');
      let l1 = '', l2 = '';
      for (const wd of words) {
        if (!l2 && g.measureText((l1 ? l1 + ' ' : '') + wd).width <= cw - 16) l1 = (l1 ? l1 + ' ' : '') + wd;
        else l2 = (l2 ? l2 + ' ' : '') + wd;
      }
      g.fillText(l1, ix, cy + 108);
      if (l2) g.fillText(l2, ix, cy + 128);
    });
  },

  drawFixed(g) {
    const U = LD.UI, C = LD.COLORS, v = this.view;
    const x = v.x - 8, y = v.y + v.h + 22, w = v.w + 16, h = this.bottomSpace - 30;
    U.frame(g, x, y, w, h, { fill: 'rgba(10,8,14,0.9)', ornaments: true });
    const s = this.selected;
    if (!s) {
      U.text(g, 'Escolha poderes nas partidas para descobri-los.', x + w / 2, y + h / 2, 22, C.dim, 'center', 400);
      return;
    }
    if (s.locked) {
      U.icon(g, s.def, x + 72, y + h / 2, 84, true);
      U.label(g, 'NÃO DESCOBERTO', x + 136, y + 50, 22, '#8a8174', 'left', 3);
      U.wrap(g, 'Escolha este ' + (s.def.kind === 'power' ? 'poder' : 'item') + ' ao subir de nível em uma partida para revelá-lo.',
        x + 136, y + 76, w - 160, 21, C.muted);
      return;
    }
    U.icon(g, s, x + 72, y + h / 2, 84);
    U.label(g, s.name.toUpperCase(), x + 136, y + 40, 23, C.goldLight, 'left', 2);
    U.label(g, (s.kind === 'power' ? 'PODER' : 'MELHORIA') + '  ·  NÍVEL MÁX. ' + s.maxLevel, x + 136, y + 70, 14, C.gold, 'left', 3, 600);
    U.wrap(g, s.desc, x + 136, y + 90, w - 160, 21, C.text);
  },
});

// ---------------- Loja ----------------
LD.ShopScene = LD.Panel.create({
  title: 'LOJA',
  hasSubtitle: false,
  contentHeight() { return 0; },
  drawContent(g, top, w, left) {
    const U = LD.UI, C = LD.COLORS, cy = this.view.y + this.view.h / 2;
    const s = 1 + Math.sin(this.t * 2) * 0.03;
    g.save();
    g.translate(left + w / 2, cy - 110);
    g.scale(s, s);
    g.drawImage(LD.Sprites.glow('#c9a45c', 110, '#fff1d0'), -110, -110);
    g.restore();
    U.glyph(g, 'coin', left + w / 2, cy - 110, 96, '#2a1a08');
    U.label(g, 'EM BREVE', left + w / 2, cy + 40, 48, C.goldLight, 'center', 8);
    U.divider(g, left + w / 2, cy + 86, 260);
    U.text(g, 'Novos visuais e itens estão a caminho.', left + w / 2, cy + 126, 24, C.dim, 'center', 400);
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
  ['t', 'HTML5 Canvas + JavaScript puro'],
  ['t', 'com a ajuda do Claude (Anthropic)'],
  ['s', ''],
  ['h', 'Arte'],
  ['t', 'Ilustrações de fundo: Last Dawn'],
  ['t', 'Personagens: formas provisórias'],
  ['s', ''],
  ['h', 'Fontes'],
  ['t', 'Cinzel — Natanael Gama'],
  ['t', 'Alegreya Sans — Huerta Tipográfica'],
  ['t', '(SIL Open Font License)'],
  ['s', ''],
  ['h', 'Agradecimentos'],
  ['t', 'A todos que sobreviveram até o amanhecer.'],
];

LD.CreditsScene = LD.Panel.create({
  title: 'CRÉDITOS',
  hasSubtitle: false,
  contentHeight() {
    let h = 40;
    for (const l of LD.CREDITS) h += l[0] === 'h' ? 58 : (l[0] === 's' ? 22 : 36);
    return h;
  },
  drawContent(g, top, w, left) {
    const U = LD.UI, C = LD.COLORS;
    let y = top + 44;
    for (const l of LD.CREDITS) {
      if (l[0] === 'h') { U.label(g, l[1].toUpperCase(), left + w / 2, y, 21, C.gold, 'center', 4); y += 58; }
      else if (l[0] === 's') { U.diamond(g, left + w / 2, y - 10, 3, 'rgba(201,164,92,0.5)'); y += 22; }
      else { U.text(g, l[1], left + w / 2, y - 18, 24, C.text, 'center', 400); y += 36; }
    }
  },
});
