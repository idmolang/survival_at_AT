class DamageText {
  init(x, y, damage) {
    this.x = x + random(-10, 10);
    this.y = y - 15;
    this.damage = floor(damage);
    this.life = 30;
  }
  reset() { }
  update() {
    this.y -= 1.5;
    this.life--;
  }
  display() {
    push();
    fill(255, map(this.life, 0, 30, 0, 255));
    textSize(16);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(this.damage, this.x, this.y);
    pop();
  }
  isDead() {
    return this.life <= 0;
  }
}
