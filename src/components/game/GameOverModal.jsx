import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Skull, RefreshCw, ShoppingBag } from 'lucide-react';

export default function GameOverModal({ won, time, coinsEarned, onRestart, onShop }) {
  const mins = String(Math.floor(time / 60)).padStart(2, '0');
  const secs = String(time % 60).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 200 }}
        className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-5 max-w-xs w-full mx-4 shadow-2xl"
      >
        {won ? (
          <>
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Trophy className="w-16 h-16 text-yellow-400" />
            </motion.div>
            <h2 className="text-2xl font-black text-foreground">Victory!</h2>
            <p className="text-muted-foreground text-sm text-center">
              Field cleared in <span className="text-foreground font-bold">{mins}:{secs}</span>
            </p>
          </>
        ) : (
          <>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.4 }}>
              <Skull className="w-16 h-16 text-red-400" />
            </motion.div>
            <h2 className="text-2xl font-black text-foreground">Game Over</h2>
            <p className="text-muted-foreground text-sm">You hit a mine.</p>
          </>
        )}

        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2">
          <span className="text-xl">🪙</span>
          <span className="text-yellow-400 font-bold">+{coinsEarned} coins</span>
        </div>

        <div className="flex gap-3 w-full">
          <Button onClick={onRestart} className="flex-1 gap-2">
            <RefreshCw className="w-4 h-4" /> Play Again
          </Button>
          <Button variant="outline" onClick={onShop} className="flex-1 gap-2">
            <ShoppingBag className="w-4 h-4" /> Shop
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}