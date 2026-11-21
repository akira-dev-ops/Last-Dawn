// Projéteis (Lâmina de Vento, Chama Espiral...)
LD.Projectile = {
  make() {
    return {
      kind: '', x: 0, y: 0, vx: 0, vy: 0, r: 10, dmg: 0, pierce: 1, life: 1, t: 0,
      color: '#fff', rot: 0,
      ang: 0, rad: 0, spin: 0, grow: 0, // espiral
      push: 0,
      hits: [], dead: false,
    };
  },

  reset(p) {
    p.t = 0; p.rot = 0; p.ang = 0; p.rad = 0; p.spin = 0; p.grow = 0; p.push = 140;
    p.vx = p.vy = 0;
    p.hits.length = 0;
    p.dead = false;
    return p;
  },

  draw(g, p) {
    if (p.kind === 'blade') {
      const s = p.r * 2.6;
      const spr = LD.Sprites.get('blade_' + Math.round(s) + p.color, s, s, (c, w) => {
        const m = w / 2;
        c.fillStyle = p.color;
        c.beginPath();
        c.arc(m, m, m * 0.9, -1.25, 1.25);
        c.arc(m - m * 0.35, m, m * 0.75, 1.1, -1.1, true);
        c.closePath();
        c.fill();
        c.fillStyle = 'rgba(255,255,255,0.85)';
        c.beginPath();
        c.arc(m, m, m * 0.8, -0.9, 0.9);
        c.arc(m - m * 0.15, m, m * 0.72, 0.85, -0.85, true);
        c.closePath();
        c.fill();
      });
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.drawImage(spr, -s / 2, -s / 2);
      g.restore();
    } else {
      const s = p.r * 2.4;
      const spr = LD.Sprites.glow(p.color, s / 2, '#fff6d0');
      g.drawImage(spr, p.x - s / 2, p.y - s / 2);
    }
  },
};

// Itens coletáveis: gemas de XP e corações
LD.Pickup = {
  make() { return { kind: 'gem', x: 0, y: 0, value: 1, pulled: false, vx: 0, vy: 0, t: 0, dead: false }; },

  gemColor(v) {
    if (v >= 50) return '#ff5470';
    if (v >= 10) return '#ffcf4a';
    if (v >= 4) return '#6bdc8b';
    return '#58c7ff';
  },

  draw(g, it, time) {
    if (it.kind === 'heart') {
      const img = LD.Assets.img('heart');
      const s = 30;
      if (img) { g.drawImage(img, it.x - s / 2, it.y - s / 2, s, s); return; }
      const spr = LD.Sprites.get('heart', s, s, (c, w) => {
        c.fillStyle = '#ff4d6d';
        c.strokeStyle = '#fff';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(w / 2, w * 0.85);
        c.bezierCurveTo(-w * 0.1, w * 0.4, w * 0.2, -w * 0.05, w / 2, w * 0.28);
        c.bezierCurveTo(w * 0.8, -w * 0.05, w * 1.1, w * 0.4, w / 2, w * 0.85);
        c.fill(); c.stroke();
      });
      g.drawImage(spr, it.x - s / 2, it.y - s / 2 + Math.sin(time * 4 + it.x) * 2);
      return;
    }
    const big = it.value >= 10;
    const s = big ? 26 : 18;
    const color = this.gemColor(it.value);
    const img = LD.Assets.img('gem');
    if (img) { g.drawImage(img, it.x - s / 2, it.y - s / 2, s, s); return; }
    const spr = LD.Sprites.get('gem_' + color + s, s, s, (c, w) => {
      c.fillStyle = color;
      c.strokeStyle = 'rgba(255,255,255,0.9)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(w / 2, 1); c.lineTo(w - 3, w / 2); c.lineTo(w / 2, w - 1); c.lineTo(3, w / 2);
      c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.6)';
      c.beginPath(); c.moveTo(w / 2, 4); c.lineTo(w * 0.7, w / 2); c.lineTo(w / 2, w * 0.45); c.closePath(); c.fill();
    });
    g.drawImage(spr, it.x - s / 2, it.y - s / 2);
  },
};

// Efeitos visuais (raio, explosões, ondas, partículas, textos de dano)
LD.Effect = {
  make() {
    return { kind: '', x: 0, y: 0, t: 0, life: 0.3, r: 0, r2: 0, color: '#fff', dmg: 0, str: '',
      n: 0, pts: new Float32Array(48), done: false, dead: false };
  },

  draw(g, e) {
    const k = e.t / e.life;
    switch (e.kind) {
      case 'puff': {
        g.globalAlpha = 1 - k;
        g.fillStyle = e.color;
        g.beginPath(); g.arc(e.x, e.y, e.r * (0.6 + k), 0, Math.PI * 2); g.fill();
        g.globalAlpha = 1;
        break;
      }
      case 'lightning': {
        g.globalAlpha = 1 - k;
        g.strokeStyle = e.color;
        g.lineWidth = 6;
        this.zigzag(g, e);
        g.strokeStyle = '#fff';
        g.lineWidth = 2;
        this.zigzag(g, e);
        g.globalAlpha = 1;
        break;
      }
      case 'ring': {
        g.globalAlpha = Math.max(0, 1 - k);
        g.strokeStyle = e.color;
        g.lineWidth = 14 * (1 - k) + 3;
        g.beginPath(); g.arc(e.x, e.y, Math.max(1, e.r), 0, Math.PI * 2); g.stroke();
        g.globalAlpha = 1;
        break;
      }
      case 'boom': {
        g.globalAlpha = Math.max(0, 1 - k);
        const spr = LD.Sprites.glow(e.color, 64, '#ffffff');
        const s = e.r * 2 * (0.6 + k * 0.6);
        g.drawImage(spr, e.x - s / 2, e.y - s / 2, s, s);
        g.globalAlpha = 1;
        break;
      }
      case 'star': {
        // marcador no chão + estrela caindo
        const fall = Math.min(1, e.t / e.r2);
        g.globalAlpha = 0.5;
        g.strokeStyle = e.color;
        g.lineWidth = 3;
        g.beginPath(); g.arc(e.x, e.y, e.r * (1.1 - fall * 0.3), 0, Math.PI * 2); g.stroke();
        g.globalAlpha = 1;
        const sy = e.y - (1 - fall) * 500;
        const spr = LD.Sprites.glow(e.color, 26, '#ffffff');
        g.drawImage(spr, e.x - 26 + (1 - fall) * 120, sy - 26);
        break;
      }
      case 'text': {
        const a = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
        g.globalAlpha = a;
        LD.UI.outlined(g, e.str, e.x, e.y - k * 40, e.r, e.color);
        g.globalAlpha = 1;
        break;
      }
    }
  },

  zigzag(g, e) {
    g.beginPath();
    g.moveTo(e.pts[0], e.pts[1]);
    for (let i = 1; i < e.n; i++) {
      const x0 = e.pts[(i - 1) * 2], y0 = e.pts[(i - 1) * 2 + 1];
      const x1 = e.pts[i * 2], y1 = e.pts[i * 2 + 1];
      const mx = (x0 + x1) / 2 + (Math.random() - 0.5) * 40;
      const my = (y0 + y1) / 2 + (Math.random() - 0.5) * 40;
      g.lineTo(mx, my);
      g.lineTo(x1, y1);
    }
    g.stroke();
  },
};
