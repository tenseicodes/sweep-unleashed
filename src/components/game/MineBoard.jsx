import { memo } from 'react';
import MineCell from './MineCell';

const MineBoard = memo(function MineBoard({ cells, rows, cols, skin, onCellClick, onCellRightClick, highlightedIdx, targetingAbility, onTargetClick, gameOver }) {
  // Responsive cell size: fit within viewport
  const maxByWidth  = Math.floor((window.innerWidth  * 0.96) / cols);
  const maxByHeight = Math.floor((window.innerHeight * 0.55) / rows);
  const cellSize    = Math.max(24, Math.min(maxByWidth, maxByHeight, 52));

  return (
    <div
      className={`skin-${skin} inline-grid gap-[2px] p-2 rounded-xl border border-border/40`}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        touchAction: 'none',
      }}
    >
      {cells.map((cell) => (
        <div key={cell.id} style={{ width: cellSize, height: cellSize }}>
          <MineCell
            cell={cell}
            skin={skin}
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