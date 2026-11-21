// Carregador de imagens e sons definidos em js/data/assets.js
LD.Assets = {
  images: {},

  load(onProgress, onDone) {
    const list = [];
    const F = LD.ASSET_FILES;
    for (const k in F.images) if (F.images[k] && !this.images[k]) list.push(['img', k, F.images[k]]);
    for (const k in F.sounds) if (F.sounds[k]) list.push(['snd', k, F.sounds[k]]);

    const total = list.length;
    let loaded = 0;
    if (total === 0) { onProgress(1); onDone(); return; }

    const done = () => {
      loaded++;
      onProgress(loaded / total);
      if (loaded === total) onDone();
    };

    for (const [kind, key, path] of list) {
      if (kind === 'img') {
        const img = new Image();
        img.onload = () => { this.images[key] = img; done(); };
        img.onerror = () => { console.warn('[Last Dawn] imagem não carregou:', path); done(); };
        img.src = path;
      } else {
        LD.Audio.loadFile(key, path, done);
      }
    }
  },

  // Carrega uma imagem isolada (usada para mostrar o fundo do carregamento primeiro)
  loadOne(key, cb) {
    const path = LD.ASSET_FILES.images[key];
    if (!path || this.images[key]) { cb(); return; }
    const img = new Image();
    img.onload = () => { this.images[key] = img; cb(); };
    img.onerror = () => cb();
    img.src = path;
  },

  // Retângulo da imagem desenhada em modo "cover" (preenche a tela sem distorcer)
  coverRect(img) {
    const s = Math.max(LD.W / img.width, LD.H / img.height);
    const w = img.width * s, h = img.height * s;
    const r = this._cover || (this._cover = {});
    r.x = (LD.W - w) / 2; r.y = (LD.H - h) / 2; r.w = w; r.h = h; r.s = s;
    return r;
  },

  img(key) { return this.images[key] || null; },
};
