import { NextResponse } from "next/server"
import { writeFile, unlink, mkdir } from "fs/promises"
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

  const tmpDir = path.join(os.tmpdir(), "ghs-audio-analyzer")
  await mkdir(tmpDir, { recursive: true })
  const ext = path.extname(file.name) || ".wav"
  const tmpPath = path.join(tmpDir, `${crypto.randomUUID()}${ext}`)

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(tmpPath, buffer)

    const scriptPath = path.join(process.cwd(), "scripts", "analyze_audio.py")
    const { stdout, stderr } = await execFileAsync("python3", [scriptPath, tmpPath], {
      maxBuffer: 1024 * 1024 * 10,
      timeout: 55000,
    })

    if (stderr && stderr.trim()) {
      console.error("analyze_audio stderr:", stderr)
    }

    const result = JSON.parse(stdout)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 422 })
    }
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    await unlink(tmpPath).catch(() => {})
  }
}
