// ═══════════════════════════════════════════════════════════
// core/boss.js — 아텍 교수님 보스 & 보스 투사체 클래스
// [AI 도움] 보스의 가시성을 개선하기 위해 드로우 크기를 180x180으로 확대했습니다.
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
    this.currentPattern = "MOVE"; // MOVE, ASSIGNMENT, F_RING, DEADLINE, ATTENDANCE_DASH
    this.patternDuration = 180;

    // 바닥/조준 경고창 관리
    this.warnings = [];

    // 대쉬 및 마감일용 각도/좌표 보정치
    this.dashAngle = 0;
    this.deadlineY = 0;
    this.deadlineCenterX = 0;
    this.deadlineYs = [];

    // 말풍선 시스템
    this.speechBubble = null;
  }

  // ObjectPool용 초기화 방지
  init(px, py, m, playerLevel) { }

  takeDamage(amount, sourceX, sourceY, knockback = 0) {
    // 교수님은 넉백 면제
    this.hp += amount;

    // 피격 수치 텍스트 팝업 추가
    damageTexts.push(damageTextPool.get(this.x, this.y, amount));

    // 피격 스파크 연출
    if (frameCount % 2 === 0) {
      spawnEffect(new SparkEffect(this.x + random(-25, 25), this.y + random(-30, 30), [255, 215, 0]));
    }

    // 클리어 조건 검사
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
      let patterns = ["MOVE", "ASSIGNMENT", "F_RING", "DEADLINE", "ATTENDANCE_DASH", "THESIS_METEOR"];
      let next = random(patterns);
      while (next === this.currentPattern) {
        next = random(patterns);
      }
      this.currentPattern = next;

      // 각 패턴 동작 시간 셋업
      if (this.currentPattern === "DEADLINE") {
        this.patternDuration = 120; // 경고 50프레임 + 발사 50프레임 + 후딜 20프레임
      } else if (this.currentPattern === "ATTENDANCE_DASH") {
        this.patternDuration = 120; // 경고 40프레임 + 돌진 30프레임 + 후딜 50프레임
      } else if (this.currentPattern === "THESIS_METEOR") {
        this.patternDuration = 240; // 4초 동안 논문/전공책 폭격
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
      // 2. 추가 과제! 패턴 (2마리씩 소환)
      this.facing = (px > this.x) ? 1 : -1;

      if (this.patternTimer === 0) {
        // 교수님이 추가 과제를 외침!
        this.speechBubble = { text: "추가 과제!", timer: 90 };

        for (let k = 0; k < 2; k++) {
          let spawnX = this.x + random(-180, 180);
          let spawnY = this.y + random(-180, 180);
          spawnX = constrain(spawnX, -MAP_SIZE, MAP_SIZE);
          spawnY = constrain(spawnY, -MAP_SIZE, MAP_SIZE);

          let minion = new Enemy();
          minion.x = spawnX;
          minion.y = spawnY;
          minion.speed = 1.0; // heavy
          minion.maxHp = 3000 + level * 750; // 체력 분산
          minion.hp = 0;
          minion.expValue = 0;
          minion.imgIndex = 0;
          minion.isAdditionalAssignment = true;
          minion.size = 90; // 크기 축소
          minion.noGemDrop = true;

          enemies.push(minion);
          
          // 소환 충격파 연출
          spawnEffect(new ShockwaveEffect(spawnX, spawnY, [255, 50, 50], 100));
        }
      }
    }
    else if (this.currentPattern === "F_RING") {
      // 3. F학점 소용돌이 살포
      this.facing = (px > this.x) ? 1 : -1;

      if (this.patternTimer === 0) {
        this.speechBubble = { text: "F학점!", timer: 90 };
      }

      if (this.patternTimer % 12 === 0 && this.patternTimer < this.patternDuration - 20) {
        let offset = (this.patternTimer * 0.08) % TWO_PI;
        this.shootFRing(8, 4.0, offset);
      }
    }
    else if (this.currentPattern === "DEADLINE") {
      // 4. 마감일 패턴 (가로 5라인 빨간 경고선 뒤에 D-1 글자 스윕)
      if (this.patternTimer < 50) {
        if (this.patternTimer === 0) {
          this.speechBubble = { text: "마감일!", timer: 90 };
          this.deadlineCenterX = px;
          this.deadlineYs = [];
          for (let i = 0; i < 5; i++) {
            this.deadlineYs.push(py + (i - 2) * 140); // 140px 간격으로 5라인 분산
          }
        }

        this.warnings = [];
        for (let i = 0; i < 5; i++) {
          this.warnings.push({
            type: "horizontal_rect",
            x: this.deadlineCenterX,
            y: this.deadlineYs[i],
            w: 1600,
            h: 90 // 회피 공간(50px) 확보를 위해 높이 90으로 조정
          });
        }
      }
      else if (this.patternTimer >= 50 && this.patternTimer < 100) {
        this.warnings = [];

        let progress = (this.patternTimer - 50) / 50; // 0 to 1
        let sweepX = lerp(this.deadlineCenterX - 800, this.deadlineCenterX + 800, progress);

        // 플레이어 피격 검출 (5개 라인 모두 검출)
        for (let i = 0; i < 5; i++) {
          let dy = this.deadlineYs[i];
          if (abs(py - dy) < 45 && abs(px - sweepX) < 70) {
            if (frameCount % 6 === 0) {
              player.takeDamage(15); // 데미지 벨런스 조절
              spawnEffect(new ShockwaveEffect(player.x, player.y, [255, 50, 50], 60));
            }
          }
        }
      }
      else {
        this.warnings = [];
      }
    }
    else if (this.currentPattern === "THESIS_METEOR") {
      // 5. 전공책 투하 패턴 (깜짝 퀴즈/논문 폭격)
      this.facing = (px > this.x) ? 1 : -1;

      if (this.patternTimer === 0) {
        this.speechBubble = { text: "전공책 투하!", timer: 90 };
      }

      // 15프레임 주기마다 플레이어 근처 무작위 위치에 낙하물 생성
      if (this.patternTimer % 15 === 0 && this.patternTimer < this.patternDuration - 40) {
        let targetX = px + random(-300, 300);
        let targetY = py + random(-300, 300);
        targetX = constrain(targetX, -MAP_SIZE, MAP_SIZE);
        targetY = constrain(targetY, -MAP_SIZE, MAP_SIZE);

        let startX = targetX + random(-50, 50);
        let startY = targetY - 500; // 하늘 위에서 낙하 시작

        let bp = new BossProjectile(startX, startY, targetX, targetY, "THESIS", 20, 20);
        bossProjectiles.push(bp);
      }
    }
    else if (this.currentPattern === "ATTENDANCE_DASH") {
      // 5. 출석 체크 패턴 (요네궁 돌진 ex)
      if (this.patternTimer < 40) {
        if (this.patternTimer === 0) {
          this.speechBubble = { text: "출석 체크!", timer: 90 };
          this.dashAngle = atan2(py - this.y, px - this.x);
        }
        this.facing = (px > this.x) ? 1 : -1;
        this.warnings = [{
          type: "rect",
          x: this.x, y: this.y,
          w: 550, h: 100, // wider track
          angle: this.dashAngle
        }];
      }
      else if (this.patternTimer >= 40 && this.patternTimer < 70) {
        this.warnings = [];
        
        // 고속 돌진
        this.x += cos(this.dashAngle) * 18;
        this.y += sin(this.dashAngle) * 18;

        if (frameCount % 4 === 0) {
          spawnEffect(new SparkEffect(this.x, this.y, [255, 50, 50]));
        }

        // 돌진 피격 검출
        if (dist(this.x, this.y, px, py) < 75 && frameCount % 12 === 0) {
          player.takeDamage(25);
          spawnEffect(new ShockwaveEffect(px, py, [255, 50, 50], 70));
        }
      }
      else if (this.patternTimer === 70) {
        this.warnings = [];
        // 돌진 완료시 슬램 폭발 연출
        spawnEffect(new ShockwaveEffect(this.x, this.y, [255, 50, 50], 150));
        for (let k = 0; k < 12; k++) {
          spawnEffect(new SparkEffect(this.x, this.y, [255, 50, 50]));
        }

        if (dist(this.x, this.y, px, py) < 120) {
          player.takeDamage(15);
        }
      }
      else {
        this.warnings = [];
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

  display() {
    push();
    translate(this.x, this.y);

    // ── 플레이어 방향에 따른 보스 이미지 좌우 대칭 ──
    push();
    if (this.facing === 1) {
      scale(-1, 1);
    }

    if (gameImages.boss) {
      // boss.png 이미지 드로잉
      imageMode(CENTER);
      image(gameImages.boss, 0, 0, 180, 180);
    } else {
      // fallback
      fill(180);
      rectMode(CENTER);
      rect(0, -55, 80, 20, 5);

      fill(242, 201, 182);
      rect(0, -35, 70, 30, 5);

      stroke(255, 215, 0);
      strokeWeight(2.5);
      noFill();
      ellipse(-15, -35, 20, 20);
      ellipse(15, -35, 20, 20);
      line(-5, -35, 5, -35);
      noStroke();

      fill(140);
      rect(0, -22, 20, 6, 2);

      fill(20, 28, 51);
      rect(0, 20, 96, 80, 8);

      fill(255);
      triangle(-15, -20, 15, -20, 0, 5);

      fill(210, 50, 50);
      quad(0, 5, -5, 10, 0, 35, 5, 10);

      fill(255, 215, 0);
      rect(28, 5, 10, 4, 1);
    }
    pop();

    // ── 말풍선 시스템 ──
    if (this.speechBubble && this.speechBubble.timer > 0) {
      this.speechBubble.timer--;
      push();
      rectMode(CENTER);
      noStroke();
      fill(255, 255, 255, 230);
      rect(0, -90, 140, 36, 12);
      
      // 말풍선 아래 꼬리침
      triangle(-8, -72, 8, -72, 0, -62);
      
      fill(20, 20, 30);
      textAlign(CENTER, CENTER);
      textSize(15);
      textStyle(BOLD);
      text(this.speechBubble.text, 0, -91);
      pop();
    }

    pop();

    // ── 마감일 D-1 글자 그리기 ──
    if (this.currentPattern === "DEADLINE" && this.patternTimer >= 50 && this.patternTimer < 100) {
      let progress = (this.patternTimer - 50) / 50;
      let sweepX = lerp(this.deadlineCenterX - 800, this.deadlineCenterX + 800, progress);

      push();
      textAlign(CENTER, CENTER);
      textSize(72); // 5개 겹침 대비 크기 축소
      textStyle(BOLD);

      for (let i = 0; i < 5; i++) {
        let dy = this.deadlineYs[i];

        // 잔상 모션 블러
        for (let j = 4; j > 0; j--) {
          let trailX = sweepX - j * 22;
          fill(255, 0, 0, 45 - j * 8);
          noStroke();
          text("D-1", trailX, dy);
        }

        // 네온 레드 텍스트 글로우
        drawingContext.shadowColor = 'rgba(255, 50, 50, 0.9)';
        drawingContext.shadowBlur = 20;

        stroke(255, 255, 255, 230);
        strokeWeight(4);
        fill(255, 0, 0);
        text("D-1", sweepX, dy - 4);
      }
      pop();
    }

    // ── 경고 영역 렌더링 (월드 좌표계) ──
    this.drawWarnings();
  }

  drawWarnings() {
    push();
    for (let w of this.warnings) {
      if (w.type === "circle") {
        fill(255, 50, 50, 95 + sin(frameCount * 0.15) * 35);
        stroke(255, 0, 0, 240);
        strokeWeight(3.5);
        ellipse(w.x, w.y, w.r * 2, w.r * 2);
      }
      else if (w.type === "line") {
        stroke(255, 0, 0, 210 + sin(frameCount * 0.3) * 45);
        strokeWeight(5.5);
        line(w.x1, w.y1, w.x2, w.y2);
      }
      else if (w.type === "rect") {
        // 돌진 직사각형 트랙 경고
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
      else if (w.type === "horizontal_rect") {
        // 마감일 가로 직사각형 트랙 경고
        push();
        rectMode(CENTER);
        fill(255, 50, 50, 80 + sin(frameCount * 0.25) * 30);
        stroke(255, 0, 0, 220);
        strokeWeight(3);
        rect(w.x, w.y, w.w, w.h, 4);
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
    this.type = type; // "F", "ASSIGNMENT", "THESIS"
    this.dmg = dmg;
    this.size = size;
    this.isDead = false;
    this.duration = 240;

    if (this.type === "F") {
      this.vx = targetX;
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
    else if (this.type === "ASSIGNMENT" || this.type === "THESIS") {
      // 과제지 및 전공책은 하늘 위에서 Target Y 좌표로 낙하
      let fallSpeed = (this.type === "THESIS") ? 10 : 8; // 책이 더 묵직하므로 빠르게 낙하
      this.y += fallSpeed;
      this.x = lerp(this.x, this.targetX, 0.05);

      if (this.y >= this.targetY) {
        this.isDead = true;
        
        let explosionRad = (this.type === "THESIS") ? 95 : 65;
        let shockwaveColor = (this.type === "THESIS") ? [100, 150, 255] : [255, 80, 50]; // 전공책은 파란 충격파
        
        spawnEffect(new ShockwaveEffect(this.targetX, this.targetY, shockwaveColor, explosionRad));
        for (let i = 0; i < (this.type === "THESIS" ? 8 : 5); i++) {
          spawnEffect(new SparkEffect(this.targetX, this.targetY, shockwaveColor));
        }

        if (dist(player.x, player.y, this.targetX, this.targetY) < explosionRad) {
          player.takeDamage(this.dmg);
        }
      }
    }
  }

  display() {
    // ── 전공책 및 과제지 투하 시 바닥 경고 원 표시 (월드 좌표계) ──
    if ((this.type === "ASSIGNMENT" || this.type === "THESIS") && this.y < this.targetY) {
      push();
      // Y축 낙하 진행율에 따라 경고 영역 점차 축소 및 진해짐
      let animRatio = constrain((this.targetY - this.y) / 500.0, 0, 1);
      let rad = (this.type === "THESIS") ? 95 : 65;
      
      noStroke();
      fill(255, 50, 50, 45 * (2 - animRatio)); // 가까워질수록 불투명해짐
      ellipse(this.targetX, this.targetY, rad * 2, rad * 2);
      
      noFill();
      stroke(255, 50, 50, 180 * (2 - animRatio));
      strokeWeight(2);
      ellipse(this.targetX, this.targetY, rad * 2 * animRatio, rad * 2 * animRatio);
      pop();
    }

    push();
    translate(this.x, this.y);

    if (this.type === "F") {
      // 붉고 사악한 학점 경고 글씨 (네온 레드 글로우 추가)
      rotate(frameCount * 0.05);
      textAlign(CENTER, CENTER);
      textSize(32 + sin(frameCount * 0.15) * 4);
      textStyle(BOLD);
      
      drawingContext.shadowColor = 'rgba(255, 0, 0, 0.8)';
      drawingContext.shadowBlur = 15;
      
      stroke(0);
      strokeWeight(3.5);
      fill(255, 50, 50);
      text("F", 0, 0);
    }
    else if (this.type === "ASSIGNMENT") {
      rotate(frameCount * 0.07);
      rectMode(CENTER);
      fill(255);
      stroke(220, 0, 0);
      strokeWeight(2);
      rect(0, 0, 24, 32, 2);

      stroke(255, 0, 0);
      strokeWeight(1.5);
      line(-8, -8, 8, -8);
      line(-8, -1, 6, -1);
      line(-8, 6, 2, 6);
    }
    else if (this.type === "THESIS") {
      // 전공책 이미지 그리기
      rotate(frameCount * 0.1);
      rectMode(CENTER);
      
      // 커버
      fill(45, 90, 200); // 파란 전공책 표지
      stroke(255, 215, 0); // 금색 테두리
      strokeWeight(2.5);
      rect(0, 0, 32, 42, 3);
      
      // 내지
      fill(240);
      noStroke();
      rect(13, 0, 3, 36);
      
      // 책등 금장 제목선
      fill(255, 215, 0);
      rect(-10, 0, 4, 32);
      
      // 책갈피 끈
      fill(255, 50, 50);
      triangle(-2, 18, 4, 18, 1, 26);
    }

    pop();
  }

  checkHit(ply) {
    if (this.type === "F") {
      if (dist(this.x, this.y, ply.x, ply.y) < this.size / 2 + 20) {
        ply.takeDamage(this.dmg);
        this.isDead = true;
      }
    }
  }
}
