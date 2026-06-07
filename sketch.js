// ═══════════════════════════════════════════════
// sketch.js — 메인 루프 & 전역 상태만 담당
// 모든 클래스/함수는 각 파일에서 정의됨
// ═══════════════════════════════════════════════

let gameState = "LOBBY";

let player;
let enemies = [];
let damageTexts = [];
let gems = [];
let projectiles = [];
let score = 0;
let level = 1;
let currentLevelStartExp = 0;
let nextLevelExp = 100;
let gameFrames = 0;
const MAP_SIZE = 1500;
let skillChoices = [];
let testSelectedWeapons = [];
let testSelectedPassives = [];
let isTestModeWeaponSelect = true;

let bossActive = false;
let currentBoss = null;
let bossProjectiles = [];
let bossWarningTimer = 0;

let enemyPool, damageTextPool, gemPool, projPool;

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (gameImages.usb_raw) {
    gameImages.usb = processUsbImage(gameImages.usb_raw);
  }
  initPools();
  initGame();
}

function initPools() {
  enemyPool = new ObjectPool(() => new Enemy());
  damageTextPool = new ObjectPool(() => new DamageText());
  gemPool = new ObjectPool(() => new Gem());
  projPool = new ObjectPool(() => new Projectile());
}

function initGame() {
  player = new Player();
  enemies = []; damageTexts = []; gems = []; projectiles = [];
  score = 0; level = 1; currentLevelStartExp = 0; nextLevelExp = 50;
  gameFrames = 0;
  clearEffects(); // 이펙트 풀 리셋
  player.addWeapon(new P5jsIconSkill(player));

  bossActive = false;
  currentBoss = null;
  bossProjectiles = [];
  bossWarningTimer = 0;
}

function draw() {
  cursor(ARROW);
  if (gameState === "LOBBY") drawLobby();
  else if (gameState === "HOW_TO_PLAY") drawHowToPlay();
  else if (gameState === "IN_GAME") drawGame();
  else if (gameState === "LEVEL_UP") { drawGame(); drawLevelUp(); }
  else if (gameState === "GAME_OVER") { drawGame(); drawGameOver(); }
  else if (gameState === "GAME_CLEAR") { drawGame(); drawGameClear(); }
  else if (gameState === "TEST_SKILL_SELECT") drawTestSkillSelect();
  else if (gameState === "ASSET_VIEWER") drawAssetViewer();
}

