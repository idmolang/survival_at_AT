// ═══════════════════════════════════════════════════════════
// assetViewer.js — 애니메이션 & 에셋 실시간 통합 뷰어 모드
// ═══════════════════════════════════════════════════════════

let viewerTab = "effects"; // "effects" or "assets"
let selectedEffectIndex = 0;
let autoPlayEffects = false;
let autoPlayTimer = 0;

let selectedAssetKey = "";
let assetZoomScale = 2.0; // 에셋 상세조회 기본 확대 비율
let isLaptopPlaying = true;
let laptopAnimSpeed = 6; // 프레임 전환 속도 (프레임 틱 간격)
let hoveredDetailFrame = -1; // 상세화면에서 마우스 오버된 프레임 인덱스

// 벼락치기 게임 내의 11가지 개별 시각 효과들 정의
const VIEWER_EFFECTS = [
  {
    id: "lightning",
    name: "벼락치기 번개 (Lightning)",
    desc: "지정된 반경 내에 무작위로 내리치는 고전압 지그재그 번개 줄기와 임팩트 플래시, 바닥 불꽃 스파크 조합입니다.",
    skill: "기본 장착: 벼락치기 스킬 (Cramming)",
    spawn: (x, y) => spawnEffect(new LightningStrikeEffect(x, y, 100))
  },
  {
    id: "meteor",
    name: "메테오 폭발 (Meteor Explosion)",
    desc: "우주에서 불타는 대형 노트북 메테오가 충돌하여 지면을 날려버릴 때 나타나는 3중 화염 구체와 고체 파편 폭발입니다.",
    skill: "기본 장착: 노트북 스킬 (Laptop)",
    spawn: (x, y) => spawnEffect(new LaptopFallEffect(x, y, 160, 0))
  },
  {
    id: "laser_charge",
    name: "레이저 충전 (Laser Charge)",
    desc: "광역 파괴 광선 발사 직전, 사방에서 중심점으로 붉은 에너지 파티클이 광속으로 압축 수렴하는 충전 경고 비주얼입니다.",
    skill: "기본 장착: 선배들의 조언 스킬 (Senior Summon)",
    spawn: (x, y) => spawnEffect(new LaserChargeEffect(x, y, random(TWO_PI)))
  },
  {
    id: "laser_beam",
    name: "레이저 빔 (Laser Beam)",
    desc: "화면을 종단으로 가르며 적들을 한 번에 쓸어버리는 초고온 붉은색 파괴 빔과 고속 임팩트 전기 파티클 조합입니다.",
    skill: "기본 장착: 선배들의 조언 스킬 (Senior Summon)",
    spawn: (x, y) => spawnEffect(new LaserBeamEffect(x, y, random(TWO_PI), 30, [255, 50, 50]))
  },
  {
    id: "shockwave",
    name: "원형 충격파 (Shockwave)",
    desc: "이펙트 기점으로부터 빠르게 확장되며 흐려지는 글로우 라인 충격 에너지 링입니다.",
    skill: "기본 장착: USB 장판 형성, Cramming 벼락 낙하, Laptop 메테오 폭발 등 다수",
    spawn: (x, y) => spawnEffect(new ShockwaveEffect(x, y, [80, 180, 255], 130))
  },
  {
    id: "usb_vortex",
    name: "USB 사이버 볼텍스 (USB Cyber Vortex)",
    desc: "바닥의 네온 USB 소켓과 플러그인 USB를 중심으로 폴더 및 코딩 파일 확장자들이 여러 공전 궤도를 그리며 고속 회전하는 도트딜 연출입니다.",
    skill: "기본 장착: USB 스킬 (USB)",
    spawn: (x, y) => spawnEffect(new UsbVortexShowcaseEffect(x, y))
  },
  {
    id: "muzzle_flash",
    name: "총구 섬광 (Muzzle Flash)",
    desc: "투사체 무기가 발사될 때 발사 방향으로 뿜어져 나오는 짧은 불꽃 파티클입니다.",
    skill: "사용 스킬: P5jsIcon 발사, 마우스 (Mouse) 발사",
    spawn: (x, y) => spawnEffect(new MuzzleFlashEffect(x, y, random(TWO_PI), [255, 180, 80]))
  },
  {
    id: "trail_dot",
    name: "궤적 잔상 (Trail Dot)",
    desc: "발사체나 투사체 배후를 장식하며 부드러운 불투명도 감쇠로 점차 소멸하는 은은한 빛 점 효과입니다.",
    skill: "기본 장착: 전공책 스킬 (Unibook) 잔상",
    spawn: (x, y) => {
      for (let i = 0; i < 6; i++) {
        spawnEffect(new TrailDotEffect(x + random(-15, 15), y + random(-15, 15), [180, 255, 120]));
      }
    }
  },
  {
    id: "orb_hit",
    name: "오브 피격 (Orb Hit)",
    desc: "오브가 적에게 충돌하여 소멸할 때 발생하는 별 모양의 잔광 섬광입니다.",
    skill: "기본 장착: 전공책 스킬 (Unibook)",
    spawn: (x, y) => spawnEffect(new OrbHitEffect(x, y))
  },
  {
    id: "spark",
    name: "전기 스파크 (Spark)",
    desc: "접촉 타격 및 전자기 간섭 시 뿜어나오는 전형적인 톱날형 예리한 노란 전기 잔상 스파크입니다.",
    skill: "기본 장착: USB 타격, 와이파이 장막 타격",
    spawn: (x, y) => spawnEffect(new SparkEffect(x, y, [255, 255, 100]))
  },
  {
    id: "bubble",
    name: "상승 거품 (Bubble)",
    desc: "지면에서 하늘 방향으로 물리 영향을 받아 서서히 부유하며 스케일이 축소되는 투명 청색 물방울 파티클입니다.",
    skill: "기본 장착: USB 장판 내부",
    spawn: (x, y) => {
      for (let i = 0; i < 5; i++) {
        spawnEffect(new BubbleEffect(x + random(-40, 40), y + random(-20, 20), [100, 180, 255]));
      }
    }
  },
  {
    id: "vanish",
    name: "적 소멸 (Vanish)",
    desc: "화면 내 전원 소거 판정 시, 정화의 기운을 담아 적들의 원자가 분해되며 소멸하는 링과 노란 입자 무리입니다.",
    skill: "기본 장착: 교수님의 휴강선언 필살기 (Professor Cancel)",
    spawn: (x, y) => spawnEffect(new EnemyVanishEffect(x, y))
  },
  {
    id: "screen_flash",
    name: "화면 섬광 (Screen Flash)",
    desc: "화면 전역을 순식간에 화이트아웃(White-out)시켜 시각적 반동 및 연출 극대화를 이끌어내는 충격 전원 이펙트입니다.",
    skill: "기본 장착: 교수님의 휴강선언 스킬 발동 시",
    spawn: (x, y) => spawnEffect(new ScreenFlashEffect([255, 255, 255], 30))
  },
  {
    id: "wifi_pulse",
    name: "WiFi 펄스 (WiFi Pulse)",
    desc: "플레이어 주변으로 퍼져나가는 고대역폭 초고속 와이파이 파동 애니메이션 시퀀스입니다.",
    skill: "사용 스킬: WiFi",
    spawn: (x, y) => spawnEffect(new WifiSkillEffect(x, y, 100))
  }
];

