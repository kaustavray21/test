// # Not using now, but kept for reference.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const overlay = document.getElementById("overlay");
const statusMsg = document.getElementById("status-msg");
const winReason = document.getElementById("win-reason");
const progressBar = document.getElementById("progress-bar");
const powerupStatus = document.getElementById("powerup-status");

const TILE = 20;
const ROWS = 29;
const COLS = 29;
const SPEED = 2; // Must be divisor of TILE

// 29x29 Map (1=Wall, 2=Dot, 3=PowerPellet, 0=Empty)
const MAP_TEMPLATE = [
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1,
  ],
  [
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1,
    1, 1, 2, 1,
  ],
  [
    1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1,
    1, 1, 3, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1,
    1, 1, 2, 1,
  ],
  [
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1,
    1, 1, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1,
    1, 1, 2, 1,
  ],
  [
    1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2,
    2, 2, 2, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1,
    1, 1, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1,
    1, 1, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1,
    1, 1, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1,
    1, 1, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1,
    1, 1, 1, 1,
  ],
  [
    0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0,
    0, 0, 0, 0,
  ], // Tunnel
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1,
    1, 1, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1,
    1, 1, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1,
    1, 1, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1,
    1, 1, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1,
    1, 1, 1, 1,
  ],
  [
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1,
    1, 1, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1,
    1, 1, 2, 1,
  ],
  [
    1, 3, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1,
    2, 2, 3, 1,
  ],
  [
    1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1,
    2, 1, 1, 1,
  ],
  [
    1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1,
    2, 1, 1, 1,
  ],
  [
    1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2,
    2, 2, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 2, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1,
  ],
];

canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

// --- GLOBAL STATE ---
let board = [];
let score = 0;
let level = 1;
let gameLoopId;
let isRunning = false;
let totalDots = 0;
let dotsEaten = 0;

// Powerups
const POWERUPS = {
  NONE: 0,
  MAGNET: 1,
  FREEZE: 2,
  PYRO: 3,
  TORNADO: 4,
  TITANIUM: 5,
};
const POWERUP_ICONS = [" ", "M", "F", "P", "T", "S"];
const POWERUP_COLORS = [
  "",
  "#0000ff",
  "#00ffff",
  "#ff0000",
  "#ffffff",
  "#C0C0C0",
];

let powerupOnMap = { active: false, x: 0, y: 0, type: 0 };
let activeEffect = { type: 0, timer: 0 };
let spawnTimer = 0;

// Effect Entities
let fireTrails = []; // {x, y, timer}
let tornado = { active: false, x: 0, y: 0, dx: 0, dy: 0 };

// Player & Ghosts
let player = { x: 0, y: 0, dx: 0, dy: 0, nextDx: 0, nextDy: 0, mouth: 0 };
let ghosts = [];
let scaredTimer = 0;

const GHOST_CONFIG = [
  { color: "#FF0000", type: "chase" },
  { color: "#FFB8FF", type: "ambush" },
  { color: "#00FFFF", type: "patrol" },
  { color: "#FFB852", type: "random" },
];

// --- CONTROLS ---
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  },
  { passive: false }
);

document.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  "touchend",
  (e) => {
    if (!isRunning) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 20) {
        if (dx > 0) {
          player.nextDx = 1;
          player.nextDy = 0;
        } else {
          player.nextDx = -1;
          player.nextDy = 0;
        }
      }
    } else {
      if (Math.abs(dy) > 20) {
        if (dy > 0) {
          player.nextDx = 0;
          player.nextDy = 1;
        } else {
          player.nextDx = 0;
          player.nextDy = -1;
        }
      }
    }
  },
  { passive: false }
);

document.addEventListener("keydown", (e) => {
  if (!isRunning) return;
  const k = e.key.toLowerCase();
  if (k === "w" || k === "arrowup") {
    player.nextDx = 0;
    player.nextDy = -1;
  }
  if (k === "s" || k === "arrowdown") {
    player.nextDx = 0;
    player.nextDy = 1;
  }
  if (k === "a" || k === "arrowleft") {
    player.nextDx = -1;
    player.nextDy = 0;
  }
  if (k === "d" || k === "arrowright") {
    player.nextDx = 1;
    player.nextDy = 0;
  }
});

