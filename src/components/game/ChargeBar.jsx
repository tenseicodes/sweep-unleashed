import { motion } from 'framer-motion';

export default function ChargeBar({ charges, maxDisplay = 15 }) {
  const display = Math.min(charges, maxDisplay);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground font-mono">⚡</span>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: maxDisplay }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8 }}
            animate={{
              scale: i < display ? 1 : 0.85,
              opacity: i < display ? 1 : 0.2,
            }}
            transition={{ duration: 0.15, delay: i < display ? i * 0.03 : 0 }}
            className={`w-2.5 h-2.5 rounded-sm ${i < display ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-muted'}`}
          />
        ))}
        {charges > maxDisplay && (
          <span className="text-xs text-cyan-400 font-mono ml-1">+{charges - maxDisplay}</span>
        )}
      </div>
      <span className="text-xs text-cyan-400 font-mono font-bold">{charges}</span>
    </div>
  );
}