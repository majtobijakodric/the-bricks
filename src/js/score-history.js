import { createElement, User } from 'lucide'
import { showPlayerNameSweet } from './sweet.js'
import { playerNameButton } from './canvas.js'
const scoreHistoryStorageKey = 'the-bricks-score-history'

function sanitizePlayerName(name) {
  return name.trim()
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

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
    playerName: sanitizePlayerName(parts[4]) || 'Unknown player',
  }
}

function normalizeStoredRun(run) {
  if (!run || typeof run !== 'object') {
    return null
  }

  const score = Number(run.score)

  if (!Number.isFinite(score)) {
    return null
  }

  const timestamp = Number(run.timestamp)

  return {
    score,
    timestamp: Number.isFinite(timestamp) ? timestamp : null,
    didFinish: run.didFinish === true || run.didFinish === '1',
    mode: run.mode || null,
    playerName: sanitizePlayerName(run.playerName) || 'Unknown player',
  }
}

function getStorageState() {
  const rawStorage = localStorage.getItem(scoreHistoryStorageKey)

  if (!rawStorage) {
    return {
      playerName: '',
      runs: [],
    }
  }

  try {
    const parsedStorage = JSON.parse(rawStorage)

    if (parsedStorage && typeof parsedStorage === 'object') {
      const parsedRuns = []

      if (Array.isArray(parsedStorage.runs)) {
        for (let index = 0; index < parsedStorage.runs.length; index += 1) {
          const normalizedRun = normalizeStoredRun(parsedStorage.runs[index])

          if (normalizedRun) {
            parsedRuns.push(normalizedRun)
          }
        }
      }

      return {
        playerName: sanitizePlayerName(parsedStorage.playerName),
        runs: parsedRuns,
      }
    }
  } catch {
    // Fallback for the old text storage format.
  }

  const legacyRuns = []
  const legacyLines = rawStorage.split('\n')

  for (let index = 0; index < legacyLines.length; index += 1) {
    const parsedRun = parseStoredScoreLine(legacyLines[index])

    if (parsedRun) {
      legacyRuns.push(parsedRun)
    }
  }

  return {
    playerName: '',
    runs: legacyRuns,
  }
}

function setStorageState(state) {
  const safeRuns = []

  if (Array.isArray(state.runs)) {
    for (let index = 0; index < state.runs.length; index += 1) {
      const normalizedRun = normalizeStoredRun(state.runs[index])

      if (normalizedRun) {
        safeRuns.push(normalizedRun)
      }
    }
  }

  const safeState = {
    playerName: sanitizePlayerName(state.playerName),
    runs: safeRuns,
  }

  localStorage.setItem(scoreHistoryStorageKey, JSON.stringify(safeState))
}

function promptForPlayerName({ title, inputValue = '', allowCancel = false, }) {
  return showPlayerNameSweet({ title, inputValue, allowCancel, })
}

function buildStoredScoreRun(score, didFinish, mode) {
  return {
    score,
    timestamp: Date.now(),
    didFinish: Boolean(didFinish),
    mode,
    playerName: getCurrentPlayerName() || 'Unknown player',
  }
}

export function getCurrentPlayerName() {
  return getStorageState().playerName
}

export function setCurrentPlayerName(name) {
  const sanitizedName = sanitizePlayerName(name)

  if (!sanitizedName) {
    return ''
  }

  const state = getStorageState()
  state.playerName = sanitizedName
  setStorageState(state)

  return sanitizedName
}

export async function ensurePlayerNameBeforeFirstPlay() {
  const existingName = getCurrentPlayerName()

  if (existingName) {
    return existingName
  }

  const result = await promptForPlayerName({
    title: 'Welcome! Enter your name',
    allowCancel: false,
  })

  return setCurrentPlayerName(result.value)
}

export async function promptToRenameCurrentPlayer() {
  const result = await promptForPlayerName({
    inputValue: getCurrentPlayerName(),
    allowCancel: true,
  })

  if (!result.isConfirmed) {
    return getCurrentPlayerName()
  }

  return setCurrentPlayerName(result.value)
}

export function ensureRenamePlayerButton(onRenamed) {
  const button = playerNameButton

  if (!button) {
    return null
  }

  button.title = 'Change player name'
  button.setAttribute('aria-label', 'Change player name')
  button.replaceChildren(createElement(User, { width: 18, height: 18 }))

  button.onclick = async () => {
    if (typeof onRenamed === 'function') {
      await onRenamed()
      return
    }

    await promptToRenameCurrentPlayer()
  }

  return button
}

function formatModeLabel(mode) {
  if (!mode) {
    return 'Unknown'
  }

  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

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

export function getStoredScores() {
  return getStorageState().runs
}

export function saveScore(score, didFinish, mode) {
  const state = getStorageState()
  const nextRun = buildStoredScoreRun(score, didFinish, mode)

  state.runs = [nextRun, ...state.runs]
  setStorageState(state)
}

// It's for custom html in sweet alert
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

  let scoreItems = ''

  for (let index = 0; index < previousScores.length; index += 1) {
    const run = previousScores[index]

    scoreItems += `
      <li class="score-history-item">
        <div class="score-history-copy">
          <span>Run ${index + 1}</span>
          <div class="score-history-meta">
            <span class="score-history-player">Player: ${escapeHtml(run.playerName)}</span>
            <span class="score-history-date">${formatRunTimestamp(run.timestamp)}</span>
            <span class="score-history-status${run.didFinish ? ' is-finished' : ''}">${run.didFinish ? 'Finished' : 'Did not finish'}</span>
            <span class="score-history-mode">${formatModeLabel(run.mode)}</span>
          </div>
        </div>
        <strong>${run.score}</strong>
      </li>
    `
  }

  return `
    <div class="score-history-panel text-left text-sm leading-6">
      <p class="mb-3">Current score: <strong>${currentScore}</strong></p>
      <div class="score-history-list" role="region" aria-label="Previous scores">
        <ol>${scoreItems}</ol>
      </div>
    </div>
  `
}
