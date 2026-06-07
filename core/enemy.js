class Enemy {
  init(px, py, m, playerLevel) {
    let angle = random(TWO_PI);
    let r = random(width / 2 + 50, width / 2 + 200);
    this.x = px + cos(angle) * r;
    this.y = py + sin(angle) * r;
    this.speed = random(1.5, 2.5);
    this.hp = 0;
    this.maxHp = 10 + (m * m) * 12 + playerLevel * 4 + ((m > 10) ? (m - 10) * 300 : 0);
    this.vx = 0;
    this.vy = 0;
    this.expValue = 10 + m * 5;
    this.facing = (px > this.x) ? 1 : -1;
    this.imgIndex = floor(random(0, 16));
  }
  reset() { }
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

    let dx = px - this.x;
    let dy = py - this.y;
    let absDx = Math.abs(dx);
    let absDy = Math.abs(dy);
    // 화면 크기 가로/세로 기준보다 여유롭게 멀리 있는 경우 오프스크린으로 판정
    let offScreen = absDx > width * 0.6 || absDy > height * 0.6;

    if (abs(this.vx) < 0.5 && abs(this.vy) < 0.5) {
      let angle = atan2(dy, dx);
      this.x += cos(angle) * this.speed;
      this.y += sin(angle) * this.speed;
    }
    
    if (!offScreen) {
      this.facing = (dx > 0) ? 1 : -1;

      // 화면 주변에 있는 경우에만 무작위 2명과의 밀쳐내기 물리 연산 수행
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
  }
  display() {
    push();
    translate(this.x, this.y);

    // 캐릭터 스프라이트 그리기 (이동/추적 방향에 맞춰 좌우 대칭)
    push();
    if (this.facing === 1) {
      scale(-1, 1);
    }
    let img = (gameImages.enemy_images && gameImages.enemy_images.length > 0) ? gameImages.enemy_images[this.imgIndex] : null;
    if (img) {
      imageMode(CENTER);
      image(img, 0, 0, 40, 40);
    } else {
      // 이미지 미로딩 시 청록색 백업 사각형
      fill(100, 200, 255);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, 30, 30, 5);
    }
    pop();

    // HP 체력바 그리기 (반전 스케일링의 영향을 받지 않도록 처리)
    fill(50);
    noStroke();
    rectMode(CENTER);
    rect(0, 22, 30, 5);

    fill(100, 255, 100);
    let fillRatio = constrain(this.hp / this.maxHp, 0, 1);
    rectMode(CORNER);
    rect(-15, 19.5, 30 * fillRatio, 5);
    pop();
  }
}