// 뷰어 최초 진입 시 초기화
function initAssetViewer() {
  viewerTab = "effects";
  selectedEffectIndex = 0;
  autoPlayEffects = false;
  autoPlayTimer = 0;
  selectedAssetKey = "";
  assetZoomScale = 2.0;
  isLaptopPlaying = true;
  hoveredDetailFrame = -1;
  clearEffects(); // 기존에 남아있던 이펙트들 청소
}

// 메인 그리기 루프
function drawAssetViewer() {
  background(15, 15, 25);
  cursor(ARROW);

  // 1. 좌측 뷰어 고유 글래스모피즘 사이드바 드로잉
  drawSidebar();

  // 2. 탭 콘텐츠 영역 그리기
  if (viewerTab === "effects") {
    drawEffectsShowcase();
  } else {
    drawAssetsGrid();
  }

  // 3. 에셋 상세 팝업 인스펙터 활성화 시 드로잉
  if (selectedAssetKey !== "") {
    drawAssetDetailModal();
  }
}

// 글래스모피즘 사이드바 렌더링
function drawSidebar() {
  push();
  rectMode(CORNER);
  // 사이드바 배경 (불투명 어두운 남색)
  fill(25, 25, 45, 240);
  noStroke();
  rect(0, 0, 250, height);
  
  // 사이드바 우측 테두리 발광 라인
  stroke(60, 60, 95);
  strokeWeight(2);
  line(250, 0, 250, height);

  // 타이틀
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(22);
  text("애셋 & 이펙트 뷰어", 125, 40);

  // 구분선
  stroke(60, 60, 95);
  strokeWeight(1);
  line(20, 65, 230, 65);

  // 두개의 메인 탭 전환 버튼
  // 탭: 이펙트 쇼케이스
  let t1Hover = mouseX > 15 && mouseX < 235 && mouseY > 85 && mouseY < 130;
  if (viewerTab === "effects") fill(100, 70, 220);
  else if (t1Hover) { fill(45, 45, 75); cursor(HAND); }
  else fill(30, 30, 50);
  rectMode(CORNER);
  rect(15, 85, 220, 45, 8);
  
  fill(255); textStyle(BOLD); textSize(15);
  text("이펙트 쇼케이스", 125, 1075 / 10);

  // 탭: 에셋 브라우저
  let t2Hover = mouseX > 15 && mouseX < 235 && mouseY > 140 && mouseY < 185;
  if (viewerTab === "assets") fill(100, 70, 220);
  else if (t2Hover) { fill(45, 45, 75); cursor(HAND); }
  else fill(30, 30, 50);
  rect(15, 140, 220, 45, 8);
  
  fill(255); textStyle(BOLD); textSize(15);
  text("에셋 브라우저", 125, 162.5);

  // 중앙 구분선
  stroke(60, 60, 95);
  line(20, 205, 230, 205);

  // 탭 하위 리스트 브라우징
  if (viewerTab === "effects") {
    // 이펙트 개별 목록
    drawSidebarEffectsList();
  } else {
    // 에셋 브라우저 팁 메세지
    drawSidebarAssetsTip();
  }

  // 하단 로비로 가기 버튼
  let exitX = 125;
  let exitY = height - 50;
  let exitW = 200;
  let exitH = 50;
  let exitHover = mouseX > exitX - exitW/2 && mouseX < exitX + exitW/2 && mouseY > exitY - exitH/2 && mouseY < exitY + exitH/2;
  if (exitHover) { fill(220, 70, 70); cursor(HAND); }
  else fill(180, 50, 50);
  rectMode(CENTER);
  rect(exitX, exitY, exitW, exitH, 10);
  fill(255); textStyle(BOLD); textSize(16);
  text("메인 로비로", exitX, exitY);

  pop();
}

