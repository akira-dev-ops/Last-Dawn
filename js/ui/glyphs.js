// =============================================================
// Ícones vetoriais (desenhados no espaço -1..1, centro em 0,0).
// Cada função usa o fillStyle/strokeStyle já definidos.
// Para trocar por imagem, use 'icon_<id>' em js/data/assets.js.
// =============================================================
LD.Glyphs = {
  // ---------- Poderes ----------
  blade(g) {
    // duas lâminas de vento em crescente
    for (const [ox, oy, s] of [[-0.12, 0.12, 1], [0.22, -0.22, 0.7]]) {
      g.save();
      g.translate(ox, oy);
      g.scale(s, s);
      g.beginPath();
      g.arc(-0.35, 0.35, 1.05, -1.35, -0.2);
      g.arc(-0.6, 0.6, 1.0, -0.25, -1.3, true);
      g.closePath();
      g.fill();
      g.restore();
    }
  },
  flame(g) {
    g.beginPath();
    g.moveTo(0, -0.95);
    g.bezierCurveTo(0.35, -0.5, 0.75, -0.25, 0.7, 0.3);
    g.bezierCurveTo(0.65, 0.75, 0.3, 0.92, 0, 0.92);
    g.bezierCurveTo(-0.4, 0.92, -0.72, 0.65, -0.7, 0.25);
    g.bezierCurveTo(-0.68, -0.1, -0.4, -0.25, -0.35, -0.55);
    g.bezierCurveTo(-0.15, -0.35, -0.05, -0.6, 0, -0.95);
    g.fill();
    // espiral interna
    g.save();
    g.globalCompositeOperation = 'destination-out';
    g.lineWidth = 0.16;
    g.lineCap = 'round';
    g.beginPath();
    for (let i = 0; i <= 28; i++) {
      const a = i * 0.32, r = 0.05 + i * 0.016;
      const x = Math.cos(a) * r, y = 0.38 + Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
    g.restore();
  },
  bolt(g) {
    g.beginPath();
    g.moveTo(0.2, -0.98);
    g.lineTo(-0.55, 0.12);
    g.lineTo(-0.05, 0.12);
    g.lineTo(-0.25, 0.98);
    g.lineTo(0.58, -0.22);
    g.lineTo(0.06, -0.22);
    g.lineTo(0.38, -0.98);
    g.closePath();
    g.fill();
  },
  orbs(g) {
    g.lineWidth = 0.08;
    g.beginPath(); g.ellipse(0, 0, 0.88, 0.5, -0.5, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(0, 0, 0.32, 0, Math.PI * 2); g.fill();
    for (const [x, y, r] of [[0.68, -0.48, 0.17], [-0.7, 0.42, 0.17], [0.3, 0.38, 0.12]]) {
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
  },
  shield(g) {
    g.beginPath();
    g.moveTo(0, -0.95);
    g.lineTo(0.78, -0.65);
    g.bezierCurveTo(0.78, 0.15, 0.5, 0.65, 0, 0.98);
    g.bezierCurveTo(-0.5, 0.65, -0.78, 0.15, -0.78, -0.65);
    g.closePath();
    g.fill();
    g.save();
    g.globalCompositeOperation = 'destination-out';
    g.lineWidth = 0.12;
    g.beginPath();
    g.moveTo(0, -0.62);
    g.lineTo(0.48, -0.44);
    g.bezierCurveTo(0.48, 0.08, 0.3, 0.42, 0, 0.64);
    g.bezierCurveTo(-0.3, 0.42, -0.48, 0.08, -0.48, -0.44);
    g.closePath();
    g.stroke();
    g.restore();
  },
  wave(g) {
    g.beginPath(); g.arc(0, 0, 0.2, 0, Math.PI * 2); g.fill();
    g.lineCap = 'round';
    for (const [r, w] of [[0.5, 0.13], [0.82, 0.1]]) {
      g.lineWidth = w;
      g.beginPath(); g.arc(0, 0, r, -0.8, 0.8); g.stroke();
      g.beginPath(); g.arc(0, 0, r, Math.PI - 0.8, Math.PI + 0.8); g.stroke();
    }
  },
  star(g) {
    // estrela de 4 pontas com rastro
    g.lineCap = 'round';
    g.lineWidth = 0.1;
    g.globalAlpha *= 0.6;
    g.beginPath(); g.moveTo(-0.9, -0.9); g.lineTo(-0.2, -0.2); g.stroke();
    g.beginPath(); g.moveTo(-0.55, -0.95); g.lineTo(-0.1, -0.5); g.stroke();
    g.globalAlpha /= 0.6;
    g.save();
    g.translate(0.18, 0.18);
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 0.78 : 0.2;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    g.fill();
    g.restore();
  },

  // ---------- Melhorias ----------
  speed(g) {
    g.lineWidth = 0.2;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (const ox of [-0.38, 0.22]) {
      g.beginPath(); g.moveTo(ox - 0.25, -0.6); g.lineTo(ox + 0.3, 0); g.lineTo(ox - 0.25, 0.6); g.stroke();
    }
  },
  heart(g) {
    g.beginPath();
    g.moveTo(0, 0.85);
    g.bezierCurveTo(-1.05, 0.15, -0.75, -0.85, 0, -0.35);
    g.bezierCurveTo(0.75, -0.85, 1.05, 0.15, 0, 0.85);
    g.fill();
  },
  sword(g) {
    g.save();
    g.rotate(Math.PI / 4);
    g.beginPath();
    g.moveTo(0, -1.05); g.lineTo(0.13, -0.85); g.lineTo(0.13, 0.35); g.lineTo(-0.13, 0.35); g.lineTo(-0.13, -0.85);
    g.closePath(); g.fill();
    g.fillRect(-0.42, 0.35, 0.84, 0.13);
    g.fillRect(-0.08, 0.48, 0.16, 0.34);
    g.beginPath(); g.arc(0, 0.9, 0.11, 0, Math.PI * 2); g.fill();
    g.restore();
  },
  expand(g) {
    g.lineWidth = 0.1;
    g.beginPath(); g.arc(0, 0, 0.28, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 4; i++) {
      g.save();
      g.rotate(i * Math.PI / 2 + Math.PI / 4);
      g.beginPath();
      g.moveTo(0, -0.95); g.lineTo(0.22, -0.68); g.lineTo(0.08, -0.68); g.lineTo(0.08, -0.45);
      g.lineTo(-0.08, -0.45); g.lineTo(-0.08, -0.68); g.lineTo(-0.22, -0.68);
      g.closePath(); g.fill();
      g.restore();
    }
  },
  magnet(g) {
    g.lineWidth = 0.32;
    g.beginPath();
    g.moveTo(-0.52, -0.75); g.lineTo(-0.52, 0.05);
    g.arc(0, 0.05, 0.52, Math.PI, 0, true);
    g.lineTo(0.52, -0.75);
    g.stroke();
    g.save();
    g.globalAlpha *= 0.55;
    g.fillRect(-0.7, -0.95, 0.36, 0.25);
    g.fillRect(0.34, -0.95, 0.36, 0.25);
    g.restore();
  },
  hourglass(g) {
    g.fillRect(-0.62, -0.95, 1.24, 0.14);
    g.fillRect(-0.62, 0.81, 1.24, 0.14);
    g.lineWidth = 0.1;
    g.beginPath();
    g.moveTo(-0.48, -0.8); g.lineTo(0.48, -0.8); g.lineTo(0.06, 0); g.lineTo(0.48, 0.8);
    g.lineTo(-0.48, 0.8); g.lineTo(-0.06, 0); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(-0.3, 0.8); g.lineTo(0, 0.42); g.lineTo(0.3, 0.8); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-0.22, -0.55); g.lineTo(0.22, -0.55); g.lineTo(0, -0.25); g.closePath(); g.fill();
  },
  regen(g) {
    g.beginPath();
    g.moveTo(0, -0.95);
    g.bezierCurveTo(0.45, -0.35, 0.72, 0.05, 0.72, 0.3);
    g.arc(0, 0.3, 0.72, 0, Math.PI);
    g.bezierCurveTo(-0.72, 0.05, -0.45, -0.35, 0, -0.95);
    g.fill();
    g.save();
    g.globalCompositeOperation = 'destination-out';
    g.fillRect(-0.09, 0.0, 0.18, 0.62);
    g.fillRect(-0.31, 0.22, 0.62, 0.18);
    g.restore();
  },
  flask(g) {
    g.fillRect(-0.18, -0.95, 0.36, 0.18);
    g.beginPath();
    g.moveTo(-0.14, -0.77); g.lineTo(-0.14, -0.3);
    g.arc(0, 0.32, 0.65, -Math.PI / 2 - 0.22, -Math.PI / 2 + 0.22 + Math.PI * 2, false);
    g.lineTo(0.14, -0.77);
    g.closePath(); g.fill();
  },

  // ---------- Interface ----------
  pause(g) { g.fillRect(-0.5, -0.6, 0.32, 1.2); g.fillRect(0.18, -0.6, 0.32, 1.2); },
  back(g) {
    g.lineWidth = 0.22; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(0.3, -0.62); g.lineTo(-0.32, 0); g.lineTo(0.3, 0.62); g.stroke();
  },
  gear(g) {
    g.beginPath();
    const n = 8;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? 0.95 : 0.72;
      const a0 = a - 0.14, a1 = a + 0.14;
      g.lineTo(Math.cos(a0) * r, Math.sin(a0) * r);
      g.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
    }
    g.closePath(); g.fill();
    g.save(); g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(0, 0, 0.32, 0, Math.PI * 2); g.fill();
    g.restore();
  },
  trophy(g) {
    g.beginPath();
    g.moveTo(-0.55, -0.85); g.lineTo(0.55, -0.85); g.lineTo(0.5, -0.2);
    g.quadraticCurveTo(0.42, 0.3, 0, 0.35); g.quadraticCurveTo(-0.42, 0.3, -0.5, -0.2);
    g.closePath(); g.fill();
    g.lineWidth = 0.12;
    g.beginPath(); g.arc(-0.55, -0.42, 0.28, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
    g.beginPath(); g.arc(0.55, -0.42, 0.28, -Math.PI * 0.5, Math.PI * 0.5); g.stroke();
    g.fillRect(-0.1, 0.3, 0.2, 0.35);
    g.fillRect(-0.45, 0.65, 0.9, 0.22);
  },
  book(g) {
    g.beginPath();
    g.moveTo(0, -0.62); g.quadraticCurveTo(-0.45, -0.85, -0.95, -0.7); g.lineTo(-0.95, 0.72);
    g.quadraticCurveTo(-0.45, 0.58, 0, 0.82); g.closePath(); g.fill();
    g.beginPath();
    g.moveTo(0.08, -0.62); g.quadraticCurveTo(0.5, -0.85, 0.95, -0.7); g.lineTo(0.95, 0.72);
    g.quadraticCurveTo(0.5, 0.58, 0.08, 0.82); g.closePath(); g.fill();
  },
  coin(g) {
    g.beginPath(); g.arc(0, 0, 0.88, 0, Math.PI * 2); g.fill();
    g.save(); g.globalCompositeOperation = 'destination-out';
    g.lineWidth = 0.1;
    g.beginPath(); g.arc(0, 0, 0.66, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(0, -0.4); g.lineTo(0.3, 0); g.lineTo(0, 0.4); g.lineTo(-0.3, 0); g.closePath(); g.fill();
    g.restore();
  },
  skull(g) {
    g.beginPath();
    g.arc(0, -0.15, 0.75, Math.PI * 0.85, Math.PI * 0.15);
    g.lineTo(0.42, 0.5); g.lineTo(0.42, 0.85); g.lineTo(-0.42, 0.85); g.lineTo(-0.42, 0.5);
    g.closePath(); g.fill();
    g.save(); g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(-0.3, -0.1, 0.2, 0, Math.PI * 2); g.arc(0.3, -0.1, 0.2, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(0, 0.15); g.lineTo(0.1, 0.35); g.lineTo(-0.1, 0.35); g.closePath(); g.fill();
    g.restore();
  },
  lock(g) {
    g.lineWidth = 0.18;
    g.beginPath(); g.arc(0, -0.25, 0.38, Math.PI, 0); g.lineTo(0.38, 0.05); g.moveTo(-0.38, 0.05); g.lineTo(-0.38, -0.25); g.stroke();
    g.fillRect(-0.6, 0.0, 1.2, 0.9);
    g.save(); g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(0, 0.38, 0.13, 0, Math.PI * 2); g.fill();
    g.fillRect(-0.05, 0.4, 0.1, 0.25);
    g.restore();
  },
};

// Qual desenho usar para cada poder/melhoria (pode ser sobrescrito com "icon" nos dados)
LD.GLYPH_FOR = {
  wind_blade: 'blade', spiral_flame: 'flame', chain_lightning: 'bolt', gravity_orbs: 'orbs',
  defense_aura: 'shield', shock_wave: 'wave', falling_star: 'star',
  swift: 'speed', vitality: 'heart', might: 'sword', reach: 'expand', magnet: 'magnet',
  haste: 'hourglass', renewal: 'regen', heal: 'flask',
};

// Desenha um glifo centrado em (x,y) com tamanho s
LD.drawGlyph = function (g, name, x, y, s, color) {
  const fn = LD.Glyphs[name];
  if (!fn) return;
  g.save();
  g.translate(x, y);
  g.scale(s / 2, s / 2);
  g.fillStyle = color;
  g.strokeStyle = color;
  fn(g);
  g.restore();
};
