import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ep = (String(body.episode ?? 'kp-ep-001')).replace('kp-ep-', '')
    const outPath = path.join(process.cwd(), 'public', 'kpatto', `ep-${ep}`, 'bubbles.json')
    await writeFile(outPath, JSON.stringify(body, null, 2))
    return NextResponse.json({ ok: true, path: outPath })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
