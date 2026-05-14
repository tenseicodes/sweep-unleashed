import { useRef } from 'react';
import { NUMBER_COLORS } from '@/lib/gameConstants';

// Long-press threshold for mobile flagging
const LONG_PRESS_MS = 400;

export default function MineCell({
  cell,
  onClick,
  onRightClick,
  isHighlighted,
  isTargeting,
  onTargetClick,
  gameOver,
  skin = 'default',
}) {
  const { isRevealed, isMine, isFlagged, neighborCount } = cell;
  const longPressTimer = useRef(null);
  const didLongPress = useRef(false);

  // ── Touch handlers for mobile flagging via long-press ──
  const handleTouchStart = (e) => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      if (!isRevealed && !isTargeting) onRightClick(cell);
    }, LONG_PRESS_MS);
  };

  const handleTouchEnd = (e) => {
    clearTimeout(longPressTimer.current);
    if (didLongPress.current) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    if (isTargeting) { onTargetClick(cell); return; }
    onClick(cell);
  };

  const handleTouchMove = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (isTargeting) { onTargetClick(cell); return; }
    onClick(cell);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (isTargeting) return;
    onRightClick(cell);
  };

  const base = `select-none cursor-pointer border flex items-center justify-center font-mono font-bold text-xs sm:text-sm w-full h-full rounded-sm`;

  if (!isRevealed) {
    return (
      <div
        className={`${base} cell-unrevealed
          ${isHighlighted ? 'animate-scan-pulse ring-2 ring-cyan-400' : ''}
          ${isTargeting ? 'cursor-crosshair' : ''}
          ${!gameOver ? 'active:scale-90' : ''}
        `}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {isFlagged && <span className={`text-sm cell-flag ${skin === 'sakura' ? 'text-pink-500' : 'text-yellow-400'}`}>🚩</span>}
        {isHighlighted && !isFlagged && <span className="text-cyan-400 text-sm">✦</span>}
      </div>
    );
  }

  if (isMine) {
    return (
      <div
        className={`${base} cell-mine bg-red-900/60 border-red-700/50 animate-mine-explode`}
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        <span className="text-sm">💣</span>
      </div>
    );
  }

  return (
    <div
      className={`${base} cell-revealed animate-cell-reveal`}
      onClick={handleClick}
      onContextMenu={handleRightClick}
    >
      {neighborCount > 0 && (
        <span className={`cell-safe ${NUMBER_COLORS[neighborCount]}`}>
          {neighborCount}
        </span>
      )}
    </div>
  );
}