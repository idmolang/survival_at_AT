class CrammingSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 25, cd: 150, proj: 1, area: 1.0, desc: "무작위 적에게 벼락이 떨어집니다." },
    { dmg: 25, cd: 150, proj: 2, area: 1.1, desc: "벼락 1개 추가, 범위 증가" },
    { dmg: 50, cd: 150, proj: 3, area: 1.1, desc: "벼락 1개 추가, 데미지 증가" },
    { dmg: 50, cd: 150, proj: 4, area: 1.3, desc: "벼락 1개 추가, 범위 증가" },
    { dmg: 80, cd: 150, proj: 5, area: 1.3, desc: "벼락 1개 추가, 데미지 증가" }
  ];
  static EVO_DATA = { dmg: 160, cd: 90, proj: 6, area: 1.5, desc: "벼락이 친 자리에 짧은 딜레이 후 두 번 타격합니다." };

  constructor(owner) {
    super(owner);
    this.name = "벼락치기";
    this.id = "Cramming";
    this.echoes = [];
  }

  update(stats) {
    let s = this.currentStats;
    let rate = max(30, s.cd * stats.cooldown);

    // Echo logic for Evo
    for (let i = this.echoes.length - 1; i >= 0; i--) {
      this.echoes[i].timer--;
      if (this.echoes[i].timer <= 0) {
        let ec = this.echoes[i];
        for (let e of enemies) {
          if (dist(e.x, e.y, ec.x, ec.y) < ec.rad) e.takeDamage(ec.dmg, e.x, e.y, 0);
        }
        // ── 에코 폭발 ──
        spawnEffect(new LightningStrikeEffect(ec.x, ec.y, ec.rad));
        spawnEffect(new ShockwaveEffect(ec.x, ec.y, [200, 255, 255], ec.rad));
        projectiles.push(
          projPool.get(ec.x, ec.y, 0, 0, 0, true, ec.rad * 2, 10, [255, 255, 200, 150], false)
        );
        this.echoes.splice(i, 1);
      }
    }

    if (frameCount % floor(rate) === 0) {
      let dmg = s.dmg * stats.attack;
      let rad = 40 * s.area * stats.area;
      for (let i = 0; i < s.proj; i++) {
        if (enemies.length === 0) break;
        let t = random(enemies);
        for (let e of enemies) {
          if (dist(e.x, e.y, t.x, t.y) < rad) e.takeDamage(dmg, e.x, e.y, 0);
        }
        // ── 낙뢰 이펙트 ──
        spawnEffect(new LightningStrikeEffect(t.x, t.y, rad));
        spawnEffect(new ShockwaveEffect(t.x, t.y, [200, 255, 255], rad));

        projectiles.push(
          projPool.get(t.x, t.y, 0, 0, 0, true, rad * 2, 10, [200, 255, 255, 150], false)
        );
        if (this.isEvolved) {
          this.echoes.push({ x: t.x, y: t.y, timer: 30, rad: rad, dmg: dmg });
        }
      }
    }
  }

  display() { }
}
