// [AI 도움] 노트북 메테오의 밸런스 패치로 폭발 범위(area) 수치들을 너프했습니다.
class LaptopSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 45, cd: 180, proj: 1, area: 0.8, desc: "무작위 위치에 메테오가 떨어집니다." },
    { dmg: 80, cd: 180, proj: 2, area: 0.8, desc: "메테오 1개 추가, 데미지 증가" },
    { dmg: 120, cd: 150, proj: 2, area: 0.95, desc: "쿨타임 감소, 범위 증가" },
    { dmg: 160, cd: 150, proj: 3, area: 0.95, desc: "메테오 1개 추가, 데미지 증가" },
    { dmg: 200, cd: 120, proj: 3, area: 1.15, desc: "쿨타임 감소, 데미지 및 범위 증가" }
  ];
  static EVO_DATA = { dmg: 240, cd: 40, proj: 5, area: 1.5, desc: "엄청난 수의 파괴적인 메테오가 지속적으로 떨어집니다." };

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
