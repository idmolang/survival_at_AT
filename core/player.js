class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.speed = 5;
    this.weapons = [];
    this.passives = [];
    this.hp = 100;
    this.invincibleTimer = 0;
    this.direction = 'down'; // 'down', 'left', 'right', 'up'
  }
  get stats() {
    let s = {
      maxHp: 100,
      hpRegen: 0,
      defense: 0,
      moveSpeed: this.speed,
      area: 1.0,
      cooldown: 1.0,
      attack: 1.0,
      duration: 1.0,
      exp: 1.0,
      magnet: 100
    };
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
      this.hp -= finalDmg;
      this.invincibleTimer = 30;
      if (this.hp <= 0) {
        this.hp = 0;
        gameState = "GAME_OVER";
      }
    }
  }
  update() {
    let s = this.stats;
    if (this.hp < s.maxHp) this.hp = min(s.maxHp, this.hp + s.hpRegen);
    if (this.invincibleTimer > 0) this.invincibleTimer--;
    
    let dx = 0;
    let dy = 0;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      this.x -= s.moveSpeed;
      dx = -1;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      this.x += s.moveSpeed;
      dx = 1;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
      this.y -= s.moveSpeed;
      dy = -1;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
      this.y += s.moveSpeed;
      dy = 1;
    }
    
    // 움직임이 있을 때 방향 상태 업데이트
    if (dx !== 0 || dy !== 0) {
      if (dx < 0) {
        this.direction = 'left';
      } else if (dx > 0) {
        this.direction = 'right';
      } else if (dy < 0) {
        this.direction = 'up';
      } else if (dy > 0) {
        this.direction = 'down';
      }
    }
    
    this.x = constrain(this.x, -MAP_SIZE, MAP_SIZE);
    this.y = constrain(this.y, -MAP_SIZE, MAP_SIZE);
    for (let w of this.weapons) w.update(s);
  }
  display() {
    push();
    
    // 피격 시 빨간 깜빡임 효과 및 틴트 적용
    if (this.invincibleTimer > 0 && frameCount % 10 < 5) {
      tint(255, 100, 100, 150);
    }
    
    // 캐릭터 이미지 렌더링 (방향 상태에 맞는 이미지 선택)
    push();
    translate(this.x, this.y - 8);
    imageMode(CENTER);
    
    let sprite = null;
    if (this.direction === 'left') sprite = gameImages.player_left;
    else if (this.direction === 'right') sprite = gameImages.player_right;
    else if (this.direction === 'up') sprite = gameImages.player_up;
    else sprite = gameImages.player_down;
    
    if (sprite) {
      image(sprite, 0, 0, 40, 75);
    } else {
      // 폴백용 원형 드로잉
      fill(50, 150, 255);
      stroke(255);
      strokeWeight(2);
      ellipse(0, 8, 40, 40);
    }
    pop();
    
    // HP 바 배경
    noStroke();
    fill(50);
    rectMode(CENTER);
    rect(this.x, this.y + 30, 40, 6);
    
    // HP 바 체력 표시
    fill(50, 255, 50);
    rectMode(CORNER);
    let s = this.stats;
    let hpW = map(this.hp, 0, s.maxHp, 0, 40);
    rect(this.x - 20, this.y + 27, hpW, 6);
    
    pop();
    for (let w of this.weapons) w.display(s);
  }
  addWeapon(weapon) {
    if (this.weapons.length < 5) this.weapons.push(weapon);
  }
  addPassive(passive) {
    if (this.passives.length < 5) this.passives.push(passive);
  }
  hasPassive(id) {
    return this.passives.some(p => p.id === id);
  }
}
