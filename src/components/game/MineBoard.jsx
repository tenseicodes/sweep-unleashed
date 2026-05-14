import { memo } from 'react';
import MineCell from './MineCell';

const MineBoard = memo(function MineBoard({ cells, rows, cols, onCellClick, onCellRightClick, highlightedIdx, targetingAbility, onTargetClick, gameOver }) {
  // Reserve ~260px for HUD, ability bar, top bar, and bottom hint on mobile
  const availH = (window.innerHeight - 260);
  const maxByWidth  = Math.floor((window.innerWidth  * 0.96) / cols);
  const maxByHeight = Math.floor(availH / rows);
  const cellSize    = Math.max(22, Math.min(maxByWidth, maxByHeight, 52));

  return (
    <div
      className="inline-grid gap-[2px] p-2 rounded-xl"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        touchAction: 'none',
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
  );
});

export default MineBoard;