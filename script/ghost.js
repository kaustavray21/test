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

function updateGhosts(board, player, scaredTimer) {
  ghosts.forEach((g) => {
    // Speed logic: Eyes return to base faster
    let currentSpeed = SPEED;
    if (g.eaten) {
      // Check alignment to prevent skipping tiles when speeding up
      if (g.x % 4 === 0 && g.y % 4 === 0) {
        currentSpeed = SPEED * 2;
      }
    }

    const gx = Math.floor(g.x / TILE);
    const gy = Math.floor(g.y / TILE);
    const centered = g.x % TILE === 0 && g.y % TILE === 0;

    if (centered) {
      handleGhostAI(g, gx, gy, board, player, scaredTimer);
    }

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
    // Revive if reached home
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
      const m = moves[Math.floor(Math.random() * moves.length)];
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
      // Random
      tx = Math.floor(Math.random() * COLS);
      ty = Math.floor(Math.random() * ROWS);
    }
  }

  // Clamp target to map bounds
  tx = Math.max(1, Math.min(COLS - 2, tx));
  ty = Math.max(1, Math.min(ROWS - 2, ty));

  // Calculate Path
  const best = bfs(board, gx, gy, tx, ty);
  if (best && (best.x !== 0 || best.y !== 0)) {
    ghost.dx = best.x;
    ghost.dy = best.y;
  } else {
    // Fallback if no path found
    const moves = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ].filter((m) => !isWall(board, gx + m.x, gy + m.y));

    if (moves.length) {
      ghost.dx = moves[0].x;
      ghost.dy = moves[0].y;
    }
  }
}
