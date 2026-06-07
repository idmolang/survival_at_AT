class UnibookSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 15, cd: 180, dur: 120, proj: 1, spd: 0.03, area: 1.0, desc: "플레이어 주변을 맴도는 책 생성" },
    { dmg: 15, cd: 180, dur: 150, proj: 2, spd: 0.05, area: 1.0, desc: "책 1개 추가, 속도 및 지속시간 증가" },
    { dmg: 15, cd: 180, dur: 150, proj: 3, spd: 0.07, area: 1.25, desc: "책 1개 추가, 범위 및 속도 증가" },
    { dmg: 25, cd: 180, dur: 180, proj: 4, spd: 0.07, area: 1.25, desc: "책 1개 추가, 지속시간 및 데미지 증가" },
    { dmg: 40, cd: 180, dur: 180, proj: 5, spd: 0.07, area: 1.25, desc: "책 1개 추가, 데미지 증가" }
  ];
  static EVO_DATA = { dmg: 50, cd: 1, dur: 999999, proj: 6, spd: 0.1, area: 1.5, desc: "책이 영구적으로 주변을 맴돕니다." };

  constructor(owner) {
    super(owner);
    this.name = "Unibook";
    this.id = "Unibook";
    this.angle = 0;
    this.activeTimer = 0;
    this.cooldownTimer = 0;
  }

  update(stats) {
    let s = this.currentStats;
    let cdRate = max(30, s.cd * stats.cooldown);
    let durRate = s.dur * stats.duration;

    if (this.isEvolved) {
      this.activeTimer = 999999;
      this.cooldownTimer = 0;
    }

    if (this.activeTimer > 0) {
      this.activeTimer--;
      
      // 유니북 순회 회전 속도를 시원하고 쾌속하게 복원/상향 (진화형: 0.12, 일반형: 레벨속도 * 2.2)
      let rotationSpeed = this.isEvolved ? 0.12 : s.spd * 2.2;
      this.angle += rotationSpeed;
      
      if (this.activeTimer <= 0) {
        this.cooldownTimer = cdRate;
      }
    } else if (this.cooldownTimer > 0) {
      this.cooldownTimer--;
    } else {
      this.activeTimer = durRate;
    }
  }

  display(stats) {
    if (this.activeTimer <= 0) return;

    let s = this.currentStats;
    let radius = 100 * s.area * stats.area;
    let dmg = s.dmg * stats.attack;

    for (let i = 0; i < s.proj; i++) {
      let a = this.angle + (TWO_PI / s.proj) * i;
      let sx = this.owner.x + cos(a) * radius;
      let sy = this.owner.y + sin(a) * radius;

      // ── 절차적 유니북 책 렌더링 ──
      push();
      noStroke();
      
      // 2. 예시 이미지 책 뭉치 형태 바탕에, 실제 gameImages.unibook 이미지를 표지로 합성하여 출력!
      this.drawBookShape(sx, sy, 24, 28);
      
      pop();

      // ── 히트 판정 & 이펙트 ──
      for (let e of enemies) {
        if (dist(sx, sy, e.x, e.y) < 25) { 
          if (!e.lastUnibookHitFrames) e.lastUnibookHitFrames = {};
          let lastHit = e.lastUnibookHitFrames[i] || 0;
          
          if (frameCount - lastHit > 20) {
            e.takeDamage(dmg, sx, sy, 3.0);
            e.lastUnibookHitFrames[i] = frameCount;
            spawnEffect(new OrbHitEffect(sx, sy));
          }
        }
      }
    }
  }

  // 예시 이미지의 화이트 3D 닫힌 책 및 블랙 U 로고 데칼을 완벽하게 재현한 작화기
  drawBookShape(x, y, w, h) {
    push();
    translate(x, y);
    // 자전(self-rotation) 제거: 항상 정자세를 유지

    rectMode(CENTER);
    imageMode(CENTER);

    // ── 0. 입체 그림자 (Bottom-Right Drop Shadow) ──
    fill(0, 0, 0, 75);
    noStroke();
    rect(3, 3, w, h, 2);

    // ── 1. 비율 및 레이어 영역 분할 ──
    let spineW = Math.max(4, Math.round(w * 0.18));
    let pagesH = Math.max(4, Math.round(h * 0.15));

    let leftX = -w / 2;
    let leftY = -h / 2 + pagesH;
    let leftW = spineW;
    let leftH = h - pagesH;

    let coverX = -w / 2 + spineW;
    let coverY = -h / 2 + pagesH;
    let coverW = w - spineW;
    let coverH = h - pagesH;

    let pagesX = -w / 2 + spineW;
    let pagesY = -h / 2;
    let pagesW = w - spineW;

    // ── 2. 선 외곽선 및 테두리 (Crisp Pixel-Art Outlines) ──
    stroke(18, 19, 23);
    strokeWeight(1.5);

    // ── 3. 왼쪽 뒤표지 및 입체 측면 레이어 (Left Back Cover & Layered Edge) ──
    fill(235, 235, 238);
    rect(leftX + leftW / 2, leftY + leftH / 2, leftW, leftH);

    // ── 4. 상단 페이지 뭉치 (Stacked Pages at the Top) ──
    fill(250, 250, 248);
    rect(pagesX + pagesW / 2, pagesY + pagesH / 2, pagesW, pagesH);
    
    // 페이지 가로선 디테일
    stroke(180, 180, 185);
    strokeWeight(1);
    line(pagesX, pagesY + pagesH / 2, pagesX + pagesW - 1, pagesY + pagesH / 2);

    // ── 5. 앞표지 플레이트 (Front Cover Board — Elegant Pure White) ──
    stroke(18, 19, 23);
    strokeWeight(1.5);
    fill(255);
    rect(coverX + coverW / 2, coverY + coverH / 2, coverW, coverH);

    // ── 6. 귀퉁이 블랙 코너 바인딩 (Top-Left Accent Crease) ──
    fill(35, 36, 42);
    noStroke();
    rect(coverX + 1.5, coverY + 1.5, 3, 3);

    // ── 7. 표지 U 데칼 (Actual unibook.png Image on the white cover!) ──
    if (typeof gameImages !== 'undefined' && gameImages.unibook) {
      // 순수 블랙 U 엠블럼 이미지를 화이트 앞표지 중앙에 우아하고 큼직하게 표출
      image(gameImages.unibook, coverX + coverW / 2, coverY + coverH / 2, coverW * 0.65, coverH * 0.65);
    } else {
      // 에셋 로드 실패 시의 백업 텍스트 'U'
      fill(18, 19, 23);
      textSize(Math.round(coverH * 0.6));
      textAlign(CENTER, CENTER);
      text("U", coverX + coverW / 2, coverY + coverH / 2);
    }

    pop();
  }
}