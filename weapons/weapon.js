// Base Weapon Class
class Weapon {
  constructor(owner) {
    this.owner = owner;
    this.level = 1;
    this.isEvolved = false;
    this.timer = 0;
  }
  get currentStats() {
    return this.isEvolved ? this.constructor.EVO_DATA : this.constructor.LEVEL_DATA[this.level - 1];
  }
  levelUp() {
    if (this.level < 5) this.level++;
    else this.isEvolved = true;
  }
}
