import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const keys = req.nextUrl.searchParams.get('keys')
  if (!keys) return NextResponse.json([])

  const keyList = keys.split(',').map(k => k.trim()).filter(Boolean)
  if (!keyList.length) return NextResponse.json([])

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('kpatto_dialogues')
    .select('key,ko,en')
    .in('key', keyList)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
