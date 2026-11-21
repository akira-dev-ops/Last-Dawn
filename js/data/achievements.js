// =============================================================
// CONQUISTAS — edite à vontade.
// test(r, t): r = partida atual, t = totais salvos (já somando a partida)
//   r: time, kills, level, bossKills, powers, maxedPowers, ended
//   t: games, totalKills, bossKills, collection (quantidade descoberta)
// =============================================================
LD.ACHIEVEMENTS = [
  { id: 'first_dawn', name: 'Primeira Noite', desc: 'Termine sua primeira partida.', test: (r, t) => t.games >= 1 },
  { id: 'survive_3', name: 'Resistente', desc: 'Sobreviva 3 minutos.', test: r => r.time >= 180 },
  { id: 'survive_5', name: 'Inabalável', desc: 'Sobreviva 5 minutos.', test: r => r.time >= 300 },
  { id: 'survive_10', name: 'Guardião da Noite', desc: 'Sobreviva 10 minutos.', test: r => r.time >= 600 },
  { id: 'survive_20', name: 'Último Amanhecer', desc: 'Sobreviva 20 minutos.', test: r => r.time >= 1200 },
  { id: 'kills_100', name: 'Caçador', desc: 'Derrote 100 inimigos em uma partida.', test: r => r.kills >= 100 },
  { id: 'kills_500', name: 'Ceifador', desc: 'Derrote 500 inimigos em uma partida.', test: r => r.kills >= 500 },
  { id: 'kills_1500', name: 'Tempestade Viva', desc: 'Derrote 1500 inimigos em uma partida.', test: r => r.kills >= 1500 },
  { id: 'total_1000', name: 'Mil Sombras', desc: 'Derrote 1000 inimigos no total.', test: (r, t) => t.totalKills >= 1000 },
  { id: 'total_10000', name: 'Fim das Trevas', desc: 'Derrote 10000 inimigos no total.', test: (r, t) => t.totalKills >= 10000 },
  { id: 'boss_1', name: 'Quebra-Crepúsculo', desc: 'Derrote um chefe.', test: r => r.bossKills >= 1 },
  { id: 'boss_total_5', name: 'Matador de Titãs', desc: 'Derrote 5 chefes no total.', test: (r, t) => t.bossKills >= 5 },
  { id: 'level_10', name: 'Desperto', desc: 'Alcance o nível 10 em uma partida.', test: r => r.level >= 10 },
  { id: 'level_25', name: 'Ascendido', desc: 'Alcance o nível 25 em uma partida.', test: r => r.level >= 25 },
  { id: 'max_power', name: 'Domínio', desc: 'Leve um poder ao nível máximo.', test: r => r.maxedPowers >= 1 },
  { id: 'full_arsenal', name: 'Arsenal Completo', desc: 'Tenha 6 poderes ao mesmo tempo.', test: r => r.powers >= 6 },
  { id: 'collector', name: 'Colecionador', desc: 'Descubra todos os poderes e melhorias.',
    test: (r, t) => t.collection >= LD.POWERS.length + LD.PASSIVES.length },
];

// Verifica e desbloqueia; retorna as conquistas novas.
LD.Achievements = {
  check(run) {
    const save = LD.Save.data, st = save.stats;
    // totais "ao vivo": se a partida ainda não terminou, soma o que já foi feito
    const live = !run.ended;
    const t = {
      games: st.games,
      totalKills: st.totalKills + (live ? run.kills : 0),
      bossKills: st.bossKills + (live ? run.bossKills : 0),
      collection: Object.keys(save.collection).length,
    };
    const got = [];
    for (const a of LD.ACHIEVEMENTS) {
      if (save.achievements[a.id]) continue;
      let ok = false;
      try { ok = a.test(run, t); } catch (e) { ok = false; }
      if (ok) { save.achievements[a.id] = Date.now(); got.push(a); }
    }
    if (got.length) LD.Save.save();
    return got;
  },
};
