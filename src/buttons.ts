import Swal from "sweetalert2";
                
import { pauseGame, resumeGame, aboutButton, pauseButton, isPaused, ballSpeedButton, padSpeedButton, ball, pad, setBallSpeed, setPadSpeed } from "./main";

if (aboutButton) {
    aboutButton.addEventListener("click", async () => {
        const wasPaused = isPaused;
        pauseGame();

        await Swal.fire({
            title: "About",
            html: `
      <p>Author: Maj Tobija Kodrič</p>
      <a href="https://github.com/majtobijakodric/bricks" target="_blank" class="text-blue-500 hover:underline">GitHub</a>
    `,
            icon: "info",
            confirmButtonText: "Close"
        });

        if (!wasPaused) {
            resumeGame();
        }
    });
}

if (pauseButton) {
    pauseButton.addEventListener("click", () => {
        if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    });
}

if (ballSpeedButton) {
    ballSpeedButton.addEventListener("click", () => {
        Swal.fire({
            title: "Set Ball Speed",
            input: "range",
            inputLabel: "Ball Speed",
            inputAttributes: {
                min: "1",
                max: "20",
                step: "1"
            },
            inputValue: ball.speed,
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                setBallSpeed(parseInt(result.value));
            }
        });
    });
}

if (padSpeedButton) {
    padSpeedButton.addEventListener("click", () => {
        Swal.fire({
            title: "Set Pad Speed",
            input: "range",
            inputLabel: "Pad Speed",
            inputAttributes: {
                min: "1",
                max: "20",
                step: "1"
            },
            inputValue: pad.speed,
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                setPadSpeed(parseInt(result.value));
            }
        });
    });
}
