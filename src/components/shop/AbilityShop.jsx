import { useState } from 'react';
import { motion } from 'framer-motion';
import { ABILITIES } from '@/lib/gameConstants';
import { Button } from '@/components/ui/button';
import JCEPurchase from './JCEPurchase';

export default function AbilityShop({ profile, onPurchase }) {
  const [jceOpen, setJceOpen] = useState(false);
  const shopItems = Object.values(ABILITIES).filter(a => a.shopPrice !== null);

  return (
    <div className="space-y-3">
      {shopItems.map(ab => {
        const owned = ab.id === 'jce'
          ? profile?.jce_owned
          : profile?.owned_abilities?.includes(ab.id);
        const canAfford = ab.shopCurrency === 'coins' ? (profile?.coins || 0) >= ab.shopPrice : true;

        return (
          <motion.div
            key={ab.id}
            whileHover={{ scale: 1.01 }}
            className={`flex items-center gap-3 p-4 rounded-xl border ${ab.bgColor} ${ab.borderColor}`}
          >
            <span className="text-3xl">{ab.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-bold ${ab.color}`}>{ab.name}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {ab.charges} ⚡ to use
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{ab.description}</p>
            </div>
            <div className="shrink-0">
              {owned ? (
                <span className="text-xs text-green-400 font-bold bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-400/30">
                  ✓ Owned
                </span>
              ) : ab.shopCurrency === 'usd' ? (
                <Button
                  size="sm"
                  onClick={() => setJceOpen(true)}
                  className="bg-white text-black hover:bg-white/90 font-bold"
                >
                  $2.00
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={!canAfford}
                  onClick={() => onPurchase('ability', ab.id, ab.shopPrice)}
                  className={canAfford ? '' : 'opacity-40'}
                >
                  🪙 {ab.shopPrice}
                </Button>
              )}
            </div>
          </motion.div>
        );
      })}

      <JCEPurchase
        open={jceOpen}
        onClose={() => setJceOpen(false)}
        onSuccess={() => { onPurchase('jce', 'jce', 0); setJceOpen(false); }}
      />
    </div>
  );
}