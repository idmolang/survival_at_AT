// [AI 도움] USB 장판의 지속시간을 상향 조정하고, 쿨타임 대비 무한 증식을 방지하기 위해 최대 s.proj 개수 이하로만 활성화되도록 제한하는 제한기 로직을 설계 및 구현했습니다.
class UsbSkill extends Weapon {
  //레벨별 수치 조정
  static LEVEL_DATA = [
    { dmg: 12, cd: 90, dur: 240, proj: 1, area: 1.1, desc: "무작위 위치에 데미지 장판 생성" },
    { dmg: 15, cd: 90, dur: 300, proj: 2, area: 1.3, desc: "병 1개 추가, 크기 및 지속시간 증가" },
    { dmg: 25, cd: 90, dur: 300, proj: 3, area: 1.6, desc: "병 1개 추가, 데미지 및 크기 증가" },
    { dmg: 35, cd: 90, dur: 360, proj: 4, area: 1.7, desc: "병 1개 추가, 데미지 및 지속시간 증가" },
    { dmg: 55, cd: 90, dur: 360, proj: 4, area: 2.2, desc: "데미지 및 크기 대폭 증가" }
  ];
  static EVO_DATA = { dmg: 75, cd: 45, dur: 600, proj: 6, area: 2.8, desc: "거대 장판이 플레이어 쪽으로 모여듭니다." };

  constructor(owner) {
    super(owner);
    this.name = "USB 폭풍";
    this.id = "USB";
    this.zones = [];
  }

  update(stats) {
    let s = this.currentStats;
    let rate = max(30, s.cd * stats.cooldown);
    
    // 만약 어떤 이유로든 활성 장판 수가 s.proj 한도를 초과했다면 초과분을 먼저 제거
    while (this.zones.length > s.proj) {
      this.zones.shift();
    }

    if (frameCount % floor(rate) === 0) {
      // 최대 허용 개수(s.proj)보다 활성화된 장판이 적을 때만 차이만큼 충전 스폰
      let spawnCount = s.proj - this.zones.length;
      for (let i = 0; i < spawnCount; i++) {
        let zx = this.owner.x + random(-300, 300);
        let zy = this.owner.y + random(-300, 300);
        let rad = 50 * s.area * stats.area;

        // 휘몰아칠 파일들 정보 배열 초기 구성 (.js, .json, .py 등 코딩 파일 및 이진수)
        let fileTypes = ['.js', '.json', '.html', '.css', '.py', '.cpp', '.png', '.jpg', '1', '0', '1', '0'];
        let fileCount = 10 + floor(rad / 6);
        let files = [];
        for (let j = 0; j < fileCount; j++) {
          files.push({
            angle: random(TWO_PI),
            radius: random(15, rad),
            speed: random(0.015, 0.04) * (random() < 0.5 ? 1 : -1),
            size: random(10, 16),
            type: random(fileTypes),
            isFolder: random() < 0.45,
            floatOffset: random(TWO_PI)
          });
        }

        this.zones.push({
          x: zx,
          y: zy,
          dur: s.dur * stats.duration,
          maxDur: s.dur * stats.duration,
          files: files,
          connectAnim: 0
        });

        // 장판 생성 시 넓게 퍼지는 파란 충격파
        spawnEffect(new ShockwaveEffect(zx, zy, [80, 180, 255], rad));
      }
    }
    for (let i = this.zones.length - 1; i >= 0; i--) {
      let z = this.zones[i];
      z.dur--;

      // 꽂힘 애니메이션 진행
      if (z.connectAnim < 15) {
        z.connectAnim++;
        // 15프레임 시점(꽂히는 순간) 강렬한 전기 이펙트 및 충격파 1회 방출
        if (z.connectAnim === 15) {
          let rad = 50 * s.area * stats.area;
          spawnEffect(new ShockwaveEffect(z.x, z.y, [0, 255, 255], rad * 0.45));
          for (let k = 0; k < 8; k++) {
            spawnEffect(new SparkEffect(z.x, z.y, [0, 255, 255]));
          }
        }
      }

      // 파일 공전 각도 갱신
      if (z.files) {
        for (let f of z.files) {
          f.angle += f.speed;
        }
      }

      if (this.isEvolved) {
        let a = atan2(this.owner.y - z.y, this.owner.x - z.x);
        z.x += cos(a) * 1.5;
        z.y += sin(a) * 1.5;
      }
      if (z.dur <= 0) this.zones.splice(i, 1);
    }
  }

