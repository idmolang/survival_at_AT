// 레벨업 선택 화면

function levelUp() {
  currentLevelStartExp = nextLevelExp;
  level++;
  if (level <= 15) nextLevelExp += 50 + level * 20;
  else nextLevelExp += 150 + level * 100;

  let pool = [];

  for (let info of WEAPONS_INFO) {
    let existing = player.weapons.find(w => w instanceof info.class);
    if (existing) {
      if (existing.level < 5) {
        pool.push({ type: 'weapon', info: info, isUpgrade: true, isEvo: false, existing: existing });
      } else if (existing.level === 5 && !existing.isEvolved) {
        if (player.hasPassive(info.passiveInfo)) {
          pool.push({ type: 'weapon', info: info, isUpgrade: true, isEvo: true, existing: existing });
        }
      }
    } else {
      if (player.weapons.length < 5) pool.push({ type: 'weapon', info: info, isUpgrade: false, isEvo: false });
    }
  }

  for (let info of PASSIVES_INFO) {
    let existing = player.passives.find(p => p.id === info.id);
    if (existing) {
      if (existing.level < 5) pool.push({ type: 'passive', info: info, isUpgrade: true, isEvo: false, existing: existing });
    } else {
      if (player.passives.length < 5) pool.push({ type: 'passive', info: info, isUpgrade: false, isEvo: false });
    }
  }

  skillChoices = [];
  while (skillChoices.length < 3 && pool.length > 0) {
    let idx = floor(random(pool.length));
    skillChoices.push(pool[idx]);
    pool.splice(idx, 1);
  }

  if (skillChoices.length > 0) gameState = "LEVEL_UP";
}

function drawLevelUp() {
  push();
  fill(0, 0, 0, 150); rectMode(CORNER); noStroke(); rect(0, 0, width, height);
  fill(255); textAlign(CENTER, CENTER); textSize(50); textStyle(BOLD);
  text("레벨 업!", width / 2, height / 4);
  textSize(24); textStyle(NORMAL); text("능력을 선택하세요:", width / 2, height / 4 + 60);

  let cardW = 280; let cardH = 350; let spacing = 40;
  let startX = width / 2 - cardW - spacing; let startY = height / 2 + 50;

  rectMode(CENTER);
  for (let i = 0; i < skillChoices.length; i++) {
    let choice = skillChoices[i];
    let cx = startX + i * (cardW + spacing); let cy = startY;
    let isHover = mouseX > cx - cardW / 2 && mouseX < cx + cardW / 2 && mouseY > cy - cardH / 2 && mouseY < cy + cardH / 2;

    if (isHover) { fill(80, 80, 100); cursor(HAND); } else { fill(50, 50, 70); }
    if (choice.isEvo) { stroke(255, 100, 100); fill(isHover ? color(100, 60, 60) : color(80, 40, 40)); }
    else { stroke(255, 215, 0); }

    strokeWeight(isHover ? 4 : 2); rect(cx, cy, cardW, cardH, 20); noStroke();

    if (choice.isEvo) {
      fill(255, 100, 100); textSize(20); textStyle(BOLD); text("★ 궁극기 진화 ★", cx, cy - cardH / 2 + 40);
    } else {
      fill(choice.isUpgrade ? color(100, 255, 100) : color(255, 255, 100));
      textSize(20); textStyle(BOLD); text(choice.isUpgrade ? "레벨 업" : "신규 획득", cx, cy - cardH / 2 + 40);
    }

    fill(255); textSize(24); text(choice.info.name, cx, cy - cardH / 2 + 80);
    fill(200); textSize(16); textStyle(NORMAL);

    rectMode(CENTER);
    if (choice.type === 'weapon') {
      if (choice.isEvo) {
        text(choice.info.class.EVO_DATA.desc, cx, cy + 20, cardW - 20, 100);
      } else if (choice.isUpgrade) {
        text(`Level: ${choice.existing.level} -> ${choice.existing.level + 1}`, cx, cy);
        text(choice.info.class.LEVEL_DATA[choice.existing.level].desc, cx, cy + 50, cardW - 20, 100);
      } else {
        text("새로운 무기", cx, cy);
        text(choice.info.class.LEVEL_DATA[0].desc, cx, cy + 50, cardW - 20, 100);
      }
      fill(150, 200, 255); text(`필요 패시브: ${choice.info.passiveInfo}`, cx, cy + 130);
    } else {
      text(choice.isUpgrade ? `Level: ${choice.existing.level} -> ${choice.existing.level + 1}` : "새로운 패시브", cx, cy);
      text("관련 능력치 상승", cx, cy + 50);
    }
  }
  pop();
}
