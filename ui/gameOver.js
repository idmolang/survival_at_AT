// 게임 오버 & 게임 클리어 화면

function drawGameOver() {
  push();
  fill(0, 0, 0, 200); rectMode(CORNER); noStroke(); rect(0, 0, width, height);
  fill(255, 50, 50); textAlign(CENTER, CENTER); textSize(80); textStyle(BOLD);
  text("게임 오버", width / 2, height / 3);
  fill(255); textSize(30); text(`최종 EXP: ${floor(score)}`, width / 2, height / 2);
  let btnX = width / 2; let btnY = height / 2 + 80; let btnW = 250; let btnH = 60;
  rectMode(CENTER);
  if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 && mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) {
    fill(100, 100, 150); cursor(HAND);
  } else fill(70, 70, 100);
  stroke(255); strokeWeight(2); rect(btnX, btnY, btnW, btnH, 15);
  fill(255); noStroke(); textSize(24); text("로비로", btnX, btnY);
  pop();
}

function drawGameClear() {
  push();
  fill(255, 255, 255, 200); rectMode(CORNER); noStroke(); rect(0, 0, width, height);
  fill(50, 150, 255); textAlign(CENTER, CENTER); textSize(80); textStyle(BOLD);
  text("🎉 GAME CLEAR! 🎉", width / 2, height / 3);
  fill(50); textSize(30); text(`15분 생존! / 최종 EXP: ${floor(score)}`, width / 2, height / 2 - 20);
  let btnX = width / 2; let btnY = height / 2 + 80; let btnW = 250; let btnH = 60;
  rectMode(CENTER);
  if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 && mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) {
    fill(200, 200, 250); cursor(HAND);
  } else fill(230, 230, 250);
  stroke(100, 150, 255); strokeWeight(2); rect(btnX, btnY, btnW, btnH, 15);
  fill(50, 100, 200); noStroke(); textSize(24); text("로비로", btnX, btnY);
  pop();
}
