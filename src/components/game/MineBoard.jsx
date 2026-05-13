import MineCell from './MineCell';

export default function MineBoard({ cells, rows, cols, skin, onCellClick, onCellRightClick, highlightedIdx, targetingAbility, onTargetClick, gameOver }) {
  // Use vw-based cell size so board always fits on screen
  const cellVw = Math.floor(Math.min(96 / cols, 92 / rows));
  const cellPx = `min(${cellVw}vw, ${cellVw * 8}px)`;

  return (
    <div
      className={`skin-${skin} inline-grid gap-[2px] p-2 rounded-xl border border-border/40`}
      style={{ gridTemplateColumns: `repeat(${cols}, ${cellPx})` }}
    >
      {cells.map((cell) => (
        <div key={cell.id} style={{ width: cellPx, height: cellPx }}>
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
}