// --- GAME LOOP ---

function startGame() {
  score = 0;
  level = 1;
  resetLevel();
}

function resetLevel() {
  board = JSON.parse(JSON.stringify(MAP_TEMPLATE));
  totalDots = 0;
  dotsEaten = 0;
  board.forEach((row) =>
    row.forEach((cell) => {
      if (cell === 2 || cell === 3) totalDots++;
    })
  );

  scoreEl.innerText = score;
  levelEl.innerText = level;
  overlay.style.display = "none";
  scaredTimer = 0;
  activeEffect = { type: 0, timer: 0 };
  powerupOnMap.active = false;
  fireTrails = [];
  tornado.active = false;
  updateProgressBar();

  player = {
    x: 14 * TILE,
    y: 23 * TILE,
    dx: 0,
    dy: 0,
    nextDx: 0,
    nextDy: 0,
    mouth: 0,
  };

  ghosts = [];
  const count = Math.min(level + 1, 4);
  for (let i = 0; i < count; i++) {
    const cfg = GHOST_CONFIG[i % 4];
    ghosts.push({
      x: (13 + (i % 2)) * TILE,
      y: 14 * TILE,
      color: cfg.color,
      type: cfg.type,
      dx: 0,
      dy: 0,
      eaten: false,
    });
  }

  isRunning = true;
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  gameLoop();
}

function isWall(gx, gy) {
  if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return true;
  return board[gy][gx] === 1;
}

function gameLoop() {
  if (!isRunning) return;
  update();
  draw();
  gameLoopId = requestAnimationFrame(gameLoop);
}

function update() {
  if (scaredTimer > 0) scaredTimer--;
  if (activeEffect.timer > 0) {
    activeEffect.timer--;
    powerupStatus.style.visibility = "visible";
    powerupStatus.innerText = POWERUP_ICONS[activeEffect.type] + " ACTIVE";
    powerupStatus.style.color = POWERUP_COLORS[activeEffect.type];
  } else {
    if (activeEffect.type !== POWERUPS.NONE) {
      if (activeEffect.type === POWERUPS.TORNADO) tornado.active = false;
      activeEffect.type = POWERUPS.NONE;
    }
    powerupStatus.style.visibility = "hidden";
  }

  spawnTimer++;
  if (!powerupOnMap.active && activeEffect.type === 0 && spawnTimer > 600) {
    spawnPowerup();
    spawnTimer = 0;
  }

  movePlayer();

  if (activeEffect.type !== POWERUPS.FREEZE) {
    ghosts.forEach((g, i) => moveEntity(g, false, i));
  }

  handleSpecialEffects();
  checkCollisions();
}

function spawnPowerup() {
  let attempts = 0;
  while (attempts < 50) {
    let rx = Math.floor(Math.random() * COLS);
    let ry = Math.floor(Math.random() * ROWS);
    if (board[ry][rx] === 0 || board[ry][rx] === 2) {
      powerupOnMap = {
        active: true,
        x: rx,
        y: ry,
        type: Math.floor(Math.random() * 5) + 1,
      };
      break;
    }
    attempts++;
  }
}

function movePlayer() {
  const gx = Math.floor(player.x / TILE);
  const gy = Math.floor(player.y / TILE);
  const centered = player.x % TILE === 0 && player.y % TILE === 0;

  if (centered) {
    if (player.nextDx !== 0 || player.nextDy !== 0) {
      if (!isWall(gx + player.nextDx, gy + player.nextDy)) {
        player.dx = player.nextDx;
        player.dy = player.nextDy;
        player.nextDx = 0;
        player.nextDy = 0;
      }
    }
    if (isWall(gx + player.dx, gy + player.dy)) {
      player.dx = 0;
      player.dy = 0;
    }

    if (activeEffect.type === POWERUPS.PYRO) {
      fireTrails.push({ x: gx, y: gy, timer: 300 });
    }
  }

  // Fixed Player Speed to avoid de-sync
  let speed = SPEED;
  // NOTE: Removed Titanium Speed Boost because 20 is not divisible by 3.
  // This prevents the "Out of bounds/Wall Clipping" bug.

  player.x += player.dx * speed;
  player.y += player.dy * speed;

  // Tunnel Wrapping (Fixed)
  if (player.x > canvas.width) player.x = -TILE + 2;
  else if (player.x < -TILE) player.x = canvas.width - 2;

  player.mouth = (player.mouth + 0.2) % 4;
}

