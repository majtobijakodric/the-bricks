import './style.css';

const gameCanvas = document.querySelector<HTMLCanvasElement>('#gameCanvas');

let viewHeight = window.innerHeight;
let viewWidth = window.innerWidth;

const ballColor = 'red';
const padColor = 'blue';
const backgroundColor = 'yellow';

// Pad properties
let pad = {
  x: viewWidth / 2 - 25,
  y: viewHeight - 50,
  width: 50,
  height: 20,
  speed: 4 // Pixels per frame
};

// Ball properties
let ball = {
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

initializeBallVelocity();

if (gameCanvas) {
  gameCanvas.width = viewWidth;
  gameCanvas.height = viewHeight;
  gameCanvas.style.width = `${viewWidth}px`;
  gameCanvas.style.height = `${viewHeight}px`;
  gameCanvas.style.backgroundColor = backgroundColor;
  renderScene(gameCanvas);
  animateBall();
}

function renderScene(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Pad
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  if (!gameCanvas) {
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