class Enemy {
  init(px, py, m, playerLevel) {
    let angle = random(TWO_PI);
    let r = random(width / 2 + 50, width / 2 + 200);
    this.x = px + cos(angle) * r;
    this.y = py + sin(angle) * r;
    this.speed = random(1.5, 2.5);
    this.hp = 0;
    this.maxHp = 10 + (m * m) * 2 + playerLevel * 2;
    this.vx = 0;
    this.vy = 0;
    this.expValue = 10 + m * 5;
  }
  reset() {}
  takeDamage(amount, sourceX, sourceY, knockback = 1.0) {
    this.hp += amount;
    if (knockback > 0) {
      let angle = atan2(this.y - sourceY, this.x - sourceX);
      this.vx = cos(angle) * knockback;
      this.vy = sin(angle) * knockback;
    }
    damageTexts.push(damageTextPool.get(this.x, this.y, amount));
  }
  update(px, py, enemiesList) {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.85;
    this.vy *= 0.85;
    if (abs(this.vx) < 0.5 && abs(this.vy) < 0.5) {
      let angle = atan2(py - this.y, px - this.x);
      this.x += cos(angle) * this.speed;
      this.y += sin(angle) * this.speed;
    }
    for (let i = 0; i < 2; i++) {
      let other = random(enemiesList);
      if (other && other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);
        if (d < 30 && d > 0) {
          let pushAngle = atan2(this.y - other.y, this.x - other.x);
          this.x += cos(pushAngle) * 1.5;
          this.y += sin(pushAngle) * 1.5;
        }
      }
    }
  }
  display() {
    push();
    translate(this.x, this.y);
    let hpRatio = min(this.maxHp / 500, 1);
    fill(lerpColor(color(100, 200, 255), color(255, 50, 50), hpRatio));
    noStroke();
    rectMode(CENTER);
    rect(0, 0, 30, 30, 5);
    fill(50);
    rect(0, 22, 30, 5);
    fill(100, 255, 100);
    let fillRatio = constrain(this.hp / this.maxHp, 0, 1);
    rectMode(CORNER);
    rect(-15, 19.5, 30 * fillRatio, 5);
    pop();
  }
}
