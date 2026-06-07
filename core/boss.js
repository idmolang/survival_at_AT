// ═══════════════════════════════════════════════════════════
// core/boss.js — 아텍 교수님 보스 & 보스 투사체 클래스
// ═══════════════════════════════════════════════════════════

class Boss extends Enemy {
  constructor(px, py) {
    super();
    this.x = px;
    this.y = py;
    this.speed = 1.0;
    this.hp = 0;           // 학업 만족도 수치 (0에서 시작하여 100% 충전하는 방식)
    this.maxHp = 300000;     // 만족도 최대치
    this.vx = 0;
    this.vy = 0;
    this.expValue = 0;     // 보스는 보석을 뱉지 않음
    this.facing = (px > this.x) ? 1 : -1;
    this.imgIndex = 99;    // 보스 전용 이미지 마커 (display에서 분기처리)

    // 보스 패턴 및 시간 조율
    this.patternTimer = 0;
    this.currentPattern = "MOVE"; // MOVE, ASSIGNMENT, F_RING, LASER_SWEEP, GRADUATE_DASH
    this.patternDuration = 180;

    // 바닥/조준 경고창 관리
    this.warnings = [];

    // 돌진/레이저 용 각도 및 보정치
    this.laserTargetAngle = 0;
    this.dashAngle = 0;
  }

  // ObjectPool용 초기화 방지
  init(px, py, m, playerLevel) { }

  takeDamage(amount, sourceX, sourceY, knockback = 0) {
    // 교수님은 넉백(밀려남) 면제
    this.hp += amount;

    // 피격 수치(만족도 상승치) 텍스트 팝업 추가
    damageTexts.push(damageTextPool.get(this.x, this.y, amount));

    // 피격 스파크 연출
    if (frameCount % 2 === 0) {
      spawnEffect(new SparkEffect(this.x + random(-25, 25), this.y + random(-30, 30), [255, 215, 0]));
    }

    // 클리어 조건 검사 (만족도 만점 도달 시 즉시 클리어)
    if (this.hp >= this.maxHp) {
      this.hp = this.maxHp;
      gameState = "GAME_CLEAR";
    }
  }

