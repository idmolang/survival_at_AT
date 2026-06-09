class Gem {
  init(x, y, expAmount, type = "EXP") {
    this.x = x;
    this.y = y;
    this.expAmount = expAmount;
    this.type = type;
    this.isDead = false;
    this.collected = false;
    this.isMoving = false;
  }
  reset() { }
  update(player) {
    if (!this.isMoving) {
      let maxRange = player.stats.magnet || 150;
      if (Math.abs(this.x - player.x) > maxRange || Math.abs(this.y - player.y) > maxRange) {
        return; // 자석 범위 밖에 있는 젬은 계산조차 스킵!
      }
    }

    let d = dist(this.x, this.y, player.x, player.y);
    if (d < player.stats.magnet) this.isMoving = true;
    if (this.isMoving) {
      let angle = atan2(player.y - this.y, player.x - this.x);
      this.x += cos(angle) * 12;
      this.y += sin(angle) * 12;
      if (d < 20) {
        this.isDead = true;
        this.collected = true;
        if (this.type === "HEAL") {
          let healAmount = 10; // 10 HP 회복
          player.hp = min(player.stats.maxHp, player.hp + healAmount);
          damageTexts.push(damageTextPool.get(player.x, player.y - 30, `+${healAmount} HP`));
        } else {
          this.expAmount *= player.stats.exp;
        }
      }
    }
  }
  display() {
    if (this.type === "HEAL") {
      push();
      translate(this.x, this.y);
      fill(255, 50, 50); // 빨간색 하트
      stroke(255, 150, 150); // 분홍색 광택
      strokeWeight(1.5);

      // 하트 맥박 애니메이션
      let scaleRatio = 1.0 + sin(frameCount * 0.1) * 0.15;
      scale(scaleRatio);

      // 하트 그리기
      beginShape();
      vertex(0, -4);
      bezierVertex(-7, -11, -13, -4, 0, 8);
      bezierVertex(13, -4, 7, -11, 0, -4);
      endShape(CLOSE);
      pop();
      return;
    }

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
