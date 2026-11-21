// =============================================================
// ARQUIVOS DE IMAGEM E SOM
// -------------------------------------------------------------
// Deixe o caminho vazio ('') para usar o placeholder (formas simples).
// Para trocar, coloque o arquivo em assets/images ou assets/sounds e
// preencha o caminho. Ex.: player: 'assets/images/player.png'
// Imagens de personagens/inimigos devem ser quadradas (ex.: 128x128),
// com fundo transparente; serão desenhadas no tamanho do corpo.
// =============================================================

LD.ASSET_FILES = {
  images: {
    loadingBg: '',      // fundo da tela de carregamento (720x1280)
    menuBg: '',         // fundo do menu (720x1280)
    ground: '',         // ladrilho do chão (repetido), ex.: 256x256

    player: '',

    enemy_slime: '',
    enemy_bat: '',
    enemy_wisp: '',
    enemy_brute: '',
    enemy_knight: '',
    boss_guardian: '',
    boss_eclipse: '',
    boss_colossus: '',

    gem: '',
    heart: '',

    // Ícones de poderes/melhorias: 'icon_<id>' (ex.: icon_wind_blade)
    icon_wind_blade: '',
    icon_spiral_flame: '',
    icon_chain_lightning: '',
    icon_gravity_orbs: '',
    icon_defense_aura: '',
    icon_shock_wave: '',
    icon_falling_star: '',
    icon_swift: '',
    icon_vitality: '',
    icon_might: '',
    icon_reach: '',
    icon_magnet: '',
    icon_haste: '',
  },

  sounds: {
    click: '',
    shoot: '',
    hit: '',
    kill: '',
    pickup: '',
    levelup: '',
    hurt: '',
    boss: '',
    explosion: '',
    zap: '',
    achievement: '',
    gameover: '',
    music_menu: '',     // música em loop (mp3/ogg)
    music_game: '',
  },
};

// Sons sintetizados usados enquanto não houver arquivo.
// type: 'sine' | 'square' | 'sawtooth' | 'triangle'
// f0 -> f1: frequência inicial/final (Hz), dur: segundos, vol: 0..1, gap: intervalo mínimo
LD.SFX_SYNTH = {
  click:       { type: 'triangle', f0: 660, f1: 880, dur: 0.06, vol: 0.25, gap: 0.04 },
  shoot:       { type: 'triangle', f0: 900, f1: 500, dur: 0.05, vol: 0.06, gap: 0.09 },
  hit:         { type: 'square',   f0: 220, f1: 120, dur: 0.04, vol: 0.05, gap: 0.06 },
  kill:        { type: 'triangle', f0: 320, f1: 90,  dur: 0.08, vol: 0.08, gap: 0.05 },
  pickup:      { type: 'sine',     f0: 900, f1: 1400, dur: 0.05, vol: 0.07, gap: 0.04 },
  levelup:     { type: 'triangle', f0: 400, f1: 1200, dur: 0.35, vol: 0.25, gap: 0.2 },
  hurt:        { type: 'sawtooth', f0: 180, f1: 60,  dur: 0.15, vol: 0.18, gap: 0.15 },
  boss:        { type: 'sawtooth', f0: 90,  f1: 40,  dur: 0.9,  vol: 0.3,  gap: 0.5 },
  explosion:   { type: 'sawtooth', f0: 140, f1: 30,  dur: 0.25, vol: 0.14, gap: 0.08 },
  zap:         { type: 'square',   f0: 1400, f1: 300, dur: 0.09, vol: 0.06, gap: 0.08 },
  achievement: { type: 'sine',     f0: 600, f1: 1500, dur: 0.45, vol: 0.25, gap: 0.3 },
  gameover:    { type: 'triangle', f0: 400, f1: 60,  dur: 1.0,  vol: 0.3,  gap: 0.5 },
};
