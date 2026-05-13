import MineCell from './MineCell';

export default function MineBoard({ cells, rows, cols, skin, onCellClick, onCellRightClick, highlightedIdx, targetingAbility, onTargetClick, gameOver }) {
  const cellSize = cols <= 9 ? 'w-10 h-10' : cols <= 16 ? 'w-8 h-8' : 'w-7 h-7';

  return (
    <div
      className={`skin-${skin} inline-grid gap-[2px] p-2 rounded-xl border border-border/40`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {cells.map((cell) => (
        <div key={cell.id} className={cellSize}>
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