// 사이드바 내 이펙트 세부 항목 출력
function drawSidebarEffectsList() {
  push();
  rectMode(CORNER);
  textSize(12);
  fill(150, 150, 200);
  textAlign(LEFT, CENTER);
  text("이펙트 리스트", 25, 225);

  let startY = 240;
  let itemH = 40;
  
  for (let i = 0; i < VIEWER_EFFECTS.length; i++) {
    let cy = startY + i * (itemH + 5);
    // 화면 높이를 초과하지 않도록 constrain
    if (cy + itemH > height - 100) break;

    let isSelected = (selectedEffectIndex === i);
    let hover = mouseX > 15 && mouseX < 235 && mouseY > cy && mouseY < cy + itemH;

    if (isSelected) {
      fill(80, 180, 255, 60);
      stroke(80, 180, 255);
      strokeWeight(1.5);
    } else if (hover) {
      fill(40, 40, 70);
      noStroke();
      cursor(HAND);
    } else {
      fill(25, 25, 45);
      noStroke();
    }

    rect(15, cy, 220, itemH, 6);
    noStroke();

    // 이펙트 이름 텍스트
    if (isSelected) fill(120, 210, 255);
    else fill(200);
    textAlign(LEFT, CENTER);
    textSize(13);
    textStyle(BOLD);
    text(VIEWER_EFFECTS[i].name.split(" (")[0], 28, cy + itemH / 2);
  }
  pop();
}

// 사이드바 내 에셋 탭 전용 안내 문구
function drawSidebarAssetsTip() {
  push();
  textAlign(LEFT, TOP);
  textSize(13);
  textStyle(BOLD);
  fill(120, 200, 255);
  text("실시간 에셋 감지 모드", 25, 225);

  textSize(12);
  textStyle(NORMAL);
  fill(170, 170, 195);
  let tipText = "이 브라우저는 gameImages에 올라온 모든 키값을 실시간 루프로 조회하여 동적으로 출력합니다.\n\n새로운 에셋 이미지를 추가하고 assetLoader.js에 등록하기만 하면, 이곳 뷰어 리스트에 자동으로 등록되어 클릭 한 번에 Inspect할 수 있습니다.";
  textLeading(18);
  text(tipText, 25, 250, 200, 400);
  pop();
}

