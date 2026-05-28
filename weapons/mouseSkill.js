class MouseSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 10, cd: 120, dur: 300, proj: 1, spd: 8, desc: "적을 관통하고 화면 가장자리에서 튕깁니다." },
    { dmg: 10, cd: 120, dur: 400, proj: 1, spd: 10, desc: "속도 및 지속시간 증가" },
    { dmg: 10, cd: 120, dur: 400, proj: 2, spd: 10, desc: "발사체 1개 증가" },
    { dmg: 10, cd: 120, dur: 500, proj: 2, spd: 12, desc: "속도 및 지속시간 증가" },
    { dmg: 20, cd: 120, dur: 500, proj: 3, spd: 12, desc: "발사체 1개 증가, 데미지 증가" }
  ];
  static EVO_DATA = { dmg: 35, cd: 90, dur: 9999, proj: 1, spd: 15, desc: "마우스 커서가 적을 끝없이 추적하며 관통합니다." };

  constructor(owner) {
    super(owner);
    this.name = "마우스";
    this.id = "마우스";
  }

  update(stats) {
    let s = this.currentStats;
    let rate = max(30, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0) {
      for (let i = 0; i < s.proj; i++) {
        let a = random(TWO_PI);
        let dmg = s.dmg * stats.attack;
        let spd = s.spd * stats.moveSpeed;
        let dur = s.dur * stats.duration;
        let p = projPool.get(
          this.owner.x, this.owner.y, a, dmg, spd, true,
          15, dur, [100, 200, 255], true, 0   // size 15로 축소
        );

        // ── 마우스 커서 이미지 발사체 ──
        p.imgKey = 'mouse';
        p.imgRotationSpeed = 0;              // 이동 방향 자동 추적
        // 커서 이미지는 우상단을 가리킴 → -PI/4 보정으로 이동방향과 일치
        p.imgAngleOffset = -PI / 4;
        p.imgScale = 1.0;

        if (this.isEvolved) {
          p.isHoming = true;
          p.isBounce = false;     // 화면 밖으로 나가도 추적
          p.homingTurnSpeed = 0.15;
          p.speed = spd;
        }

        projectiles.push(p);
        // ── 발사 파티클 ──
        spawnEffect(new MuzzleFlashEffect(this.owner.x, this.owner.y, a, [100, 200, 255]));
      }
    }
  }

  display() { }
}
