// Tabletop sounds, synthesised with Web Audio (no files). Off by default; the choice is remembered on this device.
let ctx: AudioContext | null = null, rainNode: AudioBufferSourceNode | null = null, lastClack = 0;
const KEY = 'gt-sound';
let enabled = (() => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } })();

const audio = () => { ctx ??= new AudioContext(); if (ctx.state === 'suspended') void ctx.resume(); return ctx; };
function noise(a: AudioContext, seconds: number) {
  const buffer = a.createBuffer(1, Math.ceil(a.sampleRate * seconds), a.sampleRate), data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}
function burst(freq: number, q: number, seconds: number, volume: number, sweepTo?: number) {
  const a = audio(), src = a.createBufferSource(), filter = a.createBiquadFilter(), gain = a.createGain(), t = a.currentTime;
  src.buffer = noise(a, seconds); filter.type = 'bandpass'; filter.Q.value = q; filter.frequency.setValueAtTime(freq, t);
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t + seconds);
  gain.gain.setValueAtTime(volume, t); gain.gain.exponentialRampToValueAtTime(.0001, t + seconds);
  src.connect(filter).connect(gain).connect(a.destination); src.start(t); src.stop(t + seconds);
}
function tone(freq: number, at: number, seconds: number, volume: number) {
  const a = audio(), osc = a.createOscillator(), gain = a.createGain(), t = a.currentTime + at;
  osc.type = 'sine'; osc.frequency.value = freq;
  gain.gain.setValueAtTime(.0001, t); gain.gain.exponentialRampToValueAtTime(volume, t + .01); gain.gain.exponentialRampToValueAtTime(.0001, t + seconds);
  osc.connect(gain).connect(a.destination); osc.start(t); osc.stop(t + seconds);
}

export const sound = {
  get on() { return enabled; },
  set(on: boolean) {
    enabled = on;
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* storage blocked: the choice lasts this visit */ }
    if (on) { audio(); tone(660, 0, .18, .08); } else sound.rain(false);
  },
  /** A wooden piece set down; throttled so drag-painting doesn't buzz. */
  clack() { const now = performance.now(); if (!enabled || now - lastClack < 70) return; lastClack = now; burst(1900, 6, .05, .5); },
  tick() { if (enabled) tone(880, 0, .05, .05); },
  flip() { if (enabled) burst(700, 1.2, .2, .25, 2600); },
  /** Two rising notes for a notable moment on the score track. */
  chime() { if (enabled) { tone(660, 0, .5, .07); tone(990, .09, .6, .06); } },
  rain(on: boolean) {
    if (on && enabled && !rainNode) {
      const a = audio(), filter = a.createBiquadFilter(), gain = a.createGain();
      rainNode = a.createBufferSource(); rainNode.buffer = noise(a, 2); rainNode.loop = true;
      filter.type = 'lowpass'; filter.frequency.value = 1200; gain.gain.value = .035;
      rainNode.connect(filter).connect(gain).connect(a.destination); rainNode.start();
    } else if (!on && rainNode) { rainNode.stop(); rainNode = null; }
  },
};
