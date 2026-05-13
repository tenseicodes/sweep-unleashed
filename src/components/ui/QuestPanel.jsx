import { motion } from 'framer-motion';
import { QUESTS } from '@/lib/gameConstants';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

export default function QuestPanel({ profile, onClaim }) {
  if (!profile) return null;

  const progress = profile.quest_progress || {};
  const claimed = profile.quest_claimed || [];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Daily Quests</h3>
      {QUESTS.map(q => {
        const current = progress[q.stat] || 0;
        const done = current >= q.target;
        const isClaimed = claimed.includes(q.id);
        const pct = Math.min((current / q.target) * 100, 100);

        return (
          <motion.div
            key={q.id}
            whileHover={{ scale: 1.01 }}
            className={`p-3 rounded-xl border transition-all
              ${isClaimed ? 'bg-green-500/5 border-green-500/20 opacity-60' :
                done ? 'bg-primary/10 border-primary/30' :
                'bg-card border-border/50'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isClaimed
                  ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  : done
                    ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                }
                <span className={`text-sm font-medium truncate ${isClaimed ? 'line-through text-muted-foreground' : ''}`}>
                  {q.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-yellow-400 font-mono">🪙{q.reward}</span>
                {done && !isClaimed && (
                  <Button size="sm" className="h-6 px-2 text-xs" onClick={() => onClaim(q.id, q.reward)}>
                    Claim
                  </Button>
                )}
              </div>
            </div>
            {!isClaimed && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
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