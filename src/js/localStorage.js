// Get the stored player name.
// Returns the trimmed name string, or an empty string if not set.
export function playerName() {
  const name = localStorage.getItem('playerName')
  if (name === null) return ''
  return name.trim()
}

// Save the player's name to localStorage after trimming whitespace.
export function setPlayerName(name) {
  localStorage.setItem('playerName', name.trim())
}

// Record a new score entry in localStorage.
// Increments the run counter and saves player, score, mode, timestamp, and win flag.
export function saveScore(score, mode, won) {
  let count = Number(localStorage.getItem('scoreCount'))
  if (Number.isNaN(count)) count = 0
  count += 1
  localStorage.setItem('scoreCount', count)
  localStorage.setItem('score' + count + 'Player', playerName())
  localStorage.setItem('score' + count + 'Score', score)
  localStorage.setItem('score' + count + 'Mode', mode)
  localStorage.setItem('score' + count + 'Time', Date.now())
  if (won) localStorage.setItem('score' + count + 'Won', 'yes')
  else localStorage.setItem('score' + count + 'Won', 'no')
}

// Build HTML fragment showing the current score and past runs from localStorage.
// Escapes stored values using `clean` and formats timestamps with `timeText`.
export function scoreHtml(score) {
  const count = Number(localStorage.getItem('scoreCount'))
  let html = '<div class="score-history-panel text-left text-sm leading-6"><p>Current score: <strong>' + score + '</strong></p>'
  if (Number.isNaN(count) || count === 0) return html + '<p>You have not played this game yet.</p></div>'

  html += '<div class="score-history-list"><ol>'
  // scores are stored with separate localStorage keys.
  for (let i = count; i >= 1; i -= 1) {
    html += '<li class="score-history-item"><div class="score-history-copy"><span>Run ' + i + '</span><div class="score-history-meta">'
    html += '<span class="score-history-player">Player: ' + clean(localStorage.getItem('score' + i + 'Player')) + '</span>'
    html += '<span class="score-history-date">' + timeText(localStorage.getItem('score' + i + 'Time')) + '</span>'
    if (localStorage.getItem('score' + i + 'Won') === 'yes') html += '<span class="score-history-status is-finished">Finished</span>'
    else html += '<span class="score-history-status">Did not finish</span>'
    html += '<span class="score-history-mode">' + clean(localStorage.getItem('score' + i + 'Mode')) + '</span></div></div>'
    html += '<strong>' + clean(localStorage.getItem('score' + i + 'Score')) + '</strong></li>'
  }
  return html + '</ol></div></div>'
}

// Escape special HTML characters in a string to prevent injection when building HTML.
function clean(value) {
  let text = ''
  if (value === null) return ''

  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === '&') text += '&amp;'
    else if (value[i] === '<') text += '&lt;'
    else if (value[i] === '>') text += '&gt;'
    else if (value[i] === '"') text += '&quot;'
    else if (value[i] === "'") text += '&#39;'
    else text += value[i]
  }

  return text
}

// Convert a stored timestamp (milliseconds) into a readable date/time string.
// Returns 'Unknown date' for invalid input, otherwise 'HH:MM DD.MM.YYYY'.
function timeText(value) {
  const millis = Number(value)
  const date = new Date(millis)
  if (date.toString() === 'Invalid Date') return 'Unknown date'
  function two(n) {
    return String(n).padStart(2, '0')
  }
  return two(date.getHours()) + ':' + two(date.getMinutes()) + ' ' + two(date.getDate()) + '.' + two(date.getMonth() + 1) + '.' + date.getFullYear()
}
