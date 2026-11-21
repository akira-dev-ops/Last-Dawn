// Inimigos (objetos reutilizados pelo pool)
LD.Enemy = {
  make() {
    return {
      def: null, x: 0, y: 0, r: 10, hp: 1, maxHp: 1, speed: 0, dmg: 0, xp: 1,
      kx: 0, ky: 0,      // empurrão (knockback)
      flash: 0, slow: 0,
      seed: 0, t: 0,
      dashT: 0, dashing: 0, dvx: 0, dvy: 0,
      summonT: 0,
      orbHit: 0, auraHit: 0, waveMark: -1, // controle de acerto por poder
      dead: false,
    };
  },

  // mult: { hp, dmg, speed } escala de dificuldade
  spawn(e, def, x, y, mult) {
    e.def = def;
    e.x = x; e.y = y;
    e.r = def.r;
    e.maxHp = e.hp = def.hp * mult.hp;
    e.speed = def.speed * mult.speed;
    e.dmg = def.dmg * mult.dmg;
    e.xp = def.xp;
    e.kx = e.ky = 0;
    e.flash = 0; e.slow = 0;
    e.seed = Math.random() * 100;
    e.t = 0;
    e.dashT = def.dashEvery || 0; e.dashing = 0;
    e.summonT = def.summonEvery || 0;
    e.orbHit = 0; e.auraHit = 0; e.waveMark = -1;
    e.dead = false;
    return e;
  },

  draw(g, e) {
    const d = e.def;
    const s = e.r * 2.3;
    const spr = LD.Sprites.body(d.sprite, d.shape, d.color, s, false);
    const wob = d.shape === 'blob' ? Math.sin(e.t * 8 + e.seed) * 0.06 : 0;
    let w = s * (1 + wob), h = s * (1 - wob);
    let x = e.x, y = e.y;
    if (e.dashT > 0 && e.dashT < 0.5 && !e.dashing) x += Math.sin(e.t * 60) * 4; // tremor antes da investida
    g.drawImage(spr, x - w / 2, y - h / 2, w, h);
    if (e.flash > 0) {
      g.globalAlpha = 0.65;
      g.drawImage(LD.Sprites.body(d.sprite, d.shape, d.color, s, true), x - w / 2, y - h / 2, w, h);
      g.globalAlpha = 1;
    }
  },
};
