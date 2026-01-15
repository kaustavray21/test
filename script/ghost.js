// ghosts.js

let ghosts = [];

function resetGhosts(level) {
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
}

function updateGhosts(board, player, scaredTimer, activeEffect) {
  ghosts.forEach((g) => {
    // 1. Determine Speed
    let currentSpeed = SPEED;

    if (g.eaten) {
      // Eyes move fast returning to base
      // Ensure alignment (check divisible by 4) to avoid skipping tiles
      if (Math.abs(g.x % 4) < 0.1 && Math.abs(g.y % 4) < 0.1) {
        currentSpeed = SPEED * 2;
      }
    } else {
      // --- SLOW POWERUP LOGIC ---
      // If Slow Powerup is active, reduce speed by half (e.g., 3 -> 1.5)
      if (activeEffect && activeEffect.type === POWERUPS.SLOW) {
        currentSpeed = SPEED * 0.5;
      }
    }

    // 2. AI Decision (Only when centered on a tile)
    // We use a small epsilon (0.1) because fractional speeds (1.5) might not hit exactly 0.0
    const gx = Math.floor((g.x + TILE / 2) / TILE);
    const gy = Math.floor((g.y + TILE / 2) / TILE);

    // Check if close enough to center of tile
    const distX = Math.abs(g.x - gx * TILE);
    const distY = Math.abs(g.y - gy * TILE);
    const centered = distX < currentSpeed && distY < currentSpeed;

    if (centered) {
      // Snap to exact grid center to prevent drift
      g.x = gx * TILE;
      g.y = gy * TILE;

      handleGhostAI(g, gx, gy, board, player, scaredTimer);
    }

    // 3. Move Ghost
    g.x += g.dx * currentSpeed;
    g.y += g.dy * currentSpeed;
  });
}

function handleGhostAI(ghost, gx, gy, board, player, scaredTimer) {
  let tx, ty;

  // 1. Eaten Logic (Return to House)
  if (ghost.eaten) {
    tx = 14;
    ty = 14;
    // Revive if reached home (within 2 tiles)
    if (Math.abs(gx - tx) < 2 && Math.abs(gy - ty) < 2) {
      ghost.eaten = false;
    }
  }
  // 2. Scared Logic (Run Away Randomly)
  else if (scaredTimer > 0) {
    const moves = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ].filter((m) => !isWall(board, gx + m.x, gy + m.y));

    if (moves.length) {
      // Don't reverse immediately if possible
      const validMoves = moves.filter(
        (m) => m.x !== -ghost.dx || m.y !== -ghost.dy
      );
      const m =
        validMoves.length > 0
          ? validMoves[Math.floor(Math.random() * validMoves.length)]
          : moves[Math.floor(Math.random() * moves.length)];

      ghost.dx = m.x;
      ghost.dy = m.y;
      return;
    }
  }
  // 3. Normal AI Behavior
  else {
    const px = Math.floor(player.x / TILE);
    const py = Math.floor(player.y / TILE);

    if (ghost.type === "chase") {
      tx = px;
      ty = py;
    } else if (ghost.type === "ambush") {
      // Target 4 tiles ahead of player
      tx = px + player.dx * 4;
      ty = py + player.dy * 4;
    } else if (ghost.type === "patrol") {
      // If far, chase. If close, retreat to corner.
      if (Math.abs(gx - px) + Math.abs(gy - py) > 10) {
        tx = px;
        ty = py;
      } else {
        tx = 1;
        ty = ROWS - 2;
      }
    } else {
      // Random target
      tx = Math.floor(Math.random() * COLS);
      ty = Math.floor(Math.random() * ROWS);
    }
  }

  // Clamp target to map bounds
  tx = Math.max(1, Math.min(COLS - 2, tx));
  ty = Math.max(1, Math.min(ROWS - 2, ty));

  // Calculate Path using BFS (from utils.js)
  // Ensure BFS exists and returns valid move
  if (typeof bfs === "function") {
    const best = bfs(board, gx, gy, tx, ty);
    if (best && (best.x !== 0 || best.y !== 0)) {
      ghost.dx = best.x;
      ghost.dy = best.y;
      return;
    }
  }

  // Fallback: Random valid move if pathfinding fails
  const moves = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ].filter((m) => !isWall(board, gx + m.x, gy + m.y));

  if (moves.length) {
    // Filter out reverse direction to prevent jitter
    const forwardMoves = moves.filter(
      (m) => m.x !== -ghost.dx || m.y !== -ghost.dy
    );

    if (forwardMoves.length > 0) {
      ghost.dx = forwardMoves[0].x;
      ghost.dy = forwardMoves[0].y;
    } else {
      // Dead end, forced to reverse
      ghost.dx = moves[0].x;
      ghost.dy = moves[0].y;
    }
  } else {
    // Stuck?
    ghost.dx = 0;
    ghost.dy = 0;
  }
}

// Helper to check walls safely
function isWall(board, x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
  return board[y][x] === 1;
}
