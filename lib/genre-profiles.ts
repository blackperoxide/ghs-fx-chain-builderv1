export interface GenreProfile {
  id: string
  label: string
  description: string
  lufsRange: [number, number] // sensible target window, not a hard pass/fail
  crestFactorRange: [number, number]
  muddinessThreshold: { watch: number; problem: number }
  harshnessThreshold: { watch: number; problem: number }
  airTargetPct: number // default starting point for the air slider
}

export const genreProfiles: GenreProfile[] = [
  {
    id: "streaming-pop",
    label: "Streaming Pop / Radio",
    description: "Clean, translatable, built to sit correctly after platform loudness normalization.",
    lufsRange: [-14, -9],
    crestFactorRange: [6, 14],
    muddinessThreshold: { watch: 15, problem: 22 },
    harshnessThreshold: { watch: 20, problem: 30 },
    airTargetPct: 4,
  },
  {
    id: "club-edm",
    label: "Club / EDM",
    description: "Loud, forward, built to hit hard on a system — less concerned with streaming normalization.",
    lufsRange: [-9, -6],
    crestFactorRange: [4, 10],
    muddinessThreshold: { watch: 16, problem: 24 },
    harshnessThreshold: { watch: 24, problem: 34 },
    airTargetPct: 3,
  },
  {
    id: "trip-hop-psych",
    label: "Trip-Hop / Psychedelic",
    description: "Deliberately darker, dustier, and more compressed than pop norms — mud and reduced air are often intentional.",
    lufsRange: [-16, -10],
    crestFactorRange: [5, 16],
    muddinessThreshold: { watch: 20, problem: 28 },
    harshnessThreshold: { watch: 26, problem: 36 },
    airTargetPct: 2,
  },
  {
    id: "aggressive-metal",
    label: "Aggressive / Metal / Screamo",
    description: "Intentionally abrasive — upper-mid harshness and heavy compression are part of the genre's identity.",
    lufsRange: [-10, -6],
    crestFactorRange: [4, 10],
    muddinessThreshold: { watch: 18, problem: 25 },
    harshnessThreshold: { watch: 32, problem: 42 },
    airTargetPct: 3,
  },
  {
    id: "live-acoustic",
    label: "Live / Acoustic",
    description: "Natural dynamics, openness, and air are the goal — less tolerance for mud or harshness.",
    lufsRange: [-18, -12],
    crestFactorRange: [8, 20],
    muddinessThreshold: { watch: 14, problem: 20 },
    harshnessThreshold: { watch: 18, problem: 26 },
    airTargetPct: 5,
  },
]

export const defaultGenreProfile = genreProfiles[2] // Trip-Hop / Psychedelic — matches this user's primary style
