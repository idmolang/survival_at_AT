class SeniorSummonSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 30, cd: 180, proj: 1, area: 1.0, desc: "무작위 위치에 생성되어 일직선 레이저 발사" },
    { dmg: 45, cd: 180, proj: 1, area: 1.2, desc: "데미지 및 레이저 굵기 증가" },
    { dmg: 45, cd: 150, proj: 2, area: 1.2, desc: "블래스터 1개 추가, 쿨타임 감소" },
    { dmg: 80, cd: 150, proj: 2, area: 1.5, desc: "데미지 및 레이저 굵기 증가" },
    { dmg: 80, cd: 120, proj: 3, area: 1.5, desc: "블래스터 1개 추가, 쿨타임 감소" }
  ];
  static EVO_DATA = { dmg: 150, cd: 60, proj: 4, area: 2.3, desc: "화면을 뒤덮는 파괴적인 초거대 레이저 발사" };

  constructor(owner) {
    super(owner);
    this.name = "선배들의 조언";
    this.id = "선배들의 조언";
    this.blasters = [];
  }

  // 레이저 각도 → 8방향 키 매핑
  _angleToDir(angle) {
    // angle은 atan2 기준 (-PI ~ PI)
    let deg = degrees(angle);
    if (deg < 0) deg += 360;
    // 8방향 분할 (45도씩)
    if (deg >= 337.5 || deg < 22.5) return "right";
    else if (deg >= 22.5 && deg < 67.5) return "down_right";
    else if (deg >= 67.5 && deg < 112.5) return "down";
    else if (deg >= 112.5 && deg < 157.5) return "down_left";
    else if (deg >= 157.5 && deg < 202.5) return "left";
    else if (deg >= 202.5 && deg < 247.5) return "up_left";
    else if (deg >= 247.5 && deg < 292.5) return "up";
    else return "up_right";
  }

  update(stats) {
    let s = this.currentStats;
    let rate = max(30, s.cd * stats.cooldown);

    if (frameCount % floor(rate) === 0) {
      for (let i = 0; i < s.proj; i++) {
        let bx = this.owner.x + random(-400, 400);
        let by = this.owner.y + random(-400, 400);
        let a = random(TWO_PI);
        if (enemies.length > 0) {
          let t = random(enemies);
          a = atan2(t.y - by, t.x - bx);
        }
        // ex/ey: 레이저 끝 좌표 (공격 이미지 배치 위치)
        let ex = bx + cos(a) * 900;
        let ey = by + sin(a) * 900;
        this.blasters.push({ x: bx, y: by, ex, ey, angle: a, timer: 30, fired: false, attackTimer: 0 });
        // ── 차지 이펙트 ──
        spawnEffect(new LaserChargeEffect(bx, by, a));
      }
    }

    for (let i = this.blasters.length - 1; i >= 0; i--) {
      let b = this.blasters[i];
      b.timer--;

      if (b.timer <= 0 && !b.fired) {
        b.fired = true;
        b.attackTimer = 22; // 공격 이미지 표시 지속 프레임
        let dmg = s.dmg * stats.attack;
        let w = 20 * s.area * stats.area;
        for (let e of enemies) {
          let px = e.x - b.x; let py = e.y - b.y;
          let localX = px * cos(-b.angle) - py * sin(-b.angle);
          let localY = px * sin(-b.angle) + py * cos(-b.angle);
          if (localX > 0 && localX < 1200 && abs(localY) < w) {
            e.takeDamage(dmg, b.x, b.y, 4.0);
          }
        }
        // ── 레이저 발사 이펙트 (벽력일섬 스타일 강화) ──
        spawnEffect(new LaserBeamEffect(b.x, b.y, b.angle, w, [255, 50, 50]));
        // 레이저 끝 임팩트 이펙트
        let ex = b.x + cos(b.angle) * 900;
        let ey = b.y + sin(b.angle) * 900;
        spawnEffect(new SeniorPunchImpactEffect(ex, ey, b.angle));
        let p = projPool.get(b.x, b.y, b.angle, 0, 0, true, w * 2, 15, [255, 0, 0, 200], false);
        p.isLaser = true;
        projectiles.push(p);
      }

      // 공격 타이머 감소
      if (b.fired && b.attackTimer > 0) {
        b.attackTimer--;
      }

      // 발사 완료 후 attackTimer도 소진되면 제거
      if (b.fired && b.attackTimer <= 0 && b.timer < -5) {
        this.blasters.splice(i, 1);
      }
    }
  }

  display(stats) {
    for (let b of this.blasters) {
      let s = this.currentStats;
      let w = 20 * s.area * stats.area;
      let dir = this._angleToDir(b.angle);

      if (!b.fired) {
        // ─────────────────────────────────────────
        // 차지 단계: 선배 '준비' 이미지 + 조준선
        // ─────────────────────────────────────────
        let readyImg = gameImages.senior_ready;
        if (readyImg) {
          push();
          imageMode(CENTER);
          // 차징 중 미세한 떨림 + 점점 밝아지는 틴트
          let shake = (b.timer < 10) ? random(-2, 2) : 0;
          let chargeRatio = 1.0 - (b.timer / 30);
          let pulse = sin(frameCount * 0.4) * 0.15 + 0.85;
          let sc = (0.9 + chargeRatio * 0.2) * pulse;

          // 아우라 글로우 (차징이 찰수록 강해짐)
          noStroke();
          fill(255, 80, 80, chargeRatio * 120 * pulse);
          ellipse(b.x + shake, b.y + shake, 80 * sc * chargeRatio, 80 * sc * chargeRatio);

          tint(255, 180 + chargeRatio * 75);
          image(readyImg, b.x + shake, b.y + shake, 80 * sc, 100 * sc);
          noTint();
          pop();
        } else {
          // 이미지 미로딩 폴백
          push();
          translate(b.x, b.y);
          noStroke(); fill(30, 30, 40);
          ellipse(0, 0, 34, 34);
          fill(200, 50, 50);
          ellipse(0, 0, 24, 24);
          pop();
        }

        // 조준선 (깜빡이는 경고)
        push();
        translate(b.x, b.y);
        rotate(b.angle);
        let blink = sin(frameCount * 0.3) * 0.5 + 0.5;
        stroke(255, 50, 50, 80 * blink + 20);
        strokeWeight(w * 0.5);
        line(16, 0, 900, 0);
        stroke(255, 100, 100, 50 * blink);
        strokeWeight(w * 1.5);
        line(16, 0, 900, 0);
        pop();

      } else if (b.attackTimer > 0) {
        // ─────────────────────────────────────────
        // 발사 단계: 선배 '공격' 방향 이미지
        // ─────────────────────────────────────────
        let attackImg = gameImages.senior_attack && gameImages.senior_attack[dir];
        if (attackImg) {
          push();
          imageMode(CENTER);
          let t = b.attackTimer / 22; // 1→0으로 감소
          // 발사 순간 크게 스케일 업 후 빠르게 수축
          let sc = 1.0 + (1.0 - t) * 0.35;
          let alpha = t < 0.3 ? (t / 0.3) * 255 : 255;

          // 공격 순간 백색 플래시 글로우 (준비 자세와 똑같은 소환 위치)
          noStroke();
          fill(255, 100, 100, t * 180);
          ellipse(b.x, b.y, 100 * sc * t, 100 * sc * t);

          tint(255, alpha);
          image(attackImg, b.x, b.y, 90 * sc, 110 * sc);
          noTint();
          pop();
        }
      }
    }
  }
}
