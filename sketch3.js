let player;
let enemies = [];
let score = 0;
let nextLevelScore = 100;
const MAP_SIZE = 2000;

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player();
  
  // 초기 스킬 설정: 회전하는 무기
  player.addSkill(new OrbitSkill(player));
}

function draw() {
  background(20, 20, 30);

  // 1. 실시간 레벨업 체크 (점수에 따른 스킬 추가)
  if (score >= nextLevelScore) {
    levelUp();
  }

  // 2. 카메라 효과 시작 (플레이어를 화면 중앙에 고정)
  push();
  let camX = width / 2 - player.x;
  let camY = height / 2 - player.y;
  translate(camX, camY);

  // 배경 격자 그리기
  drawGrid();

  // 플레이어 로직 처리
  player.update();
  player.display();

  // 적 생성 (30프레임마다 플레이어 주변에 생성)
  if (frameCount % 30 == 0) {
    enemies.push(new Enemy(player.x, player.y));
  }

  // 적 업데이트 및 충돌 검사
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    e.update(player.x, player.y);
    e.display();

    // 플레이어의 모든 스킬로 적 공격 확인
    for (let s of player.skills) {
      if (s.checkHit(e)) {
        e.hp -= s.damage;
      }
    }

    // 사망 처리 및 점수 획득
    if (e.hp <= 0) {
      enemies.splice(i, 1);
      score += 10;
    }
  }
  
  pop(); // 카메라 효과 끝

  // 3. UI 렌더링 (카메라의 영향을 받지 않음)
  drawUI();
}

/** 점수에 따라 새로운 스킬 클래스를 인스턴스화하여 추가 */
function levelUp() {
  nextLevelScore += 200;
  
  if (player.skills.length === 1) {
    player.addSkill(new ShootSkill(player));
  } else if (player.skills.length === 2) {
    player.addSkill(new ZoneSkill(player));
  }
}

function drawGrid() {
  stroke(40, 40, 60);
  strokeWeight(1);
  for (let x = -MAP_SIZE; x <= MAP_SIZE; x += 100) {
    line(x, -MAP_SIZE, x, MAP_SIZE);
  }
  for (let y = -MAP_SIZE; y <= MAP_SIZE; y += 100) {
    line(-MAP_SIZE, y, MAP_SIZE, y);
  }
}

function drawUI() {
  fill(255);
  noStroke();
  textSize(24);
  textAlign(LEFT, TOP);
  text(`점수: ${score}`, 30, 30);
  text(`다음 스킬까지: ${nextLevelScore}`, 30, 65);
  
  textSize(16);
  fill(150, 150, 255);
  text(`활성화된 스킬: ${player.skills.length}개`, 30, 100);
}

// --- 클래스 정의 영역 ---

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.speed = 5;
    this.skills = [];
  }

  update() {
    // 키보드 이동 로직
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) this.x -= this.speed;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.x += this.speed;
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) this.y -= this.speed;
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) this.y += this.speed;

    // 월드 경계 제한
    this.x = constrain(this.x, -MAP_SIZE, MAP_SIZE);
    this.y = constrain(this.y, -MAP_SIZE, MAP_SIZE);

    // 보유한 모든 스킬 업데이트
    for (let s of this.skills) {
      s.update();
    }
  }

  display() {
    fill(50, 150, 255);
    stroke(255);
    strokeWeight(2);
    ellipse(this.x, this.y, 40, 40);

    for (let s of this.skills) {
      s.display();
    }
  }

  addSkill(skill) {
    this.skills.push(skill);
  }
}

class Enemy {
  constructor(px, py) {
    let angle = random(TWO_PI);
    let r = random(width/2 + 50, width/2 + 200); 
    this.x = px + cos(angle) * r;
    this.y = py + sin(angle) * r;
    this.speed = random(1.5, 2.5);
    this.hp = 100;
    this.maxHp = 100;
  }

  update(px, py) {
    let angle = atan2(py - this.y, px - this.x);
    this.x += cos(angle) * this.speed;
    this.y += sin(angle) * this.speed;
  }

  display() {
    push();
    translate(this.x, this.y);
    
    // 적 본체
    fill(255, 80, 80);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, 30, 30, 5);

    // 체력 바 표시
    fill(50);
    rect(0, -25, 34, 8);
    fill(255, 0, 0);
    let hpWidth = map(this.hp, 0, this.maxHp, 0, 30);
    rect(-15 + hpWidth/2, -25, hpWidth, 4);
    pop();
  }
}

// 스킬 1: 플레이어 주변을 회전하는 무기
class OrbitSkill {
  constructor(owner) {
    this.owner = owner;
    this.angle = 0;
    this.radius = 110;
    this.damage = 2;
    this.speed = 0.06;
  }
  update() { this.angle += this.speed; }
  display() {
    let sx = this.owner.x + cos(this.angle) * this.radius;
    let sy = this.owner.y + sin(this.angle) * this.radius;
    fill(255, 255, 100);
    noStroke();
    ellipse(sx, sy, 25, 25);
  }
  checkHit(enemy) {
    let sx = this.owner.x + cos(this.angle) * this.radius;
    let sy = this.owner.y + sin(this.angle) * this.radius;
    return dist(sx, sy, enemy.x, enemy.y) < 30;
  }
}

// 스킬 2: 가까운 적을 자동 추적하여 발사
class ShootSkill {
  constructor(owner) {
    this.owner = owner;
    this.projectiles = [];
    this.damage = 35;
    this.fireRate = 45;
  }
  update() {
    if (frameCount % this.fireRate == 0 && enemies.length > 0) {
      let target = this.getClosestEnemy();
      if (target) {
        this.projectiles.push(new Projectile(this.owner.x, this.owner.y, target));
      }
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.projectiles[i].update();
      if (this.projectiles[i].isFar(this.owner.x, this.owner.y)) {
        this.projectiles.splice(i, 1);
      }
    }
  }
  display() {
    for (let p of this.projectiles) p.display();
  }
  checkHit(enemy) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      if (dist(this.projectiles[i].x, this.projectiles[i].y, enemy.x, enemy.y) < 25) {
        this.projectiles.splice(i, 1);
        return true;
      }
    }
    return false;
  }
  getClosestEnemy() {
    let closest = null;
    let minDist = 600;
    for (let e of enemies) {
      let d = dist(this.owner.x, this.owner.y, e.x, e.y);
      if (d < minDist) {
        minDist = d;
        closest = e;
      }
    }
    return closest;
  }
}

// 스킬 3: 플레이어 주변 지속 데미지 영역
class ZoneSkill {
  constructor(owner) {
    this.owner = owner;
    this.radius = 160;
    this.damage = 0.8;
  }
  update() {}
  display() {
    noStroke();
    fill(150, 150, 255, 40);
    ellipse(this.owner.x, this.owner.y, this.radius * 2);
  }
  checkHit(enemy) {
    return dist(this.owner.x, this.owner.y, enemy.x, enemy.y) < this.radius;
  }
}

// 발사체 객체 정의
class Projectile {
  constructor(x, y, target) {
    this.x = x;
    this.y = y;
    this.speed = 12;
    this.angle = atan2(target.y - y, target.x - x);
  }
  update() {
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
  }
  display() {
    fill(255);
    noStroke();
    ellipse(this.x, this.y, 12, 12);
  }
  isFar(px, py) {
    return dist(this.x, this.y, px, py) > 800;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}