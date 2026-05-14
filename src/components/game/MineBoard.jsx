import { memo, useRef, useState, useEffect } from 'react';
import MineCell from './MineCell';

const MineBoard = memo(function MineBoard({ cells, rows, cols, onCellClick, onCellRightClick, highlightedIdx, targetingAbility, onTargetClick, gameOver }) {
  const scrollRef = useRef(null);
  const [scrollRatio, setScrollRatio] = useState(0);

  const isMobile = window.innerWidth < 768;

  // Available space
  const padding = 32; // px on each side
  const availW = window.innerWidth - padding * 2;
  const reservedH = isMobile ? 320 : 280; // top bar + HUD + ability bar + footer
  const availH = window.innerHeight - reservedH;

  // Cell size: on desktop, fit both dimensions; on mobile, fit width (can scroll horizontally)
  const cellByWidth  = Math.floor(availW / cols);
  const cellByHeight = Math.floor(availH / rows);

  let cellSize;
  if (isMobile) {
    cellSize = Math.max(18, Math.min(cellByWidth, 52));
  } else {
    cellSize = Math.max(22, Math.min(cellByWidth, cellByHeight, 52));
  }

  const boardPx = cols * cellSize + (cols - 1) * 2 + 16; // gap + padding
  const needsScroll = isMobile && boardPx > availW;

  // Track scroll position for the mobile slider
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !needsScroll) return;
    const handleScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setScrollRatio(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [needsScroll]);

  const handleSliderChange = (e) => {
    const ratio = parseFloat(e.target.value);
    setScrollRatio(ratio);
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = ratio * (el.scrollWidth - el.clientWidth);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {/* Board container — scrollable only on mobile when needed */}
      <div
        ref={scrollRef}
        className={needsScroll ? 'overflow-x-auto overflow-y-visible w-full' : 'w-full flex justify-center'}
        style={needsScroll ? { WebkitOverflowScrolling: 'touch' } : {}}
      >
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

      {/* Horizontal scroll slider — mobile only, only when board overflows */}
      {needsScroll && (
        <div className="w-full px-4 flex items-center gap-2">
          <span className="text-[9px] font-arcade text-muted-foreground">◀</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={scrollRatio}
            onChange={handleSliderChange}
            className="flex-1 h-1"
            style={{ accentColor: 'var(--skin-accent)' }}
          />
          <span className="text-[9px] font-arcade text-muted-foreground">▶</span>
        </div>
      )}
    </div>
  );
});

export default MineBoard;