// 탭 1: 이펙트 쇼케이스 레이아웃 및 렌더링
function drawEffectsShowcase() {
  push();
  
  // 프리뷰 캔버스 영역 정의 (사이드바 오른쪽의 대부분 영역)
  let canvasX = 260;
  let canvasY = 20;
  let canvasW = width - 280;
  let canvasH = height - 180; // 하부 이펙트 설명 패널을 위한 공간 확보
  
  // 1. 프리뷰 캔버스 테두리 및 어두운 격자판(checkered) 배경
  rectMode(CORNER);
  fill(10, 10, 15);
  stroke(60, 60, 95);
  strokeWeight(2);
  rect(canvasX, canvasY, canvasW, canvasH, 15);
  
  // 클리핑 격자 배경
  push();
  noStroke();
  let chSize = 16;
  // 격자 드로잉 영역을 캔버스 둥근 테두리 안쪽으로 제한
  for (let x = canvasX + 2; x < canvasX + canvasW - 2; x += chSize) {
    for (let y = canvasY + 2; y < canvasY + canvasH - 2; y += chSize) {
      // 캔버스 우하단 코너가 잘리는 문제 Constrain 처리
      let cellW = min(chSize, canvasX + canvasW - x - 2);
      let cellH = min(chSize, canvasY + canvasH - y - 2);
      if ((floor((x - canvasX) / chSize) + floor((y - canvasY) / chSize)) % 2 === 0) fill(18, 18, 30);
      else fill(23, 23, 38);
      rect(x, y, cellW, cellH);
    }
  }
  pop();

  // 2. 캔버스 내부 안내 메세지
  fill(120, 120, 150);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("화면 격자 내부를 마우스 클릭하여 이펙트를 직접 생성해보세요!", canvasX + canvasW/2, canvasY + 30);

  // 3. 이펙트 업데이트 & 렌더링 (그려지는 이펙트들이 프리뷰 격자 안에 갇혀 정렬되게 함)
  push();
  updateAndDrawEffects();
  updateAndDrawScreenEffects();
  pop();

  // 4. 이펙트 자동 반복 재생 비즈니스 로직
  if (autoPlayEffects) {
    autoPlayTimer++;
    if (autoPlayTimer >= 60) {
      autoPlayTimer = 0;
      let centerPX = canvasX + canvasW / 2;
      let centerPY = canvasY + canvasH / 2;
      VIEWER_EFFECTS[selectedEffectIndex].spawn(centerPX, centerPY);
    }
  }

  // 5. 하단 이펙트 상세 명세 카드 그리기
  let infoY = height - 145;
  let infoH = 125;
  fill(30, 30, 50, 200);
  stroke(60, 60, 95);
  strokeWeight(2);
  rect(canvasX, infoY, canvasW, infoH, 15);
  noStroke();

  let fx = VIEWER_EFFECTS[selectedEffectIndex];
  
  // 이펙트 명칭 타이틀
  textAlign(LEFT, TOP);
  textSize(22);
  textStyle(BOLD);
  fill(120, 210, 255);
  text(fx.name, canvasX + 25, infoY + 20);

  // 사용처 태그
  textSize(13);
  textStyle(BOLD);
  fill(255, 180, 100);
  let skillTagW = textWidth(fx.skill) + 20;
  rectMode(CORNER);
  fill(255, 180, 100, 30);
  rect(canvasX + canvasW - skillTagW - 25, infoY + 20, skillTagW, 28, 6);
  fill(255, 180, 100);
  textAlign(CENTER, CENTER);
  text(fx.skill, canvasX + canvasW - skillTagW/2 - 25, infoY + 33);
  
  // 설명 문구
  textAlign(LEFT, TOP);
  textSize(14);
  textStyle(NORMAL);
  fill(190, 190, 215);
  textLeading(22);
  text(fx.desc, canvasX + 25, infoY + 55, canvasW - 50, 60);

  // 6. 자동 재생 토글 버튼 그리기 (설명카드 우하단 배치)
  let btnX = canvasX + canvasW - 140;
  let btnY = infoY + infoH - 35;
  let btnW = 120;
  let btnH = 26;
  let btnHover = mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH;
  if (autoPlayEffects) {
    if (btnHover) fill(230, 80, 80); else fill(200, 60, 60);
  } else {
    if (btnHover) fill(80, 200, 120); else fill(50, 160, 90);
  }
  rectMode(CORNER);
  rect(btnX, btnY, btnW, btnH, 5);
  fill(255); textStyle(BOLD); textSize(11); textAlign(CENTER, CENTER);
  text(autoPlayEffects ? "자동재생 정지" : "자동재생 루프", btnX + btnW/2, btnY + btnH/2);

  pop();
}

