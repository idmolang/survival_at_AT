// 무기 & 패시브 메타데이터 정의

const WEAPONS_INFO = [
  { class: P5jsIconSkill, passiveInfo: 'Passion', name: 'p5js', icon: 'p5js', flavorDesc: "p5.js 로고를 발사하여 가장 가까운 적을 추적합니다." },
  { class: UnibookSkill, passiveInfo: 'Review', name: 'Unibook', icon: 'unibook', flavorDesc: "주변을 회전하며 적을 밀쳐내는 두꺼운 전공책을 소환합니다." },
  { class: MouseSkill, passiveInfo: 'AirForce', name: 'Mouse', icon: 'mouse', flavorDesc: "화면을 관통하며 벽에 부딪히면 튕기는 마우스 커서를 소환합니다." },
  { class: UsbSkill, passiveInfo: 'Note', name: 'USB 폭풍', icon: 'usb', flavorDesc: "바닥에 강력한 데이터 소켓 장판을 생성하여 적을 공격합니다." },
  { class: LaptopSkill, passiveInfo: 'AirPod', name: '노트북', icon: 'laptop', flavorDesc: "하늘에서 노트북이 떨어져 폭발과 함께 과제를 해결합니다!" },
  { class: WifiSkill, passiveInfo: 'HakSik', name: 'Wifi', icon: 'wifi', flavorDesc: "주변에 넓게 퍼져나가는 고속 무선 데이터 네트워크 파동을 방출합니다." },
  { class: SeniorSummonSkill, passiveInfo: 'Shield', name: '선배들의 조언', icon: 'senior', flavorDesc: "선배들의 든든한 조언이 담긴 초거대 Blaster 광선을 발사합니다." },
  { class: ProfessorCancelSkill, passiveInfo: 'Sleep', name: '교수님의 휴강선언', icon: 'professor', flavorDesc: "기적의 휴강 선언으로 화면 내 모든 적을 즉시 퇴장시킵니다!" },
  { class: CrammingSkill, passiveInfo: 'EnergyDrink', name: '벼락치기', icon: 'cramming', flavorDesc: "하늘에서 짜릿한 날벼락을 떨어뜨려 적들의 정신을 번쩍 들게 합니다." },
];

const PASSIVES_INFO = [
  {
    id: 'Passion',
    name: '슝슝이의 열정',
    flavorDesc: "학업에 임하는 열정으로 모든 무기의 공격력을 증폭시킵니다.",
    desc: [
      "공격력이 20% 증가합니다.",
      "공격력이 40% 증가합니다.",
      "공격력이 60% 증가합니다.",
      "공격력이 80% 증가합니다.",
      "공격력이 100% 증가합니다."
    ]
  },
  {
    id: 'Review',
    name: '복습',
    flavorDesc: "철저한 예습 복습을 통해 스킬의 지속시간을 증가시킵니다.",
    desc: [
      "스킬 지속시간이 20% 증가합니다.",
      "스킬 지속시간이 40% 증가합니다.",
      "스킬 지속시간이 60% 증가합니다.",
      "스킬 지속시간이 80% 증가합니다.",
      "스킬 지속시간이 100% 증가합니다."
    ]
  },
  {
    id: 'AirForce',
    name: '에어포스',
    flavorDesc: "가볍고 튼튼한 에어포스 슈즈로 캐릭터의 이동속도를 증가시킵니다.",
    desc: [
      "이동속도가 1.0 증가합니다.",
      "이동속도가 2.0 증가합니다.",
      "이동속도가 3.0 증가합니다.",
      "이동속도가 4.0 증가합니다.",
      "이동속도가 5.0 증가합니다."
    ]
  },
  {
    id: 'Note',
    name: '노트정리',
    flavorDesc: "깔끔한 필기 요약 노하우를 발휘해 모든 스킬의 범위를 확장합니다.",
    desc: [
      "범위가 15% 증가합니다!",
      "범위가 30% 증가합니다!",
      "범위가 45% 증가합니다!",
      "범위가 60% 증가합니다!",
      "범위가 75% 증가합니다!"
    ]
  },
  {
    id: 'AirPod',
    name: '에어팟',
    flavorDesc: "에어팟으로 음악을 들으며 집중 상태가 되어 쿨타임을 단축시킵니다.",
    desc: [
      "쿨타임이 15% 감소합니다.",
      "쿨타임이 28% 감소합니다.",
      "쿨타임이 39% 감소합니다.",
      "쿨타임이 48% 감소합니다.",
      "쿨타임이 56% 감소합니다."
    ]
  },
  {
    id: 'HakSik',
    name: '학식',
    flavorDesc: "든든한 학생식당 밥을 챙겨 먹고 최대 체력을 늘립니다.",
    desc: [
      "최대 체력이 20 증가합니다.",
      "최대 체력이 40 증가합니다.",
      "최대 체력이 60 증가합니다.",
      "최대 체력이 80 증가합니다.",
      "최대 체력이 100 증가합니다."
    ]
  },
  {
    id: 'Shield',
    name: '슝슝이의 가호',
    flavorDesc: "귀여운 슝슝이 인형의 수호를 받아 피격 데미지를 감소시킵니다.",
    desc: [
      "방어력이 2 증가합니다.",
      "방어력이 4 증가합니다.",
      "방어력이 6 증가합니다.",
      "방어력이 8 증가합니다.",
      "방어력이 10 증가합니다."
    ]
  },
  {
    id: 'Sleep',
    name: '수면',
    flavorDesc: "충분한 숙면을 통해 몬스터 처치 시 획득하는 경험치를 증가시킵니다.",
    desc: [
      "획득 경험치가 20% 증가합니다.",
      "획득 경험치가 40% 증가합니다.",
      "획득 경험치가 60% 증가합니다.",
      "획득 경험치가 80% 증가합니다.",
      "획득 경험치가 100% 증가합니다."
    ]
  },
  {
    id: 'EnergyDrink',
    name: '에너지드링크',
    flavorDesc: "고카페인 음료를 들이켜 지치지 않고 체력을 서서히 회복합니다.",
    desc: [
      "초당 체력 재생량이 0.01 증가합니다.",
      "초당 체력 재생량이 0.02 증가합니다.",
      "초당 체력 재생량이 0.03 증가합니다.",
      "초당 체력 재생량이 0.04 증가합니다.",
      "초당 체력 재생량이 0.05 증가합니다."
    ]
  }
];
