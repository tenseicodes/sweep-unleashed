import { motion } from 'framer-motion';
import { ShoppingBag, User, Star } from 'lucide-react';
import QuestPanel from '@/components/ui/QuestPanel';
import { Button } from '@/components/ui/button';

export default function GameSidebar({ profile, onOpenShop, onClaim }) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="w-64 shrink-0 flex flex-col gap-4"
    >
      {/* Profile */}
      <div className="bg-card border border-border/50 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-arcade text-[9px] text-foreground leading-tight">PLAYER</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              {profile?.total_wins || 0} wins
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
          <span className="text-base">🪙</span>
          <span className="text-yellow-400 font-bold font-mono text-lg">{profile?.coins || 0}</span>
          <span className="text-xs text-muted-foreground ml-auto">{profile?.total_games || 0} games</span>
        </div>
      </div>

      {/* Shop Button */}
      <Button onClick={onOpenShop} className="w-full gap-2">
        <ShoppingBag className="w-4 h-4" /> Open Shop
      </Button>

      {/* Quests */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 flex-1 overflow-y-auto max-h-[500px]">
        <QuestPanel profile={profile} onClaim={onClaim} />
      </div>
    </motion.aside>
  );
}