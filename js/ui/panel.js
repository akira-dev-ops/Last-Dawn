// Base para telas de menu com conteúdo rolável (Conquistas, Coleção, Créditos...)
// Uso: LD.Panel.create({ title, subtitle(), contentHeight(), drawContent(g, top, w, left), onTap(x, y) })
LD.Panel = {
  create(def) {
    return Object.assign({}, this.base, def);
  },

  base: {
    bottomSpace: 0, // espaço reservado abaixo da lista (ex.: painel de detalhes)

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
      const top = this.hasSubtitle === false ? 160 : 196;
      this.view = { x: 36, y: top, w: W - 72, h: H - top - 44 - this.bottomSpace };
      this.buttons = [LD.UI.backButton(() => LD.Engine.go(LD.MenuScene))];
      if (this.extraButtons) this.buttons = this.buttons.concat(this.extraButtons());
    },

    onKey(code) { if (code === 'Escape') LD.Engine.go(LD.MenuScene); },

    maxScroll() {
      const h = this.contentHeight ? this.contentHeight() : 0;
      return Math.max(0, h - this.view.h + 10);
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
      if (Math.abs(y - d.sy) > 12) d.moved = true;
      if (d.moved) {
        this.scroll -= dy;
        this.vel = -dy / dt;
      }
      d.y = y; d.t = now;
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
      const W = LD.W, U = LD.UI, v = this.view;
      U.background(g, 'menuBg', this.t);
      g.fillStyle = 'rgba(7,5,10,0.62)';
      g.fillRect(0, 0, W, LD.H);
      U.vignette(g, 0);
      U.header(g, this.title, this.subtitle ? this.subtitle() : null);

      U.frame(g, v.x - 8, v.y - 8, v.w + 16, v.h + 16, { fill: 'rgba(10,8,14,0.82)' });
      g.save();
      g.beginPath();
      g.rect(v.x, v.y, v.w, v.h);
      g.clip();
      this.drawContent(g, v.y - this.scroll, v.w, v.x);
      g.restore();

      // sombras de rolagem (indicam que há mais conteúdo)
      const max = this.maxScroll();
      if (max > 0) {
        if (this.scroll > 2) this.fade(g, v.y, 1);
        if (this.scroll < max - 2) this.fade(g, v.y + v.h, -1);
        const total = v.h + max;
        const bh = Math.max(50, v.h * (v.h / total));
        const by = v.y + (v.h - bh) * (this.scroll / max);
        g.fillStyle = 'rgba(201,164,92,0.5)';
        g.fillRect(v.x + v.w + 1, by, 3, bh);
      }
      if (this.drawFixed) this.drawFixed(g);
      U.drawButtons(g, this.buttons);
    },

    fade(g, y, dir) {
      const v = this.view, h = 36;
      const gr = g.createLinearGradient(0, y, 0, y + h * dir);
      gr.addColorStop(0, 'rgba(10,8,14,0.95)');
      gr.addColorStop(1, 'rgba(10,8,14,0)');
      g.fillStyle = gr;
      g.fillRect(v.x, dir > 0 ? y : y - h, v.w, h);
    },
  },
};
