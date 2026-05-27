class SeniorSummonSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 40, cd: 180, proj: 1, area: 1.0, desc: "무작위 위치에 생성되어 일직선 레이저 발사" },
    { dmg: 60, cd: 180, proj: 1, area: 1.2, desc: "데미지 및 레이저 굵기 증가" },
    { dmg: 60, cd: 150, proj: 2, area: 1.2, desc: "블래스터 1개 추가, 쿨타임 감소" },
    { dmg: 80, cd: 150, proj: 2, area: 1.5, desc: "데미지 및 레이저 굵기 증가" },
    { dmg: 120, cd: 120, proj: 3, area: 1.5, desc: "블래스터 1개 추가, 쿨타임 감소" }
  ];
  static EVO_DATA = { dmg: 200, cd: 60, proj: 4, area: 3.0, desc: "화면을 뒤덮는 파괴적인 초거대 레이저 발사" };

  constructor(owner) {
    super(owner);
    this.name = "선배들의 조언";
    this.id = "Senior";
    this.blasters = [];
  }

  update(stats) {
    let s = this.currentStats;
    let rate = max(30, s.cd * stats.cooldown);

    if (frameCount % floor(rate) === 0) {
      for (let i = 0; i < s.proj; i++) {
        let bx = this.owner.x + random(-400, 400);
        let by = this.owner.y + random(-400, 400);
        let a = random(TWO_PI);
        if (enemies.length > 0) {
          let t = random(enemies);
          a = atan2(t.y - by, t.x - bx);
        }
        this.blasters.push({ x: bx, y: by, angle: a, timer: 30, fired: false });
        // ── 차지 이펙트 ──
        spawnEffect(new LaserChargeEffect(bx, by, a));
      }
    }

    for (let i = this.blasters.length - 1; i >= 0; i--) {
      let b = this.blasters[i];
      b.timer--;
      if (b.timer <= 0 && !b.fired) {
        b.fired = true;
        let dmg = s.dmg * stats.attack;
        let w = 20 * s.area * stats.area;
        for (let e of enemies) {
          let px = e.x - b.x; let py = e.y - b.y;
          let localX = px * cos(-b.angle) - py * sin(-b.angle);
          let localY = px * sin(-b.angle) + py * cos(-b.angle);
          if (localX > 0 && localX < 1200 && abs(localY) < w) {
            e.takeDamage(dmg, b.x, b.y, 4.0);
          }
        }
        // ── 레이저 발사 이펙트 ──
        spawnEffect(new LaserBeamEffect(b.x, b.y, b.angle, w, [255, 50, 50]));
        let p = projPool.get(b.x, b.y, b.angle, 0, 0, true, w * 2, 15, [255, 0, 0, 200], false);
        p.isLaser = true;
        projectiles.push(p);
      }
      if (b.timer < -15) this.blasters.splice(i, 1);
    }
  }

  display(stats) {
    for (let b of this.blasters) {
      if (!b.fired) {
        let s = this.currentStats;
        let w = 20 * s.area * stats.area;
        push();
        translate(b.x, b.y);
        rotate(b.angle);

        // ── 블래스터 포신 비주얼 ──
        // 본체 (눈 모양)
        noStroke();
        fill(30, 30, 40);
        ellipse(0, 0, 34, 34);
        fill(200, 50, 50);
        ellipse(0, 0, 24, 24);
        // 동공
        fill(255, 0, 0);
        ellipse(6, 0, 10, 10);
        // 하이라이트
        fill(255, 150, 150, 200);
        ellipse(3, -3, 4, 4);

        // 조준선 (깜빡이는 경고)
        let blink = sin(frameCount * 0.3) * 0.5 + 0.5;
        stroke(255, 50, 50, 80 * blink + 20);
        strokeWeight(w * 0.5);
        line(0, 0, 900, 0);
        // 조준선 가장자리
        stroke(255, 100, 100, 50 * blink);
        strokeWeight(w * 1.5);
        line(0, 0, 900, 0);

        pop();
      }
    }
  }
}
