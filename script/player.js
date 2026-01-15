// player.js

let player = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  mouth: 0,
};

// REMOVED: let fireTrails = []; (Defined in powerup.js)

function resetPlayer() {
  player = {
    x: 14 * TILE,
    y: 23 * TILE,
    dx: 0,
    dy: 0,
    mouth: 0,
  };
  // We don't clear fireTrails here anymore, handled in resetPowerups
}

function updatePlayer(board, canvasWidth, activeEffect) {
  // 1. Determine Speed (BOOST Logic)
  let moveSpeed = SPEED;
  if (activeEffect.type === POWERUPS.BOOST) {
    moveSpeed = SPEED * 2; // Double speed (6px per frame)
  }

  const gx = Math.floor(player.x / TILE);
  const gy = Math.floor(player.y / TILE);

  // Check if centered on a tile (works for speeds 3 and 6)
  const centered = player.x % TILE === 0 && player.y % TILE === 0;

  if (centered) {
    // --- A. Handle Turn Input ---
    if (inputState.nextDx !== 0 || inputState.nextDy !== 0) {
      const nextGx = gx + inputState.nextDx;
      const nextGy = gy + inputState.nextDy;

      let canTurn = !isWall(board, nextGx, nextGy);

      // DRILL Logic: If it is a wall, but we have Drill, break it!
      if (!canTurn && activeEffect.type === POWERUPS.DRILL) {
        if (isValidCell(nextGx, nextGy) && board[nextGy][nextGx] === 1) {
          board[nextGy][nextGx] = 0; // Destroy wall
          canTurn = true;
        }
      }

      if (canTurn) {
        player.dx = inputState.nextDx;
        player.dy = inputState.nextDy;
        inputState.nextDx = 0;
        inputState.nextDy = 0;
      }
    }

    // --- B. Handle Straight Movement Collision ---
    const nextGx = gx + player.dx;
    const nextGy = gy + player.dy;

    let hitWall = isWall(board, nextGx, nextGy);

    // DRILL Logic: Check straight ahead
    if (hitWall && activeEffect.type === POWERUPS.DRILL) {
      if (isValidCell(nextGx, nextGy) && board[nextGy][nextGx] === 1) {
        board[nextGy][nextGx] = 0; // Destroy wall
        hitWall = false;
      }
    }

    if (hitWall) {
      player.dx = 0;
      player.dy = 0;
    }

    // --- C. Pyro Powerup Trail ---
    if (activeEffect.type === POWERUPS.PYRO) {
      // Only drop fire if we moved to a new tile
      // We access the global 'fireTrails' defined in powerup.js
      const lastFire = fireTrails[fireTrails.length - 1];
      if (!lastFire || lastFire.x !== gx || lastFire.y !== gy) {
        fireTrails.push({ x: gx, y: gy, timer: 300 });
      }
    }
  }

  // 2. Move Player
  player.x += player.dx * moveSpeed;
  player.y += player.dy * moveSpeed;

  // 3. Tunnel Wrapping
  if (player.x > canvasWidth) {
    player.x = -TILE + 2;
  } else if (player.x < -TILE) {
    player.x = canvasWidth - 2;
  }

  // 4. Animate Mouth
  player.mouth = (player.mouth + 0.2) % 4;

  // REMOVED: Duplicate update loop for fireTrails
}

// Helper to prevent accessing out of bounds array
function isValidCell(c, r) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

// Helper to check walls (assumes 1 is wall)
function isWall(board, c, r) {
  if (!isValidCell(c, r)) return true; // Bounds are walls
  return board[r][c] === 1;
}
