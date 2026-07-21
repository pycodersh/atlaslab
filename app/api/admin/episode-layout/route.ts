import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import path from 'path'

function getPath(episodeId: string) {
  return path.join(process.cwd(), 'data', 'kpatto', `${episodeId}-layout.json`)
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'No id' }, { status: 400 })
  try {
    const raw = await readFile(getPath(id), 'utf-8')
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({ episodeId: id, overrides: {} })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { episodeId, overrides, bubbles } = body
  if (!episodeId) return NextResponse.json({ error: 'No episodeId' }, { status: 400 })
  try {
    const dir = path.join(process.cwd(), 'data', 'kpatto')
    await mkdir(dir, { recursive: true })
    await writeFile(getPath(episodeId), JSON.stringify({ episodeId, overrides, bubbles }, null, 2), 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
