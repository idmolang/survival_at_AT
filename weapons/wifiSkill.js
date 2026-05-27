class WifiSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 2, area: 1.0, cd: 30, desc: "주변의 적에게 피해를 줍니다." },
    { dmg: 3, area: 1.2, cd: 30, desc: "크기 및 데미지 증가" },
    { dmg: 3, area: 1.4, cd: 20, desc: "피해 주기 감소, 크기 증가" },
    { dmg: 4, area: 1.6, cd: 20, desc: "데미지 및 크기 증가" },
    { dmg: 5, area: 1.6, cd: 15, desc: "데미지 증가, 피해 주기 감소" }
  ];
  static EVO_DATA = { dmg: 10, area: 2.0, cd: 10, desc: "타격 시 확률적으로 체력을 회복합니다." };

  constructor(owner) {
    super(owner);
    this.name = "WiFi";
    this.id = "Wifi";
  }

  update() {}

  display(stats) {
    let s = this.currentStats;
    let rad = 100 * s.area * stats.area;
    let dmg = s.dmg * stats.attack;
    let ox = this.owner.x;
    let oy = this.owner.y;

    // ── 오라 비주얼 ──
    push();
    noStroke();
    // 외곽 글로우
    fill(255, 255, 255, 15);
    ellipse(ox, oy, (rad + 30) * 2, (rad + 30) * 2);
    fill(255, 255, 255, 25);
    ellipse(ox, oy, rad * 2, rad * 2);
    // 가장자리 링
    noFill();
    stroke(220, 220, 255, 80);
    strokeWeight(1.5);
    ellipse(ox, oy, rad * 2, rad * 2);
    pop();

    if (frameCount % s.cd === 0) {
      // ── 펄스 충격파 ──
      spawnEffect(new ShockwaveEffect(ox, oy, [200, 200, 255], rad));

      for (let e of enemies) {
        if (dist(ox, oy, e.x, e.y) < rad) {
          e.takeDamage(dmg, ox, oy, 1.5);
          if (this.isEvolved && random() < 0.05) {
            this.owner.hp = min(this.owner.stats.maxHp, this.owner.hp + 1);
          }
          // ── 히트 이펙트 ──
          spawnEffect(new SparkEffect(e.x, e.y, [200, 200, 255]));
        }
      }
    }
  }
}
