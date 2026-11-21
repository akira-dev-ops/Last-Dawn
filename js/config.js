// =============================================================
// Last Dawn — configuração geral
// Ajuste aqui limites de desempenho e valores globais.
// =============================================================
window.LD = window.LD || {};

LD.VERSION = '0.2.0';

LD.CONFIG = {
  // Resolução lógica (largura fixa; altura se adapta à tela entre min e max)
  width: 720,
  minHeight: 1100,
  maxHeight: 1600,

  // Limites de desempenho (celular fraco)
  maxEnemies: 140,
  maxProjectiles: 160,
  maxGems: 220,
  maxEffects: 80,
  maxTexts: 36,

  // Jogador
  playerSpeed: 230,
  playerHp: 100,
  playerRadius: 22,
  playerIFrames: 0.5,
  magnetRadius: 150,

  // Slots
  maxPowers: 6,
  maxPassives: 6,

  // Grade espacial para colisões
  gridCell: 100,
  gridSize: 32, // 32 x 100 = 3200px de área coberta ao redor do jogador

  // Joystick
  joyRadius: 95,
  joyDeadzone: 0.12,
};
