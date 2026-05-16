const STORAGE_KEY = 'tracker-data'

function canvasStorage() {
  if (typeof window === 'undefined') return null
  const s = window.storage
  if (s && typeof s.get === 'function' && typeof s.set === 'function') return s
  return null
}

export async function loadTrackerData() {
  const canvas = canvasStorage()
  if (canvas) {
    try {
      const result = await canvas.get(STORAGE_KEY)
      if (result?.value) return JSON.parse(result.value)
    } catch {
      /* no data yet */
    }
    return {}
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export async function saveTrackerData(data) {
  const canvas = canvasStorage()
  const payload = JSON.stringify(data)
  if (canvas) {
    await canvas.set(STORAGE_KEY, payload)
    return
  }
  localStorage.setItem(STORAGE_KEY, payload)
}

export async function clearTrackerData() {
  const canvas = canvasStorage()
  if (canvas) {
    try {
      await canvas.delete(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    return
  }
  localStorage.removeItem(STORAGE_KEY)
}
