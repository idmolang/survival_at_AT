// 레벨업 선택 화면

function levelUp() {
  currentLevelStartExp = nextLevelExp;
  level++;
  if (level <= 15) nextLevelExp += 50 + level * 20;
  else nextLevelExp += 150 + level * 100;

  generateSkillChoices();

  if (skillChoices.length > 0) gameState = "LEVEL_UP";
}

function generateSkillChoices() {
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
}

function triggerReroll() {
  generateSkillChoices();
}

function getSkillStatChanges(choice) {
  let statsList = [];
  if (choice.type === 'weapon') {
    let nextStats = null;
    let prevStats = null;
    if (choice.isEvo) {
      nextStats = choice.info.class.EVO_DATA;
      prevStats = choice.info.class.LEVEL_DATA[4];
    } else if (choice.isUpgrade) {
      let lvl = choice.existing.level; // current level (1 to 4)
      nextStats = choice.info.class.LEVEL_DATA[lvl]; // index lvl is lvl+1
      prevStats = choice.info.class.LEVEL_DATA[lvl - 1];
    } else {
      nextStats = choice.info.class.LEVEL_DATA[0];
    }

    if (nextStats) {
      if (prevStats) {
        // Compare differences for upgrades
        if (nextStats.dmg > prevStats.dmg) {
          statsList.push(`⚔️ 데미지 +${nextStats.dmg - prevStats.dmg}`);
        }
        if (nextStats.proj && prevStats.proj && nextStats.proj > prevStats.proj) {
          statsList.push(`✏️ 발사체 +${nextStats.proj - prevStats.proj}`);
        }
        if (nextStats.area && prevStats.area && nextStats.area > prevStats.area) {
          let diffPct = Math.round((nextStats.area - prevStats.area) * 100);
          statsList.push(`🎯 범위 +${diffPct}%`);
        }
        if (nextStats.cd && prevStats.cd && nextStats.cd < prevStats.cd) {
          let cdPct = Math.round((prevStats.cd - nextStats.cd) / prevStats.cd * 100);
          statsList.push(`⏱ 쿨타임 -${cdPct}%`);
        }
        if (nextStats.dur && prevStats.dur && nextStats.dur > prevStats.dur) {
          let seconds = (nextStats.dur - prevStats.dur) / 60;
          statsList.push(`⏱ 지속시간 +${seconds.toFixed(0)}초`);
        }
        if (nextStats.pierce && prevStats.pierce && nextStats.pierce > prevStats.pierce) {
          statsList.push(`🌀 관통력 +${nextStats.pierce - prevStats.pierce}`);
        }
      } else {
        // New weapon: display key base attributes
        statsList.push(`⚔️ 기본 데미지: ${nextStats.dmg}`);
        if (nextStats.proj && nextStats.proj > 1) {
          statsList.push(`✏️ 발사체 수: ${nextStats.proj}`);
        }
        if (nextStats.area && nextStats.area !== 1.0) {
          statsList.push(`🎯 기본 범위: ×${nextStats.area.toFixed(1)}`);
        }
        if (nextStats.cd) {
          statsList.push(`⏱ 쿨타임: ${(nextStats.cd / 60).toFixed(1)}초`);
        }
      }
    }
    
    // Fallback: If no stat changes were recorded, use raw desc
    if (statsList.length === 0 && nextStats) {
      statsList.push(nextStats.desc);
    }
  } else {
    // Passive skill
    let descIdx = choice.isUpgrade ? choice.existing.level : 0;
    let rawDesc = (choice.info.desc && choice.info.desc[descIdx]) ? choice.info.desc[descIdx] : "능력치 상승";
    
    // Format description text
    let cleaned = rawDesc;
    cleaned = cleaned.replace("공격력이", "공격력");
    cleaned = cleaned.replace("스킬 지속시간이", "지속시간");
    cleaned = cleaned.replace("이동속도가", "이동속도");
    cleaned = cleaned.replace("범위가", "범위");
    cleaned = cleaned.replace("쿨타임이", "쿨타임");
    cleaned = cleaned.replace("최대 체력이", "최대 체력");
    cleaned = cleaned.replace("방어력이", "방어력");
    cleaned = cleaned.replace("획득 경험치가", "경험치");
    cleaned = cleaned.replace("초당 체력 재생량이", "체력 재생");
    
    cleaned = cleaned.replace("증가합니다.", "");
    cleaned = cleaned.replace("증가합니다!", "");
    cleaned = cleaned.replace("감소합니다.", "");
    cleaned = cleaned.replace("감소합니다!", "");
    cleaned = cleaned.replace("증가", "");
    cleaned = cleaned.replace("감소", "");
    cleaned = cleaned.trim();
    
    let prefix = "✦";
    if (rawDesc.includes("공격력") || rawDesc.includes("데미지")) prefix = "⚔️";
    else if (rawDesc.includes("지속시간") || rawDesc.includes("쿨타임") || rawDesc.includes("재생")) prefix = "⏱";
    else if (rawDesc.includes("속도")) prefix = "👟";
    else if (rawDesc.includes("범위")) prefix = "🎯";
    else if (rawDesc.includes("체력")) prefix = "❤️";
    else if (rawDesc.includes("방어") || rawDesc.includes("가호")) prefix = "🛡";
    else if (rawDesc.includes("경험치")) prefix = "✨";
    
    let sign = rawDesc.includes("감소") ? "-" : "+";
    let match = cleaned.match(/(\d+%?|\d+\.\d+)/);
    if (match) {
      let val = match[0];
      let label = cleaned.replace(val, "").trim();
      statsList.push(`${prefix} ${label} ${sign}${val}`);
    } else {
      statsList.push(`${prefix} ${cleaned}`);
    }
  }
  return statsList;
}

