// ═══════════════════════════════════════════════════════════
// LightningStrikeEffect — 번개 낙뢰 이펙트
// 사용: Cramming 번개 스킬
// ═══════════════════════════════════════════════════════════
class LightningStrikeEffect extends BaseEffect {
  constructor(x, y, rad = 80) {
    super(x, y);
    this.rad = rad;
    this.life = 1.0;
    this.bolts = [];
    this._generateBolts(x, y);
  }

  _generateBolts(x, y) {
    // 위에서 떨어지는 번개 줄기 생성 (재귀적 지그재그)
    let boltCount = floor(random(2, 4));
    for (let b = 0; b < boltCount; b++) {
      let bolt = [];
      let startX = x + random(-this.rad * 0.3, this.rad * 0.3);
      let startY = y - random(200, 350);
      let curX = startX;
      let curY = startY;
      let segments = floor(random(8, 14));
      for (let i = 0; i <= segments; i++) {
        let t = i / segments;
        let targetX = x + random(-this.rad * 0.2, this.rad * 0.2);
        let targetY = y;
        curX = lerp(startX, targetX, t) + (i < segments ? random(-20, 20) : 0);
        curY = lerp(startY, targetY, t);
        bolt.push({ x: curX, y: curY });
      }
      this.bolts.push(bolt);
    }

    // 임팩트 파티클 (땅에 퍼지는 불꽃)
    this.impactParticles = [];
    for (let i = 0; i < 12; i++) {
      let a = random(TWO_PI);
      let spd = random(2, 6);
      this.impactParticles.push({
        x: x, y: y,
        vx: cos(a) * spd, vy: sin(a) * spd - random(1, 3),
        size: random(3, 8),
        life: 1.0
      });
    }
  }

  update() {
    this.life -= 0.08;
    if (this.life <= 0) this.isDead = true;
    for (let p of this.impactParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.vx *= 0.85;
      p.life -= 0.08;
      p.size *= 0.93;
    }
  }

