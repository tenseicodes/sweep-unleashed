import { motion } from 'framer-motion';
import { SKINS } from '@/lib/gameConstants';

export default function SkinShop({ profile, onPurchase }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.values(SKINS).map((skin, i) => {
        const owned  = profile?.owned_skins?.includes(skin.id);
        const active = profile?.active_skin === skin.id;
        const canAfford = (profile?.coins || 0) >= skin.price;

        return (
          <motion.div
            key={skin.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3 rounded-xl border flex flex-col gap-2.5 transition-all
              ${active
                ? 'border-primary/60 bg-primary/10 shadow-lg shadow-primary/20'
                : 'border-white/10 bg-white/5 hover:border-white/20'}`}
          >
            {/* Preview grid */}
            <div className="grid grid-cols-4 gap-0.5 rounded overflow-hidden">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-sm"
                  style={{
                    background: idx % 3 === 0 ? skin.preview[1] : skin.preview[0],
                    opacity: idx % 3 === 0 ? 0.9 : 0.6,
                    boxShadow: skin.id === 'neon' ? `0 0 4px ${skin.preview[1]}` : 'none',
                  }}
                />
              ))}
            </div>

            <div>
              <p className="font-arcade text-[9px] text-foreground tracking-wider">{skin.name.toUpperCase()}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{skin.description}</p>
            </div>

            {active ? (
              <span className="font-arcade text-[8px] text-primary text-center py-1.5">✓ ACTIVE</span>
            ) : owned ? (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => onPurchase('skin_equip', skin.id, 0)}
                className="w-full font-arcade text-[8px] py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              >
                EQUIP
              </motion.button>
            ) : (
              <motion.button
                whileHover={canAfford || skin.price === 0 ? { scale: 1.03 } : {}}
                whileTap={canAfford || skin.price === 0 ? { scale: 0.97 } : {}}
                disabled={skin.price > 0 && !canAfford}
                onClick={() => onPurchase('skin', skin.id, skin.price)}
                className={`w-full font-arcade text-[8px] py-2 rounded-lg border transition-all
                  ${canAfford || skin.price === 0
                    ? 'border-yellow-400/40 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20'
                    : 'opacity-30 cursor-not-allowed border-border bg-card text-muted-foreground'}`}
              >
                {skin.price === 0 ? 'FREE' : `⚡ ${skin.price}`}
              </motion.button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}