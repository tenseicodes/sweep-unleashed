import { motion } from 'framer-motion';
import { ABILITIES } from '@/lib/gameConstants';

export default function AbilityBar({ charges, ownedAbilities, activeAbility, shieldActive, onActivate, jceOwned }) {
  const available = [...ownedAbilities, ...(jceOwned ? ['jce'] : [])].filter((id, i, arr) => arr.indexOf(id) === i);

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {available.map(id => {
        const ab = ABILITIES[id];
        if (!ab) return null;
        const canUse = charges >= ab.charges;
        const isActive = activeAbility === id;
        const isShieldActive = id === 'shield' && shieldActive;

        return (
          <motion.button
            key={id}
            whileHover={canUse ? { scale: 1.05 } : {}}
            whileTap={canUse ? { scale: 0.95 } : {}}
            onClick={() => canUse && onActivate(id)}
            className={`
              relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium
              transition-all duration-200 min-w-[70px]
              ${ab.bgColor} ${ab.borderColor}
              ${isActive ? 'ring-2 ring-primary scale-105' : ''}
              ${isShieldActive ? 'animate-shield-pulse' : ''}
              ${canUse ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'}
            `}
          >
            <span className="text-xl">{ab.icon}</span>
            <span className={`${ab.color} font-semibold`}>{ab.name}</span>
            <span className="text-muted-foreground text-[10px]">
              {charges}/{ab.charges} ⚡
            </span>
            {isShieldActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}