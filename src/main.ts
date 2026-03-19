import './style.css'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
 <div id="main">
  <div id="score"></div>
  <div id="game">
    <canvas id="canvas" width="400" height="400"></canvas>
  </div>
 </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