// 탭 2: 에셋 브라우저 그리드 배치 렌더링
function drawAssetsGrid() {
  push();
  
  let gridX = 270;
  let gridY = 40;
  let gridW = width - 290;
  
  // 1. 헤더 타이틀 및 에셋 수 안내
  textAlign(LEFT, TOP);
  textSize(24);
  textStyle(BOLD);
  fill(255);
  text("에셋 브라우저 (Asset Browser)", gridX, gridY);
  
  let keys = Object.keys(gameImages);
  textSize(13);
  textStyle(NORMAL);
  fill(160, 160, 190);
  text(`gameImages에서 총 ${keys.length}개의 최상위 에셋 키가 실시간으로 로드되었습니다.`, gridX, gridY + 30);
  
  // 2. 동적 격자 카드 렌더링
  let cardW = 180;
  let cardH = 210;
  let gap = 20;
  let startY = gridY + 65;
  
  // 화면 가로 너비에 맞는 열 개수 산출
  let cols = max(1, floor(gridW / (cardW + gap)));
  
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let col = i % cols;
    let row = floor(i / cols);
    let cx = gridX + col * (cardW + gap);
    let cy = startY + row * (cardH + gap);
    
    // 화면 세로 길이를 벗어난 에셋은 화면에 렌더링 생략
    if (cy + cardH > height - 20) continue;

    let hover = mouseX > cx && mouseX < cx + cardW && mouseY > cy && mouseY < cy + cardH;
    
    // 카드 외형 디자인
    rectMode(CORNER);
    if (hover) {
      fill(45, 45, 75);
      stroke(120, 100, 255);
      strokeWeight(2);
      cursor(HAND);
    } else {
      fill(30, 30, 50);
      stroke(50, 50, 75);
      strokeWeight(1.5);
    }
    rect(cx, cy, cardW, cardH, 12);
    noStroke();

    // 3. 투명 배경을 확인하기 위한 80x80 체커보드 프리뷰 박스 (카드 상단 중앙 배치)
    let previewSize = 80;
    let px = cx + cardW / 2;
    let py = cy + 60;
    
    push();
    translate(px, py);
    let cSize = 8;
    for (let x = -previewSize/2; x < previewSize/2; x += cSize) {
      for (let y = -previewSize/2; y < previewSize/2; y += cSize) {
        if ((floor((x + previewSize/2) / cSize) + floor((y + previewSize/2) / cSize)) % 2 === 0) fill(20, 20, 30);
        else fill(30, 30, 45);
        rect(x, y, cSize, cSize);
      }
    }
    
    // 4. 에셋 실제 내용 렌더링 (단일 이미지 vs 프레임 배열 감지)
    let val = gameImages[key];
    if (val instanceof p5.Image) {
      // 일반 이미지 프리뷰
      let scaleRatio = min(previewSize / val.width, previewSize / val.height, 1.0);
      let dw = val.width * scaleRatio;
      let dh = val.height * scaleRatio;
      imageMode(CENTER);
      image(val, 0, 0, dw, dh);
    } else if (Array.isArray(val) && val.length > 0) {
      // 노트북과 같은 프레임 애니메이션 프리뷰 (지정 프레임율로 연속 재생 루프)
      let fIndex = floor(frameCount / laptopAnimSpeed) % val.length;
      let img = val[fIndex];
      let scaleRatio = min(previewSize / img.width, previewSize / img.height, 1.0);
      let dw = img.width * scaleRatio;
      let dh = img.height * scaleRatio;
      imageMode(CENTER);
      image(img, 0, 0, dw, dh);
    }
    pop();

    // 5. 에셋 상세 메타 데이터 출력 (텍스트)
    textAlign(CENTER, TOP);
    textStyle(BOLD);
    textSize(14);
    fill(255);
    text(key, cx + cardW/2, cy + 120);

    textSize(11);
    textStyle(NORMAL);
    
    if (val instanceof p5.Image) {
      fill(150, 180, 255);
      text("단일 이미지 에셋", cx + cardW/2, cy + 145);
      fill(160, 160, 180);
      text(`해상도: ${val.width} x ${val.height}px`, cx + cardW/2, cy + 165);
    } else if (Array.isArray(val)) {
      fill(180, 140, 255);
      text(`루프 애니메이션 에셋`, cx + cardW/2, cy + 145);
      fill(160, 160, 180);
      text(`총 ${val.length}개 이미지 프레임`, cx + cardW/2, cy + 165);
    } else {
      fill(255, 100, 100);
      text("미확인 에셋 포맷", cx + cardW/2, cy + 145);
    }
  }
  
  pop();
}