function drawLevelUp() {
  push();

  // ── 배경 다크 오버레이 ──
  noStroke();
  fill(0, 0, 0, 160); // 반투명 배경
  rectMode(CORNER);
  rect(0, 0, width, height);

  let cardW = 300;
  let cardH = 460;
  let spacing = 32;
  let totalW = skillChoices.length * cardW + (skillChoices.length - 1) * spacing;
  let startX = width / 2 - totalW / 2 + cardW / 2;
  let cy = height / 2 - 15; // slightly move up to leave room for tray

  // ── 타이틀 ──
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  
  // Gold color
  fill(255, 215, 60);
  textSize(48);
  text("«  레벨 업!  »", width / 2, cy - cardH / 2 - 80);
  
  // Subtitle
  textSize(16);
  textStyle(NORMAL);
  fill(160, 200, 255, 210);
  text("능력을 선택하세요", width / 2, cy - cardH / 2 - 38);

  rectMode(CENTER);

  for (let i = 0; i < skillChoices.length; i++) {
    let choice = skillChoices[i];
    let cx = startX + i * (cardW + spacing);
    let isHover = mouseX > cx - cardW / 2 && mouseX < cx + cardW / 2 &&
      mouseY > cy - cardH / 2 && mouseY < cy + cardH / 2;
    let isWeapon = choice.type === 'weapon';
    let isEvo = choice.isEvo;
    let topY = cy - cardH / 2;

    // 카드 테마 색상 (R, G, B) mapping
    let themeR, themeG, themeB;
    if (isEvo) {
      [themeR, themeG, themeB] = [255, 80, 80]; // Red
    } else if (choice.isUpgrade) {
      [themeR, themeG, themeB] = [0, 230, 90]; // Green
    } else if (isWeapon) {
      [themeR, themeG, themeB] = [45, 120, 255]; // Blue (New Weapon)
    } else {
      [themeR, themeG, themeB] = [160, 80, 255]; // Purple (New Passive)
    }

    // ── 카드 그림자 & 네온 글로우 ──
    push();
    if (isHover) {
      drawingContext.shadowColor = `rgba(${themeR}, ${themeG}, ${themeB}, 0.65)`;
      drawingContext.shadowBlur = 35;
      drawingContext.shadowOffsetX = 0;
      drawingContext.shadowOffsetY = 6;
      cursor(HAND);
    } else {
      drawingContext.shadowColor = `rgba(${themeR}, ${themeG}, ${themeB}, 0.25)`;
      drawingContext.shadowBlur = 15;
      drawingContext.shadowOffsetX = 0;
      drawingContext.shadowOffsetY = 3;
    }

    // ── 카드 배경 ──
    noStroke();
    fill(10, 14, 25, 235); // Solid deep dark blue-black background
    rect(cx, cy, cardW, cardH, 16);
    pop();

    // ── 카드 테두리 ──
    noFill();
    stroke(themeR, themeG, themeB, isHover ? 255 : 120);
    strokeWeight(isHover ? 3.0 : 1.5);
    rect(cx, cy, cardW, cardH, 16);

    // ── 스킬 아이콘 & Glowing Rings ──
    let iconCY = topY + 95;
    
    // Draw circular aura behind icon
    noStroke();
    fill(themeR, themeG, themeB, 25);
    ellipse(cx, iconCY, 100, 100);
    
    // Concentric outline rings
    noFill();
    stroke(themeR, themeG, themeB, 50);
    strokeWeight(1);
    ellipse(cx, iconCY, 108, 108);
    
    stroke(themeR, themeG, themeB, 100);
    strokeWeight(1.5);
    // Draw rotating cyber arcs around icon
    let arcRot = frameCount * 0.025;
    arc(cx, iconCY, 90, 90, arcRot, arcRot + HALF_PI);
    arc(cx, iconCY, 90, 90, arcRot + PI, arcRot + PI + HALF_PI);

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
      image(iconImg, cx, iconCY, 70, 70);
    } else {
      // Fallback
      noStroke();
      fill(themeR, themeG, themeB, 40);
      ellipse(cx, iconCY, 70, 70);
      fill(themeR, themeG, themeB);
      textSize(28);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(isWeapon ? "⚔" : "✦", cx, iconCY + 2);
    }
    pop();

    // ── status badge (✦ NEW / ▲ UPGRADE) at top-left of the card ──
    let tagText = isEvo ? "★ EVOLVED" : choice.isUpgrade ? "▲ UPGRADE" : "✦ NEW";
    let badgeW = 95;
    let badgeH = 24;
    rectMode(CENTER);
    noStroke();
    fill(themeR, themeG, themeB, 240); // Solid pill matching color
    rect(cx - cardW / 2 + 65, topY + 30, badgeW, badgeH, 6);
    
    fill(255);
    textSize(10);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(tagText, cx - cardW / 2 + 65, topY + 29);

    // ── 스킬 이름 ──
    fill(255);
    textSize(22);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(choice.info.name, cx, topY + 185);

    // ── 5성 레벨/희귀도 별 표시 ──
    let starY = topY + 215;
    let starSpacing = 16;
    let startStarX = cx - (5 - 1) * starSpacing / 2;
    let numYellow = isEvo ? 5 : choice.isUpgrade ? (choice.existing.level + 1) : 1;
    for (let k = 0; k < 5; k++) {
      let sx = startStarX + k * starSpacing;
      if (k < numYellow) {
        fill(255, 204, 50); // Gold yellow
      } else {
        fill(60, 65, 80); // Empty gray
      }
      text("★", sx, starY);
    }

    // ── 구분선 (다이아몬드 센터) ──
    let lineY = starY + 20;
    stroke(themeR, themeG, themeB, 80);
    strokeWeight(1);
    line(cx - 90, lineY, cx + 90, lineY);
    push();
    fill(themeR, themeG, themeB, 200);
    noStroke();
    translate(cx, lineY);
    rotate(QUARTER_PI);
    rectMode(CENTER);
    rect(0, 0, 6, 6);
    pop();

    // ── 스탯 변경 내역 리스트 ──
    let statsList = getSkillStatChanges(choice);
    let startStatY = lineY + 32;
    let statSpacingY = 32;
    
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(15);
    textStyle(BOLD);
    
    // Choose tinted color for text
    fill(themeR + (255 - themeR) * 0.6, themeG + (255 - themeG) * 0.6, themeB + (255 - themeB) * 0.6);
    for (let j = 0; j < statsList.length; j++) {
      let statItem = statsList[j];
      let itemY = startStatY + j * statSpacingY;
      text(statItem, cx - 100, itemY);
    }

    // ── 패시브 요구 배지 (하단부) ──
    if (isWeapon) {
      let reqPassive = choice.info.passiveInfo;
      let pInfo = PASSIVES_INFO.find(p => p.id === reqPassive);
      let passiveName = pInfo ? pInfo.name : reqPassive;
      
      let badgeY = cy + cardH / 2 - 38;
      let badgeW = cardW - 60;
      let badgeH = 28;
      
      rectMode(CENTER);
      noFill();
      stroke(themeR, themeG, themeB, 80);
      strokeWeight(1);
      rect(cx, badgeY, badgeW, badgeH, 14);
      
      noStroke();
      fill(themeR + (255 - themeR) * 0.3, themeG + (255 - themeG) * 0.3, themeB + (255 - themeB) * 0.3, 190);
      textSize(11);
      textStyle(NORMAL);
      textAlign(CENTER, CENTER);
      text(`패시브: ${passiveName}`, cx, badgeY - 1);
    }
  }

  // ── 하단 컨트롤 안내 트레이 ──
  let trayX = width / 2;
  let trayY = cy + cardH / 2 + 50;
  let trayW = 320;
  let trayH = 36;
  
  noStroke();
  fill(10, 14, 25, 180);
  rectMode(CENTER);
  rect(trayX, trayY, trayW, trayH, 18);
  
  noFill();
  stroke(255, 255, 255, 25);
  strokeWeight(1);
  rect(trayX, trayY, trayW, trayH, 18);
  
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(13);
  textStyle(BOLD);
  
  let itemSpacing = 80;
  
  // 1. 마우스 선택
  fill(180, 200, 220);
  text("🖱  선택", trayX - itemSpacing, trayY);
  
  // 2. R 새로고침
  if (rerollCount > 0) {
    fill(255, 215, 0);
    text(`[R]  새로고침 (${rerollCount})`, trayX + itemSpacing, trayY);
  } else {
    fill(100, 110, 120);
    text("[R]  새로고침 (0)", trayX + itemSpacing, trayY);
  }

  pop();
}
