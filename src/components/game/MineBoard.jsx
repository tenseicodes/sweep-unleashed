import { memo, useRef, useState, useEffect } from 'react';
import MineCell from './MineCell';

const MineBoard = memo(function MineBoard({ cells, rows, cols, onCellClick, onCellRightClick, highlightedIdx, targetingAbility, onTargetClick, gameOver }) {
  const isMobile = window.innerWidth < 600;
  const scrollRef = useRef(null);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [showSlider, setShowSlider] = useState(false);

  // Calculate cell size to fit screen width on mobile, both dimensions on desktop
  const availW = window.innerWidth * 0.96;
  const reservedH = isMobile ? 300 : 260;
  const availH = window.innerHeight - reservedH;

  const maxByWidth  = Math.floor(availW / cols);
  const maxByHeight = Math.floor(availH / rows);

  const cellSize = isMobile
    ? Math.max(18, Math.min(maxByWidth, 52))
    : Math.max(22, Math.min(maxByWidth, maxByHeight, 52));

  const boardWidth = cols * cellSize + (cols - 1) * 2 + 16; // gap + padding
  const needsScroll = isMobile && boardWidth > availW;

  // Track scroll position for slider
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !needsScroll) return;
    const handleScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setScrollRatio(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    // Show slider if board overflows
    setShowSlider(true);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [needsScroll]);

  const handleSliderChange = (e) => {
    const ratio = parseFloat(e.target.value);
    setScrollRatio(ratio);
    const el = scrollRef.current;
    if (el) {
      const max = el.scrollWidth - el.clientWidth;
      el.scrollLeft = ratio * max;
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {/* Scrollable board */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-visible w-full"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className="inline-grid gap-[2px] p-2 rounded-xl mx-auto"
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

      {/* Horizontal scroll slider — only shown on mobile when board overflows */}
      {isMobile && needsScroll && (
        <div className="w-full px-4 flex items-center gap-2">
          <span className="text-[9px] font-arcade text-muted-foreground">◀</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={scrollRatio}
            onChange={handleSliderChange}
            className="flex-1 h-1 accent-primary"
            style={{ accentColor: 'var(--skin-accent)' }}
          />
          <span className="text-[9px] font-arcade text-muted-foreground">▶</span>
        </div>
      )}
    </div>
  );
});

export default MineBoard;