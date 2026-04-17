const scoreHistoryStorageKey = 'the-bricks-score-history'

// Converts one stored line into a score object.
// Expected line format: score|timestamp|didFinish|mode
function parseStoredScoreLine(line) {
    const parts = line.split('|')
    const score = Number(parts[0])

    if (!Number.isFinite(score)) {
        return null
    }

    const timestamp = Number(parts[1])

    return {
        score,
        timestamp: Number.isFinite(timestamp) ? timestamp : null,
        didFinish: parts[2] === '1',
        mode: parts[3] || null,
    }
}

// Builds one line that can be saved in localStorage.
function encodeStoredScore(score, didFinish, mode) {
    let finishFlag = '0'

    if (didFinish) {
        finishFlag = '1'
    }

    return [score, Date.now(), finishFlag, mode].join('|')
}

// Makes the mode value friendly for display (e.g. "normal" -> "Normal").
function formatModeLabel(mode) {
    if (!mode) {
        return 'Unknown'
    }
    return mode.charAt(0).toUpperCase() + mode.slice(1)
}

// Converts a timestamp into a readable date/time string.
function formatRunTimestamp(timestamp) {
    if (!timestamp) {
        return 'Unknown date'
    }

    const date = new Date(timestamp)

    if (Number.isNaN(date.getTime())) {
        return 'Unknown date'
    }

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${hours}:${minutes} ${day}.${month}.${year}`
}

// Reads all score runs from localStorage and returns them as objects.
export function getStoredScores() {
    const rawScores = localStorage.getItem(scoreHistoryStorageKey)

    if (!rawScores) {
        return []
    }

    const lines = rawScores.split('\n')
    const scores = []

    // Parse each line. Invalid lines are ignored.
    for (let index = 0; index < lines.length; index += 1) {
        const parsedScore = parseStoredScoreLine(lines[index])

        if (parsedScore) {
            scores.push(parsedScore)
        }
    }

    return scores
}

// Saves the latest run at the top so newest scores appear first.
export function saveScore(score, didFinish, mode) {
    const encodedScore = encodeStoredScore(score, didFinish, mode)
    const previousScores = localStorage.getItem(scoreHistoryStorageKey)
    const nextScores = previousScores ? `${encodedScore}\n${previousScores}` : encodedScore
    // where it stores and what it stores
    localStorage.setItem(scoreHistoryStorageKey, nextScores)
}

// Creates the HTML shown in the score history popup.
export function renderScoreHistoryMarkup(currentScore) {
    const previousScores = getStoredScores()

    if (previousScores.length === 0) {
        return `
      <div class="score-history-panel text-left text-sm leading-6">
        <p class="mb-3">Current score: <strong>${currentScore}</strong></p>
        <p>You haven't played this game yet.</p>
      </div>
    `
    }

    // Build one list item per previous run.
    const scoreItems = previousScores
        .map((run, index) => `
      <li class="score-history-item">
        <div class="score-history-copy">
          <span>Run ${index + 1}</span>
          <div class="score-history-meta">
            <span class="score-history-date">${formatRunTimestamp(run.timestamp)}</span>
            <span class="score-history-status${run.didFinish ? ' is-finished' : ''}">${run.didFinish ? 'Finished' : 'Did not finish'}</span>
            <span class="score-history-mode">${formatModeLabel(run.mode)}</span>
          </div>
        </div>
        <strong>${run.score}</strong>
      </li>
    `)
        .join('')

    return `
    <div class="score-history-panel text-left text-sm leading-6">
      <p class="mb-3">Current score: <strong>${currentScore}</strong></p>
      <div class="score-history-list" role="region" aria-label="Previous scores">
        <ol>${scoreItems}</ol>
      </div>
    </div>
  `
}
