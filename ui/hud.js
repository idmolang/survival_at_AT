// HUD — 게임 중 UI (EXP 바, 타이머, 인벤토리)

function drawUI() {
  push();
  noTint();
  let m = floor(gameFrames / 3600);
  let s = floor((gameFrames % 3600) / 60);
  fill(255); // 시계 글씨는 항상 흰색 (이전 fill 값 누출 방지)
  noStroke();
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

  // ── 보스 만족도 게이지 그리기 ──
  if (bossActive && currentBoss) {
    let bossGaugeW = gaugeW + 60;
    let bossGaugeH = 24;
    let bossGaugeX = width / 2;
    let bossGaugeY = 80;

    // 게이지 뒷배경
    rectMode(CENTER);
    fill(25, 20, 30, 220);
    stroke(255, 215, 0, 120); // 황금빛 테두리
    strokeWeight(2);
    rect(bossGaugeX, bossGaugeY, bossGaugeW, bossGaugeH, 12);
    noStroke();

    // 만족도 비율 계산
    let satRatio = constrain(currentBoss.hp / currentBoss.maxHp, 0, 1);

    // 만족도 채워지는 바 (금빛 그라데이션 컬러링)
    rectMode(CORNER);
    fill(255, 195, 0); // 황금빛 만족도 수치
    rect(bossGaugeX - bossGaugeW / 2, bossGaugeY - bossGaugeH / 2, bossGaugeW * satRatio, bossGaugeH, 12);

    // 만족도 글로우 라인
    fill(255, 245, 180, 150);
    rect(bossGaugeX - bossGaugeW / 2, bossGaugeY - bossGaugeH / 2, bossGaugeW * satRatio, 4, 12);

    // 게이지 텍스트
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(13);
    textStyle(BOLD);
    text(`🎓 교수님의 학업 만족도: ${floor(satRatio * 100)}% (${floor(currentBoss.hp)} / ${currentBoss.maxHp})`, bossGaugeX, bossGaugeY);
    textStyle(NORMAL);
  }

  drawInventory();
  pop();
}

function drawInventory() {
  push(); // 드로잉 상태 저장 — stroke 등이 외부로 누출되지 않도록 방지
  let startX = 30; let startY = 30; let slotSize = 44; let spacing = 6;
  rectMode(CORNER);

  // ── 무기 슬롯 ──
  for (let i = 0; i < 5; i++) {
    let x = startX + i * (slotSize + spacing); let y = startY;
    // 슬롯 배경
    noStroke(); fill(20, 25, 45, 200);
    rect(x, y, slotSize, slotSize, 7);
    stroke(80, 100, 160); strokeWeight(1.5);
    noFill(); rect(x, y, slotSize, slotSize, 7);

    if (i < player.weapons.length) {
      let w = player.weapons[i];
      let iconKey = null;
      // weaponsInfo에서 아이콘 키 찾기
      let wInfo = WEAPONS_INFO.find(wi => w instanceof wi.class);
      if (wInfo) iconKey = wInfo.icon;
      let iconImg = (iconKey && gameImages.skill_icons) ? gameImages.skill_icons[iconKey] : null;

      if (iconImg) {
        imageMode(CORNER);
        noTint();
        image(iconImg, x + 4, y + 4, slotSize - 8, slotSize - 8);
      } else {
        fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(11);
        text(w.name.substring(0, 3), x + slotSize / 2, y + slotSize / 2 - 2);
      }
      // 레벨 배지
      noStroke();
      fill(0, 0, 0, 160); rect(x + slotSize - 16, y + slotSize - 16, 15, 14, 4);
      fill(255, 220, 60); textSize(10); textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(w.isEvolved ? "★" : w.level, x + slotSize - 8, y + slotSize - 9);
      textStyle(NORMAL);
    }
  }

  // ── 패시브 슬롯 ──
  for (let i = 0; i < 5; i++) {
    let x = startX + i * (slotSize + spacing); let y = startY + slotSize + spacing;
    // 슬롯 배경
    noStroke(); fill(20, 40, 25, 200);
    rect(x, y, slotSize, slotSize, 7);
    stroke(60, 140, 80); strokeWeight(1.5);
    noFill(); rect(x, y, slotSize, slotSize, 7);

    if (i < player.passives.length) {
      let p = player.passives[i];
      let iconImg = (gameImages.passive_icons) ? gameImages.passive_icons[p.id] : null;

      if (iconImg) {
        imageMode(CORNER);
        noTint();
        image(iconImg, x + 4, y + 4, slotSize - 8, slotSize - 8);
      } else {
        fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(11);
        text(p.name.substring(0, 3), x + slotSize / 2, y + slotSize / 2 - 2);
      }
      // 레벨 배지
      noStroke();
      fill(0, 0, 0, 160); rect(x + slotSize - 16, y + slotSize - 16, 15, 14, 4);
      fill(140, 255, 160); textSize(10); textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(p.level, x + slotSize - 8, y + slotSize - 9);
      textStyle(NORMAL);
    }
  }
  pop(); // 드로잉 상태 복원
}

