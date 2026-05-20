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

class ObjectPool {
  constructor(createFn) { this.pool = []; this.createFn = createFn; }
  get(...args) {
    let obj = this.pool.length > 0 ? this.pool.pop() : this.createFn();
    if (obj.init) obj.init(...args);
    return obj;
  }
  release(obj) { if (obj.reset) obj.reset(); this.pool.push(obj); }
}

let enemyPool, damageTextPool, gemPool, projPool;

function setup() {
  createCanvas(windowWidth, windowHeight);
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
  player.addWeapon(new P5jsIconSkill(player));
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
}

function drawGame() {
  background(20, 20, 30);
  if (gameState === "IN_GAME" && gameFrames >= 54000) { gameState = "GAME_CLEAR"; return; }
  if (gameState === "IN_GAME" && score >= nextLevelExp) { levelUp(); return; }

  push();
  let camX = width / 2 - player.x; let camY = height / 2 - player.y;
  translate(camX, camY);
  drawGrid();

  if (gameState === "IN_GAME") { gameFrames++; player.update(); }

  for (let i = gems.length - 1; i >= 0; i--) {
    let g = gems[i];
    if (gameState === "IN_GAME") g.update(player);
    g.display();
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

    // 0분부터 15분까지 매 분 단위로 점진적으로 증가하는 곡선
    if (m < 2) {
      maxEnemies = 50 + m * 20;            // 50, 70
      spawnRate = 60 - m * 10;             // 60, 50
    } else if (m < 5) {
      maxEnemies = 100 + (m - 2) * 30;     // 100, 130, 160
      spawnRate = 40 - (m - 2) * 5;        // 40, 35, 30
    } else if (m < 7) {
      maxEnemies = 200 + (m - 5) * 50;     // 200, 250
      spawnRate = 20 - (m - 5) * 5;        // 20, 15
    } else if (m < 10) {
      maxEnemies = 350 + (m - 7) * 100;    // 350, 450, 550
      spawnRate = 10 - (m - 7) * 2;        // 10, 8, 6
    } else {
      maxEnemies = 800 + (m - 10) * 200;   // 800, 1000, 1200...
      spawnRate = max(1, 3 - floor((m - 10) / 2)); // 3, 3, 2, 2, 1
    }

    if (frameCount % spawnRate === 0 && enemies.length < maxEnemies) {
      enemies.push(enemyPool.get(player.x, player.y, m, level));
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    if (gameState === "IN_GAME") {
      e.update(player.x, player.y, enemies);
      if (dist(player.x, player.y, e.x, e.y) < 35) player.takeDamage(10);
      for (let w of player.weapons) w.checkHit ? w.checkHit(e) : null;
      for (let p of projectiles) p.checkHit(e);

      if (e.hp >= e.maxHp) {
        gems.push(gemPool.get(e.x, e.y, e.expValue));
        enemyPool.release(e); enemies.splice(i, 1);
        continue;
      }
    }
    e.display();
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    if (gameState === "IN_GAME") p.update();
    p.display();
    if (p.isDead) { projPool.release(p); projectiles.splice(i, 1); }
  }

  for (let i = damageTexts.length - 1; i >= 0; i--) {
    let dt = damageTexts[i];
    if (gameState === "IN_GAME") dt.update();
    dt.display();
    if (dt.isDead()) { damageTextPool.release(dt); damageTexts.splice(i, 1); }
  }

  pop();
  drawUI();
}

function drawGrid() {
  stroke(40, 40, 60); strokeWeight(1);
  for (let x = -MAP_SIZE; x <= MAP_SIZE; x += 100) line(x, -MAP_SIZE, x, MAP_SIZE);
  for (let y = -MAP_SIZE; y <= MAP_SIZE; y += 100) line(-MAP_SIZE, y, MAP_SIZE, y);
}

function drawUI() {
  fill(255); noStroke(); textAlign(LEFT, TOP); textSize(24);
  text(`EXP: ${floor(score)}`, 30, 110);

  let m = floor(gameFrames / 3600); let s = floor((gameFrames % 3600) / 60);
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

class Player {
  constructor() {
    this.x = 0; this.y = 0; this.speed = 5;
    this.weapons = []; this.passives = [];
    this.hp = 100; this.invincibleTimer = 0;
  }
  get stats() {
    let s = { maxHp: 100, hpRegen: 0, defense: 0, moveSpeed: this.speed, area: 1.0, cooldown: 1.0, attack: 1.0, duration: 1.0, exp: 1.0, magnet: 100 };
    for (let p of this.passives) {
      if (p.id === 'HakSik') s.maxHp += p.level * 20;
      else if (p.id === 'EnergyDrink') s.hpRegen += p.level * 0.1;
      else if (p.id === 'Shield') s.defense += p.level * 2;
      else if (p.id === 'AirForce') s.moveSpeed += p.level * 1.0;
      else if (p.id === 'Note') s.area += p.level * 0.15;
      else if (p.id === 'AirPod') s.cooldown *= Math.pow(0.85, p.level);
      else if (p.id === 'Passion') s.attack += p.level * 0.2;
      else if (p.id === 'Review') s.duration += p.level * 0.2;
      else if (p.id === 'Sleep') s.exp += p.level * 0.2;
    }
    return s;
  }
  takeDamage(amount) {
    if (this.invincibleTimer <= 0) {
      let finalDmg = max(1, amount - this.stats.defense);
      this.hp -= finalDmg; this.invincibleTimer = 30;
      if (this.hp <= 0) { this.hp = 0; gameState = "GAME_OVER"; }
    }
  }
  update() {
    let s = this.stats;
    if (this.hp < s.maxHp) this.hp = min(s.maxHp, this.hp + s.hpRegen);
    if (this.invincibleTimer > 0) this.invincibleTimer--;

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) this.x -= s.moveSpeed;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.x += s.moveSpeed;
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) this.y -= s.moveSpeed;
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) this.y += s.moveSpeed;
    this.x = constrain(this.x, -MAP_SIZE, MAP_SIZE); this.y = constrain(this.y, -MAP_SIZE, MAP_SIZE);

    for (let w of this.weapons) w.update(s);
  }
  display() {
    push();
    if (this.invincibleTimer > 0 && frameCount % 10 < 5) fill(255, 100, 100); else fill(50, 150, 255);
    stroke(255); strokeWeight(2); ellipse(this.x, this.y, 40, 40);
    noStroke(); fill(50); rectMode(CENTER); rect(this.x, this.y + 30, 40, 6);
    fill(50, 255, 50); rectMode(CORNER);
    let s = this.stats; let hpW = map(this.hp, 0, s.maxHp, 0, 40);
    rect(this.x - 20, this.y + 27, hpW, 6);
    pop();
    for (let w of this.weapons) w.display(s);
  }
  addWeapon(weapon) { if (this.weapons.length < 5) this.weapons.push(weapon); }
  addPassive(passive) { if (this.passives.length < 5) this.passives.push(passive); }
  hasPassive(id) { return this.passives.some(p => p.id === id); }
}

