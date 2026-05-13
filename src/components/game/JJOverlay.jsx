import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JJOverlay({ active, onComplete }) {
  const [phase, setPhase] = useState('idle');
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (!active) { setPhase('idle'); return; }

    setPhase('intro');
    timers.current.push(setTimeout(() => setPhase('flash'), 1200));
    timers.current.push(setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 1700));

    return () => timers.current.forEach(clearTimeout);
  }, [active]);

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none select-none">
      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'flash' ? 0 : 0.92 }}
        transition={{ duration: 0.2 }}
      />

      {/* Animated cyan beam streaks */}
      <AnimatePresence>
        {phase === 'intro' && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  width: `${60 + i * 12}vw`,
                  height: `${1 + (i % 3)}px`,
                  background: 'linear-gradient(90deg, transparent 0%, #22d3ee 40%, #ffffff 60%, #22d3ee 80%, transparent 100%)',
                  boxShadow: '0 0 16px 4px #22d3ee88',
                  transformOrigin: 'center center',
                  rotate: `${i * 30}deg`,
                  translateX: '-50%',
                  translateY: '-50%',
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: [0, 1, 0.9, 0], opacity: [0, 1, 0.8, 0] }}
                transition={{ delay: i * 0.08, duration: 0.7, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Name card */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            key="namecard"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"
              initial={{ width: 0 }} animate={{ width: '40vw' }}
              transition={{ duration: 0.35, delay: 0.05 }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 14 }}
              className="flex flex-col items-center gap-2"
            >
              <h1
                className="font-arcade text-4xl sm:text-6xl text-cyan-300 leading-none tracking-tight"
                style={{ textShadow: '0 0 40px #22d3ee, 0 0 80px #0891b260' }}
              >
                Lets larp!
              </h1>
            </motion.div>

            <motion.p
              className="font-arcade text-[10px] tracking-[0.4em] text-cyan-200/60"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              Just this once.
            </motion.p>

            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"
              initial={{ width: 0 }} animate={{ width: '40vw' }}
              transition={{ duration: 0.35, delay: 0.25 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            key="flash"
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, #22d3ee 0%, transparent 70%)' }}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0.8, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}