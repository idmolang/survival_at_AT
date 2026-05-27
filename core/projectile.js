class Projectile {
  init(x, y, angle, damage, speed, piercing, size = 15, duration = 300, col = [255, 255, 255], isBounce = false, knockback = 1.0) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.damage = damage;
    this.speed = speed;
    this.piercing = piercing;
    this.size = size;
    this.duration = duration;
    this.color = col;
    this.isBounce = isBounce;
    this.knockback = knockback;
    this.hitEnemies = new WeakSet();
    this.isDead = false;
    this.vx = cos(this.angle) * this.speed;
    this.vy = sin(this.angle) * this.speed;
    this.isLaser = false;
    this.pierceCount = piercing ? 9999 : 0;

    // ── 이미지 발사체 설정 ──
    // 스킬에서 projPool.get() 후 직접 설정:
    //   p.imgKey = 'p5js'         → gameImages에서 이미지 로드
    //   p.imgRotationSpeed = 0.1  → 회전 속도 (0이면 방향 따라감)
    //   p.imgAngleOffset = 0      → 이미지 자체 방향 보정값 (라디안)
    //   p.imgScale = 1.0          → 이미지 크기 배율
    this.imgKey = null;
    this.imgRotation = 0;       // 현재 누적 회전각
    this.imgRotationSpeed = 0;  // 매 프레임 회전량 (0 = 방향 자동 추적)
    this.imgAngleOffset = 0;    // 이미지 원점 방향 보정
    this.imgScale = 1.0;

    // ── 호밍 설정 ──
    this.isHoming = false;
    this.homingTarget = null;
    this.homingTurnSpeed = 0.1; // 최대 각도 변화량 (라디안)
  }

  reset() {
    this.hitEnemies = new WeakSet();
    this.imgKey = null;
    this.imgRotationSpeed = 0;
    this.imgRotation = 0;
    this.imgAngleOffset = 0;
    this.imgScale = 1.0;
    this.isHoming = false;
    this.homingTarget = null;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.duration--;
    if (this.duration <= 0) this.isDead = true;

    if (this.isBounce) {
      let camX = player.x - width / 2;
      let camY = player.y - height / 2;
      if (this.x < camX || this.x > camX + width) this.vx *= -1;
      if (this.y < camY || this.y > camY + height) this.vy *= -1;
    }

    // 이미지 회전 업데이트
    if (this.imgKey) {
      if (this.imgRotationSpeed !== 0) {
        // 고정 회전 (spin)
        this.imgRotation += this.imgRotationSpeed;
      } else {
        // 이동 방향 자동 추적
        this.imgRotation = atan2(this.vy, this.vx) + this.imgAngleOffset;
      }
    }

    // 호밍 유도 로직
    if (this.isHoming) {
      // 타겟이 없거나, 타겟이 죽었거나 범위를 벗어난 경우 새로 탐색
      if (!this.homingTarget || this.homingTarget.hp <= 0 || !enemies.includes(this.homingTarget)) {
        let minDist = 2000;
        this.homingTarget = null;
        for (let e of enemies) {
          let d = dist(this.x, this.y, e.x, e.y);
          if (d < minDist) { minDist = d; this.homingTarget = e; }
        }
      }

      if (this.homingTarget) {
        let targetAngle = atan2(this.homingTarget.y - this.y, this.homingTarget.x - this.x);
        let currentAngle = atan2(this.vy, this.vx);

        let diff = targetAngle - currentAngle;
        while (diff > PI) diff -= TWO_PI;
        while (diff < -PI) diff += TWO_PI;

        let turn = constrain(diff, -this.homingTurnSpeed, this.homingTurnSpeed);
        currentAngle += turn;

        this.vx = cos(currentAngle) * this.speed;
        this.vy = sin(currentAngle) * this.speed;
      }
    }
  }

  display() {
    // ── 이미지 발사체 렌더링 ──
    if (this.imgKey && typeof gameImages !== 'undefined' && gameImages[this.imgKey]) {
      let img = gameImages[this.imgKey];
      let drawSize = this.size * 2 * this.imgScale;
      push();
      translate(this.x, this.y);
      rotate(this.imgRotation);
      imageMode(CENTER);
      image(img, 0, 0, drawSize, drawSize);
      pop();
      return;
    }

    // ── 레이저 렌더링 ──
    if (this.isLaser) {
      push();
      translate(this.x, this.y);
      rotate(this.angle);
      let alpha = map(this.duration, 0, 15, 0, 255);
      stroke(this.color[0], this.color[1], this.color[2], alpha);
      strokeWeight(this.size);
      line(0, 0, 800, 0);
      pop();
      return;
    }

    // ── 기본 원형 발사체 렌더링 ──
    let c = this.color;
    if (Array.isArray(c)) {
      fill(c[0], c[1], c[2], c[3] !== undefined ? c[3] : 255);
    } else {
      fill(c);
    }
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }

  checkHit(e) {
    if (this.isLaser) return;
    if (this.hitEnemies.has(e)) return;
    if (dist(this.x, this.y, e.x, e.y) < this.size / 2 + 15) {
      e.takeDamage(this.damage, this.x, this.y, this.knockback);
      this.hitEnemies.add(e);
      if (this.pierceCount > 0) {
        this.pierceCount--;
      } else {
        this.isDead = true;
      }
    }
  }
}
