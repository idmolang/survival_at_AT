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
  
  // 노트북 애니메이션 프레임 (assets/laptop 폴더 내의 12개 프레임)
  gameImages.laptop_frames = [];
  for (let i = 1; i <= 12; i++) {
    let numStr = String(i).padStart(2, '0');
    gameImages.laptop_frames.push(loadImage(`assets/laptop/frame_${numStr}.png`));
  }
}


