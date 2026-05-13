import { motion } from 'framer-motion';
import { ABILITIES } from '@/lib/gameConstants';
import { SFX } from '@/lib/sounds';

/**
 * AbilityInventory — shows all owned abilities as cards.
 * Player clicks to "equip" one (the active slot), then uses it in game.
 * Equipped ability is shown large; others are smaller.
 */
export default function AbilityInventory({
  charges,
  ownedAbilities,
  jceOwned,
  activeAbility,
  equippedAbility,       // the currently equipped/selected ability
  shieldActive,
  onEquip,              // (id) => void — equip an ability
  onActivate,           // (id) => void — actually fire it
}) {
  const allOwned = [...ownedAbilities, ...(jceOwned ? ['jce'] : [])].filter((id, i, arr) => arr.indexOf(id) === i);

  const handleEquip = (id) => {
    SFX.abilityEquip();
    onEquip(id);
  };

  const handleUse = () => {
    if (!equippedAbility) return;
    const ab = ABILITIES[equippedAbility];
    if (!ab || charges < ab.charges) return;
    onActivate(equippedAbility);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-4xl">
      {/* Inventory row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mr-1">Inventory</span>
        {allOwned.map(id => {
          const ab = ABILITIES[id];
          if (!ab) return null;
          const isEquipped = equippedAbility === id;
          const isShieldOn = id === 'shield' && shieldActive;

          return (
            <motion.button
              key={id}
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleEquip(id)}
              title={`${ab.name} — ${ab.description}`}
              className={`
                relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium
                transition-all duration-150
                ${ab.bgColor} ${ab.borderColor}
                ${isEquipped
                  ? 'ring-2 ring-primary border-primary scale-105 shadow-lg shadow-primary/30'
                  : 'opacity-70 hover:opacity-100'}
                ${isShieldOn ? 'animate-shield-pulse' : ''}
              `}
            >
              <span className="text-base leading-none">{ab.icon}</span>
              <span className={`${ab.color} font-semibold leading-none hidden sm:block`}>{ab.name}</span>
              {isEquipped && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-primary-foreground rounded-full px-1 leading-tight font-bold">
                  EQ
                </span>
              )}
              {isShieldOn && (
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Equipped ability — use button */}
      {equippedAbility && (() => {
        const ab = ABILITIES[equippedAbility];
        if (!ab) return null;
        const canUse = charges >= ab.charges;
        const isTargeting = activeAbility === equippedAbility;

        return (
          <motion.div
            layout
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${ab.bgColor} ${ab.borderColor}`}
          >
            <span className="text-2xl">{ab.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${ab.color} font-mono`}>{ab.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{ab.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[11px] text-muted-foreground font-mono">{charges}/{ab.charges} ⚡</span>
              <motion.button
                whileHover={canUse ? { scale: 1.05 } : {}}
                whileTap={canUse ? { scale: 0.95 } : {}}
                onClick={handleUse}
                disabled={!canUse}
                className={`
                  px-3 py-1 rounded-lg text-xs font-bold border font-mono transition-all
                  ${isTargeting
                    ? 'bg-primary text-primary-foreground border-primary animate-pulse-glow'
                    : canUse
                      ? `${ab.bgColor} ${ab.borderColor} ${ab.color} hover:brightness-125`
                      : 'opacity-30 cursor-not-allowed bg-card border-border text-muted-foreground'}
                `}
              >
                {isTargeting ? '🎯 SELECT CELL' : canUse ? 'USE' : 'NOT ENOUGH ⚡'}
              </motion.button>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}