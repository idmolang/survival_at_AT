class DamageText {
  init(x, y, damage) {
    this.x = x + random(-10, 10);
    this.y = y - 15;
    this.damage = typeof damage === 'number' ? floor(damage) : damage;
    this.life = 30;
    this.isHeal = typeof damage === 'string' && damage.includes("HP");
  }
  reset() { }
  update() {
    this.y -= 1.5;
    this.life--;
  }
  display() {
    push();
    if (this.isHeal) {
      fill(50, 255, 100, map(this.life, 0, 30, 0, 255)); // 초록색 힐 텍스트
    } else {
      fill(255, map(this.life, 0, 30, 0, 255)); // 하얀색 데미지 텍스트
    }
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
