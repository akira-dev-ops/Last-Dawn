// Tela de "subiu de nível": escolha 1 de 3 poderes/melhorias.
LD.LevelUp = {
  choices: [],
  cards: [],
  delay: 0,
  pressed: -1,
  t: 0,

  open(G) {
    this.choices = G.buildChoices(3);
    this.delay = 0.45; // evita escolher sem querer enquanto move o dedo
    this.pressed = -1;
    this.pid = null;
    this.t = 0;
    this.layout();
  },

  layout() {
    const W = LD.W, H = LD.H;
    const cw = W - 64, ch = 200, gap = 22;
    const total = this.choices.length * ch + (this.choices.length - 1) * gap;
    let y = Math.max(270, (H - total) / 2 + 50);
    this.cards = this.choices.map(() => {
      const c = { x: 32, y, w: cw, h: ch };
      y += ch + gap;
      return c;
    });
  },

  update(dt) { this.delay -= dt; this.t += dt; },

  onDown(x, y, id) {
    if (this.delay > 0) return;
    for (let i = 0; i < this.cards.length; i++) {
      if (LD.UI.hit(this.cards[i], x, y)) { this.pressed = i; this.pid = id; return; }
    }
  },

  // Retorna a escolha confirmada (ou null)
  onUp(x, y, id) {
    if (this.pressed < 0 || id !== this.pid) return null;
    const i = this.pressed;
    this.pressed = -1;
    if (LD.UI.hit(this.cards[i], x, y)) {
      LD.Audio.play('click');
      LD.vibrate(15);
      return this.choices[i];
    }
    return null;
  },

  draw(g, G) {
    const W = LD.W, H = LD.H, U = LD.UI, C = LD.COLORS;
    g.fillStyle = 'rgba(5,3,8,0.8)';
    g.fillRect(0, 0, W, H);

    const top = this.cards.length ? this.cards[0].y : H * 0.3;
    const k = Math.min(1, this.t / 0.25);
    // título
    g.save();
    g.globalAlpha = k;
    g.drawImage(LD.Sprites.glow('#c98d3c', 150, '#5a3a14'), W / 2 - 150, top - 250, 300, 300);
    U.label(g, 'NÍVEL ' + G.level, W / 2, top - 112, 58, C.goldLight, 'center', 6, 900);
    U.divider(g, W / 2, top - 66, 340);
    U.label(g, 'ESCOLHA UMA DÁDIVA', W / 2, top - 36, 17, C.dim, 'center', 5, 600);
    g.restore();

    for (let i = 0; i < this.cards.length; i++) {
      const c = this.cards[i], ch = this.choices[i], def = ch.def;
      // cartas entram em sequência
      const ki = Math.max(0, Math.min(1, (this.t - 0.05 - i * 0.07) / 0.22));
      if (ki <= 0) continue;
      const off = (1 - ki) * 40;
      const pressed = this.pressed === i;
      const ready = this.delay <= 0;
      g.globalAlpha = ki * (ready ? 1 : 0.65);
      const x = c.x, y = c.y + off;

      const isPassive = def.kind === 'passive';
      const isNew = ch.type !== 'heal' && ch.level === 1;
      const accent = isPassive ? '#d9d2c4' : C.gold;

      // corpo
      U.chamfer(g, x, y, c.w, c.h, 18);
      const gr = g.createLinearGradient(x, 0, x + c.w, 0);
      gr.addColorStop(0, pressed ? 'rgba(70,50,30,0.98)' : 'rgba(30,23,26,0.97)');
      gr.addColorStop(1, pressed ? 'rgba(40,28,20,0.98)' : 'rgba(14,11,17,0.97)');
      g.fillStyle = gr;
      g.fill();
      g.lineWidth = pressed ? 3 : 2;
      g.strokeStyle = pressed ? C.goldLight : accent;
      g.stroke();
      // faixa de cor do poder à esquerda
      g.save();
      U.chamfer(g, x, y, c.w, c.h, 18);
      g.clip();
      const sg = g.createLinearGradient(x, 0, x + 200, 0);
      sg.addColorStop(0, U.mix(def.color, '#0d0a12', 0.55));
      sg.addColorStop(1, 'rgba(13,10,18,0)');
      g.fillStyle = sg;
      g.fillRect(x, y, 200, c.h);
      g.restore();
      U.chamfer(g, x + 6, y + 6, c.w - 12, c.h - 12, 13);
      g.lineWidth = 1;
      g.strokeStyle = 'rgba(201,164,92,0.22)';
      g.stroke();

      // ícone
      U.icon(g, def, x + 90, y + c.h / 2 - 8, 112);
      if (ch.type !== 'heal') {
        U.pips(g, x + 90, y + c.h - 26, ch.level, def.maxLevel || 1, 4.2, 'center', true);
      }

      // textos
      const tx = x + 172;
      const kind = ch.type === 'power' ? 'PODER' : (ch.type === 'passive' ? 'MELHORIA' : 'ITEM');
      U.label(g, kind, tx, y + 36, 14, isPassive ? '#bdb4a4' : C.gold, 'left', 4, 600);
      U.label(g, def.name.toUpperCase(), tx, y + 70, this.fit(g, def.name.toUpperCase(), c.w - 200, 27), C.text, 'left', 2);
      U.wrap(g, ch.text, tx, y + 96, c.w - 196, 22, '#d5cbb9', 'left', 26);

      // etiqueta NOVO / nível
      if (isNew) {
        U.frame(g, x + c.w - 104, y + 20, 84, 30, { c: 7, fill: '#8a3a1a', border: '#f0c070', inner: false });
        U.label(g, 'NOVO', x + c.w - 62, y + 36, 14, '#fff2dc', 'center', 3);
      } else if (ch.type !== 'heal') {
        U.label(g, 'NV ' + ch.level, x + c.w - 28, y + 36, 16, C.goldLight, 'right', 3);
      }
    }
    g.globalAlpha = 1;
  },

  // reduz o tamanho do título até caber
  fit(g, str, maxW, size) {
    let s = size;
    while (s > 16) {
      g.font = LD.UI.font(s, 700, 'display');
      if (g.measureText(str).width + str.length * 2 <= maxW) break;
      s -= 1;
    }
    return s;
  },
};
