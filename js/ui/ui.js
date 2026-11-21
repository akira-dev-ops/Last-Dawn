// Utilidades de interface desenhadas no canvas (botões, textos, painéis).
LD.COLORS = {
  bg: '#120a1f',
  panel: 'rgba(28,16,48,0.92)',
  panelBorder: '#6b4fa3',
  text: '#f4ecff',
  dim: '#a898c8',
  accent: '#ffb347',
  accent2: '#ff6f61',
  good: '#6bdc8b',
  bad: '#ff5470',
  xp: '#58c7ff',
};

LD.UI = {
  font(size, weight) {
    return (weight || 'bold') + ' ' + size + 'px "Trebuchet MS", "Segoe UI", Roboto, sans-serif';
  },

  text(g, str, x, y, size, color, align, weight) {
    g.font = this.font(size, weight);
    g.fillStyle = color || LD.COLORS.text;
    g.textAlign = align || 'center';
    g.textBaseline = 'middle';
    g.fillText(str, x, y);
  },

  // Texto com contorno (legível sobre o jogo)
  outlined(g, str, x, y, size, color, align) {
    g.font = this.font(size);
    g.textAlign = align || 'center';
    g.textBaseline = 'middle';
    g.lineWidth = Math.max(3, size * 0.16);
    g.strokeStyle = 'rgba(0,0,0,0.85)';
    g.strokeText(str, x, y);
    g.fillStyle = color || '#fff';
    g.fillText(str, x, y);
  },

  // Quebra o texto em linhas que caibam em maxW; retorna a altura usada.
  wrap(g, str, x, y, maxW, size, color, align, lineH) {
    g.font = this.font(size, 'normal');
    g.fillStyle = color || LD.COLORS.text;
    g.textAlign = align || 'left';
    g.textBaseline = 'top';
    lineH = lineH || size * 1.25;
    const words = String(str).split(' ');
    let line = '', yy = y;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + ' ' + words[i] : words[i];
      if (g.measureText(test).width > maxW && line) {
        g.fillText(line, x, yy);
        line = words[i];
        yy += lineH;
      } else line = test;
    }
    if (line) { g.fillText(line, x, yy); yy += lineH; }
    return yy - y;
  },

  roundRect(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  },

  panel(g, x, y, w, h, fill, border) {
    this.roundRect(g, x, y, w, h, 22);
    g.fillStyle = fill || LD.COLORS.panel;
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = border || LD.COLORS.panelBorder;
    g.stroke();
  },

  bar(g, x, y, w, h, pct, color, back) {
    pct = Math.max(0, Math.min(1, pct));
    this.roundRect(g, x, y, w, h, h / 2);
    g.fillStyle = back || 'rgba(0,0,0,0.55)';
    g.fill();
    if (pct > 0) {
      this.roundRect(g, x, y, Math.max(h, w * pct), h, h / 2);
      g.fillStyle = color;
      g.fill();
    }
  },

  // ---------- Botões ----------
  // b = { x, y, w, h, label, onClick, color, small, hidden, disabled }
  button(x, y, w, h, label, onClick, opts) {
    return Object.assign({ x, y, w, h, label, onClick, pressed: false, _pid: null }, opts || {});
  },

  hit(b, x, y) {
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  },

  pressButtons(list, x, y, pid) {
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      if (b.hidden || b.disabled) continue;
      if (this.hit(b, x, y)) { b.pressed = true; b._pid = pid; return true; }
    }
    return false;
  },

  releaseButtons(list, x, y, pid) {
    let handled = false;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      if (b._pid !== pid) continue;
      handled = true;
      const ok = b.pressed && this.hit(b, x, y);
      b.pressed = false;
      b._pid = null;
      if (ok && b.onClick) {
        LD.Audio.play('click');
        LD.vibrate(12);
        b.onClick(b);
        break;
      }
    }
    return handled;
  },

  drawButton(g, b) {
    if (b.hidden) return;
    const p = b.pressed ? 4 : 0;
    const base = b.color || '#5a3a9a';
    // sombra
    this.roundRect(g, b.x, b.y + 6, b.w, b.h, 20);
    g.fillStyle = 'rgba(0,0,0,0.45)';
    g.fill();
    this.roundRect(g, b.x, b.y + p, b.w, b.h, 20);
    g.fillStyle = b.disabled ? '#3a3448' : base;
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = b.pressed ? '#fff' : 'rgba(255,255,255,0.35)';
    g.stroke();
    // brilho superior
    this.roundRect(g, b.x + 6, b.y + p + 5, b.w - 12, b.h * 0.38, 14);
    g.fillStyle = 'rgba(255,255,255,0.10)';
    g.fill();
    this.text(g, b.label, b.x + b.w / 2, b.y + b.h / 2 + p, b.fontSize || 38,
      b.disabled ? '#888' : (b.textColor || '#fff'));
  },

  drawButtons(g, list) {
    for (let i = 0; i < list.length; i++) this.drawButton(g, list[i]);
  },

  // ---------- Fundo ----------
  // Usa a imagem configurada (menuBg/loadingBg) ou um céu de amanhecer gerado.
  background(g, key, t) {
    const img = LD.Assets.img(key);
    if (img) {
      // "cover": preenche sem distorcer
      const s = Math.max(LD.W / img.width, LD.H / img.height);
      const w = img.width * s, h = img.height * s;
      g.drawImage(img, (LD.W - w) / 2, (LD.H - h) / 2, w, h);
      return;
    }
    const spr = LD.Sprites.get('dawnbg_' + LD.H, LD.W, LD.H, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#0b0618');
      gr.addColorStop(0.45, '#2a1145');
      gr.addColorStop(0.72, '#7a2a5a');
      gr.addColorStop(0.86, '#e0704a');
      gr.addColorStop(1, '#ffc46b');
      c.fillStyle = gr;
      c.fillRect(0, 0, w, h);
      // estrelas
      let seed = 7;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 140; i++) {
        c.fillStyle = 'rgba(255,255,255,' + (0.2 + rnd() * 0.7) + ')';
        const sz = rnd() * 2.6 + 0.6;
        c.fillRect(rnd() * w, rnd() * h * 0.6, sz, sz);
      }
      // sol nascendo
      const sy = h * 0.93;
      const sg = c.createRadialGradient(w / 2, sy, 10, w / 2, sy, 420);
      sg.addColorStop(0, 'rgba(255,240,190,1)');
      sg.addColorStop(0.25, 'rgba(255,190,110,0.8)');
      sg.addColorStop(1, 'rgba(255,120,80,0)');
      c.fillStyle = sg;
      c.fillRect(0, 0, w, h);
      // montanhas
      c.fillStyle = '#1a0c28';
      c.beginPath();
      c.moveTo(0, h);
      let x = 0, yy = h * 0.88;
      c.lineTo(0, yy);
      while (x < w) {
        x += 40 + rnd() * 70;
        yy = h * (0.8 + rnd() * 0.1);
        c.lineTo(x, yy);
      }
      c.lineTo(w, h);
      c.closePath();
      c.fill();
    });
    g.drawImage(spr, 0, 0);
  },

  // Ícone de poder/melhoria: imagem 'icon_<id>' ou placeholder.
  icon(g, def, x, y, size, locked) {
    const img = !locked && LD.Assets.img('icon_' + def.id);
    if (img) { g.drawImage(img, x - size / 2, y - size / 2, size, size); return; }
    const key = 'icon_' + def.id + '_' + Math.round(size) + (locked ? '_l' : '');
    const spr = LD.Sprites.get(key, size, size, (c, w) => {
      const r = w / 2;
      const color = locked ? '#3b3350' : def.color;
      const gr = c.createRadialGradient(r * 0.7, r * 0.6, 2, r, r, r);
      gr.addColorStop(0, locked ? '#4a4260' : '#ffffff');
      gr.addColorStop(0.3, color);
      gr.addColorStop(1, locked ? '#1d1830' : '#1a1030');
      c.fillStyle = gr;
      c.beginPath(); c.arc(r, r, r - 2, 0, Math.PI * 2); c.fill();
      c.lineWidth = 3;
      c.strokeStyle = locked ? '#555' : (def.kind === 'passive' ? '#ffd27a' : '#ffffff');
      c.stroke();
      c.fillStyle = locked ? '#777' : '#fff';
      c.font = 'bold ' + Math.round(w * 0.42) + 'px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.lineWidth = 4;
      c.strokeStyle = 'rgba(0,0,0,0.6)';
      const glyph = locked ? '?' : (def.glyph || def.name[0]);
      c.strokeText(glyph, r, r + 2);
      c.fillText(glyph, r, r + 2);
    });
    g.drawImage(spr, x - size / 2, y - size / 2);
  },
};

// Tempo em mm:ss
LD.fmtTime = function (s) {
  s = Math.floor(s);
  const m = Math.floor(s / 60), r = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
};
