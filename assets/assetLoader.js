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
}
