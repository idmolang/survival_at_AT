class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.speed = 5;
    this.weapons = [];
    this.passives = [];
    this.hp = 100;
    this.invincibleTimer = 0;
  }
  get stats() {
    let s = {
      maxHp: 100,
      hpRegen: 0,
      defense: 0,
      moveSpeed: this.speed,
      area: 1.0,
      cooldown: 1.0,
      attack: 1.0,
      duration: 1.0,
      exp: 1.0,
      magnet: 100
    };
    for (let p of this.passives) {
      if (p.id === 'HakSik') s.maxHp += p.level * 20;
      else if (p.id === 'EnergyDrink') s.hpRegen += p.level * 0.1;
      else if (p.id === 'Shield') s.defense += p.level * 2;
      else if (p.id === 'AirForce') s.moveSpeed += p.level * 1.0;
      else if (p.id === 'Note') s.area += p.level * 0.15;
      else if (p.id === 'AirPod') s.cooldown *= Math.pow(0.85, p.level);
      else if (p.id === 'Passion') s.attack += p.level * 0.2;
      else if (p.id === 'Review') s.duration += p.level * 0.2;
      else if (p.id === 'Sleep') s.exp += p.level * 0.2;
    }
    return s;
  }
  takeDamage(amount) {
    if (this.invincibleTimer <= 0) {
      let finalDmg = max(1, amount - this.stats.defense);
      this.hp -= finalDmg;
      this.invincibleTimer = 30;
      if (this.hp <= 0) {
        this.hp = 0;
        gameState = "GAME_OVER";
      }
    }
  }
  update() {
    let s = this.stats;
    if (this.hp < s.maxHp) this.hp = min(s.maxHp, this.hp + s.hpRegen);
    if (this.invincibleTimer > 0) this.invincibleTimer--;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) this.x -= s.moveSpeed;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.x += s.moveSpeed;
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) this.y -= s.moveSpeed;
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) this.y += s.moveSpeed;
    this.x = constrain(this.x, -MAP_SIZE, MAP_SIZE);
    this.y = constrain(this.y, -MAP_SIZE, MAP_SIZE);
    for (let w of this.weapons) w.update(s);
  }
  display() {
    push();
    if (this.invincibleTimer > 0 && frameCount % 10 < 5) fill(255, 100, 100);
    else fill(50, 150, 255);
    stroke(255);
    strokeWeight(2);
    ellipse(this.x, this.y, 40, 40);
    noStroke();
    fill(50);
    rectMode(CENTER);
    rect(this.x, this.y + 30, 40, 6);
    fill(50, 255, 50);
    rectMode(CORNER);
    let s = this.stats;
    let hpW = map(this.hp, 0, s.maxHp, 0, 40);
    rect(this.x - 20, this.y + 27, hpW, 6);
    pop();
    for (let w of this.weapons) w.display(s);
  }
  addWeapon(weapon) {
    if (this.weapons.length < 5) this.weapons.push(weapon);
  }
  addPassive(passive) {
    if (this.passives.length < 5) this.passives.push(passive);
  }
  hasPassive(id) {
    return this.passives.some(p => p.id === id);
  }
}
