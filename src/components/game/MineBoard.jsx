import { memo, useRef, useState, useEffect } from 'react';
import MineCell from './MineCell';

const MineBoard = memo(function MineBoard({ cells, rows, cols, onCellClick, onCellRightClick, highlightedIdx, targetingAbility, onTargetClick, gameOver }) {
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(32);
  const [isMobile, setIsMobile] = useState(false);

  // On mobile only, transpose large boards (30×16 → 16×30) so they scroll vertically
  const isLarge = rows === 16 && cols === 30;
  const transpose = isMobile && isLarge;
  const displayCols = transpose ? rows : cols;
  const displayRows = transpose ? cols : rows;

  useEffect(() => {
    const calculate = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      const containerW = containerRef.current?.clientWidth || window.innerWidth;
      const effectiveCols = (mobile && isLarge) ? rows : cols;

      if (mobile) {
        // Fit width: account for gap (2px per gap) and padding (16px total)
        const available = containerW - 16 - (effectiveCols - 1) * 2;
        const size = Math.floor(available / effectiveCols);
        setCellSize(Math.max(12, Math.min(size, 52)));
      } else {
        // Desktop: fit both width and height
        const reservedH = 280;
        const availH = window.innerHeight - reservedH;
        const cellByWidth  = Math.floor(containerW / cols);
        const cellByHeight = Math.floor(availH / rows);
        setCellSize(Math.max(22, Math.min(cellByWidth, cellByHeight, 52)));
      }
    };

    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, [rows, cols, isLarge]);

  // Build display cells: if transposing, remap cell positions
  // Original layout: cell.id = row * cols + col
  // Transposed: we want to render column-by-column (each original col becomes a new row)
  const displayCells = (() => {
    if (!isMobile || !isLarge) return cells;
    // Transpose: iterate original cols then rows → new grid is cols×rows
    const transposed = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        transposed.push(cells[r * cols + c]);
      }
    }
    return transposed;
  })();

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      <div className="w-full flex justify-center">
        <div
          className={`inline-grid gap-[2px] p-2 rounded-xl${transpose ? ' overflow-y-auto max-h-[calc(100vh-240px)]' : ''}`}
          style={{
            gridTemplateColumns: `repeat(${displayCols}, ${cellSize}px)`,
            touchAction: 'pan-y',
            border: '1px solid var(--skin-border)',
          }}
        >
          {displayCells.map((cell, idx) => (
            <div key={`${cell.id}-${idx}`} style={{ width: cellSize, height: cellSize }}>
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
      </div>
    </div>
  );
});

export default MineBoard;