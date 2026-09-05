import rawDatabase from "./data/plugin-database.json"
import type { Category } from "./plugin-library"

export interface DbEntry {
  name: string
  manufacturer: string
  category: string
  subcategory: string
  tags: string
}

const database = rawDatabase as DbEntry[]

// The scanned database uses a much richer 23-category taxonomy than this app's
// internal Category union, so mapping down is inherently lossy. Subcategory/tag
// keywords are checked first (more specific - catches things like a de-esser
// filed generically under "Vocal / Pitch"), falling back to the coarse
// top-level category below.
function mapToInternalCategory(entry: DbEntry): Category {
  const text = `${entry.subcategory} ${entry.tags}`.toLowerCase()

  if (/de-?ess|sibilan/.test(text)) return "deesser"
  if (/doubl|widen|width/.test(text)) return "doubler"
  if (/glitch|stutter|bitcrush|repeat/.test(text)) return "glitch"
  if (/chorus|phaser|phase|tremolo|flang/.test(text)) return "modulation"
  if (/transient|punch/.test(text)) return "transient"
  if (/pitch|tune|shift|formant/.test(text)) return "pitch"

  const categoryMap: Record<string, Category> = {
    "amp sim / guitar": "amp",
    "bass amp / instrument": "amp",
    "channel strip / console": "eq",
    "compressor / limiter": "compression",
    delay: "delay",
    "drum instrument": "other",
    "dynamics / compression": "compression",
    eq: "eq",
    "ezmix / mix bundle": "other",
    "keyboard / organ": "other",
    "midi / composition tool": "other",
    "mastering / loudness": "compression",
    "metering / utility": "other",
    "mic / preamp modeling": "saturation",
    modulation: "modulation",
    "piano / keys": "other",
    reverb: "reverb",
    sampler: "other",
    "saturation / tape / distortion": "saturation",
    "studio / tape machine": "saturation",
    "synth instrument": "other",
    "utility / format": "other",
    "vocal / pitch": "pitch",
  }

  return categoryMap[entry.category.toLowerCase()] ?? "other"
}

const MIN_SUBSTRING_LENGTH = 4

interface Indexed {
  entry: DbEntry
  normalizedName: string
}

const indexed: Indexed[] = database.map((entry) => ({ entry, normalizedName: entry.name.toLowerCase() }))

const exactByName = new Map<string, DbEntry>()
for (const { entry, normalizedName } of indexed) exactByName.set(normalizedName, entry)

/**
 * Looks up a real, scanned plugin by name against the ~1,700 real installed
 * plugins this database covers - exact match first, then substring (in either
 * direction, with a minimum length guard so short names don't false-match
 * everything). Returns null for anything not in the scan, so callers can fall
 * back to the older heuristic guesser.
 */
export function lookupPlugin(pluginName: string): DbEntry | null {
  const query = pluginName.trim().toLowerCase()
  if (!query) return null

  const exact = exactByName.get(query)
  if (exact) return exact

  if (query.length < MIN_SUBSTRING_LENGTH) return null

  let best: DbEntry | null = null
  let bestLength = 0
  for (const { entry, normalizedName } of indexed) {
    if (normalizedName.length < MIN_SUBSTRING_LENGTH) continue
    if (normalizedName.includes(query) || query.includes(normalizedName)) {
      if (normalizedName.length > bestLength) {
        best = entry
        bestLength = normalizedName.length
      }
    }
  }
  return best
}

export function categorizeFromDatabase(pluginName: string): Category | null {
  const entry = lookupPlugin(pluginName)
  return entry ? mapToInternalCategory(entry) : null
}
