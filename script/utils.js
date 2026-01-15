// utils.js

function isWall(board, gx, gy) {
  if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return true;
  return board[gy][gx] === TYPES.WALL;
}

function bfs(board, gx, gy, tx, ty) {
  if (gx === tx && gy === ty) return { x: 0, y: 0 };

  let queue = [{ x: gx, y: gy, firstMove: null }];
  let visited = new Set();
  visited.add(`${gx},${gy}`);

  const moves = [
    { x: 0, y: -1 }, // Up
    { x: -1, y: 0 }, // Left
    { x: 0, y: 1 }, // Down
    { x: 1, y: 0 }, // Right
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
        !isWall(board, nx, ny) &&
        !visited.has(`${nx},${ny}`)
      ) {
        visited.add(`${nx},${ny}`);
        queue.push({ x: nx, y: ny, firstMove: curr.firstMove || m });
      }
    }
  }
  return { x: 0, y: 0 };
}

// --- NEW MAP GENERATOR ---
function generateRandomMap() {
  let map = [];

  // 1. Initialize full grid with Walls
  for (let y = 0; y < ROWS; y++) {
    let row = [];
    for (let x = 0; x < COLS; x++) {
      row.push(1);
    }
    map.push(row);
  }

  // 2. Carve Paths (Recursive Backtracker)
  // We generate the left half (cols 1-13) and mirror it later
  function carve(cx, cy) {
    const dirs = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ].sort(() => Math.random() - 0.5); // Shuffle directions

    dirs.forEach(([dx, dy]) => {
      const nx = cx + dx;
      const ny = cy + dy;

      // Boundary checks for Left Half (x: 1-13, y: 1-27)
      if (nx > 0 && nx < 14 && ny > 0 && ny < 28 && map[ny][nx] === 1) {
        // Protect the Center Ghost House Area (approx 10-18, 11-17)
        if (nx >= 9 && ny >= 10 && ny <= 18) return;

        map[ny][nx] = 0; // Carve destination
        map[cy + dy / 2][cx + dx / 2] = 0; // Carve path between
        carve(nx, ny);
      }
    });
  }

  // Start carving from top-left
  map[1][1] = 0;
  carve(1, 1);

  // 3. Add Loops (Remove random walls)
  // A perfect maze has no loops, which is bad for Pacman. We remove ~30 walls to open it up.
  for (let i = 0; i < 30; i++) {
    let rx = Math.floor(Math.random() * 13) + 1;
    let ry = Math.floor(Math.random() * 27) + 1;
    if (map[ry][rx] === 1 && rx < 13 && ry > 1 && ry < 27) {
      // Don't break into ghost house
      if (!(rx >= 9 && ry >= 10 && ry <= 18)) {
        map[ry][rx] = 0;
      }
    }
  }

  // 4. Force Tunnel (Row 14)
  for (let x = 0; x <= 14; x++) map[14][x] = 0;

  // 5. Mirror Left Half to Right Half
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < 14; x++) {
      map[y][COLS - 1 - x] = map[y][x];
    }
    // Handle center column (14): Connect bridges randomly
    if (y > 1 && y < 27 && map[y][13] === 0 && Math.random() > 0.4) {
      map[y][14] = 0;
    }
  }
  map[14][14] = 0; // Ensure tunnel center is open

  // 6. Stamp Standard Ghost House (Fixed Structure)
  // This ensures ghosts never get stuck spawning
  const ghostHouse = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 1, 0, 0, 1], // Row 13
    [1, 0, 0, 0, 0, 0, 0, 0, 1], // Row 14 (Middle)
    [1, 0, 0, 0, 0, 0, 0, 0, 1], // Row 15
    [1, 1, 1, 1, 1, 1, 1, 1, 1], // Row 16
  ];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 9; x++) {
      map[12 + y][10 + x] = ghostHouse[y][x];
    }
  }
  map[12][14] = 0; // Door

  // 7. Populate Items (Dots & Pellets)
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (map[y][x] === 0) {
        map[y][x] = 2; // Default to Dot
      }
    }
  }

  // Clean up safe zones (No dots in tunnel or house)
  for (let x = 0; x < COLS; x++) map[14][x] = 0; // Tunnel
  for (let y = 12; y <= 16; y++) {
    for (let x = 10; x <= 18; x++) {
      if (map[y][x] === 2) map[y][x] = 0;
    }
  }

  // Place Power Pellets in Corners
  // Find valid open corners
  map[1][1] = 3;
  map[1][COLS - 2] = 3;
  map[ROWS - 2][1] = 3;
  map[ROWS - 2][COLS - 2] = 3;

  return map;
}
