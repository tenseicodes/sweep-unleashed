import { motion } from 'framer-motion';
import { NUMBER_COLORS } from '@/lib/gameConstants';

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

  const baseClass = `cell-base select-none cursor-pointer border transition-all duration-150 flex items-center justify-center font-mono font-bold text-xs sm:text-sm relative w-full h-full`;

  if (!isRevealed) {
    return (
      <motion.div
        whileHover={!gameOver ? { scale: 1.08, zIndex: 10 } : {}}
        whileTap={!gameOver ? { scale: 0.93 } : {}}
        className={`${baseClass} cell-unrevealed rounded-sm
          ${isHighlighted ? 'animate-scan-pulse ring-2 ring-cyan-400' : ''}
          ${isTargeting ? 'cursor-crosshair hover:ring-2 hover:ring-primary' : ''}
        `}
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        {isFlagged && <span className={`text-base cell-flag ${skin === 'sakura' ? 'text-pink-500' : 'text-yellow-400'}`}>🚩</span>}
        {isHighlighted && !isFlagged && <span className="text-cyan-400 text-base">✦</span>}
      </motion.div>
    );
  }

  // Revealed
  if (isMine) {
    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`${baseClass} cell-mine bg-red-900/60 border-red-700/50 rounded-sm`}
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        <span className="text-base">💣</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={`${baseClass} cell-revealed rounded-sm`}
      onClick={handleClick}
      onContextMenu={handleRightClick}
    >
      {neighborCount > 0 && (
        <span className={`cell-safe ${NUMBER_COLORS[neighborCount]}`}>
          {neighborCount}
        </span>
      )}
    </motion.div>
  );
}