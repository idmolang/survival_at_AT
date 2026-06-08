class MouseSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 30, cd: 90, dur: 300, proj: 1, spd: 4, desc: "적을 관통하고 화면 가장자리에서 튕깁니다." },
    { dmg: 35, cd: 90, dur: 400, proj: 1, spd: 6, desc: "속도 및 지속시간 증가" },
    { dmg: 75, cd: 90, dur: 400, proj: 2, spd: 6, desc: "데미지 증가 및 발사체 1개 증가" },
    { dmg: 80, cd: 90, dur: 500, proj: 2, spd: 9, desc: "속도 및 지속시간 증가" },
    { dmg: 120, cd: 90, dur: 500, proj: 3, spd: 10, desc: "발사체 1개 증가, 데미지 증가" }
  ];
  static EVO_DATA = { dmg: 150, cd: 60, dur: 9999, proj: 1, spd: 11, desc: "마우스 커서가 적을 끝없이 추적하며 관통합니다." };

  constructor(owner) {
    super(owner);
    this.name = "마우스";
    this.id = "마우스";
    this.evolvedProjectiles = []; // 진화된 영구 투사체 레퍼런스 보유
  }

  update(stats) {
    let s = this.currentStats;

    if (this.isEvolved) {
      // ── 휘파람 화살 (최종진화 마우스) 모드: 필드에 딱 1개만 상시 유지 ──
      this.evolvedProjectiles = (this.evolvedProjectiles || []).filter(p => !p.isDead && projectiles.includes(p));

      if (this.evolvedProjectiles.length < 1) {
        let a = random(TWO_PI);
        let dmg = s.dmg * stats.attack;
        let spd = s.spd * stats.moveSpeed * 1.6; // 초고속 휘파람 화살 질주 (1.6배 보정)
        let dur = 999999;                       // 사실상 영구 지속

        let p = projPool.get(
          this.owner.x, this.owner.y, a, dmg, spd, true,
          18, dur, [100, 200, 255], false, 0
        );

        p.imgKey = 'mouse';
        p.imgRotationSpeed = 0;
        p.imgAngleOffset = -PI / 4;
        p.imgScale = 1.25;                      // 위용 있는 크기

        p.isHoming = true;
        p.isBounce = false;
        p.homingTurnSpeed = 0.22;               // 몬스터들을 예리하게 꺾어 들이받는 회전각 상향
        p.speed = spd;
        p.isWhistlingArrow = true;              // 다단히트 및 트레일 스폰 활성화

        projectiles.push(p);
        this.evolvedProjectiles.push(p);

        // 스폰 연출
        spawnEffect(new MuzzleFlashEffect(this.owner.x, this.owner.y, a, [100, 200, 255]));
        spawnEffect(new ShockwaveEffect(this.owner.x, this.owner.y, [100, 200, 255], 85));
      }
      return;
    }

    // ── 최종 진화 전: 일반 쿨다운 주기 발사 ──
    let rate = max(30, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0) {
      for (let i = 0; i < s.proj; i++) {
        let a = random(TWO_PI);
        let dmg = s.dmg * stats.attack;
        let spd = s.spd * stats.moveSpeed;
        let dur = s.dur * stats.duration;
        let p = projPool.get(
          this.owner.x, this.owner.y, a, dmg, spd, true,
          15, dur, [100, 200, 255], true, 0
        );

        p.imgKey = 'mouse';
        p.imgRotationSpeed = 0;
        p.imgAngleOffset = -PI / 4;
        p.imgScale = 1.0;

        projectiles.push(p);
        spawnEffect(new MuzzleFlashEffect(this.owner.x, this.owner.y, a, [100, 200, 255]));
      }
    }
  }

  display() { }
}
