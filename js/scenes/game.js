// Tela 3: Jogo (esqueleto — jogador, joystick e inimigo básico)
LD.GameScene = {
  enter() {
    this.player = LD.Player.create();
    this.enemies = [];
    this.time = 0;
    this.spawnT = 0;
    this.cam = { x: -LD.W / 2, y: -LD.H / 2 };
    LD.Joystick.end();
  },

  onDown(x, y, id) { LD.Joystick.start(x, y, id); },
  onMove(x, y, id) { LD.Joystick.move(x, y, id); },
  onUp(x, y, id) { LD.Joystick.end(id); },

  update(dt) {
    const p = this.player;
    this.time += dt;
    const k = LD.Keys.axis();
    const ix = LD.Joystick.active ? LD.Joystick.dx : k.x;
    const iy = LD.Joystick.active ? LD.Joystick.dy : k.y;
    LD.Player.update(p, dt, ix, iy);
    this.cam.x = p.x - LD.W / 2;
    this.cam.y = p.y - LD.H / 2;

    this.spawnT -= dt;
    if (this.spawnT <= 0 && this.enemies.length < 30) {
      this.spawnT = 1;
      const a = Math.random() * Math.PI * 2, d = Math.hypot(LD.W, LD.H) / 2 + 60;
      this.enemies.push(LD.Enemy.spawn(LD.Enemy.make(), LD.ENEMY.slime,
        p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, { hp: 1, dmg: 1, speed: 1 }));
    }
    for (const e of this.enemies) {
      e.t += dt;
      const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
      e.x += dx / d * e.speed * dt;
      e.y += dy / d * e.speed * dt;
      if (d < e.r + p.r && p.iframes <= 0) {
        p.hp -= e.dmg;
        p.iframes = LD.CONFIG.playerIFrames;
        LD.vibrate(30);
        if (p.hp <= 0) LD.Engine.go(LD.MenuScene);
      }
    }
  },

  render(g) {
    const W = LD.W, H = LD.H, cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
    g.fillStyle = '#1b2a1f';
    g.fillRect(0, 0, W, H);
    g.save();
    g.translate(-cx, -cy);
    g.strokeStyle = 'rgba(255,255,255,0.06)';
    g.lineWidth = 2;
    for (let x = Math.floor(cx / 128) * 128; x < cx + W; x += 128) { g.beginPath(); g.moveTo(x, cy); g.lineTo(x, cy + H); g.stroke(); }
    for (let y = Math.floor(cy / 128) * 128; y < cy + H; y += 128) { g.beginPath(); g.moveTo(cx, y); g.lineTo(cx + W, y); g.stroke(); }
    for (const e of this.enemies) LD.Enemy.draw(g, e);
    LD.Player.draw(g, this.player);
    g.restore();
    LD.UI.bar(g, 20, 20, W - 40, 26, this.player.hp / this.player.maxHp, LD.COLORS.bad);
    LD.Joystick.draw(g);
  },
};
