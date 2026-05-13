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
      setTimeout(() => playNoise({ freq: f, duration: 0.25, gain: 0.4, q: 0.5 }), i * 100);
    });
    setTimeout(() => playTone({ freq: 150, freqEnd: 80, type: 'sawtooth', duration: 0.5, gain: 0.3, decay: 0.45 }), 0);
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
    // Big dramatic build-up
    playNoise({ freq: 100, duration: 1.8, gain: 0.6, q: 0.2 });
    [200, 400, 800, 1600, 3200].forEach((f, i) => {
      setTimeout(() => playTone({ freq: f, freqEnd: f * 0.5, type: 'sawtooth', duration: 0.4, gain: 0.3, decay: 0.35 }), i * 80);
    });
  },
  coinEarn() {
    playTone({ freq: 1400, freqEnd: 1800, type: 'sine', duration: 0.1, gain: 0.15, decay: 0.08 });
  },
  abilityEquip() {
    playTone({ freq: 700, freqEnd: 900, type: 'triangle', duration: 0.12, gain: 0.18, decay: 0.1 });
  },
};