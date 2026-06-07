class ObjectPool {
  constructor(createFn) {
    this.pool = [];
    this.createFn = createFn;
  }
  get(...args) {
    let obj = this.pool.length > 0 ? this.pool.pop() : this.createFn();
    if (obj.init) obj.init(...args);
    return obj;
  }
  release(obj) {
    if (obj.reset) obj.reset();
    this.pool.push(obj);
  }
}
