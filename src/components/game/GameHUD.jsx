import { motion } from 'framer-motion';
import { Timer, Flag } from 'lucide-react';
import ChargeBar from './ChargeBar';

export default function GameHUD({ flagsLeft, time, charges, coins, sessionCoins }) {
  const mins = String(Math.floor(time / 60)).padStart(2, '0');
  const secs = String(time % 60).padStart(2, '0');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 bg-card border border-border/50 rounded-lg px-3 py-2">
        <Flag className="w-3 h-3 text-yellow-400" />
        <span className="font-arcade text-[10px] text-yellow-400">{flagsLeft}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-card border border-border/50 rounded-lg px-3 py-2">
        <Timer className="w-3 h-3 text-muted-foreground" />
        <span className="font-arcade text-[10px]">{mins}:{secs}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-card border border-border/50 rounded-lg px-3 py-2">
        <span className="text-yellow-400 text-sm">🪙</span>
        <span className="font-arcade text-[10px] text-yellow-400">{coins}</span>
        {sessionCoins > 0 && (
          <motion.span
            key={sessionCoins}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-arcade text-[8px] text-green-400"
          >+{sessionCoins}</motion.span>
        )}
      </div>
      <ChargeBar charges={charges} />
    </div>
  );
}