function moveEntity(entity, isPlayer, index) {
  // Speed logic: Eyes move fast, but check alignment to prevent skipping tiles
  let currentSpeed = SPEED;

  if (entity.eaten) {
    // Check if position is compatible with Speed 4 (divisible by 4)
    if (entity.x % 4 === 0 && entity.y % 4 === 0) {
      currentSpeed = SPEED * 2; // 4
    } else {
      currentSpeed = SPEED; // 2 (aligning phase)
    }
  }

  const gx = Math.floor(entity.x / TILE);
  const gy = Math.floor(entity.y / TILE);
  const centered = entity.x % TILE === 0 && entity.y % TILE === 0;

  if (centered) {
    handleGhostAI(entity, gx, gy, index);
  }
  entity.x += entity.dx * currentSpeed;
  entity.y += entity.dy * currentSpeed;
}

function bfs(gx, gy, tx, ty) {
  if (gx === tx && gy === ty) return { x: 0, y: 0 };
  let queue = [{ x: gx, y: gy, firstMove: null }];
  let visited = new Set();
  visited.add(`${gx},${gy}`);
  const moves = [
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 0 },
  ];

  let ops = 0;

  while (queue.length > 0 && ops < 400) {
    let curr = queue.shift();
    ops++;
    if (curr.x === tx && curr.y === ty) return curr.firstMove;
    for (let m of moves) {
      let nx = curr.x + m.x;
      let ny = curr.y + m.y;
      if (
        nx >= 0 &&
        nx < COLS &&
        ny >= 0 &&
        ny < ROWS &&
        board[ny][nx] !== 1 &&
        !visited.has(`${nx},${ny}`)
      ) {
        visited.add(`${nx},${ny}`);
        queue.push({ x: nx, y: ny, firstMove: curr.firstMove || m });
      }
    }
  }
  return { x: 0, y: 0 };
}

function handleGhostAI(ghost, gx, gy, index) {
  let tx, ty;
  if (ghost.eaten) {
    tx = 14;
    ty = 14; // Home
    if (Math.abs(gx - tx) < 2 && Math.abs(gy - ty) < 2) ghost.eaten = false;
  } else if (scaredTimer > 0) {
    const moves = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ].filter((m) => !isWall(gx + m.x, gy + m.y));
    if (moves.length) {
      const m = moves[Math.floor(Math.random() * moves.length)];
      ghost.dx = m.x;
      ghost.dy = m.y;
      return;
    }
  } else {
    const px = Math.floor(player.x / TILE);
    const py = Math.floor(player.y / TILE);
    if (ghost.type === "chase") {
      tx = px;
      ty = py;
    } else if (ghost.type === "ambush") {
      tx = px + player.dx * 4;
      ty = py + player.dy * 4;
    } else if (ghost.type === "patrol") {
      if (Math.abs(gx - px) + Math.abs(gy - py) > 10) {
        tx = px;
        ty = py;
      } else {
        tx = 1;
        ty = ROWS - 2;
      }
    } else {
      tx = Math.floor(Math.random() * COLS);
      ty = Math.floor(Math.random() * ROWS);
    }
  }
  tx = Math.max(1, Math.min(COLS - 2, tx));
  ty = Math.max(1, Math.min(ROWS - 2, ty));
  const best = bfs(gx, gy, tx, ty);
  if (best && (best.x !== 0 || best.y !== 0)) {
    ghost.dx = best.x;
    ghost.dy = best.y;
  } else {
    const moves = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ].filter((m) => !isWall(gx + m.x, gy + m.y));
    if (moves.length) {
      ghost.dx = moves[0].x;
      ghost.dy = moves[0].y;
    }
  }
}

