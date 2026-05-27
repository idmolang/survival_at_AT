class Gem {
  init(x, y, expAmount) {
    this.x = x;
    this.y = y;
    this.expAmount = expAmount;
    this.isDead = false;
    this.collected = false;
    this.isMoving = false;
  }
  reset() {}
  update(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    if (d < player.stats.magnet) this.isMoving = true;
    if (this.isMoving) {
      let angle = atan2(player.y - this.y, player.x - this.x);
      this.x += cos(angle) * 12;
      this.y += sin(angle) * 12;
      if (d < 20) {
        this.isDead = true;
        this.collected = true;
        this.expAmount *= player.stats.exp;
      }
    }
  }
  display() {
    fill(50, 255, 100);
    stroke(20, 150, 50);
    strokeWeight(2);
    let size = this.expAmount > 20 ? 12 : 8;
    push();
    translate(this.x, this.y);
    rotate(frameCount * 0.1);
    rectMode(CENTER);
    rect(0, 0, size, size);
    pop();
  }
}
