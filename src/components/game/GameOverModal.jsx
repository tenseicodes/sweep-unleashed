import { motion } from 'framer-motion';
import { Trophy, Skull, RefreshCw, ShoppingBag, Home } from 'lucide-react';

export default function GameOverModal({ won, time, coinsEarned, onRestart, onShop, onMainMenu }) {
  const mins = String(Math.floor(time / 60)).padStart(2, '0');
  const secs = String(time % 60).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
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
              <Trophy className="w-14 h-14 text-yellow-400" />
            </motion.div>
            <h2 className="font-arcade text-base text-yellow-400 tracking-wider">VICTORY!</h2>
            <p className="font-arcade text-[9px] text-muted-foreground text-center">
              CLEARED IN {mins}:{secs}
            </p>
          </>
        ) : (
          <>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.4 }}>
              <Skull className="w-14 h-14 text-red-400" />
            </motion.div>
            <h2 className="font-arcade text-base text-red-400 tracking-wider">GAME OVER</h2>
            <p className="font-arcade text-[9px] text-muted-foreground">YOU HIT A MINE</p>
          </>
        )}

        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2">
          <span className="text-xl">🪙</span>
          <span className="font-arcade text-[10px] text-yellow-400">+{coinsEarned} COINS</span>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-arcade text-[9px] tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5" /> PLAY AGAIN
          </motion.button>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onMainMenu}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary border border-border font-arcade text-[8px] text-muted-foreground hover:text-foreground tracking-wider"
            >
              <Home className="w-3 h-3" /> MENU
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onShop}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary border border-border font-arcade text-[8px] text-muted-foreground hover:text-foreground tracking-wider"
            >
              <ShoppingBag className="w-3 h-3" /> SHOP
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}