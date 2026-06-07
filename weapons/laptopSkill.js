class LaptopSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 20, cd: 240, proj: 1, area: 1.0, desc: "무작위 위치에 메테오가 떨어집니다." },
    { dmg: 40, cd: 240, proj: 2, area: 1.0, desc: "메테오 1개 추가, 데미지 증가" },
    { dmg: 40, cd: 210, proj: 2, area: 1.2, desc: "쿨타임 감소, 범위 증가" },
    { dmg: 70, cd: 210, proj: 3, area: 1.2, desc: "메테오 1개 추가, 데미지 증가" },
    { dmg: 100, cd: 180, proj: 3, area: 1.5, desc: "쿨타임 감소, 데미지 및 범위 증가" }
  ];
  static EVO_DATA = { dmg: 150, cd: 60, proj: 5, area: 2.0, desc: "엄청난 수의 파괴적인 메테오가 지속적으로 떨어집니다." };

  constructor(owner) {
    super(owner);
    this.name = "노트북";
    this.id = "노트북";
  }

  update(stats) {
    let s = this.currentStats;
    let rate = max(15, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0) {
      for (let i = 0; i < s.proj; i++) {
        let mx = this.owner.x + random(-400, 400);
        let my = this.owner.y + random(-400, 400);
        let rad = 100 * s.area * stats.area;
        let dmg = s.dmg * stats.attack;

        // 하늘에서 떨어지는 이펙트 스폰 (피해량과 범위를 인자로 넘겨 낙하 완료 후 타격하도록 처리)
        spawnEffect(new LaptopFallEffect(mx, my, rad, dmg));
      }
    }
  }

  display() { }
}
