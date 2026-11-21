// Motor: canvas, escala para a tela, loop, cenas e toque.
LD.W = LD.CONFIG.width;
LD.H = 1280;

LD.Engine = {
  canvas: null,
  ctx: null,
  scene: null,
  scale: 1,
  time: 0,
  fps: 60,
  last: 0,

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.resize();
    addEventListener('resize', () => this.resize());
    addEventListener('orientationchange', () => setTimeout(() => this.resize(), 250));

    const c = this.canvas;
    c.addEventListener('pointerdown', e => this.pointer(e, 'down'), { passive: false });
    c.addEventListener('pointermove', e => this.pointer(e, 'move'), { passive: false });
    c.addEventListener('pointerup', e => this.pointer(e, 'up'), { passive: false });
    c.addEventListener('pointercancel', e => this.pointer(e, 'up'), { passive: false });
    c.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.scene && this.scene.onHide) this.scene.onHide();
    });

    this._loop = this.loop.bind(this);
    this.last = performance.now();
    requestAnimationFrame(this._loop);
  },

  // Largura lógica fixa (720); altura acompanha o formato da tela
  // para preencher celulares altos (ex.: 20:9) sem faixas pretas.
  resize() {
    const C = LD.CONFIG;
    const sw = window.innerWidth, sh = window.innerHeight;
    LD.H = Math.round(Math.max(C.minHeight, Math.min(C.maxHeight, LD.W * (sh / sw))));
    this.canvas.width = LD.W;
    this.canvas.height = LD.H;
    this.scale = Math.min(sw / LD.W, sh / LD.H);
    this.canvas.style.width = Math.floor(LD.W * this.scale) + 'px';
    this.canvas.style.height = Math.floor(LD.H * this.scale) + 'px';
    if (this.scene && this.scene.onResize) this.scene.onResize();
  },

  pointer(e, type) {
    e.preventDefault();
    const r = this.canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * LD.W / r.width;
    const y = (e.clientY - r.top) * LD.H / r.height;
    const id = e.pointerId;
    const s = this.scene;
    if (type === 'down') {
      try { this.canvas.setPointerCapture(id); } catch (err) { }
      LD.Audio.unlock();
    }
    if (!s) return;
    if (type === 'down') {
      if (s.buttons && LD.UI.pressButtons(s.buttons, x, y, id)) return;
      if (s.onDown) s.onDown(x, y, id);
    } else if (type === 'move') {
      if (s.onMove) s.onMove(x, y, id);
    } else {
      if (s.buttons && LD.UI.releaseButtons(s.buttons, x, y, id)) return;
      if (s.onUp) s.onUp(x, y, id);
    }
  },

  go(scene, params) {
    if (this.scene && this.scene.exit) this.scene.exit();
    this.scene = scene;
    if (scene.enter) scene.enter(params || {});
  },

  loop(t) {
    requestAnimationFrame(this._loop);
    let dt = (t - this.last) / 1000;
    this.last = t;
    if (dt > 0.05) dt = 0.05; // evita "saltos" após travadas
    if (dt < 0) dt = 0;
    this.time += dt;
    if (dt > 0) this.fps = this.fps * 0.95 + (1 / dt) * 0.05;
    const s = this.scene;
    if (!s) return;
    if (s.update) s.update(dt);
    s.render(this.ctx);
    if (LD.Save.data.settings.showFps) {
      const g = this.ctx;
      g.fillStyle = 'rgba(0,0,0,0.5)';
      g.fillRect(0, LD.H - 34, 110, 34);
      g.fillStyle = '#7f7';
      g.font = 'bold 22px monospace';
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText(Math.round(this.fps) + ' FPS', 8, LD.H - 17);
    }
  },
};
