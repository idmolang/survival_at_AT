// ─────────────────────────────────────────────
// Base Effect — 모든 이펙트의 공통 부모 클래스
// ─────────────────────────────────────────────
class BaseEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isDead = false;
  }
  update() { }
  display() { }
}
