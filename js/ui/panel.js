// Base para telas de menu com lista rolável (Conquistas, Coleção, Créditos...)
// Uso: LD.Panel.create({ title, contentHeight(), drawContent(g, top, w), extraButtons() })
LD.Panel = {
  create(def) {
    return Object.assign({}, this.base, def);
  },

  base: {
    enter() {
      this.t = 0;
      this.scroll = 0;
      this.vel = 0;
      this.drag = null;
      if (this.onEnter) this.onEnter();
      this.layout();
    },

    onResize() { this.layout(); },

    layout() {
      const W = LD.W, H = LD.H;
      this.view = { x: 30, y: 180, w: W - 60, h: H - 180 - 150 };
      this.buttons = [LD.UI.button(W / 2 - 180, H - 120, 360, 86, 'Voltar', () => LD.Engine.go(LD.MenuScene))];
      if (this.extraButtons) this.buttons = this.buttons.concat(this.extraButtons());
    },

    onKey(code) { if (code === 'Escape') LD.Engine.go(LD.MenuScene); },

    maxScroll() {
      const h = this.contentHeight ? this.contentHeight() : 0;
      return Math.max(0, h - this.view.h + 20);
    },

    onDown(x, y, id) {
      if (this.drag || !LD.UI.hit(this.view, x, y)) return;
      this.drag = { id, y, sy: y, moved: false, t: performance.now() };
      this.vel = 0;
    },

    onMove(x, y, id) {
      const d = this.drag;
      if (!d || d.id !== id) return;
      const dy = y - d.y;
      const now = performance.now();
      const dt = Math.max(1, now - d.t) / 1000;
      this.scroll -= dy;
      this.vel = -dy / dt;
      d.y = y; d.t = now;
      if (Math.abs(y - d.sy) > 12) d.moved = true;
    },

    onUp(x, y, id) {
      const d = this.drag;
      if (!d || d.id !== id) return;
      this.drag = null;
      if (!d.moved && this.onTap) this.onTap(x - this.view.x, y - this.view.y + this.scroll);
      if (performance.now() - d.t > 80) this.vel = 0;
    },

    update(dt) {
      this.t += dt;
      if (!this.drag) {
        this.scroll += this.vel * dt;
        this.vel *= Math.pow(0.04, dt);
        if (Math.abs(this.vel) < 5) this.vel = 0;
      }
      const max = this.maxScroll();
      if (this.scroll < 0) { this.scroll = 0; this.vel = 0; }
      if (this.scroll > max) { this.scroll = max; this.vel = 0; }
    },

    render(g) {
      const W = LD.W, H = LD.H, U = LD.UI, v = this.view;
      U.background(g, 'menuBg', this.t);
      g.fillStyle = 'rgba(8,4,16,0.55)';
      g.fillRect(0, 0, W, H);
      U.outlined(g, this.title, W / 2, 80, 60, '#ffd58a');
      if (this.subtitle) U.text(g, this.subtitle(), W / 2, 140, 26, '#e8dcff', 'center', 'normal');

      U.panel(g, v.x - 6, v.y - 6, v.w + 12, v.h + 12, 'rgba(20,12,36,0.88)');
      g.save();
      g.beginPath();
      g.rect(v.x, v.y, v.w, v.h);
      g.clip();
      this.drawContent(g, v.y - this.scroll, v.w, v.x);
      g.restore();

      // barra de rolagem
      const max = this.maxScroll();
      if (max > 0) {
        const total = v.h + max;
        const bh = Math.max(60, v.h * (v.h / total));
        const by = v.y + (v.h - bh) * (this.scroll / max);
        U.roundRect(g, v.x + v.w - 8, by, 6, bh, 3);
        g.fillStyle = 'rgba(255,255,255,0.35)';
        g.fill();
      }
      U.drawButtons(g, this.buttons);
    },
  },
};
