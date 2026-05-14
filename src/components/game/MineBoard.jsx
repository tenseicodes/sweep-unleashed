import { memo, useMemo } from 'react';
import MineCell from './MineCell';

const MineBoard = memo(function MineBoard({ cells, rows, cols, onCellClick, onCellRightClick, highlightedIdx, targetingAbility, onTargetClick, gameOver }) {
  const isMobile = window.innerWidth < 600;
  // On mobile, rotate wide boards (cols > rows) so they become tall instead of wide
  const shouldRotate = isMobile && cols > rows;

  const displayRows = shouldRotate ? cols : rows;
  const displayCols = shouldRotate ? rows : cols;

  // Reorder cells for rotated display (col-major)
  const orderedCells = useMemo(() => {
    if (!shouldRotate) return cells;
    const result = [];
    for (let dc = 0; dc < cols; dc++) {
      for (let dr = 0; dr < rows; dr++) {
        result.push(cells[dr * cols + dc]);
      }
    }
    return result;
  }, [cells, rows, cols, shouldRotate]);

  // Calculate cell size to fit screen — on mobile always fit to width
  const reservedH = isMobile ? 300 : 260;
  const availW = window.innerWidth * 0.96;
  const availH = window.innerHeight - reservedH;

  const maxByWidth  = Math.floor(availW / displayCols);
  const maxByHeight = Math.floor(availH / displayRows);

  // On mobile: prioritize fitting width, allow vertical scroll
  // On desktop: fit both dimensions
  const cellSize = isMobile
    ? Math.max(18, Math.min(maxByWidth, 52))
    : Math.max(22, Math.min(maxByWidth, maxByHeight, 52));

  return (
    <div
      className="inline-grid gap-[2px] p-2 rounded-xl"
      style={{
        gridTemplateColumns: `repeat(${displayCols}, ${cellSize}px)`,
        touchAction: 'none',
        border: '1px solid var(--skin-border)',
      }}
    >
      {orderedCells.map((cell) => (
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