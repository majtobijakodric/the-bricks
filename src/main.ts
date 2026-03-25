import './style.css';
import { updateRefreshRateEstimate } from "./refreshRate.ts";

export let refreshRateEstimate = await updateRefreshRateEstimate();

setInterval(() => {
  void updateRefreshRateEstimate().then((refreshRate) => {
    refreshRateEstimate = refreshRate;

  });
}, 1000);

const gameCanvas = document.querySelector<HTMLCanvasElement>('#gameCanvas');
export const aboutButton = document.querySelector<HTMLButtonElement>('#aboutButton');
export const pauseButton = document.querySelector<HTMLButtonElement>('#pauseButton');
export const ballSpeedButton = document.querySelector<HTMLButtonElement>('#ballSpeedButton');
export const padSpeedButton = document.querySelector<HTMLButtonElement>('#padSpeedButton');

let viewHeight = window.innerHeight;
let viewWidth = window.innerWidth;

const ballColor = 'red';
const padColor = 'blue';
const backgroundColor = 'lightgray';
const cellColor = 'green';
const CELL_SIDE_MARGIN_RATIO = 0.2;
const CELL_TOP_MARGIN_RATIO = 0.1;

export let isPaused = false;

// Pad properties
export let pad = {
  x: viewWidth / 2 - 25,
  y: viewHeight - 50,
  width: 100,
  height: 20,
  speed: 4 // Pixels per frame
};

// Ball properties
export let ball = {
  x: viewWidth / 2,
  y: viewHeight / 2,
  radius: 10,
  speed: 5,
  dx: 0,
  dy: 0,
};

let input = {
  left: false,
  right: false,
};

let cell = {
  width: 50,
  height: 20,
  marginLeftRight: 10,
  marginTop: 10,
  padding: 5,
}

const rows = 15;
const columns = 20;
let arrayOfCells: { x: number; y: number; width: number; height: number }[] = [];

initializeBallVelocity();

if (gameCanvas) {
  gameCanvas.width = viewWidth;
  gameCanvas.height = viewHeight;
  gameCanvas.style.width = `${viewWidth}px`;
  gameCanvas.style.height = `${viewHeight}px`;
  gameCanvas.style.backgroundColor = backgroundColor;
  initializeArray();
  renderScene(gameCanvas);
  animateBall();
}

function initializeArray() {
  arrayOfCells = [];

  const startX = viewWidth * CELL_SIDE_MARGIN_RATIO;
  const startY = viewHeight * CELL_TOP_MARGIN_RATIO;
  const availableWidth = viewWidth * (1 - CELL_SIDE_MARGIN_RATIO * 2);
  const totalHorizontalSpacing = cell.marginLeftRight * (columns - 1);
  const cellWidth = (availableWidth - totalHorizontalSpacing) / columns;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      arrayOfCells.push({
        x: startX + (j * (cellWidth + cell.marginLeftRight)),
        y: startY + (i * (cell.height + cell.marginTop)),
        width: cellWidth,
        height: cell.height
      });
    }
  }
}

function renderCells(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = cellColor;
    arrayOfCells.forEach(cell => {
      ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
    });
  }
}

function renderScene(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
    console.log(refreshRateEstimate);

  if (ctx) {
    // Pad
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render cells
    renderCells(canvas);
    ctx.fillStyle = padColor;
    ctx.fillRect(pad.x, pad.y, pad.width, pad.height);

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
  }
}

function initializeBallVelocity() {
  const launchAngle = (Math.random() * Math.PI) / 2 + Math.PI / 4;
  const horizontalDirection = Math.random() < 0.5 ? -1 : 1;

  ball.dx = Math.cos(launchAngle) * ball.speed * horizontalDirection;
  ball.dy = -Math.sin(launchAngle) * ball.speed;
}

function animateBall() {
  if (!gameCanvas) return;

  if (isPaused) {
    renderScene(gameCanvas);
    requestAnimationFrame(animateBall);
    return;
  }

  if (input.left) {
    pad.x -= pad.speed;
  }

  if (input.right) {
    pad.x += pad.speed;
  }

  pad.x = Math.max(0, Math.min(viewWidth - pad.width, pad.x));


  ball.x += ball.dx;
  ball.y += ball.dy;

  // Check for collisions with left and right walls
  if (ball.x + ball.radius >= viewWidth || ball.x - ball.radius <= 0) {
    ball.dx *= -1;
    ball.x = Math.max(ball.radius, Math.min(viewWidth - ball.radius, ball.x));
  }

  // Check for collision with the pad
  const hitsPadHorizontally = ball.x + ball.radius >= pad.x && ball.x - ball.radius <= pad.width + pad.x;
  const hitsPadVertically = ball.y + ball.radius >= pad.y && ball.y - ball.radius <= pad.y + pad.height;

  // Only reverse the vertical direction if the ball is moving downwards and collides with the pad
  if (ball.dy > 0 && hitsPadHorizontally && hitsPadVertically) {
    ball.dy *= -1;
    ball.y = pad.y - ball.radius;
  }

  // Check for collision with the top wall
  if (ball.y - ball.radius <= 0) {
    ball.dy *= -1;
    ball.y = ball.radius;
  }

  // Check for collision with the bottom wall
  if (ball.y + ball.radius >= viewHeight) {
    ball.dy *= -1;
    ball.y = viewHeight - ball.radius;
  }

  renderScene(gameCanvas);
  requestAnimationFrame(animateBall);
}

function movePad(x: number) {
  if (!gameCanvas) {
    return;
  }

  pad.x = Math.max(0, Math.min(viewWidth - pad.width, x));
  renderScene(gameCanvas);
}

export function setPadSpeed(speed: number) {
  pad.speed = speed;
}

export function setBallSpeed(speed: number) {
  ball.speed = speed;
  const angle = Math.atan2(ball.dy, ball.dx);
  ball.dx = Math.cos(angle) * ball.speed;
  ball.dy = Math.sin(angle) * ball.speed;
}

addEventListener("keydown", (event) => {
  const step = pad.speed;
  switch (event.key) {
    case "ArrowLeft": {
      const targetX = Math.max(0, pad.x - step);
      movePad(targetX);
      break;
    }
    case "ArrowRight": {
      const targetX = Math.min(viewWidth - pad.width, pad.x + step);
      movePad(targetX);
      break;
    }
  }
});

addEventListener("resize", () => {

  // Update height and width variables
  viewHeight = window.innerHeight;
  viewWidth = window.innerWidth;

  // Set canvas to full screen
  if (gameCanvas) {
    gameCanvas.width = viewWidth;
    gameCanvas.height = viewHeight;
    gameCanvas.style.width = `${viewWidth}px`;
    gameCanvas.style.height = `${viewHeight}px`;
    initializeArray();
    ball.x = viewWidth / 2;
    ball.y = viewHeight / 2;
    pad.x = viewWidth / 2 - pad.width / 2;
    pad.y = viewHeight - pad.height - 10;
    initializeBallVelocity();
    renderScene(gameCanvas);
  }
});

addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") input.left = true;
  if (event.key === "ArrowRight") input.right = true;
});

addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") input.left = false;
  if (event.key === "ArrowRight") input.right = false;
});

export function pauseGame() {
  isPaused = true;
  input.left = false;
  input.right = false;
  if (pauseButton) {
    pauseButton.textContent = "Resume";
  }
}

export function resumeGame() {
  isPaused = false;
  if (pauseButton) {
    pauseButton.textContent = "Pause";
  }
}
