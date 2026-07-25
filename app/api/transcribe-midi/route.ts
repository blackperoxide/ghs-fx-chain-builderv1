import { NextResponse } from "next/server"
import { getPythonBackendUrl } from "@/lib/python-backend"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }

  try {
    const backendFormData = new FormData()
    backendFormData.append("file", file, file.name)

    const backendResponse = await fetch(getPythonBackendUrl("/transcribe-midi"), {
      method: "POST",
      body: backendFormData,
      signal: AbortSignal.timeout(55000),
    })

    const result = await backendResponse.json()
    if (!backendResponse.ok) {
      return NextResponse.json({ error: result.detail ?? "Transcription failed" }, { status: backendResponse.status })
    }
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Transcription failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
