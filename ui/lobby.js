// 로비 & 게임방법 화면

const HOW_TO_PLAY_BACK_BTN = { x: 130, y: 55, w: 180, h: 40 };

function drawLobby() {
  // Use 1672x941 virtual canvas if background image is loaded (to preserve 16:9 ratio exactly),
  // otherwise fallback to 1200x800 for blackboard.
  let aspectW = gameImages.background ? 1672 : 1200;
  let aspectH = gameImages.background ? 941 : 800;
  
  let s = min(width / aspectW, height / aspectH);
  let tx = (width - aspectW * s) / 2;
  let ty = (height - aspectH * s) / 2;
  
  // Clear screen (solid dark background)
  background(15, 15, 20);
  
  push();
  translate(tx, ty);
  scale(s);
  
  if (gameImages.background) {
    imageMode(CORNER);
    image(gameImages.background, 0, 0, 1672, 941);
  } else {
    // 1. Blackboard wooden frame
    rectMode(CORNER);
    fill(120, 75, 45); // Wood border
    stroke(60, 35, 20);
    strokeWeight(6);
    rect(10, 10, 1180, 780, 12);
    
    // 2. Blackboard green board
    fill(28, 48, 36); // Blackboard dark green
    stroke(10, 20, 15);
    strokeWeight(4);
    rect(28, 28, 1144, 744, 4);
    
    // 3. Chalk dust textures / Blackboard smudge effects
    noStroke();
    fill(255, 255, 255, 2);
    for (let i = 0; i < 8; i++) {
      ellipse(200 + i * 110, 150 + (i % 3) * 120, 300, 200);
      ellipse(800 - i * 90, 550 - (i % 2) * 150, 250, 180);
    }
    
    // 4. Blackboard chalk drawings (Background doodles)
    strokeWeight(1.5);
    // Math & Code equations (Yellow & White chalk)
    stroke(255, 255, 255, 50);
    noFill();
    // Left side doodles
    textStyle(ITALIC);
    textSize(14);
    text("x^2 + y^2 = r^2", 80, 80);
    text("f(x) = sin(x)", 90, 110);
    line(85, 140, 180, 140);
    line(130, 120, 130, 180);
    
    // Draw sine curve sketch
    beginShape();
    for (let sx = 0; sx < 80; sx++) {
      let sy = sin(sx * 0.15) * 20;
      vertex(90 + sx, 150 + sy);
    }
    endShape();
    
    // Eraser drawing on left ledge
    fill(160, 130, 95, 100);
    stroke(255, 255, 255, 80);
    rect(80, 700, 70, 22, 4);
    fill(50, 50, 50, 150);
    rect(80, 722, 70, 10, 2);
    
    // Right side doodles
    stroke(255, 230, 100, 50); // Yellow chalk
    text("FINAL EXAM", 1000, 90);
    rect(990, 70, 120, 150);
    line(1005, 120, 1095, 120);
    line(1005, 140, 1095, 140);
    line(1005, 160, 1065, 160);
    
    // Angry book doodles in the background
    stroke(255, 120, 120, 40); // Red chalk
    rect(150, 320, 55, 65, 4);
    line(150, 385, 205, 385);
    // Angry eyes
    line(165, 345, 175, 350);
    line(195, 345, 185, 350);
    
    // 5. Title & Subtitle
    textStyle(NORMAL);
    textAlign(CENTER, TOP);
    // Main title "아텍에서 살아남기" with handdrawn look
    textSize(74);
    // Draw title twice with slight offset for chalk vibration effect
    fill(255, 255, 255, 180);
    noStroke();
    text("아텍에서 살아남기", 600, 60);
    fill(255, 255, 255, 90);
    text("아텍에서 살아남기", 601.5, 61.5);
    
    // Subtitle "SURVIVAL AT ARTECH"
    textSize(22);
    fill(255, 230, 100, 200); // Yellow chalk
    text("SURVIVAL AT ARTECH", 600, 150);
    
    // 6. Draw Professor & Angry books in the center
    if (gameImages.professor) {
      // Center professor mockup image
      imageMode(CENTER);
      
      // Draw a chalk circle behind the professor
      stroke(100, 200, 255, 100); // Light blue chalk
      strokeWeight(3);
      noFill();
      ellipse(600, 340, 280, 280);
      
      // Draw the professor image
      image(gameImages.professor, 600, 340, 150, 220);
      
      // Draw angry books surrounding the professor (mimicking mockup book placements)
      // Book 1: left middle
      drawChalkBook(460, 300, 55, 65, color(180, 40, 40));
      // Book 2: left top
      drawChalkBook(500, 220, 50, 60, color(60, 60, 80));
      // Book 3: right top
      drawChalkBook(700, 220, 55, 65, color(150, 90, 40));
      // Book 4: right middle
      drawChalkBook(740, 310, 50, 60, color(120, 50, 140));
      
      // Little pencil & eraser drawings around professor
      drawChalkPencil(440, 400, 45); // Left pencil
      drawChalkEraser(730, 400, -30); // Right eraser
    }
  }
  
  // Map mouse coordinates to virtual coordinate system
  let lx = (mouseX - tx) / s;
  let ly = (mouseY - ty) / s;
  
  let hoverBtn = "";
  if (gameImages.background) {
    if (lx >= 613 && lx <= 1058 && ly >= 623 && ly <= 693) {
      hoverBtn = "START_GAME";
    } else if (lx >= 613 && lx <= 1058 && ly >= 723 && ly <= 793) {
      hoverBtn = "HOW_TO_PLAY";
    }
  } else {
    if (lx >= 440 && lx <= 760 && ly >= 530 && ly <= 590) {
      hoverBtn = "START_GAME";
    } else if (lx >= 440 && lx <= 760 && ly >= 615 && ly <= 675) {
      hoverBtn = "HOW_TO_PLAY";
    } else if (lx >= 960 && lx <= 1140 && ly >= 682 && ly <= 738) {
      hoverBtn = "EXIT";
    }
  }
  
  // 7. Render Buttons
  if (gameImages.background) {
    drawLobbyButton(613, 623, 445, 70, "게임 시작", "START GAME", hoverBtn === "START_GAME", "play");
    drawLobbyButton(613, 723, 445, 70, "게임 방법", "HOW TO PLAY", hoverBtn === "HOW_TO_PLAY", "book");
  } else {
    drawLobbyButton(440, 530, 320, 60, "게임 시작", "START GAME", hoverBtn === "START_GAME", "play");
    drawLobbyButton(440, 615, 320, 60, "게임 방법", "HOW TO PLAY", hoverBtn === "HOW_TO_PLAY", "book");
    drawLobbyButton(960, 682, 180, 56, "게임 종료", "EXIT", hoverBtn === "EXIT", "exit");
  }
  
  // Hover cursor change
  if (hoverBtn !== "" && !showAdminModal && !showPasswordInput) {
    cursor(HAND);
  }
  
  pop(); // Exit 1200x800 coordinate scale
  
  // 8. Modals (Drawn outside scaling to ensure crisp text/overlay resolution)
  if (showAdminModal) {
    drawAdminModal();
  }
  
  if (showPasswordInput) {
    drawPasswordInputModal();
  }
}

