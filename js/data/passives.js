// =============================================================
// MELHORIAS PASSIVAS — edite à vontade.
// stat: qual modificador do jogador muda | per: quanto por nível
//   speedMul (velocidade), maxHpAdd (vida), dmgMul (dano),
//   areaMul (alcance/área), magnetMul (atração de XP),
//   cdMul (recarga; negativo = mais rápido), regen (vida/seg)
// =============================================================
LD.PASSIVES = [
  { id: 'swift', name: 'Passos Ligeiros', glyph: '»', color: '#7fe3ff',
    desc: '+10% velocidade de movimento.', stat: 'speedMul', per: 0.10, max: 5 },
  { id: 'vitality', name: 'Vitalidade', glyph: '+', color: '#ff6b8a',
    desc: '+20 de vida máxima e cura 20.', stat: 'maxHpAdd', per: 20, max: 5 },
  { id: 'might', name: 'Poder Interior', glyph: '!', color: '#ff9b4a',
    desc: '+10% de dano de todos os poderes.', stat: 'dmgMul', per: 0.10, max: 5 },
  { id: 'reach', name: 'Expansão', glyph: '◎', color: '#c88bff',
    desc: '+10% de alcance e área dos poderes.', stat: 'areaMul', per: 0.10, max: 5 },
  { id: 'magnet', name: 'Atração', glyph: 'U', color: '#58c7ff',
    desc: '+35% de raio de atração de XP.', stat: 'magnetMul', per: 0.35, max: 5 },
  { id: 'haste', name: 'Fluxo Arcano', glyph: '↻', color: '#9dff8a',
    desc: '-8% no tempo de recarga dos poderes.', stat: 'cdMul', per: -0.08, max: 5 },
  { id: 'renewal', name: 'Renovação', glyph: '♥', color: '#ff9fd0',
    desc: 'Regenera 0,4 de vida por segundo.', stat: 'regen', per: 0.4, max: 5 },
];

LD.PASSIVE = {};
for (const p of LD.PASSIVES) { p.kind = 'passive'; p.maxLevel = p.max; LD.PASSIVE[p.id] = p; }
