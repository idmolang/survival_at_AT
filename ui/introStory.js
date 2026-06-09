// 인트로 스토리 만화 연출 화면
const STORY_PANELS = [
  { sx: 0, sy: 0, sw: 413, sh: 200 },       // Panel 1: Door
  { sx: 413, sy: 0, sw: 611, sh: 200 },     // Panel 2: Professor
  { sx: 0, sy: 200, sw: 375, sh: 161 },     // Panel 3: Student screaming
  { sx: 375, sy: 200, sw: 273, sh: 161 },   // Panel 4: Student thinking
  { sx: 648, sy: 200, sw: 376, sh: 161 },   // Panel 5: Senior introducing
  { sx: 0, sy: 361, sw: 306, sh: 215 },     // Panel 6: Student excited
  { sx: 306, sy: 361, sw: 342, sh: 215 },   // Panel 7: Senior explaining
  { sx: 648, sy: 361, sw: 376, sh: 215 }    // Panel 8: Boom panel ("꺄아아악")
];

let currentPanelIndex = 0;
let panelFadeAlpha = 0;
let panelTimer = 0;
let slamTimer = 0;
let introShake = 0;

function initIntroStory() {
  currentPanelIndex = 0;
  panelFadeAlpha = 0;
  panelTimer = 0;
  slamTimer = 0;
  introShake = 0;
}

function drawIntroStory() {
  // 1. 연출 진행 및 타이머 업데이트
  if (currentPanelIndex < 7) {
    // 0~6번 만화 칸: 서서히 페이드인
    if (panelFadeAlpha < 255) {
      panelFadeAlpha += 12; // 약 0.35초 동안 페이드인
      if (panelFadeAlpha >= 255) {
        panelFadeAlpha = 255;
      }
    } else {
      panelTimer++;
      if (panelTimer >= 90) { // 1.5초 유지 후 자동 전환
        nextPanel();
      }
    }
  } else {
    // 마지막 7번 칸 (꺄아아악): 쾅 떨어지는 스탬프 연출
    slamTimer++;
    if (slamTimer === 15) {
      introShake = 15; // 쾅 떨어지는 시점에 화면 흔들림 작동
    }
    if (introShake > 0) {
      introShake -= 1.0;
    }
  }

  // 2. 배경 드로잉 및 화면 흔들림 적용
  push();
  background(15, 15, 25);
  
  if (introShake > 0) {
    translate(random(-introShake, introShake), random(-introShake, introShake));
  }

  // 화면 크기에 맞게 만화책 스케일 및 센터링 계산 (1024x576 원본 기준)
  let scaleVal = min(width / 1024, height / 576) * 0.92;
  let startX = (width - 1024 * scaleVal) / 2;
  let startY = (height - 576 * scaleVal) / 2;

  // 3. 만화 칸 렌더링
  if (gameImages.intro_comic) {
    for (let i = 0; i <= currentPanelIndex; i++) {
      let p = STORY_PANELS[i];
      let dx = startX + p.sx * scaleVal;
      let dy = startY + p.sy * scaleVal;
      let dw = p.sw * scaleVal;
      let dh = p.sh * scaleVal;

      if (i < currentPanelIndex) {
        // 이미 보여진 이전 만화 칸은 완전 투명하게
        push();
        tint(255);
        image(gameImages.intro_comic, dx, dy, dw, dh, p.sx, p.sy, p.sw, p.sh);
        pop();
      } else {
        // 현재 보여주고 있는 만화 칸
        if (i < 7) {
          // 페이드인 처리
          push();
          tint(255, panelFadeAlpha);
          image(gameImages.intro_comic, dx, dy, dw, dh, p.sx, p.sy, p.sw, p.sh);
          pop();
        } else {
          // 마지막 칸: 쾅 떨어지는 연출
          let cx = dx + dw / 2;
          let cy = dy + dh / 2;
          
          let progress = min(1.0, slamTimer / 15.0);
          let s = 1.0 + 4.0 * pow(1.0 - progress, 3); // 5배 크기에서 쾅 떨어짐
          
          push();
          translate(cx, cy);
          scale(s);
          imageMode(CENTER);
          tint(255, progress * 255);
          image(gameImages.intro_comic, 0, 0, dw, dh, p.sx, p.sy, p.sw, p.sh);
          pop();
        }
      }
    }
  }

  pop();

  // 4. 하단 및 우측 가이드 UI
  push();
  textAlign(CENTER, CENTER);
  
  // 우측 상단 SKIP 버튼
  let skipX = width - 85;
  let skipY = 30;
  let skipW = 90;
  let skipH = 35;
  rectMode(CENTER);
  if (mouseX > skipX - skipW/2 && mouseX < skipX + skipW/2 && mouseY > skipY - skipH/2 && mouseY < skipY + skipH/2) {
    fill(200, 70, 70); cursor(HAND);
  } else {
    fill(50, 50, 70, 150);
  }
  stroke(255, 100); strokeWeight(1);
  rect(skipX, skipY, skipW, skipH, 8);
  fill(255); noStroke(); textSize(14); textStyle(BOLD);
  text("SKIP (ESC)", skipX, skipY);

  // 하단 진행 가이드 텍스트
  if (currentPanelIndex === 7 && slamTimer >= 15) {
    // 마지막 쾅 연출 완료 시 반짝이는 시작 가이드
    let pulseAlpha = 150 + sin(frameCount * 0.1) * 105;
    fill(255, 215, 0, pulseAlpha);
    textSize(24);
    textStyle(BOLD);
    text("⚠️ 클릭하면 게임이 시작됩니다! ⚠️", width / 2, height - 35);
  } else {
    fill(200, 200, 200, 180);
    textSize(14);
    text("화면을 클릭하면 더 빠르게 넘길 수 있습니다.", width / 2, height - 35);
  }
  pop();
}

function nextPanel() {
  if (currentPanelIndex < 7) {
    currentPanelIndex++;
    panelFadeAlpha = 0;
    panelTimer = 0;
  }
}

function handleIntroStoryClick() {
  // SKIP 버튼 영역 클릭 여부 확인
  let skipX = width - 85;
  let skipY = 30;
  let skipW = 90;
  let skipH = 35;
  if (mouseX > skipX - skipW/2 && mouseX < skipX + skipW/2 && mouseY > skipY - skipH/2 && mouseY < skipY + skipH/2) {
    startGameDirectly();
    return;
  }

  // 만화 진행 클릭 핸들링
  if (currentPanelIndex < 7) {
    if (panelFadeAlpha < 255) {
      // 페이드인 도중 클릭하면 즉시 보이기
      panelFadeAlpha = 255;
      panelTimer = 0;
    } else {
      // 완전히 보인 상태에서 클릭하면 즉시 다음 칸으로
      nextPanel();
    }
  } else {
    // 마지막 연출이 끝났으면 게임 시작
    if (slamTimer >= 15) {
      startGameDirectly();
    }
  }
}

function startGameDirectly() {
  initGame();
  gameState = "IN_GAME";
}
