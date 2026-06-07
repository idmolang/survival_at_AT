// ─────────────────────────────────────────────
// Effect Manager — 모든 이펙트를 관리하는 전역 시스템
// ─────────────────────────────────────────────

let activeEffects = [];

// 새 이펙트 스폰 (외부에서 호출)
function spawnEffect(effectInstance) {
  activeEffects.push(effectInstance);
}

// 게임 루프에서 매 프레임 호출 (월드 좌표계 안에서)
function updateAndDrawEffects() {
  for (let i = activeEffects.length - 1; i >= 0; i--) {
    let fx = activeEffects[i];
    fx.update();
    // 온스크린이거나 월드 좌표(x, y)가 정의되지 않은 특수 이펙트인 경우에만 드로잉 연산 수행
    if (fx.x === undefined || fx.y === undefined || isOnScreen(fx.x, fx.y, 80)) {
      fx.display();
    }
    if (fx.isDead) activeEffects.splice(i, 1);
  }
}

// 화면 플래시 같이 UI 좌표계에서 그려야 하는 이펙트 (pop() 이후, draw 마지막에 호출)
// update()는 updateAndDrawEffects()에서 이미 처리됨 → 여기서는 display만
function updateAndDrawScreenEffects() {
  for (let fx of activeEffects) {
    if (fx.isScreenEffect && !fx.isDead) {
      fx.displayScreen();
    }
  }
}

// 게임 리셋 시 전체 클리어
function clearEffects() {
  activeEffects = [];
}
