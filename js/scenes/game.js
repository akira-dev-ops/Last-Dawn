// Tela 3: Jogo
LD.GameScene = {
  // ============================================================
  // Ciclo de vida
  // ============================================================
  enter() {
    const C = LD.CONFIG;
    if (!this.enemies) {
      // Pools criados uma única vez e reutilizados entre partidas
      this.enemies = new LD.Pool(LD.Enemy.make, C.maxEnemies + 12); // +12 reservados p/ chefes
      this.projs = new LD.Pool(LD.Projectile.make, C.maxProjectiles);
      this.pickups = new LD.Pool(LD.Pickup.make, C.maxGems);
      this.effects = new LD.Pool(LD.Effect.make, C.maxEffects);
      this.texts = new LD.Pool(LD.Effect.make, C.maxTexts);
      LD.Grid.init();
    }
    this.enemies.clear(); this.projs.clear(); this.pickups.clear();
    this.effects.clear(); this.texts.clear();

    this.player = LD.Player.create();
    this.time = 0;
    this.kills = 0;
    this.bossKills = 0;
    this.level = 1;
    this.xp = 0;
    this.xpNext = LD.xpToNext(1);
    this.pendingLevels = 0;
    this.powers = [];
    this.passives = {};
    this.mode = 'play'; // 'play' | 'levelup' | 'pause' | 'dying'
    this.spawnT = 0.5;
    this.nextBossT = LD.BOSSES.interval;
    this.bossIndex = 0;
    this.hordeT = LD.HORDES.map(h => h.first);
    this.waveCounter = 0;
    this.toasts = [];
    this.achT = 1;
    this.newAchievements = [];
    this.cam = { x: 0, y: 0 };
    this.cands = [];
    LD.Joystick.end();

    this.pauseBtn = LD.UI.button(LD.W - 92, 50, 76, 64, 'II', () => this.pause(), { color: 'rgba(40,24,70,0.85)', fontSize: 30 });
    this.buttons = [this.pauseBtn];

    this.addPower(LD.STARTING_POWER);
    this.recompute();
    LD.Audio.playMusic('music_game');
  },

  exit() { LD.Joystick.end(); },

  onHide() { if (this.mode === 'play') this.pause(); },

  onResize() {
    this.pauseBtn.x = LD.W - 92;
    if (this.mode === 'levelup') LD.LevelUp.layout();
    if (this.mode === 'pause') this.buildPauseButtons();
  },

  onKey(code) {
    if (code === 'Escape' || code === 'KeyP') {
      if (this.mode === 'play') this.pause(); else if (this.mode === 'pause') this.resume();
    }
  },

  // ============================================================
  // Toque
  // ============================================================
  onDown(x, y, id) {
    if (this.mode === 'play') LD.Joystick.start(x, y, id);
    else if (this.mode === 'levelup') LD.LevelUp.onDown(x, y, id);
  },
  onMove(x, y, id) { LD.Joystick.move(x, y, id); },
  onUp(x, y, id) {
    LD.Joystick.end(id);
    if (this.mode === 'levelup') {
      const ch = LD.LevelUp.onUp(x, y, id);
      if (ch) this.applyChoice(ch);
    }
  },

  // ============================================================
  // Pausa
  // ============================================================
  pause() {
    if (this.mode !== 'play') return;
    this.mode = 'pause';
    LD.Joystick.end();
    this.buildPauseButtons();
  },

  buildPauseButtons() {
    const W = LD.W, H = LD.H, U = LD.UI;
    this.buttons = [
      U.button(W / 2 - 220, H - 330, 440, 96, 'Continuar', () => this.resume(), { color: '#d8642a' }),
      U.button(W / 2 - 220, H - 210, 440, 84, 'Desistir', () => this.die(true), { color: '#5a3a9a' }),
    ];
  },

  resume() {
    this.mode = 'play';
    this.buttons = [this.pauseBtn];
  },

  // ============================================================
  // Atualização
  // ============================================================
  update(dt) {
    for (let i = this.toasts.length - 1; i >= 0; i--) {
      this.toasts[i].t -= dt;
      if (this.toasts[i].t <= 0) this.toasts.splice(i, 1);
    }
    if (this.mode === 'play') {
      this.step(dt);
      if (this.pendingLevels > 0 && this.mode === 'play') this.openLevelUp();
    } else if (this.mode === 'levelup') {
      LD.LevelUp.update(dt);
    } else if (this.mode === 'dying') {
      this.dyingT -= dt;
      this.updateEffects(dt);
      if (this.dyingT <= 0) this.finish();
    }
  },

  step(dt) {
    const p = this.player;
    this.time += dt;

    // Movimento do jogador (joystick ou teclado)
    let ix = LD.Joystick.dx, iy = LD.Joystick.dy;
    if (!LD.Joystick.active) { const k = LD.Keys.axis(); ix = k.x; iy = k.y; }
    LD.Player.update(p, dt, ix, iy);
    this.cam.x = p.x - LD.W / 2;
    this.cam.y = p.y - LD.H / 2;

    this.updateSpawns(dt);
    LD.Grid.build(this.enemies.active, p.x, p.y);
    this.updateEnemies(dt);
    this.separate();

    for (let i = 0; i < this.powers.length; i++) {
      const inst = this.powers[i];
      LD.PowerBehaviors[inst.def.id].update(inst, inst.stats, this, dt);
    }

    this.updateProjectiles(dt);
    this.updatePickups(dt);
    this.updateEffects(dt);

    this.enemies.sweep();
    this.projs.sweep();
    this.pickups.sweep();

    this.achT -= dt;
    if (this.achT <= 0) { this.achT = 1; this.checkAchievements(); }
  },

  // ---------- Geração de inimigos ----------
  currentWave() {
    let w = LD.WAVES[0];
    for (let i = 0; i < LD.WAVES.length; i++) if (LD.WAVES[i].t <= this.time) w = LD.WAVES[i];
    return w;
  },

  difficulty() {
    const m = this.time / 60, D = LD.DIFFICULTY;
    const o = this._mult || (this._mult = {});
    o.hp = 1 + m * D.hpPerMin;
    o.dmg = 1 + m * D.dmgPerMin;
    o.speed = 1 + m * D.speedPerMin;
    return o;
  },

  updateSpawns(dt) {
    const C = LD.CONFIG, p = this.player;
    const wave = this.currentWave();
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawnT = wave.every;
      const cap = Math.min(wave.max, C.maxEnemies);
      for (let b = 0; b < wave.batch; b++) {
        if (this.normalCount() >= cap) break;
        const id = wave.pool[(Math.random() * wave.pool.length) | 0];
        this.spawnAtEdge(id);
      }
    }

    // Hordas (anel ao redor do jogador)
    for (let i = 0; i < LD.HORDES.length; i++) {
      this.hordeT[i] -= dt;
      if (this.hordeT[i] <= 0) {
        const h = LD.HORDES[i];
        this.hordeT[i] = h.every;
        const R = Math.hypot(LD.W, LD.H) / 2 + 30;
        for (let k = 0; k < h.count; k++) {
          if (this.normalCount() >= C.maxEnemies) break;
          const a = (k / h.count) * Math.PI * 2;
          this.spawnEnemy(h.enemy, p.x + Math.cos(a) * R, p.y + Math.sin(a) * R);
        }
        this.toast('Uma horda se aproxima!', '#ffb3a0');
      }
    }

    // Chefes
    if (this.time >= this.nextBossT) {
      this.nextBossT += LD.BOSSES.interval;
      const order = LD.BOSSES.order;
      const id = order[this.bossIndex % order.length];
      const cycle = Math.floor(this.bossIndex / order.length);
      this.bossIndex++;
      const e = this.spawnAtEdge(id, true);
      if (e) {
        e.maxHp = e.hp = e.hp * (1 + cycle * LD.BOSSES.hpGrowth);
        this.toast('Chefe: ' + e.def.name + '!', '#ff8a6a', 3.5);
        LD.Audio.play('boss');
        LD.vibrate([80, 60, 80]);
      }
    }
  },

  normalCount() { return this.enemies.active.length - this.bossAlive(); },

  bossAlive() {
    let n = 0;
    const a = this.enemies.active;
    for (let i = 0; i < a.length; i++) if (a[i].def.boss && !a[i].dead) n++;
    return n;
  },

  currentBoss() {
    const a = this.enemies.active;
    for (let i = 0; i < a.length; i++) if (a[i].def.boss && !a[i].dead) return a[i];
    return null;
  },

  edgePoint(out) {
    const p = this.player;
    // favorece nascer à frente da direção de movimento
    let a = Math.random() * Math.PI * 2;
    if (p.moving && Math.random() < 0.5) a = Math.atan2(p.fy, p.fx) + (Math.random() - 0.5) * 1.6;
    const R = Math.hypot(LD.W, LD.H) / 2 + 50;
    out.x = p.x + Math.cos(a) * R;
    out.y = p.y + Math.sin(a) * R;
    return out;
  },

  spawnAtEdge(id, force) {
    const pt = this.edgePoint(this._pt || (this._pt = {}));
    return this.spawnEnemy(id, pt.x, pt.y, force);
  },

  spawnEnemy(id, x, y, force) {
    const def = LD.ENEMY[id];
    if (!def) return null;
    if (!force && !def.boss && this.normalCount() >= LD.CONFIG.maxEnemies) return null;
    const e = this.enemies.get();
    if (!e) return null;
    return LD.Enemy.spawn(e, def, x, y, this.difficulty());
  },

  // ---------- Inimigos ----------
  updateEnemies(dt) {
    const p = this.player, a = this.enemies.active;
    const far = Math.hypot(LD.W, LD.H) * 0.85;
    const decay = Math.min(1, dt * 9);
    for (let i = 0; i < a.length; i++) {
      const e = a[i];
      if (e.dead) continue;
      const d0 = e.def;
      e.t += dt;
      if (e.flash > 0) e.flash -= dt;
      let dx = p.x - e.x, dy = p.y - e.y;
      let d = Math.sqrt(dx * dx + dy * dy) || 1;

      // muito longe: reposiciona na borda (como em jogos do gênero)
      if (d > far) {
        const pt = this.edgePoint(this._pt || (this._pt = {}));
        e.x = pt.x; e.y = pt.y;
        continue;
      }

      let sp = e.speed;
      if (e.slow > 0) { e.slow -= dt; sp *= 1 - (e.slowAmt || 0.4); }
      let vx = (dx / d) * sp, vy = (dy / d) * sp;

      if (d0.move === 'zigzag') {
        const z = Math.sin(e.t * 5 + e.seed) * 0.9;
        vx += (-dy / d) * sp * z;
        vy += (dx / d) * sp * z;
      }
      if (d0.move === 'dash') {
        if (e.dashing > 0) {
          e.dashing -= dt;
          vx = e.dvx; vy = e.dvy;
        } else {
          e.dashT -= dt;
          if (e.dashT < 0.5) { vx *= 0.1; vy *= 0.1; } // "carrega" a investida
          if (e.dashT <= 0) {
            e.dashT = d0.dashEvery;
            e.dashing = d0.dashTime;
            e.dvx = (dx / d) * d0.dashSpeed;
            e.dvy = (dy / d) * d0.dashSpeed;
          }
        }
      }
      if (d0.summon) {
        e.summonT -= dt;
        if (e.summonT <= 0) {
          e.summonT = d0.summonEvery;
          for (let k = 0; k < d0.summonCount; k++) {
            const ang = (k / d0.summonCount) * Math.PI * 2;
            this.spawnEnemy(d0.summon, e.x + Math.cos(ang) * (e.r + 40), e.y + Math.sin(ang) * (e.r + 40));
          }
        }
      }

      e.x += (vx + e.kx) * dt;
      e.y += (vy + e.ky) * dt;
      e.kx -= e.kx * decay;
      e.ky -= e.ky * decay;

      // dano por contato
      dx = p.x - e.x; dy = p.y - e.y;
      const rr = e.r + p.r * 0.8;
      if (dx * dx + dy * dy < rr * rr) this.hurtPlayer(e.dmg);
    }
  },

  // Empurra inimigos que estão na mesma célula (evita amontoar num ponto)
  separate() {
    const Gd = LD.Grid, n = Gd.n * Gd.n, head = Gd.head, next = Gd.next, list = this.enemies.active;
    for (let c = 0; c < n; c++) {
      for (let i = head[c]; i !== -1; i = next[i]) {
        const a = list[i];
        for (let j = next[i]; j !== -1; j = next[j]) {
          const b = list[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const rr = (a.r + b.r) * 0.85;
          const d2 = dx * dx + dy * dy;
          if (d2 >= rr * rr || d2 < 0.01) continue;
          const d = Math.sqrt(d2);
          const push = ((rr - d) / d) * 0.5;
          const wa = a.def.boss ? 0 : (b.def.boss ? 2 : 1);
          const wb = b.def.boss ? 0 : (a.def.boss ? 2 : 1);
          a.x -= dx * push * wa; a.y -= dy * push * wa;
          b.x += dx * push * wb; b.y += dy * push * wb;
        }
      }
    }
  },

  // ---------- Projéteis ----------
  updateProjectiles(dt) {
    const a = this.projs.active, p = this.player;
    for (let i = 0; i < a.length; i++) {
      const pr = a[i];
      if (pr.dead) continue;
      pr.t += dt;
      if (pr.t >= pr.life) { pr.dead = true; continue; }
      let pdx, pdy;
      if (pr.kind === 'spiral') {
        pr.ang += pr.spin * dt;
        pr.rad += pr.grow * dt;
        const nx = p.x + Math.cos(pr.ang) * pr.rad, ny = p.y + Math.sin(pr.ang) * pr.rad;
        pdx = nx - pr.x; pdy = ny - pr.y;
        pr.x = nx; pr.y = ny;
      } else {
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
        pdx = pr.vx; pdy = pr.vy;
      }
      const list = this.query(pr.x, pr.y, pr.r + 90);
      for (let j = 0; j < list.length; j++) {
        const e = list[j];
        const dx = e.x - pr.x, dy = e.y - pr.y, rr = e.r + pr.r;
        if (dx * dx + dy * dy > rr * rr) continue;
        if (pr.hits.indexOf(e) !== -1) continue;
        pr.hits.push(e);
        const m = Math.hypot(pdx, pdy) || 1;
        this.damage(e, pr.dmg, (pdx / m) * pr.push, (pdy / m) * pr.push);
        if (--pr.pierce < 0) { pr.dead = true; break; }
      }
    }
  },

  // ---------- Gemas e corações ----------
  updatePickups(dt) {
    const p = this.player, a = this.pickups.active;
    const mag2 = p.magnet * p.magnet;
    for (let i = 0; i < a.length; i++) {
      const it = a[i];
      if (it.dead) continue;
      const dx = p.x - it.x, dy = p.y - it.y;
      const d2 = dx * dx + dy * dy;
      if (!it.pulled && d2 < mag2) { it.pulled = true; it.t = 0; }
      if (it.pulled) {
        it.t += dt;
        const d = Math.sqrt(d2) || 1;
        const sp = 260 + it.t * 1100;
        it.x += (dx / d) * sp * dt;
        it.y += (dy / d) * sp * dt;
        if (d < p.r + 12) this.collect(it);
      }
    }
  },

  collect(it) {
    it.dead = true;
    if (it.kind === 'heart') {
      const p = this.player;
      p.hp = Math.min(p.maxHp, p.hp + 30);
      this.floatText('+30', p.x, p.y - 40, '#6bdc8b', 30);
      LD.Audio.play('pickup');
      return;
    }
    LD.Audio.play('pickup');
    this.addXp(it.value);
  },

  drop(kind, x, y, value) {
    const it = this.pickups.get();
    if (!it) {
      // limite atingido: junta o valor numa gema existente (sem perder XP)
      if (kind === 'gem') {
        const a = this.pickups.active;
        const g = a[(Math.random() * a.length) | 0];
        if (g && g.kind === 'gem') g.value += value;
        else this.addXp(value);
      }
      return;
    }
    it.kind = kind; it.x = x; it.y = y; it.value = value;
    it.pulled = false; it.t = 0; it.dead = false;
  },

  // ---------- Efeitos ----------
  updateEffects(dt) {
    const a = this.effects.active;
    for (let i = 0; i < a.length; i++) {
      const fx = a[i];
      fx.t += dt;
      if (fx.t >= fx.life) {
        if (fx.kind === 'star' && !fx.done) {
          fx.done = true;
          this.explode(fx.x, fx.y, fx.r, fx.dmg, fx.color);
        }
        fx.dead = true;
      }
    }
    this.effects.sweep();
    const t = this.texts.active;
    for (let i = 0; i < t.length; i++) {
      t[i].t += dt;
      if (t[i].t >= t[i].life) t[i].dead = true;
    }
    this.texts.sweep();
  },

  spawnEffect(kind) {
    const fx = this.effects.get();
    if (!fx) return null;
    fx.kind = kind; fx.t = 0; fx.life = 0.3; fx.n = 0; fx.done = false; fx.dead = false;
    return fx;
  },

  fxPoint(fx, x, y) {
    if (fx.n >= 24) return;
    fx.pts[fx.n * 2] = x;
    fx.pts[fx.n * 2 + 1] = y;
    fx.n++;
  },

  floatText(str, x, y, color, size) {
    const t = this.texts.get();
    if (!t) return;
    t.kind = 'text'; t.str = str; t.x = x; t.y = y; t.color = color; t.r = size || 24;
    t.t = 0; t.life = 0.6; t.dead = false;
  },

  toast(text, color, time) {
    const life = time || 2.5;
    this.toasts.push({ text, color, t: life, life });
    if (this.toasts.length > 3) this.toasts.shift();
  },

  // ============================================================
  // API usada pelos poderes
  // ============================================================
  query(x, y, r) { return LD.Grid.query(x, y, r); },

  spawnProj() {
    const pr = this.projs.get();
    return pr ? LD.Projectile.reset(pr) : null;
  },

  nearestEnemy(x, y, maxD, exclude) {
    const a = this.enemies.active;
    let best = null, bd = maxD * maxD;
    for (let i = 0; i < a.length; i++) {
      const e = a[i];
      if (e.dead) continue;
      const dx = e.x - x, dy = e.y - y, d2 = dx * dx + dy * dy;
      if (d2 < bd && (!exclude || exclude.indexOf(e) === -1)) { bd = d2; best = e; }
    }
    return best;
  },

  visibleEnemies() {
    const out = this.cands;
    out.length = 0;
    const a = this.enemies.active, cx = this.cam.x, cy = this.cam.y;
    for (let i = 0; i < a.length; i++) {
      const e = a[i];
      if (!e.dead && e.x > cx && e.x < cx + LD.W && e.y > cy + 100 && e.y < cy + LD.H) out.push(e);
    }
    return out;
  },

  explode(x, y, r, dmg, color) {
    const fx = this.spawnEffect('boom');
    if (fx) { fx.x = x; fx.y = y; fx.r = r; fx.life = 0.35; fx.color = color; }
    LD.Audio.play('explosion');
    const list = this.query(x, y, r + 90);
    for (let j = 0; j < list.length; j++) {
      const e = list[j];
      const dx = e.x - x, dy = e.y - y, rr = r + e.r;
      if (dx * dx + dy * dy > rr * rr) continue;
      const d = Math.hypot(dx, dy) || 1;
      this.damage(e, dmg, (dx / d) * 200, (dy / d) * 200);
    }
  },

  damage(e, dmg, kx, ky, quiet) {
    if (e.dead) return;
    dmg = Math.max(1, Math.round(dmg));
    e.hp -= dmg;
    e.flash = 0.09;
    const kr = 1 - (e.def.knockResist || 0);
    e.kx += kx * kr;
    e.ky += ky * kr;
    if (LD.Save.data.settings.damageNumbers) {
      this.floatText('' + dmg, e.x + (Math.random() - 0.5) * 20, e.y - e.r, '#fff', 22);
    }
    if (!quiet) LD.Audio.play('hit');
    if (e.hp <= 0) this.kill(e);
  },

  kill(e) {
    e.dead = true;
    this.kills++;
    const fx = this.spawnEffect('puff');
    if (fx) { fx.x = e.x; fx.y = e.y; fx.r = e.r; fx.color = e.def.color; fx.life = 0.25; }
    LD.Audio.play('kill');
    if (e.def.boss) {
      this.bossKills++;
      this.drop('gem', e.x, e.y, e.xp);
      this.drop('heart', e.x + 40, e.y, 0);
      this.drop('heart', e.x - 40, e.y, 0);
      this.toast(e.def.name + ' derrotado!', '#ffd58a', 3);
      LD.vibrate(120);
      // chefe libera uma escolha extra
      this.pendingLevels++;
      return;
    }
    this.drop('gem', e.x, e.y, e.xp);
    if (Math.random() < 0.006) this.drop('heart', e.x, e.y, 0);
  },

  hurtPlayer(dmg) {
    const p = this.player;
    if (p.iframes > 0 || this.mode !== 'play') return;
    dmg = Math.max(1, Math.round(dmg * (1 - p.armor)));
    p.hp -= dmg;
    p.iframes = LD.CONFIG.playerIFrames;
    this.floatText('-' + dmg, p.x, p.y - 40, '#ff5470', 30);
    LD.Audio.play('hurt');
    LD.vibrate(40);
    if (p.hp <= 0) { p.hp = 0; this.die(false); }
  },

  // ============================================================
  // XP, níveis e escolhas
  // ============================================================
  addXp(v) {
    this.xp += v;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = LD.xpToNext(this.level);
      this.pendingLevels++;
    }
  },

  openLevelUp() {
    this.pendingLevels--;
    this.mode = 'levelup';
    LD.Joystick.end();
    this.buttons = [];
    LD.LevelUp.open(this);
    LD.Audio.play('levelup');
    LD.vibrate(30);
  },

  buildChoices(n) {
    const C = LD.CONFIG, opts = [];
    const owned = {};
    for (const inst of this.powers) {
      owned[inst.def.id] = true;
      if (inst.level < inst.def.maxLevel) {
        const L = inst.def.levels[inst.level];
        opts.push({ type: 'power', def: inst.def, level: inst.level + 1, text: L.text || inst.def.desc });
      }
    }
    if (this.powers.length < C.maxPowers) {
      for (const def of LD.POWERS) if (!owned[def.id]) opts.push({ type: 'power', def, level: 1, text: def.desc });
    }
    const passiveCount = Object.keys(this.passives).length;
    for (const def of LD.PASSIVES) {
      const lv = this.passives[def.id] || 0;
      if (lv >= def.max) continue;
      if (lv === 0 && passiveCount >= C.maxPassives) continue;
      opts.push({ type: 'passive', def, level: lv + 1, text: def.desc });
    }
    // embaralha
    for (let i = opts.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = opts[i]; opts[i] = opts[j]; opts[j] = t;
    }
    const out = opts.slice(0, n);
    if (!out.length) {
      out.push({ type: 'heal', def: { id: 'heal', name: 'Elixir da Aurora', color: '#6bdc8b', glyph: '+', kind: 'item' },
        level: 0, text: 'Recupera 50 de vida.' });
    }
    return out;
  },

  applyChoice(ch) {
    if (ch.type === 'power') {
      if (ch.level === 1) this.addPower(ch.def.id);
      else {
        const inst = this.powers.find(p => p.def.id === ch.def.id);
        inst.level = ch.level;
      }
    } else if (ch.type === 'passive') {
      this.passives[ch.def.id] = ch.level;
      if (ch.def.stat === 'maxHpAdd') this.player.hp += ch.def.per;
      if (LD.Save.discover(ch.def.id)) this.toast('Novo na Coleção: ' + ch.def.name, '#9fd8ff');
    } else if (ch.type === 'heal') {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
    }
    this.recompute();
    this.mode = 'play';
    this.buttons = [this.pauseBtn];
  },

  addPower(id) {
    const def = LD.POWER[id];
    this.powers.push({ def, level: 1, t: 0.3, stats: null });
    if (LD.Save.discover(id) && this.time > 0) this.toast('Novo na Coleção: ' + def.name, '#9fd8ff');
  },

  // Recalcula atributos do jogador e dos poderes após qualquer escolha
  recompute() {
    const C = LD.CONFIG, p = this.player, m = p.mods;
    m.speedMul = 1; m.dmgMul = 1; m.areaMul = 1; m.cdMul = 1; m.magnetMul = 1; m.maxHpAdd = 0; m.regen = 0;
    for (const id in this.passives) {
      const def = LD.PASSIVE[id];
      m[def.stat] += def.per * this.passives[id];
    }
    m.cdMul = Math.max(0.4, m.cdMul);
    p.speed = C.playerSpeed * m.speedMul;
    p.maxHp = C.playerHp + m.maxHpAdd;
    p.hp = Math.min(p.hp, p.maxHp);
    p.magnet = C.magnetRadius * m.magnetMul;
    p.armor = 0;
    for (const inst of this.powers) {
      const s = LD.powerBaseStats(inst.def, inst.level);
      if (s.dmg) s.dmg *= m.dmgMul;
      if (s.cooldown) s.cooldown *= m.cdMul;
      for (const k of ['size', 'radius', 'range', 'jump', 'grow']) if (s[k]) s[k] *= m.areaMul;
      if (s.armor) p.armor = Math.max(p.armor, s.armor);
      inst.stats = s;
    }
  },

  // ============================================================
  // Fim de partida
  // ============================================================
  die(quit) {
    if (this.mode === 'dying') return;
    this.mode = 'dying';
    this.dyingT = quit ? 0.05 : 1.3;
    this.buttons = [];
    LD.Joystick.end();
    if (!quit) { LD.Audio.play('gameover'); LD.vibrate([100, 50, 200]); }
  },

  checkAchievements() {
    if (!LD.Achievements) return;
    const got = LD.Achievements.check(this.runStats());
    for (const a of got) {
      this.newAchievements.push(a);
      this.toast('Conquista: ' + a.name, '#ffd58a', 3);
      LD.Audio.play('achievement');
    }
  },

  runStats() {
    let maxed = 0;
    for (const inst of this.powers) if (inst.level >= inst.def.maxLevel) maxed++;
    return {
      time: this.time, kills: this.kills, level: this.level, bossKills: this.bossKills,
      powers: this.powers.length, maxedPowers: maxed, ended: this.mode === 'dying',
    };
  },

  finish() {
    const run = this.runStats();
    const st = LD.Save.data.stats;
    st.games++;
    st.totalKills += run.kills;
    st.totalTime += run.time;
    st.bossKills += run.bossKills;
    st.bestTime = Math.max(st.bestTime, run.time);
    st.bestKills = Math.max(st.bestKills, run.kills);
    st.bestLevel = Math.max(st.bestLevel, run.level);
    LD.Save.save();
    this.checkAchievements();
    run.newAchievements = this.newAchievements.slice();
    run.powerList = this.powers.map(i => ({ def: i.def, level: i.level }));
    LD.Engine.go(LD.GameOverScene || LD.MenuScene, run);
  },

  // ============================================================
  // Desenho
  // ============================================================
  render(g) {
    const W = LD.W, H = LD.H;
    const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
    this.drawGround(g, cx, cy);

    g.save();
    g.translate(-cx, -cy);
    const x0 = cx - 120, x1 = cx + W + 120, y0 = cy - 120, y1 = cy + H + 120;

    // gemas
    const pk = this.pickups.active, tm = this.time;
    for (let i = 0; i < pk.length; i++) {
      const it = pk[i];
      if (it.x > x0 && it.x < x1 && it.y > y0 && it.y < y1) LD.Pickup.draw(g, it, tm);
    }
    // poderes que ficam sob os inimigos (aura)
    for (const inst of this.powers) {
      const b = LD.PowerBehaviors[inst.def.id];
      if (b.drawUnder) b.drawUnder(inst, inst.stats, this, g);
    }
    // inimigos
    const en = this.enemies.active;
    for (let i = 0; i < en.length; i++) {
      const e = en[i];
      if (e.x > x0 - e.r && e.x < x1 + e.r && e.y > y0 - e.r && e.y < y1 + e.r) LD.Enemy.draw(g, e);
    }
    // jogador
    LD.Player.draw(g, this.player);
    this.drawPlayerHp(g);
    // projéteis
    const pr = this.projs.active;
    for (let i = 0; i < pr.length; i++) {
      const q = pr[i];
      if (q.x > x0 && q.x < x1 && q.y > y0 && q.y < y1) LD.Projectile.draw(g, q);
    }
    for (const inst of this.powers) {
      const b = LD.PowerBehaviors[inst.def.id];
      if (b.drawOver) b.drawOver(inst, inst.stats, this, g);
    }
    // efeitos e números
    const fx = this.effects.active;
    for (let i = 0; i < fx.length; i++) LD.Effect.draw(g, fx[i]);
    const tx = this.texts.active;
    for (let i = 0; i < tx.length; i++) LD.Effect.draw(g, tx[i]);
    g.restore();

    if (this.mode === 'dying') {
      g.fillStyle = 'rgba(80,0,20,' + Math.min(0.6, (1.3 - this.dyingT) * 0.6) + ')';
      g.fillRect(0, 0, W, H);
    }

    LD.HUD.draw(g, this);
    if (this.mode === 'play') LD.Joystick.draw(g);
    else if (this.mode === 'levelup') LD.LevelUp.draw(g, this);
    else if (this.mode === 'pause') this.drawPause(g);
  },

  drawGround(g, cx, cy) {
    const img = LD.Assets.img('ground');
    const T = img ? img.width : 256;
    const tile = img || LD.Sprites.get('ground', 256, 256, (c, w) => {
      c.fillStyle = '#1d2420';
      c.fillRect(0, 0, w, w);
      let seed = 3;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 60; i++) {
        c.fillStyle = rnd() < 0.5 ? 'rgba(60,90,60,0.35)' : 'rgba(10,15,12,0.4)';
        const s = 3 + rnd() * 10;
        c.fillRect(rnd() * w, rnd() * w, s, s * 0.6);
      }
      for (let i = 0; i < 5; i++) {
        c.fillStyle = 'rgba(90,80,110,0.35)';
        c.beginPath(); c.ellipse(rnd() * w, rnd() * w, 8 + rnd() * 12, 5 + rnd() * 7, 0, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = 'rgba(255,255,255,0.035)';
      c.lineWidth = 2;
      c.strokeRect(0, 0, w, w);
    });
    const sx = -(((cx % T) + T) % T), sy = -(((cy % T) + T) % T);
    for (let y = sy; y < LD.H; y += T) {
      for (let x = sx; x < LD.W; x += T) g.drawImage(tile, x, y);
    }
  },

  drawPlayerHp(g) {
    const p = this.player;
    const w = 64;
    LD.UI.bar(g, p.x - w / 2, p.y + p.r + 14, w, 9, p.hp / p.maxHp, '#ff5470', 'rgba(0,0,0,0.7)');
  },

  drawPause(g) {
    const W = LD.W, H = LD.H, U = LD.UI;
    g.fillStyle = 'rgba(5,2,12,0.75)';
    g.fillRect(0, 0, W, H);
    U.outlined(g, 'Pausado', W / 2, 250, 72, '#ffd58a');
    U.text(g, 'Poderes', W / 2, 330, 30, LD.COLORS.dim);
    let y = 385;
    for (const inst of this.powers) {
      U.icon(g, inst.def, 120, y, 50);
      U.text(g, inst.def.name, 160, y, 28, '#fff', 'left');
      U.text(g, 'Nv ' + inst.level + '/' + inst.def.maxLevel, W - 110, y, 24, '#9fd8ff', 'right');
      y += 56;
    }
    U.drawButtons(g, this.buttons);
  },
};
