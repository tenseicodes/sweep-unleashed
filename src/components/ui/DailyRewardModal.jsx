import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DAILY_REWARDS } from '@/lib/gameConstants';

export default function DailyRewardModal({ open, amount, streak, onClose }) {
  if (!open) return null;

  const streakIdx = Math.min((streak || 1) - 1, DAILY_REWARDS.length - 1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 220 }}
          className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-5 max-w-xs w-full mx-4 shadow-2xl"
        >
          <div className="text-5xl">🌅</div>
          <h2 className="text-xl font-black text-foreground">Daily Reward!</h2>
          <p className="text-muted-foreground text-sm text-center">
            Day <span className="text-foreground font-bold">{streak || 1}</span> streak — keep it up!
          </p>

          {/* Streak track */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            {DAILY_REWARDS.map((r, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border text-xs
                  ${i < streakIdx ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-400' :
                    i === streakIdx ? 'bg-yellow-400/30 border-yellow-400 text-yellow-400 ring-1 ring-yellow-400' :
                    'bg-muted border-border/50 text-muted-foreground opacity-50'}`}
              >
                <span>Day {i + 1}</span>
                <span className="font-bold">🪙{r}</span>
              </div>
            ))}
          </div>

          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: 3, duration: 0.4 }}
            className="flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 rounded-xl px-5 py-3"
          >
            <span className="text-2xl">🪙</span>
            <span className="text-2xl font-black text-yellow-400">+{amount}</span>
          </motion.div>

          <Button className="w-full" onClick={onClose}>Claim!</Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}