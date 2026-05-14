import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Generate beams that originate from random screen edges/corners and shoot across
function makeBeams(n) {
  const beams = [];
  for (let i = 0; i < n; i++) {
    // Pick a random edge origin: 0=top, 1=right, 2=bottom, 3=left, or corners
    const edge = Math.floor(Math.random() * 4);
    let originX, originY;
    switch (edge) {
      case 0: originX = Math.random() * 100; originY = 0; break;
      case 1: originX = 100; originY = Math.random() * 100; break;
      case 2: originX = Math.random() * 100; originY = 100; break;
      default: originX = 0; originY = Math.random() * 100; break;
    }

    // Angle pointing roughly toward center with some spread
    const cx = 50, cy = 50;
    const baseAngle = Math.atan2(cy - originY, cx - originX) * (180 / Math.PI);
    const angle = baseAngle + (Math.random() - 0.5) * 50;

    beams.push({
      id: i,
      originX,
      originY,
      angle,
      length: 150 + Math.random() * 50, // Increased to cover full screen diagonal on mobile
      thickness: 1 + Math.random() * 3,
      delay: i * 0.06 + Math.random() * 0.1,
      color: Math.random() > 0.3 ? '#ffffff' : '#c8d8ff',
      glow: Math.random() > 0.5 ? 20 : 10,
      duration: 0.5 + Math.random() * 0.4,
    });
  }
  return beams;
}

const BEAM_COUNT = 35;
// Generate fresh beams each render activation
let beamData = makeBeams(BEAM_COUNT);

function Beam({ b }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${b.originX}%`,
        top: `${b.originY}%`,
        width: `${b.length}vw`,
        height: `${b.thickness}px`,
        background: `linear-gradient(90deg, ${b.color} 0%, ${b.color}cc 60%, transparent 100%)`,
        boxShadow: `0 0 ${b.glow}px ${b.glow / 2}px ${b.color}88`,
        transformOrigin: 'left center',
        rotate: b.angle,
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 0.85, 0] }}
      transition={{
        delay: b.delay,
        duration: b.duration,
        times: [0, 0.15, 0.7, 1],
        ease: 'easeOut',
      }}
    />
  );
}

export default function JCEOverlay({ active, onComplete }) {
  const [phase, setPhase] = useState('idle');
  const timers = useRef([]);

  const CUTS_MS = BEAM_COUNT * 60 + 400;

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (!active) { setPhase('idle'); return; }

    // Regenerate beams each activation for variety
    beamData = makeBeams(BEAM_COUNT);

    setPhase('intro');
    timers.current.push(setTimeout(() => setPhase('cuts'),   800));
    timers.current.push(setTimeout(() => setPhase('impact'), 800 + CUTS_MS));
    timers.current.push(setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 800 + CUTS_MS + 500));

    return () => timers.current.forEach(clearTimeout);
  }, [active]);

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none select-none">

      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'impact' ? 0 : 0.92 }}
        transition={{ duration: 0.2 }}
      />

      {/* INTRO: Name card */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            key="namecard"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-blue-300/80 to-transparent"
              initial={{ width: 0 }} animate={{ width: '40vw' }}
              transition={{ duration: 0.35, delay: 0.05 }}
            />
            <motion.p
              className="font-arcade text-[8px] tracking-[0.6em] text-blue-300/70 uppercase"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              VERGIL
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 180, damping: 14 }}
              className="flex flex-col items-center gap-1"
            >
              <h1 className="font-arcade text-4xl sm:text-6xl text-white leading-none tracking-tight"
                style={{ textShadow: '0 0 40px #a0c0ff, 0 0 80px #6080ff60' }}>
                JUDGEMENT
              </h1>
              <h1 className="font-arcade text-4xl sm:text-6xl text-white leading-none tracking-tight"
                style={{ textShadow: '0 0 40px #a0c0ff, 0 0 80px #6080ff60' }}>
                CUT END
              </h1>
            </motion.div>
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-blue-300/80 to-transparent"
              initial={{ width: 0 }} animate={{ width: '40vw' }}
              transition={{ duration: 0.35, delay: 0.25 }}
            />
            <motion.p
              className="font-arcade text-[7px] tracking-[0.4em] text-white/30"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              ─ DARKSLAYER ─
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUTS: beams from edges */}
      {(phase === 'cuts' || phase === 'impact') && (
        <>
          {/* Subtle center convergence glow */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, #ffffff18 0%, transparent 70%)' }}
            initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: CUTS_MS / 1000, times: [0, 0.3, 1] }}
          />

          {beamData.map(b => <Beam key={b.id} b={b} />)}
        </>
      )}

      {/* IMPACT: white flash */}
      <AnimatePresence>
        {phase === 'impact' && (
          <motion.div
            key="flash"
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0.8, 1] }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}