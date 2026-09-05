import { NextResponse } from "next/server"
import { writeFile, unlink, readFile, mkdir } from "fs/promises"
import { execFile } from "child_process"
import { promisify } from "util"
import path from "path"
import os from "os"
import crypto from "crypto"

const execFileAsync = promisify(execFile)

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }

  const tmpDir = path.join(os.tmpdir(), "ghs-transcribe")
  await mkdir(tmpDir, { recursive: true })
  const ext = path.extname(file.name) || ".wav"
  const uid = crypto.randomUUID()
  const inputPath = path.join(tmpDir, `${uid}${ext}`)
  const outputPath = path.join(tmpDir, `${uid}.mid`)

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(inputPath, buffer)

    const scriptPath = path.join(process.cwd(), "scripts", "transcribe_to_midi.py")
    const { stdout, stderr } = await execFileAsync("python3", [scriptPath, inputPath, outputPath], {
      maxBuffer: 1024 * 1024 * 10,
      timeout: 55000,
    })

    if (stderr && stderr.trim()) {
      console.error("transcribe_to_midi stderr:", stderr)
    }

    const summary = JSON.parse(stdout)
    if (summary.error) {
      return NextResponse.json({ error: summary.error }, { status: 422 })
    }

    const midiBuffer = await readFile(outputPath)
    const midiBase64 = midiBuffer.toString("base64")

    return NextResponse.json({
      noteCount: summary.note_count,
      notes: summary.notes,
      midiBase64,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Transcription failed"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})
  }
}
