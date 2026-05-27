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
      fill(255, 80, 80, alpha * 0.4);
      ellipse(p.x, p.y, p.size * 2.5, p.size * 2.5);
      fill(255, 150, 150, alpha);
      ellipse(p.x, p.y, p.size, p.size);
    }
    // 차지 코어 글로우
    let glow = sin(frameCount * 0.3) * 0.3 + 0.7;
    fill(255, 80, 80, this.life * 80 * glow);
    ellipse(this.x, this.y, 40 * glow, 40 * glow);
    fill(255, 200, 200, this.life * 150 * glow);
    ellipse(this.x, this.y, 15 * glow, 15 * glow);
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// LaserBeamEffect — 레이저 발사 글로우 이펙트
// 사용: Senior Blaster 발사 시
// ═══════════════════════════════════════════════════════════
class LaserBeamEffect extends BaseEffect {
  constructor(x, y, angle, width, col = [255, 50, 50]) {
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
      fill(255, 200, 200, alpha);
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
        col: random() < 0.5 ? [255, 120, 30] : [255, 200, 50],
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
    fill(255, 255, 200, this.life * 100);
    ellipse(this.x, this.y, this.rad * coreScale * 0.8, this.rad * coreScale * 0.8);
    fill(255, 180, 50, this.life * 150);
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
      fill(255, 255, 200, alpha * 0.6);
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

    pop();
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
