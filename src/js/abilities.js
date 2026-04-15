import blueAbilityIconSrc from '../assets/rocks/blue/rock_2.png'
import redAbilityIconSrc from '../assets/rocks/red/rock_2.png'

import { addFuel, applyFuelDrainMultiplier, applyFuelPause, applyPadSpeedMultiplier, applyRocketSpeedMultiplier, clearGameplayEffects } from './game.js'

const PULSE_DURATION_MS = 900
const MESSAGE_DURATION_MS = 3200

const abilityIconSources = {
  red: redAbilityIconSrc,
  blue: blueAbilityIconSrc,
}

const abilityState = {
  message: '',
  slots: {
    red: { charges: 0, pulsing: false },
    blue: { charges: 0, pulsing: false },
  },
}

const listeners = new Set()

let messageTimeoutId = null

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function pickRandomEffect(effects) {
  return effects[Math.floor(Math.random() * effects.length)] ?? effects[0]
}

function showAbilityMessage(message) {
  abilityState.message = message

  if (messageTimeoutId !== null) {
    clearTimeout(messageTimeoutId)
  }

  messageTimeoutId = setTimeout(() => {
    abilityState.message = ''
    messageTimeoutId = null
    notifyListeners()
  }, MESSAGE_DURATION_MS)

  notifyListeners()
}

const redEffects = [
  {
    message: 'Fuel paused for 5 seconds.',
    apply: () => {
      applyFuelPause(5000)
    },
  },
  {
    message: 'Fuel reserves restored.',
    apply: () => {
      addFuel(1)
    },
  },
  {
    message: 'Fuel drain slowed for 8 seconds.',
    apply: () => {
      applyFuelDrainMultiplier(0.45, 8000)
    },
  },
]

const blueEffects = [
  {
    message: 'Pad thrusters boosted for 8 seconds.',
    apply: () => {
      applyPadSpeedMultiplier(1.75, 8000)
    },
  },
  {
    message: 'Rocket stabilized for 8 seconds.',
    apply: () => {
      applyRocketSpeedMultiplier(0.72, 8000)
    },
  },
  {
    message: 'Pad controls slowed for 8 seconds.',
    apply: () => {
      applyPadSpeedMultiplier(0.55, 8000)
    },
  },
  {
    message: 'Rocket overdrive engaged for 8 seconds.',
    apply: () => {
      applyRocketSpeedMultiplier(1.45, 8000)
    },
  },
  {
    message: 'Fuel drain spiked for 5 seconds.',
    apply: () => {
      applyFuelDrainMultiplier(2.2, 5000)
    },
  },
]

export function getAbilityIconSource(color) {
  return abilityIconSources[color]
}

export function getAbilityState() {
  return {
    message: abilityState.message,
    slots: {
      red: { ...abilityState.slots.red },
      blue: { ...abilityState.slots.blue },
    },
  }
}

export function subscribeToAbilityState(listener) {
  listeners.add(listener)
  listener()

  return () => {
    listeners.delete(listener)
  }
}

export function chargeAbility(color) {
  const slot = abilityState.slots[color]

  slot.charges += 1
  slot.pulsing = true
  notifyListeners()

  setTimeout(() => {
    slot.pulsing = false
    notifyListeners()
  }, PULSE_DURATION_MS)

  return true
}

export function activateAbility(color) {
  const slot = abilityState.slots[color]

  if (slot.charges === 0) {
    return false
  }

  slot.charges -= 1
  slot.pulsing = false

  const effect = pickRandomEffect(color === 'red' ? redEffects : blueEffects)
  effect.apply()
  showAbilityMessage(effect.message)
  return true
}

export function resetAbilitySystem() {
  abilityState.message = ''
  abilityState.slots.red.charges = 0
  abilityState.slots.red.pulsing = false
  abilityState.slots.blue.charges = 0
  abilityState.slots.blue.pulsing = false

  if (messageTimeoutId !== null) {
    clearTimeout(messageTimeoutId)
    messageTimeoutId = null
  }

  clearGameplayEffects()
  notifyListeners()
}