  update(px, py, enemiesList) {
    // 속도 감쇄
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.85;
    this.vy *= 0.85;

    // 패턴 상태 기계 프레임 틱
    this.patternTimer++;
    if (this.patternTimer >= this.patternDuration) {
      this.patternTimer = 0;
      this.warnings = []; // 경고 정보 지우기

      // 패턴 교체
      let patterns = ["MOVE", "ASSIGNMENT", "F_RING", "LASER_SWEEP", "GRADUATE_DASH"];
      let next = random(patterns);
      while (next === this.currentPattern) {
        next = random(patterns);
      }
      this.currentPattern = next;

      // 각 패턴 동작 시간 셋업
      if (this.currentPattern === "LASER_SWEEP") {
        this.patternDuration = 120; // 조준 45프레임 + 발사 45프레임 + 후딜 30프레임
      } else if (this.currentPattern === "GRADUATE_DASH") {
        this.patternDuration = 150; // 경고 40프레임 + 돌진 30프레임 + 후딜 80프레임
      } else {
        this.patternDuration = 180;
      }
    }

    // ── 패턴별 물리 업데이트 ──
    if (this.currentPattern === "MOVE") {
      // 1. 일반 추적 이동 패턴
      let angle = atan2(py - this.y, px - this.x);
      this.x += cos(angle) * this.speed;
      this.y += sin(angle) * this.speed;
      this.facing = (px > this.x) ? 1 : -1;

      // 주기적으로 가벼운 F 탄막 뿌리기
      if (this.patternTimer % 45 === 0) {
        this.shootFRing(6, 3.0);
      }
    }
    else if (this.currentPattern === "ASSIGNMENT") {
      // 2. 과제지 하늘에서 폭격 패턴 (제자리 고정)
      this.facing = (px > this.x) ? 1 : -1;

      // 35프레임 주기마다 플레이어 근처에 원형 바닥 경고 생성
      if (this.patternTimer % 35 === 0 && this.patternTimer < this.patternDuration - 40) {
        let targetX = px + random(-100, 100);
        let targetY = py + random(-100, 100);
        this.warnings.push({
          type: "circle",
          x: targetX, y: targetY,
          r: 55,
          timer: 30
        });
      }

      // 원형 경고 만료 시 과제지 낙하
      for (let i = this.warnings.length - 1; i >= 0; i--) {
        let w = this.warnings[i];
        if (w.type === "circle") {
          w.timer--;
          if (w.timer <= 0) {
            // 과제 낙하 발사체 스폰 (하늘 위에서 표적으로)
            let startX = w.x + random(-10, 10);
            let startY = w.y - 450;
            bossProjectiles.push(new BossProjectile(startX, startY, w.x, w.y, "ASSIGNMENT", 20, 16));
            this.warnings.splice(i, 1);
          }
        }
      }
    }
    else if (this.currentPattern === "F_RING") {
      // 3. F학점 조밀 소용돌이 전방위 살포
      this.facing = (px > this.x) ? 1 : -1;

      if (this.patternTimer % 12 === 0 && this.patternTimer < this.patternDuration - 20) {
        let offset = (this.patternTimer * 0.08) % TWO_PI;
        this.shootFRing(8, 4.0, offset);
      }
    }
    else if (this.currentPattern === "LASER_SWEEP") {
      // 4. 출석 체크 레이저 스윕
      if (this.patternTimer < 45) {
        this.facing = (px > this.x) ? 1 : -1;
        this.laserTargetAngle = atan2(py - this.y, px - this.x);
        this.warnings = [{
          type: "line",
          x1: this.x, y1: this.y,
          x2: this.x + cos(this.laserTargetAngle) * 1200,
          y2: this.y + sin(this.laserTargetAngle) * 1200
        }];
      }
      else if (this.patternTimer >= 45 && this.patternTimer < 90) {
        this.warnings = [];
        let currentAngle = atan2(py - this.y, px - this.x);
        // 플레이어를 향해 부드럽게 레이저 각도를 회전시켜 휩쓰는 느낌 제공
        this.laserTargetAngle = lerp(this.laserTargetAngle, currentAngle, 0.05);

        // 다단히트 충돌 레이저 체크
        this.checkLaserCollision(px, py, this.laserTargetAngle);
      }
      else {
        this.warnings = [];
      }
    }
    else if (this.currentPattern === "GRADUATE_DASH") {
      // 5. 대학원생 모집 고속 돌진
      if (this.patternTimer < 40) {
        if (this.patternTimer === 1) {
          this.dashAngle = atan2(py - this.y, px - this.x);
        }
        this.facing = (px > this.x) ? 1 : -1;
        this.warnings = [{
          type: "rect",
          x: this.x, y: this.y,
          w: 450, h: 80,
          angle: this.dashAngle
        }];
      }
      else if (this.patternTimer >= 40 && this.patternTimer < 70) {
        this.warnings = [];
        // 고속 대쉬 이동
        this.x += cos(this.dashAngle) * 12;
        this.y += sin(this.dashAngle) * 12;

        if (frameCount % 4 === 0) {
          spawnEffect(new SparkEffect(this.x, this.y, [180, 180, 200]));
        }

        // 돌진 데미지 판정 (다단 방지)
        if (dist(this.x, this.y, px, py) < 65 && frameCount % 12 === 0) {
          player.takeDamage(25);
          spawnEffect(new ShockwaveEffect(px, py, [255, 100, 100], 50));
        }
      }
      else if (this.patternTimer === 70) {
        this.warnings = [];
        // 돌진 직후 그 자리에 대학원생 몬스터 4개 긴급 스폰
        this.spawnGraduateMinions(4);
      }
    }
  }

  shootFRing(count, speed, offsetAngle = 0) {
    for (let i = 0; i < count; i++) {
      let a = offsetAngle + (TWO_PI / count) * i;
      let vx = cos(a) * speed;
      let vy = sin(a) * speed;
      bossProjectiles.push(new BossProjectile(this.x, this.y, vx, vy, "F", 15, 12));
    }
  }

