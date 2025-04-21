let player, playerImg;
let jumpButton, leftButton, rightButton;
let gravity = 1;
let moveLeft = false;
let moveRight = false;
let speed;
let platforms = [];
let platformSpeed = 2;
let platformCount = 10;
let unit;

function preload() {
  playerImg = loadImage("ekin.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  unit = width / 20;

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

  // Bikin platform
  for (let i = 0; i < platformCount; i++) {
    let platformHeight = height - i * unit * 4;
    platforms.push({
      x: random(unit * 2, width - unit * 4),
      y: platformHeight,
      w: unit * 5,
      h: unit,
      isMoving: i % 2 === 0,
      moveDir: 1
    });
  }

  // Tombol lompat
  jumpButton = createButton("Lompat");
  jumpButton.size(unit * 3, unit * 2);
  jumpButton.position(width - unit * 3.5, height - unit * 2.5);
  jumpButton.touchStarted(() => {
    if (!player.isJumping) {
      player.ySpeed = player.jumpStrength;
      player.isJumping = true;
    }
  });

  // Tombol kiri
  leftButton = createButton("◀");
  leftButton.size(unit * 2, unit * 2);
  leftButton.position(unit * 0.5, height - unit * 2.5);
  leftButton.touchStarted(() => moveLeft = true);
  leftButton.touchEnded(() => moveLeft = false);

  // Tombol kanan
  rightButton = createButton("▶");
  rightButton.size(unit * 2, unit * 2);
  rightButton.position(unit * 3, height - unit * 2.5);
  rightButton.touchStarted(() => moveRight = true);
  rightButton.touchEnded(() => moveRight = false);
}

function draw() {
  background(92, 148, 252); // langit biru

  if (moveLeft) player.x -= speed;
  if (moveRight) player.x += speed;

  player.y += player.ySpeed;
  player.ySpeed += gravity;

  let onPlatform = false;

  for (let pf of platforms) {
    let hit =
      player.x + player.w > pf.x &&
      player.x < pf.x + pf.w &&
      player.y + player.h <= pf.y &&
      player.y + player.h + player.ySpeed >= pf.y;

    if (hit) {
      player.y = pf.y - player.h;
      player.ySpeed = 0;
      onPlatform = true;
    }

    if (pf.isMoving) {
      pf.x += platformSpeed * pf.moveDir;
      if (pf.x <= 0 || pf.x + pf.w >= width) {
        pf.moveDir *= -1;
      }
    }
  }

  if (player.y >= height - player.h) {
    player.y = height - player.h;
    player.ySpeed = 0;
    onPlatform = true;
  }

  player.isJumping = !onPlatform;

  // Lantai
  fill(100);
  rect(0, height - 10, width, 10);

  // Platform
  fill(160, 82, 45);
  for (let pf of platforms) {
    rect(pf.x, pf.y, pf.w, pf.h);
  }

  // Gambar karakter dengan menjaga rasio gambar
  let imgAspect = playerImg.height / playerImg.width;
  let imgW = player.w;
  let imgH = player.w * imgAspect;
  image(playerImg, player.x, player.y - (imgH - player.h), imgW, imgH);
}