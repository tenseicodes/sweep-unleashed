import { motion } from 'framer-motion';
import { QUESTS } from '@/lib/gameConstants';
import { CheckCircle2, Circle } from 'lucide-react';

export default function QuestPanel({ profile, onClaim }) {
  if (!profile) return null;

  const progress = profile.quest_progress || {};
  const claimed  = profile.quest_claimed || [];

  return (
    <div className="space-y-2">
      <h3 className="font-arcade text-[9px] text-muted-foreground tracking-widest mb-3">DAILY QUESTS</h3>
      {QUESTS.map(q => {
        const current   = progress[q.stat] || 0;
        const done      = current >= q.target;
        const isClaimed = claimed.includes(q.id);
        const pct       = Math.min((current / q.target) * 100, 100);

        return (
          <motion.div
            key={q.id}
            whileHover={{ scale: 1.01 }}
            className={`p-3 rounded-xl border transition-all
              ${isClaimed ? 'bg-green-500/5 border-green-500/20 opacity-60' :
                done       ? 'bg-primary/10 border-primary/30' :
                             'bg-card border-border/50'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isClaimed
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  : done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    : <Circle      className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                }
                <span className={`font-arcade text-[8px] leading-relaxed ${isClaimed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {q.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-arcade text-[8px] text-yellow-400">🪙{q.reward}</span>
                {done && !isClaimed && (
                  <motion.button
                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    onClick={() => onClaim(q.id, q.reward)}
                    className="px-2 py-1 rounded-lg bg-primary text-primary-foreground font-arcade text-[7px] tracking-wider"
                  >
                    CLAIM
                  </motion.button>
                )}
              </div>
            </div>
            {!isClaimed && (
              <div className="mt-2">
                <div className="flex justify-between font-arcade text-[7px] text-muted-foreground mb-1">
                  <span>{current}/{q.target}</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}