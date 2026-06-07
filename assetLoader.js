// ─────────────────────────────────────────────
// assetLoader.js — 모든 게임 이미지를 preload에서 로드
// p5.js는 preload()가 끝난 뒤 setup()을 실행하므로
// 이미지 사용 전 반드시 여기서 로드해야 함
// ─────────────────────────────────────────────

let gameImages = {};

function preload() {
  // 발사체 비주얼 아이콘
  gameImages.p5js    = loadImage('assets/images/p5js.png');
  gameImages.unibook = loadImage('assets/images/unibook.png');
  gameImages.mouse   = loadImage('assets/images/mouse.png');
  
  // 플레이어 스프라이트 (assets/player 폴더 내에 실재)
  gameImages.player_down  = loadImage('assets/player/player_down.png');
  gameImages.player_left  = loadImage('assets/player/player_left.png');
  gameImages.player_right = loadImage('assets/player/player_right.png');
  gameImages.player_up    = loadImage('assets/player/player_up.png');
  
  // 노트북 이미지
  gameImages.laptop = loadImage('assets/laptop/laptop.png');
  gameImages.laptop_destroy_01 = loadImage('assets/laptop/laptop_destroy_01.png');
  gameImages.laptop_destroy_02 = loadImage('assets/laptop/laptop_destroy_02.png');

  // 와이파이 애니메이션 프레임 (assets/wifi 폴더 내의 16개 프레임)
  gameImages.wifi_frames = [];
  for (let i = 1; i <= 16; i++) {
    let numStr = String(i).padStart(2, '0');
    gameImages.wifi_frames.push(loadImage(`assets/wifi/frame_${numStr}.png`));
  }

  // 적 캐릭터 이미지 (assets/enemy 폴더 내의 16개 이미지)
  gameImages.enemy_images = [];
  for (let i = 1; i <= 16; i++) {
    gameImages.enemy_images.push(loadImage(`assets/enemy/${i}.png`));
  }

  // 선배 이미지 (준비 자세 + 8방향 공격 자세)
  gameImages.senior_ready = loadImage('assets/senior/ready.png');
  gameImages.senior_attack = {
    right:       loadImage('assets/senior/attack/right_attack.png'),
    left:        loadImage('assets/senior/attack/left_attack.png'),
    up:          loadImage('assets/senior/attack/up_attack.png'),
    down:        loadImage('assets/senior/attack/down_attack.png'),
    up_right:    loadImage('assets/senior/attack/up_right_attack.png'),
    up_left:     loadImage('assets/senior/attack/up_left_attack.png'),
    down_right:  loadImage('assets/senior/attack/down_right_attack.png'),
    down_left:   loadImage('assets/senior/attack/down_left_attack.png'),
  };
}


