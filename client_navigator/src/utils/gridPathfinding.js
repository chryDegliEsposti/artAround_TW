const GRID_SIZE = 10;
const COLS = Math.floor(500 / GRID_SIZE);
const ROWS = Math.floor(500 / GRID_SIZE);

export const createCollisionGrid = (lines, pois, tx, ty) => {
  const grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
  
  const drawLineOnGrid = (x0, y0, x1, y1) => {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    
    while(true) {
      if (x0 >= 0 && x0 < COLS && y0 >= 0 && y0 < ROWS) {
        grid[y0][x0] = 1; // 1 means obstacle
      }
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  };

  lines.forEach(line => {
    for (let i = 0; i < line.points.length - 1; i++) {
        const p1 = line.points[i];
        const p2 = line.points[i+1];
        const cx1 = Math.floor(tx(p1.x) / GRID_SIZE);
        const cy1 = Math.floor(ty(p1.y) / GRID_SIZE);
        const cx2 = Math.floor(tx(p2.x) / GRID_SIZE);
        const cy2 = Math.floor(ty(p2.y) / GRID_SIZE);
        drawLineOnGrid(cx1, cy1, cx2, cy2);
    }
  });

  // Punch holes for Doors/Exits so the path can cross walls
  pois.forEach(poi => {
    if (poi.type === 'exit' || poi.type === 'restaurant' || poi.type === 'restroom') {
      const cx = Math.floor(tx(poi.position.x) / GRID_SIZE);
      const cy = Math.floor(ty(poi.position.y) / GRID_SIZE);
      
      // Blast a generous 5x5 walkable hole in the rasterized wall
      for(let dr=-2; dr<=2; dr++) {
        for(let dc=-2; dc<=2; dc++) {
          if (cy+dr>=0 && cy+dr<ROWS && cx+dc>=0 && cx+dc<COLS) {
            grid[cy+dr][cx+dc] = 0;
          }
        }
      }
    }
  });

  // No dilation to allow passing through tight spaces left by the user map
  return { grid: grid, gridSize: GRID_SIZE, cols: COLS, rows: ROWS };
};

export const findPath = (gridData, startP, endP) => {
  if (!gridData || !gridData.grid) return [];
  const { grid, gridSize, cols, rows } = gridData;

  let startC = Math.max(0, Math.min(cols-1, Math.floor(startP.x / gridSize)));
  let startR = Math.max(0, Math.min(rows-1, Math.floor(startP.y / gridSize)));
  let endC = Math.max(0, Math.min(cols-1, Math.floor(endP.x / gridSize)));
  let endR = Math.max(0, Math.min(rows-1, Math.floor(endP.y / gridSize)));

  // Helper to snap an enclosed point to the nearest empty grid cell
  const getNearestEmpty = (r, c) => {
    if (grid[r][c] === 0) return { r, c };
    const queue = [{ r, c, dist: 0 }];
    const visited = new Set([`${r},${c}`]);
    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr.dist > 5) continue; // max search distance
      for (let dr=-1; dr<=1; dr++) {
        for (let dc=-1; dc<=1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = curr.r + dr;
          const nc = curr.c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (grid[nr][nc] === 0) return { r: nr, c: nc };
            if (!visited.has(`${nr},${nc}`)) {
              visited.add(`${nr},${nc}`);
              queue.push({ r: nr, c: nc, dist: curr.dist + 1 });
            }
          }
        }
      }
    }
    return null;
  };

  const validStart = getNearestEmpty(startR, startC);
  const validEnd = getNearestEmpty(endR, endC);

  if (!validStart || !validEnd) return []; // Completely trapped

  startR = validStart.r;
  startC = validStart.c;
  endR = validEnd.r;
  endC = validEnd.c;

  const openSet = [{ r: startR, c: startC, f: 0, g: 0, parent: null }];
  const closedSet = new Set();
  
  const h = (r, c) => Math.abs(r - endR) + Math.abs(c - endC);
  
  while (openSet.length > 0) {
    let lowestIdx = 0;
    for(let i=1; i<openSet.length; i++) {
        if(openSet[i].f < openSet[lowestIdx].f) lowestIdx = i;
    }
    const curr = openSet[lowestIdx];
    openSet.splice(lowestIdx, 1);
    
    if (curr.r === endR && curr.c === endC) {
      let path = [];
      let temp = curr;
      while(temp) {
        path.push({ x: temp.c * gridSize + gridSize/2, y: temp.r * gridSize + gridSize/2 });
        temp = temp.parent;
      }
      return path.reverse();
    }
    
    closedSet.add(`${curr.r},${curr.c}`);
    
    const dirs = [[-1,0],[1,0],[0,-1],[0,1], [-1,-1],[-1,1],[1,-1],[1,1]];
    for (let [dr, dc] of dirs) {
      const nr = curr.r + dr;
      const nc = curr.c + dc;
      
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === 1) continue;
      if (closedSet.has(`${nr},${nc}`)) continue;
      
      // Prevent diagonal cutting corners if adjacent cells are walls
      // This stops A* from mysteriously "phasing" through solid diagonal lines.
      if (Math.abs(dr) === 1 && Math.abs(dc) === 1) {
        if (grid[curr.r][curr.c + dc] === 1 || grid[curr.r + dr][curr.c] === 1) continue;
      }

      const moveCost = (Math.abs(dr) === 1 && Math.abs(dc) === 1) ? 1.414 : 1;
      const tentativeG = curr.g + moveCost;
      
      let neighbor = openSet.find(n => n.r === nr && n.c === nc);
      if (!neighbor) {
        neighbor = { r: nr, c: nc, g: tentativeG, f: tentativeG + h(nr, nc), parent: curr };
        openSet.push(neighbor);
      } else if (tentativeG < neighbor.g) {
        neighbor.g = tentativeG;
        neighbor.f = tentativeG + h(nr, nc);
        neighbor.parent = curr;
      }
    }
  }
  return [];
};
