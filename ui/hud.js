// HUD — 게임 중 UI (EXP 바, 타이머, 인벤토리)

function drawUI() {
  fill(255); noStroke(); textAlign(LEFT, TOP); textSize(24);
  text(`EXP: ${floor(score)}`, 30, 110);

  let m = floor(gameFrames / 3600);
  let s = floor((gameFrames % 3600) / 60);
  textAlign(RIGHT, TOP); textSize(30); textStyle(BOLD);
  text(nf(m, 2) + ":" + nf(s, 2), width - 30, 30);
  textStyle(NORMAL);

  let gaugeW = max(300, width * 0.4); let gaugeH = 20;
  let gaugeX = width / 2; let gaugeY = 40;
  rectMode(CENTER); fill(50); rect(gaugeX, gaugeY, gaugeW, gaugeH, 10);
  let progress = score - currentLevelStartExp;
  let target = nextLevelExp - currentLevelStartExp;
  let ratio = constrain(progress / target, 0, 1);
  fill(100, 200, 255); rectMode(CORNER);
  rect(gaugeX - gaugeW / 2, gaugeY - gaugeH / 2, gaugeW * ratio, gaugeH, 10);
  textAlign(CENTER, CENTER); fill(255); textSize(16); textStyle(BOLD);
  text(`LEVEL ${level}`, gaugeX, gaugeY);
  textStyle(NORMAL);

  drawInventory();
}

function drawInventory() {
  let startX = 30; let startY = 30; let slotSize = 34; let spacing = 5;
  for (let i = 0; i < 5; i++) {
    let x = startX + i * (slotSize + spacing); let y = startY;
    fill(40, 40, 60); stroke(100); strokeWeight(2); rect(x, y, slotSize, slotSize, 5);
    if (i < player.weapons.length) {
      fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(11);
      text(player.weapons[i].name.substring(0, 3), x + slotSize / 2, y + slotSize / 2 - 2);
      fill(255, 255, 0); textSize(10);
      text(player.weapons[i].isEvolved ? "★" : player.weapons[i].level, x + slotSize - 6, y + slotSize - 6);
    }
  }
  for (let i = 0; i < 5; i++) {
    let x = startX + i * (slotSize + spacing); let y = startY + slotSize + spacing;
    fill(40, 60, 40); stroke(100); strokeWeight(2); rect(x, y, slotSize, slotSize, 5);
    if (i < player.passives.length) {
      fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(11);
      text(player.passives[i].name.substring(0, 3), x + slotSize / 2, y + slotSize / 2 - 2);
      fill(255, 255, 0); textSize(10);
      text(player.passives[i].level, x + slotSize - 6, y + slotSize - 6);
    }
  }
}
