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
    const cw = W - 70, ch = 210, gap = 24;
    const total = this.choices.length * ch + (this.choices.length - 1) * gap;
    let y = Math.max(250, (H - total) / 2 + 40);
    this.cards = this.choices.map(() => {
      const c = { x: 35, y, w: cw, h: ch };
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
    const W = LD.W, H = LD.H, U = LD.UI;
    g.fillStyle = 'rgba(5,2,12,0.72)';
    g.fillRect(0, 0, W, H);
    const s = 1 + Math.sin(this.t * 4) * 0.03;
    g.save();
    g.translate(W / 2, this.cards.length ? this.cards[0].y - 90 : H * 0.2);
    g.scale(s, s);
    U.outlined(g, 'Nível ' + G.level + '!', 0, 0, 64, '#ffd58a');
    g.restore();
    U.outlined(g, 'Escolha um poder', W / 2, (this.cards.length ? this.cards[0].y - 36 : H * 0.25), 28, '#e8dcff');

    g.globalAlpha = this.delay > 0 ? 0.6 : 1;
    for (let i = 0; i < this.cards.length; i++) {
      const c = this.cards[i], ch = this.choices[i];
      const def = ch.def;
      const isNew = ch.type !== 'heal' && ch.level === 1;
      const border = this.pressed === i ? '#ffffff' : (def.kind === 'passive' ? '#d8a84a' : '#8a6ad8');
      U.panel(g, c.x, c.y, c.w, c.h, this.pressed === i ? 'rgba(70,45,120,0.97)' : 'rgba(34,20,60,0.95)', border);
      U.icon(g, def, c.x + 72, c.y + 80, 96);
      U.text(g, def.name, c.x + 140, c.y + 46, 34, '#fff', 'left');
      let tag;
      if (ch.type === 'heal') tag = '';
      else if (isNew) tag = 'NOVO!';
      else tag = 'Nv ' + ch.level;
      if (tag) U.text(g, tag, c.x + c.w - 24, c.y + 46, 26, isNew ? LD.COLORS.accent : '#9fd8ff', 'right');
      const kindTxt = ch.type === 'power' ? 'Poder' : (ch.type === 'passive' ? 'Melhoria' : 'Item');
      U.text(g, kindTxt, c.x + 140, c.y + 84, 20, LD.COLORS.dim, 'left', 'normal');
      U.wrap(g, ch.text, c.x + 140, c.y + 108, c.w - 165, 24, '#e8dcff');
    }
    g.globalAlpha = 1;
  },
};
