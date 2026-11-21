// =============================================================
// Comportamento de cada poder (o "como funciona").
// Os números ficam em js/data/powers.js.
// Cada entrada: update(inst, s, G, dt) e opcionalmente
// drawUnder / drawOver(inst, s, G, g) para desenhar.
//   inst = instância do poder (nível, timers)
//   s    = atributos já com bônus das melhorias passivas
//   G    = cena de jogo (jogador, inimigos, funções de dano...)
// =============================================================
const TAU = Math.PI * 2;

LD.PowerBehaviors = {
  // ---------------- Lâmina de Vento ----------------
  wind_blade: {
    update(inst, s, G, dt) {
      inst.t -= dt;
      if (inst.t > 0) return;
      const p = G.player;
      const tgt = G.nearestEnemy(p.x, p.y, 850, null);
      const a = tgt ? Math.atan2(tgt.y - p.y, tgt.x - p.x) : Math.atan2(p.fy, p.fx);
      inst.t = s.cooldown;
      for (let i = 0; i < s.count; i++) {
        const aa = a + (i - (s.count - 1) / 2) * 0.17;
        const pr = G.spawnProj();
        if (!pr) break;
        pr.kind = 'blade';
        pr.x = p.x; pr.y = p.y;
        pr.vx = Math.cos(aa) * s.speed;
        pr.vy = Math.sin(aa) * s.speed;
        pr.rot = aa;
        pr.r = s.size; pr.dmg = s.dmg; pr.pierce = s.pierce; pr.life = s.life;
        pr.color = inst.def.color;
        pr.push = 170;
      }
      LD.Audio.play('shoot');
    },
  },

  // ---------------- Chama Espiral ----------------
  spiral_flame: {
    update(inst, s, G, dt) {
      inst.t -= dt;
      if (inst.t > 0) return;
      inst.t = s.cooldown;
      inst.rot = (inst.rot || 0) + 0.6;
      for (let i = 0; i < s.count; i++) {
        const pr = G.spawnProj();
        if (!pr) break;
        pr.kind = 'spiral';
        pr.ang = inst.rot + (i / s.count) * TAU;
        pr.rad = 30;
        pr.spin = s.spin;
        pr.grow = s.grow;
        pr.x = G.player.x + Math.cos(pr.ang) * pr.rad;
        pr.y = G.player.y + Math.sin(pr.ang) * pr.rad;
        pr.r = s.size; pr.dmg = s.dmg; pr.pierce = s.pierce; pr.life = s.life;
        pr.color = inst.def.color;
        pr.push = 120;
      }
    },
  },

  // ---------------- Raio em Cadeia ----------------
  chain_lightning: {
    update(inst, s, G, dt) {
      inst.t -= dt;
      if (inst.t > 0) return;
      const p = G.player;
      const used = inst.used || (inst.used = []);
      used.length = 0;
      let fired = false;
      for (let b = 0; b < s.bolts; b++) {
        let cur = G.nearestEnemy(p.x, p.y, s.range, used);
        if (!cur) break;
        fired = true;
        const fx = G.spawnEffect('lightning');
        if (fx) { fx.life = 0.22; fx.color = inst.def.color; fx.n = 0; G.fxPoint(fx, p.x, p.y - 10); }
        for (let c = 0; c <= s.chains && cur; c++) {
          used.push(cur);
          if (fx) G.fxPoint(fx, cur.x, cur.y);
          G.damage(cur, s.dmg, 0, 0);
          cur = G.nearestEnemy(cur.x, cur.y, s.jump, used);
        }
      }
      inst.t = fired ? s.cooldown : 0.25;
      if (fired) LD.Audio.play('zap');
    },
  },

  // ---------------- Orbes Gravitacionais ----------------
  gravity_orbs: {
    update(inst, s, G, dt) {
      const p = G.player;
      inst.ang = ((inst.ang || 0) + s.spin * dt) % TAU;
      const pos = inst.pos || (inst.pos = new Float32Array(32));
      for (let i = 0; i < s.count && i < 16; i++) {
        const a = inst.ang + (i / s.count) * TAU;
        const ox = p.x + Math.cos(a) * s.radius;
        const oy = p.y + Math.sin(a) * s.radius;
        pos[i * 2] = ox; pos[i * 2 + 1] = oy;
        const list = G.query(ox, oy, s.size + 90);
        for (let j = 0; j < list.length; j++) {
          const e = list[j];
          const dx = e.x - ox, dy = e.y - oy;
          const rr = e.r + s.size;
          if (dx * dx + dy * dy > rr * rr || G.time < e.orbHit) continue;
          e.orbHit = G.time + s.hitCd;
          const ex = e.x - p.x, ey = e.y - p.y, d = Math.hypot(ex, ey) || 1;
          G.damage(e, s.dmg, (ex / d) * 260, (ey / d) * 260);
        }
      }
    },
    drawOver(inst, s, G, g) {
      if (!inst.pos) return;
      const sz = s.size * 2.6;
      const spr = LD.Sprites.glow(inst.def.color, Math.round(sz / 2), '#ffffff');
      for (let i = 0; i < s.count && i < 16; i++) {
        g.drawImage(spr, inst.pos[i * 2] - sz / 2, inst.pos[i * 2 + 1] - sz / 2, sz, sz);
      }
    },
  },

  // ---------------- Aura Defensiva ----------------
  defense_aura: {
    update(inst, s, G, dt) {
      inst.t -= dt;
      inst.pulse = (inst.pulse || 0) + dt;
      if (inst.t > 0) return;
      inst.t = s.cooldown;
      const p = G.player;
      const list = G.query(p.x, p.y, s.radius + 90);
      for (let j = 0; j < list.length; j++) {
        const e = list[j];
        const dx = e.x - p.x, dy = e.y - p.y;
        const rr = s.radius + e.r * 0.5;
        if (dx * dx + dy * dy > rr * rr) continue;
        e.slow = 0.7;
        e.slowAmt = s.slow;
        G.damage(e, s.dmg, 0, 0, true);
      }
    },
    drawUnder(inst, s, G, g) {
      const p = G.player;
      const r = Math.round(s.radius / 5) * 5;
      const spr = LD.Sprites.get('aura_' + r, r * 2, r * 2, (c, w) => {
        const gr = c.createRadialGradient(r, r, r * 0.2, r, r, r);
        gr.addColorStop(0, 'rgba(107,220,139,0.0)');
        gr.addColorStop(0.75, 'rgba(107,220,139,0.18)');
        gr.addColorStop(0.95, 'rgba(160,255,190,0.5)');
        gr.addColorStop(1, 'rgba(160,255,190,0)');
        c.fillStyle = gr;
        c.fillRect(0, 0, w, w);
      });
      g.globalAlpha = 0.75 + Math.sin((inst.pulse || 0) * 4) * 0.2;
      g.drawImage(spr, p.x - r, p.y - r);
      g.globalAlpha = 1;
    },
  },

  // ---------------- Onda de Choque ----------------
  shock_wave: {
    update(inst, s, G, dt) {
      const p = G.player;
      if (!inst.waves) {
        inst.waves = [];
        for (let i = 0; i < 4; i++) inst.waves.push({ on: false, r: 0, mark: 0 });
        inst.queue = 0; inst.qT = 0;
      }
      inst.t -= dt;
      if (inst.t <= 0) { inst.t = s.cooldown; inst.queue = s.waves; inst.qT = 0; }
      if (inst.queue > 0) {
        inst.qT -= dt;
        if (inst.qT <= 0) {
          const w = inst.waves.find(w => !w.on);
          if (w) {
            w.on = true; w.r = 10; w.mark = ++G.waveCounter;
            LD.Audio.play('explosion');
          }
          inst.queue--;
          inst.qT = 0.3;
        }
      }
      for (let i = 0; i < inst.waves.length; i++) {
        const w = inst.waves[i];
        if (!w.on) continue;
        w.r += 820 * dt;
        const list = G.query(p.x, p.y, w.r + 60);
        for (let j = 0; j < list.length; j++) {
          const e = list[j];
          if (e.waveMark === w.mark) continue;
          const dx = e.x - p.x, dy = e.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d > w.r + e.r || d < w.r - 90) continue;
          e.waveMark = w.mark;
          G.damage(e, s.dmg, (dx / d) * s.push, (dy / d) * s.push);
        }
        if (w.r >= s.range) w.on = false;
      }
    },
    drawOver(inst, s, G, g) {
      if (!inst.waves) return;
      const p = G.player;
      for (let i = 0; i < inst.waves.length; i++) {
        const w = inst.waves[i];
        if (!w.on) continue;
        const k = w.r / s.range;
        g.globalAlpha = Math.max(0, 1 - k) * 0.9;
        g.strokeStyle = inst.def.color;
        g.lineWidth = 18 * (1 - k) + 4;
        g.beginPath(); g.arc(p.x, p.y, w.r, 0, TAU); g.stroke();
        g.strokeStyle = '#ffffff';
        g.lineWidth = 3;
        g.stroke();
      }
      g.globalAlpha = 1;
    },
  },

  // ---------------- Estrela Cadente ----------------
  falling_star: {
    update(inst, s, G, dt) {
      inst.t -= dt;
      if (inst.t > 0) return;
      const cands = G.visibleEnemies();
      if (!cands.length) { inst.t = 0.3; return; }
      inst.t = s.cooldown;
      for (let i = 0; i < s.count; i++) {
        const e = cands[(Math.random() * cands.length) | 0];
        const fx = G.spawnEffect('star');
        if (!fx) break;
        fx.x = e.x + (Math.random() - 0.5) * 30;
        fx.y = e.y + (Math.random() - 0.5) * 30;
        fx.r = s.radius; fx.r2 = 0.45 + i * 0.08; fx.life = fx.r2;
        fx.dmg = s.dmg; fx.color = inst.def.color;
      }
    },
  },
};
