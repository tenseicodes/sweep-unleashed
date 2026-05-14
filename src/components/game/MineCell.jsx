import { useRef } from 'react';
import { NUMBER_COLORS } from '@/lib/gameConstants';

// Long-press threshold for mobile flagging
const LONG_PRESS_MS = 400;
// Movement threshold to distinguish scroll from tap (pixels)
const MOVE_THRESHOLD = 6;

export default function MineCell({
  cell,
  onClick,
  onRightClick,
  isHighlighted,
  isTargeting,
  onTargetClick,
  gameOver,
}) {
  const { isRevealed, isMine, isFlagged, neighborCount } = cell;
  const longPressTimer = useRef(null);
  const didLongPress = useRef(false);
  const touchStartPos = useRef(null);
  const didMove = useRef(false);

  const handleTouchStart = (e) => {
    didLongPress.current = false;
    didMove.current = false;
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    longPressTimer.current = setTimeout(() => {
      if (!didMove.current) {
        didLongPress.current = true;
        if (!isRevealed && !isTargeting) onRightClick(cell);
      }
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = (e) => {
    if (touchStartPos.current) {
      const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
      const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
        didMove.current = true;
        clearTimeout(longPressTimer.current);
      }
    }
  };

  const handleTouchEnd = (e) => {
    clearTimeout(longPressTimer.current);
    // If finger moved (scroll intent) or long press, don't trigger click
    if (didMove.current || didLongPress.current) return;
    e.preventDefault();
    if (isTargeting) { onTargetClick(cell); return; }
    onClick(cell);
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
        {isFlagged && <span className="text-sm cell-flag text-yellow-400">🚩</span>}
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