class Enemy {
  init(px, py, m, playerLevel) {
    let angle = random(TWO_PI); let r = random(width / 2 + 50, width / 2 + 200);
    this.x = px + cos(angle) * r; this.y = py + sin(angle) * r;
    this.speed = random(1.5, 2.5); this.hp = 0;
    this.maxHp = 10 + (m * m) * 2 + playerLevel * 2;
    this.vx = 0; this.vy = 0; this.expValue = 10 + m * 5;
  }
  reset() { }
  takeDamage(amount, sourceX, sourceY, knockback = 1.0) {
    this.hp += amount;
    if (knockback > 0) {
      let angle = atan2(this.y - sourceY, this.x - sourceX);
      this.vx = cos(angle) * knockback; this.vy = sin(angle) * knockback;
    }
    damageTexts.push(damageTextPool.get(this.x, this.y, amount));
  }
  update(px, py, enemiesList) {
    this.x += this.vx; this.y += this.vy; this.vx *= 0.85; this.vy *= 0.85;
    if (abs(this.vx) < 0.5 && abs(this.vy) < 0.5) {
      let angle = atan2(py - this.y, px - this.x);
      this.x += cos(angle) * this.speed; this.y += sin(angle) * this.speed;
    }
    for (let i = 0; i < 2; i++) { // Optimization: check fewer enemies
      let other = random(enemiesList);
      if (other && other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);
        if (d < 30 && d > 0) {
          let pushAngle = atan2(this.y - other.y, this.x - other.x);
          this.x += cos(pushAngle) * 1.5; this.y += sin(pushAngle) * 1.5;
        }
      }
    }
  }
  display() {
    push(); translate(this.x, this.y);
    let hpRatio = min(this.maxHp / 500, 1);
    fill(lerpColor(color(100, 200, 255), color(255, 50, 50), hpRatio));
    noStroke(); rectMode(CENTER); rect(0, 0, 30, 30, 5);

    // 체력바 (HP Bar) 렌더링 추가
    fill(50); rect(0, 22, 30, 5);
    fill(255, 50, 50);
    let remainingRatio = constrain(1 - (this.hp / this.maxHp), 0, 1);
    rectMode(CORNER);
    rect(-15, 19.5, 30 * remainingRatio, 5);
    pop();
  }
}

class Gem {
  init(x, y, expAmount) {
    this.x = x; this.y = y; this.expAmount = expAmount;
    this.isDead = false; this.collected = false; this.isMoving = false;
  }
  reset() { }
  update(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    if (d < player.stats.magnet) this.isMoving = true;
    if (this.isMoving) {
      let angle = atan2(player.y - this.y, player.x - this.x);
      this.x += cos(angle) * 12; this.y += sin(angle) * 12;
      if (d < 20) {
        this.isDead = true; this.collected = true;
        this.expAmount *= player.stats.exp;
      }
    }
  }
  display() {
    fill(50, 255, 100); stroke(20, 150, 50); strokeWeight(2);
    let size = this.expAmount > 20 ? 12 : 8;
    push(); translate(this.x, this.y); rotate(frameCount * 0.1);
    rectMode(CENTER); rect(0, 0, size, size); pop();
  }
}

class DamageText {
  init(x, y, damage) { this.x = x + random(-10, 10); this.y = y - 15; this.damage = floor(damage); this.life = 30; }
  reset() { }
  update() { this.y -= 1.5; this.life--; }
  display() {
    push(); fill(255, map(this.life, 0, 30, 0, 255));
    textSize(16); textAlign(CENTER, CENTER); textStyle(BOLD); text(this.damage, this.x, this.y); pop();
  }
  isDead() { return this.life <= 0; }
}

