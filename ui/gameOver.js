// 게임 오버 & 게임 클리어 화면

let lastState = "";
let endScreenFrameCount = 0;

function checkStateReset() {
  if (gameState !== lastState) {
    endScreenFrameCount = 0;
    lastState = gameState;
    if (gameState === "GAME_CLEAR") {
      initClearStory();
    }
  }
  endScreenFrameCount++;
}

function drawGameOver() {
  checkStateReset();
  
  push();
  
  // 검은색 오버레이가 서서히 페이드인 (30프레임 동안)
  let bgAlpha = map(min(30, endScreenFrameCount), 0, 30, 0, 220);
  fill(0, 0, 0, bgAlpha); rectMode(CORNER); noStroke(); rect(0, 0, width, height);

  // 스탬프가 찍히는 순간(15프레임) 화면 흔들림 효과 연출
  let shake = 0;
  if (endScreenFrameCount >= 15 && endScreenFrameCount <= 25) {
    shake = map(endScreenFrameCount, 15, 25, 15, 0);
  }
  if (shake > 0) {
    translate(random(-shake, shake), random(-shake, shake));
  }

  // 대문짝만하게 F 학점 손글씨 그리기 (스탬프 연출)
  if (gameImages.gameover_f) {
    push();
    imageMode(CENTER);
    translate(width / 2, height / 2 - 40);
    rotate(radians(-12)); // 자연스러운 느낌을 위해 살짝 기울임

    // 쾅 찍히는 연출 (1프레임부터 15프레임까지 크기 5배 -> 1배 수축)
    let progress = min(1.0, endScreenFrameCount / 15.0);
    let scaleVal = 1.0 + 4.0 * pow(1.0 - progress, 3);
    
    let baseImgSize = min(width, height) * 0.45;
    let imgSize = baseImgSize * scaleVal;
    
    // 찍히기 전에는 살짝 반투명하게 처리
    if (progress < 1.0) {
      tint(255, 255, 255, progress * 255);
    }
    
    image(gameImages.gameover_f, 0, 0, imgSize, imgSize);
    pop();
  }

  // 스탬프가 쾅 찍힌 직후부터 나머지 텍스트와 UI가 나타나도록 페이드인 (15프레임 시작)
  let textAlpha = map(constrain(endScreenFrameCount - 15, 0, 15), 0, 15, 0, 255);

  if (textAlpha > 0) {
    push();
    fill(255, 50, 50, textAlpha); textAlign(CENTER, CENTER); textSize(70); textStyle(BOLD);
    text("게임 오버", width / 2, height / 2 - 200);

    fill(255, 255, 255, textAlpha); textSize(30); text(`최종 EXP: ${floor(score)}`, width / 2, height / 2 + 80);

    let btnX = width / 2; let btnY = height / 2 + 160; let btnW = 250; let btnH = 60;
    rectMode(CENTER);
    if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 && mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) {
      fill(100, 100, 150, textAlpha); cursor(HAND);
    } else fill(70, 70, 100, textAlpha);
    stroke(255, textAlpha); strokeWeight(2); rect(btnX, btnY, btnW, btnH, 15);
    fill(255, textAlpha); noStroke(); textSize(24); text("로비로", btnX, btnY);
    pop();
  }
  
  pop();
}

// 클리어 스토리 만화 연출 화면
const CLEAR_PANELS = [
  { sx: 0, sy: 0, sw: 415, sh: 191 },        // Panel 1: Breathing student
  { sx: 415, sy: 0, sw: 321, sh: 191 },      // Panel 2: Professor says 수고하셨습니다
  { sx: 736, sy: 0, sw: 288, sh: 191 },      // Panel 3: Student asking about grade
  { sx: 0, sy: 191, sw: 300, sh: 157 },      // Panel 4: Professor says 성적은.. ㅇ..
  { sx: 300, sy: 191, sw: 350, sh: 157 },    // Panel 5: Student shock ㅇ..에이???
  { sx: 650, sy: 191, sw: 374, sh: 157 },    // Panel 6: Professor rage
  { sx: 0, sy: 348, sw: 395, sh: 143 },      // Panel 7: Student shock 에에에에이?
  { sx: 395, sy: 348, sw: 325, sh: 143 },    // Panel 8: Dream wake up 아.... 꿈
  { sx: 720, sy: 348, sw: 304, sh: 143 },    // Panel 9: Alarm clock 기말고사
  { sx: 0, sy: 491, sw: 415, sh: 191 },      // Panel 10: Student screaming
  { sx: 415, sy: 491, sw: 609, sh: 191 }     // Panel 11: Slam panel (아텍 기말고사 화이팅!!)
];

let currentClearPanelIndex = 0;
let clearPanelFadeAlpha = 0;
let clearPanelTimer = 0;
let clearSlamTimer = 0;
let clearShake = 0;

function initClearStory() {
  currentClearPanelIndex = 0;
  clearPanelFadeAlpha = 0;
  clearPanelTimer = 0;
  clearSlamTimer = 0;
  clearShake = 0;
}

function nextClearPanel() {
  if (currentClearPanelIndex < 10) {
    currentClearPanelIndex++;
    clearPanelFadeAlpha = 0;
    clearPanelTimer = 0;
  }
}

