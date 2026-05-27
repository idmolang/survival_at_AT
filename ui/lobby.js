// 로비 & 게임방법 화면

function drawLobby() {
  background(20, 20, 30);
  fill(255); textAlign(CENTER, CENTER); textSize(80); textStyle(BOLD);
  text("아텍에서 살아남기", width / 2, height / 3);
  rectMode(CENTER); textStyle(NORMAL);

  let btns = [
    { label: "게임 시작", yOffset: 50 },
    { label: "게임 방법", yOffset: 140 },
    { label: "테스트 모드", yOffset: 230 }
  ];
  for (let b of btns) {
    let bx = width / 2; let by = height / 2 + b.yOffset; let bw = 250; let bh = 60;
    let hover = mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2;
    if (hover) { fill(80, 180, 255); cursor(HAND); } else { fill(50, 150, 255); }
    if (b.label === "테스트 모드") { if (hover) fill(200, 50, 50); else fill(150, 40, 40); }
    rect(bx, by, bw, bh, 15);
    fill(255); textSize(28); text(b.label, bx, by);
  }
}

function drawHowToPlay() {
  background(20, 20, 30);
  fill(255); textAlign(CENTER, CENTER); textSize(50); textStyle(BOLD);
  text("게임 방법", width / 2, height / 5);
  textStyle(NORMAL); textSize(24); textAlign(LEFT, TOP);
  let startX = width / 2 - 300; let startY = height / 5 + 100;
  text("- W, A, S, D 이동", startX, startY);
  text("- 적을 처치하고 보석을 먹어 레벨업", startX, startY + 40);
  text("- 최대 5개의 무기와 5개의 패시브 선택 가능", startX, startY + 80);
  text("- 무기 5레벨 + 특정 패시브 보유 시 진화 가능", startX, startY + 120);

  let backBtnX = width / 2; let backBtnY = height - 150; let backBtnW = 250; let backBtnH = 60;
  rectMode(CENTER); textAlign(CENTER, CENTER);
  if (mouseX > backBtnX - backBtnW / 2 && mouseX < backBtnX + backBtnW / 2 && mouseY > backBtnY - backBtnH / 2 && mouseY < backBtnY + backBtnH / 2) {
    fill(100); cursor(HAND);
  } else fill(70);
  rect(backBtnX, backBtnY, backBtnW, backBtnH, 15);
  fill(255); textSize(28); text("돌아가기", backBtnX, backBtnY);
}

function drawTestSkillSelect() {
  background(20, 20, 30);
  fill(255); textAlign(CENTER, CENTER); textSize(40); textStyle(BOLD);
  let title = isTestModeWeaponSelect ? "테스트 모드: 무기 선택 (최대 5개)" : "테스트 모드: 패시브 선택 (최대 5개)";
  text(title, width / 2, height / 10);

  let list = isTestModeWeaponSelect ? WEAPONS_INFO : PASSIVES_INFO;
  let selectedList = isTestModeWeaponSelect ? testSelectedWeapons : testSelectedPassives;
  let cols = 5; let cardW = 180; let cardH = 150; let spacing = 20;
  let startX = width / 2 - (cardW * cols + spacing * (cols - 1)) / 2 + cardW / 2;
  let startY = height / 2 - cardH;

  for (let i = 0; i < list.length; i++) {
    let col = i % cols; let row = floor(i / cols);
    let cx = startX + col * (cardW + spacing); let cy = startY + row * (cardH + spacing);
    let isSelected = selectedList.includes(list[i]);
    let hover = mouseX > cx - cardW / 2 && mouseX < cx + cardW / 2 && mouseY > cy - cardH / 2 && mouseY < cy + cardH / 2;

    rectMode(CENTER);
    if (isSelected) { fill(100, 255, 100); stroke(255); strokeWeight(3); }
    else if (hover) { fill(80, 80, 100); cursor(HAND); }
    else { fill(50, 50, 70); noStroke(); }
    rect(cx, cy, cardW, cardH, 10); noStroke();
    fill(isSelected ? 0 : 255); textSize(16); textStyle(BOLD); text(list[i].name, cx, cy);
  }

  let btnX = width / 2; let btnY = height - 100; let btnW = 200; let btnH = 60;
  let hoverBtn = mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 && mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2;
  if (hoverBtn) { fill(200, 200, 250); cursor(HAND); } else fill(150, 150, 200);
  rect(btnX, btnY, btnW, btnH, 15);
  fill(0); textSize(24); text(isTestModeWeaponSelect ? "다음 (패시브 선택)" : "테스트 시작!", btnX, btnY);
}
