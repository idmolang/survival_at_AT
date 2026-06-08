class WifiSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 5, area: 1.1, cd: 24, desc: "주변의 적에게 피해를 줍니다." },
    { dmg: 8, area: 1.3, cd: 24, desc: "크기 및 데미지 증가" },
    { dmg: 10, area: 1.5, cd: 18, desc: "피해 주기 감소, 크기 증가" },
    { dmg: 14, area: 1.8, cd: 18, desc: "데미지 및 크기 증가" },
    { dmg: 20, area: 1.8, cd: 12, desc: "데미지 증가, 피해 주기 감소" }
  ];
  static EVO_DATA = { dmg: 35, area: 2.2, cd: 8, desc: "타격 시 확률적으로 체력을 회복합니다." };

  static RING_COUNT = 4;
  static PHASE_LEN = 10;
  static SWEEP = 0.60;
  // Math.PI 사용 (p5 상수는 클래스 정의 시점에 미초기화)
  static DIRS = [0, Math.PI, Math.PI / 2, -Math.PI / 2];

  constructor(owner) {
    super(owner);
    this.name = "WiFi";
    this.id = "Wifi";
    this.wifiTimer = 0;
    this.drawBehindPlayer = true; // 플레이어 스프라이트 뒤에 오라 렌더링
  }

  update() {
    this.wifiTimer++;
  }

  display(stats) {
    let s = this.currentStats;
    let rad = 100 * s.area * stats.area;
    let dmg = s.dmg * stats.attack;
    let ox = this.owner.x;
    let oy = this.owner.y;

    // ── 1. 히트박스 외곽 원 ──
    push();
    noFill();
    stroke(100, 200, 255, 65);
    strokeWeight(1.5);
    ellipse(ox, oy, rad * 2, rad * 2);
    // 외곽 글로우
    stroke(80, 180, 255, 12);
    strokeWeight(10);
    ellipse(ox, oy, rad * 2, rad * 2);
    pop();

    // ── 2. 동서남북 와이파이 호 (1→2→3→4 순환) ──
    let cycleLen = WifiSkill.RING_COUNT * WifiSkill.PHASE_LEN;
    let phase = floor(this.wifiTimer % cycleLen / WifiSkill.PHASE_LEN); // 0~3
    let activeCount = phase + 1; // 1~4

    push();
    noFill();
    for (let d = 0; d < WifiSkill.DIRS.length; d++) {
      let centerAngle = WifiSkill.DIRS[d];
      let sw = WifiSkill.SWEEP;

      for (let i = 0; i < WifiSkill.RING_COUNT; i++) {
        // 호 반지름: 안에서 밖으로 (히트박스 안쪽 ~80% 범위)
        let ringRad = ((i + 1) / WifiSkill.RING_COUNT) * (rad * 0.78);
        let isActive = i < activeCount;
        let isNewest = (i === activeCount - 1);

        // 가장 최근 활성 호 펄스
        let pulse = isNewest
          ? (sin(this.wifiTimer * 0.45) * 0.25 + 0.75)
          : 1.0;

        let alpha = (isActive ? 210 : 25) * pulse;
        let lineW = isActive ? 2.5 : 1.0;

        // 활성 호 글로우
        if (isActive) {
          stroke(120, 215, 255, 52 * pulse);
          strokeWeight(8);
          arc(ox, oy, ringRad * 2, ringRad * 2,
            centerAngle - sw, centerAngle + sw);
        }

        // 호 본체
        stroke(80, 200, 255, alpha);
        strokeWeight(lineW);
        arc(ox, oy, ringRad * 2, ringRad * 2,
          centerAngle - sw, centerAngle + sw, OPEN);
      }
    }

    // ── 중심 점 ──
    noStroke();
    fill(120, 215, 255, 230);
    ellipse(ox, oy, 11, 11);
    fill(255, 255, 255, 200);
    ellipse(ox, oy, 5, 5);
    pop();

    // ── 3. 데미지 판정 ──
    if (frameCount % s.cd === 0) {
      for (let e of enemies) {
        if (dist(ox, oy, e.x, e.y) < rad) {
          e.takeDamage(dmg, ox, oy, 0);
          if (this.isEvolved && random() < 0.05) {
            this.owner.hp = min(this.owner.stats.maxHp, this.owner.hp + 1);
          }
          spawnEffect(new SparkEffect(e.x, e.y, [200, 200, 255]));
        }
      }
    }
  }
}
