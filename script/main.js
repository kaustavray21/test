// main.js

// --- GLOBAL STATE ---
let board = [];
let score = 0;
let level = 1;
let gameLoopId;
let isRunning = false;
let totalDots = 0;
let dotsEaten = 0;
let scaredTimer = 0;

// Initialize
initUI(COLS * TILE, ROWS * TILE);
bindStartButton(startGame);
initInput(() => isRunning); // Pass a checker function so input knows if game is running

function startGame() {
  score = 0;
  level = 1;
  resetLevel();
}

function resetLevel() {
  // Deep copy map from constants.js
  board = JSON.parse(JSON.stringify(MAP_TEMPLATE));

  // Count dots
  totalDots = 0;
  dotsEaten = 0;
  board.forEach((row) =>
    row.forEach((cell) => {
      if (cell === 2 || cell === 3) totalDots++;
    })
  );

  updateHUD(score, level, dotsEaten, totalDots);
  hideOverlay();

  scaredTimer = 0;

  // Reset Entities (functions from other files)
  resetPlayer();
  resetGhosts(level);
  resetPowerups(player.x, player.y);

  // Start Loop
  isRunning = true;
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  gameLoop();
}

function gameLoop() {
  if (!isRunning) return;
  update();
  // draw function from ui.js
  draw(
    board,
    player,
    ghosts,
    powerupOnMap,
    activeEffect,
    fireTrails,
    tornado,
    scaredTimer
  );
  gameLoopId = requestAnimationFrame(gameLoop);
}

function update() {
  // 1. Timers
  if (scaredTimer > 0) scaredTimer--;

  // 2. Powerups Logic
  // We pass 'addScore' and 'eatGhost' as callbacks so powerups.js can call them
  const powerupCallbacks = {
    addScore: addScore,
    eatGhost: eatGhost,
  };
  updatePowerups(board, player, ghosts, powerupCallbacks);
  updatePowerupStatus(activeEffect);

  // 3. Move Entities
  updatePlayer(board, COLS * TILE, activeEffect);

  // Ghosts don't move if Time Freeze is active
  if (activeEffect.type !== POWERUPS.FREEZE) {
    updateGhosts(board, player, scaredTimer);
  }

  // 4. Collisions
  checkCollisions();
}

function checkCollisions() {
  const pgx = Math.floor((player.x + TILE / 2) / TILE);
  const pgy = Math.floor((player.y + TILE / 2) / TILE);

  // A. Map Interactions (Dots)
  const cell = board[pgy][pgx];
  if (cell === 2 || cell === 3) {
    board[pgy][pgx] = 0;
    if (cell === 2) addScore(10);
    if (cell === 3) {
      addScore(50);
      scaredTimer = 400;
    }
  }

  // B. Powerup Pickup
  if (powerupOnMap.active && pgx === powerupOnMap.x && pgy === powerupOnMap.y) {
    activatePowerup(powerupOnMap.type);
    powerupOnMap.active = false;
    score += 100;
    updateHUD(score, level, dotsEaten, totalDots);
  }

  // C. Ghost Collisions
  ghosts.forEach((g) => {
    const dist = Math.hypot(player.x - g.x, player.y - g.y);
    if (dist < TILE - 5) {
      if (g.eaten) return;

      // Kill Ghost if Scared or Titanium is active
      if (scaredTimer > 0 || activeEffect.type === POWERUPS.TITANIUM) {
        eatGhost(g);
      } else {
        // Player Dies
        isRunning = false;
        showGameOver(score);
      }
    }
  });

  // D. Fire Trail Collisions (Pyro)
  fireTrails.forEach((trail) => {
    ghosts.forEach((g) => {
      const gx = Math.floor(g.x / TILE);
      const gy = Math.floor(g.y / TILE);
      if (gx === trail.x && gy === trail.y && !g.eaten) {
        eatGhost(g);
      }
    });
  });
}

function eatGhost(g) {
  g.eaten = true;
  score += 200;
  updateHUD(score, level, dotsEaten, totalDots);
}

function addScore(pts) {
  score += pts;

  if (pts === 10) {
    // Only count normal dots for progress
    dotsEaten++;
  }

  updateHUD(score, level, dotsEaten, totalDots);

  // Level Complete Check (80%)
  if (dotsEaten >= totalDots * 0.8) {
    level++;
    isRunning = false; // Pause momentarily
    showLevelUpMsg(level);
    resetLevel();
  }
}