  spawnGraduateMinions(count) {
    for (let i = 0; i < count; i++) {
      let a = (TWO_PI / count) * i;
      let spawnX = this.x + cos(a) * 80;
      let spawnY = this.y + sin(a) * 80;

      let minion = enemyPool.get(spawnX, spawnY, 1, level);
      minion.x = spawnX;
      minion.y = spawnY;
      minion.speed = 1.6;
      minion.maxHp = 60;
      minion.hp = 0;
      minion.imgIndex = 5; // 대학원생 전용 캐릭터 얼굴 인덱스
      enemies.push(minion);
    }
  }

  checkLaserCollision(px, py, angle) {
    let vx = cos(angle);
    let vy = sin(angle);
    let dx = px - this.x;
    let dy = py - this.y;

    let dot = dx * vx + dy * vy;
    if (dot > 0) {
      let projX = this.x + vx * dot;
      let projY = this.y + vy * dot;
      let d = dist(px, py, projX, projY);

      // 레이저 빔 안에 플레이어가 있을 때 (빔 직경 약 26픽셀)
      if (d < 25) {
        player.takeDamage(2); // 레이저는 도트당 연속 데미지이므로 가벼운 피해로 보정
        if (frameCount % 4 === 0) {
          spawnEffect(new SparkEffect(px, py, [255, 215, 0]));
        }
      }
    }
  }

  display() {
    push();
    translate(this.x, this.y);

    // ── 플레이어 방향에 따른 보스 이미지 좌우 대칭 ──
    push();
    if (this.facing === 1) {
      scale(-1, 1);
    }

    // 1. 머리 및 머리카락 (네모형 교수님 스타일)
    fill(180);
    rectMode(CENTER);
    rect(0, -55, 80, 20, 5);

    // 2. 얼굴
    fill(242, 201, 182);
    rect(0, -35, 70, 30, 5);

    // 안경 (금테 안경 드로잉)
    stroke(255, 215, 0);
    strokeWeight(2.5);
    noFill();
    ellipse(-15, -35, 20, 20);
    ellipse(15, -35, 20, 20);
    line(-5, -35, 5, -35);
    noStroke();

    // 인자한 수염
    fill(140);
    rect(0, -22, 20, 6, 2);

    // 3. 어두운 남색 정장 수트 (사각형 바디)
    fill(20, 28, 51);
    rect(0, 20, 96, 80, 8);

    // 와이셔츠 깃
    fill(255);
    triangle(-15, -20, 15, -20, 0, 5);

    // 빨간색 명문 넥타이
    fill(210, 50, 50);
    quad(0, 5, -5, 10, 0, 35, 5, 10);

    // 주머니 금뱃지 장식
    fill(255, 215, 0);
    rect(28, 5, 10, 4, 1);

    pop();

    // ── 출석 체크 레이저 빔 그리기 ──
    if (this.currentPattern === "LASER_SWEEP" && this.patternTimer >= 45 && this.patternTimer < 90) {
      push();
      // 광선 외곽 글로우 (빔 너비 30 -> 50으로 대폭 확대)
      stroke(255, 195, 0, 160 + sin(frameCount * 0.4) * 60);
      strokeWeight(50);
      line(0, 0, cos(this.laserTargetAngle) * 1200, sin(this.laserTargetAngle) * 1200);

      // 광선 핵심 코어 (코어 두께 12 -> 18로 확대)
      stroke(255, 255, 255, 240);
      strokeWeight(18);
      line(0, 0, cos(this.laserTargetAngle) * 1200, sin(this.laserTargetAngle) * 1200);
      pop();
    }

    pop();

    // ── 경고 영역 렌더링 (월드 좌표계) ──
    this.drawWarnings();
  }

