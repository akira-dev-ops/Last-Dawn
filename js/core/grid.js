// Grade espacial ao redor do jogador: acelera colisões (sem alocar memória).
LD.Grid = {
  init() {
    const C = LD.CONFIG;
    this.cell = C.gridCell;
    this.n = C.gridSize;
    this.head = new Int32Array(this.n * this.n);
    this.next = new Int32Array(C.maxEnemies + 32);
    this.list = null;
    this.ox = 0; this.oy = 0;
    this.out = [];
  },

  build(list, cx, cy) {
    const n = this.n, cell = this.cell;
    this.list = list;
    this.head.fill(-1);
    this.ox = cx - (n * cell) / 2;
    this.oy = cy - (n * cell) / 2;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      const gx = ((e.x - this.ox) / cell) | 0;
      const gy = ((e.y - this.oy) / cell) | 0;
      if (gx < 0 || gy < 0 || gx >= n || gy >= n || e.x < this.ox || e.y < this.oy) { this.next[i] = -1; continue; }
      const idx = gy * n + gx;
      this.next[i] = this.head[idx];
      this.head[idx] = i;
    }
  },

  // Inimigos cujas células tocam o círculo (x,y,r). Reutiliza o array de saída.
  query(x, y, r) {
    const out = this.out;
    out.length = 0;
    const n = this.n, cell = this.cell, list = this.list;
    if (!list) return out;
    let x0 = ((x - r - this.ox) / cell) | 0, x1 = ((x + r - this.ox) / cell) | 0;
    let y0 = ((y - r - this.oy) / cell) | 0, y1 = ((y + r - this.oy) / cell) | 0;
    if (x1 < 0 || y1 < 0 || x0 >= n || y0 >= n) return out;
    if (x0 < 0) x0 = 0; if (y0 < 0) y0 = 0;
    if (x1 >= n) x1 = n - 1; if (y1 >= n) y1 = n - 1;
    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        for (let j = this.head[gy * n + gx]; j !== -1; j = this.next[j]) {
          const e = list[j];
          if (!e.dead) out.push(e);
        }
      }
    }
    return out;
  },
};
