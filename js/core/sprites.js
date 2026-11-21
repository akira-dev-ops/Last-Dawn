// Cache de sprites pré-renderizados em canvas (rápido no celular).
// Também desenha os placeholders (formas simples) quando não há imagem.
LD.Sprites = {
  cache: {},

  get(key, w, h, drawFn) {
    let c = this.cache[key];
    if (c) return c;
    c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h || w));
    drawFn(c.getContext('2d'), c.width, c.height);
    this.cache[key] = c;
    return c;
  },

  // Brilho radial (projéteis, orbes, auras)
  glow(color, r, core) {
    const key = 'glow_' + color + '_' + Math.round(r) + '_' + (core || '');
    return this.get(key, r * 2, r * 2, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, core || '#ffffff');
      gr.addColorStop(0.35, color);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, w);
    });
  },

  // Desenha um corpo (jogador/inimigo) por formato
  shape(g, shape, s, color, white) {
    const c = s / 2;
    const fill = white ? '#ffffff' : color;
    g.lineWidth = Math.max(2, s * 0.05);
    g.strokeStyle = white ? '#ffffff' : 'rgba(0,0,0,0.55)';
    g.fillStyle = fill;
    const eyes = (ey, sp, er) => {
      if (white) return;
      g.fillStyle = '#fff';
      g.beginPath(); g.arc(c - sp, ey, er, 0, Math.PI * 2); g.arc(c + sp, ey, er, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#111';
      g.beginPath(); g.arc(c - sp, ey, er * 0.5, 0, Math.PI * 2); g.arc(c + sp, ey, er * 0.5, 0, Math.PI * 2); g.fill();
    };
    g.beginPath();
    switch (shape) {
      case 'hero': {
        g.arc(c, c, s * 0.44, 0, Math.PI * 2); g.fill(); g.stroke();
        if (!white) {
          g.fillStyle = '#ffe6a8';
          g.beginPath(); g.arc(c, c - s * 0.05, s * 0.26, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#2a1840';
          g.beginPath(); g.arc(c - s * 0.09, c - s * 0.07, s * 0.04, 0, Math.PI * 2);
          g.arc(c + s * 0.09, c - s * 0.07, s * 0.04, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#ffcf4a';
          g.beginPath(); g.moveTo(c - s * 0.3, c - s * 0.2); g.lineTo(c, c - s * 0.46);
          g.lineTo(c + s * 0.3, c - s * 0.2); g.closePath(); g.fill();
        }
        break;
      }
      case 'blob':
        g.ellipse(c, c + s * 0.06, s * 0.44, s * 0.36, 0, 0, Math.PI * 2); g.fill(); g.stroke();
        eyes(c - s * 0.02, s * 0.14, s * 0.08);
        break;
      case 'bat':
        g.moveTo(c, c - s * 0.2);
        g.lineTo(c + s * 0.48, c - s * 0.3); g.lineTo(c + s * 0.3, c + s * 0.05);
        g.lineTo(c + s * 0.15, c + s * 0.3); g.lineTo(c, c + s * 0.15);
        g.lineTo(c - s * 0.15, c + s * 0.3); g.lineTo(c - s * 0.3, c + s * 0.05);
        g.lineTo(c - s * 0.48, c - s * 0.3); g.closePath(); g.fill(); g.stroke();
        eyes(c - s * 0.02, s * 0.08, s * 0.06);
        break;
      case 'wisp':
        g.moveTo(c, c - s * 0.46);
        g.quadraticCurveTo(c + s * 0.46, c, c, c + s * 0.44);
        g.quadraticCurveTo(c - s * 0.46, c, c, c - s * 0.46);
        g.fill(); g.stroke();
        eyes(c + s * 0.04, s * 0.09, s * 0.06);
        break;
      case 'square':
        g.rect(c - s * 0.4, c - s * 0.4, s * 0.8, s * 0.8); g.fill(); g.stroke();
        eyes(c - s * 0.08, s * 0.16, s * 0.07);
        break;
      case 'knight':
        g.moveTo(c, c - s * 0.46); g.lineTo(c + s * 0.4, c - s * 0.15);
        g.lineTo(c + s * 0.3, c + s * 0.42); g.lineTo(c - s * 0.3, c + s * 0.42);
        g.lineTo(c - s * 0.4, c - s * 0.15); g.closePath(); g.fill(); g.stroke();
        if (!white) { g.fillStyle = '#ff4444'; g.fillRect(c - s * 0.22, c - s * 0.08, s * 0.44, s * 0.08); }
        break;
      case 'boss': {
        const spikes = 10;
        for (let i = 0; i <= spikes * 2; i++) {
          const a = (i / (spikes * 2)) * Math.PI * 2;
          const rr = (i % 2 === 0 ? 0.48 : 0.36) * s;
          const x = c + Math.cos(a) * rr, y = c + Math.sin(a) * rr;
          if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.closePath(); g.fill(); g.stroke();
        eyes(c - s * 0.04, s * 0.12, s * 0.07);
        break;
      }
      default:
        g.arc(c, c, s * 0.44, 0, Math.PI * 2); g.fill(); g.stroke();
    }
  },

  // Sprite de corpo: usa imagem do arquivo se existir, senão placeholder.
  body(imgKey, shape, color, size, white) {
    const img = LD.Assets.img(imgKey);
    if (img && !white) return img;
    const key = 'body_' + imgKey + '_' + shape + '_' + color + '_' + Math.round(size) + (white ? '_w' : '');
    if (img && white) {
      // versão branca da imagem para "flash" de dano
      return this.get(key, size, size, (g, w) => {
        g.drawImage(img, 0, 0, w, w);
        g.globalCompositeOperation = 'source-in';
        g.fillStyle = '#fff';
        g.fillRect(0, 0, w, w);
      });
    }
    return this.get(key, size, size, (g, w) => this.shape(g, shape, w, color, white));
  },
};
