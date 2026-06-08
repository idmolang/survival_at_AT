// [AI 도움] p5js 스킬의 탄막 투사체 색상을 파란색 계열([100, 200, 255])로 조정했습니다.
class P5jsIconSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 10, cd: 45, proj: 1, pierce: 0, desc: "가장 가까운 적에게 발사합니다." },
    { dmg: 12, cd: 36, proj: 2, pierce: 0, desc: "발사체 1개 증가, 쿨타임 감소" },
    { dmg: 30, cd: 36, proj: 3, pierce: 0, desc: "데미지 증가, 발사체 1개 증가" },
    { dmg: 35, cd: 28, proj: 3, pierce: 1, desc: "관통력 1 증가, 쿨타임 감소" },
    { dmg: 60, cd: 28, proj: 4, pierce: 1, desc: "데미지 증가, 발사체 1개 증가" }
  ];
  static EVO_DATA = { dmg: 80, cd: 8, proj: 5, pierce: 2, desc: "딜레이 없이 마법을 난사합니다." };

  constructor(owner) {
    super(owner);
    this.name = "p5js";
    this.id = "p5js";
  }

  update(stats) {
    let s = this.currentStats;
    let rate = max(5, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0 && enemies.length > 0) {
      let t = this.getClosest();
      if (t) {
        for (let i = 0; i < s.proj; i++) {
          let a = atan2(t.y - this.owner.y, t.x - this.owner.x) + (i - floor(s.proj / 2)) * 0.2;
          let p = projPool.get(
            this.owner.x, this.owner.y, a,
            s.dmg * stats.attack, 15,
            s.pierce > 0, 15, 100,      // size 15로 축소
            [100, 200, 255], false, 1.5
          );
          p.pierceCount = s.pierce;
          // ── p5js 아이콘 이미지 발사체 ──
          p.imgKey = 'p5js';
          p.imgRotationSpeed = 0.18;  // 빠르게 스핀
          p.imgScale = 1.0;
          projectiles.push(p);

          // ── 발사 파티클 이펙트 ──
          spawnEffect(new MuzzleFlashEffect(this.owner.x, this.owner.y, a));
        }
      }
    }
  }

  display() { }

  getClosest() {
    let closest = null;
    let minDist = 600;
    for (let e of enemies) {
      let d = dist(this.owner.x, this.owner.y, e.x, e.y);
      if (d < minDist) { minDist = d; closest = e; }
    }
    return closest;
  }
}
