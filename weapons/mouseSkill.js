class MouseSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 30, cd: 120, dur: 120, proj: 1, spd: 2.0, desc: "적을 관통하고 화면 가장자리에서 튕깁니다." },
    { dmg: 35, cd: 120, dur: 130, proj: 1, spd: 2.3, desc: "속도 및 지속시간 증가" },
    { dmg: 75, cd: 120, dur: 130, proj: 2, spd: 2.3, desc: "데미지 증가 및 발사체 1개 증가" },
    { dmg: 80, cd: 120, dur: 140, proj: 2, spd: 2.6, desc: "속도 및 지속시간 증가" },
    { dmg: 130, cd: 120, dur: 150, proj: 3, spd: 3.0, desc: "발사체 1개 증가, 데미지 증가" }
  ];
  static EVO_DATA = { dmg: 150, cd: 90, dur: 200, proj: 3, spd: 3.0, desc: "화면 끝에 부딪힐 때마다 광범위 사이버 폭발을 일으키는 마우스 커서들을 소환합니다." };

  constructor(owner) {
    super(owner);
    this.name = "마우스";
    this.id = "마우스";
  }

  update(stats) {
    let s = this.currentStats;

    // 이 무기가 발사한 활성 상태의 마우스 투사체만 필터링
    let activeProjectiles = projectiles.filter(p => p.launcher === this && !p.isDead);

    // 혹시 모를 오동작 대비: s.proj 초과분 제거
    while (activeProjectiles.length > s.proj) {
      let p = activeProjectiles.shift();
      p.isDead = true;
    }

    if (this.isEvolved) {
      // ── 최종 진화: 벽 튕김 및 폭발하는 여러 마우스 소환 ──

      // 처음 진화 시 혹은 모두 사라졌을 때 즉시 스폰하여 공백 시간 제거
      if (activeProjectiles.length === 0) {
        let spawnCount = s.proj;
        for (let i = 0; i < spawnCount; i++) {
          let a = random(TWO_PI);
          let dmg = s.dmg * stats.attack;
          let spd = s.spd * stats.moveSpeed;
          let dur = s.dur * stats.duration; // 시간 지나면 사라지도록 유한한 지속시간 설정

          let p = projPool.get(
            this.owner.x, this.owner.y, a, dmg, spd, true,
            18, dur, [100, 200, 255], true, 0
          );

          p.imgKey = 'mouse';
          p.imgRotationSpeed = 0;
          p.imgAngleOffset = -PI / 4;
          p.imgScale = 1.25;

          p.isHoming = false;
          p.isBounce = true;
          p.speed = spd;
          p.isWhistlingArrow = false;
          p.isEvolvedMouse = true;
          p.launcher = this;

          projectiles.push(p);
          activeProjectiles.push(p);

          spawnEffect(new MuzzleFlashEffect(this.owner.x, this.owner.y, a, [100, 200, 255]));
        }
        spawnEffect(new ShockwaveEffect(this.owner.x, this.owner.y, [100, 200, 255], 120));
      }

      // 주기적으로 부족한 개수만큼 채워서 스폰 (AirPods 쿨다운 영향 받음)
      let rate = max(30, s.cd * stats.cooldown);
      if (frameCount % floor(rate) === 0) {
        let spawnCount = s.proj - activeProjectiles.length;
        for (let i = 0; i < spawnCount; i++) {
          let a = random(TWO_PI);
          let dmg = s.dmg * stats.attack;
          let spd = s.spd * stats.moveSpeed;
          let dur = s.dur * stats.duration;

          let p = projPool.get(
            this.owner.x, this.owner.y, a, dmg, spd, true,
            18, dur, [100, 200, 255], true, 0
          );

          p.imgKey = 'mouse';
          p.imgRotationSpeed = 0;
          p.imgAngleOffset = -PI / 4;
          p.imgScale = 1.25;

          p.isHoming = false;
          p.isBounce = true;
          p.speed = spd;
          p.isWhistlingArrow = false;
          p.isEvolvedMouse = true;
          p.launcher = this;

          projectiles.push(p);
          activeProjectiles.push(p);

          spawnEffect(new MuzzleFlashEffect(this.owner.x, this.owner.y, a, [100, 200, 255]));
        }
      }
      return;
    }

    // ── 최종 진화 전: 일반 쿨다운 주기 발사 ──
    let rate = max(30, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0) {
      let spawnCount = s.proj - activeProjectiles.length;
      for (let i = 0; i < spawnCount; i++) {
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
        p.launcher = this;

        projectiles.push(p);
        activeProjectiles.push(p);
        spawnEffect(new MuzzleFlashEffect(this.owner.x, this.owner.y, a, [100, 200, 255]));
      }
    }
  }

  display() { }
}