// 탭 2-2: 에셋 상세조회 오버레이 모달 그리기
function drawAssetDetailModal() {
  push();
  
  // 전체 배경 디밍
  rectMode(CORNER);
  fill(5, 5, 10, 210);
  noStroke();
  rect(0, 0, width, height);

  // 모달 영역 산출 (정중앙 둥근 사각형)
  let mW = min(850, width - 100);
  let mH = min(580, height - 100);
  let mx = (width - mW) / 2;
  let my = (height - mH) / 2;

  fill(25, 25, 45);
  stroke(80, 80, 120);
  strokeWeight(2.5);
  rect(mx, my, mW, mH, 18);
  noStroke();

  // 모달 타이틀
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(22);
  fill(255);
  text(`에셋 인스펙터: ${selectedAssetKey}`, mx + 30, my + 30);

  // 구분선
  stroke(60, 60, 90);
  strokeWeight(1);
  line(mx + 30, my + 65, mx + mW - 30, my + 65);
  noStroke();

  // 닫기 (Close) 버튼 그리기
  let closeX = mx + mW - 50;
  let closeY = my + 30;
  let closeR = 16;
  let closeHover = dist(mouseX, mouseY, closeX, closeY) < closeR;
  if (closeHover) { fill(250, 80, 80); cursor(HAND); }
  else fill(80, 80, 100);
  ellipse(closeX, closeY, closeR * 2, closeR * 2);
  fill(255); textStyle(BOLD); textSize(14); textAlign(CENTER, CENTER);
  text("X", closeX, closeY);

  // 에셋 상세 유형 파악
  let val = gameImages[selectedAssetKey];
  let leftW = mW * 0.45; // 좌측은 프리뷰 영역
  let rightW = mW * 0.45; // 우측은 메타데이터 설명 및 조작부

  // 1. 대형 프리뷰 윈도우 (좌측 배치)
  let pX = mx + 30;
  let pY = my + 90;
  let pW = leftW;
  let pH = mH - 120;
  
  fill(12, 12, 22);
  stroke(55, 55, 80);
  strokeWeight(1.5);
  rect(pX, pY, pW, pH, 12);
  noStroke();

  // 프리뷰 체커 격자 그리기
  push();
  let chSize = 16;
  for (let x = pX + 2; x < pX + pW - 2; x += chSize) {
    for (let y = pY + 2; y < pY + pH - 2; y += chSize) {
      let cellW = min(chSize, pX + pW - x - 2);
      let cellH = min(chSize, pY + pH - y - 2);
      if ((floor((x - pX) / chSize) + floor((y - pY) / chSize)) % 2 === 0) fill(18, 18, 30);
      else fill(28, 28, 43);
      rect(x, y, cellW, cellH);
    }
  }
  pop();

  // 대형 렌더링 드로잉
  push();
  translate(pX + pW/2, pY + pH/2);
  imageMode(CENTER);
  
  if (val instanceof p5.Image) {
    let dw = val.width * assetZoomScale;
    let dh = val.height * assetZoomScale;
    // 프리뷰 영역 한도 넘지 못하도록 클램프 스케일링
    let scaleLimit = min(pW * 0.9 / dw, pH * 0.9 / dh);
    if (scaleLimit < 1.0) { dw *= scaleLimit; dh *= scaleLimit; }
    image(val, 0, 0, dw, dh);
  } else if (Array.isArray(val) && val.length > 0) {
    // 프레임 오버시 혹은 재생중일 때 표시 프레임 선정
    let activeFrame = 0;
    if (hoveredDetailFrame !== -1) {
      // 프레임 그리드 위에 마우스 올라간 경우 정지 프레임
      activeFrame = hoveredDetailFrame;
    } else if (isLaptopPlaying) {
      // 평상시 루프 플레이어
      activeFrame = floor(frameCount / laptopAnimSpeed) % val.length;
    } else {
      activeFrame = activeLaptopFrame;
    }
    
    let img = val[activeFrame];
    let dw = img.width * assetZoomScale;
    let dh = img.height * assetZoomScale;
    let scaleLimit = min(pW * 0.9 / dw, pH * 0.9 / dh);
    if (scaleLimit < 1.0) { dw *= scaleLimit; dh *= scaleLimit; }
    image(img, 0, 0, dw, dh);
  }
  pop();

  // 2. 우측 상세 메타데이터 명세표 및 스케일 조정 슬라이더
  let rX = mx + mW - rightW - 30;
  let rY = my + 90;

  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(20);
  fill(120, 200, 255);
  text(selectedAssetKey, rX, rY);

  textSize(13);
  textStyle(NORMAL);
  fill(160, 160, 185);
  
  let infoText = "";
  if (val instanceof p5.Image) {
    infoText = `유형: 싱글 정적 스프라이트 에셋\n해상도: ${val.width} x ${val.height} 픽셀 (px)\n비율: ${nfc(val.width/val.height, 2)}:1 가로세로비\n상태: 정상 로드 완료 (Active)\n\n메모리 주소: cache/images/${selectedAssetKey}.png\n\n이 에셋은 p5jsIcon 등 독립적인 발사체 혹은 플레이어 이동 애니메이션 스프라이트 한 프레임으로 활용됩니다.`;
  } else if (Array.isArray(val)) {
    infoText = `유형: 멀티 프레임 시퀀스 애니메이션 에셋\n해상도: ${val[0].width} x ${val[0].height} 픽셀 (px)\n프레임 수: 총 ${val.length}개 시퀀스 프레임 구성\n상태: 다이내믹 루프 가동 가능\n\n메모리 주소: cache/sequences/${selectedAssetKey}/*\n\n이 에셋은 노트북 폭발 연출처럼 프레임 시트가 나누어진 순차 드로잉 애니메이션 오브젝트입니다.`;
  }
  
  textLeading(22);
  text(infoText, rX, rY + 35, rightW, 200);

  // 줌 슬라이더 조절부 그리기
  let barY = rY + 230;
  fill(255); textStyle(BOLD); textSize(14);
  text("스프라이트 줌(Zoom) 확대 비율", rX, barY);
  
  // 슬라이더 바
  stroke(60, 60, 95); strokeWeight(3);
  line(rX, barY + 25, rX + rightW - 50, barY + 25);
  noStroke();

  // 슬라이더 손잡이
  let sliderMinX = rX;
  let sliderMaxX = rX + rightW - 50;
  let sliderKnobX = map(assetZoomScale, 0.5, 6.0, sliderMinX, sliderMaxX);
  
  let knobHover = dist(mouseX, mouseY, sliderKnobX, barY + 25) < 10;
  if (knobHover) { fill(120, 100, 255); cursor(HAND); }
  else fill(100, 70, 220);
  ellipse(sliderKnobX, barY + 25, 16, 16);
  
  fill(160, 160, 200); textSize(12); textStyle(NORMAL);
  text(`${nfc(assetZoomScale, 1)}x 배율`, rX + rightW - 40, barY + 28);

  // 드래그 조절 로직
  if (mouseIsPressed && mouseY > barY + 15 && mouseY < barY + 35 && mouseX > sliderMinX - 10 && mouseX < sliderMaxX + 10 && hoveredDetailFrame === -1) {
    assetZoomScale = constrain(map(mouseX, sliderMinX, sliderMaxX, 0.5, 6.0), 0.5, 6.0);
  }

  // 만약 애니메이션 프레임인 경우, 프레임 브라우징 및 플레이 버튼 제공
  if (Array.isArray(val)) {
    let ctrlY = barY + 60;
    fill(255); textStyle(BOLD); textSize(14);
    text("애니메이션 프레임 시트 (Frame Sheet)", rX, ctrlY);
    
    // 재생/일시정지 토글 버튼
    let playBtnX = rX + rightW - 80;
    let playBtnY = ctrlY - 4;
    let playBtnW = 80;
    let playBtnH = 24;
    let playBtnHover = mouseX > playBtnX && mouseX < playBtnX + playBtnW && mouseY > playBtnY && mouseY < playBtnY + playBtnH;
    
    if (playBtnHover) { fill(100, 100, 140); cursor(HAND); } else fill(60, 60, 85);
    rectMode(CORNER);
    rect(playBtnX, playBtnY, playBtnW, playBtnH, 5);
    fill(255); textStyle(BOLD); textSize(11); textAlign(CENTER, CENTER);
    text(isLaptopPlaying ? "일시 정지" : "시퀀스 재생", playBtnX + playBtnW/2, playBtnY + playBtnH/2);
    
    // 프레임 전체 썸네일 그리드 출력 (상세 프레임 시트 가시화)
    let frameCols = 6;
    let fGridX = rX;
    let fGridY = ctrlY + 30;
    let fSize = 45;
    let fGap = 8;
    
    hoveredDetailFrame = -1; // 매 프레임 마다 리셋
    
    for (let f = 0; f < val.length; f++) {
      let col = f % frameCols;
      let row = floor(f / frameCols);
      let fx = fGridX + col * (fSize + fGap);
      let fy = fGridY + row * (fSize + fGap);

      let isFrameHover = mouseX > fx && mouseX < fx + fSize && mouseY > fy && mouseY < fy + fSize;
      let isCurrentFrame = false;
      if (hoveredDetailFrame === -1 && isFrameHover) {
        hoveredDetailFrame = f;
      }
      
      let activeFrameIndex = 0;
      if (hoveredDetailFrame !== -1) activeFrameIndex = hoveredDetailFrame;
      else if (isLaptopPlaying) activeFrameIndex = floor(frameCount / laptopAnimSpeed) % val.length;
      else activeFrameIndex = activeLaptopFrame;
      
      isCurrentFrame = (f === activeFrameIndex);

      rectMode(CORNER);
      if (isFrameHover) {
        fill(60, 60, 95);
        stroke(120, 100, 255);
        strokeWeight(2);
        cursor(HAND);
      } else if (isCurrentFrame) {
        fill(45, 40, 75);
        stroke(255, 180, 100);
        strokeWeight(2);
      } else {
        fill(18, 18, 30);
        stroke(50, 50, 75);
        strokeWeight(1.5);
      }
      
      rect(fx, fy, fSize, fSize, 6);
      noStroke();

      // 프레임 투명 그리드 배경
      push();
      translate(fx + fSize/2, fy + fSize/2);
      let fcSize = 5;
      let fPreviewSize = 36;
      for (let x = -fPreviewSize/2; x < fPreviewSize/2; x += fcSize) {
        for (let y = -fPreviewSize/2; y < fPreviewSize/2; y += fcSize) {
          if ((floor((x + fPreviewSize/2) / fcSize) + floor((y + fPreviewSize/2) / fcSize)) % 2 === 0) fill(8, 8, 15);
          else fill(18, 18, 25);
          rect(x, y, fcSize, fcSize);
        }
      }
      
      // 썸네일 드로잉
      let img = val[f];
      let scaleRatio = min(fPreviewSize / img.width, fPreviewSize / img.height, 1.0);
      imageMode(CENTER);
      image(img, 0, 0, img.width * scaleRatio, img.height * scaleRatio);
      pop();
      
      // 프레임 번호
      fill(180, 180, 200);
      textSize(9);
      textStyle(BOLD);
      textAlign(RIGHT, BOTTOM);
      text(f + 1, fx + fSize - 4, fy + fSize - 2);
    }
  }

  pop();
}