function handleSpecialEffects() {
  if (activeEffect.type === POWERUPS.MAGNET) {
    const pgx = Math.floor((player.x + TILE / 2) / TILE);
    const pgy = Math.floor((player.y + TILE / 2) / TILE);
    const radius = 5;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        let nx = pgx + dx,
          ny = pgy + dy;
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
          if (board[ny][nx] === 2) {
            board[ny][nx] = 0;
            addScore(10);
          }
        }
      }
    }
  }

  for (let i = fireTrails.length - 1; i >= 0; i--) {
    fireTrails[i].timer--;
    if (fireTrails[i].timer <= 0) fireTrails.splice(i, 1);
    else {
      ghosts.forEach((g) => {
        const gx = Math.floor(g.x / TILE),
          gy = Math.floor(g.y / TILE);
        if (gx === fireTrails[i].x && gy === fireTrails[i].y && !g.eaten) {
          eatGhost(g);
        }
      });
    }
  }

  if (activeEffect.type === POWERUPS.TORNADO) {
    if (!tornado.active) {
      tornado = { active: true, x: player.x, y: player.y, dx: 0, dy: 0 };
    }
    // Tornado AI
    const tgx = Math.floor(tornado.x / TILE),
      tgy = Math.floor(tornado.y / TILE);
    if (tornado.x % TILE === 0 && tornado.y % TILE === 0) {
      let closest = null,
        minDist = 9999;
      ghosts.forEach((g) => {
        if (!g.eaten) {
          const d = Math.abs(g.x - tornado.x) + Math.abs(g.y - tornado.y);
          if (d < minDist) {
            minDist = d;
            closest = g;
          }
        }
      });
      if (closest) {
        const move = bfs(
          tgx,
          tgy,
          Math.floor(closest.x / TILE),
          Math.floor(closest.y / TILE)
        );
        tornado.dx = move.x;
        tornado.dy = move.y;
      } else {
        const moves = [
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
        ].filter((m) => !isWall(tgx + m.x, tgy + m.y));
        if (moves.length) {
          tornado.dx = moves[0].x;
          tornado.dy = moves[0].y;
        }
      }
    }

    // SPEED FIX: Tornado now moves at speed 4 (divisible by 20) to prevent desync
    tornado.x += tornado.dx * 4;
    tornado.y += tornado.dy * 4;

    ghosts.forEach((g) => {
      const dist = Math.hypot(tornado.x - g.x, tornado.y - g.y);
      if (dist < TILE && !g.eaten) eatGhost(g);
    });
  }
}

function checkCollisions() {
  const pgx = Math.floor((player.x + TILE / 2) / TILE);
  const pgy = Math.floor((player.y + TILE / 2) / TILE);

  const cell = board[pgy][pgx];
  if (cell === 2 || cell === 3) {
    board[pgy][pgx] = 0;
    if (cell === 2) addScore(10);
    if (cell === 3) {
      addScore(50);
      scaredTimer = 400;
    }
  }

  if (powerupOnMap.active && pgx === powerupOnMap.x && pgy === powerupOnMap.y) {
    activatePowerup(powerupOnMap.type);
    powerupOnMap.active = false;
  }

  ghosts.forEach((g) => {
    const dist = Math.hypot(player.x - g.x, player.y - g.y);
    if (dist < TILE - 5) {
      if (g.eaten) return;

      if (scaredTimer > 0 || activeEffect.type === POWERUPS.TITANIUM) {
        eatGhost(g);
      } else {
        isRunning = false;
        statusMsg.innerText = "GAME OVER";
        statusMsg.style.color = "red";
        winReason.innerText = `Score: ${score}`;
        overlay.style.display = "flex";
      }
    }
  });
}

function activatePowerup(type) {
  activeEffect = { type: type, timer: 600 };
  if (type === POWERUPS.TITANIUM) activeEffect.timer = 300;
  score += 100;
  scoreEl.innerText = score;
}

function eatGhost(g) {
  g.eaten = true;
  score += 200;
  scoreEl.innerText = score;
}

function addScore(pts) {
  score += pts;
  scoreEl.innerText = score;
  if (pts === 10) {
    dotsEaten++;
    updateProgressBar();
    if (dotsEaten >= totalDots * 0.8) {
      level++;
      alert(`Level ${level} Unlocked! (80% Cleared)`);
      resetLevel();
    }
  }
}

