import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Drum Bus & Glitch FX Chain Builder",
  description: "Personal FX chain reference for Grand Healing Studio",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
