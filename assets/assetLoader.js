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
  
  // 플레이어 스프라이트 단일 이미지 (폴백용)
  gameImages.player_down  = loadImage('assets/player/player_down.png');
  gameImages.player_left  = loadImage('assets/player/player_left.png');
  gameImages.player_right = loadImage('assets/player/player_right.png');
  gameImages.player_up    = loadImage('assets/player/player_up.png');

  // 플레이어 방향별 걷기 애니메이션 프레임 배열
  // down: frame_01, frame_03~frame_25 (24장)
  gameImages.player_down_frames = [];
  gameImages.player_down_frames.push(loadImage('assets/player/player_down/frame_01.png'));
  for (let i = 3; i <= 25; i++) {
    gameImages.player_down_frames.push(loadImage(`assets/player/player_down/frame_${nf(i,2)}.png`));
  }

  // left: left_walk_02~left_walk_25 (24장)
  gameImages.player_left_frames = [];
  for (let i = 2; i <= 25; i++) {
    gameImages.player_left_frames.push(loadImage(`assets/player/player_left/left_walk_${nf(i,2)}.png`));
  }

  // right: frame_02~frame_25 (24장)
  gameImages.player_right_frames = [];
  for (let i = 2; i <= 25; i++) {
    gameImages.player_right_frames.push(loadImage(`assets/player/player_right/frame_${nf(i,2)}.png`));
  }

  // up: frame_02~frame_25 (24장)
  gameImages.player_up_frames = [];
  for (let i = 2; i <= 25; i++) {
    gameImages.player_up_frames.push(loadImage(`assets/player/player_up/frame_${nf(i,2)}.png`));
  }
  
  // 노트북 이미지
  gameImages.laptop = loadImage('assets/laptop/laptop.png');
  gameImages.laptop_destroy_01 = loadImage('assets/laptop/laptop_destroy_01.png');
  gameImages.laptop_destroy_02 = loadImage('assets/laptop/laptop_destroy_02.png');

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

  // 무기 스킬 아이콘
  gameImages.skill_icons = {
    p5js:      loadImage('assets/skill_icon/p5jsIcon.png'),
    unibook:   loadImage('assets/skill_icon/unibookIcon.png'),
    mouse:     loadImage('assets/skill_icon/mouseIcon.png'),
    usb:       loadImage('assets/skill_icon/usbIcon.png'),
    laptop:    loadImage('assets/skill_icon/laptopIcon.png'),
    wifi:      loadImage('assets/skill_icon/wifiIcon.png'),
    senior:    loadImage('assets/skill_icon/seniorIcon.png'),
    cramming:  loadImage('assets/skill_icon/crammingIcon.png'),
    professor: loadImage('assets/skill_icon/professorIcon.png'),
  };

  // 패시브 아이콘
  gameImages.passive_icons = {
    Passion:     loadImage('assets/passive_icon/passionIcon.png'),
    Review:      loadImage('assets/passive_icon/reviewIcon.png'),
    AirForce:    loadImage('assets/passive_icon/airforceIcon.png'),
    Note:        loadImage('assets/passive_icon/noteIcon.png'),
    AirPod:      loadImage('assets/passive_icon/airpodIcon.png'),
    HakSik:      loadImage('assets/passive_icon/haksikIcon.png'),
    Shield:      loadImage('assets/passive_icon/shieldIcon.png'),
    Sleep:       loadImage('assets/passive_icon/sleepIcon.png'),
    EnergyDrink: loadImage('assets/passive_icon/energydrinkIcon.png'),
  };

  // USB 원본 이미지
  gameImages.usb_raw = loadImage('assets/images/usb_raw.jpg');

  // 교수님 이미지 (휴강선언 연출용)
  gameImages.professor = loadImage('assets/images/professor.png');
}

// USB 이미지의 회색/어두운 체크무늬 배경을 동적으로 걷어내고 투명 아웃라인만 남기는 필터
function processUsbImage(img) {
  let processed = createImage(img.width, img.height);
  img.loadPixels();
  processed.loadPixels();
  
  for (let i = 0; i < img.pixels.length; i += 4) {
    let r = img.pixels[i];
    let g = img.pixels[i+1];
    let b = img.pixels[i+2];
    let a = img.pixels[i+3];
    
    // 체크무늬 및 주변부의 어둡고 무채색인(Neutral) 픽셀 감지
    // 채도가 극히 낮거나(R, G, B가 매우 균등함), 픽셀 자체의 밝기가 어두운 부분
    let isNeutral = abs(r - g) < 20 && abs(g - b) < 20 && abs(b - r) < 20;
    let isDark = r < 75 && g < 75 && b < 75;
    
    if (isNeutral || isDark) {
      // 투명 처리
      processed.pixels[i]   = 0;
      processed.pixels[i+1] = 0;
      processed.pixels[i+2] = 0;
      processed.pixels[i+3] = 0;
    } else {
      // 원본 색상 복사
      processed.pixels[i]   = r;
      processed.pixels[i+1] = g;
      processed.pixels[i+2] = b;
      processed.pixels[i+3] = a;
    }
  }
  processed.updatePixels();
  return processed;
}