class Projectile {
  init(x, y, angle, damage, speed, piercing, size = 15, duration = 300, color = [255, 255, 255], isBounce = false, knockback = 1.0) {
    this.x = x; this.y = y; this.angle = angle; this.damage = damage;
    this.speed = speed; this.piercing = piercing; this.size = size;
    this.duration = duration; this.color = color; this.isBounce = isBounce;
    this.knockback = knockback;
    this.hitEnemies = new WeakSet(); this.isDead = false;
    this.vx = cos(this.angle) * this.speed; this.vy = sin(this.angle) * this.speed;
    this.isLaser = false;
    this.pierceCount = piercing ? 9999 : 0;
  }
  reset() { this.hitEnemies = new WeakSet(); }
  update() {
    this.x += this.vx; this.y += this.vy; this.duration--;
    if (this.duration <= 0) this.isDead = true;
    if (this.isBounce) {
      let camX = player.x - width / 2; let camY = player.y - height / 2;
      if (this.x < camX || this.x > camX + width) this.vx *= -1;
      if (this.y < camY || this.y > camY + height) this.vy *= -1;
    }
  }
  display() {
    if (this.isLaser) {
      push(); translate(this.x, this.y); rotate(this.angle);
      let alpha = map(this.duration, 0, 15, 0, 255);
      stroke(this.color[0], this.color[1], this.color[2], alpha);
      strokeWeight(this.size); line(0, 0, 800, 0); pop();
    } else {
      fill(this.color); noStroke(); ellipse(this.x, this.y, this.size, this.size);
    }
  }
  checkHit(e) {
    if (this.isLaser) return;
    if (this.hitEnemies.has(e)) return;
    if (dist(this.x, this.y, e.x, e.y) < this.size / 2 + 15) {
      e.takeDamage(this.damage, this.x, this.y, this.knockback);
      this.hitEnemies.add(e);
      if (this.pierceCount > 0) {
        this.pierceCount--;
      } else {
        this.isDead = true;
      }
    }
  }
}




// Base Weapon Class
class Weapon {
  constructor(owner) { this.owner = owner; this.level = 1; this.isEvolved = false; this.timer = 0; }
  get currentStats() { return this.isEvolved ? this.constructor.EVO_DATA : this.constructor.LEVEL_DATA[this.level - 1]; }
  levelUp() { if (this.level < 5) this.level++; else this.isEvolved = true; }
}

class P5jsIconSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 10, cd: 60, proj: 1, pierce: 0, desc: "가장 가까운 적에게 발사합니다." },
    { dmg: 10, cd: 48, proj: 2, pierce: 0, desc: "발사체 1개 증가, 쿨타임 감소" },
    { dmg: 20, cd: 48, proj: 3, pierce: 0, desc: "데미지 10 증가, 발사체 1개 증가" },
    { dmg: 20, cd: 36, proj: 3, pierce: 1, desc: "관통력 1 증가, 쿨타임 감소" },
    { dmg: 30, cd: 36, proj: 4, pierce: 1, desc: "데미지 10 증가, 발사체 1개 증가" }
  ];
  static EVO_DATA = { dmg: 40, cd: 10, proj: 4, pierce: 2, desc: "딜레이 없이 마법을 난사합니다." };

  constructor(owner) { super(owner); this.name = "P5jsIcon"; this.id = "P5js"; }
  update(stats) {
    let s = this.currentStats;
    let rate = max(5, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0 && enemies.length > 0) {
      let t = this.getClosest();
      if (t) {
        for (let i = 0; i < s.proj; i++) {
          let a = atan2(t.y - this.owner.y, t.x - this.owner.x) + (i - floor(s.proj / 2)) * 0.2;
          let p = projPool.get(this.owner.x, this.owner.y, a, s.dmg * stats.attack, 15, s.pierce > 0, 12, 100, [255, 100, 100], false, 1.5);
          p.pierceCount = s.pierce;
          projectiles.push(p);
        }
      }
    }
  }
  display() { }
  getClosest() {
    let closest = null; let minDist = 600;
    for (let e of enemies) {
      let d = dist(this.owner.x, this.owner.y, e.x, e.y);
      if (d < minDist) { minDist = d; closest = e; }
    }
    return closest;
  }
}

class UnibookSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 10, cd: 180, dur: 120, proj: 1, spd: 0.05, area: 1.0, desc: "플레이어 주변을 맴도는 책 생성" },
    { dmg: 10, cd: 180, dur: 150, proj: 2, spd: 0.07, area: 1.0, desc: "책 1개 추가, 속도 및 지속시간 증가" },
    { dmg: 10, cd: 180, dur: 150, proj: 3, spd: 0.09, area: 1.2, desc: "책 1개 추가, 범위 및 속도 증가" },
    { dmg: 15, cd: 180, dur: 180, proj: 4, spd: 0.09, area: 1.2, desc: "책 1개 추가, 지속시간 및 데미지 증가" },
    { dmg: 20, cd: 180, dur: 180, proj: 5, spd: 0.09, area: 1.2, desc: "책 1개 추가, 데미지 증가" }
  ];
  static EVO_DATA = { dmg: 30, cd: 1, dur: 999999, proj: 6, spd: 0.12, area: 1.5, desc: "책이 영구적으로 주변을 맴돕니다." };

  constructor(owner) { super(owner); this.name = "Unibook"; this.id = "Unibook"; this.angle = 0; this.activeTimer = 0; this.cooldownTimer = 0; }
  update(stats) {
    let s = this.currentStats;
    if (this.cooldownTimer > 0) {
      this.cooldownTimer--;
    } else {
      if (this.activeTimer <= 0) {
        this.activeTimer = s.dur * stats.duration;
      } else {
        this.activeTimer--;
        this.angle += s.spd;
        if (this.activeTimer <= 0 && !this.isEvolved) {
          this.cooldownTimer = s.cd * stats.cooldown;
        }
      }
    }
  }
  display(stats) {
    if (this.activeTimer <= 0 && !this.isEvolved) return;
    let s = this.currentStats;
    let radius = 100 * s.area * stats.area;
    let dmg = s.dmg * stats.attack;
    fill(200, 200, 100); noStroke();
    for (let i = 0; i < s.proj; i++) {
      let a = this.angle + (TWO_PI / s.proj) * i;
      let sx = this.owner.x + cos(a) * radius; let sy = this.owner.y + sin(a) * radius;
      ellipse(sx, sy, 20, 20);
      if (frameCount % 10 === 0) {
        for (let e of enemies) if (dist(sx, sy, e.x, e.y) < 30) e.takeDamage(dmg, sx, sy, 3.0);
      }
    }
  }
}

class UsbSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 5, cd: 120, dur: 120, proj: 1, area: 1.0, desc: "무작위 위치에 데미지 장판 생성" },
    { dmg: 5, cd: 120, dur: 150, proj: 2, area: 1.2, desc: "병 1개 추가, 크기 및 지속시간 증가" },
    { dmg: 10, cd: 120, dur: 150, proj: 3, area: 1.5, desc: "병 1개 추가, 데미지 및 크기 증가" },
    { dmg: 15, cd: 120, dur: 180, proj: 4, area: 1.5, desc: "병 1개 추가, 데미지 및 지속시간 증가" },
    { dmg: 25, cd: 120, dur: 180, proj: 4, area: 2.0, desc: "데미지 및 크기 대폭 증가" }
  ];
  static EVO_DATA = { dmg: 35, cd: 60, dur: 300, proj: 6, area: 2.5, desc: "거대 장판이 플레이어 쪽으로 모여듭니다." };

  constructor(owner) { super(owner); this.name = "USB"; this.id = "USB"; this.zones = []; }
  update(stats) {
    let s = this.currentStats;
    let rate = max(30, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0) {
      for (let i = 0; i < s.proj; i++) {
        let zx = this.owner.x + random(-300, 300);
        let zy = this.owner.y + random(-300, 300);
        this.zones.push({ x: zx, y: zy, dur: s.dur * stats.duration });
      }
    }
    for (let i = this.zones.length - 1; i >= 0; i--) {
      this.zones[i].dur--;
      if (this.isEvolved) {
        let a = atan2(this.owner.y - this.zones[i].y, this.owner.x - this.zones[i].x);
        this.zones[i].x += cos(a) * 1.5; this.zones[i].y += sin(a) * 1.5;
      }
      if (this.zones[i].dur <= 0) this.zones.splice(i, 1);
    }
  }
  display(stats) {
    let s = this.currentStats;
    let rad = 80 * s.area * stats.area;
    let dmg = s.dmg * stats.attack;
    noStroke(); fill(50, 100, 255, 100);
    for (let z of this.zones) {
      ellipse(z.x, z.y, rad * 2, rad * 2);
      if (frameCount % 15 === 0) {
        for (let e of enemies) if (dist(z.x, z.y, e.x, e.y) < rad) e.takeDamage(dmg, z.x, z.y, 0);
      }
    }
  }
}

class ProfessorCancelSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 9999, cd: 3600, desc: "화면 내 모든 적 처치 (쿨타임 60초)" },
    { dmg: 9999, cd: 3000, desc: "쿨타임 감소" },
    { dmg: 9999, cd: 2400, desc: "쿨타임 감소" },
    { dmg: 9999, cd: 1800, desc: "쿨타임 감소" },
    { dmg: 9999, cd: 1200, desc: "쿨타임 대폭 감소" }
  ];
  static EVO_DATA = { dmg: 99999, cd: 900, desc: "전체 적 처치 및 막대한 보너스 경험치 획득" };

  constructor(owner) { super(owner); this.name = "Professor"; this.id = "Professor"; }
  update(stats) {
    let s = this.currentStats;
    let rate = max(120, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0) {
      let dmg = s.dmg * stats.attack;
      for (let e of enemies) {
        e.takeDamage(dmg, e.x, e.y, 0);
        if (this.isEvolved) e.expValue *= 3; // 진화 시 경험치 3배
      }
      projectiles.push(projPool.get(player.x, player.y, 0, 0, 0, true, 2000, 20, [255, 255, 255, 200], false));
    }
  }
  display() { }
}

class WifiSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 2, area: 1.0, cd: 30, desc: "주변의 적에게 피해를 줍니다." },
    { dmg: 3, area: 1.2, cd: 30, desc: "크기 및 데미지 증가" },
    { dmg: 3, area: 1.4, cd: 20, desc: "피해 주기 감소, 크기 증가" },
    { dmg: 4, area: 1.6, cd: 20, desc: "데미지 및 크기 증가" },
    { dmg: 5, area: 1.6, cd: 15, desc: "데미지 증가, 피해 주기 감소" }
  ];
  static EVO_DATA = { dmg: 10, area: 2.0, cd: 10, desc: "타격 시 확률적으로 체력을 회복합니다." };

  constructor(owner) { super(owner); this.name = "WiFi"; this.id = "Wifi"; }
  update() { }
  display(stats) {
    let s = this.currentStats;
    let rad = 100 * s.area * stats.area;
    let dmg = s.dmg * stats.attack;
    fill(255, 255, 255, 50); noStroke(); ellipse(this.owner.x, this.owner.y, rad * 2, rad * 2);
    if (frameCount % s.cd === 0) {
      for (let e of enemies) {
        if (dist(this.owner.x, this.owner.y, e.x, e.y) < rad) {
          e.takeDamage(dmg, this.owner.x, this.owner.y, 3.0);
          if (this.isEvolved && random() < 0.05) this.owner.hp = min(this.owner.stats.maxHp, this.owner.hp + 1);
        }
      }
    }
  }
}

class MouseSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 10, cd: 120, dur: 300, proj: 1, spd: 8, desc: "적을 관통하고 화면 가장자리에서 튕깁니다." },
    { dmg: 10, cd: 120, dur: 400, proj: 1, spd: 10, desc: "속도 및 지속시간 증가" },
    { dmg: 10, cd: 120, dur: 400, proj: 2, spd: 10, desc: "발사체 1개 증가" },
    { dmg: 10, cd: 120, dur: 500, proj: 2, spd: 12, desc: "속도 및 지속시간 증가" },
    { dmg: 20, cd: 120, dur: 500, proj: 3, spd: 12, desc: "발사체 1개 증가, 데미지 증가" }
  ];
  static EVO_DATA = { dmg: 35, cd: 90, dur: 600, proj: 4, spd: 15, desc: "매우 빠르고 강하며 많이 발사됩니다." };

  constructor(owner) { super(owner); this.name = "Mouse"; this.id = "Mouse"; }
  update(stats) {
    let s = this.currentStats;
    let rate = max(30, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0) {
      for (let i = 0; i < s.proj; i++) {
        let a = random(TWO_PI);
        let dmg = s.dmg * stats.attack;
        let spd = s.spd * stats.moveSpeed; // 에어포스(이속) 시너지
        let dur = s.dur * stats.duration;
        projectiles.push(projPool.get(this.owner.x, this.owner.y, a, dmg, spd, true, 20, dur, [100, 200, 255], true, 0));
      }
    }
  }
  display() { }
}

class CrammingSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 20, cd: 150, proj: 1, area: 1.0, desc: "무작위 적에게 벼락이 떨어집니다." },
    { dmg: 20, cd: 150, proj: 2, area: 1.2, desc: "벼락 1개 추가, 범위 증가" },
    { dmg: 30, cd: 150, proj: 3, area: 1.2, desc: "벼락 1개 추가, 데미지 증가" },
    { dmg: 30, cd: 150, proj: 4, area: 1.5, desc: "벼락 1개 추가, 범위 증가" },
    { dmg: 45, cd: 150, proj: 5, area: 1.5, desc: "벼락 1개 추가, 데미지 증가" }
  ];
  static EVO_DATA = { dmg: 60, cd: 90, proj: 6, area: 2.0, desc: "벼락이 친 자리에 짧은 딜레이 후 두 번 타격합니다." };

  constructor(owner) { super(owner); this.name = "Cramming"; this.id = "Cramming"; this.echoes = []; }
  update(stats) {
    let s = this.currentStats;
    let rate = max(30, s.cd * stats.cooldown);

    // Echo logic for Evo
    for (let i = this.echoes.length - 1; i >= 0; i--) {
      this.echoes[i].timer--;
      if (this.echoes[i].timer <= 0) {
        let ec = this.echoes[i];
        for (let e of enemies) if (dist(e.x, e.y, ec.x, ec.y) < ec.rad) e.takeDamage(ec.dmg, e.x, e.y, 0);
        projectiles.push(projPool.get(ec.x, ec.y, 0, 0, 0, true, ec.rad * 2, 10, [255, 255, 200, 150], false));
        this.echoes.splice(i, 1);
      }
    }

    if (frameCount % floor(rate) === 0) {
      let dmg = s.dmg * stats.attack;
      let rad = 80 * s.area * stats.area;
      for (let i = 0; i < s.proj; i++) {
        if (enemies.length === 0) break;
        let t = random(enemies);
        for (let e of enemies) if (dist(e.x, e.y, t.x, t.y) < rad) e.takeDamage(dmg, e.x, e.y, 0);
        projectiles.push(projPool.get(t.x, t.y, 0, 0, 0, true, rad * 2, 10, [200, 255, 255, 150], false));
        if (this.isEvolved) this.echoes.push({ x: t.x, y: t.y, timer: 30, rad: rad, dmg: dmg });
      }
    }
  }
  display() { }
}

class SeniorSummonSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 40, cd: 180, proj: 1, area: 1.0, desc: "무작위 위치에 생성되어 일직선 레이저 발사" },
    { dmg: 60, cd: 180, proj: 1, area: 1.2, desc: "데미지 및 레이저 굵기 증가" },
    { dmg: 60, cd: 150, proj: 2, area: 1.2, desc: "블래스터 1개 추가, 쿨타임 감소" },
    { dmg: 80, cd: 150, proj: 2, area: 1.5, desc: "데미지 및 레이저 굵기 증가" },
    { dmg: 120, cd: 120, proj: 3, area: 1.5, desc: "블래스터 1개 추가, 쿨타임 감소" }
  ];
  static EVO_DATA = { dmg: 200, cd: 60, proj: 4, area: 3.0, desc: "화면을 뒤덮는 파괴적인 초거대 레이저 발사" };

  constructor(owner) { super(owner); this.name = "Senior"; this.id = "Senior"; this.blasters = []; }
  update(stats) {
    let s = this.currentStats;
    let rate = max(30, s.cd * stats.cooldown);

    if (frameCount % floor(rate) === 0) {
      for (let i = 0; i < s.proj; i++) {
        let bx = this.owner.x + random(-400, 400);
        let by = this.owner.y + random(-400, 400);
        let a = random(TWO_PI);
        if (enemies.length > 0) {
          let t = random(enemies);
          a = atan2(t.y - by, t.x - bx);
        }
        this.blasters.push({ x: bx, y: by, angle: a, timer: 30, fired: false }); // 30 frame delay
      }
    }

    for (let i = this.blasters.length - 1; i >= 0; i--) {
      let b = this.blasters[i];
      b.timer--;
      if (b.timer <= 0 && !b.fired) {
        b.fired = true;
        let dmg = s.dmg * stats.attack;
        let w = 20 * s.area * stats.area;
        for (let e of enemies) {
          let px = e.x - b.x; let py = e.y - b.y;
          let localX = px * cos(-b.angle) - py * sin(-b.angle);
          let localY = px * sin(-b.angle) + py * cos(-b.angle);
          if (localX > 0 && localX < 1200 && abs(localY) < w) e.takeDamage(dmg, b.x, b.y, 4.0);
        }
        let p = projPool.get(b.x, b.y, b.angle, 0, 0, true, w * 2, 15, [255, 0, 0, 200], false);
        p.isLaser = true; projectiles.push(p);
      }
      if (b.timer < -15) this.blasters.splice(i, 1);
    }
  }
  display(stats) {
    for (let b of this.blasters) {
      if (!b.fired) {
        push(); translate(b.x, b.y); rotate(b.angle);
        fill(255); noStroke(); ellipse(0, 0, 30, 30);
        fill(0); ellipse(5, -5, 5, 5); ellipse(5, 5, 5, 5); // Skull face indication
        stroke(255, 0, 0, 100); strokeWeight(2); line(0, 0, 800, 0); // Warning line
        pop();
      }
    }
  }
}

class LaptopSkill extends Weapon {
  static LEVEL_DATA = [
    { dmg: 40, cd: 240, proj: 1, area: 1.0, desc: "무작위 위치에 메테오가 떨어집니다." },
    { dmg: 60, cd: 240, proj: 2, area: 1.0, desc: "메테오 1개 추가, 데미지 증가" },
    { dmg: 60, cd: 210, proj: 2, area: 1.2, desc: "쿨타임 감소, 범위 증가" },
    { dmg: 80, cd: 210, proj: 3, area: 1.2, desc: "메테오 1개 추가, 데미지 증가" },
    { dmg: 100, cd: 180, proj: 3, area: 1.5, desc: "쿨타임 감소, 데미지 및 범위 증가" }
  ];
  static EVO_DATA = { dmg: 180, cd: 60, proj: 5, area: 2.0, desc: "엄청난 수의 파괴적인 메테오가 지속적으로 떨어집니다." };

  constructor(owner) { super(owner); this.name = "Laptop"; this.id = "Laptop"; }
  update(stats) {
    let s = this.currentStats;
    let rate = max(15, s.cd * stats.cooldown);
    if (frameCount % floor(rate) === 0) {
      for (let i = 0; i < s.proj; i++) {
        let mx = this.owner.x + random(-400, 400); let my = this.owner.y + random(-400, 400);
        let rad = 150 * s.area * stats.area;
        let dmg = s.dmg * stats.attack;
        for (let e of enemies) if (dist(mx, my, e.x, e.y) < rad) e.takeDamage(dmg, mx, my, 2.0);
        projectiles.push(projPool.get(mx, my, 0, 0, 0, true, rad * 2, 20, [255, 100, 50, 150], false));
      }
    }
  }
  display() { }
}




class Passive {
  constructor(name, id) { this.name = name; this.id = id; this.level = 1; }
  levelUp() { if (this.level < 5) this.level++; }
}

const WEAPONS_INFO = [
  { class: P5jsIconSkill, passiveInfo: 'Passion', name: 'P5jsIcon (Magic Wand)' },
  { class: UnibookSkill, passiveInfo: 'Review', name: 'Unibook (Bible)' },
  { class: MouseSkill, passiveInfo: 'AirForce', name: 'Mouse (Runetracer)' },
  { class: UsbSkill, passiveInfo: 'Note', name: 'USB (Santa Water)' },
  { class: LaptopSkill, passiveInfo: 'AirPod', name: 'Laptop (Meteor)' },
  { class: WifiSkill, passiveInfo: 'HakSik', name: 'WiFi (Garlic)' },
  { class: SeniorSummonSkill, passiveInfo: 'Shield', name: 'Senior (Gaster Blaster)' },
  { class: ProfessorCancelSkill, passiveInfo: 'Sleep', name: 'Professor (Pentagram)' },
  { class: CrammingSkill, passiveInfo: 'EnergyDrink', name: 'Cramming (Lightning)' }
];

