class Passive {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.level = 1;
  }
  levelUp() {
    if (this.level < 5) this.level++;
  }
}
