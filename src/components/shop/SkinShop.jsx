import { motion } from 'framer-motion';
import { SKINS } from '@/lib/gameConstants';
import { Button } from '@/components/ui/button';

export default function SkinShop({ profile, onPurchase }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.values(SKINS).map(skin => {
        const owned = profile?.owned_skins?.includes(skin.id);
        const active = profile?.active_skin === skin.id;
        const canAfford = (profile?.coins || 0) >= skin.price;

        return (
          <motion.div
            key={skin.id}
            whileHover={{ scale: 1.02 }}
            className={`p-3 rounded-xl border flex flex-col gap-2
              ${active ? 'border-primary bg-primary/10' : 'border-border/50 bg-card'}`}
          >
            {/* Preview */}
            <div className="grid grid-cols-4 gap-0.5 rounded overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{
                    background: i % 3 === 0 ? skin.preview[1] : skin.preview[0],
                    opacity: i % 3 === 0 ? 0.9 : 0.6,
                    boxShadow: skin.id === 'neon' ? `0 0 4px ${skin.preview[1]}` : 'none',
                  }}
                />
              ))}
            </div>

            <div>
              <h3 className="font-bold text-sm">{skin.name}</h3>
              <p className="text-xs text-muted-foreground">{skin.description}</p>
            </div>

            {active ? (
              <span className="text-xs text-primary font-bold text-center">✓ Active</span>
            ) : owned ? (
              <Button size="sm" variant="outline" onClick={() => onPurchase('skin_equip', skin.id, 0)}>
                Equip
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={skin.price === 0 ? false : !canAfford}
                onClick={() => onPurchase('skin', skin.id, skin.price)}
              >
                {skin.price === 0 ? 'Free' : `🪙 ${skin.price}`}
              </Button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}