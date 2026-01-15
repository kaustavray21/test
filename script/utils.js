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