  display() {
    push();

    // ── 번개 줄기 렌더링 ──
    for (let bolt of this.bolts) {
      // 외곽 글로우
      stroke(150, 200, 255, this.life * 80);
      strokeWeight(6 * this.life);
      noFill();
      beginShape();
      for (let pt of bolt) vertex(pt.x, pt.y);
      endShape();

      // 중간 레이어
      stroke(180, 230, 255, this.life * 150);
      strokeWeight(3 * this.life);
      beginShape();
      for (let pt of bolt) vertex(pt.x, pt.y);
      endShape();

      // 코어 (흰색)
      stroke(255, 255, 255, this.life * 220);
      strokeWeight(1.5 * this.life);
      beginShape();
      for (let pt of bolt) vertex(pt.x, pt.y);
      endShape();
    }

    // ── 임팩트 플래시 ──
    noStroke();
    fill(200, 230, 255, this.life * 120);
    ellipse(this.x, this.y, this.rad * 0.8, this.rad * 0.8);
    fill(255, 255, 255, this.life * 80);
    ellipse(this.x, this.y, this.rad * 0.3, this.rad * 0.3);

    // ── 임팩트 파티클 ──
    for (let p of this.impactParticles) {
      if (p.life <= 0) continue;
      let alpha = p.life * 220;
      noStroke();
      fill(180, 220, 255, alpha * 0.5);
      ellipse(p.x, p.y, p.size * 2, p.size * 2);
      fill(255, 255, 255, alpha);
      ellipse(p.x, p.y, p.size, p.size);
    }

    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// LaserChargeEffect — 레이저 차지 (발사 전 경고) 이펙트
// 사용: Senior Blaster 발사 직전
// ═══════════════════════════════════════════════════════════
class LaserChargeEffect extends BaseEffect {
  constructor(x, y, angle) {
    super(x, y);
    this.angle = angle;
    this.life = 1.0;
    this.particles = [];
    // 레이저 방향으로 수렴하는 파티클
    for (let i = 0; i < 15; i++) {
      let dist = random(50, 200);
      let spread = random(-0.4, 0.4);
      let a = angle + spread + PI; // 반대 방향에서 수렴
      this.particles.push({
        x: x + cos(a) * dist,
        y: y + sin(a) * dist,
        tx: x, ty: y,
        life: 1.0,
        size: random(3, 7)
      });
    }
  }

  update() {
    this.life -= 0.035;
    if (this.life <= 0) this.isDead = true;
    for (let p of this.particles) {
      p.x = lerp(p.x, p.tx, 0.1);
      p.y = lerp(p.y, p.ty, 0.1);
      p.life -= 0.035;
    }
  }

  display() {
    push();
    noStroke();
    for (let p of this.particles) {
      if (p.life <= 0) continue;
      let alpha = p.life * 200;
      fill(50, 150, 255, alpha * 0.4);
      ellipse(p.x, p.y, p.size * 2.5, p.size * 2.5);
      fill(150, 220, 255, alpha);
      ellipse(p.x, p.y, p.size, p.size);
    }
    // 차지 코어 글로우
    let glow = sin(frameCount * 0.3) * 0.3 + 0.7;
    fill(50, 150, 255, this.life * 80 * glow);
    ellipse(this.x, this.y, 40 * glow, 40 * glow);
    fill(200, 240, 255, this.life * 150 * glow);
    ellipse(this.x, this.y, 15 * glow, 15 * glow);
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// LaserBeamEffect — 레이저 발사 글로우 이펙트
// 사용: Senior Blaster 발사 시
// ═══════════════════════════════════════════════════════════
class LaserBeamEffect extends BaseEffect {
  constructor(x, y, angle, width, col = [50, 150, 255]) {
    super(x, y);
    this.angle = angle;
    this.beamWidth = width;
    this.col = col;
    this.life = 1.0;
    // 히트 스파크 파티클
    this.sparks = [];
    for (let i = 0; i < 20; i++) {
      let dist = random(50, 700);
      let spreadY = random(-width * 0.5, width * 0.5);
      let lx = x + cos(angle) * dist - sin(angle) * spreadY;
      let ly = y + sin(angle) * dist + cos(angle) * spreadY;
      let va = random(TWO_PI);
      this.sparks.push({
        x: lx, y: ly,
        vx: cos(va) * random(2, 5),
        vy: sin(va) * random(2, 5),
        size: random(3, 8),
        life: 1.0
      });
    }
  }

  update() {
    this.life -= 0.12;
    if (this.life <= 0) this.isDead = true;
    for (let s of this.sparks) {
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.82;
      s.vy *= 0.82;
      s.life -= 0.1;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);

    // ── 레이저 글로우 레이어 ──
    // 초광역 글로우
    stroke(this.col[0], this.col[1], this.col[2], this.life * 30);
    strokeWeight(this.beamWidth * 5);
    line(0, 0, 900, 0);
    // 외곽 글로우
    stroke(this.col[0], this.col[1], this.col[2], this.life * 80);
    strokeWeight(this.beamWidth * 2.5);
    line(0, 0, 900, 0);
    // 메인 빔
    stroke(this.col[0], this.col[1], this.col[2], this.life * 200);
    strokeWeight(this.beamWidth);
    line(0, 0, 900, 0);
    // 코어 (흰색)
    stroke(255, 255, 255, this.life * 180);
    strokeWeight(this.beamWidth * 0.3);
    line(0, 0, 900, 0);

    pop();

    // ── 스파크 파티클 ──
    push();
    noStroke();
    for (let s of this.sparks) {
      if (s.life <= 0) continue;
      let alpha = s.life * 220;
      fill(this.col[0], this.col[1], this.col[2], alpha * 0.5);
      ellipse(s.x, s.y, s.size * 2, s.size * 2);
      fill(200, 240, 255, alpha);
      ellipse(s.x, s.y, s.size, s.size);
    }
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// MeteorExplosionEffect — 메테오 낙하 폭발 이펙트
// 사용: Laptop 메테오 스킬
// ═══════════════════════════════════════════════════════════
class MeteorExplosionEffect extends BaseEffect {
  constructor(x, y, rad = 150) {
    super(x, y);
    this.rad = rad;
    this.life = 1.0;
    // 화염 파티클
    this.embers = [];
    for (let i = 0; i < 25; i++) {
      let a = random(TWO_PI);
      let spd = random(3, 9);
      this.embers.push({
        x: x, y: y,
        vx: cos(a) * spd, vy: sin(a) * spd - random(2, 5),
        size: random(4, 14),
        col: random() < 0.5 ? [50, 150, 255] : [100, 220, 255],
        life: random(0.6, 1.0)
      });
    }
    // 파편
    this.debris = [];
    for (let i = 0; i < 12; i++) {
      let a = random(TWO_PI);
      let spd = random(5, 12);
      this.debris.push({
        x: x, y: y,
        vx: cos(a) * spd, vy: sin(a) * spd - random(3, 7),
        size: random(3, 7),
        rot: random(TWO_PI),
        rotSpeed: random(-0.2, 0.2),
        life: 1.0
      });
    }
  }

  update() {
    this.life -= 0.06;
    if (this.life <= 0) this.isDead = true;
    for (let e of this.embers) {
      e.x += e.vx; e.y += e.vy;
      e.vy += 0.15;
      e.vx *= 0.9; e.vy *= 0.9;
      e.life -= 0.06;
      e.size *= 0.95;
    }
    for (let d of this.debris) {
      d.x += d.vx; d.y += d.vy;
      d.vy += 0.3;
      d.vx *= 0.88;
      d.rot += d.rotSpeed;
      d.life -= 0.05;
    }
  }

  display() {
    push();
    noStroke();

    // ── 폭발 코어 ──
    let coreScale = 1.0 + (1.0 - this.life) * 0.5;
    fill(100, 200, 255, this.life * 100);
    ellipse(this.x, this.y, this.rad * coreScale * 0.8, this.rad * coreScale * 0.8);
    fill(50, 150, 255, this.life * 150);
    ellipse(this.x, this.y, this.rad * coreScale * 0.5, this.rad * coreScale * 0.5);
    fill(255, 255, 255, this.life * 200);
    ellipse(this.x, this.y, this.rad * coreScale * 0.2, this.rad * coreScale * 0.2);

    // ── 불 파티클 ──
    for (let e of this.embers) {
      if (e.life <= 0) continue;
      let alpha = e.life * 220;
      fill(e.col[0], e.col[1], e.col[2], alpha * 0.5);
      ellipse(e.x, e.y, e.size * 2.5, e.size * 2.5);
      fill(e.col[0], e.col[1], e.col[2], alpha);
      ellipse(e.x, e.y, e.size, e.size);
      fill(200, 240, 255, alpha * 0.6);
      ellipse(e.x, e.y, e.size * 0.4, e.size * 0.4);
    }

    // ── 파편 ──
    for (let d of this.debris) {
      if (d.life <= 0) continue;
      let alpha = d.life * 200;
      fill(100, 80, 60, alpha);
      push();
      translate(d.x, d.y);
      rotate(d.rot);
      rect(-d.size / 2, -d.size / 2, d.size, d.size, 2);
      pop();
    }

    pop(); // ← 반드시 필요: push()와 짝을 맞춰야 카메라 transform이 HUD로 누출되지 않음
  }
}

// ═══════════════════════════════════════════════════════════
// LaptopFallEffect — 노트북 낙하 및 충돌 폭발 이펙트
// 사용: Laptop 스킬 발동 시
// ═══════════════════════════════════════════════════════════
class LaptopFallEffect extends BaseEffect {
  constructor(targetX, targetY, rad = 150, dmg = 0) {
    super(targetX, targetY);
    this.targetX = targetX;
    this.targetY = targetY;
    this.rad = rad;
    this.dmg = dmg;

    // 낙하 애니메이션 설정 (더 빠른 속도로 깔아뭉개듯 20프레임 동안 낙하)
    this.duration = 20;
    this.elapsed = 0;

    // 시작 위치 (대각선 하늘 위)
    this.startX = targetX - 150;
    this.startY = targetY - 500;

    this.x = this.startX;
    this.y = this.startY;

    this.rot = random(TWO_PI);
    this.rotSpeed = random(0.12, 0.28);
  }

  update() {
    this.elapsed++;
    if (this.elapsed >= this.duration) {
      this.isDead = true;
      this.explode();
      return;
    }

    let t = this.elapsed / this.duration;

    // t에 ease-in 효과를 3제곱하여 낙하 속도를 대폭 가속화 (중력감 증폭)
    let tEase = t * t * t;
    this.x = lerp(this.startX, this.targetX, tEase);
    this.y = lerp(this.startY, this.targetY, tEase);

    this.rot += this.rotSpeed;

    // 낙하 중 은은한 불꽃/연기 잔상 효과 추가
    if (frameCount % 2 === 0) {
      spawnEffect(new TrailDotEffect(this.x, this.y, [50, 150, 255]));
    }
  }

  explode() {
    // 1. 폭발 데미지 적용
    if (this.dmg > 0 && typeof enemies !== 'undefined') {
      for (let e of enemies) {
        if (dist(this.targetX, this.targetY, e.x, e.y) < this.rad) {
          e.takeDamage(this.dmg, this.targetX, this.targetY, 2.0);
        }
      }
    }

    // 2. 폭발 이펙트 스폰 (3중 화염 구체 + 파편)
    spawnEffect(new MeteorExplosionEffect(this.targetX, this.targetY, this.rad));

    // 3. 원형 충격파 스폰
    spawnEffect(new ShockwaveEffect(this.targetX, this.targetY, [50, 200, 255], this.rad));

    // 4. 부서진 노트북 잔해 이펙트 스폰
    spawnEffect(new LaptopDebrisEffect(this.targetX, this.targetY));

    // 5. 범위 표시용 투사체 스폰 (기존의 projectiles.push 구조 유지)
    if (typeof projectiles !== 'undefined' && typeof projPool !== 'undefined') {
      projectiles.push(
        projPool.get(this.targetX, this.targetY, 0, 0, 0, true, this.rad * 2, 20, [100, 200, 255, 45], false)
      );
    }
  }

  display() {
    push();

    // ── 1. 대형 그림자 그리기 ──
    let t = this.elapsed / this.duration;
    // 낙하할수록 그림자가 더 짙어지며 중앙으로 수렴
    let shadowScale = lerp(2.5, 1.2, t);
    let shadowAlpha = lerp(15, 160, t);
    noStroke();
    fill(0, 0, 0, shadowAlpha);
    ellipse(this.targetX, this.targetY, 110 * shadowScale, 40 * shadowScale);

    // ── 2. 떨어지는 대형 노트북 그리기 ──
    translate(this.x, this.y);
    rotate(this.rot);
    imageMode(CENTER);
    if (typeof gameImages !== 'undefined' && gameImages.laptop) {
      // 깔아뭉개는 연출을 위해 노트북 스케일을 대폭 확장 (60px -> 135px)
      image(gameImages.laptop, 0, 0, 135, 135);
    } else {
      fill(100, 100, 100);
      rect(-55, -45, 110, 90, 8);
      fill(200);
      rect(-45, -35, 90, 70, 4);
    }

    pop();
    imageMode(CORNER); // imageMode(CENTER) 누출 차단
  }
}

// ═══════════════════════════════════════════════════════════
// LaptopDebrisEffect — 부서진 노트북 잔해 이펙트 (지면에 남았다가 사라짐)
// 사용: LaptopFallEffect 충돌 폭발 시 스폰
// ═══════════════════════════════════════════════════════════
class LaptopDebrisEffect extends BaseEffect {
  constructor(x, y) {
    super(x, y);
    // 잔해 유지 시간을 120프레임에서 60프레임(약 1초)으로 축소하여 빠르게 사라지도록 수정
    this.duration = 60;
    this.elapsed = 0;

    // 잔해 조각 정보 설정
    this.pieces = [];

    // 잔해 1: laptop_destroy_01.png
    this.pieces.push({
      imgKey: 'laptop_destroy_01',
      ox: 0, oy: 0,
      vx: random(-5, 5),
      vy: random(-7, -3),
      rot: random(TWO_PI),
      rotSpd: random(-0.15, 0.15),
      size: random(50, 65)
    });

    // 잔해 2: laptop_destroy_02.png
    this.pieces.push({
      imgKey: 'laptop_destroy_02',
      ox: 0, oy: 0,
      vx: random(-5, 5),
      vy: random(-7, -3),
      rot: random(TWO_PI),
      rotSpd: random(-0.15, 0.15),
      size: random(40, 55)
    });

    // 잔해 3: 추가적인 파편 조각 (작은 칩이나 나사 느낌으로 랜덤 배치)
    let extraCount = floor(random(2, 4));
    for (let i = 0; i < extraCount; i++) {
      this.pieces.push({
        imgKey: random() < 0.5 ? 'laptop_destroy_01' : 'laptop_destroy_02',
        ox: 0, oy: 0,
        vx: random(-8, 8),
        vy: random(-9, -4),
        rot: random(TWO_PI),
        rotSpd: random(-0.25, 0.25),
        size: random(15, 30)
      });
    }
  }

  update() {
    this.elapsed++;
    if (this.elapsed >= this.duration) {
      this.isDead = true;
      return;
    }

    // 각 조각들의 물리 업데이트 (사방으로 튀었다가 바닥에 가라앉음)
    for (let p of this.pieces) {
      p.ox += p.vx;
      p.oy += p.vy;

      // 마찰력/감쇠
      p.vx *= 0.85;
      p.vy *= 0.85;

      // 회전 속도 감쇠
      p.rot += p.rotSpd;
      p.rotSpd *= 0.85;
    }
  }

  display() {
    push();

    // 35프레임 이후부터 페이드 아웃 시작
    let alpha = 255;
    if (this.elapsed > 35) {
      alpha = map(this.elapsed, 35, this.duration, 255, 0);
    }

    tint(255, 255, 255, alpha);
    imageMode(CENTER);

    for (let p of this.pieces) {
      let img = gameImages[p.imgKey];
      if (img) {
        push();
        translate(this.x + p.ox, this.y + p.oy);
        rotate(p.rot);
        image(img, 0, 0, p.size, p.size);
        pop();
      }
    }

    noTint();
    pop();
    // imageMode 기본값 복원 (CORNER가 p5.js 기본값)
    imageMode(CORNER);
  }
}

// ═══════════════════════════════════════════════════════════
// EnemyVanishEffect — 적 소멸 이펙트 (Professor 사용 시)
// ═══════════════════════════════════════════════════════════
class EnemyVanishEffect extends BaseEffect {
  constructor(x, y) {
    super(x, y);
    this.life = 1.0;
    this.particles = [];
    for (let i = 0; i < 8; i++) {
      let a = random(TWO_PI);
      this.particles.push({
        x: x, y: y,
        vx: cos(a) * random(2, 5),
        vy: sin(a) * random(2, 5),
        size: random(4, 10),
        life: 1.0
      });
    }
  }
  update() {
    this.life -= 0.1;
    if (this.life <= 0) this.isDead = true;
    for (let p of this.particles) {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.88; p.vy *= 0.88;
      p.life -= 0.08;
      p.size *= 0.9;
    }
  }
  display() {
    push();
    noStroke();
    for (let p of this.particles) {
      if (p.life <= 0) continue;
      let alpha = p.life * 220;
      fill(255, 255, 100, alpha * 0.4);
      ellipse(p.x, p.y, p.size * 2.2, p.size * 2.2);
      fill(255, 255, 200, alpha);
      ellipse(p.x, p.y, p.size, p.size);
    }
    // 소멸 링
    noFill();
    stroke(255, 255, 150, this.life * 150);
    strokeWeight(2 * this.life);
    ellipse(this.x, this.y, 30 * (2.0 - this.life), 30 * (2.0 - this.life));
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// ScreenFlashEffect — 화면 전체 플래시 (Professor 전멸기)
// isScreenEffect = true → updateAndDrawScreenEffects()에서 처리
// ═══════════════════════════════════════════════════════════
class ScreenFlashEffect extends BaseEffect {
  constructor(col = [255, 255, 255], duration = 20) {
    super(0, 0);
    this.col = col;
    this.life = 1.0;
    this.speed = 1.0 / duration;
    this.isScreenEffect = true;
  }
  update() {
    this.life -= this.speed;
    if (this.life <= 0) this.isDead = true;
  }
  display() {
    // 월드 좌표계에서는 그리지 않음
  }
  displayScreen() {
    push();
    // 화면 좌표 기준으로 그림 (pop/push 없이 직접)
    fill(this.col[0], this.col[1], this.col[2], this.life * 180);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, width, height);
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// ProfessorAppearEffect — 교수님 등장 & 페이드아웃 이펙트
// 휴강선언 스킬 발동 시 화면 중앙에 교수님 이미지가 반투명하게
// 떴다가 서서히 사라지는 화면 효과 (isScreenEffect = true)
// ═══════════════════════════════════════════════════════════
class ProfessorAppearEffect extends BaseEffect {
  constructor() {
    super(0, 0);
    this.isScreenEffect = true;
    // 총 45프레임: 처음 15프레임 fade-in → 이후 30프레임 fade-out
    this.totalFrames = 45;
    this.elapsed = 0;
    this.alpha = 0;
  }

  update() {
    this.elapsed++;
    if (this.elapsed >= this.totalFrames) {
      this.isDead = true;
      return;
    }
    // 처음 15프레임: fade-in (0 → 200)
    // 이후 30프레임: fade-out (200 → 0)
    if (this.elapsed <= 15) {
      this.alpha = map(this.elapsed, 0, 15, 0, 200);
    } else {
      this.alpha = map(this.elapsed, 15, this.totalFrames, 200, 0);
    }
  }

  display() {
    // 월드 좌표계에서는 그리지 않음
  }

  displayScreen() {
    if (!gameImages.professor || this.alpha <= 0) return;
    push();
    // 교수님 이미지 크기: 화면 높이의 60% 정도로 크게
    let imgH = height * 0.6;
    let imgW = imgH * (gameImages.professor.width / gameImages.professor.height);
    let cx = width / 2;
    let cy = height / 2;

    imageMode(CENTER);
    tint(255, 255, 255, this.alpha);
    image(gameImages.professor, cx, cy, imgW, imgH);
    noTint();
    imageMode(CORNER);
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// WifiSkillEffect — 와이파이 신호 1→2→3→4 단계 점등 이펙트
// 사용: WiFi 스킬 발동 시
// ═══════════════════════════════════════════════════════════
class WifiSkillEffect extends BaseEffect {
  constructor(x, y, rad = 100) {
    super(x, y);
    this.rad = rad;
    this.elapsed = 0;
    this.phaseLen = 10;     // 각 단계 지속 프레임 (1→2→3→4)
    this.totalPhases = 4;
    this.life = 1.0;
  }

  update() {
    this.elapsed++;
    // 4단계 모두 완료 후 페이드아웃
    if (this.elapsed >= this.phaseLen * this.totalPhases) {
      this.life -= 0.07;
    }
    if (this.life <= 0) this.isDead = true;
  }

  display() {
    push();

    // 현재 활성 링 수 (1~4)
    let activeCount = min(floor(this.elapsed / this.phaseLen) + 1, this.totalPhases);
    let fade = this.life;

    // ── 고정 외곽 원 ──
    noFill();
    stroke(100, 220, 255, 90 * fade);
    strokeWeight(1.5);
    ellipse(this.x, this.y, this.rad * 2, this.rad * 2);
    // 외곽 글로우
    stroke(80, 200, 255, 18 * fade);
    strokeWeight(10);
    ellipse(this.x, this.y, this.rad * 2, this.rad * 2);

    // ── 와이파이 신호 링 4단계 ──
    for (let i = 0; i < this.totalPhases; i++) {
      // 링 반지름: 안쪽부터 바깥쪽으로 균등 배치
      let ringRad = ((i + 1) / this.totalPhases) * (this.rad * 0.82);
      let isActive = i < activeCount;

      // 가장 최근에 켜진 링에 펄스 효과
      let isNewest = (i === activeCount - 1);
      let pulse = isNewest ? (sin(this.elapsed * 0.5) * 0.25 + 0.75) : 1.0;

      let baseAlpha = isActive ? 200 : 28;
      let ringAlpha = baseAlpha * pulse * fade;
      let ringW = isActive ? 2.5 : 1.0;

      // 활성 링 외곽 글로우
      if (isActive) {
        stroke(120, 220, 255, 55 * pulse * fade);
        strokeWeight(8);
        noFill();
        ellipse(this.x, this.y, ringRad * 2, ringRad * 2);
      }

      // 링 본체
      stroke(80, 200, 255, ringAlpha);
      strokeWeight(ringW);
      noFill();
      ellipse(this.x, this.y, ringRad * 2, ringRad * 2);
    }

    // ── 중심 점 ──
    noStroke();
    fill(120, 220, 255, 240 * fade);
    ellipse(this.x, this.y, 11, 11);
    fill(255, 255, 255, 210 * fade);
    ellipse(this.x, this.y, 5, 5);

    pop();
  }
}


// ═══════════════════════════════════════════════════════════
// SeniorPunchImpactEffect — 선배 레이저 끝 주먹 임팩트 (벽력일섬)
// 사용: SeniorSummonSkill 레이저 발사 시 끝 지점에서 소환
// ═══════════════════════════════════════════════════════════
class SeniorPunchImpactEffect extends BaseEffect {
  constructor(x, y, angle) {
    super(x, y);
    this.angle = angle; // 레이저가 날아온 방향
    this.life = 1.0;

    // ── 방사형 속도선 (주먹 충격의 방향감) ──
    this.streaks = [];
    for (let i = 0; i < 18; i++) {
      let a = this.angle + random(-0.55, 0.55); // 레이저 방향 기준 좁은 부채꼴
      let spd = random(6, 18);
      this.streaks.push({
        x: x, y: y,
        vx: cos(a) * spd,
        vy: sin(a) * spd,
        len: random(20, 55),
        life: 1.0,
        w: random(1.5, 4.0)
      });
    }

    // ── 사방 파편 파티클 ──
    this.sparks = [];
    for (let i = 0; i < 24; i++) {
      let a = random(TWO_PI);
      let spd = random(3, 10);
      this.sparks.push({
        x: x, y: y,
        vx: cos(a) * spd,
        vy: sin(a) * spd,
        size: random(3, 9),
        life: random(0.6, 1.0)
      });
    }

    // ── 충격파 링 ──
    this.rings = [
      { r: 0, maxR: 90, life: 1.0 },
      { r: 0, maxR: 140, life: 0.8 },
    ];

    // ── 임팩트 플래시 (순간 폭발 백색) ──
    this.flashLife = 1.0;
  }

  update() {
    this.life -= 0.055;
    if (this.life <= 0) this.isDead = true;

    this.flashLife -= 0.18;

    for (let s of this.streaks) {
      s.x += s.vx; s.y += s.vy;
      s.vx *= 0.78; s.vy *= 0.78;
      s.life -= 0.07;
    }
    for (let p of this.sparks) {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.84; p.vy *= 0.84;
      p.life -= 0.055;
      p.size *= 0.92;
    }
    for (let r of this.rings) {
      r.r += (r.maxR - r.r) * 0.22;
      r.life -= 0.08;
    }
  }

  display() {
    push();

    // ── 1. 임팩트 플래시 (순간 폭발) ──
    if (this.flashLife > 0) {
      let fl = max(0, this.flashLife);
      noStroke();
      fill(255, 255, 255, fl * 220);
      ellipse(this.x, this.y, 120 * fl, 120 * fl);
      fill(100, 200, 255, fl * 180);
      ellipse(this.x, this.y, 70 * fl, 70 * fl);
    }

    // ── 2. 충격파 링 ──
    noFill();
    for (let r of this.rings) {
      if (r.life <= 0) continue;
      stroke(50, 150, 255, r.life * 200);
      strokeWeight(3.5 * r.life);
      ellipse(this.x, this.y, r.r * 2, r.r * 2);
      stroke(150, 220, 255, r.life * 100);
      strokeWeight(7 * r.life);
      ellipse(this.x, this.y, r.r * 2, r.r * 2);
    }

    // ── 3. 방향성 속도선 (벽력일섬 느낌의 방향 획) ──
    for (let s of this.streaks) {
      if (s.life <= 0) continue;
      let alpha = s.life * 230;
      let nx = -s.vx / (sqrt(s.vx * s.vx + s.vy * s.vy) + 0.001);
      let ny = -s.vy / (sqrt(s.vx * s.vx + s.vy * s.vy) + 0.001);
      // 외곽 글로우
      stroke(50, 150, 255, alpha * 0.35);
      strokeWeight(s.w * 3.5);
      line(s.x, s.y, s.x + nx * s.len, s.y + ny * s.len);
      // 코어
      stroke(200, 240, 255, alpha);
      strokeWeight(s.w);
      line(s.x, s.y, s.x + nx * s.len * 0.7, s.y + ny * s.len * 0.7);
    }

    // ── 4. 파편 파티클 ──
    noStroke();
    for (let p of this.sparks) {
      if (p.life <= 0) continue;
      let alpha = p.life * 220;
      fill(50, 150, 255, alpha * 0.45);
      ellipse(p.x, p.y, p.size * 2.5, p.size * 2.5);
      fill(150, 220, 255, alpha);
      ellipse(p.x, p.y, p.size, p.size);
      fill(220, 245, 255, alpha * 0.7);
      ellipse(p.x, p.y, p.size * 0.4, p.size * 0.4);
    }

    // ── 5. 중심 잔광 코어 ──
    noStroke();
    fill(100, 180, 255, this.life * 160);
    ellipse(this.x, this.y, 30 * this.life, 30 * this.life);
    fill(255, 255, 255, this.life * 200);
    ellipse(this.x, this.y, 12 * this.life, 12 * this.life);

    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// DataLinkEffect — USB 포트와 히트된 적을 연결하는 네온 사이버 데이터 광선
// 사용: USB 장판 도트 데미지 타격 시 스폰
// ═══════════════════════════════════════════════════════════
class DataLinkEffect extends BaseEffect {
  constructor(x1, y1, x2, y2) {
    super(x1, y1);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.life = 1.0;
  }

  update() {
    this.life -= 0.18; // 빠르게 페이드아웃 (약 5-6프레임)
    if (this.life <= 0) this.isDead = true;
  }

  display() {
    push();
    // 외곽 네온 사이언 글로우 라인
    stroke(0, 255, 255, this.life * 140);
    strokeWeight(2.0 * this.life);
    line(this.x1, this.y1, this.x2, this.y2);

    // 코어 백색 라인
    stroke(255, 255, 255, this.life * 220);
    strokeWeight(0.7 * this.life);
    line(this.x1, this.y1, this.x2, this.y2);
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// UsbVortexShowcaseEffect — 에셋 뷰어 프리뷰용 자립형 데모 볼텍스 이펙트
// ═══════════════════════════════════════════════════════════
class UsbVortexShowcaseEffect extends BaseEffect {
  constructor(x, y) {
    super(x, y);
    this.rad = 90;
    this.life = 1.0;

    // 휘몰아칠 파일 확장자 및 폴더 생성
    let fileTypes = ['.js', '.json', '.html', '.css', '.py', '.cpp', '.png', '.jpg', '1', '0', '1', '0'];
    this.files = [];
    for (let j = 0; j < 16; j++) {
      this.files.push({
        angle: random(TWO_PI),
        radius: random(15, this.rad),
        speed: random(0.015, 0.04) * (random() < 0.5 ? 1 : -1),
        size: random(10, 16),
        type: random(fileTypes),
        isFolder: random() < 0.45,
        floatOffset: random(TWO_PI)
      });
    }
    this.connectAnim = 0;
  }

  update() {
    if (this.connectAnim < 15) {
      this.connectAnim++;
      if (this.connectAnim === 15) {
        spawnEffect(new ShockwaveEffect(this.x, this.y, [0, 255, 255], this.rad * 0.45));
        for (let k = 0; k < 8; k++) {
          spawnEffect(new SparkEffect(this.x, this.y, [0, 255, 255]));
        }
      }
    }
    for (let f of this.files) {
      f.angle += f.speed;
    }
    this.life -= 0.003; // 수명 약 300프레임 (5초)
    if (this.life <= 0) this.isDead = true;
  }

  display() {
    let lifeRatio = this.life;
    let rad = this.rad;
    let expandRatio = this.connectAnim < 15 ? lerp(0.1, 1.0, this.connectAnim / 15.0) : 1.0;

    push();

    // ── 0. 명확한 스킬 범위 경계선 렌더링 ──
    noStroke();
    fill(0, 140, 255, 10 * lifeRatio);
    ellipse(this.x, this.y, rad * 2, rad * 2);
    noFill();
    stroke(0, 255, 255, 110 * lifeRatio);
    strokeWeight(1.5);
    ellipse(this.x, this.y, rad * 2, rad * 2);

    // 1. 공전 궤도 트랙
    noFill();
    strokeWeight(1.0);
    stroke(0, 150, 255, 12 * lifeRatio);
    ellipse(this.x, this.y, rad * 0.8 * expandRatio, rad * 0.8 * expandRatio);
    stroke(0, 150, 255, 22 * lifeRatio);
    ellipse(this.x, this.y, rad * 1.4 * expandRatio, rad * 1.4 * expandRatio);

    // 2. 바닥 네온 USB 포트 소켓 (크기 확장 가로 60, 세로 28)
    rectMode(CENTER);
    fill(10, 20, 35, 160 * lifeRatio);
    stroke(0, 255, 255, 90 * lifeRatio);
    strokeWeight(1.5);
    rect(this.x, this.y, 60, 28, 5);
    fill(0, 120, 255, 25 * lifeRatio);
    rect(this.x, this.y, 42, 10, 2);

    // 3. USB 꽂힘 (크기 확장 50px 및 삽입 애니메이션)
    let insertY = 0;
    let insertAngle = 0;
    if (this.connectAnim < 15) {
      let t = this.connectAnim / 15.0;
      insertY = lerp(-50, -2, t);
      insertAngle = lerp(-0.4, 0, t);
    } else {
      insertY = -2;
      insertAngle = 0;
    }

    push();
    translate(this.x, this.y + insertY);
    rotate(insertAngle);

    if (gameImages.usb) {
      imageMode(CENTER);
      let pulse = sin(frameCount * 0.08) * 2.0;
      let usbSize = 70 + pulse;
      tint(200, 240, 255, 220 * lifeRatio);
      image(gameImages.usb, 0, 0, usbSize, usbSize);
    } else {
      fill(0, 200, 255, 150 * lifeRatio);
      rectMode(CENTER);
      rect(0, 0, 24, 30, 3);
    }
    pop();

    // 4. 탄생 시 사이버 네트워크 플래시
    if (this.connectAnim < 15) {
      let animRatio = this.connectAnim / 15.0;
      noFill();
      stroke(0, 255, 255, (1.0 - animRatio) * 200);
      strokeWeight(2.5 * (1.0 - animRatio) + 0.5);
      ellipse(this.x, this.y, rad * 2 * animRatio, rad * 2 * animRatio);
    }

    // 5. 파일 및 폴더 렌더링
    for (let f of this.files) {
      let currentRad = f.radius * expandRatio;
      let fx = this.x + cos(f.angle) * currentRad;
      let fy = this.y + sin(f.angle) * currentRad;
      fy += sin(frameCount * 0.06 + f.floatOffset) * 2;

      if (f.isFolder) {
        fill(0, 120, 255, 20 * lifeRatio);
        stroke(80, 200, 255, 100 * lifeRatio);
        strokeWeight(1.0);
        rectMode(CORNER);
        rect(fx - f.size * 0.4, fy - f.size * 0.45, f.size * 0.35, 3, 1);
        rect(fx - f.size * 0.5, fy - f.size * 0.3, f.size, f.size * 0.65, 1.5);
        noStroke();
        fill(255, 255, 255, 80 * lifeRatio);
        rect(fx - f.size * 0.2, fy - f.size * 0.4, f.size * 0.25, f.size * 0.25);
      } else {
        push();
        textFont('Courier New');
        textSize(9);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        fill(0, 0, 0, 150 * lifeRatio);
        text(f.type, fx + 1, fy + 1);
        fill(120, 240, 255, 200 * lifeRatio);
        text(f.type, fx, fy);
        pop();
      }
    }

    // 모의 데미지 빔/스파크 생성
    if (this.connectAnim >= 15 && frameCount % 20 === 0) {
      let angle = random(TWO_PI);
      let dist = random(30, rad * 0.9);
      let tx = this.x + cos(angle) * dist;
      let ty = this.y + sin(angle) * dist;
      spawnEffect(new SparkEffect(tx, ty, [80, 200, 255]));
      spawnEffect(new DataLinkEffect(this.x, this.y, tx, ty));
    }

    pop();

    // 전역 그리기 상태 리셋 (UI 흔들림 방지)
    // p5.js 기본값으로 복원: rectMode = CORNER (CENTER 아님!)
    rectMode(CORNER);
    imageMode(CORNER);
    textAlign(LEFT, BASELINE);
    textStyle(NORMAL);
    noTint();
  }
}

