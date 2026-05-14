// Web Audio API sound effects engine
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function playTone({ freq = 440, type = 'sine', duration = 0.15, gain = 0.3, attack = 0.01, decay = 0.1, freqEnd = null }) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const vol = ac.createGain();
    osc.connect(vol);
    vol.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, ac.currentTime + duration);
    vol.gain.setValueAtTime(0, ac.currentTime);
    vol.gain.linearRampToValueAtTime(gain, ac.currentTime + attack);
    vol.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + attack + decay);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (e) {}
}

function playNoise({ duration = 0.1, gain = 0.2, freq = 800, q = 1 }) {
  try {
    const ac = getCtx();
    const bufferSize = ac.sampleRate * duration;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    const vol = ac.createGain();
    vol.gain.setValueAtTime(gain, ac.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    source.connect(filter);
    filter.connect(vol);
    vol.connect(ac.destination);
    source.start();
    source.stop(ac.currentTime + duration);
  } catch (e) {}
}

export const SFX = {
  reveal() {
    playTone({ freq: 600, freqEnd: 900, type: 'sine', duration: 0.08, gain: 0.18, decay: 0.07 });
  },
  revealChunk() {
    playTone({ freq: 400, freqEnd: 700, type: 'sine', duration: 0.15, gain: 0.25, decay: 0.12 });
    setTimeout(() => playTone({ freq: 700, freqEnd: 1000, type: 'sine', duration: 0.1, gain: 0.15, decay: 0.08 }), 60);
  },
  flag() {
    playTone({ freq: 800, type: 'square', duration: 0.06, gain: 0.12, decay: 0.05 });
  },
  win() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      setTimeout(() => playTone({ freq: f, type: 'sine', duration: 0.3, gain: 0.35, decay: 0.25 }), i * 120);
    });
  },
  lose() {
    const notes = [400, 300, 200, 150];
    notes.forEach((f, i) => {
      setTimeout(() => playNoise({ freq: f, duration: 0.25, gain: 0.15, q: 0.5 }), i * 100);
    });
    setTimeout(() => playTone({ freq: 150, freqEnd: 80, type: 'sawtooth', duration: 0.5, gain: 0.1, decay: 0.45 }), 0);
  },
  scan() {
    playTone({ freq: 1200, freqEnd: 800, type: 'sine', duration: 0.2, gain: 0.2, decay: 0.18 });
    setTimeout(() => playTone({ freq: 1600, freqEnd: 1200, type: 'sine', duration: 0.15, gain: 0.15, decay: 0.12 }), 100);
  },
  shield() {
    playTone({ freq: 500, freqEnd: 900, type: 'triangle', duration: 0.3, gain: 0.25, decay: 0.25 });
  },
  shieldBlock() {
    playNoise({ freq: 1000, duration: 0.08, gain: 0.3, q: 2 });
    setTimeout(() => playTone({ freq: 900, freqEnd: 1200, type: 'triangle', duration: 0.2, gain: 0.3, decay: 0.18 }), 40);
  },
  detonate() {
    playNoise({ freq: 200, duration: 0.4, gain: 0.5, q: 0.3 });
    setTimeout(() => playNoise({ freq: 400, duration: 0.3, gain: 0.35, q: 0.5 }), 80);
  },
  revealZone() {
    [600, 800, 1000, 1200].forEach((f, i) => {
      setTimeout(() => playTone({ freq: f, type: 'sine', duration: 0.12, gain: 0.2, decay: 0.1 }), i * 40);
    });
  },
  jce() {
    // Intro delay matches the 800ms name-card phase in JCEOverlay
    const INTRO = 800;
    // Katana slash series — each slash timed to match beam delays (beam i has delay = i*0.06s)
    const slashTimes = [0, 60, 120, 200, 300, 420, 560, 700, 860, 1040, 1250];
    slashTimes.forEach((t) => {
      setTimeout(() => {
        playTone({ freq: 3200, freqEnd: 800, type: 'sawtooth', duration: 0.18, gain: 0.18, attack: 0.002, decay: 0.16 });
        playNoise({ freq: 3000, duration: 0.12, gain: 0.14, q: 3 });
      }, INTRO + t);
    });
    // Final heavy impact after all slashes
    setTimeout(() => {
      playNoise({ freq: 200, duration: 0.35, gain: 0.28, q: 0.4 });
      playTone({ freq: 220, freqEnd: 80, type: 'sawtooth', duration: 0.4, gain: 0.22, attack: 0.01, decay: 0.38 });
    }, INTRO + 1400);
  },
  jj() {
    // Beam charge-up then horizontal sweep
    // Charge hum build
    playTone({ freq: 220, freqEnd: 880, type: 'sine', duration: 0.9, gain: 0.2, attack: 0.08, decay: 0.82 });
    setTimeout(() => playTone({ freq: 440, freqEnd: 1760, type: 'triangle', duration: 0.7, gain: 0.18, attack: 0.04, decay: 0.65 }), 200);
    // Beam fire — high-pitched energy sweep
    setTimeout(() => {
      playTone({ freq: 1800, freqEnd: 3200, type: 'sine', duration: 0.45, gain: 0.25, attack: 0.02, decay: 0.42 });
      playNoise({ freq: 4000, duration: 0.5, gain: 0.2, q: 1.5 });
    }, 1100);
    // Resonant tail
    setTimeout(() => playTone({ freq: 600, freqEnd: 200, type: 'sine', duration: 0.5, gain: 0.14, attack: 0.01, decay: 0.48 }), 1400);
  },
  coinEarn() {
    playTone({ freq: 1400, freqEnd: 1800, type: 'sine', duration: 0.1, gain: 0.15, decay: 0.08 });
  },
  abilityEquip() {
    playTone({ freq: 700, freqEnd: 900, type: 'triangle', duration: 0.12, gain: 0.18, decay: 0.1 });
  },
};