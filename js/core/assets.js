// Carregador de imagens e sons definidos em js/data/assets.js
LD.Assets = {
  images: {},

  load(onProgress, onDone) {
    const list = [];
    const F = LD.ASSET_FILES;
    for (const k in F.images) if (F.images[k]) list.push(['img', k, F.images[k]]);
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

  img(key) { return this.images[key] || null; },
};