function drawChalkBook(x, y, w, h, col) {
  push();
  rectMode(CENTER);
  // Drawing chalk style border
  stroke(255, 255, 255, 180);
  strokeWeight(2);
  fill(red(col), green(col), blue(col), 200);
  rect(x, y, w, h, 6);
  
  // Spiral notebook rings
  stroke(220, 220, 220, 220);
  strokeWeight(2);
  for (let ry = y - h/2 + 8; ry < y + h/2; ry += 12) {
    line(x - w/2 - 4, ry, x - w/2 + 2, ry);
  }
  
  // Angry eyes
  stroke(255);
  strokeWeight(2);
  line(x - 12, y - 8, x - 4, y - 3);
  line(x + 12, y - 8, x + 4, y - 3);
  
  // Angry mouth
  line(x - 6, y + 8, x + 6, y + 8);
  pop();
}

function drawChalkPencil(x, y, angle) {
  push();
  translate(x, y);
  rotate(radians(angle));
  rectMode(CENTER);
  
  // Pencil body
  stroke(255, 255, 255, 180);
  strokeWeight(1.5);
  fill(255, 215, 0, 200); // Yellow pencil
  rect(0, 0, 10, 40, 2);
  
  // Tip
  fill(220, 190, 160, 200);
  triangle(-5, -20, 5, -20, 0, -32);
  fill(50, 50, 50, 220);
  triangle(-2, -27, 2, -27, 0, -32);
  
  // Eraser end
  fill(240, 140, 140, 220);
  rect(0, 21, 10, 6, 2);
  pop();
}

