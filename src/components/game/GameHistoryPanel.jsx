import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ABILITIES } from '@/lib/gameConstants';
import { motion } from 'framer-motion';

function fmtTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

export default function GameHistoryPanel() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GameHistory.list('-created_date', 20)
      .then(r => { setHistory(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="font-arcade text-[8px] text-muted-foreground text-center py-4 animate-pulse">LOADING...</p>;
  if (!history.length) return <p className="font-arcade text-[8px] text-muted-foreground text-center py-4">NO GAMES YET</p>;

  return (
    <div className="space-y-2">
      {history.map((g, i) => {
        const ab = ABILITIES[g.ability_used];
        return (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left
              ${g.result === 'win'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/20'}`}
          >
            <span className="text-lg">{g.result === 'win' ? '✅' : '💀'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-arcade text-[8px] text-foreground capitalize">
                {g.field_size} · {ab?.icon || ''} {ab?.name || g.ability_used}
              </p>
              <p className="font-arcade text-[7px] text-muted-foreground mt-0.5">
                {fmtTime(g.time_seconds || 0)} · 🪙{g.coins_earned}
                {g.multiplier > 1 && <span className="text-yellow-400"> ×{g.multiplier}</span>}
              </p>
            </div>
            {g.win_streak > 1 && g.result === 'win' && (
              <span className="font-arcade text-[7px] text-orange-400 shrink-0">🔥×{g.win_streak}</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}