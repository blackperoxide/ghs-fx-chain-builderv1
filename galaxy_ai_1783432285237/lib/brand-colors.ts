export const brandColor: Record<string, string> = {
  UAD: "bg-blue-600",
  FabFilter: "bg-emerald-600",
  "Plugin Alliance": "bg-orange-600",
  Waves: "bg-purple-600",
  Kilohearts: "bg-pink-600",
  Soundtoys: "bg-yellow-600",
  "Neural DSP": "bg-red-600",
  Eventide: "bg-indigo-600",
  "IK Multimedia": "bg-cyan-600",
}

export function getBrandColor(brand: string): string {
  return brandColor[brand] ?? "bg-slate-600"
}