function drawChalkEraser(x, y, angle) {
  push();
  translate(x, y);
  rotate(radians(angle));
  rectMode(CENTER);
  
  stroke(255, 255, 255, 180);
  strokeWeight(1.5);
  
  // Eraser body
  fill(160, 130, 95, 200); // Cardboard sleeve
  rect(0, 0, 20, 30, 2);
  
  // Exposed eraser part (top and bottom)
  fill(80, 180, 255, 200); // Blue eraser
  rect(0, -17, 20, 8, 2);
  pop();
}

function drawLobbyButton(x, y, w, h, label, sublabel, hover, iconType) {
  if (gameImages.background) {
    push();
    rectMode(CORNER);
    
    // 1. Hover outer glow
    if (hover) {
      noFill();
      stroke(255, 215, 0, 60);
      strokeWeight(6);
      rect(x - 2, y - 2, w + 4, h + 4, 12);
    }
    
    // 2. Button Background (Dark slate green matching screenshot)
    if (hover) {
      fill(30, 45, 38, 240); // slightly warmer dark green/gold tint
      stroke(255, 215, 0, 220); // Gold border
      strokeWeight(2.5);
    } else {
      fill(16, 26, 22, 210); // Translucent blackboard dark green/gray
      stroke(90, 110, 100, 180); // Thin grayish-green border
      strokeWeight(2);
    }
    rect(x, y, w, h, 10);
    
    // 3. Render Label centered inside the button (no sublabels or icons)
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(26);
    textStyle(BOLD);
    if (hover) {
      fill(255, 215, 0); // bright gold
    } else {
      fill(245, 195, 95); // warm chalk gold/yellow
    }
    text(label, x + w / 2, y + h / 2 - 2);
    
    pop();
    return;
  }

  push();
  rectMode(CORNER);
  
  // Double-border chalk look
  noFill();
  if (hover) {
    fill(255, 215, 0, 25); // Subtle gold fill on hover
    stroke(255, 215, 0, 220); // Gold border on hover
  } else {
    stroke(255, 255, 255, 150); // White border
  }
  
  // Outer border
  strokeWeight(2.5);
  rect(x, y, w, h, 12);
  
  // Inner border (slightly offset for handdrawn sketch feel)
  strokeWeight(1);
  if (hover) {
    stroke(255, 215, 0, 120);
  } else {
    stroke(255, 255, 255, 70);
  }
  rect(x + 3, y + 3, w - 6, h - 6, 10);
  
  // Draw Icons
  push();
  strokeWeight(2.5);
  noFill();
  if (hover) stroke(255, 215, 0, 220);
  else stroke(255, 255, 255, 180);
  
  if (iconType === "play") {
    // Shield icon
    beginShape();
    vertex(x + 25, y + 15);
    vertex(x + 45, y + 15);
    vertex(x + 45, y + 30);
    vertex(x + 35, y + 42);
    vertex(x + 25, y + 30);
    endShape(CLOSE);
    line(x + 30, y + 27, x + 34, y + 33);
    line(x + 34, y + 33, x + 41, y + 21);
  } else if (iconType === "book") {
    // Book icon (open pages)
    beginShape();
    vertex(x + 22, y + 36);
    vertex(x + 22, y + 22);
    vertex(x + 34, y + 25);
    vertex(x + 46, y + 22);
    vertex(x + 46, y + 36);
    endShape();
    line(x + 34, y + 25, x + 34, y + 39);
    beginShape();
    vertex(x + 22, y + 36);
    vertex(x + 34, y + 39);
    vertex(x + 46, y + 36);
    endShape();
  } else if (iconType === "exit") {
    // Exit return arrow
    line(x + 22, y + h/2, x + 40, y + h/2);
    line(x + 22, y + h/2, x + 28, y + h/2 - 6);
    line(x + 22, y + h/2, x + 28, y + h/2 + 6);
    line(x + 40, y + h/2, x + 40, y + h/2 - 12);
    line(x + 40, y + h/2 - 12, x + 34, y + h/2 - 12);
  }
  pop();
  
  // Texts
  noStroke();
  textAlign(LEFT, CENTER);
  
  // Label (Korean)
  textSize(20);
  textStyle(BOLD);
  if (hover) fill(255, 215, 0);
  else fill(255);
  text(label, x + 60, y + h/2 - 10);
  
  // Sublabel (English)
  textSize(11);
  textStyle(NORMAL);
  if (hover) fill(255, 215, 0, 180);
  else fill(180, 180, 180);
  text(sublabel, x + 60, y + h/2 + 12);
  
  pop();
}

