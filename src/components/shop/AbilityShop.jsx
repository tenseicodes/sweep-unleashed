import { useState } from 'react';
import { motion } from 'framer-motion';
import { ABILITIES } from '@/lib/gameConstants';
import JCEPurchase from './JCEPurchase';
import { ScanIcon, ShieldIcon, DetonateIcon, RevealZoneIcon, YamatoIcon, JaneBeamIcon } from '@/components/game/AbilityIcons';

const ABILITY_ICONS = { scan: ScanIcon, shield: ShieldIcon, detonate: DetonateIcon, reveal_zone: RevealZoneIcon, jce: YamatoIcon, jj: JaneBeamIcon };

export default function AbilityShop({ profile, onPurchase }) {
  const [jceOpen, setJceOpen] = useState(false);
  const [jjOpen, setJjOpen] = useState(false);
  const shopItems = Object.values(ABILITIES).filter(a => a.shopPrice !== null);

  return (
    <div className="space-y-3">
      {shopItems.map((ab, i) => {
        const owned = (ab.id === 'jce' || ab.id === 'jj')
          ? profile?.[`${ab.id}_owned`]
          : profile?.owned_abilities?.includes(ab.id);
        const canAfford = ab.shopCurrency === 'coins' ? (profile?.coins || 0) >= ab.shopPrice : true;

        return (
          <motion.div
            key={ab.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all
              ${owned
                ? 'bg-white/5 border-white/10 opacity-70'
                : `${ab.bgColor} ${ab.borderColor}`}`}
          >
            {(() => { const I = ABILITY_ICONS[ab.id]; return I ? <I className={`w-8 h-8 shrink-0 ${ab.color}`} /> : null; })()}

            <div className="flex-1 min-w-0">
              <p className={`font-arcade text-[9px] tracking-wider ${ab.color}`}>{ab.name.toUpperCase()}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">{ab.description}</p>
              <span className="font-arcade text-[8px] text-yellow-400/60">{ab.charges} ⚡ to use</span>
            </div>

            <div className="shrink-0">
              {owned ? (
                <span className="font-arcade text-[8px] text-green-400 border border-green-400/30 bg-green-400/10 px-2 py-1.5 rounded-lg">
                  ✓ OWNED
                </span>
              ) : ab.shopCurrency === 'usd' ? (
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => ab.id === 'jj' ? setJjOpen(true) : setJceOpen(true)}
                  className="font-arcade text-[8px] px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-all min-h-[40px]"
                >
                  ${ab.shopPrice}.00
                </motion.button>
              ) : (
                <motion.button
                  whileHover={canAfford ? { scale: 1.05 } : {}}
                  whileTap={canAfford ? { scale: 0.95 } : {}}
                  disabled={!canAfford}
                  onClick={() => onPurchase('ability', ab.id, ab.shopPrice)}
                  className={`font-arcade text-[8px] px-3 py-2 rounded-lg border transition-all min-h-[40px]
                    ${canAfford
                      ? `${ab.bgColor} ${ab.borderColor} ${ab.color} hover:brightness-125`
                      : 'opacity-30 cursor-not-allowed bg-card border-border text-muted-foreground'}`}
                >
                  ⚡ {ab.shopPrice}
                </motion.button>
              )}
            </div>
          </motion.div>
        );
      })}

      <JCEPurchase
        open={jceOpen}
        onClose={() => setJceOpen(false)}
        onSuccess={() => { onPurchase('jce', 'jce', 0); setJceOpen(false); }}
        price="5.00"
        description="A legendary ability. Destroys ~65% of all mines in a cinematic barrage of slashes."
      />
      <JCEPurchase
        open={jjOpen}
        onClose={() => setJjOpen(false)}
        onSuccess={() => { onPurchase('jj', 'jj', 0); setJjOpen(false); }}
        title="Jane Juliet"
        price="2.00"
        description="A phantom strike. Removes half of all mines and their surrounding blocks."
      />
    </div>
  );
}