import { motion } from 'framer-motion';
import { Timer, Flag } from 'lucide-react';
import ChargeBar from './ChargeBar';

export default function GameHUD({ flagsLeft, time, charges, coins, sessionCoins }) {
  const mins = String(Math.floor(time / 60)).padStart(2, '0');
  const secs = String(time % 60).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex items-center gap-1 rounded-lg px-2 py-1.5" style={{ background: 'var(--skin-hud-bg)', border: '1px solid var(--skin-border)' }}>
        <Flag className="w-3 h-3 text-yellow-400" />
        <span className="font-arcade text-[9px] text-yellow-400">{flagsLeft}</span>
      </div>
      <div className="flex items-center gap-1 rounded-lg px-2 py-1.5" style={{ background: 'var(--skin-hud-bg)', border: '1px solid var(--skin-border)' }}>
        <Timer className="w-3 h-3" style={{ color: 'var(--skin-muted)' }} />
        <span className="font-arcade text-[9px]" style={{ color: 'var(--skin-text)' }}>{mins}:{secs}</span>
      </div>
      <div className="flex items-center gap-1 rounded-lg px-2 py-1.5" style={{ background: 'var(--skin-hud-bg)', border: '1px solid var(--skin-border)' }}>
        <span className="text-sm">🪙</span>
        <span className="font-arcade text-[9px] text-yellow-400">{coins}</span>
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