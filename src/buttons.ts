import Swal from "sweetalert2";
import { pauseGame, resumeGame, aboutButton, pauseButton, isPaused } from "./main";

if (aboutButton) {
    aboutButton.addEventListener("click", async () => {
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

        resumeGame();
    });
}

if (pauseButton) {
    pauseButton.addEventListener("click", () => {
        if (isPaused) {
            resumeGame();
            pauseButton!.textContent = "Pause";
        } else {
            pauseGame();
            pauseButton!.textContent = "Resume";
        }
    });
}