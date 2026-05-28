class UnibookSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 10, cd: 180, dur: 120, proj: 1, spd: 0.05, area: 1.0, desc: "플레이어 주변을 맴도는 책 생성" },
    { dmg: 10, cd: 180, dur: 150, proj: 2, spd: 0.07, area: 1.0, desc: "책 1개 추가, 속도 및 지속시간 증가" },
    { dmg: 10, cd: 180, dur: 150, proj: 3, spd: 0.09, area: 1.2, desc: "책 1개 추가, 범위 및 속도 증가" },
    { dmg: 15, cd: 180, dur: 180, proj: 4, spd: 0.09, area: 1.2, desc: "책 1개 추가, 지속시간 및 데미지 증가" },
    { dmg: 20, cd: 180, dur: 180, proj: 5, spd: 0.09, area: 1.2, desc: "책 1개 추가, 데미지 증가" }
  ];
  static EVO_DATA = { dmg: 30, cd: 1, dur: 999999, proj: 6, spd: 0.12, area: 1.5, desc: "책이 영구적으로 주변을 맴돕니다." };

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
      this.angle += s.spd * 2.0; // 회전 속도 조절
      if (this.activeTimer <= 0) {
        this.cooldownTimer = cdRate;
      }
    } else if (this.cooldownTimer > 0) {
      this.cooldownTimer--;
    } else {
      // 쿨타임이 다 차면 다시 활성화
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

      // ── 오브 비주얼 ──
      push();
      noStroke();
      // 외곽 글로우
      fill(255);
      ellipse(sx, sy, 35, 35);
      fill(255);
      ellipse(sx, sy, 25, 25);

      // 중심: unibook 아이콘 이미지 (없으면 기본 원)
      if (typeof gameImages !== 'undefined' && gameImages.unibook) {
        imageMode(CENTER);
        // 오브가 공전하면서 아이콘도 함께 회전
        translate(sx, sy);
        rotate(a + HALF_PI);  // 공전 방향과 맞게 회전
        image(gameImages.unibook, 0, 0, 18, 18);
      } else {
        fill(255, 240, 120);
        ellipse(sx, sy, 15, 15);
        fill(255, 255, 220, 200);
        ellipse(sx - 2, sy - 2, 4, 4);
      }
      pop();

      // ── 히트 판정 & 이펙트 ──
      for (let e of enemies) {
        if (dist(sx, sy, e.x, e.y) < 20) {
          if (!e.lastUnibookHitFrames) e.lastUnibookHitFrames = {};
          let lastHit = e.lastUnibookHitFrames[i] || 0;
          
          // 각 책 번호(i)별로 동일한 적에 대해 20프레임(약 0.33초) 피격 쿨타임 부여
          if (frameCount - lastHit > 20) {
            e.takeDamage(dmg, sx, sy, 3.0);
            e.lastUnibookHitFrames[i] = frameCount;
            // 히트 시 빛 번짐 이펙트
            spawnEffect(new OrbHitEffect(sx, sy));
          }
        }
      }
    }
  }
}