const PASSIVES_INFO = [
  { id: 'Passion', name: '슝슝이의 열정 (Attack)' },
  { id: 'Review', name: '복습 (Duration)' },
  { id: 'AirForce', name: '에어포스 (Speed)' },
  { id: 'Note', name: '노트정리 (Area)' },
  { id: 'AirPod', name: '에어팟 (Cooldown)' },
  { id: 'HakSik', name: '학식 (Max HP)' },
  { id: 'Shield', name: '슝슝이의 가호 (Defense)' },
  { id: 'Sleep', name: '수면 (EXP)' },
  { id: 'EnergyDrink', name: '에너지드링크 (Regen)' }
];

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
        pool.push({ type: 'weapon', info: info, isUpgrade: true, isEvo: false, existing: existing });
      } else if (existing.level === 5 && !existing.isEvolved) {
        if (player.hasPassive(info.passiveInfo)) {
          pool.push({ type: 'weapon', info: info, isUpgrade: true, isEvo: true, existing: existing });
        }
      }
    } else {
      if (player.weapons.length < 5) pool.push({ type: 'weapon', info: info, isUpgrade: false, isEvo: false });
    }
  }

  for (let info of PASSIVES_INFO) {
    let existing = player.passives.find(p => p.id === info.id);
    if (existing) {
      if (existing.level < 5) pool.push({ type: 'passive', info: info, isUpgrade: true, isEvo: false, existing: existing });
    } else {
      if (player.passives.length < 5) pool.push({ type: 'passive', info: info, isUpgrade: false, isEvo: false });
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
  push(); fill(0, 0, 0, 150); rectMode(CORNER); noStroke(); rect(0, 0, width, height);
  fill(255); textAlign(CENTER, CENTER); textSize(50); textStyle(BOLD);
  text("레벨 업!", width / 2, height / 4);
  textSize(24); textStyle(NORMAL); text("능력을 선택하세요:", width / 2, height / 4 + 60);

  let cardW = 280; let cardH = 350; let spacing = 40;
  let startX = width / 2 - cardW - spacing; let startY = height / 2 + 50;

  rectMode(CENTER);
  for (let i = 0; i < skillChoices.length; i++) {
    let choice = skillChoices[i];
    let cx = startX + i * (cardW + spacing); let cy = startY;
    let isHover = mouseX > cx - cardW / 2 && mouseX < cx + cardW / 2 && mouseY > cy - cardH / 2 && mouseY < cy + cardH / 2;

    if (isHover) { fill(80, 80, 100); cursor(HAND); } else { fill(50, 50, 70); }
    if (choice.isEvo) { stroke(255, 100, 100); fill(isHover ? color(100, 60, 60) : color(80, 40, 40)); }
    else { stroke(255, 215, 0); }

    strokeWeight(isHover ? 4 : 2); rect(cx, cy, cardW, cardH, 20); noStroke();

    if (choice.isEvo) { fill(255, 100, 100); textSize(20); textStyle(BOLD); text("★ 궁극기 진화 ★", cx, cy - cardH / 2 + 40); }
    else {
      fill(choice.isUpgrade ? color(100, 255, 100) : color(255, 255, 100));
      textSize(20); textStyle(BOLD); text(choice.isUpgrade ? "레벨 업" : "신규 획득", cx, cy - cardH / 2 + 40);
    }

    fill(255); textSize(24); text(choice.info.name, cx, cy - cardH / 2 + 80);
    fill(200); textSize(16); textStyle(NORMAL);

    rectMode(CENTER);
    if (choice.type === 'weapon') {
      if (choice.isEvo) {
        text(choice.info.class.EVO_DATA.desc, cx, cy + 20, cardW - 20, 100);
      } else if (choice.isUpgrade) {
        text(`Level: ${choice.existing.level} -> ${choice.existing.level + 1}`, cx, cy);
        text(choice.info.class.LEVEL_DATA[choice.existing.level].desc, cx, cy + 50, cardW - 20, 100);
      } else {
        text("새로운 무기", cx, cy);
        text(choice.info.class.LEVEL_DATA[0].desc, cx, cy + 50, cardW - 20, 100);
      }
      fill(150, 200, 255); text(`필요 패시브: ${choice.info.passiveInfo}`, cx, cy + 130);
    } else {
      text(choice.isUpgrade ? `Level: ${choice.existing.level} -> ${choice.existing.level + 1}` : "새로운 패시브", cx, cy);
      text("관련 능력치 상승", cx, cy + 50);
    }
  }
  pop();
}

function drawLobby() {
  background(20, 20, 30);
  fill(255); textAlign(CENTER, CENTER); textSize(80); textStyle(BOLD); text("아텍에서 살아남기", width / 2, height / 3);
  rectMode(CENTER); textStyle(NORMAL);

  let btns = [{ label: "게임 시작", yOffset: 50 }, { label: "게임 방법", yOffset: 140 }, { label: "테스트 모드", yOffset: 230 }];
  for (let b of btns) {
    let bx = width / 2; let by = height / 2 + b.yOffset; let bw = 250; let bh = 60;
    let hover = mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2;
    if (hover) { fill(80, 180, 255); cursor(HAND); } else { fill(50, 150, 255); }
    if (b.label === "테스트 모드") { if (hover) fill(200, 50, 50); else fill(150, 40, 40); }
    rect(bx, by, bw, bh, 15); fill(255); textSize(28); text(b.label, bx, by);
  }
}

function drawHowToPlay() {
  background(20, 20, 30); fill(255); textAlign(CENTER, CENTER); textSize(50); textStyle(BOLD);
  text("게임 방법", width / 2, height / 5);
  textStyle(NORMAL); textSize(24); textAlign(LEFT, TOP);
  let startX = width / 2 - 300; let startY = height / 5 + 100;
  text("- W, A, S, D 이동", startX, startY);
  text("- 적을 처치하고 보석을 먹어 레벨업", startX, startY + 40);
  text("- 최대 5개의 무기와 5개의 패시브 선택 가능", startX, startY + 80);
  text("- 무기 5레벨 + 특정 패시브 보유 시 진화 가능", startX, startY + 120);

  let backBtnX = width / 2; let backBtnY = height - 150; let backBtnW = 250; let backBtnH = 60;
  rectMode(CENTER); textAlign(CENTER, CENTER);
  if (mouseX > backBtnX - backBtnW / 2 && mouseX < backBtnX + backBtnW / 2 && mouseY > backBtnY - backBtnH / 2 && mouseY < backBtnY + backBtnH / 2) {
    fill(100); cursor(HAND);
  } else fill(70);
  rect(backBtnX, backBtnY, backBtnW, backBtnH, 15); fill(255); textSize(28); text("돌아가기", backBtnX, backBtnY);
}

function drawGameOver() {
  push(); fill(0, 0, 0, 200); rectMode(CORNER); noStroke(); rect(0, 0, width, height);
  fill(255, 50, 50); textAlign(CENTER, CENTER); textSize(80); textStyle(BOLD); text("게임 오버", width / 2, height / 3);
  fill(255); textSize(30); text(`최종 EXP: ${floor(score)}`, width / 2, height / 2);
  let btnX = width / 2; let btnY = height / 2 + 80; let btnW = 250; let btnH = 60;
  rectMode(CENTER);
  if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 && mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) { fill(100, 100, 150); cursor(HAND); } else fill(70, 70, 100);
  stroke(255); strokeWeight(2); rect(btnX, btnY, btnW, btnH, 15); fill(255); noStroke(); textSize(24); text("로비로", btnX, btnY); pop();
}

