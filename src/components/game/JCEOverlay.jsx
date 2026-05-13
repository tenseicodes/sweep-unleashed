import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Pre-generate slash data so it's stable between renders
function generateSlashes(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: Math.random() * 110 - 5,          // -5% to 105%
    angle: -55 + Math.random() * 30,        // steep diagonal
    width: 55 + Math.random() * 70,         // 55-125% of screen width
    thickness: 1 + Math.random() * 3,       // 1-4px
    delay: i * 0.045 + Math.random() * 0.02,
    brightness: 0.7 + Math.random() * 0.3,
  }));
}

const SLASH_COUNT = 32;
const slashData = generateSlashes(SLASH_COUNT);

export default function JCEOverlay({ active, onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | text | slash | flash | done
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (!active) { setPhase('idle'); return; }

    setPhase('text');
    timers.current.push(setTimeout(() => setPhase('slash'), 1200));
    timers.current.push(setTimeout(() => setPhase('flash'), 1200 + SLASH_COUNT * 45 + 100));
    timers.current.push(setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 1200 + SLASH_COUNT * 45 + 500));

    return () => timers.current.forEach(clearTimeout);
  }, [active]);

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'flash' ? 0 : 0.92 }}
        transition={{ duration: 0.15 }}
      />

      {/* White flash */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Title text */}
      <AnimatePresence>
        {phase === 'text' && (
          <motion.div
            key="title"
            className="absolute inset-0 flex flex-col items-center justify-center select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.p
              className="text-white/50 text-xs tracking-[0.6em] font-mono mb-3 uppercase"
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              ─ ability activated ─
            </motion.p>
            <motion.h1
              className="font-mono font-black uppercase text-white text-5xl sm:text-7xl leading-none"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{ textShadow: '0 0 40px #fff, 0 0 80px #fff6' }}
            >
              Judgement Cut
            </motion.h1>
            <motion.p
              className="font-mono font-black uppercase text-white/70 text-3xl sm:text-5xl mt-1"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 200 }}
              style={{ textShadow: '0 0 20px #fff8' }}
            >
              End
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slashes — appear sequentially, each one a sharp diagonal line */}
      {(phase === 'slash' || phase === 'flash') && (
        <div className="absolute inset-0">
          {slashData.map((slash) => (
            <motion.div
              key={slash.id}
              className="absolute left-0 origin-left"
              style={{
                top: `${slash.top}%`,
                width: `${slash.width}vw`,
                height: `${slash.thickness}px`,
                background: `rgba(255,255,255,${slash.brightness})`,
                boxShadow: `0 0 ${slash.thickness * 4}px ${slash.thickness * 2}px rgba(255,255,255,${slash.brightness * 0.6})`,
                transform: `rotate(${slash.angle}deg)`,
                transformOrigin: 'left center',
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
              transition={{
                delay: slash.delay,
                duration: 0.28,
                times: [0, 0.25, 0.7, 1],
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}