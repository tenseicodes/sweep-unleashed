// SVG icon components for abilities — styled to match the game's dark arcade aesthetic

export function ScanIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Radar / sonar dish */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      {/* Sweep arm */}
      <line x1="12" y1="12" x2="19.5" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Tick marks */}
      <line x1="12" y1="3" x2="12" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="21" y1="12" x2="19.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="21" x2="12" y2="19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="12" x2="4.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer shield */}
      <path d="M12 2L4 5.5V11C4 15.5 7.5 19.5 12 21C16.5 19.5 20 15.5 20 11V5.5L12 2Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
      {/* Inner cross / rune */}
      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DetonateIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bomb body */}
      <circle cx="11" cy="14" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
      {/* Fuse */}
      <path d="M15 8.5 Q17 5 15.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Spark */}
      <circle cx="15" cy="3" r="1.2" fill="currentColor" />
      {/* Blast rays */}
      <line x1="3" y1="14" x2="5" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="17" y1="14" x2="19" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="11" y1="20" x2="11" y2="22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="5.5" y1="19.5" x2="7" y2="18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="16.5" y1="19.5" x2="15" y2="18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function RevealZoneIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central eye */}
      <ellipse cx="12" cy="12" rx="8" ry="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      {/* Corner expand arrows */}
      <polyline points="2,4 2,2 4,2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="20,4 20,2 18,2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2,20 2,22 4,22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="20,20 20,22 18,22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Yamato — white blade, black sheath, gold tsuba, diagonal orientation
export function JaneBeamIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Central glow dot */}
      <circle cx="12" cy="12" r="2" fill="#22d3ee" opacity="0.9" />
      {/* Beam lines radiating out */}
      <line x1="12" y1="12" x2="22" y2="12" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <line x1="12" y1="12" x2="2"  y2="12" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <line x1="12" y1="12" x2="19.07" y2="4.93"  stroke="#67e8f9" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <line x1="12" y1="12" x2="4.93"  y2="19.07" stroke="#67e8f9" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <line x1="12" y1="12" x2="4.93"  y2="4.93"  stroke="#67e8f9" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <line x1="12" y1="12" x2="19.07" y2="19.07" stroke="#67e8f9" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <line x1="12" y1="12" x2="12" y2="2"  stroke="#a5f3fc" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="12" y1="12" x2="12" y2="22" stroke="#a5f3fc" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      {/* Outer halo ring */}
      <circle cx="12" cy="12" r="8" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.5" />
    </svg>
  );
}

export function YamatoIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sheath (black, thick) — diagonal bottom-left to center */}
      <line x1="3" y1="21" x2="13" y2="11" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
      <line x1="3" y1="21" x2="13" y2="11" stroke="#3a3a3a" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tsuba / guard (gold circle at center) */}
      <circle cx="13" cy="11" r="2" fill="#b8860b" />
      <circle cx="13" cy="11" r="1.2" fill="#ffd700" />
      {/* Blade (white/silver) — diagonal from tsuba to top-right tip */}
      <line x1="13" y1="11" x2="21.5" y2="2.5" stroke="#c0c8d8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="13" y1="11" x2="21.5" y2="2.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
      {/* Blade edge gleam */}
      <line x1="14.5" y1="9.5" x2="20.5" y2="3.5" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  );
}