function drawGameClear() {
  push(); fill(255, 255, 255, 200); rectMode(CORNER); noStroke(); rect(0, 0, width, height);
  fill(50, 150, 255); textAlign(CENTER, CENTER); textSize(80); textStyle(BOLD); text("🎉 GAME CLEAR! 🎉", width / 2, height / 3);
  fill(50); textSize(30); text(`15분 생존! / 최종 EXP: ${floor(score)}`, width / 2, height / 2 - 20);
  let btnX = width / 2; let btnY = height / 2 + 80; let btnW = 250; let btnH = 60;
  rectMode(CENTER);
  if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 && mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) { fill(200, 200, 250); cursor(HAND); } else fill(230, 230, 250);
  stroke(100, 150, 255); strokeWeight(2); rect(btnX, btnY, btnW, btnH, 15); fill(50, 100, 200); noStroke(); textSize(24); text("로비로", btnX, btnY); pop();
}

function drawTestSkillSelect() {
  background(20, 20, 30); fill(255); textAlign(CENTER, CENTER); textSize(40); textStyle(BOLD);
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
  rect(btnX, btnY, btnW, btnH, 15); fill(0); textSize(24); text(isTestModeWeaponSelect ? "다음 (패시브 선택)" : "테스트 시작!", btnX, btnY);
}

function mousePressed() {
  if (gameState === "LOBBY") {
    let bx = width / 2; let by = height / 2 + 50; let bw = 250; let bh = 60;
    if (mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2) { initGame(); gameState = "IN_GAME"; }
    by = height / 2 + 140;
    if (mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2) gameState = "HOW_TO_PLAY";
    by = height / 2 + 230;
    if (mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2) {
      testSelectedWeapons = []; testSelectedPassives = []; isTestModeWeaponSelect = true; gameState = "TEST_SKILL_SELECT";
    }
  } else if (gameState === "HOW_TO_PLAY" || gameState === "GAME_OVER" || gameState === "GAME_CLEAR") {
    let bx = width / 2; let by = height - 150; let bw = 250; let bh = 60;
    if (gameState !== "HOW_TO_PLAY") by = height / 2 + 80;
    if (mouseX > bx - bw / 2 && mouseX < bx + bw / 2 && mouseY > by - bh / 2 && mouseY < by + bh / 2) gameState = "LOBBY";
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
        gameFrames = 36000; // 테스트 모드는 10분부터 시작
        gameState = "IN_GAME";
      }
    }
  } else if (gameState === "LEVEL_UP") {
    let cardW = 280; let cardH = 350; let spacing = 40;
    let startX = width / 2 - cardW - spacing; let startY = height / 2 + 50;
    for (let i = 0; i < skillChoices.length; i++) {
      let cx = startX + i * (cardW + spacing); let cy = startY;
      if (mouseX > cx - cardW / 2 && mouseX < cx + cardW / 2 && mouseY > cy - cardH / 2 && mouseY < cy + cardH / 2) {
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
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
