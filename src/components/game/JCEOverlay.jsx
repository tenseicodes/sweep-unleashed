import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DMC5-inspired Judgement Cut End overlay.
 *
 * Phase timeline:
 *   0ms   → 'intro'  : Black screen fades in, then Vergil-style name card appears
 *   900ms → 'cuts'   : Rapid blue/white cross-hatch slashes emanate from center,
 *                       each one a bright streak that appears and vanishes instantly
 *   2400ms→ 'impact' : Screen shatters white, then dark crackle lines visible
 *   2900ms→ 'done'   : Fade out, callback fired
 */

// Generate a fixed set of slash descriptors
function makeSlashes(n) {
  const slashes = [];
  for (let i = 0; i < n; i++) {
    // Alternate between two angle families, like DMC cross-hatch
    const family = i % 2 === 0 ? 1 : -1;
    const baseAngle = family * (38 + Math.random() * 22); // ~±38-60deg
    slashes.push({
      id: i,
      angle: baseAngle,
      // Length: full-screen diagonal ish
      length: 110 + Math.random() * 60, // vw
      thickness: 1.5 + Math.random() * 3.5,
      // Starting position: near center, spread outward
      originX: 40 + Math.random() * 20, // % from left
      originY: 35 + Math.random() * 30, // % from top
      delay: i * 0.055,
      color: Math.random() > 0.35 ? '#c8d8ff' : '#ffffff',
      glow: Math.random() > 0.5 ? 16 : 8,
    });
  }
  return slashes;
}

// Crack lines that appear after the impact flash
function makeCracks(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x1: 40 + (Math.random() - 0.5) * 30,
    y1: 40 + (Math.random() - 0.5) * 30,
    dx: (Math.random() - 0.5) * 80,
    dy: (Math.random() - 0.5) * 80,
    angle: Math.random() * 360,
    len: 15 + Math.random() * 40,
  }));
}

const SLASH_COUNT = 28;
const slashData = makeSlashes(SLASH_COUNT);
const crackData = makeCracks(16);

// ── Slash beam component ──
function SlashBeam({ s, startDelay }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${s.originX}%`,
        top: `${s.originY}%`,
        width: `${s.length}vw`,
        height: `${s.thickness}px`,
        background: `linear-gradient(90deg, transparent 0%, ${s.color} 30%, ${s.color} 70%, transparent 100%)`,
        boxShadow: `0 0 ${s.glow}px ${s.glow / 2}px ${s.color}`,
        transformOrigin: 'left center',
        transform: `rotate(${s.angle}deg)`,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{
        scaleX: [0, 1, 1, 0],
        opacity: [0, 1, 0.9, 0],
      }}
      transition={{
        delay: startDelay + s.delay,
        duration: 0.22,
        times: [0, 0.2, 0.6, 1],
        ease: 'easeOut',
      }}
    />
  );
}

export default function JCEOverlay({ active, onComplete }) {
  const [phase, setPhase] = useState('idle');
  const timers = useRef([]);

  const CUTS_DURATION = SLASH_COUNT * 55 + 200; // ms

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (!active) { setPhase('idle'); return; }

    setPhase('intro');
    timers.current.push(setTimeout(() => setPhase('cuts'),   900));
    timers.current.push(setTimeout(() => setPhase('impact'), 900 + CUTS_DURATION));
    timers.current.push(setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 900 + CUTS_DURATION + 600));

    return () => timers.current.forEach(clearTimeout);
  }, [active]);

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none select-none">

      {/* === BASE DARK OVERLAY === */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'impact' ? 0 : 0.96 }}
        transition={{ duration: 0.18 }}
      />

      {/* === INTRO: Name card === */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            key="namecard"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Top decorative line */}
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-blue-300/80 to-transparent"
              initial={{ width: 0 }} animate={{ width: '40vw' }}
              transition={{ duration: 0.4, delay: 0.1 }}
            />

            {/* Character name label */}
            <motion.p
              className="font-arcade text-[8px] tracking-[0.6em] text-blue-300/70 uppercase"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              VERGIL
            </motion.p>

            {/* Ability name */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.22, type: 'spring', stiffness: 180, damping: 14 }}
              className="flex flex-col items-center gap-1"
            >
              <h1
                className="font-arcade text-4xl sm:text-6xl text-white leading-none tracking-tight"
                style={{ textShadow: '0 0 40px #a0c0ff, 0 0 80px #6080ff60' }}
              >
                JUDGEMENT
              </h1>
              <h1
                className="font-arcade text-4xl sm:text-6xl text-white leading-none tracking-tight"
                style={{ textShadow: '0 0 40px #a0c0ff, 0 0 80px #6080ff60' }}
              >
                CUT END
              </h1>
            </motion.div>

            {/* Bottom decorative line */}
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-blue-300/80 to-transparent"
              initial={{ width: 0 }} animate={{ width: '40vw' }}
              transition={{ duration: 0.4, delay: 0.3 }}
            />

            {/* Subtitle */}
            <motion.p
              className="font-arcade text-[7px] tracking-[0.4em] text-white/30"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              ─ DARKSLAYER ─
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === CUTS: rapid cross-hatch slashes === */}
      {(phase === 'cuts' || phase === 'impact') && (
        <>
          {/* Blue screen-tint during cuts */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, #1a2a6630 0%, transparent 70%)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}
          />

          {slashData.map(s => (
            <SlashBeam key={s.id} s={s} startDelay={0} />
          ))}

          {/* Center burst ring — like DMC's radial shockwave */}
          <motion.div
            className="absolute rounded-full border border-blue-200/60"
            style={{ left: '50%', top: '50%', translateX: '-50%', translateY: '-50%' }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: '200vw', height: '200vw', opacity: 0 }}
            transition={{ duration: (SLASH_COUNT * 55 + 200) / 1000, ease: 'easeOut' }}
          />
        </>
      )}

      {/* === IMPACT: white flash + crack lines === */}
      <AnimatePresence>
        {phase === 'impact' && (
          <>
            {/* Shattering white flash */}
            <motion.div
              key="flash"
              className="absolute inset-0 bg-white"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0, 0.8, 1] }}
            />

            {/* Crack lines radiating from center */}
            <div className="absolute inset-0">
              {crackData.map(c => (
                <motion.div
                  key={c.id}
                  className="absolute bg-blue-200/70"
                  style={{
                    left: `${c.x1}%`,
                    top: `${c.y1}%`,
                    width: `${c.len}vw`,
                    height: '1px',
                    transformOrigin: 'left center',
                    transform: `rotate(${c.angle}deg)`,
                    boxShadow: '0 0 4px 1px #a0c0ff80',
                  }}
                  initial={{ scaleX: 0, opacity: 1 }}
                  animate={{ scaleX: 1, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: Math.random() * 0.1 }}
                />
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}