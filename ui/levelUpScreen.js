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
        pool.push({ type: 'weapon', info, isUpgrade: true, isEvo: false, existing });
      } else if (existing.level === 5 && !existing.isEvolved) {
        if (player.hasPassive(info.passiveInfo)) {
          pool.push({ type: 'weapon', info, isUpgrade: true, isEvo: true, existing });
        }
      }
    } else {
      if (player.weapons.length < 5) pool.push({ type: 'weapon', info, isUpgrade: false, isEvo: false });
    }
  }

  for (let info of PASSIVES_INFO) {
    let existing = player.passives.find(p => p.id === info.id);
    if (existing) {
      if (existing.level < 5) pool.push({ type: 'passive', info, isUpgrade: true, isEvo: false, existing });
    } else {
      if (player.passives.length < 5) pool.push({ type: 'passive', info, isUpgrade: false, isEvo: false });
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

  // ── 배경 다크 오버레이 ──
  noStroke();
  fill(0, 0, 0, 130); // 반투명 배경 (이전 175에서 130으로 투명도 상향)
  rectMode(CORNER);
  rect(0, 0, width, height);

  let cardW = 300;  // 기존 262 -> 300 (더 크게)
  let cardH = 460;  // 기존 400 -> 460 (더 크게)
  let spacing = 32;
  let totalW = skillChoices.length * cardW + (skillChoices.length - 1) * spacing;
  let startX = width / 2 - totalW / 2 + cardW / 2;
  let cy = height / 2 + 35;

  // ── 타이틀 ──
  // 카드 상단에서 고정된 오프셋으로 설정하여 절대 겹치지 않게 변경
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(46);
  fill(255, 220, 60);
  text("레벨 업!", width / 2, cy - cardH / 2 - 75);
  textSize(16);
  textStyle(NORMAL);
  fill(180, 210, 255, 190);
  text("능력을 선택하세요", width / 2, cy - cardH / 2 - 35);

  rectMode(CENTER);

  for (let i = 0; i < skillChoices.length; i++) {
    let choice = skillChoices[i];
    let cx = startX + i * (cardW + spacing);
    let isHover = mouseX > cx - cardW / 2 && mouseX < cx + cardW / 2 &&
      mouseY > cy - cardH / 2 && mouseY < cy + cardH / 2;
    let isWeapon = choice.type === 'weapon';
    let isEvo = choice.isEvo;
    let topY = cy - cardH / 2;

    // 카드 테마 색상
    let borderR, borderG, borderB;
    let bgTopR, bgTopG, bgTopB;
    let bgBotR, bgBotG, bgBotB;

    if (isEvo) {
      [borderR, borderG, borderB] = [255, 80, 80];
      [bgTopR, bgTopG, bgTopB] = [50, 12, 12];
      [bgBotR, bgBotG, bgBotB] = [70, 22, 22];
    } else if (isWeapon) {
      [borderR, borderG, borderB] = [255, 200, 50];
      [bgTopR, bgTopG, bgTopB] = [14, 28, 56];
      [bgBotR, bgBotG, bgBotB] = [22, 44, 88];
    } else {
      [borderR, borderG, borderB] = [140, 170, 255];
      [bgTopR, bgTopG, bgTopB] = [22, 22, 58];
      [bgBotR, bgBotG, bgBotB] = [30, 30, 78];
    }

    // 호버 시 배경 하이라이트
    let hoverBright = isHover ? 15 : 0;
    let currentBgBotR = Math.min(255, bgBotR + hoverBright);
    let currentBgBotG = Math.min(255, bgBotG + hoverBright);
    let currentBgBotB = Math.min(255, bgBotB + hoverBright);

    let currentBgTopR = Math.min(255, bgTopR + hoverBright);
    let currentBgTopG = Math.min(255, bgTopG + hoverBright);
    let currentBgTopB = Math.min(255, bgTopB + hoverBright);

    // ── 카드 그림자 (호버 시 강조) ──
    // push/pop으로 감싸서 글자 렌더링 영역까지 그림자 잔상이 겹쳐 가독성을 떨어뜨리는 현상 방지
    push();
    if (isHover) {
      drawingContext.shadowColor = `rgba(${borderR},${borderG},${borderB},0.55)`;
      drawingContext.shadowBlur = 30;
      drawingContext.shadowOffsetX = 0;
      drawingContext.shadowOffsetY = 6;
    }

    // ── 카드 배경 (하단부) ──
    noStroke();
    fill(currentBgBotR, currentBgBotG, currentBgBotB);
    rect(cx, cy, cardW, cardH, 18);
    pop(); // 배경 그리자마자 shadow 끄기

    // ── 카드 배경 (상단 다크 섹션) ──
    noStroke();
    fill(currentBgTopR, currentBgTopG, currentBgTopB);
    rect(cx, topY + 105, cardW, 210, 18, 18, 0, 0);

    // ── 카드 테두리 ──
    noFill();
    stroke(borderR, borderG, borderB, isHover ? 240 : 160);
    strokeWeight(isHover ? 2.5 : 1.8);
    rect(cx, cy, cardW, cardH, 18);

    // ── 상단 강조 라인 ──
    stroke(borderR, borderG, borderB, 200);
    strokeWeight(2);
    line(cx - cardW / 2 + 24, topY + 1,
      cx + cardW / 2 - 24, topY + 1);

    // ── 스킬 아이콘 단독 출력 ──
    let iconCY = topY + 75;
    let iconImg = null;
    if (isWeapon) {
      let iconKey = choice.info.icon;
      iconImg = (iconKey && gameImages.skill_icons) ? gameImages.skill_icons[iconKey] : null;
    } else {
      iconImg = (gameImages.passive_icons) ? gameImages.passive_icons[choice.info.id] : null;
    }

    push();
    imageMode(CENTER);
    if (iconImg) {
      noTint();
      image(iconImg, cx, iconCY, 72, 72);
    } else {
      // 폴백 기호: 깔끔한 원형 배경 위에 기호 출력
      noStroke();
      fill(borderR, borderG, borderB, 35);
      ellipse(cx, iconCY, 72, 72);

      fill(borderR, borderG, borderB);
      textSize(32);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(isWeapon ? "⚔" : "✦", cx, iconCY + 2);
    }
    pop();

    // ── 배지 (신규/레벨업/진화) ──
    let badgeText = isEvo ? "★ 궁극기 진화" :
      choice.isUpgrade ? "▲ 레벨 업" :
        "✦ 신규 획득";
    let badgeR = isEvo ? 255 : choice.isUpgrade ? 100 : 255;
    let badgeG = isEvo ? 90 : choice.isUpgrade ? 255 : 225;
    let badgeB = isEvo ? 90 : choice.isUpgrade ? 130 : 80;

    noStroke();
    fill(badgeR, badgeG, badgeB, 30);
    rect(cx, topY + 145, 130, 24, 12);
    fill(badgeR, badgeG, badgeB);
    textSize(12);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(badgeText, cx, topY + 145);

    // ── 스킬 이름 ──
    fill(255);
    textSize(21);
    textStyle(BOLD);
    text(choice.info.name, cx, topY + 180);

    // ── 구분선 ──
    stroke(255, 255, 255, 35);
    strokeWeight(1);
    line(cx - cardW / 2 + 18, topY + 200,
      cx + cardW / 2 - 18, topY + 200);

    // ── 설명 텍스트 ──
    noStroke();
    fill(205, 218, 235);
    textSize(13);
    textStyle(NORMAL);

    let descY = topY + 215;

    if (isWeapon) {
      let desc = isEvo ? choice.info.class.EVO_DATA.desc
        : choice.isUpgrade ? choice.info.class.LEVEL_DATA[choice.existing.level].desc
          : choice.info.class.LEVEL_DATA[0].desc;

      push();
      rectMode(CORNER);
      textAlign(CENTER, TOP);
      let descW = cardW - 28;
      text(desc, cx - descW / 2, descY, descW, 65);
      pop();

      // ── 스탯 박스 ──
      let statsData = isEvo ? choice.info.class.EVO_DATA
        : choice.isUpgrade ? choice.info.class.LEVEL_DATA[choice.existing.level]
          : choice.info.class.LEVEL_DATA[0];
      let statsY = topY + 285;

      noStroke();
      fill(0, 0, 0, 55);
      rect(cx, statsY + 42.5, cardW - 22, 85, 12);

      stroke(255, 255, 255, 18);
      strokeWeight(1);
      noFill();
      rect(cx, statsY + 42.5, cardW - 22, 85, 12);

      // 스탯 행
      let rows = [
        { label: "피해량", val: statsData.dmg != null ? `${statsData.dmg}` : "-" },
        { label: "쿨타임", val: statsData.cd != null ? `${(statsData.cd / 60).toFixed(1)}s` : "-" },
        { label: "범위", val: statsData.area != null ? `×${statsData.area.toFixed(1)}` : "-" },
      ];
      for (let ri = 0; ri < rows.length; ri++) {
        let ry = statsY + ri * 24 + 16;
        noStroke();
        fill(160, 185, 220);
        textSize(12);
        textStyle(NORMAL);
        textAlign(LEFT, CENTER);
        text(rows[ri].label, cx - cardW / 2 + 22, ry);
        fill(255, 228, 100);
        textStyle(BOLD);
        textAlign(RIGHT, CENTER);
        text(rows[ri].val, cx + cardW / 2 - 20, ry);
      }

      // ── 필요 패시브 ──
      textAlign(CENTER, CENTER);
      noStroke();
      fill(borderR, borderG, borderB, 50);
      rect(cx, topY + 385 + 13, cardW - 22, 26, 10);
      fill(borderR, borderG, borderB, 220);
      textSize(11);
      textStyle(NORMAL);
      text(`◆ 패시브: ${choice.info.passiveInfo}`, cx, topY + 385 + 13);

    } else {
      // ── 패시브 카드 설명 ──
      let descIdx = choice.isUpgrade ? choice.existing.level : 0;
      let descText = (choice.info.desc && choice.info.desc[descIdx])
        ? choice.info.desc[descIdx] : "관련 능력치 상승";

      push();
      rectMode(CORNER);
      textAlign(CENTER, TOP);
      let descW = cardW - 28;
      text(descText, cx - descW / 2, descY, descW, 180);
      pop();
    }
  }

  pop();
}