function drawPasswordInputModal() {
  push();
  rectMode(CORNER);
  
  // Dim background
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  
  // Center panel
  let mW = 360;
  let mH = 220;
  let mX = (width - mW) / 2;
  let mY = (height - mH) / 2;
  
  // Box
  fill(25, 25, 35, 240);
  stroke(120, 120, 180);
  strokeWeight(2);
  rect(mX, mY, mW, mH, 15);
  
  // Title
  noStroke();
  fill(255);
  textAlign(CENTER, TOP);
  textSize(18);
  textStyle(BOLD);
  text("🔑 어드민 인증", width / 2, mY + 25);
  
  // Instructions
  textSize(12);
  textStyle(NORMAL);
  fill(170, 170, 200);
  text("비밀번호 4자리를 입력하고 ENTER를 누르세요.", width / 2, mY + 55);
  
  // Input field representation
  fill(10, 10, 15);
  stroke(60, 60, 90);
  strokeWeight(1.5);
  let fieldW = 200;
  let fieldH = 40;
  rect((width - fieldW) / 2, mY + 90, fieldW, fieldH, 8);
  
  // Asterisks
  noStroke();
  fill(255, 215, 0);
  textSize(24);
  textAlign(CENTER, CENTER);
  let displayStr = "";
  for (let i = 0; i < enteredPassword.length; i++) {
    displayStr += "* ";
  }
  if (displayStr === "") {
    fill(100);
    textSize(14);
    text("입력 대기 중...", width / 2, mY + 90 + fieldH / 2);
  } else {
    text(displayStr.trim(), width / 2, mY + 90 + fieldH / 2);
  }
  
  // Error message
  if (passwordErrorTimer > 0) {
    passwordErrorTimer--;
    fill(255, 100, 100);
    textSize(12);
    textAlign(CENTER, TOP);
    text("비밀번호가 일치하지 않습니다!", width / 2, mY + 145);
  }
  
  // Footer instructions
  fill(120, 120, 150);
  textSize(11);
  textAlign(CENTER, TOP);
  text("[ESC] 취소", width / 2, mY + 180);
  
  pop();
}

function drawAdminModal() {
  push();
  rectMode(CORNER);
  
  // Dim background
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  
  // Center Modal Panel
  let mW = 400;
  let mH = 320;
  let mX = (width - mW) / 2;
  let mY = (height - mH) / 2;
  
  // Glassmorphic panel design
  fill(25, 25, 35, 240);
  stroke(100, 100, 150);
  strokeWeight(2);
  rect(mX, mY, mW, mH, 20);
  
  // Title
  fill(255);
  textAlign(CENTER, TOP);
  textSize(22);
  textStyle(BOLD);
  text("⚙️ 어드민 제어판", width / 2, mY + 25);
  
  // Divider
  stroke(60, 60, 90);
  strokeWeight(1);
  line(mX + 20, mY + 65, mX + mW - 20, mY + 65);
  
  // Render options inside modal
  let options = [
    { id: "TEST_MODE", label: "테스트 모드 진입" },
    { id: "ASSET_VIEWER", label: "에셋 & 이펙트 뷰어" },
    { id: "LOGOUT", label: "어드민 로그아웃" },
    { id: "CLOSE", label: "닫기" }
  ];
  
  let itemY = mY + 85;
  let itemH = 45;
  let spacing = 12;
  
  for (let i = 0; i < options.length; i++) {
    let opt = options[i];
    let oy = itemY + i * (itemH + spacing);
    let ox = mX + 30;
    let ow = mW - 60;
    
    let hover = mouseX > ox && mouseX < ox + ow && mouseY > oy && mouseY < oy + itemH;
    
    rectMode(CORNER);
    if (hover) {
      cursor(HAND);
      if (opt.id === "LOGOUT") fill(180, 50, 50);
      else if (opt.id === "CLOSE") fill(80, 80, 100);
      else fill(100, 70, 220);
      stroke(255);
      strokeWeight(1.5);
    } else {
      if (opt.id === "LOGOUT") fill(120, 30, 30);
      else if (opt.id === "CLOSE") fill(50, 50, 70);
      else fill(40, 40, 60);
      noStroke();
    }
    
    rect(ox, oy, ow, itemH, 10);
    
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text(opt.label, width / 2, oy + itemH / 2);
  }
  
  pop();
}

