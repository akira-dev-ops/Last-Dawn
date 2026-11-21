// Object pooling: reutiliza objetos para evitar coleta de lixo (travadas).
LD.Pool = function (factory, max) {
  this.factory = factory;
  this.max = max;
  this.free = [];
  this.active = [];
  for (let i = 0; i < max; i++) this.free.push(factory());
};

// Retorna um objeto livre ou null se o limite foi atingido.
LD.Pool.prototype.get = function () {
  const o = this.free.pop();
  if (!o) return null;
  this.active.push(o);
  return o;
};

// Remove itens marcados com .dead (troca com o último: O(1)).
LD.Pool.prototype.sweep = function () {
  const a = this.active;
  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i].dead) {
      const o = a[i];
      a[i] = a[a.length - 1];
      a.pop();
      this.free.push(o);
    }
  }
};

LD.Pool.prototype.clear = function () {
  while (this.active.length) this.free.push(this.active.pop());
};

LD.Pool.prototype.count = function () { return this.active.length; };
