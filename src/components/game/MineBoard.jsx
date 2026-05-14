import { memo, useMemo } from 'react';
import MineCell from './MineCell';

const MineBoard = memo(function MineBoard({ cells, rows, cols, onCellClick, onCellRightClick, highlightedIdx, targetingAbility, onTargetClick, gameOver }) {
  const isMobilePortrait = window.innerWidth < 600 && cols > rows;

  // On mobile portrait with a wide board (e.g. 16×30), rotate so it renders as 30×16
  // This makes the board tall instead of wide, fitting the portrait screen.
  const displayRows = isMobilePortrait ? cols : rows;
  const displayCols = isMobilePortrait ? rows : cols;

  // Reorder cells: transposed rendering (col-major instead of row-major)
  const orderedCells = useMemo(() => {
    if (!isMobilePortrait) return cells;
    // Build transposed order: iterate display rows (original cols) × display cols (original rows)
    const result = [];
    for (let dc = 0; dc < cols; dc++) {
      for (let dr = 0; dr < rows; dr++) {
        // original cell at (dr, dc) = index dr*cols + dc
        result.push(cells[dr * cols + dc]);
      }
    }
    return result;
  }, [cells, rows, cols, isMobilePortrait]);

  // Reserve space for HUD, ability bar, top bar, bottom hint
  const reservedH = isMobilePortrait ? 300 : 260;
  const availH = window.innerHeight - reservedH;
  const maxByWidth  = Math.floor((window.innerWidth * 0.96) / displayCols);
  const maxByHeight = Math.floor(availH / displayRows);
  const cellSize    = Math.max(18, Math.min(maxByWidth, maxByHeight, 52));

  return (
    <div
      className="inline-grid gap-[2px] p-2 rounded-xl"
      style={{
        gridTemplateColumns: `repeat(${displayCols}, ${cellSize}px)`,
        touchAction: 'none',
        border: '1px solid var(--skin-border)',
      }}
    >
      {orderedCells.map((cell, idx) => (
        <div key={cell.id} style={{ width: cellSize, height: cellSize }}>
          <MineCell
            cell={cell}
            isHighlighted={highlightedIdx === cell.id}
            isTargeting={!!targetingAbility}
            gameOver={gameOver}
            onClick={onCellClick}
            onRightClick={onCellRightClick}
            onTargetClick={onTargetClick}
          />
        </div>
      ))}
    </div>
  );
});

export default MineBoard;