function drawHowToPlay() {
  // 1200x800 coordinate scale mapping
  let s = min(width / 1200, height / 800);
  let tx = (width - 1200 * s) / 2;
  let ty = (height - 800 * s) / 2;
  
  // Background: black/dark space outside
  background(0);
  
  push();
  translate(tx, ty);
  scale(s);
  
  if (gameImages.how_to_play) {
    imageMode(CORNER);
    image(gameImages.how_to_play, 0, 0, 1200, 800);
  } else {
    // Draw subtle grid line pattern
    stroke(20, 35, 50, 100);
    strokeWeight(1);
    for (let gx = 0; gx < 1200; gx += 40) line(gx, 0, gx, 800);
    for (let gy = 0; gy < 800; gy += 40) line(0, gy, 1200, gy);
    
    // Title "게임 방법" & "HOW TO PLAY"
    textAlign(CENTER, TOP);
    textStyle(BOLD);
    textSize(44);
    fill(255);
    noStroke();
    text("게임 방법", 600, 30);
    
    textSize(16);
    fill(120, 150, 180);
    text("HOW TO PLAY", 600, 80);
    
    // Header chalk doodles (notebook & pencil)
    stroke(120, 150, 180, 150);
    strokeWeight(2);
    noFill();
    // Mini notebook doodle at top right
    rect(820, 35, 35, 45, 3);
    for (let ry = 40; ry < 75; ry += 8) line(815, ry, 822, ry);
    // Mini pencil doodle at top left
    push();
    translate(350, 50);
    rotate(radians(-30));
    rect(0, 0, 6, 25, 1);
    triangle(-3, -12.5, 3, -12.5, 0, -18);
    pop();
    
    // 5 Panels in the Top Row (Y: 120 to 420)
    let pW = 200;
    let pH = 300;
    let pY = 120;
    let gapX = 15;
    let startX = 60;
    
    // Panel 1: 캐릭터 이동 (Green)
    drawHowToPlayPanel(startX + 0 * (pW + gapX), pY, pW, pH, "① 캐릭터 이동", color(50, 180, 100), () => {
      // Draw player down sprite in center
      if (gameImages.player_down) {
        imageMode(CENTER);
        image(gameImages.player_down, startX + 0 * (pW + gapX) + pW/2, pY + 120, 36, 68);
      }
      // Draw keycaps
      drawKeycap(startX + 0 * (pW + gapX) + pW/2, pY + 200, "S");
      drawKeycap(startX + 0 * (pW + gapX) + pW/2 - 30, pY + 200, "A");
      drawKeycap(startX + 0 * (pW + gapX) + pW/2 + 30, pY + 200, "D");
      drawKeycap(startX + 0 * (pW + gapX) + pW/2, pY + 170, "W");
      
      // Tiny arrows
      stroke(50, 180, 100); strokeWeight(2); noFill();
      line(startX + 0 * (pW + gapX) + pW/2, pY + 75, startX + 0 * (pW + gapX) + pW/2, pY + 65);
      line(startX + 0 * (pW + gapX) + pW/2, pY + 65, startX + 0 * (pW + gapX) + pW/2 - 4, pY + 69);
      line(startX + 0 * (pW + gapX) + pW/2, pY + 65, startX + 0 * (pW + gapX) + pW/2 + 4, pY + 69);
      
      // Text description
      noStroke(); fill(200); textAlign(CENTER, TOP); textSize(12); textStyle(NORMAL);
      text("WASD 키로\n캐릭터를 이동하세요.", startX + 0 * (pW + gapX) + pW/2, pY + 250);
    });
    
    // Panel 2: 과제 등장 & 처치 (Teal)
    drawHowToPlayPanel(startX + 1 * (pW + gapX), pY, pW, pH, "② 과제 등장 & 처치", color(30, 180, 180), () => {
      // Center fight doodle
      let cx = startX + 1 * (pW + gapX) + pW/2;
      let cy = pY + 130;
      
      // Draw player outline/point
      stroke(255); strokeWeight(2); fill(30, 180, 180, 80);
      ellipse(cx, cy, 30, 30);
      
      // Draw angry book outlines
      drawChalkBookMini(cx - 45, cy - 30, 30, 38, color(200, 60, 60));
      drawChalkBookMini(cx + 45, cy - 10, 30, 38, color(200, 100, 60));
      drawChalkBookMini(cx - 30, cy + 30, 30, 38, color(150, 60, 160));
      
      // Strike sparks
      stroke(255, 215, 0); strokeWeight(2);
      line(cx - 20, cy - 10, cx - 35, cy - 20);
      line(cx - 27, cy - 20, cx - 23, cy - 10);
      
      // Text description
      noStroke(); fill(200); textAlign(CENTER, TOP); textSize(12); textStyle(NORMAL);
      text("과제(적)가 몰려옵니다.\n자동으로 공격하고 처치하세요.", cx, pY + 250);
    });
    
    // Panel 3: 레벨 업 & 능력 선택 (Purple)
    drawHowToPlayPanel(startX + 2 * (pW + gapX), pY, pW, pH, "③ 레벨 업 & 능력", color(140, 80, 255), () => {
      let cx = startX + 2 * (pW + gapX) + pW/2;
      
      // Draw 3 small Level Up selection cards
      rectMode(CENTER);
      strokeWeight(1);
      
      // Card Left
      stroke(120, 100, 220); fill(20, 20, 40);
      rect(cx - 45, pY + 130, 38, 60, 4);
      // Card Right
      rect(cx + 45, pY + 130, 38, 60, 4);
      // Card Center (Zoomed slightly)
      stroke(255, 215, 0); fill(35, 30, 60);
      rect(cx, pY + 125, 44, 70, 4);
      
      // Draw miniature contents in center card
      noStroke(); fill(255, 215, 0); textSize(8);
      textAlign(CENTER, CENTER);
      text("p5js", cx, pY + 105);
      fill(50, 255, 50); ellipse(cx, pY + 130, 14, 14);
      
      // Text description
      noStroke(); fill(200); textAlign(CENTER, TOP); textSize(12); textStyle(NORMAL);
      text("레벨이 오르면\n능력(스킬)을 선택해\n더 강해지세요!", cx, pY + 250);
    });
    
    // Panel 4: 15분 생존 (Pink)
    drawHowToPlayPanel(startX + 3 * (pW + gapX), pY, pW, pH, "④ 15분 생존", color(230, 60, 130), () => {
      let cx = startX + 3 * (pW + gapX) + pW/2;
      let cy = pY + 120;
      
      // Draw stopwatch outline
      stroke(230, 60, 130); strokeWeight(3); noFill();
      ellipse(cx, cy, 54, 54);
      line(cx, cy - 27, cx, cy - 33); // Top button
      ellipse(cx, cy - 33, 10, 3);
      
      // Stopwatch hands
      stroke(255); strokeWeight(2);
      line(cx, cy, cx, cy - 18); // Minute
      line(cx, cy, cx + 12, cy + 6); // Hour
      
      // Time Text
      noStroke(); fill(255, 100, 180); textAlign(CENTER, TOP); textSize(18); textStyle(BOLD);
      text("15:00", cx, pY + 165);
      
      // Text description
      noStroke(); fill(200); textAlign(CENTER, TOP); textSize(12); textStyle(NORMAL);
      text("끝없이 몰려오는 과제들을\n버티며 15분 동안\n생존하세요!", cx, pY + 250);
    });
    
    // Panel 5: 교수님 보스 등장 (Red)
    drawHowToPlayPanel(startX + 4 * (pW + gapX), pY, pW, pH, "⑤ 교수님 보스 등장", color(220, 50, 50), () => {
      let cx = startX + 4 * (pW + gapX) + pW/2;
      
      // Draw miniature professor
      if (gameImages.professor) {
        imageMode(CENTER);
        image(gameImages.professor, cx, pY + 120, 85, 120);
      }
      
      // Text description
      noStroke(); fill(200); textAlign(CENTER, TOP); textSize(12); textStyle(NORMAL);
      text("15분 후, 교수님이\n등장합니다!\n최선을 다해 도전하세요!", cx, pY + 250);
    });
    
    // Bottom Row (Y: 445 to 705)
    let bW = 340;
    let bH = 260;
    let bY = 445;
    let gapB = 40;
    let startBX = 60;
    
    // Box 6: 교수님을 만족시키세요! (Orange)
    drawHowToPlayPanel(startBX + 0 * (bW + gapB), bY, bW, bH, "⑥ 교수님을 만족시키세요!", color(240, 130, 30), () => {
      let cx = startBX + 0 * (bW + gapB) + bW/2;
      
      // Professor with Crown
      if (gameImages.professor) {
        imageMode(CENTER);
        image(gameImages.professor, cx - 20, bY + 115, 80, 115);
      }
      
      // Draw Crown at top left of professor head
      push();
      translate(cx - 38, bY + 50);
      rotate(radians(-15));
      fill(255, 215, 0); stroke(255); strokeWeight(1);
      beginShape();
      vertex(-12, 6);
      vertex(-15, -6);
      vertex(-6, 0);
      vertex(0, -9);
      vertex(6, 0);
      vertex(15, -6);
      vertex(12, 6);
      endShape(CLOSE);
      ellipse(-15, -6, 2, 2);
      ellipse(0, -9, 2, 2);
      ellipse(15, -6, 2, 2);
      pop();
      
      // Tiny stars
      fill(255, 230, 100); noStroke();
      star(cx + 45, bY + 70, 5, 10, 5);
      star(cx + 65, bY + 120, 4, 8, 5);
      star(cx + 35, bY + 150, 3, 6, 5);
      
      // Text description
      fill(200); textAlign(CENTER, TOP); textSize(13); textStyle(NORMAL);
      text("교수님을 만족시키면 클리어!\n학기를 무사히 완료하세요!", cx, bY + 195);
    });
    
    // Box 7: 조작 방법
    drawHowToPlayPanel(startBX + 1 * (bW + gapB), bY, bW, bH, "⌨️ 조작 방법", color(150, 150, 160), () => {
      let bx = startBX + 1 * (bW + gapB) + 30;
      let by = bY + 70;
      
      // Item 1: WASD 이동
      drawKeycap(bx + 10, by, "W");
      drawKeycap(bx - 10, by + 18, "A");
      drawKeycap(bx + 10, by + 18, "S");
      drawKeycap(bx + 30, by + 18, "D");
      noStroke(); fill(220); textAlign(LEFT, CENTER); textSize(14); textStyle(BOLD);
      text("이동 (Movement)", bx + 55, by + 9);
      
      // Item 2: 자동 공격
      // Mouse Icon
      let mx = bx + 10;
      let my = by + 65;
      stroke(200); strokeWeight(1.5); noFill();
      rectMode(CENTER);
      rect(mx, my, 16, 26, 8);
      line(mx, my - 13, mx, my + 13);
      line(mx - 8, my, mx + 8, my);
      fill(200); noStroke();
      ellipse(mx - 4, my - 6, 3, 3); // Left click highlight
      
      fill(220); textAlign(LEFT, CENTER); textSize(14); textStyle(BOLD);
      text("자동 공격 (근접 시)", bx + 55, my);
      
      // Item 3: R 새로고침
      drawKeycap(mx, by + 115, "R");
      fill(220); textAlign(LEFT, CENTER); textSize(14); textStyle(BOLD);
      text("새로고침 (레벨 업 시)", bx + 55, by + 115);
      
      // Item 4: ESC 일시 정지
      drawKeycap(mx, by + 165, "ESC", 32);
      fill(220); textAlign(LEFT, CENTER); textSize(14); textStyle(BOLD);
      text("일시 정지 (Pause)", bx + 55, by + 165);
    });
    
    // Box 8: TIP
    drawHowToPlayPanel(startBX + 2 * (bW + gapB), bY, bW, bH, "💡 TIP", color(150, 150, 160), () => {
      let bx = startBX + 2 * (bW + gapB) + 25;
      let by = bY + 65;
      
      textAlign(LEFT, TOP);
      textSize(13);
      textStyle(NORMAL);
      fill(200);
      textLeading(22);
      
      let tips = [
        "• 다양한 능력 조합으로 나만의 빌드를 만들어 보세요!",
        "• 레벨 업 시 무기/패시브를 전략적으로 선택하세요!",
        "• 과제의 패턴을 파악하고 이동하며 생존하세요!"
      ];
      
      for (let i = 0; i < tips.length; i++) {
        text(tips[i], bx, by + i * 55, bW - 40, 50);
      }
      
      // Mini open book sketch at bottom right
      stroke(120, 150, 180, 80); strokeWeight(1.5); noFill();
      let bx_book = bx + bW - 85;
      let by_book = by + bH - 120;
      beginShape();
      vertex(bx_book, by_book + 15);
      vertex(bx_book, by_book + 2);
      vertex(bx_book + 12, by_book + 5);
      vertex(bx_book + 24, by_book + 2);
      vertex(bx_book + 24, by_book + 15);
      endShape();
      line(bx_book + 12, by_book + 5, bx_book + 12, by_book + 18);
    });
  }
  
  // 9. Go Back to Lobby Button (at top left, using HOW_TO_PLAY_BACK_BTN)
  let btnX = HOW_TO_PLAY_BACK_BTN.x;
  let btnY = HOW_TO_PLAY_BACK_BTN.y;
  let btnW = HOW_TO_PLAY_BACK_BTN.w;
  let btnH = HOW_TO_PLAY_BACK_BTN.h;
  
  let lx = (mouseX - tx) / s;
  let ly = (mouseY - ty) / s;
  let hoverBack = lx >= btnX - btnW/2 && lx <= btnX + btnW/2 && ly >= btnY - btnH/2 && ly <= btnY + btnH/2;
  
  push();
  rectMode(CENTER);
  if (hoverBack) {
    cursor(HAND);
    // Outer glow
    noFill();
    stroke(255, 215, 0, 60);
    strokeWeight(4);
    rect(btnX, btnY, btnW + 2, btnH + 2, 8);
    
    fill(30, 30, 45, 230); // slightly lighter dark gray/blue
    stroke(255, 215, 0, 220); // Gold border
    strokeWeight(2.5);
  } else {
    fill(20, 20, 30, 210); // Translucent dark gray/black background
    stroke(255, 255, 255, 120); // White/gray border
    strokeWeight(1.5);
  }
  
  rect(btnX, btnY, btnW, btnH, 6);
  
  noStroke();
  if (hoverBack) fill(255, 215, 0);
  else fill(255);
  
  textAlign(CENTER, CENTER);
  textSize(14);
  textStyle(BOLD);
  text("← 로비로 돌아가기", btnX, btnY - 1);
  pop();
  
  pop(); // Exit 1200x800 coordinate scale
}

