import { useState, useEffect, useMemo } from 'react'
import { Check, Flame, Dumbbell, RotateCcw, ChevronDown } from 'lucide-react'
import { WORKOUTS, ACCENTS } from '../data/workouts.js'
import {
  buildSchedule,
  dateKey,
  dayName,
  dayProgress,
  isDayComplete,
} from '../lib/schedule.js'
import { loadTrackerData, saveTrackerData, clearTrackerData } from '../lib/trackerStorage.js'
import { StatCard } from './StatCard.jsx'

export default function GymTracker() {
  const [data, setData] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const schedule = useMemo(() => buildSchedule(), [])
  const today = dateKey(new Date())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const initial = await loadTrackerData()
      if (!cancelled) {
        setData(initial)
        setExpanded(today)
        setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [today])

  const persist = async (next) => {
    setData(next)
    try {
      await saveTrackerData(next)
    } catch (e) {
      console.error('Save failed', e)
    }
  }

  const toggleExercise = (date, idx) => {
    const day = data[date] || { exercises: {} }
    const exercises = { ...day.exercises, [idx]: !day.exercises[idx] }
    persist({ ...data, [date]: { ...day, exercises } })
  }

  const totalDays = schedule.length
  const completedDays = schedule.filter((d) => isDayComplete(data, d.date, d.workout)).length
  const totalExercises = schedule.reduce((acc, d) => acc + WORKOUTS[d.workout].exercises.length, 0)
  const doneExercises = schedule.reduce(
    (acc, d) => acc + dayProgress(data, d.date, d.workout).done,
    0,
  )

  const streak = useMemo(() => {
    let s = 0
    const past = schedule.filter((d) => d.date <= today).sort((a, b) => b.date.localeCompare(a.date))
    for (let i = 0; i < past.length; i++) {
      const d = past[i]
      const done = isDayComplete(data, d.date, d.workout)
      if (i === 0 && d.date === today && !done) continue
      if (done) s++
      else break
    }
    return s
  }, [data, schedule, today])

  const handleReset = async () => {
    setData({})
    try {
      await clearTrackerData()
    } catch {
      /* ignore */
    }
    setConfirmReset(false)
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-500 flex items-center justify-center text-sm">
        Loading…
      </div>
    )
  }

  const pct = Math.round((completedDays / totalDays) * 100)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(245, 158, 11, 0.18) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-5 py-10 sm:py-14">
        <header className="mb-10">
          <div className="text-amber-500/90 text-[11px] tracking-[0.32em] uppercase mb-3 font-bold">
            25 Day Gym Block
          </div>
          <h1
            className="text-[3.5rem] sm:text-7xl leading-[0.88] tracking-tight mb-4"
            style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '-0.02em' }}
          >
            STRENGTH
            <br />
            <span className="text-amber-500">OVER MOTION.</span>
          </h1>
          <p className="text-zinc-400 text-sm">May 16 → June 10 · 1 hour/day · 6 lifts + 1 walk</p>
        </header>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Days Done" value={completedDays} suffix={`/ ${totalDays}`} icon={<Check size={12} />} />
          <StatCard label="Streak" value={streak} suffix={streak > 0 ? '🔥' : ''} icon={<Flame size={12} />} />
          <StatCard
            label="Exercises"
            value={doneExercises}
            suffix={`/ ${totalExercises}`}
            icon={<Dumbbell size={12} />}
          />
        </div>

        <div className="mb-10">
          <div className="flex justify-between text-[11px] text-zinc-500 mb-2 uppercase tracking-wider font-semibold">
            <span>Block Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {schedule.map((day) => {
            const workout = WORKOUTS[day.workout]
            const colors = ACCENTS[workout.accent]
            const progress = dayProgress(data, day.date, day.workout)
            const complete = isDayComplete(data, day.date, day.workout)
            const isToday = day.date === today
            const isPast = day.date < today
            const isOpen = expanded === day.date

            return (
              <div
                key={day.date}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  isToday
                    ? 'border-amber-500/60 bg-amber-500/[0.04] shadow-lg shadow-amber-500/5'
                    : 'border-zinc-800/80 bg-zinc-900/30'
                } ${complete && !isToday ? 'opacity-75' : ''} ${
                  isPast && !complete && !isToday ? 'opacity-45' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : day.date)}
                  className="w-full px-4 sm:px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-center w-12 shrink-0">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                        {dayName(day.dateObj)}
                      </div>
                      <div
                        className="text-2xl text-zinc-100 leading-none mt-0.5"
                        style={{ fontFamily: "'Anton', sans-serif" }}
                      >
                        {day.dateObj.getDate()}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        <div className="text-sm font-semibold text-zinc-100 truncate">{workout.name}</div>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {isToday ? <span className="text-amber-400 font-bold mr-2">TODAY</span> : null}
                        {progress.done}/{progress.total} exercises
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {complete ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/50 flex items-center justify-center">
                        <Check size={13} className="text-emerald-400" strokeWidth={3} />
                      </div>
                    ) : null}
                    <ChevronDown
                      size={18}
                      className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {isOpen ? (
                  <div className="px-4 sm:px-5 pb-4 pt-1">
                    <div className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-3 ${colors.text}`}>
                      {workout.short}
                    </div>
                    <ul className="space-y-1">
                      {workout.exercises.map((ex, i) => {
                        const checked = !!data[day.date]?.exercises?.[i]
                        return (
                          <li key={i}>
                            <button
                              type="button"
                              onClick={() => toggleExercise(day.date, i)}
                              className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition text-left group"
                            >
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                                  checked
                                    ? 'bg-amber-500 border-amber-500'
                                    : 'border-zinc-700 group-hover:border-zinc-500'
                                }`}
                              >
                                {checked ? <Check size={12} className="text-zinc-950" strokeWidth={3.5} /> : null}
                              </div>
                              <span
                                className={`text-sm leading-relaxed ${
                                  checked ? 'text-zinc-500 line-through' : 'text-zinc-200'
                                }`}
                              >
                                {ex}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900">
          <p className="text-zinc-500 text-xs leading-relaxed mb-6">
            <span className="text-amber-500 font-bold">Rule:</span> show up even when you don&apos;t feel like
            it. Cut the workout in half if needed. A 25-minute lazy session beats a skipped one — the habit is
            the win.
          </p>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-600">Saved automatically</span>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition"
              >
                <RotateCcw size={12} /> Reset
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">Wipe everything?</span>
                <button type="button" onClick={handleReset} className="text-rose-400 hover:text-rose-300 font-bold">
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
