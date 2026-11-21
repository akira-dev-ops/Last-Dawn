// Teclado (para testar no computador): WASD / setas, Esc pausa.
LD.Keys = {
  down: {},
  init() {
    addEventListener('keydown', e => {
      this.down[e.code] = true;
      const s = LD.Engine.scene;
      if (s && s.onKey) s.onKey(e.code);
    });
    addEventListener('keyup', e => { this.down[e.code] = false; });
    addEventListener('blur', () => { this.down = {}; });
  },
  axis() {
    const d = this.down;
    let x = 0, y = 0;
    if (d.KeyA || d.ArrowLeft) x -= 1;
    if (d.KeyD || d.ArrowRight) x += 1;
    if (d.KeyW || d.ArrowUp) y -= 1;
    if (d.KeyS || d.ArrowDown) y += 1;
    if (x && y) { x *= 0.7071; y *= 0.7071; }
    return { x, y };
  },
};
