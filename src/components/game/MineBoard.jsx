import { memo, useRef, useState, useEffect } from 'react';
import MineCell from './MineCell';

const MineBoard = memo(function MineBoard({ cells, rows, cols, onCellClick, onCellRightClick, highlightedIdx, targetingAbility, onTargetClick, gameOver }) {
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(32);

  useEffect(() => {
    const calculate = () => {
      const isMobile = window.innerWidth < 768;
      const containerW = containerRef.current?.clientWidth || window.innerWidth;

      if (isMobile) {
        // Fit width exactly: account for gap (2px per col) and padding (16px total)
        const available = containerW - 16 - (cols - 1) * 2;
        const size = Math.floor(available / cols);
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
  }, [rows, cols]);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      <div className="w-full flex justify-center">
        <div
          className="inline-grid gap-[2px] p-2 rounded-xl"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            touchAction: 'pan-y',
            border: '1px solid var(--skin-border)',
          }}
        >
          {cells.map((cell) => (
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
      </div>
    </div>
  );
});

export default MineBoard;