// ═══════════════════════════════════════════════════════════
// ShockwaveEffect — 원형 충격파 링이 퍼져나가는 이펙트
// 사용: USB 장판 생성, Cramming 낙뢰, Laptop 메테오, WiFi 펄스
// ═══════════════════════════════════════════════════════════
class ShockwaveEffect extends BaseEffect {
  constructor(x, y, col = [255, 255, 255], maxRadius = 80) {
    super(x, y);
    this.col = col;
    this.maxRadius = maxRadius;
    this.radius = maxRadius * 0.1;
    this.life = 1.0;
    this.speed = 0.08; // life 감소 속도
  }
  update() {
    this.life -= this.speed;
    this.radius = this.maxRadius * (1.0 - this.life * 0.3);
    if (this.life <= 0) this.isDead = true;
  }
  display() {
    push();
    let alpha = this.life * 200;
    let thickness = this.life * 4 + 1;
    noFill();
    // 외곽 글로우
    stroke(this.col[0], this.col[1], this.col[2], alpha * 0.4);
    strokeWeight(thickness * 3);
    ellipse(this.x, this.y, this.radius * 2 + 8, this.radius * 2 + 8);
    // 메인 링
    stroke(this.col[0], this.col[1], this.col[2], alpha);
    strokeWeight(thickness);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// MuzzleFlashEffect — 총구 불꽃 이펙트 (발사 방향으로 퍼짐)
// 사용: P5jsIcon 발사, Mouse 발사
// ═══════════════════════════════════════════════════════════
class MuzzleFlashEffect extends BaseEffect {
  constructor(x, y, angle, col = [255, 180, 80]) {
    super(x, y);
    this.angle = angle;
    this.col = col;
    this.life = 1.0;
    this.particles = [];
    // 파티클 생성
    for (let i = 0; i < 6; i++) {
      let spread = random(-0.5, 0.5);
      let spd = random(3, 8);
      this.particles.push({
        x: x, y: y,
        vx: cos(angle + spread) * spd + random(-1, 1),
        vy: sin(angle + spread) * spd + random(-1, 1),
        size: random(4, 10),
        life: 1.0
      });
    }
  }
  update() {
    this.life -= 0.15;
    if (this.life <= 0) this.isDead = true;
    for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.85;
      p.vy *= 0.85;
      p.size *= 0.88;
      p.life -= 0.15;
    }
  }
  display() {
    push();
    noStroke();
    for (let p of this.particles) {
      if (p.life <= 0) continue;
      let alpha = p.life * 220;
      // 글로우
      fill(this.col[0], this.col[1], this.col[2], alpha * 0.4);
      ellipse(p.x, p.y, p.size * 2.5, p.size * 2.5);
      // 코어
      fill(this.col[0], this.col[1], this.col[2], alpha);
      ellipse(p.x, p.y, p.size, p.size);
      // 흰 코어
      fill(255, 255, 255, alpha * 0.6);
      ellipse(p.x, p.y, p.size * 0.4, p.size * 0.4);
    }
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// TrailDotEffect — 잔상 점 이펙트 (오브 등 궤적에 사용)
// 사용: Unibook 오브 트레일
// ═══════════════════════════════════════════════════════════
class TrailDotEffect extends BaseEffect {
  constructor(x, y, col = [255, 255, 255]) {
    super(x, y);
    this.col = col;
    this.life = 1.0;
    this.size = random(4, 10);
  }
  update() {
    this.life -= 0.12;
    this.size *= 0.92;
    if (this.life <= 0) this.isDead = true;
  }
  display() {
    push();
    noStroke();
    let alpha = this.life * 180;
    fill(this.col[0], this.col[1], this.col[2], alpha * 0.5);
    ellipse(this.x, this.y, this.size * 2.2, this.size * 2.2);
    fill(this.col[0], this.col[1], this.col[2], alpha);
    ellipse(this.x, this.y, this.size, this.size);
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// OrbHitEffect — 오브가 적을 히트할 때 빛 번짐
// 사용: Unibook 히트
// ═══════════════════════════════════════════════════════════
class OrbHitEffect extends BaseEffect {
  constructor(x, y) {
    super(x, y);
    this.life = 1.0;
    this.rays = [];
    // 방사형 광선 생성
    let rayCount = floor(random(5, 8));
    for (let i = 0; i < rayCount; i++) {
      this.rays.push({
        angle: random(TWO_PI),
        len: random(15, 35),
        width: random(1.5, 3)
      });
    }
  }
  update() {
    this.life -= 0.1;
    if (this.life <= 0) this.isDead = true;
  }
  display() {
    push();
    translate(this.x, this.y);
    let alpha = this.life * 255;
    let scale = 1.0 + (1.0 - this.life) * 0.5;
    // 중심 섬광
    noStroke();
    fill(255, 240, 120, alpha * 0.5);
    ellipse(0, 0, 30 * scale, 30 * scale);
    fill(255, 255, 200, alpha);
    ellipse(0, 0, 14 * scale, 14 * scale);
    // 광선
    for (let r of this.rays) {
      stroke(255, 240, 120, alpha * 0.8);
      strokeWeight(r.width * this.life);
      line(0, 0, cos(r.angle) * r.len * scale, sin(r.angle) * r.len * scale);
    }
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// SparkEffect — 히트 스파크 (전기/충격 느낌)
// 사용: USB 히트, WiFi 히트
// ═══════════════════════════════════════════════════════════
class SparkEffect extends BaseEffect {
  constructor(x, y, col = [255, 255, 100]) {
    super(x, y);
    this.col = col;
    this.life = 1.0;
    this.sparks = [];
    let count = floor(random(4, 8));
    for (let i = 0; i < count; i++) {
      let a = random(TWO_PI);
      let spd = random(2, 6);
      this.sparks.push({
        x: x, y: y,
        vx: cos(a) * spd, vy: sin(a) * spd,
        len: random(6, 16),
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
      s.vx *= 0.8;
      s.vy *= 0.8;
      s.life -= 0.12;
    }
  }
  display() {
    push();
    for (let s of this.sparks) {
      if (s.life <= 0) continue;
      let alpha = s.life * 255;
      // 스파크 선
      stroke(this.col[0], this.col[1], this.col[2], alpha);
      strokeWeight(2 * s.life);
      line(s.x, s.y, s.x - s.vx * s.len * 0.5, s.y - s.vy * s.len * 0.5);
      // 스파크 끝 점
      noStroke();
      fill(255, 255, 255, alpha * 0.8);
      ellipse(s.x, s.y, 3 * s.life, 3 * s.life);
    }
    pop();
  }
}

// ═══════════════════════════════════════════════════════════
// BubbleEffect — 상승하는 버블 파티클
// 사용: USB 장판 내부
// ═══════════════════════════════════════════════════════════
class BubbleEffect extends BaseEffect {
  constructor(x, y, col = [100, 150, 255]) {
    super(x, y);
    this.col = col;
    this.life = 1.0;
    this.vy = random(-1.5, -0.5);
    this.vx = random(-0.5, 0.5);
    this.size = random(3, 8);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.04;
    this.size *= 0.98;
    if (this.life <= 0) this.isDead = true;
  }
  display() {
    push();
    let alpha = this.life * 180;
    noFill();
    stroke(this.col[0], this.col[1], this.col[2], alpha);
    strokeWeight(1.5);
    ellipse(this.x, this.y, this.size, this.size);
    // 버블 하이라이트
    noStroke();
    fill(255, 255, 255, alpha * 0.5);
    ellipse(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.25, this.size * 0.25);
    pop();
  }
}
