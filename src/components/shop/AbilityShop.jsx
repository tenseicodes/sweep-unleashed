import { useState } from 'react';
import { motion } from 'framer-motion';
import { ABILITIES } from '@/lib/gameConstants';
import { Button } from '@/components/ui/button';
import JCEPurchase from './JCEPurchase';
import { ScanIcon, ShieldIcon, DetonateIcon, RevealZoneIcon, YamatoIcon, JaneBeamIcon } from '@/components/game/AbilityIcons';

const ABILITY_ICONS = { scan: ScanIcon, shield: ShieldIcon, detonate: DetonateIcon, reveal_zone: RevealZoneIcon, jce: YamatoIcon, jj: JaneBeamIcon };

export default function AbilityShop({ profile, onPurchase }) {
  const [jceOpen, setJceOpen] = useState(false);
  const [jjOpen, setJjOpen] = useState(false);
  const shopItems = Object.values(ABILITIES).filter(a => a.shopPrice !== null);

  return (
    <div className="space-y-3">
      {shopItems.map(ab => {
        const owned = (ab.id === 'jce' || ab.id === 'jj')
          ? profile?.[`${ab.id}_owned`]
          : profile?.owned_abilities?.includes(ab.id);
        const canAfford = ab.shopCurrency === 'coins' ? (profile?.coins || 0) >= ab.shopPrice : true;

        return (
          <motion.div
            key={ab.id}
            whileHover={{ scale: 1.01 }}
            className={`flex items-center gap-3 p-4 rounded-xl border ${ab.bgColor} ${ab.borderColor}`}
          >
            {(() => { const I = ABILITY_ICONS[ab.id]; return I ? <I className={`w-8 h-8 shrink-0 ${ab.color}`} /> : null; })()}
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
                  onClick={() => ab.id === 'jj' ? setJjOpen(true) : setJceOpen(true)}
                  className="bg-white text-black hover:bg-white/90 font-bold"
                >
                  ${ab.shopPrice}.00
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
      <JCEPurchase
        open={jjOpen}
        onClose={() => setJjOpen(false)}
        onSuccess={() => { onPurchase('jj', 'jj', 0); setJjOpen(false); }}
        title="Jane Juliet"
        price="5.00"
        description="A phantom strike. Removes half of all mines and their surrounding blocks."
      />
    </div>
  );
}