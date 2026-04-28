let player;
let enemies = [];
let bullets = [];
let score = 0;
let reload = 40;

// 맵의 크기 (화면보다 훨씬 크게 설정)
const MAP_SIZE = 2000;

function setup() {
  createCanvas(800, 600);
  player = new Player();
}

function draw() {
  background(220);

  // --- 카메라 로직 시작 ---
  // 플레이어가 화면 중앙에 오도록 전체 좌표계를 이동시킵니다.
  push();
  let camX = width / 2 - player.x;
  let camY = height / 2 - player.y;
  translate(camX, camY);

  // 바닥 격자 그리기 (움직임을 시각적으로 확인하기 위함)
  drawGrid();

  // 플레이어 업데이트 및 출력
  player.update();
  player.display();

  // 일정 간격으로 적 생성 (플레이어 주변 무작위 위치)
  if (frameCount % 20 == 0) {
    enemies.push(new Enemy(player.x, player.y));
  }

  // 총알 처리
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].display();
    
    // 일정 거리 이상 멀어진 총알 제거
    if (bullets[i].isFar(player.x, player.y)) {
      bullets.splice(i, 1);
      continue;
    }

    // 충돌 검사
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (bullets[i] && bullets[i].hits(enemies[j])) {
        enemies.splice(j, 1);
        bullets.splice(i, 1);
        score += 10;
        break;
      }
    }
  }

  // 적 처리
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update(player.x, player.y);
    enemies[i].display();
  }

  // 자동 공격
  if (frameCount % reload == 0 && enemies.length > 0) {
    player.shoot();
  }
  
  pop(); 
  // --- 카메라 로직 끝 ---

  // UI (점수 등)는 카메라의 영향을 받지 않도록 push/pop 밖에 그립니다.
  fill(0);
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 20, 20);
}

function drawGrid() {
  stroke(180);
  for (let x = -MAP_SIZE; x <= MAP_SIZE; x += 100) {
    line(x, -MAP_SIZE, x, MAP_SIZE);
  }
  for (let y = -MAP_SIZE; y <= MAP_SIZE; y += 100) {
    line(-MAP_SIZE, y, MAP_SIZE, y);
  }
}

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.speed = 5;
  }

  update() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) this.x -= this.speed;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.x += this.speed;
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) this.y -= this.speed;
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) this.y += this.speed;
  }

  display() {
    fill(50, 100, 255);
    noStroke();
    ellipse(this.x, this.y, 35, 35);
  }

  shoot() {
    let closest = null;
    let minDist = 500; // 공격 사거리
    for (let e of enemies) {
      let d = dist(this.x, this.y, e.x, e.y);
      if (d < minDist) {
        minDist = d;
        closest = e;
      }
    }
    if (closest) {
      bullets.push(new Bullet(this.x, this.y, closest));
    }
  }
}

class Enemy {
  constructor(px, py) {
    // 플레이어 기준 화면 밖 반경에서 생성
    let angle = random(TWO_PI);
    let r = random(500, 700); 
    this.x = px + cos(angle) * r;
    this.y = py + sin(angle) * r;
    this.speed = 2;
  }

  update(px, py) {
    let angle = atan2(py - this.y, px - this.x);
    this.x += cos(angle) * this.speed;
    this.y += sin(angle) * this.speed;
  }

  display() {
    fill(255, 80, 80);
    rectMode(CENTER);
    rect(this.x, this.y, 25, 25);
  }
}

class Bullet {
  constructor(x, y, target) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.angle = atan2(target.y - y, target.x - x);
  }

  update() {
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
  }

  display() {
    fill(255, 255, 0);
    ellipse(this.x, this.y, 12, 12);
  }

  isFar(px, py) {
    return dist(this.x, this.y, px, py) > 1000;
  }

  hits(enemy) {
    return dist(this.x, this.y, enemy.x, enemy.y) < 20;
  }
}