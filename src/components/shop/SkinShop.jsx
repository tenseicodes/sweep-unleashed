import { motion } from 'framer-motion';
import { SKINS } from '@/lib/gameConstants';
import { useSkin } from '@/lib/SkinContext';

export default function SkinShop({ profile, onPurchase }) {
  const activeSkin = useSkin(); // use live skin from context, not stale profile

  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.values(SKINS).map((skin, i) => {
        const owned    = profile?.owned_skins?.includes(skin.id);
        const active   = activeSkin === skin.id;
        const canAfford = (profile?.coins || 0) >= skin.price;

        return (
          <motion.div
            key={skin.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl flex flex-col gap-2.5 transition-all"
            style={{
              border: `1px solid ${active ? 'var(--skin-accent)' : 'var(--skin-border)'}`,
              background: active ? 'var(--skin-accent-soft)' : 'rgba(255,255,255,0.03)',
              boxShadow: active ? '0 0 16px var(--skin-accent-soft)' : 'none',
            }}
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
              <p className="font-arcade text-[9px] tracking-wider" style={{ color: 'var(--skin-text)' }}>
                {skin.name.toUpperCase()}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--skin-muted)' }}>{skin.description}</p>
            </div>

            {active ? (
              <span className="font-arcade text-[8px] text-center py-1.5" style={{ color: 'var(--skin-accent)' }}>✓ ACTIVE</span>
            ) : owned ? (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => onPurchase('skin_equip', skin.id, 0)}
                className="w-full font-arcade text-[8px] py-2 rounded-lg transition-all"
                style={{ border: '1px solid var(--skin-accent)', color: 'var(--skin-accent)', background: 'var(--skin-accent-soft)' }}
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