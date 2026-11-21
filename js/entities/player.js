// Jogador
LD.Player = {
  create() {
    const C = LD.CONFIG;
    return {
      x: 0, y: 0,
      r: C.playerRadius,
      hp: C.playerHp,
      maxHp: C.playerHp,
      speed: C.playerSpeed,
      magnet: C.magnetRadius,
      armor: 0,       // 0..1 redução de dano (Aura Defensiva)
      iframes: 0,
      fx: 1, fy: 0,   // última direção (para mirar sem alvo)
      moving: false,
      walkT: 0,
      // modificadores vindos das melhorias passivas
      mods: { speedMul: 1, dmgMul: 1, areaMul: 1, cdMul: 1, magnetMul: 1, maxHpAdd: 0, regen: 0 },
    };
  },

  update(p, dt, ix, iy) {
    const m = Math.hypot(ix, iy);
    if (m > 0.01) {
      const k = Math.min(1, m);
      p.x += (ix / m) * p.speed * k * dt;
      p.y += (iy / m) * p.speed * k * dt;
      p.fx = ix / m; p.fy = iy / m;
      p.moving = true;
      p.walkT += dt * 10 * k;
    } else p.moving = false;
    if (p.iframes > 0) p.iframes -= dt;
    if (p.mods.regen > 0 && p.hp > 0) p.hp = Math.min(p.maxHp, p.hp + p.mods.regen * dt);
  },

  draw(g, p) {
    const s = p.r * 2.6;
    // sombra
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath(); g.ellipse(p.x, p.y + p.r * 0.9, p.r * 0.95, p.r * 0.35, 0, 0, Math.PI * 2); g.fill();
    if (p.iframes > 0 && Math.floor(p.iframes * 20) % 2 === 0) return; // pisca ao tomar dano
    const bob = p.moving ? Math.sin(p.walkT) * 3 : 0;
    const spr = LD.Sprites.body('player', 'hero', '#3a5bd8', s);
    g.drawImage(spr, p.x - s / 2, p.y - s / 2 - 6 + bob, s, s);
  },
};
