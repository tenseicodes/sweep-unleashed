import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JCEOverlay({ active, onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | text | slash | done

  useEffect(() => {
    if (!active) { setPhase('idle'); return; }
    setPhase('text');
    const t1 = setTimeout(() => setPhase('slash'), 1400);
    const t2 = setTimeout(() => { setPhase('done'); onComplete?.(); }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  if (phase === 'idle') return null;

  const slashCount = 18;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 overflow-hidden"
    >
      {/* Text phase */}
      <AnimatePresence>
        {phase === 'text' && (
          <motion.div
            key="jce-text"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1.05, y: 0, letterSpacing: '0.25em' }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-white/40 text-sm tracking-[0.4em] font-mono mb-2">— ABILITY ACTIVATED —</p>
            <h1
              className="text-4xl sm:text-6xl font-black text-white font-mono uppercase"
              style={{ textShadow: '0 0 30px #fff, 0 0 60px #fff8, 0 0 100px #fff4' }}
            >
              Judgement Cut
            </h1>
            <p
              className="text-3xl sm:text-5xl font-black text-white/80 font-mono mt-1"
              style={{ textShadow: '0 0 20px #fff, 0 0 40px #fff6' }}
            >
              End
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slash phase */}
      {phase === 'slash' && (
        <div className="absolute inset-0">
          {Array.from({ length: slashCount }).map((_, i) => {
            const delay = i * 0.07;
            const top = Math.random() * 100;
            const angle = -40 + Math.random() * 20;
            const width = 60 + Math.random() * 80;
            return (
              <motion.div
                key={i}
                initial={{ x: '-150%', opacity: 0, rotate: angle }}
                animate={{ x: '250%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.35, delay, ease: 'easeOut' }}
                className="absolute h-[2px] bg-white"
                style={{
                  top: `${top}%`,
                  width: `${width}%`,
                  left: 0,
                  boxShadow: '0 0 8px 2px rgba(255,255,255,0.9)',
                  rotate: `${angle}deg`,
                }}
              />
            );
          })}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-white"
          />
        </div>
      )}
    </motion.div>
  );
}