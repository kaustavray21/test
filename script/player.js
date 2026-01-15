// player.js

let player = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  mouth: 0,
};

let fireTrails = [];

function resetPlayer() {
  player = {
    x: 14 * TILE,
    y: 23 * TILE,
    dx: 0,
    dy: 0,
    mouth: 0,
  };
  fireTrails.length = 0; // Clear array
}

function updatePlayer(board, canvasWidth, activeEffect) {
  const gx = Math.floor(player.x / TILE);
  const gy = Math.floor(player.y / TILE);
  const centered = player.x % TILE === 0 && player.y % TILE === 0;

  if (centered) {
    // Try to change direction based on input
    if (inputState.nextDx !== 0 || inputState.nextDy !== 0) {
      if (!isWall(board, gx + inputState.nextDx, gy + inputState.nextDy)) {
        player.dx = inputState.nextDx;
        player.dy = inputState.nextDy;
        // Reset input after successful turn
        inputState.nextDx = 0;
        inputState.nextDy = 0;
      }
    }

    // Stop if hitting a wall
    if (isWall(board, gx + player.dx, gy + player.dy)) {
      player.dx = 0;
      player.dy = 0;
    }

    // Handle Pyro Powerup Trail
    if (activeEffect.type === POWERUPS.PYRO) {
      fireTrails.push({ x: gx, y: gy, timer: 300 });
    }
  }

  // Move
  player.x += player.dx * SPEED;
  player.y += player.dy * SPEED;

  // Tunnel Wrapping
  if (player.x > canvasWidth) {
    player.x = -TILE + 2;
  } else if (player.x < -TILE) {
    player.x = canvasWidth - 2;
  }

  // Animate Mouth
  player.mouth = (player.mouth + 0.2) % 4;

  // Update Fire Trails (decrease timer)
  for (let i = fireTrails.length - 1; i >= 0; i--) {
    fireTrails[i].timer--;
    if (fireTrails[i].timer <= 0) {
      fireTrails.splice(i, 1);
    }
  }
}
