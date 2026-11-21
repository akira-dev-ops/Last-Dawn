// Joystick virtual flutuante: aparece onde o dedo toca.
LD.Joystick = {
  active: false,
  id: null,
  bx: 0, by: 0, // base
  kx: 0, ky: 0, // manete
  dx: 0, dy: 0, // direção normalizada (-1..1)

  start(x, y, id) {
    if (this.active) return false;
    this.active = true;
    this.id = id;
    this.bx = this.kx = x;
    this.by = this.ky = y;
    this.dx = this.dy = 0;
    return true;
  },

  move(x, y, id) {
    if (!this.active || id !== this.id) return;
    const R = LD.CONFIG.joyRadius;
    let ox = x - this.bx, oy = y - this.by;
    const d = Math.hypot(ox, oy);
    if (d > R) {
      // a base "segue" o dedo quando passa do limite
      const k = (d - R) / d;
      this.bx += ox * k; this.by += oy * k;
      ox = x - this.bx; oy = y - this.by;
    }
    this.kx = x; this.ky = y;
    let nx = ox / R, ny = oy / R;
    const m = Math.hypot(nx, ny);
    if (m < LD.CONFIG.joyDeadzone) { nx = 0; ny = 0; }
    this.dx = nx; this.dy = ny;
  },

  end(id) {
    if (id !== undefined && id !== this.id) return;
    this.active = false;
    this.id = null;
    this.dx = this.dy = 0;
  },

  draw(g) {
    if (!this.active) return;
    const R = LD.CONFIG.joyRadius;
    g.globalAlpha = 0.35;
    g.fillStyle = '#000';
    g.beginPath(); g.arc(this.bx, this.by, R, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 0.6;
    g.lineWidth = 4;
    g.strokeStyle = '#fff';
    g.stroke();
    g.globalAlpha = 0.85;
    g.fillStyle = '#ffd9a0';
    g.beginPath(); g.arc(this.kx, this.ky, R * 0.42, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
  },
};