function updateProgressBar() {
  const pct = Math.min(100, (dotsEaten / (totalDots * 0.8)) * 100);
  const realPct = (dotsEaten / totalDots) * 100;
  progressBar.style.width = `${realPct}%`;

  if (realPct >= 80) progressBar.style.background = "#00ff00";
  else progressBar.style.background = "#ffcc00";
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE;
      const y = r * TILE;

      if (board[r][c] === 1) {
        ctx.strokeStyle = "#1919A6";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
      } else if (board[r][c] === 2) {
        ctx.fillStyle = "#ffb8ae";
        ctx.fillRect(x + TILE / 2 - 2, y + TILE / 2 - 2, 4, 4);
      } else if (board[r][c] === 3) {
        ctx.fillStyle =
          Math.floor(Date.now() / 200) % 2 === 0 ? "#ffb8ae" : "#ff0000";
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (powerupOnMap.active) {
    const px = powerupOnMap.x * TILE;
    const py = powerupOnMap.y * TILE;
    ctx.fillStyle = POWERUP_COLORS[powerupOnMap.type];
    ctx.font = "bold 16px Arial";
    ctx.fillText(POWERUP_ICONS[powerupOnMap.type], px + 4, py + 16);
  }

  fireTrails.forEach((f) => {
    ctx.fillStyle = `rgba(255, 69, 0, ${f.timer / 300})`;
    ctx.fillRect(f.x * TILE, f.y * TILE, TILE, TILE);
  });

  if (tornado.active) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    const tx = tornado.x + TILE / 2,
      ty = tornado.y + TILE / 2;
    ctx.arc(tx, ty, TILE, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + (Math.random() - 0.5) * 20, ty - 20);
    ctx.stroke();
  }

  const px = player.x + TILE / 2;
  const py = player.y + TILE / 2;
  ctx.fillStyle =
    activeEffect.type === POWERUPS.TITANIUM ? "#C0C0C0" : "yellow";
  ctx.beginPath();
  const angle = 0.2 * Math.PI * (Math.floor(player.mouth) % 2 === 0 ? 1 : 0.1);
  let rotation = 0;
  if (player.dx === -1) rotation = Math.PI;
  if (player.dx === 1) rotation = 0;
  if (player.dy === -1) rotation = -Math.PI / 2;
  if (player.dy === 1) rotation = Math.PI / 2;
  ctx.arc(
    px,
    py,
    TILE / 2 - 2,
    rotation + angle,
    rotation + (2 * Math.PI - angle)
  );
  ctx.lineTo(px, py);
  ctx.fill();

  if (activeEffect.type === POWERUPS.MAGNET) {
    ctx.strokeStyle = "rgba(0, 0, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(px, py, 5 * TILE, 0, Math.PI * 2);
    ctx.stroke();
  }

  ghosts.forEach((g) => {
    const gx = g.x + TILE / 2;
    const gy = g.y + TILE / 2;

    if (!g.eaten) {
      if (activeEffect.type === POWERUPS.FREEZE) ctx.fillStyle = "#00FFFF";
      else if (scaredTimer > 0)
        ctx.fillStyle =
          scaredTimer < 120 && Math.floor(Date.now() / 100) % 2 === 0
            ? "white"
            : "#0000FF";
      else ctx.fillStyle = g.color;

      ctx.beginPath();
      ctx.arc(gx, gy - 2, TILE / 2 - 2, Math.PI, 0);
      ctx.lineTo(gx + TILE / 2 - 2, gy + TILE / 2);
      ctx.lineTo(gx - TILE / 2 + 2, gy + TILE / 2);
      ctx.fill();
    }

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(gx - 3, gy - 4, 3, 0, Math.PI * 2);
    ctx.arc(gx + 3, gy - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "blue";
    ctx.beginPath();
    const lookX = g.dx * 2;
    const lookY = g.dy * 2;
    ctx.arc(gx - 3 + lookX, gy - 4 + lookY, 1.5, 0, Math.PI * 2);
    ctx.arc(gx + 3 + lookX, gy - 4 + lookY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

overlay.style.display = "flex";
statusMsg.innerText = "PAC-MAN V5.1";
statusMsg.style.color = "yellow";
winReason.innerText = "Collect 80% to Win | Use Powerups!";
document.querySelector("#overlay button").innerText = "START GAME";
