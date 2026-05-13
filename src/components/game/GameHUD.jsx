import { motion } from 'framer-motion';
import { Timer, Flag } from 'lucide-react';
import ChargeBar from './ChargeBar';

export default function GameHUD({ flagsLeft, time, charges, coins, sessionCoins }) {
  const mins = String(Math.floor(time / 60)).padStart(2, '0');
  const secs = String(time % 60).padStart(2, '0');

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <div className="flex items-center gap-1.5 bg-card border border-border/50 rounded-lg px-3 py-1.5">
        <Flag className="w-3.5 h-3.5 text-yellow-400" />
        <span className="font-mono font-bold text-yellow-400">{flagsLeft}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-card border border-border/50 rounded-lg px-3 py-1.5">
        <Timer className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-mono font-bold">{mins}:{secs}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-card border border-border/50 rounded-lg px-3 py-1.5">
        <span className="text-yellow-400 text-base">🪙</span>
        <span className="font-mono font-bold text-yellow-400">{coins}</span>
        {sessionCoins > 0 && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-green-400"
          >+{sessionCoins}</motion.span>
        )}
      </div>
      <ChargeBar charges={charges} />
    </div>
  );
}