  display(stats) {
    let s = this.currentStats;
    let rad = 50 * s.area * stats.area;
    let dmg = s.dmg * stats.attack;

    for (let z of this.zones) {
      let lifeRatio = z.dur / z.maxDur;

      // 꽂히는 동안 공전 파일 궤도가 중심부에서 밖으로 확장됨 (0.1 ~ 1.0)
      let expandRatio = z.connectAnim < 15 ? lerp(0.1, 1.0, z.connectAnim / 15.0) : 1.0;

      push();

      // ── 0. 명확한 스킬 범위 경계선 렌더링 ──
      // 은은한 청색 알파 채널 영역 필링 (위험 지역)
      noStroke();
      fill(0, 140, 255, 10 * lifeRatio);
      ellipse(z.x, z.y, rad * 2, rad * 2);
      // 밝은 네온 청록 아웃라인 경계선
      noFill();
      stroke(0, 255, 255, 110 * lifeRatio);
      strokeWeight(1.5);
      ellipse(z.x, z.y, rad * 2, rad * 2);

      // ── 1. 공전 궤도 서클 (은은한 회전 트랙 느낌) ──
      noFill();
      strokeWeight(1.0);
      stroke(0, 150, 255, 12 * lifeRatio);
      ellipse(z.x, z.y, rad * 0.8 * expandRatio, rad * 0.8 * expandRatio);
      stroke(0, 150, 255, 22 * lifeRatio);
      ellipse(z.x, z.y, rad * 1.4 * expandRatio, rad * 1.4 * expandRatio);

      // ── 2. 바닥 네온 USB 포트 소켓 (가로 60, 세로 28로 스케일 업) ──
      rectMode(CENTER);
      fill(10, 20, 35, 160 * lifeRatio);
      stroke(0, 255, 255, 90 * lifeRatio);
      strokeWeight(1.5);
      rect(z.x, z.y, 60, 28, 5); // 외곽 하우징
      fill(0, 120, 255, 25 * lifeRatio);
      rect(z.x, z.y, 42, 10, 2);  // 포트 단자 코어

      // ── 3. USB 드라이브 꽂힘 렌더링 (애니메이션 및 크기 50px로 스케일 업) ──
      // 꽂히는 단계: 하늘 위에서 슥 내려오고 약간 기울어져서 꽂힘
      let insertY = 0;
      let insertAngle = 0;
      if (z.connectAnim < 15) {
        let t = z.connectAnim / 15.0;
        insertY = lerp(-50, -2, t);
        insertAngle = lerp(-0.4, 0, t);
      } else {
        insertY = -2;
        insertAngle = 0;
      }

      push();
      translate(z.x, z.y + insertY);
      rotate(insertAngle);

      if (gameImages.usb) {
        imageMode(CENTER);
        let pulse = sin(frameCount * 0.08) * 2.0;
        let usbSize = 70 + pulse; // 50 -> 70 스케일 업
        tint(200, 240, 255, 220 * lifeRatio);
        image(gameImages.usb, 0, 0, usbSize, usbSize);
      } else {
        fill(0, 200, 255, 150 * lifeRatio);
        rectMode(CENTER);
        rect(0, 0, 24, 30, 3);
      }
      pop();

      // ── 4. 탄생 시 사이버 네트워크 확산 플래시 ──
      if (z.connectAnim < 15) {
        let animRatio = z.connectAnim / 15.0;
        noFill();
        stroke(0, 255, 255, (1.0 - animRatio) * 200);
        strokeWeight(2.5 * (1.0 - animRatio) + 0.5);
        ellipse(z.x, z.y, rad * 2 * animRatio, rad * 2 * animRatio);
      }

      // ── 5. 휘몰아치는 파일 및 폴더 렌더링 ──
      if (z.files) {
        for (let f of z.files) {
          // 궤도 반지름에 expandRatio 연동
          let currentRad = f.radius * expandRatio;
          let fx = z.x + cos(f.angle) * currentRad;
          let fy = z.y + sin(f.angle) * currentRad;
          fy += sin(frameCount * 0.06 + f.floatOffset) * 2; // 가벼운 부유 운동

          if (f.isFolder) {
            // 네온 폴더 그리기
            // 뒷면 탭
            fill(0, 120, 255, 20 * lifeRatio);
            stroke(80, 200, 255, 100 * lifeRatio);
            strokeWeight(1.0);
            rectMode(CORNER);
            rect(fx - f.size * 0.4, fy - f.size * 0.45, f.size * 0.35, 3, 1);
            // 폴더 바디
            rect(fx - f.size * 0.5, fy - f.size * 0.3, f.size, f.size * 0.65, 1.5);
            // 삐져나온 서류 시트 (흰색 세부 묘사)
            noStroke();
            fill(255, 255, 255, 80 * lifeRatio);
            rect(fx - f.size * 0.2, fy - f.size * 0.4, f.size * 0.25, f.size * 0.25);
          } else {
            // 코딩 파일 확장자 / 이진수 텍스트 공전
            push();
            textFont('Courier New');
            textSize(9);
            textStyle(BOLD);
            textAlign(CENTER, CENTER);
            // 검은 그림자 섀도우
            fill(0, 0, 0, 150 * lifeRatio);
            text(f.type, fx + 1, fy + 1);
            // 네온 밝은 Cyan 텍스트
            fill(120, 240, 255, 200 * lifeRatio);
            text(f.type, fx, fy);
            pop();
          }
        }
      }

      pop();

      // ── 6. 히트 판정, 사이버 스파크 및 링크빔 활성화 ──
      // 완전히 꽂힌 프레임부터 데미지 타격 적용 가능
      if (z.connectAnim >= 15 && frameCount % 15 === 0) {
        for (let e of enemies) {
          if (dist(z.x, z.y, e.x, e.y) < rad) {
            e.takeDamage(dmg, z.x, z.y, 0);

            // 전자기 사이언 스파크
            spawnEffect(new SparkEffect(e.x, e.y, [80, 200, 255]));

            // 데이터 링크 스트림 광선 스폰 (USB 소켓 코어와 적 연결)
            spawnEffect(new DataLinkEffect(z.x, z.y, e.x, e.y));
          }
        }
      }
    }

    // ── 7. 전역 그리기 상태 누출 원천 차단 (UI 흔들림/어긋남 수정) ──
    // p5.js 기본값으로 복원: rectMode = CORNER, imageMode = CORNER
    rectMode(CORNER);
    imageMode(CORNER);
    textAlign(LEFT, BASELINE);
    textStyle(NORMAL);
    noTint();
  }
}
