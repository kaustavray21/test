// ui.js

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const overlay = document.getElementById("overlay");
const statusMsg = document.getElementById("status-msg");
const winReason = document.getElementById("win-reason");
const progressBar = document.getElementById("progress-bar");
const powerupStatus = document.getElementById("powerup-status");
const startBtn = document.querySelector("#overlay button");

function initUI(canvasWidth, canvasHeight) {
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Initial Overlay Text
  statusMsg.innerText = "PAC-MAN V5.5";
  statusMsg.style.color = "yellow";
  winReason.innerText = "Collect 80% to Win | Use Powerups!";
  startBtn.innerText = "START GAME";
  overlay.style.display = "flex";
}

function bindStartButton(callback) {
  startBtn.onclick = callback;
}

function updateHUD(score, level, dotsEaten, totalDots) {
  scoreEl.innerText = score;
  levelEl.innerText = level;

  // Progress Bar
  const realPct = (dotsEaten / totalDots) * 100;
  progressBar.style.width = `${realPct}%`;

  if (realPct >= 80) progressBar.style.background = "#00ff00";
  else progressBar.style.background = "#ffcc00";
}

function updatePowerupStatus(activeEffect) {
  if (activeEffect.timer > 0) {
    powerupStatus.style.visibility = "visible";
    powerupStatus.innerText = POWERUP_ICONS[activeEffect.type] + " ACTIVE";
    powerupStatus.style.color = POWERUP_COLORS[activeEffect.type];
  } else {
    powerupStatus.style.visibility = "hidden";
  }
}

function showGameOver(score) {
  statusMsg.innerText = "GAME OVER";
  statusMsg.style.color = "red";
  winReason.innerText = `Score: ${score}`;
  overlay.style.display = "flex";
  startBtn.innerText = "RESTART";
}

function showLevelUpMsg(level) {
  alert(`Level ${level} Unlocked! (80% Cleared)`);
}

function hideOverlay() {
  overlay.style.display = "none";
}

function draw(
  board,
  player,
  ghosts,
  powerupOnMap,
  activeEffect,
  fireTrails,
  tornado,
  scaredTimer
) {
  // Clear Screen
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Map
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE;
      const y = r * TILE;
      const cell = board[r][c];

      if (cell === 1) {
        // --- WALLS (3D ELEVATED LOOK) ---

        // 1. Base Color
        ctx.fillStyle = "#3bdbf7";
        ctx.fillRect(x, y, TILE, TILE);

        // 2. Bevel Highlight (Top/Left) - Light Source Top Left
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; // Bright Highlight
        ctx.beginPath();
        ctx.moveTo(x, y + TILE);
        ctx.lineTo(x, y);
        ctx.lineTo(x + TILE, y);
        ctx.lineTo(x + TILE - 4, y + 4);
        ctx.lineTo(x + 4, y + 4);
        ctx.lineTo(x + 4, y + TILE - 4);
        ctx.fill();

        // 3. Bevel Shadow (Bottom/Right) - Shadow Bottom Right
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)"; // Dark Shadow
        ctx.beginPath();
        ctx.moveTo(x, y + TILE);
        ctx.lineTo(x + TILE, y + TILE);
        ctx.lineTo(x + TILE, y);
        ctx.lineTo(x + TILE - 4, y + 4);
        ctx.lineTo(x + TILE - 4, y + TILE - 4);
        ctx.lineTo(x + 4, y + TILE - 4);
        ctx.fill();

        // 4. Black Border (Separation)
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, TILE, TILE);
      } else if (cell === 2) {
        // Dot
        ctx.fillStyle = "#ffb8ae";
        ctx.fillRect(x + TILE / 2 - 2, y + TILE / 2 - 2, 4, 4);
      } else if (cell === 3) {
        // Power Pellet
        ctx.fillStyle =
          Math.floor(Date.now() / 200) % 2 === 0 ? "#ffb8ae" : "#ff0000";
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Draw Powerup Item
  if (powerupOnMap.active) {
    const px = powerupOnMap.x * TILE;
    const py = powerupOnMap.y * TILE;
    ctx.fillStyle = POWERUP_COLORS[powerupOnMap.type];
    ctx.font = "bold 24px Arial";
    ctx.fillText(POWERUP_ICONS[powerupOnMap.type], px + 6, py + 24);
  }

  // Draw Fire Trails
  fireTrails.forEach((f) => {
    ctx.fillStyle = `rgba(255, 69, 0, ${f.timer / 300})`;
    ctx.fillRect(f.x * TILE, f.y * TILE, TILE, TILE);
  });

  // Draw Tornado
  if (tornado.active) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    const tx = tornado.x + TILE / 2;
    const ty = tornado.y + TILE / 2;
    ctx.arc(tx, ty, TILE, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + (Math.random() - 0.5) * 20, ty - 20);
    ctx.stroke();
  }

  // Draw Player
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

  // Draw Magnet Effect Ring
  if (activeEffect.type === POWERUPS.MAGNET) {
    ctx.strokeStyle = "rgba(0, 0, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(px, py, 5 * TILE, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw Ghosts
  ghosts.forEach((g) => {
    const gx = g.x + TILE / 2;
    const gy = g.y + TILE / 2;

    if (!g.eaten) {
      if (activeEffect.type === POWERUPS.FREEZE) {
        ctx.fillStyle = "#00FFFF";
      } else if (scaredTimer > 0) {
        ctx.fillStyle =
          scaredTimer < 120 && Math.floor(Date.now() / 100) % 2 === 0
            ? "white"
            : "#0000FF";
      } else {
        ctx.fillStyle = g.color;
      }

      ctx.beginPath();
      ctx.arc(gx, gy - 2, TILE / 2 - 2, Math.PI, 0);
      ctx.lineTo(gx + TILE / 2 - 2, gy + TILE / 2);
      ctx.lineTo(gx - TILE / 2 + 2, gy + TILE / 2);
      ctx.fill();
    }

    // Eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(gx - 4, gy - 5, 4, 0, Math.PI * 2);
    ctx.arc(gx + 4, gy - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "blue";
    ctx.beginPath();
    const lookX = g.dx * 2;
    const lookY = g.dy * 2;
    ctx.arc(gx - 4 + lookX, gy - 5 + lookY, 2, 0, Math.PI * 2);
    ctx.arc(gx + 4 + lookX, gy - 5 + lookY, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}
