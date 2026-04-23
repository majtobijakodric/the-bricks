import Swal from 'sweetalert2'

const sweetTheme = {
  background: '#111827',
  color: '#ffffff',
  confirmButtonColor: '#334155',
}

const aboutHtml = `
  <p>Author: Maj Tobija Kodrič</p>
  <a href="https://github.com/majtobijakodric/the-bricks" target="_blank" class="text-blue-500 hover:underline">GitHub</a>
`

const howToPlayHtml = `
  <div class="space-y-3 text-left text-sm leading-6">
    <p>Move the pad to keep the rocket in play and clear the asteroid field.</p>
    <p><strong>Controls:</strong> use the left and right arrow keys to move.</p>
    <p>Collect red and blue rock charges, then use the ability buttons on the left when they light up.</p>
    <p>Watch the fuel tank. If fuel hits zero or the rocket slips past the pad, the run ends.</p>
  </div>
`

function fireSweet(options) {
  return Swal.fire({ ...sweetTheme, ...options })
}

export function showScoreSweet(scoreMarkup) {
  return fireSweet({
    title: 'Current Score',
    html: scoreMarkup,
    confirmButtonText: 'Close',
  })
}

export function showAboutSweet() {
  return fireSweet({
    title: 'About',
    html: aboutHtml,
    confirmButtonText: 'Close',
  })
}

export function showHowToPlaySweet() {
  return fireSweet({
    title: 'How to Play',
    html: howToPlayHtml,
    confirmButtonText: 'Close',
  })
}

export function showRocketSpeedSweet(value) {
  return fireSweet({
    title: 'Set Rocket Speed',
    input: 'range',
    inputAttributes: {
      min: '1',
      max: '100',
      step: '1',
    },
    inputValue: value,
    showCancelButton: true,
  })
}

export function showPadSpeedSweet(value) {
  return fireSweet({
    title: 'Set Pad Speed',
    input: 'range',
    inputAttributes: {
      min: '1',
      max: '40',
      step: '1',
    },
    inputValue: value,
    showCancelButton: true,
  })
}

export function showPlayerNameSweet({ title, inputValue = '', allowCancel = false }) {
  return fireSweet({
    title,
    input: 'text',
    inputValue,
    inputLabel: 'Change player name',
    inputPlaceholder: 'Type your name',
    confirmButtonText: 'Save',
    showCancelButton: allowCancel,
    allowOutsideClick: false,
    allowEscapeKey: false,
    inputValidator: (value) => {
      if (!String(value).trim()) {
        return 'Please type your name'
      }

      return undefined
    },
  })
}

export function showGameOverSweet() {
  return fireSweet({
    title: 'You are out of fuel.',
    text: 'Play again to restart.',
    confirmButtonText: 'Play again',
    showCloseButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  })
}

export function showWinSweet() {
  return fireSweet({
    title: 'All asteroids cleared!',
    confirmButtonText: 'Play again',
    showCloseButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  })
}

export function showModeSweet(currentMode) {
  const modes = ['easy', 'medium', 'hard', 'experimental']
  let optionButtons = ''

  for (let index = 0; index < modes.length; index += 1) {
    const mode = modes[index]
    const label = mode.charAt(0).toUpperCase() + mode.slice(1)
    const isSelected = currentMode === mode
    const experimentalClass = mode === 'experimental' ? ' is-experimental' : ''

    optionButtons += `
      <button
        type="button"
        class="swal2-styled mode-option${isSelected ? ' is-selected' : ''}${experimentalClass}"
        data-mode="${mode}"
      >
        ${label}
      </button>
    `
  }

  return new Promise((resolve) => {
    let settled = false

    const settle = (value) => {
      if (settled) {
        return
      }

      settled = true
      resolve(value)
    }

    void fireSweet({
      title: 'Select Mode',
      html: `<div class="mode-option-list">${optionButtons}</div>`,
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: (popup) => {
        const buttons = popup.querySelectorAll('[data-mode]')

        buttons.forEach((button) => {
          button.addEventListener('click', () => {
            const mode = button.dataset.mode

            if (!mode) {
              return
            }

            settle(mode)
            Swal.close()
          })
        })
      },
      willClose: () => {
        settle(null)
      },
    })
  })
}
