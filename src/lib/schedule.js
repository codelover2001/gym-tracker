import { WORKOUTS } from '../data/workouts.js'

export function dateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Sun → Sat maps to workout keys for this block */
const DAY_TYPE_MAP = ['sunday', 'upperA', 'lowerA', 'upperB', 'lowerB', 'armsCore', 'saturday']

export function buildSchedule() {
  const schedule = []
  const start = new Date(2026, 4, 16) // May 16, 2026
  const end = new Date(2026, 5, 10) // June 10, 2026
  const current = new Date(start)
  while (current <= end) {
    schedule.push({
      date: dateKey(current),
      dateObj: new Date(current),
      workout: DAY_TYPE_MAP[current.getDay()],
    })
    current.setDate(current.getDate() + 1)
  }
  return schedule
}

export function dayName(date) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
}

export function dayProgress(data, date, workoutKey) {
  const dd = data[date]
  const total = WORKOUTS[workoutKey].exercises.length
  if (!dd?.exercises) return { done: 0, total }
  const done = WORKOUTS[workoutKey].exercises.filter((_, i) => dd.exercises[i]).length
  return { done, total }
}

export function isDayComplete(data, date, workoutKey) {
  const p = dayProgress(data, date, workoutKey)
  return p.total > 0 && p.done === p.total
}