function drawGame() {
  background(20, 20, 30);
  if (gameState === "IN_GAME" && gameFrames >= 54000 && !bossActive) { startBossBattle(); }
  if (gameState === "IN_GAME" && score >= nextLevelExp) { levelUp(); return; }

  push();
  let camX = width / 2 - player.x;
  let camY = height / 2 - player.y;
  translate(camX, camY);
  drawGrid();

  if (gameState === "IN_GAME") { gameFrames++; player.update(); }

  for (let i = gems.length - 1; i >= 0; i--) {
    let g = gems[i];
    if (gameState === "IN_GAME") g.update(player);
    // 화면 범위 안에 있을 때만 젬 렌더링
    if (isOnScreen(g.x, g.y, 30)) {
      g.display();
    }
    if (g.isDead) {
      if (g.collected) score += g.expAmount;
      gemPool.release(g); gems.splice(i, 1);
    }
  }

  player.display();

  if (gameState === "IN_GAME") {
    let m = floor(gameFrames / 3600);
    let maxEnemies = 50;
    let spawnRate = 60;

    if (m < 2) {
      maxEnemies = 20; spawnRate = 120;
    } else if (m < 5) {
      maxEnemies = 100 + (m - 2) * 30; spawnRate = 40 - (m - 2) * 5;
    } else if (m < 7) {
      maxEnemies = 200 + (m - 5) * 50; spawnRate = 20 - (m - 5) * 5;
    } else if (m < 10) {
      maxEnemies = 300 + (m - 7) * 100; spawnRate = 10 - (m - 7) * 2;
    } else {
      maxEnemies = 400 + (m - 10) * 200; spawnRate = max(1, 3 - floor((m - 10) / 2));
    }

    // 보스전 중에는 일반 적 자동 스폰을 차단합니다.
    if (frameCount % spawnRate === 0 && enemies.length < maxEnemies && !bossActive) {
      enemies.push(enemyPool.get(player.x, player.y, m, level));
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    if (gameState === "IN_GAME") {
      e.update(player.x, player.y, enemies);

      // 보스 충돌 판정 크기 상향 (65px) 및 일반 적 판정 (35px)
      let colDist = (e instanceof Boss) ? 65 : 35;
      let colDmg = (e instanceof Boss) ? 15 : 10;
      // 대략적인 좌표 검사로 무거운 dist() 계산을 95% 이상 바이패스
      if (Math.abs(player.x - e.x) < colDist && Math.abs(player.y - e.y) < colDist) {
        if (dist(player.x, player.y, e.x, e.y) < colDist) {
          player.takeDamage(colDmg);
        }
      }

      for (let w of player.weapons) w.checkHit ? w.checkHit(e) : null;
      for (let p of projectiles) p.checkHit(e);

      if (e.hp >= e.maxHp) {
        if (e instanceof Boss) {
          gameState = "GAME_CLEAR";
          continue;
        }
        gems.push(gemPool.get(e.x, e.y, e.expValue));
        enemyPool.release(e); enemies.splice(i, 1);
        continue;
      }
    }
    // 화면에 보이는 몬스터만 렌더링하여 프레임 드랍 완벽 방지
    if (isOnScreen(e.x, e.y, 50)) {
      e.display();
    }
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    if (gameState === "IN_GAME") p.update();
    p.display();
    if (p.isDead) { projPool.release(p); projectiles.splice(i, 1); }
  }

  // ── 보스 투사체 업데이트 및 플레이어 피격 검출 (월드 좌표계) ──
  for (let i = bossProjectiles.length - 1; i >= 0; i--) {
    let bp = bossProjectiles[i];
    if (gameState === "IN_GAME") {
      bp.update();
      bp.checkHit(player);
    }
    bp.display();
    if (bp.isDead) { bossProjectiles.splice(i, 1); }
  }

  for (let i = damageTexts.length - 1; i >= 0; i--) {
    let dt = damageTexts[i];
    if (gameState === "IN_GAME") dt.update();
    dt.display();
    if (dt.isDead()) { damageTextPool.release(dt); damageTexts.splice(i, 1); }
  }

  // ── 이펙트 시스템 업데이트 (월드 좌표계) ──
  if (gameState === "IN_GAME") {
    updateAndDrawEffects();
  }

  pop();

  // ── 화면 이펙트 (화면 좌표계 - pop() 이후) ──
  updateAndDrawScreenEffects();

  // ── 보스전 에픽 경고 배너 렌더링 (화면 좌표계) ──
  if (bossActive && bossWarningTimer > 0) {
    bossWarningTimer--;
    push();
    textAlign(CENTER, CENTER);
    rectMode(CENTER);

    // 검정 반투명 차폐 영역
    fill(0, 0, 0, 160);
    noStroke();
    rect(width / 2, height / 2, width, 140);

    // 경고 사이렌 텍스트
    textSize(34);
    textStyle(BOLD);
    fill(255, 50, 50, 200 + sin(frameCount * 0.25) * 55);
    text("⚠️ WARNING: 아텍 교수님 등장 ⚠️", width / 2, height / 2 - 22);

    // 가이드 텍스트
    textSize(16);
    textStyle(BOLD);
    fill(255, 215, 0);
    text("스킬을 적중시켜 교수님의 학업 만족도를 100%로 충전하세요!", width / 2, height / 2 + 25);
    pop();
  }

  drawUI();
}

function drawGrid() {
  stroke(40, 40, 60); strokeWeight(1);
  for (let x = -MAP_SIZE; x <= MAP_SIZE; x += 100) line(x, -MAP_SIZE, x, MAP_SIZE);
  for (let y = -MAP_SIZE; y <= MAP_SIZE; y += 100) line(-MAP_SIZE, y, MAP_SIZE, y);
}

function mousePressed() {
  if (gameState === "LOBBY") {
    let bx = width / 2; let bw = 280; let bh = 60;
    // 1. 게임 시작 (yOffset: 20)
    let by = height / 2 + 20;
    if (mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2) {
      initGame(); gameState = "IN_GAME";
    }
    // 2. 게임 방법 (yOffset: 100)
    by = height / 2 + 100;
    if (mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2) {
      gameState = "HOW_TO_PLAY";
    }
    // 3. 테스트 모드 (yOffset: 180)
    by = height / 2 + 180;
    if (mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2) {
      testSelectedWeapons = []; testSelectedPassives = []; isTestModeWeaponSelect = true;
      gameState = "TEST_SKILL_SELECT";
    }
    // 4. 에셋 & 이펙트 뷰어 (yOffset: 260)
    by = height / 2 + 260;
    if (mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2) {
      gameState = "ASSET_VIEWER";
      initAssetViewer();
    }
  } else if (gameState === "ASSET_VIEWER") {
    assetViewerMousePressed();
  } else if (gameState === "HOW_TO_PLAY" || gameState === "GAME_OVER" || gameState === "GAME_CLEAR") {
    let bx = width / 2; let by = height - 150; let bw = 250; let bh = 60;
    if (gameState !== "HOW_TO_PLAY") by = height / 2 + 80;
    if (mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2) {
      gameState = "LOBBY";
    }
  } else if (gameState === "TEST_SKILL_SELECT") {
    let list = isTestModeWeaponSelect ? WEAPONS_INFO : PASSIVES_INFO;
    let selectedList = isTestModeWeaponSelect ? testSelectedWeapons : testSelectedPassives;
    let cols = 5; let cardW = 180; let cardH = 150; let spacing = 20;
    let startX = width / 2 - (cardW * cols + spacing * (cols - 1)) / 2 + cardW / 2;
    let startY = height / 2 - cardH;
    for (let i = 0; i < list.length; i++) {
      let col = i % cols; let row = floor(i / cols);
      let cx = startX + col * (cardW + spacing); let cy = startY + row * (cardH + spacing);
      if (mouseX > cx - cardW / 2 && mouseX < cx + cardW / 2 && mouseY > cy - cardH / 2 && mouseY < cy + cardH / 2) {
        if (selectedList.includes(list[i])) selectedList.splice(selectedList.indexOf(list[i]), 1);
        else if (selectedList.length < 5) selectedList.push(list[i]);
      }
    }
    let btnX = width / 2; let btnY = height - 100; let btnW = 200; let btnH = 60;
    if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 && mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) {
      if (isTestModeWeaponSelect) isTestModeWeaponSelect = false;
      else {
        initGame(); player.weapons = []; player.passives = [];
        for (let wInfo of testSelectedWeapons) {
          let w = new wInfo.class(player); w.level = 5; player.addWeapon(w);
        }
        for (let pInfo of testSelectedPassives) {
          let p = new Passive(pInfo.name, pInfo.id); p.level = 5; player.addPassive(p);
        }
        gameFrames = 36000;
        gameState = "IN_GAME";
      }
    }
  } else if (gameState === "LEVEL_UP") {
    // drawLevelUp()과 동일한 공식으로 카드 위치 계산
    let cardW = 300;
    let cardH = 460;
    let spacing = 32;
    let totalW = skillChoices.length * cardW + (skillChoices.length - 1) * spacing;
    let startX = width / 2 - totalW / 2 + cardW / 2;
    let cy = height / 2 + 35;
    for (let i = 0; i < skillChoices.length; i++) {
      let cx = startX + i * (cardW + spacing);
      if (mouseX > cx - cardW / 2 && mouseX < cx + cardW / 2 &&
        mouseY > cy - cardH / 2 && mouseY < cy + cardH / 2) {
        let choice = skillChoices[i];
        if (choice.isUpgrade) choice.existing.levelUp();
        else {
          if (choice.type === 'weapon') player.addWeapon(new choice.info.class(player));
          else player.addPassive(new Passive(choice.info.name, choice.info.id));
        }
        gameState = "IN_GAME"; break;
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function startBossBattle() {
  bossActive = true;
  bossWarningTimer = 180; // 3초간 배너 활성화

  // 기존 적들을 모두 배니쉬 이펙트와 함께 청소
  for (let e of enemies) {
    spawnEffect(new EnemyVanishEffect(e.x, e.y));
  }
  enemies = [];

  // 교수님 보스 소환 (플레이어 기준 위쪽 300px)
  currentBoss = new Boss(player.x, player.y - 300);
  enemies.push(currentBoss);

  // 화면 강렬한 적색 섬광 및 충격파 연출
  spawnEffect(new ScreenFlashEffect([255, 50, 50], 45));
  spawnEffect(new ShockwaveEffect(player.x, player.y, [255, 50, 50], 250));
}

// ── 성능 최적화: 엔티티(몬스터, 보석, 파티클 등)의 온스크린 판정 여부 반환 ──
function isOnScreen(x, y, margin = 100) {
  if (!player) return true;
  return (
    x >= player.x - width / 2 - margin &&
    x <= player.x + width / 2 + margin &&
    y >= player.y - height / 2 - margin &&
    y <= player.y + height / 2 + margin
  );
}