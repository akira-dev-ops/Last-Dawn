// Progresso salvo em localStorage
LD.Save = {
  KEY: 'lastdawn_save_v1',
  data: null,

  defaults() {
    return {
      settings: { volume: 0.7, vibration: true, damageNumbers: true, showFps: false },
      stats: {
        games: 0, totalKills: 0, totalTime: 0, bossKills: 0,
        bestTime: 0, bestKills: 0, bestLevel: 0,
      },
      collection: {},   // id -> timestamp da 1ª vez que pegou
      achievements: {}, // id -> timestamp de desbloqueio
    };
  },

  load() {
    const def = this.defaults();
    let d = {};
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) d = JSON.parse(raw) || {};
    } catch (e) { d = {}; }
    this.data = {
      settings: Object.assign(def.settings, d.settings),
      stats: Object.assign(def.stats, d.stats),
      collection: Object.assign(def.collection, d.collection),
      achievements: Object.assign(def.achievements, d.achievements),
    };
  },

  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) { /* cheio/privado */ }
  },

  reset() {
    this.data = this.defaults();
    this.save();
  },

  discover(id) {
    if (this.data.collection[id]) return false;
    this.data.collection[id] = Date.now();
    this.save();
    return true;
  },
};

LD.vibrate = function (ms) {
  if (!LD.Save.data.settings.vibration) return;
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { }
};
