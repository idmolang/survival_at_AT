class ProfessorCancelSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 9999, cd: 3600, desc: "화면 내 모든 적 처치 (쿨타임 60초)" },
    { dmg: 9999, cd: 3000, desc: "쿨타임 감소" },
    { dmg: 9999, cd: 2400, desc: "쿨타임 감소" },
    { dmg: 9999, cd: 1800, desc: "쿨타임 감소" },
    { dmg: 9999, cd: 1200, desc: "쿨타임 대폭 감소" }
  ];
  static EVO_DATA = { dmg: 99999, cd: 900, desc: "전체 적 처치 및 막대한 보너스 경험치 획득" };

  constructor(owner) {
    super(owner);
    this.name = "교수님의 휴강선언";
    this.id = "Professor";
  }

  update(stats) {
    let s = this.currentStats;
    let rate = max(120, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0) {
      let dmg = s.dmg * stats.attack;

      // ── 화면 화이트 플래시 ──
      spawnEffect(new ScreenFlashEffect([255, 255, 255], 30));

      for (let e of enemies) {
        e.takeDamage(dmg, e.x, e.y, 0);
        if (this.isEvolved) e.expValue *= 3;
        // ── 각 적마다 소멸 이펙트 ──
        spawnEffect(new EnemyVanishEffect(e.x, e.y));
      }
      projectiles.push(
        projPool.get(player.x, player.y, 0, 0, 0, true, 2000, 20, [255, 255, 255, 200], false)
      );
    }
  }

  display() {}
}