function drawHowToPlayPanel(x, y, w, h, title, col, contentFn) {
  push();
  rectMode(CORNER);
  
  // Panel background
  fill(15, 20, 30, 220);
  stroke(red(col), green(col), blue(col), 120);
  strokeWeight(2);
  rect(x, y, w, h, 10);
  
  // Panel header banner or title
  noStroke();
  fill(red(col), green(col), blue(col), 35);
  rect(x + 2, y + 2, w - 4, 38, 8);
  
  fill(red(col), green(col), blue(col));
  textAlign(LEFT, CENTER);
  textSize(14);
  textStyle(BOLD);
  text(title, x + 15, y + 20);
  
  // Divider
  stroke(red(col), green(col), blue(col), 60);
  strokeWeight(1);
  line(x + 10, y + 40, x + w - 10, y + 40);
  
  // Call the content function to draw custom illustrations inside panel
  contentFn();
  pop();
}

function drawKeycap(x, y, keyText, w = 24) {
  push();
  rectMode(CENTER);
  
  // Base key shadow
  fill(40, 40, 45);
  noStroke();
  rect(x, y + 2, w, 24, 4);
  
  // Key cap surface
  fill(240, 240, 245);
  stroke(180, 180, 185);
  strokeWeight(1);
  rect(x, y, w, 24, 4);
  
  // Character text
  fill(50, 50, 55);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(keyText.length > 2 ? 10 : 13);
  textStyle(BOLD);
  text(keyText, x, y);
  pop();
}

function drawChalkBookMini(x, y, w, h, col) {
  push();
  rectMode(CENTER);
  stroke(255, 255, 255, 120);
  strokeWeight(1.5);
  fill(red(col), green(col), blue(col), 180);
  rect(x, y, w, h, 4);
  
  // Spiral
  stroke(200, 200, 200, 150);
  strokeWeight(2);
  for (let ry = y - h/2 + 5; ry < y + h/2; ry += 8) {
    line(x - w/2 - 2, ry, x - w/2 + 1, ry);
  }
  
  // Simple angry eyes
  stroke(255); strokeWeight(1.5);
  line(x - 6, y - 4, x - 2, y - 1);
  line(x + 6, y - 4, x + 2, y - 1);
  pop();
}

function star(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
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
