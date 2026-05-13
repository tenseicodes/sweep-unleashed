// Pure game logic helpers

export function createBoard(rows, cols, mines) {
  // 1. flat cells
  const cells = Array.from({ length: rows * cols }, (_, i) => ({
    id: i,
    row: Math.floor(i / cols),
    col: i % cols,
    isMine: false,
    isRevealed: false,
    isFlagged: false,
    neighborCount: 0,
  }));

  // 2. place mines (defer until first click if desired; here place randomly)
  let placed = 0;
  while (placed < mines) {
    const idx = Math.floor(Math.random() * cells.length);
    if (!cells[idx].isMine) {
      cells[idx].isMine = true;
      placed++;
    }
  }

  // 3. compute neighbor counts
  for (const cell of cells) {
    if (cell.isMine) continue;
    cell.neighborCount = getNeighborIndices(cell.row, cell.col, rows, cols)
      .filter(ni => cells[ni].isMine).length;
  }

  return cells;
}

export function getNeighborIndices(row, col, rows, cols) {
  const result = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        result.push(r * cols + c);
      }
    }
  }
  return result;
}

export function floodReveal(cells, startIdx, rows, cols) {
  const newCells = [...cells.map(c => ({ ...c }))];
  const stack = [startIdx];
  const visited = new Set();

  while (stack.length) {
    const idx = stack.pop();
    if (visited.has(idx)) continue;
    visited.add(idx);

    const cell = newCells[idx];
    if (cell.isFlagged || cell.isRevealed) continue;
    cell.isRevealed = true;

    if (cell.neighborCount === 0 && !cell.isMine) {
      const neighbors = getNeighborIndices(cell.row, cell.col, rows, cols);
      for (const ni of neighbors) {
        if (!visited.has(ni)) stack.push(ni);
      }
    }
  }

  return newCells;
}

export function checkWin(cells) {
  return cells.every(c => c.isMine || c.isRevealed);
}

export function getSafeCells(cells) {
  return cells.filter(c => !c.isMine && !c.isRevealed && !c.isFlagged);
}

export function revealArea(cells, centerRow, centerCol, radius, rows, cols) {
  const newCells = cells.map(c => ({ ...c }));
  for (let r = centerRow - radius; r <= centerRow + radius; r++) {
    for (let c = centerCol - radius; c <= centerCol + radius; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const idx = r * cols + c;
        if (!newCells[idx].isMine) {
          newCells[idx].isRevealed = true;
          newCells[idx].isFlagged = false;
        }
      }
    }
  }
  return newCells;
}

export function detonateArea(cells, centerRow, centerCol, rows, cols) {
  const newCells = cells.map(c => ({ ...c }));
  const detonated = [];
  for (let r = centerRow - 1; r <= centerRow + 1; r++) {
    for (let c = centerCol - 1; c <= centerCol + 1; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const idx = r * cols + c;
        if (newCells[idx].isMine) {
          newCells[idx].isMine = false;
          newCells[idx].isRevealed = true;
          detonated.push(idx);
        } else {
          newCells[idx].isRevealed = true;
        }
      }
    }
  }
  // Recompute neighbor counts
  for (const cell of newCells) {
    if (cell.isMine) continue;
    cell.neighborCount = getNeighborIndices(cell.row, cell.col, rows, cols)
      .filter(ni => newCells[ni].isMine).length;
  }
  return { cells: newCells, detonated };
}

export function judgementCutEnd(cells, rows, cols) {
  const newCells = cells.map(c => ({ ...c }));
  const mines = newCells.filter(c => c.isMine);
  const toRemove = Math.floor(mines.length * 0.9);
  const shuffled = [...mines].sort(() => Math.random() - 0.5).slice(0, toRemove);
  for (const mine of shuffled) {
    newCells[mine.id].isMine = false;
  }
  // Recompute neighbor counts
  for (const cell of newCells) {
    if (cell.isMine) continue;
    cell.neighborCount = getNeighborIndices(cell.row, cell.col, rows, cols)
      .filter(ni => newCells[ni].isMine).length;
  }
  return newCells;
}