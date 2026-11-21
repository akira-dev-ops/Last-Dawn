// Áudio: toca arquivos se configurados, senão usa sons sintetizados.
LD.Audio = {
  ctx: null,
  master: null,
  musicGain: null,
  buffers: {},
  last: {},
  musicSrc: null,
  musicKey: null,

  ensure() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.5;
      this.musicGain.connect(this.master);
      this.setVolume(LD.Save.data.settings.volume);
    } catch (e) { this.ctx = null; }
    return this.ctx;
  },

  // Navegadores só liberam o áudio após um toque do usuário.
  unlock() {
    const c = this.ensure();
    if (c && c.state === 'suspended') c.resume();
    if (this._wantMusic && !this.musicSrc) this.playMusic(this._wantMusic);
  },

  setVolume(v) {
    if (this.master) this.master.gain.value = v;
  },

  loadFile(key, url, done) {
    const c = this.ensure();
    if (!c) { done(); return; }
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(ab => new Promise((res, rej) => c.decodeAudioData(ab, res, rej)))
      .then(buf => { this.buffers[key] = buf; })
      .catch(e => console.warn('[Last Dawn] som não carregou:', key, e))
      .then(done);
  },

  play(key) {
    const c = this.ctx;
    if (!c || c.state !== 'running' || LD.Save.data.settings.volume <= 0) return;
    const def = LD.SFX_SYNTH[key];
    const gap = def ? def.gap : 0.05;
    const now = c.currentTime;
    if (this.last[key] !== undefined && now - this.last[key] < gap) return;
    this.last[key] = now;

    const buf = this.buffers[key];
    if (buf) {
      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(this.master);
      src.start();
      return;
    }
    if (def) this.synth(def);
  },

  synth(d) {
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = d.type;
    o.frequency.setValueAtTime(d.f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, d.f1), t + d.dur);
    g.gain.setValueAtTime(d.vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d.dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + d.dur + 0.02);
  },

  playMusic(key) {
    this._wantMusic = key;
    if (this.musicKey === key && this.musicSrc) return;
    this.stopMusic();
    const c = this.ctx;
    const buf = this.buffers[key];
    if (!c || !buf || c.state !== 'running') return;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(this.musicGain);
    src.start();
    this.musicSrc = src;
    this.musicKey = key;
  },

  stopMusic() {
    if (this.musicSrc) { try { this.musicSrc.stop(); } catch (e) { } }
    this.musicSrc = null;
    this.musicKey = null;
  },
};
