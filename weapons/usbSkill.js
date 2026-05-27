class UsbSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 5, cd: 120, dur: 120, proj: 1, area: 1.0, desc: "무작위 위치에 데미지 장판 생성" },
    { dmg: 5, cd: 120, dur: 150, proj: 2, area: 1.2, desc: "병 1개 추가, 크기 및 지속시간 증가" },
    { dmg: 10, cd: 120, dur: 150, proj: 3, area: 1.5, desc: "병 1개 추가, 데미지 및 크기 증가" },
    { dmg: 15, cd: 120, dur: 180, proj: 4, area: 1.5, desc: "병 1개 추가, 데미지 및 지속시간 증가" },
    { dmg: 25, cd: 120, dur: 180, proj: 4, area: 2.0, desc: "데미지 및 크기 대폭 증가" }
  ];
  static EVO_DATA = { dmg: 35, cd: 60, dur: 300, proj: 6, area: 2.5, desc: "거대 장판이 플레이어 쪽으로 모여듭니다." };

  constructor(owner) {
    super(owner);
    this.name = "USB";
    this.id = "USB";
    this.zones = [];
  }

  update(stats) {
    let s = this.currentStats;
    let rate = max(30, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0) {
      for (let i = 0; i < s.proj; i++) {
        let zx = this.owner.x + random(-300, 300);
        let zy = this.owner.y + random(-300, 300);
        this.zones.push({ x: zx, y: zy, dur: s.dur * stats.duration, maxDur: s.dur * stats.duration });
        // ── 장판 생성 충격파 ──
        spawnEffect(new ShockwaveEffect(zx, zy, [80, 140, 255], 80 * s.area * stats.area));
      }
    }
    for (let i = this.zones.length - 1; i >= 0; i--) {
      this.zones[i].dur--;
      if (this.isEvolved) {
        let a = atan2(this.owner.y - this.zones[i].y, this.owner.x - this.zones[i].x);
        this.zones[i].x += cos(a) * 1.5;
        this.zones[i].y += sin(a) * 1.5;
      }
      if (this.zones[i].dur <= 0) this.zones.splice(i, 1);
    }
  }

  display(stats) {
    let s = this.currentStats;
    let rad = 80 * s.area * stats.area;
    let dmg = s.dmg * stats.attack;

    for (let z of this.zones) {
      let lifeRatio = z.dur / z.maxDur;

      // ── 장판 비주얼 (다층 글로우) ──
      push();
      noStroke();
      // 외곽 글로우
      fill(50, 100, 255, 25);
      ellipse(z.x, z.y, (rad + 20) * 2, (rad + 20) * 2);
      // 중간 레이어
      fill(50, 120, 255, 50);
      ellipse(z.x, z.y, rad * 2, rad * 2);
      // 가장자리 링
      noFill();
      stroke(80, 160, 255, 150);
      strokeWeight(2);
      ellipse(z.x, z.y, rad * 2, rad * 2);

      // 내부 버블 파티클
      if (frameCount % 8 === 0) {
        let bx = z.x + random(-rad * 0.8, rad * 0.8);
        let by = z.y + random(-rad * 0.8, rad * 0.8);
        spawnEffect(new BubbleEffect(bx, by, [80, 160, 255]));
      }
      pop();

      // ── 히트 판정 & 스파크 이펙트 ──
      if (frameCount % 15 === 0) {
        for (let e of enemies) {
          if (dist(z.x, z.y, e.x, e.y) < rad) {
            e.takeDamage(dmg, z.x, z.y, 0);
            spawnEffect(new SparkEffect(e.x, e.y, [80, 160, 255]));
          }
        }
      }
    }
  }
}
