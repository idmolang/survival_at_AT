// 무기 & 패시브 메타데이터 정의

const WEAPONS_INFO = [
  { class: P5jsIconSkill, passiveInfo: 'Passion', name: 'p5js', icon: 'p5js' },
  { class: UnibookSkill, passiveInfo: 'Review', name: 'Unibook', icon: 'unibook' },
  { class: MouseSkill, passiveInfo: 'AirForce', name: 'Mouse', icon: 'mouse' },
  { class: UsbSkill, passiveInfo: 'Note', name: 'USB 폭풍', icon: 'usb' },
  { class: LaptopSkill, passiveInfo: 'AirPod', name: '노트북', icon: 'laptop' },
  { class: WifiSkill, passiveInfo: 'HakSik', name: 'Wifi', icon: 'wifi' },
  { class: SeniorSummonSkill, passiveInfo: 'Shield', name: '선배들의 조언', icon: 'senior' },
  { class: ProfessorCancelSkill, passiveInfo: 'Sleep', name: '교수님의 휴강선언', icon: 'professor' },
  { class: CrammingSkill, passiveInfo: 'EnergyDrink', name: '벼락치기', icon: 'cramming' },
];

const PASSIVES_INFO = [
  {
    id: 'Passion',
    name: '슝슝이의 열정',
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
    desc: [
      "초당 체력 재생량이 0.1 증가합니다.",
      "초당 체력 재생량이 0.2 증가합니다.",
      "초당 체력 재생량이 0.3 증가합니다.",
      "초당 체력 재생량이 0.4 증가합니다.",
      "초당 체력 재생량이 0.5 증가합니다."
    ]
  }
];