  drawWarnings() {
    push();
    for (let w of this.warnings) {
      if (w.type === "circle") {
        // 과제 낙하 원형 폭발 경고 (선 두께 2->3.5, 알파 45->95로 시인성 대폭 강화)
        fill(255, 50, 50, 95 + sin(frameCount * 0.15) * 35);
        stroke(255, 0, 0, 240);
        strokeWeight(3.5);
        ellipse(w.x, w.y, w.r * 2, w.r * 2);
      }
      else if (w.type === "line") {
        // 레이저 조준선 경고 (두께 3->5.5, 불투명도 증가)
        stroke(255, 0, 0, 210 + sin(frameCount * 0.3) * 45);
        strokeWeight(5.5);
        line(w.x1, w.y1, w.x2, w.y2);
      }
      else if (w.type === "rect") {
        // 돌진 직사각형 트랙 경고 (선 두께 2->3.5, 알파 45->90으로 증가)
        push();
        translate(w.x, w.y);
        rotate(w.angle);
        fill(255, 50, 50, 90 + sin(frameCount * 0.2) * 30);
        stroke(255, 0, 0, 240);
        strokeWeight(3.5);
        rectMode(CORNER);
        rect(0, -w.h / 2, w.w, w.h);
        pop();
      }
    }
    pop();
  }
}


// ═══════════════════════════════════════════════════════════
// BossProjectile — 보스 전용 투사체 클래스
// ═══════════════════════════════════════════════════════════

class BossProjectile {
  constructor(x, y, targetX, targetY, type, dmg = 15, size = 15) {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.type = type; // "F", "ASSIGNMENT"
    this.dmg = dmg;
    this.size = size;
    this.isDead = false;
    this.duration = 240;

    if (this.type === "F") {
      this.vx = targetX; // F학점은 생성자에 vx, vy 속도를 넘겨받음
      this.vy = targetY;
    }
  }

  update() {
    if (this.type === "F") {
      this.x += this.vx;
      this.y += this.vy;
      this.duration--;
      if (this.duration <= 0) this.isDead = true;
    }
    else if (this.type === "ASSIGNMENT") {
      // 과제지는 하늘 위에서 Target Y 좌표로 중력 가속 낙하
      this.y += 8;
      // 완만한 X축 추적 조정
      this.x = lerp(this.x, this.targetX, 0.05);

      // 타겟 고도 도달 시 폭발
      if (this.y >= this.targetY) {
        this.isDead = true;

        // 지면 도달 충격파 연출 (충격파 폭발 범위 확장)
        spawnEffect(new ShockwaveEffect(this.targetX, this.targetY, [255, 80, 50], 65));
        for (let i = 0; i < 5; i++) {
          spawnEffect(new SparkEffect(this.targetX, this.targetY, [255, 140, 60]));
        }

        // 폭발 데미지 체크
        if (dist(player.x, player.y, this.targetX, this.targetY) < 65) {
          player.takeDamage(this.dmg);
        }
      }
    }
  }

  display() {
    push();
    translate(this.x, this.y);

    if (this.type === "F") {
      // 붉고 사악한 학점 경고 글씨 (크기 22->30으로 확대 및 가시용 검정 테두리 장착)
      textAlign(CENTER, CENTER);
      textSize(30);
      textStyle(BOLD);
      stroke(0);
      strokeWeight(3.5);
      fill(255, 0, 0);
      text("F", 0, 0);
    }
    else if (this.type === "ASSIGNMENT") {
      // 회전하는 과제지 연출 (크기 18x24 -> 24x32로 확대)
      rotate(frameCount * 0.07);
      rectMode(CENTER);
      fill(255);
      stroke(220, 0, 0);
      strokeWeight(2);
      rect(0, 0, 24, 32, 2);

      // 빨간색 교수님 과제 피드백 선낙서
      stroke(255, 0, 0);
      strokeWeight(1.5);
      line(-8, -8, 8, -8);
      line(-8, -1, 6, -1);
      line(-8, 6, 2, 6);
    }

    pop();
  }

  checkHit(ply) {
    if (this.type === "F") {
      // F학점 탄알 터치 검출
      if (dist(this.x, this.y, ply.x, ply.y) < this.size / 2 + 20) {
        ply.takeDamage(this.dmg);
        this.isDead = true;
      }
    }
  }
}
