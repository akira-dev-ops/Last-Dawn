// =============================================================
// PODERES (ataques automáticos) — edite à vontade.
// -------------------------------------------------------------
// levels: lista de níveis. O nível 1 define todos os atributos;
// os seguintes só listam o que muda (os valores são acumulados).
// "text" descreve a melhoria daquele nível (aparece na escolha).
//
// Atributos afetados pelas melhorias passivas:
//   dmg               x Poder Interior (dano)
//   cooldown          x Fluxo Arcano (recarga)
//   size/radius/range x Expansão (área/alcance)
// =============================================================
LD.POWERS = [
  {
    id: 'wind_blade', name: 'Lâmina de Vento', glyph: 'V', color: '#9ef0ff',
    desc: 'Dispara lâminas de ar cortante no inimigo mais próximo.',
    levels: [
      { dmg: 9, cooldown: 1.05, count: 1, pierce: 1, speed: 720, size: 16, life: 1.0 },
      { text: '+1 lâmina', count: 2 },
      { text: '+40% dano', dmg: 12.6 },
      { text: 'Atravessa +2 inimigos', pierce: 3 },
      { text: '+1 lâmina, recarga menor', count: 3, cooldown: 0.9 },
      { text: '+40% dano, lâminas maiores', dmg: 17, size: 22 },
      { text: '+2 lâminas', count: 5 },
      { text: 'Furacão: atravessa tudo, +30% dano', pierce: 99, dmg: 22 },
    ],
  },
  {
    id: 'spiral_flame', name: 'Chama Espiral', glyph: 'C', color: '#ff8a3a',
    desc: 'Lança bolas de fogo que giram em espiral para longe de você.',
    levels: [
      { dmg: 14, cooldown: 2.6, count: 3, pierce: 4, size: 20, spin: 3.2, grow: 150, life: 2.2 },
      { text: '+1 chama', count: 4 },
      { text: '+30% dano', dmg: 18 },
      { text: 'Chamas maiores', size: 26 },
      { text: '+2 chamas', count: 6 },
      { text: 'Recarga menor, +30% dano', cooldown: 2.0, dmg: 24 },
      { text: 'Inferno: +2 chamas, atravessam mais', count: 8, pierce: 8 },
    ],
  },
  {
    id: 'chain_lightning', name: 'Raio em Cadeia', glyph: 'R', color: '#fff36b',
    desc: 'Um raio atinge um inimigo e salta para os próximos.',
    levels: [
      { dmg: 16, cooldown: 1.8, bolts: 1, chains: 2, range: 520, jump: 210 },
      { text: '+2 saltos', chains: 4 },
      { text: '+30% dano', dmg: 21 },
      { text: '+1 raio', bolts: 2 },
      { text: 'Saltos mais longos', jump: 280, chains: 5 },
      { text: 'Recarga menor', cooldown: 1.3 },
      { text: 'Tempestade: +1 raio, +3 saltos', bolts: 3, chains: 8, dmg: 26 },
    ],
  },
  {
    id: 'gravity_orbs', name: 'Orbes Gravitacionais', glyph: 'O', color: '#b07bff',
    desc: 'Esferas de gravidade orbitam ao seu redor e esmagam quem tocam.',
    levels: [
      { dmg: 10, count: 2, radius: 120, size: 18, spin: 3.0, hitCd: 0.45 },
      { text: '+1 orbe', count: 3 },
      { text: '+30% dano', dmg: 13 },
      { text: 'Órbita maior, giram mais rápido', radius: 150, spin: 3.8 },
      { text: '+1 orbe', count: 4 },
      { text: 'Orbes maiores, +30% dano', size: 24, dmg: 17 },
      { text: 'Singularidade: +2 orbes', count: 6, dmg: 20 },
    ],
  },
  {
    id: 'defense_aura', name: 'Aura Defensiva', glyph: 'A', color: '#6bdc8b',
    desc: 'Um campo protetor fere e desacelera inimigos próximos e reduz o dano recebido.',
    levels: [
      { dmg: 5, cooldown: 0.5, radius: 115, armor: 0.08, slow: 0.45 },
      { text: 'Área maior', radius: 135 },
      { text: '+40% dano, +4% proteção', dmg: 7, armor: 0.12 },
      { text: 'Área maior', radius: 160 },
      { text: 'Pulsa mais rápido, +4% proteção', cooldown: 0.38, armor: 0.16 },
      { text: 'Santuário: área e dano maiores', radius: 185, dmg: 10, armor: 0.2 },
    ],
  },
  {
    id: 'shock_wave', name: 'Onda de Choque', glyph: 'S', color: '#5ad0ff',
    desc: 'Libera uma onda que se expande, causa dano e empurra os inimigos.',
    levels: [
      { dmg: 18, cooldown: 3.6, range: 300, waves: 1, push: 520 },
      { text: '+30% dano', dmg: 24 },
      { text: 'Onda maior', range: 380 },
      { text: 'Onda dupla', waves: 2 },
      { text: 'Recarga menor', cooldown: 2.8 },
      { text: 'Terremoto: onda tripla, +30% dano', waves: 3, dmg: 32, range: 430 },
    ],
  },
  {
    id: 'falling_star', name: 'Estrela Cadente', glyph: 'E', color: '#ffd27a',
    desc: 'Invoca estrelas do céu que explodem sobre os inimigos.',
    levels: [
      { dmg: 26, cooldown: 2.8, count: 1, radius: 85 },
      { text: '+1 estrela', count: 2 },
      { text: 'Explosão maior', radius: 105 },
      { text: '+40% dano', dmg: 36 },
      { text: '+2 estrelas', count: 4 },
      { text: 'Recarga menor', cooldown: 2.1 },
      { text: 'Chuva Celeste: +2 estrelas, +30% dano', count: 6, dmg: 46 },
    ],
  },
];

LD.POWER = {};
for (const p of LD.POWERS) { p.kind = 'power'; p.maxLevel = p.levels.length; LD.POWER[p.id] = p; }

// Poder com que o jogador começa
LD.STARTING_POWER = 'wind_blade';

// Soma os níveis 1..level em um único objeto de atributos
LD.powerBaseStats = function (def, level) {
  const s = {};
  for (let i = 0; i < level && i < def.levels.length; i++) {
    const L = def.levels[i];
    for (const k in L) if (k !== 'text') s[k] = L[k];
  }
  return s;
};
