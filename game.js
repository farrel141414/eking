let player, playerImg;
let jumpButton, leftButton, rightButton;
let gravity = 1;
let moveLeft = false;
let moveRight = false;
let speed;
let platforms = [];
let platformSpeed = 2;
let platformCount = 21;
let unit;
let cameraOffsetY = 0;
let lastSpikeToggleTime = 0;
let spikeInterval = 2000;
let popup, popupButton;
let isPaused = false;

let particles = []; // Array untuk menyimpan partikel

function preload() {
  playerImg = loadImage("ekin.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  unit = width / 20;
  setupGame();
}

function setupGame() {
  player = {
    x: unit * 5,
    y: height - unit * 2,
    w: unit * 2,
    h: unit * 2,
    ySpeed: 0,
    isJumping: false,
    jumpStrength: -14
  };

  speed = unit * 0.5;
  cameraOffsetY = 0;
  platforms = [];

  for (let i = 0; i < platformCount - 1; i++) {
    platforms.push({
      x: random(unit * 2, width - unit * 4),
      y: height - i * unit * 4,
      w: unit * 5,
      h: unit,
      isMoving: i % 2 === 0,
      moveDir: 1,
      hasSpike: i % 2 === 1,
      spikeVisible: false
    });
  }

  let lastPlatform = platforms[platforms.length - 1];
  let platform21Y = lastPlatform.y - unit * 4;

  platforms.push({
    x: 0,
    y: platform21Y,
    w: width,
    h: unit,
    isMoving: false,
    hasSpike: false,
    spikeVisible: false
  });

  jumpButton = createButton("↑");
  jumpButton.size(unit * 4, unit * 3);
  jumpButton.position(width - unit * 4.5, height - unit * 4.5);
  jumpButton.touchStarted(() => {
    if (!player.isJumping && !isPaused) {
      player.ySpeed = player.jumpStrength;
      player.isJumping = true;
      createParticles(); // Membuat partikel saat lompat
    }
  });

  leftButton = createButton("◀");
  leftButton.size(unit * 3, unit * 3);
  leftButton.position(unit * 0.5, height - unit * 4.5);
  leftButton.touchStarted(() => moveLeft = true);
  leftButton.touchEnded(() => moveLeft = false);

  rightButton = createButton("▶");
  rightButton.size(unit * 3, unit * 3);
  rightButton.position(unit * 4, height - unit * 4.5);
  rightButton.touchStarted(() => moveRight = true);
  rightButton.touchEnded(() => moveRight = false);
}

function createParticles() {
  for (let i = 0; i < 10; i++) { // Buat beberapa partikel
    let p = {
      x: player.x + player.w / 2,  // Posisi partikel mengikuti karakter
      y: player.y + player.h / 2,
      size: random(3, 6),  // Ukuran kecil untuk bintang
      speedX: random(-1, 1),
      speedY: random(-3, -1), // Gerakan partikel ke atas
      life: 255 // Keberadaan partikel (opacity)
    };
    particles.push(p); // Menambahkan partikel ke array
  }
}

function draw() {
  if (isPaused) return;

  background(92, 148, 252);

  if (millis() - lastSpikeToggleTime > spikeInterval) {
    for (let pf of platforms) {
      if (pf.hasSpike) {
        pf.spikeVisible = !pf.spikeVisible;
      }
    }
    lastSpikeToggleTime = millis();
  }

  if (moveLeft) player.x -= speed;
  if (moveRight) player.x += speed;
  player.x = constrain(player.x, 0, width - player.w);

  player.y += player.ySpeed;
  player.ySpeed += gravity;

  let onPlatform = false;

  for (let pf of platforms) {
    let hit = player.x + player.w > pf.x &&
              player.x < pf.x + pf.w &&
              player.y + player.h <= pf.y &&
              player.y + player.h + player.ySpeed >= pf.y;

    if (hit) {
      player.y = pf.y - player.h;
      player.ySpeed = 0;
      onPlatform = true;

      // Karakter hanya ikut bergerak kalau platform bergerak dan bukan lantai dasar
      if (pf.isMoving && pf.y < height - unit) {
        player.x += platformSpeed * pf.moveDir;
        player.x = constrain(player.x, 0, width - player.w);
      }
    }

    // Gerakan platform yang bergerak
    if (pf.isMoving) {
      pf.x += platformSpeed * pf.moveDir;
      if (pf.x <= 0 || pf.x + pf.w >= width) {
        pf.moveDir *= -1;
      }
    }

    // Deteksi spike
    if (pf.hasSpike && pf.spikeVisible) {
      let spikeX = pf.x + pf.w / 2 - unit / 2;
      let spikeY = pf.y - unit;

      let hitSpike = player.x + player.w > spikeX &&
                     player.x < spikeX + unit &&
                     player.y + player.h > spikeY &&
                     player.y < spikeY + unit;

      if (hitSpike) {
        showPopup();
        return;
      }
    }
  }

  // Pastikan karakter tidak bergerak jika di lantai dasar
  if (player.y >= cameraOffsetY + height - player.h) {
    player.y = cameraOffsetY + height - player.h;
    player.ySpeed = 0;
    onPlatform = true;
  }

  player.isJumping = !onPlatform;

  let cameraTargetY = player.y - height / 3;
  if (cameraTargetY < cameraOffsetY) {
    cameraOffsetY = cameraTargetY;
  }

  push();
  translate(0, -cameraOffsetY);

  fill(100);
  rect(0, cameraOffsetY + height - 10, width, 10);

  fill(160, 82, 45);
  for (let pf of platforms) {
    rect(pf.x, pf.y, pf.w, pf.h);

    if (pf.hasSpike && pf.spikeVisible) {
      fill(255);
      triangle(
        pf.x + pf.w / 2 - unit / 2, pf.y,
        pf.x + pf.w / 2 + unit / 2, pf.y,
        pf.x + pf.w / 2, pf.y - unit
      );
      fill(160, 82, 45);
    }
  }

  let imgAspect = playerImg.height / playerImg.width;
  let imgW = player.w;
  let imgH = player.w * imgAspect;
  image(playerImg, player.x, player.y - (imgH - player.h), imgW, imgH);

  // Gambar dan perbarui partikel
  drawParticles();

  pop();
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.speedX;
    p.y += p.speedY;
    p.life -= 5; // Mengurangi opacity

    fill(255, 255, 0, p.life); // Warna kuning dan memudar
    noStroke();

    // Gambar bintang seperti di langit (lingkaran kecil)
    ellipse(p.x, p.y, p.size);

    if (p.life <= 0) {
      particles.splice(i, 1); // Menghapus partikel setelah mati
    }
  }
}

function showPopup() {
  popup = createDiv("Noo Ekin kena duri dan harus mulai dari awal😭");
  popup.style('font-size', '24px');
  popup.style('color', 'red');
  popup.style('text-align', 'center');
  popup.style('padding', '20px');
  popup.style('background-color', 'white');
  popup.style('border-radius', '10px');
  popup.style('box-shadow', '0px 4px 10px rgba(0, 0, 0, 0.2)');
  popup.position(width / 2 - 200, height / 2 - 100);
  popup.style('font-family', '"Roboto", sans-serif');
  popup.style('font-weight', '600');

  popupButton = createButton("Mulai Dari Awal😹");
  popupButton.size(100, 40);
  popupButton.position(width / 2 - 50, height / 2 + 30);
  popupButton.mousePressed(() => {
    popup.remove();
    popupButton.remove();
    restartGame();
    isPaused = false;
  });

  isPaused = true;
}

function restartGame() {
  jumpButton.remove();
  leftButton.remove();
  rightButton.remove();
  setupGame();
   }
