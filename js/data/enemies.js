// =============================================================
// INIMIGOS — edite à vontade.
// hp: vida | speed: px/s | dmg: dano por contato | r: raio do corpo
// xp: valor da gema que solta | shape: placeholder ('blob','bat','wisp',
// 'square','knight','boss') | sprite: chave da imagem em js/data/assets.js
// knockResist: 0 (voa longe) .. 1 (imóvel)
// move: 'chase' (padrão) | 'zigzag' | 'dash' (investida periódica)
// =============================================================
LD.ENEMIES = [
  { id: 'slime', name: 'Gosma Sombria', hp: 10, speed: 72, dmg: 6, r: 20, xp: 1,
    color: '#7d4bd8', shape: 'blob', sprite: 'enemy_slime' },

  { id: 'bat', name: 'Morcego da Penumbra', hp: 6, speed: 130, dmg: 4, r: 16, xp: 1,
    color: '#d84b6a', shape: 'bat', sprite: 'enemy_bat' },

  { id: 'wisp', name: 'Fogo-Fátuo', hp: 18, speed: 100, dmg: 7, r: 18, xp: 2,
    color: '#4bd8c4', shape: 'wisp', sprite: 'enemy_wisp', move: 'zigzag' },

  { id: 'brute', name: 'Bruto de Pedra', hp: 55, speed: 52, dmg: 11, r: 30, xp: 4,
    color: '#8a7a5a', shape: 'square', sprite: 'enemy_brute', knockResist: 0.6 },

  { id: 'knight', name: 'Cavaleiro Oco', hp: 110, speed: 66, dmg: 14, r: 26, xp: 6,
    color: '#5a6a8a', shape: 'knight', sprite: 'enemy_knight', knockResist: 0.75 },

  // ----- Chefes -----
  { id: 'boss_guardian', name: 'Guardião do Crepúsculo', hp: 1400, speed: 62, dmg: 24, r: 64, xp: 60,
    color: '#ff7a3a', shape: 'boss', sprite: 'boss_guardian', boss: true, knockResist: 1,
    move: 'dash', dashEvery: 4, dashSpeed: 430, dashTime: 0.6 },

  { id: 'boss_eclipse', name: 'Senhor do Eclipse', hp: 2600, speed: 70, dmg: 28, r: 70, xp: 90,
    color: '#a04bff', shape: 'boss', sprite: 'boss_eclipse', boss: true, knockResist: 1,
    summon: 'bat', summonEvery: 5, summonCount: 6 },

  { id: 'boss_colossus', name: 'Colosso da Última Noite', hp: 4200, speed: 55, dmg: 34, r: 82, xp: 140,
    color: '#d8c24b', shape: 'boss', sprite: 'boss_colossus', boss: true, knockResist: 1,
    move: 'dash', dashEvery: 3.2, dashSpeed: 480, dashTime: 0.55, summon: 'brute', summonEvery: 7, summonCount: 4 },
];

// Acesso rápido por id
LD.ENEMY = {};
for (const e of LD.ENEMIES) LD.ENEMY[e.id] = e;
