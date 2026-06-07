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
    this.imgKey = null;
    this.imgRotation = 0;       // 현재 누적 회전각
    this.imgRotationSpeed = 0;  // 매 프레임 회전량 (0 = 방향 자동 추적)
    this.imgAngleOffset = 0;    // 이미지 원점 방향 보정
    this.imgScale = 1.0;

    // ── 호밍 설정 ──
    this.isHoming = false;
    this.homingTarget = null;
    this.homingTurnSpeed = 0.1; // 최대 각도 변화량 (라디안)

    // ── 휘파람 화살(최종진화 마우스) 고유 설정 ──
    this.isWhistlingArrow = false;
    this.whistlingHitCooldowns = new Map(); // 적별 다단히트 쿨다운 관리
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
    this.isWhistlingArrow = false;
    this.whistlingHitCooldowns = new Map();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.duration--;
    if (this.duration <= 0) this.isDead = true;

    // ── 휘파람 화살 전용 물리/이펙트 업데이트 ──
    if (this.isWhistlingArrow) {
      // 1. 적별 다단히트 쿨다운 감소 처리
      if (this.whistlingHitCooldowns) {
        for (let [e, cd] of this.whistlingHitCooldowns.entries()) {
          if (cd > 0) {
            this.whistlingHitCooldowns.set(e, cd - 1);
          } else {
            this.whistlingHitCooldowns.delete(e);
          }
        }
      }

      // 2. 움직일 때 은은하게 남는 전용 트레일 파티클 생성
      if (frameCount % 2 === 0) {
        spawnEffect(new TrailDotEffect(this.x, this.y, [100, 200, 255]));
      }

      // 3. 타겟이 없을 시 화면 밖으로 탈출 방지를 위한 카메라 영역 튕김 반사
      if (!this.homingTarget) {
        let camX = player.x - width / 2;
        let camY = player.y - height / 2;
        if (this.x < camX + 20 || this.x > camX + width - 20) {
          this.vx *= -1;
          this.x = constrain(this.x, camX + 20, camX + width - 20);
        }
        if (this.y < camY + 20 || this.y > camY + height - 20) {
          this.vy *= -1;
          this.y = constrain(this.y, camY + 20, camY + height - 20);
        }
      }
    }

    if (this.isBounce) {
      let camX = player.x - width / 2;
      let camY = player.y - height / 2;
      if (this.x < camX || this.x > camX + width) this.vx *= -1;
      if (this.y < camY || this.y > camY + height) this.vy *= -1;
    }

    // 이미지 회전 업데이트
    if (this.imgKey) {
      if (this.imgRotationSpeed !== 0) {
        this.imgRotation += this.imgRotationSpeed;
      } else {
        this.imgRotation = atan2(this.vy, this.vx) + this.imgAngleOffset;
      }
    }

    // 호밍 유도 로직
    if (this.isHoming) {
      if (this.isWhistlingArrow) {
        // ── 휘파람 화살 고유: 1마리 집중 락온 (적의 체력 만족도(hp)가 최대(maxHp)가 되거나 필드 이탈 전까지 타겟 고정) ──
        if (!this.homingTarget || this.homingTarget.hp >= this.homingTarget.maxHp || !enemies.includes(this.homingTarget)) {
          let minDist = 3000;
          this.homingTarget = null;
          for (let e of enemies) {
            if (e.hp >= e.maxHp) continue; // 이미 만족 완료된 적 제외
            let d = dist(this.x, this.y, e.x, e.y);
            if (d < minDist) { minDist = d; this.homingTarget = e; }
          }
        }

        if (this.homingTarget) {
          // 마우스 흔들림(Jittering)을 해소하고 자연스러운 관성 선회를 탑재하기 위해 steering 회전 속도 제한 적용 (0.28 rad)
          // 이로써 대상을 유연한 U턴 궤적으로 스치고 통과한 뒤 다시 휩쓸며 관통 타격하게 됩니다!
          let targetAngle = atan2(this.homingTarget.y - this.y, this.homingTarget.x - this.x);
          let currentAngle = atan2(this.vy, this.vx);

          let diff = targetAngle - currentAngle;
          while (diff > PI) diff -= TWO_PI;
          while (diff < -PI) diff += TWO_PI;

          let turn = constrain(diff, -0.28, 0.28);
          currentAngle += turn;

          this.vx = cos(currentAngle) * this.speed;
          this.vy = sin(currentAngle) * this.speed;
        }
      } 
      else {
        // ── 일반 발사체 호밍 유도 (기존 방식) ──
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
  }

  display() {
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

    // ── 성능 최적화: 대략적인 거리(Bounding Box) 필터링 ──
    // dx와 dy가 충돌 가능 범위보다 멀리 있으면 무거운 dist() 계산을 통째로 스킵!
    let maxDist = this.isWhistlingArrow ? 50 : 35;
    if (Math.abs(this.x - e.x) > maxDist || Math.abs(this.y - e.y) > maxDist) return;

    // 휘파람 화살 고유 다단히트 판정 (2프레임 간격)
    if (this.isWhistlingArrow) {
      if (this.whistlingHitCooldowns.has(e)) return;
      
      // 조금 더 넓고 쾌적하게 닿도록 판정 크기를 35px로 튜닝
      if (dist(this.x, this.y, e.x, e.y) < this.size / 2 + 35) {
        e.takeDamage(this.damage, this.x, this.y, 0); // 넉백 없음
        this.whistlingHitCooldowns.set(e, 2); // 2프레임 쿨다운!
        
        // 피격 시 튕기는 전기 스파크 연출
        spawnEffect(new SparkEffect(e.x, e.y, [100, 200, 255]));
      }
      return;
    }

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
