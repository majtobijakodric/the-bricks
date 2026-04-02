import * as Tone from 'tone';

let isMuted = false;
let isAudioReady = false;

const brickHitSound = new Tone.MetalSynth({
  envelope: {
    attack: 0.001,
    decay: 0.08,
    release: 0.02,
  },
  harmonicity: 4.1,
  modulationIndex: 22,
  resonance: 700,
  octaves: 1.2,
  volume: -34,
}).toDestination();

const heartLoseSound = new Tone.Synth({
  oscillator: {
    type: 'triangle',
  },
  envelope: {
    attack: 0.01,
    decay: 0.16,
    sustain: 0,
    release: 0.05,
  },
  volume: -12,
}).toDestination();

const buttonClickSound = new Tone.NoiseSynth({
  noise: {
    type: 'white',
  },
  envelope: {
    attack: 0.001,
    decay: 0.02,
    sustain: 0,
    release: 0.01,
  },
  volume: -28,
}).toDestination();

export async function prepareAudio() {
  if (isAudioReady) {
    return;
  }

  try {
    await Tone.start();
    isAudioReady = true;
  } catch {
    isAudioReady = false;
  }
}

export function setSoundMuted(value: boolean) {
  isMuted = value;
}

export function toggleSoundMuted() {
  isMuted = !isMuted;
  return isMuted;
}

export function playBrickHitSound() {
  if (isMuted || !isAudioReady) {
    return;
  }

  brickHitSound.triggerAttackRelease('C3', '32n');
}

export function playHeartLoseSound() {
  if (isMuted || !isAudioReady) {
    return;
  }

  heartLoseSound.triggerAttackRelease('G2', '8n');
}

export function playButtonClickSound() {
  if (isMuted || !isAudioReady) {
    return;
  }

  buttonClickSound.triggerAttackRelease('16n');
}