function handleClearStoryClick() {
  // 만화 진행 클릭 핸들링
  if (currentClearPanelIndex < 10) {
    if (clearPanelFadeAlpha < 255) {
      // 페이드인 도중 클릭하면 즉시 보이기
      clearPanelFadeAlpha = 255;
      clearPanelTimer = 0;
    } else {
      // 완전히 보인 상태에서 클릭하면 즉시 다음 칸으로
      nextClearPanel();
    }
  } else {
    // 마지막 연출이 끝났으면 로비로 갈 수 있는 버튼 클릭 처리
    if (clearSlamTimer >= 15) {
      let btnX = width / 2 + 220; let btnY = height - 70; let btnW = 180; let btnH = 50;
      if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 && mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) {
        gameState = "LOBBY";
      }
    }
  }
}

function drawGameClear() {
  checkStateReset();
  
  // 1. 연출 진행 및 타이머 업데이트
  if (currentClearPanelIndex < 10) {
    // 0~9번 만화 칸: 서서히 페이드인
    if (clearPanelFadeAlpha < 255) {
      clearPanelFadeAlpha += 12; // 약 0.35초 동안 페이드인
      if (clearPanelFadeAlpha >= 255) {
        clearPanelFadeAlpha = 255;
      }
    } else {
      clearPanelTimer++;
      if (clearPanelTimer >= 90) { // 1.5초 유지 후 자동 전환
        nextClearPanel();
      }
    }
  } else {
    // 마지막 10번 칸: 쾅 떨어지는 스탬프 연출
    clearSlamTimer++;
    if (clearSlamTimer === 15) {
      clearShake = 15; // 쾅 떨어지는 시점에 화면 흔들림 작동
    }
    if (clearShake > 0) {
      clearShake -= 1.0;
    }
  }

  // 2. 배경 드로잉 및 화면 흔들림 적용
  push();
  background(15, 15, 25);
  
  if (clearShake > 0) {
    translate(random(-clearShake, clearShake), random(-clearShake, clearShake));
  }

  // 화면 크기에 맞게 만화책 스케일 및 센터링 계산 (1024x682 원본 기준)
  let scaleVal = min(width / 1024, height / 682) * 0.92;
  let startX = (width - 1024 * scaleVal) / 2;
  let startY = (height - 682 * scaleVal) / 2;

  // 3. 만화 칸 렌더링
  if (gameImages.clear_comic) {
    for (let i = 0; i <= currentClearPanelIndex; i++) {
      let p = CLEAR_PANELS[i];
      let dx = startX + p.sx * scaleVal;
      let dy = startY + p.sy * scaleVal;
      let dw = p.sw * scaleVal;
      let dh = p.sh * scaleVal;

      if (i < currentClearPanelIndex) {
        push();
        tint(255);
        image(gameImages.clear_comic, dx, dy, dw, dh, p.sx, p.sy, p.sw, p.sh);
        pop();
      } else {
        if (i < 10) {
          push();
          tint(255, clearPanelFadeAlpha);
          image(gameImages.clear_comic, dx, dy, dw, dh, p.sx, p.sy, p.sw, p.sh);
          pop();
        } else {
          // 마지막 칸: 쾅 떨어지는 연출
          let cx = dx + dw / 2;
          let cy = dy + dh / 2;
          
          let progress = min(1.0, clearSlamTimer / 15.0);
          let s = 1.0 + 4.0 * pow(1.0 - progress, 3); // 5배 크기에서 쾅 떨어짐
          
          push();
          translate(cx, cy);
          scale(s);
          imageMode(CENTER);
          tint(255, progress * 255);
          image(gameImages.clear_comic, 0, 0, dw, dh, p.sx, p.sy, p.sw, p.sh);
          pop();
        }
      }
    }
  }

  pop();

  // 4. 마지막 연출 완료 시 GAME CLEAR 정보와 로비로 이동 버튼 렌더링
  if (currentClearPanelIndex === 10 && clearSlamTimer >= 15) {
    // 쾅 찍힌 후 페이드인 효과를 위한 알파 계산
    let textAlpha = map(constrain(clearSlamTimer - 15, 0, 15), 0, 15, 0, 255);
    if (textAlpha > 0) {
      push();
      // 글자 가독성을 위해 어두운 반투명 박스 그리기
      rectMode(CENTER);
      fill(0, 0, 0, map(textAlpha, 0, 255, 0, 150));
      noStroke();
      rect(width / 2, height - 70, 700, 100, 15);

      fill(255, 215, 0, textAlpha); textAlign(CENTER, CENTER); textSize(32); textStyle(BOLD);
      text(`🏆 GAME CLEAR! 🏆 최종 EXP: ${floor(score)}`, width / 2 - 120, height - 70);

      // 로비로 버튼
      let btnX = width / 2 + 220; let btnY = height - 70; let btnW = 180; let btnH = 50;
      if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 && mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) {
        fill(100, 255, 100, textAlpha); cursor(HAND);
      } else fill(50, 200, 50, textAlpha);
      stroke(255, textAlpha); strokeWeight(2); rect(btnX, btnY, btnW, btnH, 12);
      fill(255, textAlpha); noStroke(); textSize(20); textStyle(BOLD); text("로비로", btnX, btnY);
      pop();
    }
  } else {
    // 하단 가이드 텍스트
    push();
    textAlign(CENTER, CENTER);
    fill(200, 200, 200, 180);
    textSize(14);
    text("화면을 클릭하면 더 빠르게 넘길 수 있습니다.", width / 2, height - 35);
    pop();
  }
}


