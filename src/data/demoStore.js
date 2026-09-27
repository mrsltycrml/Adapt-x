const storagePrefix = 'adapt_demo_'

export const demoResetCode = '246810'

export function readDemoValue(key, fallback) {
  try {
    const stored = localStorage.getItem(`${storagePrefix}${key}`)
    return stored === null ? fallback : JSON.parse(stored)
  } catch {
    return fallback
  }
}

export function writeDemoValue(key, value) {
  localStorage.setItem(`${storagePrefix}${key}`, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('adapt-demo-update', { detail: key }))
  return value
}

export function readDemoCollection(key, fallback) {
  const stored = readDemoValue(key, fallback)
  return Array.isArray(stored) ? stored : fallback
}

export function writeDemoCollection(key, records) {
  return writeDemoValue(key, records)
}

export function appendDemoRecord(key, record, fallback = []) {
  const records = readDemoCollection(key, fallback)
  const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...record }
  writeDemoCollection(key, [entry, ...records])
  return entry
}

export function resetDemoStore() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(storagePrefix)) localStorage.removeItem(key)
  }
}