// 뷰어 모드 전용 마우스 입력 처리 핸들러
function assetViewerMousePressed() {
  // 모달 팝업 인스펙터가 켜져있는 경우
  if (selectedAssetKey !== "") {
    let mW = min(850, width - 100);
    let mH = min(580, height - 100);
    let mx = (width - mW) / 2;
    let my = (height - mH) / 2;

    // 1. 우상단 닫기 X 버튼 클릭 여부
    let closeX = mx + mW - 50;
    let closeY = my + 30;
    if (dist(mouseX, mouseY, closeX, closeY) < 16) {
      selectedAssetKey = "";
      return;
    }

    // 2. 외부 어두운 오버레이 터치 시 팝업 닫기 처리
    if (mouseX < mx || mouseX > mx + mW || mouseY < my || mouseY > my + mH) {
      selectedAssetKey = "";
      return;
    }

    // 3. 노트북 재생/일시정지 버튼 클릭
    let val = gameImages[selectedAssetKey];
    if (Array.isArray(val)) {
      let rightW = mW * 0.45;
      let rX = mx + mW - rightW - 30;
      let rY = my + 90;
      let barY = rY + 230;
      let ctrlY = barY + 60;
      let playBtnX = rX + rightW - 80;
      let playBtnY = ctrlY - 4;
      let playBtnW = 80;
      let playBtnH = 24;

      if (mouseX > playBtnX && mouseX < playBtnX + playBtnW && mouseY > playBtnY && mouseY < playBtnY + playBtnH) {
        isLaptopPlaying = !isLaptopPlaying;
        if (!isLaptopPlaying) {
          activeLaptopFrame = floor(frameCount / laptopAnimSpeed) % val.length;
        }
        return;
      }

      // 4. 개별 프레임 그리드 직접 터치 시 해당 프레임 고정 일시 정지 피드백
      let frameCols = 6;
      let fGridX = rX;
      let fGridY = ctrlY + 30;
      let fSize = 45;
      let fGap = 8;
      for (let f = 0; f < val.length; f++) {
        let col = f % frameCols;
        let row = floor(f / frameCols);
        let fx = fGridX + col * (fSize + fGap);
        let fy = fGridY + row * (fSize + fGap);
        if (mouseX > fx && mouseX < fx + fSize && mouseY > fy && mouseY < fy + fSize) {
          isLaptopPlaying = false;
          activeLaptopFrame = f;
          return;
        }
      }
    }
    return;
  }

  // 1. 좌측 탭 전환 버튼 클릭 감지
  // 탭: 이펙트 쇼케이스
  if (mouseX > 15 && mouseX < 235 && mouseY > 85 && mouseY < 130) {
    viewerTab = "effects";
    selectedAssetKey = "";
    clearEffects();
    return;
  }
  // 탭: 에셋 브라우저
  if (mouseX > 15 && mouseX < 235 && mouseY > 140 && mouseY < 185) {
    viewerTab = "assets";
    selectedAssetKey = "";
    clearEffects();
    return;
  }

  // 2. 하단 메인 로비로 복귀 버튼 클릭 감지
  let exitX = 125;
  let exitY = height - 50;
  let exitW = 200;
  let exitH = 50;
  if (mouseX > exitX - exitW/2 && mouseX < exitX + exitW/2 && mouseY > exitY - exitH/2 && mouseY < exitY + exitH/2) {
    gameState = "LOBBY";
    clearEffects();
    return;
  }

  // 3. 탭별 고유 터치 조작 감지
  if (viewerTab === "effects") {
    // 3-A. 좌측 사이드바 이펙트 리스트 목록 선택
    let startY = 240;
    let itemH = 40;
    for (let i = 0; i < VIEWER_EFFECTS.length; i++) {
      let cy = startY + i * (itemH + 5);
      if (cy + itemH > height - 100) break;
      if (mouseX > 15 && mouseX < 235 && mouseY > cy && mouseY < cy + itemH) {
        selectedEffectIndex = i;
        autoPlayEffects = false;
        autoPlayTimer = 0;
        clearEffects();
        return;
      }
    }

    // 3-B. 프리뷰 격자 내부 우하단 자동재생 버튼 터치
    let canvasX = 260;
    let canvasY = 20;
    let canvasW = width - 280;
    let canvasH = height - 180;
    let infoY = height - 145;
    let infoH = 125;
    
    let btnX = canvasX + canvasW - 140;
    let btnY = infoY + infoH - 35;
    let btnW = 120;
    let btnH = 26;
    if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
      autoPlayEffects = !autoPlayEffects;
      autoPlayTimer = 0;
      return;
    }

    // 3-C. 프리뷰 격자 내부 빈 캔버스 영역 터치하여 즉발 이펙트 생성
    if (mouseX > canvasX && mouseX < canvasX + canvasW && mouseY > canvasY && mouseY < canvasY + canvasH) {
      // 캔버스 내부에 터치한 좌표 기반 즉시 소환
      VIEWER_EFFECTS[selectedEffectIndex].spawn(mouseX, mouseY);
    }

  } else {
    // 4. 에셋 브라우저 그리드 카드 클릭하여 상세 조회 열기
    let gridX = 270;
    let gridY = 40;
    let gridW = width - 290;
    let cardW = 180;
    let cardH = 210;
    let gap = 20;
    let startY = gridY + 65;
    let cols = max(1, floor(gridW / (cardW + gap)));
    let keys = Object.keys(gameImages);

    for (let i = 0; i < keys.length; i++) {
      let col = i % cols;
      let row = floor(i / cols);
      let cx = gridX + col * (cardW + gap);
      let cy = startY + row * (cardH + gap);

      if (cy + cardH > height - 20) continue;

      if (mouseX > cx && mouseX < cx + cardW && mouseY > cy && mouseY < cy + cardH) {
        selectedAssetKey = keys[i];
        assetZoomScale = 2.0;
        isLaptopPlaying = true;
        hoveredDetailFrame = -1;
        return;
      }
    }
  }
}
