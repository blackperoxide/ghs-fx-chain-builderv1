import { NextResponse } from "next/server"
import { writeFile, readFile, unlink, mkdir } from "fs/promises"
import { execFile } from "child_process"
import { promisify } from "util"
import path from "path"
import os from "os"
import crypto from "crypto"

const execFileAsync = promisify(execFile)

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_SEMITONES = 24

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const semitones = Number(formData.get("semitones"))

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }
  if (!Number.isFinite(semitones) || Math.abs(semitones) > MAX_SEMITONES) {
    return NextResponse.json({ error: `Semitones must be a number between -${MAX_SEMITONES} and ${MAX_SEMITONES}` }, { status: 400 })
  }

  const tmpDir = path.join(os.tmpdir(), "ghs-audio-transpose")
  await mkdir(tmpDir, { recursive: true })
  const id = crypto.randomUUID()
  const ext = path.extname(file.name) || ".wav"
  const inputPath = path.join(tmpDir, `${id}-in${ext}`)
  const outputPath = path.join(tmpDir, `${id}-out.wav`)

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(inputPath, buffer)

    const scriptPath = path.join(process.cwd(), "scripts", "transpose_audio.py")
    const { stdout, stderr } = await execFileAsync(
      "python3",
      [scriptPath, inputPath, outputPath, String(semitones)],
      { maxBuffer: 1024 * 1024 * 10, timeout: 55000 }
    )

    if (stderr && stderr.trim()) {
      console.error("transpose_audio stderr:", stderr)
    }

    const meta = JSON.parse(stdout)
    if (meta.error) {
      return NextResponse.json({ error: meta.error }, { status: 422 })
    }

    const outBuffer = await readFile(outputPath)
    const baseName = path.basename(file.name, path.extname(file.name))
    const sign = semitones >= 0 ? "+" : ""

    return new NextResponse(new Uint8Array(outBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": `attachment; filename="${baseName}-${sign}${semitones}st.wav"`,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Transpose failed"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})
  }
}
