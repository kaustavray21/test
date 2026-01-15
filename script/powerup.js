// powerup.js

let powerupOnMap = { active: false, x: 0, y: 0, type: 0 };
let activeEffect = { type: 0, timer: 0 };
let tornado = { active: false, x: 0, y: 0, dx: 0, dy: 0 };
let fireTrails = []; // Defined Here
let spawnTimer = 0;

function resetPowerups(playerX, playerY) {
  powerupOnMap = { active: false, x: 0, y: 0, type: 0 };
  activeEffect = { type: 0, timer: 0 };
  tornado = { active: false, x: playerX || 0, y: playerY || 0, dx: 0, dy: 0 };
  fireTrails = [];
  spawnTimer = 0;
}

function activatePowerup(type) {
  activeEffect.type = type;

  // Default Duration (10s)
  activeEffect.timer = 600;

  // Specific Durations
  if (type === POWERUPS.TITANIUM) activeEffect.timer = 300; // 5s
  if (type === POWERUPS.FREEZE) activeEffect.timer = 300; // 5s
  if (type === POWERUPS.TORNADO) activeEffect.timer = 400; // ~6.5s

  // --- NEW POWERUP DURATIONS ---
  if (type === POWERUPS.SLOW) activeEffect.timer = 480; // 8s
  if (type === POWERUPS.DRILL) activeEffect.timer = 480; // 8s
  if (type === POWERUPS.BOOST) activeEffect.timer = 600; // 10s
}

function updatePowerups(board, player, ghosts, callbacks) {
  // 1. Manage Effect Timer
  if (activeEffect.timer > 0) {
    activeEffect.timer--;
    // Note: Pyro spawn logic is now exclusively in player.js (movement based)
  } else {
    // Timer expired
    if (activeEffect.type !== POWERUPS.NONE) {
      if (activeEffect.type === POWERUPS.TORNADO) tornado.active = false;
      activeEffect.type = POWERUPS.NONE;
    }
  }

  // 2. Spawn Logic
  spawnTimer++;
  if (!powerupOnMap.active && activeEffect.type === 0 && spawnTimer > 600) {
    spawnPowerup(board);
    spawnTimer = 0;
  }

  // 3. Handle Magnet
  if (activeEffect.type === POWERUPS.MAGNET) {
    const pgx = Math.floor((player.x + TILE / 2) / TILE);
    const pgy = Math.floor((player.y + TILE / 2) / TILE);
    const radius = 5;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        let nx = pgx + dx;
        let ny = pgy + dy;
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
          if (board[ny][nx] === 2) {
            // Dot
            board[ny][nx] = 0;
            callbacks.addScore(10);
          }
          if (board[ny][nx] === 3) {
            // Power Pellet
            board[ny][nx] = 0;
            callbacks.addScore(50);
          }
        }
      }
    }
  }

  // 4. Handle Tornado
  if (activeEffect.type === POWERUPS.TORNADO) {
    if (!tornado.active) {
      tornado.active = true;
      tornado.x = player.x;
      tornado.y = player.y;
    }

    // Tornado AI
    const tgx = Math.floor(tornado.x / TILE);
    const tgy = Math.floor(tornado.y / TILE);

    // Move only when aligned to grid to prevent getting stuck
    if (Math.abs(tornado.x % TILE) < 4 && Math.abs(tornado.y % TILE) < 4) {
      let closest = null;
      let minDist = 9999;

      ghosts.forEach((g) => {
        if (!g.eaten) {
          const d = Math.abs(g.x - tornado.x) + Math.abs(g.y - tornado.y);
          if (d < minDist) {
            minDist = d;
            closest = g;
          }
        }
      });

      if (closest && typeof bfs === "function") {
        const move = bfs(
          board,
          tgx,
          tgy,
          Math.floor(closest.x / TILE),
          Math.floor(closest.y / TILE)
        );
        tornado.dx = move.x;
        tornado.dy = move.y;
      } else {
        // Random move if no ghosts or bfs missing
        const moves = [
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
        ].filter((m) => !isWall(board, tgx + m.x, tgy + m.y));

        if (moves.length) {
          // Pick random valid move
          const rand = moves[Math.floor(Math.random() * moves.length)];
          tornado.dx = rand.x;
          tornado.dy = rand.y;
        }
      }
    }

    // Move Tornado (Speed 4)
    tornado.x += tornado.dx * 4;
    tornado.y += tornado.dy * 4;

    // Tornado Collision with Ghosts
    ghosts.forEach((g) => {
      const dist = Math.hypot(tornado.x - g.x, tornado.y - g.y);
      if (dist < TILE && !g.eaten) {
        callbacks.eatGhost(g);
      }
    });
  }

  // 5. Update Fire Trails
  for (let i = fireTrails.length - 1; i >= 0; i--) {
    fireTrails[i].timer--;
    if (fireTrails[i].timer <= 0) fireTrails.splice(i, 1);
  }
}

function spawnPowerup(board) {
  let attempts = 0;
  while (attempts < 50) {
    let rx = Math.floor(Math.random() * COLS);
    let ry = Math.floor(Math.random() * ROWS);
    // Can spawn on empty space (0) or dot (2)
    if (board[ry][rx] === 0 || board[ry][rx] === 2) {
      powerupOnMap = {
        active: true,
        x: rx,
        y: ry,
        // Updated to include new powerups (Types 1 to 8)
        type: Math.floor(Math.random() * 8) + 1,
      };
      break;
    }
    attempts++;
  }
}

// Helper for Tornado AI
function isWall(board, x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
  return board[y][x] === 1;
}
