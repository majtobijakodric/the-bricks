const scoreText = document.querySelector<HTMLParagraphElement>('#scoreText');
export let score = 0;

export function updateScore(points: number) {
  score += points;
  if (scoreText) {
    scoreText.textContent = `Score: ${score}`;
  }
}
