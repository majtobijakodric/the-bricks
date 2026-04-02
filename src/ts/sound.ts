import brickHitSoundFile from '../assets/sound/discord-notification.mp3';

const brickHitSound = new Audio(brickHitSoundFile);
brickHitSound.preload = 'auto';

let isMuted = false;

export function setSoundMuted(value: boolean) {
  isMuted = value;
}

export function toggleSoundMuted() {
  isMuted = !isMuted;
  return isMuted;
}

export function playBrickHitSound() {
  if (isMuted) {
    return;
  }

  const soundInstance = new Audio(brickHitSoundFile);
  void soundInstance.play().catch(() => {
  });
}
