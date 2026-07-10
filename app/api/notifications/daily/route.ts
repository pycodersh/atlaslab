import { NextRequest, NextResponse } from 'next/server'

const OS_API = 'https://onesignal.com/api/v1/notifications'
const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!
const REST_KEY = process.env.ONESIGNAL_REST_API_KEY!

// Vercel Cron: runs every hour on the hour (0 * * * *)
// Filters OneSignal users whose reminder_time tag matches current UTC HH:MM
export async function GET(req: NextRequest) {
  // Verify Vercel Cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const mm = String(now.getUTCMinutes()).padStart(2, '0')
  const currentTime = `${hh}:${mm}`

  // Determine message based on hour (simplified: odd = review, even = new story, both on specific hours)
  // Real logic would query Supabase for each user's review state;
  // here we send a combined message to all users whose reminder_time matches.
  const contents = { en: '📖 New story + reviews waiting for you!' }
  const headings = { en: 'PATTO' }

  const body = {
    app_id: APP_ID,
    headings,
    contents,
    filters: [
      { field: 'tag', key: 'reminder_time', relation: '=', value: currentTime },
    ],
  }

  const res = await fetch(OS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${REST_KEY}`,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: data }, { status: res.status })
  }

  return NextResponse.json({ time: currentTime, result: data })
}
