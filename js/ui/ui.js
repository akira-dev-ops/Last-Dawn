// =============================================================
// Sistema visual da interface (desenhado no canvas).
// Paleta, fontes, molduras, botões, barras e ícones.
// =============================================================
LD.COLORS = {
  ink: '#0d0a12',
  panel: 'rgba(13,10,18,0.88)',
  panelSoft: 'rgba(13,10,18,0.62)',
  gold: '#c9a45c',
  goldLight: '#f1d79a',
  goldDark: '#6e5428',
  ember: '#c4522a',
  emberLight: '#ec8a4a',
  text: '#efe6d6',
  dim: '#a59b89',
  muted: '#6f6759',
  accent: '#e8b45a',
  good: '#86c36e',
  bad: '#c8433f',
  xp: '#74c0ec',
  panelBorder: '#c9a45c',
};

LD.FONTS = {
  display: '"Cinzel", "Georgia", "Times New Roman", serif',
  body: '"Alegreya Sans", "Trebuchet MS", "Segoe UI", sans-serif',
};

LD.UI = {
  // ---------- Texto ----------
  font(size, weight, family) {
    const w = weight === 'normal' ? 400 : (weight === 'bold' || weight === undefined ? 700 : weight);
    return w + ' ' + Math.round(size) + 'px ' + (family === 'display' ? LD.FONTS.display : LD.FONTS.body);
  },

  spacing(g, px) {
    if ('letterSpacing' in g) g.letterSpacing = px ? px + 'px' : '0px';
  },

  // Texto comum (Alegreya Sans)
  text(g, str, x, y, size, color, align, weight) {
    g.font = this.font(size, weight);
    g.fillStyle = color || LD.COLORS.text;
    g.textAlign = align || 'center';
    g.textBaseline = 'middle';
    g.fillText(str, x, y);
  },

  // Rótulo em versalete clássico (Cinzel) com espaçamento entre letras
  label(g, str, x, y, size, color, align, spacing, weight) {
    g.font = this.font(size, weight || 700, 'display');
    g.fillStyle = color || LD.COLORS.text;
    g.textAlign = align || 'center';
    g.textBaseline = 'middle';
    this.spacing(g, spacing === undefined ? Math.round(size * 0.12) : spacing);
    g.fillText(str, x, y);
    this.spacing(g, 0);
  },

  // Texto sobre o jogo/arte: contorno fino escuro + sombra curta
  outlined(g, str, x, y, size, color, align, family) {
    g.font = this.font(size, 700, family || 'display');
    g.textAlign = align || 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    g.lineWidth = Math.max(2, size * 0.14);
    g.strokeStyle = 'rgba(8,5,12,0.9)';
    g.strokeText(str, x, y + size * 0.04);
    g.fillStyle = color || '#fff';
    g.fillText(str, x, y);
  },

  // Quebra o texto em linhas que caibam em maxW; retorna a altura usada.
  wrap(g, str, x, y, maxW, size, color, align, lineH, weight) {
    g.font = this.font(size, weight || 400);
    g.fillStyle = color || LD.COLORS.text;
    g.textAlign = align || 'left';
    g.textBaseline = 'top';
    lineH = lineH || size * 1.22;
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

  // Logotipo "LAST DAWN"
  logo(g, cx, cy, scale) {
    const s = scale || 1;
    g.save();
    g.translate(cx, cy);
    g.scale(s, s);
    g.font = this.font(92, 900, 'display');
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    this.spacing(g, 6);
    // sombra
    g.fillStyle = 'rgba(5,3,8,0.75)';
    g.fillText('LAST DAWN', 0, 6);
    // corpo dourado
    const gr = g.createLinearGradient(0, -44, 0, 44);
    gr.addColorStop(0, '#fff2cf');
    gr.addColorStop(0.45, '#f0c879');
    gr.addColorStop(0.55, '#c98d3c');
    gr.addColorStop(1, '#8a5a24');
    g.fillStyle = gr;
    g.fillText('LAST DAWN', 0, 0);
    g.lineWidth = 1.5;
    g.strokeStyle = 'rgba(255,240,200,0.35)';
    g.strokeText('LAST DAWN', 0, 0);
    this.spacing(g, 0);
    g.restore();
    this.divider(g, cx, cy + 62 * s, 380 * s);
  },

  // ---------- Formas ----------
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

  // Retângulo com cantos chanfrados (octógono)
  chamfer(g, x, y, w, h, c) {
    c = Math.min(c, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + c, y);
    g.lineTo(x + w - c, y);
    g.lineTo(x + w, y + c);
    g.lineTo(x + w, y + h - c);
    g.lineTo(x + w - c, y + h);
    g.lineTo(x + c, y + h);
    g.lineTo(x, y + h - c);
    g.lineTo(x, y + c);
    g.closePath();
  },

  diamond(g, x, y, r, fill, stroke) {
    g.beginPath();
    g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y);
    g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.lineWidth = 1.5; g.strokeStyle = stroke; g.stroke(); }
  },

  // Linha ornamental: some nas pontas, losango no centro
  divider(g, cx, y, w, color) {
    const c = color || LD.COLORS.gold;
    const gr = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    gr.addColorStop(0, 'rgba(201,164,92,0)');
    gr.addColorStop(0.5, c);
    gr.addColorStop(1, 'rgba(201,164,92,0)');
    g.fillStyle = gr;
    g.fillRect(cx - w / 2, y - 1, w, 2);
    this.diamond(g, cx, y, 7, LD.COLORS.ink, c);
    this.diamond(g, cx, y, 3, c);
  },

  // Moldura principal: fundo escuro, filete dourado duplo, cantos chanfrados.
  // opts: { fill, border, c, ornaments, glow }
  frame(g, x, y, w, h, opts) {
    const o = opts || {};
    const c = o.c === undefined ? 14 : o.c;
    this.chamfer(g, x, y, w, h, c);
    g.fillStyle = o.fill || LD.COLORS.panel;
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = o.border || LD.COLORS.gold;
    g.stroke();
    if (o.inner !== false && w > 40 && h > 30) {
      this.chamfer(g, x + 5, y + 5, w - 10, h - 10, Math.max(2, c - 4));
      g.lineWidth = 1;
      g.strokeStyle = 'rgba(201,164,92,0.28)';
      g.stroke();
    }
    if (o.ornaments) {
      this.diamond(g, x, y + h / 2, 7, LD.COLORS.ink, o.border || LD.COLORS.gold);
      this.diamond(g, x + w, y + h / 2, 7, LD.COLORS.ink, o.border || LD.COLORS.gold);
    }
  },

  panel(g, x, y, w, h, fill, border) {
    this.frame(g, x, y, w, h, { fill, border });
  },

  // Barra de progresso com moldura fina
  bar(g, x, y, w, h, pct, color, back, color2) {
    pct = Math.max(0, Math.min(1, pct));
    g.fillStyle = back || 'rgba(8,6,12,0.85)';
    g.fillRect(x, y, w, h);
    if (pct > 0) {
      const gr = g.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, color2 || this.lighten(color));
      gr.addColorStop(1, color);
      g.fillStyle = gr;
      g.fillRect(x, y, w * pct, h);
      g.fillStyle = 'rgba(255,255,255,0.18)';
      g.fillRect(x, y, w * pct, Math.max(1, h * 0.3));
    }
    g.lineWidth = 1.5;
    g.strokeStyle = 'rgba(201,164,92,0.75)';
    g.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
  },

  lighten(hex) {
    if (!hex || hex[0] !== '#' || hex.length !== 7) return hex;
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (n >> 16) + 60), gg = Math.min(255, ((n >> 8) & 255) + 60), b = Math.min(255, (n & 255) + 60);
    return 'rgb(' + r + ',' + gg + ',' + b + ')';
  },

  // Pontinhos de nível (ex.: 3 de 7)
  pips(g, x, y, level, max, size, align, highlight) {
    const s = size || 7, gap = s * 2.3;
    const total = (max - 1) * gap;
    let px = align === 'left' ? x + s : (align === 'right' ? x - total - s : x - total / 2);
    for (let i = 0; i < max; i++) {
      const on = i < level;
      const isNew = highlight && i === level - 1;
      this.diamond(g, px, y, s, on ? (isNew ? '#fff2cf' : LD.COLORS.gold) : 'rgba(255,255,255,0.08)',
        on ? null : 'rgba(201,164,92,0.45)');
      px += gap;
    }
  },

  // Interruptor (liga/desliga)
  toggle(g, x, y, on) {
    const w = 92, h = 44;
    this.roundRect(g, x, y, w, h, h / 2);
    g.fillStyle = on ? 'rgba(196,82,42,0.9)' : 'rgba(255,255,255,0.08)';
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = on ? LD.COLORS.goldLight : 'rgba(201,164,92,0.5)';
    g.stroke();
    const kx = on ? x + w - h / 2 : x + h / 2;
    g.beginPath(); g.arc(kx, y + h / 2, h / 2 - 6, 0, Math.PI * 2);
    g.fillStyle = on ? '#fff6e4' : '#8f8676';
    g.fill();
  },

  // ---------- Botões ----------
  // b = { x, y, w, h, label, onClick, style: 'primary'|'secondary'|'ghost'|'icon', glyph, hidden, disabled, draw }
  button(x, y, w, h, label, onClick, opts) {
    return Object.assign({ x, y, w, h, label, onClick, style: 'secondary', pressed: false, _pid: null }, opts || {});
  },

  hit(b, x, y) {
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  },

  pressButtons(list, x, y, pid) {
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      if (b.hidden || b.disabled) continue;
      // área de toque um pouco maior que o desenho
      const pad = b.style === 'icon' ? 14 : 6;
      if (x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad) {
        b.pressed = true; b._pid = pid; return true;
      }
    }
    return false;
  },

  releaseButtons(list, x, y, pid) {
    let handled = false;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      if (b._pid !== pid) continue;
      handled = true;
      const pad = b.style === 'icon' ? 14 : 6;
      const ok = b.pressed && x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad;
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
    if (b.draw) { b.draw(g, b); return; }
    const C = LD.COLORS;
    const p = b.pressed ? 2 : 0;
    const x = b.x, y = b.y + p, w = b.w, h = b.h;

    if (b.style === 'ghost') {
      const col = b.pressed ? C.goldLight : (b.textColor || C.dim);
      this.label(g, b.label, x + w / 2, y + h / 2, b.fontSize || 22, col, 'center', 3);
      return;
    }

    if (b.style === 'icon') {
      this.chamfer(g, x, y, w, h, 10);
      g.fillStyle = b.pressed ? 'rgba(60,44,30,0.95)' : 'rgba(13,10,18,0.78)';
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = b.pressed ? C.goldLight : C.gold;
      g.stroke();
      this.glyph(g, b.glyph, x + w / 2, y + h / 2, Math.min(w, h) * 0.46, b.pressed ? '#fff6e4' : C.goldLight);
      return;
    }

    const primary = b.style === 'primary';
    const c = primary ? 16 : 12;
    // sombra
    this.chamfer(g, x + 2, y + 5, w, h, c);
    g.fillStyle = 'rgba(0,0,0,0.45)';
    g.fill();
    // corpo
    this.chamfer(g, x, y, w, h, c);
    let fill;
    if (b.disabled) fill = '#24202a';
    else if (primary) {
      fill = g.createLinearGradient(0, y, 0, y + h);
      fill.addColorStop(0, b.pressed ? '#d86a3a' : '#e07a42');
      fill.addColorStop(0.5, b.pressed ? '#a9431f' : '#b54a22');
      fill.addColorStop(1, '#6e2412');
    } else {
      fill = g.createLinearGradient(0, y, 0, y + h);
      fill.addColorStop(0, b.pressed ? 'rgba(58,44,34,0.95)' : 'rgba(34,27,36,0.92)');
      fill.addColorStop(1, b.pressed ? 'rgba(30,22,18,0.95)' : 'rgba(14,11,18,0.92)');
    }
    g.fillStyle = fill;
    g.fill();
    g.lineWidth = primary ? 2.5 : 2;
    g.strokeStyle = b.pressed ? C.goldLight : (primary ? '#f0cf8a' : C.gold);
    g.stroke();
    // filete interno
    this.chamfer(g, x + 5, y + 5, w - 10, h - 10, c - 4);
    g.lineWidth = 1;
    g.strokeStyle = primary ? 'rgba(255,226,170,0.45)' : 'rgba(201,164,92,0.25)';
    g.stroke();
    if (primary) {
      this.diamond(g, x, y + h / 2, 8, '#2a140c', C.goldLight);
      this.diamond(g, x + w, y + h / 2, 8, '#2a140c', C.goldLight);
    }

    const fs = b.fontSize || (primary ? 40 : 26);
    const tc = b.disabled ? '#6a6458' : (primary ? '#fff4e0' : C.text);
    if (b.glyph) {
      // ícone + texto, centralizados juntos
      g.font = this.font(fs, 700, 'display');
      this.spacing(g, 2);
      const tw = g.measureText(b.label).width;
      this.spacing(g, 0);
      const gs = fs * 1.1, total = gs + 12 + tw;
      const sx = x + (w - total) / 2;
      this.glyph(g, b.glyph, sx + gs / 2, y + h / 2, gs, primary ? '#fff4e0' : C.goldLight);
      if (primary) {
        g.fillStyle = 'rgba(40,12,4,0.6)';
      }
      this.label(g, b.label, sx + gs + 12, y + h / 2 + 1, fs, tc, 'left', 2);
    } else {
      if (primary) this.label(g, b.label, x + w / 2 + 1, y + h / 2 + 3, fs, 'rgba(50,14,4,0.55)', 'center', 4);
      this.label(g, b.label, x + w / 2, y + h / 2 + 1, fs, tc, 'center', primary ? 4 : 2);
    }
  },

  drawButtons(g, list) {
    for (let i = 0; i < list.length; i++) this.drawButton(g, list[i]);
  },

  // ---------- Fundos ----------
  // Usa a imagem configurada (menuBg/loadingBg) ou um céu de amanhecer gerado.
  background(g, key, t) {
    const img = LD.Assets.img(key);
    if (img) {
      const r = LD.Assets.coverRect(img);
      g.drawImage(img, r.x, r.y, r.w, r.h);
      return;
    }
    const spr = LD.Sprites.get('dawnbg_' + LD.H, LD.W, LD.H, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#0b0814');
      gr.addColorStop(0.5, '#241a2e');
      gr.addColorStop(0.8, '#6a3a32');
      gr.addColorStop(1, '#d9894a');
      c.fillStyle = gr;
      c.fillRect(0, 0, w, h);
      let seed = 7;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 120; i++) {
        c.fillStyle = 'rgba(255,245,225,' + (0.15 + rnd() * 0.6) + ')';
        const sz = rnd() * 2.2 + 0.6;
        c.fillRect(rnd() * w, rnd() * h * 0.6, sz, sz);
      }
      c.fillStyle = '#120d16';
      c.beginPath();
      c.moveTo(0, h);
      let x = 0;
      c.lineTo(0, h * 0.86);
      while (x < w) { x += 40 + rnd() * 70; c.lineTo(x, h * (0.8 + rnd() * 0.1)); }
      c.lineTo(w, h);
      c.closePath();
      c.fill();
    });
    g.drawImage(spr, 0, 0);
  },

  // Vinheta (bordas escuras) + escurecimento embaixo para a leitura dos botões
  vignette(g, bottom) {
    const key = 'vignette_' + LD.H + '_' + (bottom || 0);
    const spr = LD.Sprites.get(key, LD.W, LD.H, (c, w, h) => {
      const rg = c.createRadialGradient(w / 2, h * 0.45, h * 0.25, w / 2, h * 0.45, h * 0.75);
      rg.addColorStop(0, 'rgba(5,3,8,0)');
      rg.addColorStop(1, 'rgba(5,3,8,0.75)');
      c.fillStyle = rg;
      c.fillRect(0, 0, w, h);
      if (bottom) {
        const lg = c.createLinearGradient(0, h * (1 - bottom), 0, h);
        lg.addColorStop(0, 'rgba(7,5,10,0)');
        lg.addColorStop(0.45, 'rgba(7,5,10,0.6)');
        lg.addColorStop(1, 'rgba(7,5,10,0.92)');
        c.fillStyle = lg;
        c.fillRect(0, h * (1 - bottom), w, h * bottom);
      }
    });
    g.drawImage(spr, 0, 0);
  },

  // ---------- Ícones ----------
  // Glifo vetorial em cache (os glifos usam recortes, por isso nunca vão direto na tela)
  glyph(g, name, x, y, size, color) {
    if (!name || !LD.Glyphs[name]) return;
    const s = Math.round(size);
    const spr = LD.Sprites.get('glyph_' + name + '_' + s + '_' + color, s + 4, s + 4, (c, w) => {
      LD.drawGlyph(c, name, w / 2, w / 2, s, color);
    });
    g.drawImage(spr, x - (s + 4) / 2, y - (s + 4) / 2);
  },

  // Ícone de poder (moldura chanfrada) ou melhoria (moldura redonda).
  // Usa a imagem 'icon_<id>' se existir.
  icon(g, def, x, y, size, locked) {
    const img = !locked && LD.Assets.img('icon_' + def.id);
    if (img) { g.drawImage(img, x - size / 2, y - size / 2, size, size); return; }
    const S = Math.round(size);
    const key = 'icon2_' + def.id + '_' + S + (locked ? '_l' : '');
    const spr = LD.Sprites.get(key, S + 4, S + 4, (c, w) => {
      const m = w / 2, r = S / 2;
      const round = def.kind === 'passive';
      const path = () => {
        if (round) { c.beginPath(); c.arc(m, m, r - 1, 0, Math.PI * 2); }
        else this.chamfer(c, m - r + 1, m - r + 1, S - 2, S - 2, S * 0.2);
      };
      // fundo
      path();
      const gr = c.createRadialGradient(m, m - r * 0.3, 1, m, m, r * 1.1);
      if (locked) {
        gr.addColorStop(0, '#2a2530'); gr.addColorStop(1, '#100d14');
      } else {
        gr.addColorStop(0, this.mix(def.color, '#ffffff', 0.15));
        gr.addColorStop(0.55, this.mix(def.color, '#0d0a12', 0.55));
        gr.addColorStop(1, '#0d0a12');
      }
      c.fillStyle = gr;
      c.fill();
      // moldura
      c.lineWidth = Math.max(2, S * 0.05);
      c.strokeStyle = locked ? '#4a4350' : (round ? '#d9d2c4' : LD.COLORS.gold);
      c.stroke();
      // filete interno
      c.save();
      c.translate(m, m); c.scale(0.86, 0.86); c.translate(-m, -m);
      path();
      c.restore();
      c.lineWidth = 1;
      c.strokeStyle = locked ? 'rgba(255,255,255,0.06)' : 'rgba(255,240,210,0.25)';
      c.stroke();
      // glifo
      const gname = locked ? 'lock' : (def.icon || LD.GLYPH_FOR[def.id]);
      if (gname && LD.Glyphs[gname]) {
        const col = locked ? '#5d5664' : this.mix(def.color, '#ffffff', 0.65);
        // sombra do glifo
        c.save(); c.globalAlpha = 0.6;
        LD.drawGlyph(c, gname, m + 1, m + 2, S * 0.56, '#000');
        c.restore();
        LD.drawGlyph(c, gname, m, m, S * 0.56, col);
      } else {
        c.fillStyle = '#fff';
        c.font = '700 ' + Math.round(S * 0.42) + 'px ' + LD.FONTS.display;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText((def.name || '?')[0], m, m + 2);
      }
    });
    g.drawImage(spr, x - (S + 4) / 2, y - (S + 4) / 2);
  },

  // Mistura duas cores hex (t=0 -> a, t=1 -> b)
  mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round((pa >> 16) * (1 - t) + (pb >> 16) * t);
    const gg = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
    const bb = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
    return 'rgb(' + r + ',' + gg + ',' + bb + ')';
  },

  // Cabeçalho das telas do menu: botão voltar + título + divisória
  header(g, title, subtitle) {
    const W = LD.W;
    this.label(g, title, W / 2, 84, 46, LD.COLORS.goldLight, 'center', 5);
    this.divider(g, W / 2, 124, 300);
    if (subtitle) this.text(g, subtitle, W / 2, 156, 24, LD.COLORS.dim, 'center', 500);
  },

  backButton(onClick) {
    return this.button(28, 50, 68, 68, '', onClick, { style: 'icon', glyph: 'back' });
  },
};

// Tempo em mm:ss
LD.fmtTime = function (s) {
  s = Math.floor(s);
  const m = Math.floor(s / 60), r = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
};
