// 게임 오버 & 게임 클리어 화면

let lastState = "";
let endScreenFrameCount = 0;

function checkStateReset() {
  if (gameState !== lastState) {
    endScreenFrameCount = 0;
    lastState = gameState;
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

function drawGameClear() {
  checkStateReset();
  
  push();
  
  // 흰색 오버레이가 서서히 페이드인 (30프레임 동안)
  let bgAlpha = map(min(30, endScreenFrameCount), 0, 30, 0, 220);
  fill(255, 255, 255, bgAlpha); rectMode(CORNER); noStroke(); rect(0, 0, width, height);

  // 스탬프가 찍히는 순간(15프레임) 화면 흔들림 효과 연출
  let shake = 0;
  if (endScreenFrameCount >= 15 && endScreenFrameCount <= 25) {
    shake = map(endScreenFrameCount, 15, 25, 15, 0);
  }
  if (shake > 0) {
    translate(random(-shake, shake), random(-shake, shake));
  }

  // 대문짝만하게 A+ 학점 손글씨 그리기 (스탬프 연출)
  if (gameImages.clear_a_plus) {
    push();
    imageMode(CENTER);
    translate(width / 2, height / 2 - 40);
    rotate(radians(-10)); // 자연스러운 느낌을 위해 살짝 기울임

    // 쾅 찍히는 연출 (1프레임부터 15프레임까지 크기 5배 -> 1배 수축)
    let progress = min(1.0, endScreenFrameCount / 15.0);
    let scaleVal = 1.0 + 4.0 * pow(1.0 - progress, 3);
    
    let baseImgSize = min(width, height) * 0.45;
    let imgSize = baseImgSize * scaleVal;
    
    // 찍히기 전에는 살짝 반투명하게 처리
    if (progress < 1.0) {
      tint(255, 255, 255, progress * 255);
    }
    
    image(gameImages.clear_a_plus, 0, 0, imgSize, imgSize);
    pop();
  }

  // 스탬프가 쾅 찍힌 직후부터 나머지 텍스트와 UI가 나타나도록 페이드인 (15프레임 시작)
  let textAlpha = map(constrain(endScreenFrameCount - 15, 0, 15), 0, 15, 0, 255);

  if (textAlpha > 0) {
    push();
    fill(50, 150, 255, textAlpha); textAlign(CENTER, CENTER); textSize(70); textStyle(BOLD);
    text("GAME CLEAR!", width / 2, height / 2 - 200);

    fill(50, 50, 50, textAlpha); textSize(30); text(`15분 생존! / 최종 EXP: ${floor(score)}`, width / 2, height / 2 + 80);

    let btnX = width / 2; let btnY = height / 2 + 160; let btnW = 250; let btnH = 60;
    rectMode(CENTER);
    if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 && mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) {
      fill(200, 200, 250, textAlpha); cursor(HAND);
    } else fill(230, 230, 250, textAlpha);
    stroke(100, 150, 255, textAlpha); strokeWeight(2); rect(btnX, btnY, btnW, btnH, 15);
    fill(50, 100, 200, textAlpha); noStroke(); textSize(24); text("로비로", btnX, btnY);
    pop();
  }
  
  pop();
}


