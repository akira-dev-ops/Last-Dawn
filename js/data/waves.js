// =============================================================
// ONDAS DE INIMIGOS — edite à vontade.
// t: a partir de quantos segundos a onda vale
// every: intervalo entre surtos (s) | batch: inimigos por surto
// max: máximo de inimigos vivos nesta fase (limitado por CONFIG.maxEnemies)
// pool: sorteio de tipos (repita um id para deixá-lo mais comum)
// =============================================================
LD.WAVES = [
  { t: 0,   every: 1.1,  batch: 1, max: 18,  pool: ['slime'] },
  { t: 25,  every: 0.9,  batch: 2, max: 30,  pool: ['slime', 'slime', 'bat'] },
  { t: 60,  every: 0.8,  batch: 2, max: 45,  pool: ['slime', 'bat', 'bat'] },
  { t: 100, every: 0.7,  batch: 3, max: 60,  pool: ['slime', 'bat', 'wisp'] },
  { t: 150, every: 0.65, batch: 3, max: 75,  pool: ['bat', 'wisp', 'brute', 'slime'] },
  { t: 240, every: 0.55, batch: 3, max: 95,  pool: ['bat', 'wisp', 'brute', 'brute'] },
  { t: 330, every: 0.5,  batch: 4, max: 110, pool: ['wisp', 'brute', 'knight', 'bat'] },
  { t: 450, every: 0.45, batch: 4, max: 125, pool: ['wisp', 'brute', 'knight', 'knight'] },
  { t: 600, every: 0.4,  batch: 5, max: 140, pool: ['bat', 'brute', 'knight', 'knight', 'wisp'] },
];

// Hordas especiais: um anel de inimigos cerca o jogador
LD.HORDES = [
  { every: 75, first: 50, enemy: 'bat', count: 22 },
  { every: 120, first: 200, enemy: 'brute', count: 14 },
];

// Chefes: aparecem a cada "interval" segundos, em sequência.
// Depois do último, recomeçam mais fortes (hpGrowth por ciclo).
LD.BOSSES = {
  interval: 180,
  order: ['boss_guardian', 'boss_eclipse', 'boss_colossus'],
  hpGrowth: 0.8,
};

// Dificuldade cresce com o tempo (por minuto)
// vida = 1 + min*hpPerMin + min²*hpPerMin2 (cresce mais rápido no fim)
// xpPerMin: inimigos soltam mais XP com o passar do tempo
LD.DIFFICULTY = { hpPerMin: 0.15, hpPerMin2: 0.025, dmgPerMin: 0.07, speedPerMin: 0.012, xpPerMin: 0.1 };

// XP necessária para passar do nível n para n+1
LD.xpToNext = function (level) {
  return Math.floor(5 + (level - 1) * 3.5 + Math.pow(level - 1, 1.35));
};
