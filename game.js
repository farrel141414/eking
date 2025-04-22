let player, playerImg;
let jumpButton, leftButton, rightButton;
let gravity = 1;
let moveLeft = false;
let moveRight = false;
let speed;
let platforms = [];
let platformSpeed = 2;
let platformCount = 21; // Mengubah jumlah platform menjadi 21
let unit;
let cameraOffsetY = 0;
let lastSpikeToggleTime = 0;
let spikeInterval = 2000; // 2 detik
let popup, popupButton;  // Variabel untuk pop-up
let isPaused = false;  // Variabel untuk kontrol pause

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

  // Membuat 20 platform sebelumnya
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

  // Menambahkan platform ke-21 yang mengisi seluruh layar
  let lastPlatform = platforms[platforms.length - 1];
  let platform21Y = lastPlatform.y - unit * 4; // Platform ke-21 berada di atas platform ke-20

  platforms.push({
    x: 0,
    y: platform21Y, // Platform ke-21 berada tepat setelah platform ke-20
    w: width,  // Platform mengisi seluruh lebar layar
    h: unit,  // Tinggi platform
    isMoving: false,  // Platform ini tidak bergerak
    hasSpike: false,  // Platform ke-21 tidak ada durinya
    spikeVisible: false
  });

  // Tombol dengan ukuran lebih besar dan menggunakan panah ke atas
  jumpButton = createButton("↑");
  jumpButton.size(unit * 4, unit * 3);  // Ukuran tombol diperbesar
  jumpButton.position(width - unit * 4.5, height - unit * 4.5);  // Menyesuaikan posisi
  jumpButton.touchStarted(() => {
    if (!player.isJumping && !isPaused) {
      player.ySpeed = player.jumpStrength;
      player.isJumping = true;
    }
  });

  leftButton = createButton("◀");
  leftButton.size(unit * 3, unit * 3);  // Ukuran tombol diperbesar
  leftButton.position(unit * 0.5, height - unit * 4.5);  // Menyesuaikan posisi
  leftButton.touchStarted(() => moveLeft = true);
  leftButton.touchEnded(() => moveLeft = false);

  rightButton = createButton("▶");
  rightButton.size(unit * 3, unit * 3);  // Ukuran tombol diperbesar
  rightButton.position(unit * 4, height - unit * 4.5);  // Menyesuaikan posisi
  rightButton.touchStarted(() => moveRight = true);
  rightButton.touchEnded(() => moveRight = false);
}

function draw() {
  if (isPaused) return;  // Hentikan game jika dalam keadaan pause

  background(92, 148, 252);

  // Update duri tiap 2 detik
  if (millis() - lastSpikeToggleTime > spikeInterval) {
    for (let pf of platforms) {
      if (pf.hasSpike) {
        pf.spikeVisible = !pf.spikeVisible;
      }
    }
    lastSpikeToggleTime = millis();
  }

  // Gerakan horizontal
  if (moveLeft) player.x -= speed;
  if (moveRight) player.x += speed;
  player.x = constrain(player.x, 0, width - player.w);

  // Fisika vertikal
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
      player.ySpeed = 0; // Reset kecepatan vertikal saat mendarat
      onPlatform = true;
    }

    if (pf.isMoving) {
      pf.x += platformSpeed * pf.moveDir;
      if (pf.x <= 0 || pf.x + pf.w >= width) {
        pf.moveDir *= -1;
      }
    }

    // Cek tabrakan dengan duri
    if (pf.hasSpike && pf.spikeVisible) {
      let spikeX = pf.x + pf.w / 2 - unit / 2;
      let spikeY = pf.y - unit;

      let hitSpike = player.x + player.w > spikeX &&
                     player.x < spikeX + unit &&
                     player.y + player.h > spikeY &&
                     player.y < spikeY + unit;

      if (hitSpike) {
        showPopup();  // Menampilkan pop-up
        return;
      }
    }
  }

  // Jika karakter jatuh ke bawah layar dan tidak ada platform, restart
  if (player.y >= cameraOffsetY + height - player.h) {
    player.y = cameraOffsetY + height - player.h; // Agar karakter tidak melewati batas
    player.ySpeed = 0; // Hentikan kecepatan jatuh
    onPlatform = true;
  }

  player.isJumping = !onPlatform;

  // Kamera mengikuti pemain
  let cameraTargetY = player.y - height / 3;
  if (cameraTargetY < cameraOffsetY) {
    cameraOffsetY = cameraTargetY;
  }

  // Gambar semua dengan translate kamera
  push();
  translate(0, -cameraOffsetY);

  // Lantai
  fill(100);
  rect(0, cameraOffsetY + height - 10, width, 10);

  // Platform & duri
  fill(160, 82, 45);
  for (let pf of platforms) {
    rect(pf.x, pf.y, pf.w, pf.h);

    if (pf.hasSpike && pf.spikeVisible) {
      fill(255); // duri putih
      triangle(
        pf.x + pf.w / 2 - unit / 2, pf.y,             // kiri bawah
        pf.x + pf.w / 2 + unit / 2, pf.y,             // kanan bawah
        pf.x + pf.w / 2, pf.y - unit                  // ujung atas (tajam)
      );
      fill(160, 82, 45); // reset warna platform
    }
  }

  // Gambar karakter
  let imgAspect = playerImg.height / playerImg.width;
  let imgW = player.w;
  let imgH = player.w * imgAspect;
  image(playerImg, player.x, player.y - (imgH - player.h), imgW, imgH);

  pop();
}

function showPopup() {
  // Membuat pop-up dengan pesan dan tombol "Oke"
  popup = createDiv("Noo Ekin kena duri dan harus mulai dari awal😭");
  popup.style('font-size', '24px');
  popup.style('color', 'red');
  popup.style('text-align', 'center');
  popup.style('padding', '20px');
  popup.style('background-color', 'white');
  popup.style('border-radius', '10px');
  popup.style('box-shadow', '0px 4px 10px rgba(0, 0, 0, 0.2)');
  popup.position(width / 2 - 200, height / 2 - 100);

  // Menggunakan font yang lebih modern dan sedikit tebal
  popup.style('font-family', '"Roboto", sans-serif');
  popup.style('font-weight', '600');  // Menambah ketebalan font

  // Membuat tombol Oke
  popupButton = createButton("Mulai Dari Awal😹");
  popupButton.size(100, 40);
  popupButton.position(width / 2 - 50, height / 2 + 30);
  popupButton.mousePressed(() => {
    popup.remove();  // Menghapus pop-up
    popupButton.remove();  // Menghapus tombol "Oke"
    restartGame();  // Memulai ulang permainan
    isPaused = false;  // Melanjutkan game setelah tombol "Oke"
  });

  isPaused = true;  // Pause game saat pop-up muncul
}

function restartGame() {
  // Hapus tombol lama biar tidak dobel
  jumpButton.remove();
  leftButton.remove();
  rightButton.remove();
  setupGame();
                       }
