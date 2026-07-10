import { NextRequest, NextResponse } from 'next/server'

const OS_API = 'https://onesignal.com/api/v1/notifications'
const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!
const REST_KEY = process.env.ONESIGNAL_REST_API_KEY!

export async function POST(req: NextRequest) {
  const { title, message, userIds } = await req.json()

  if (!title || !message) {
    return NextResponse.json({ error: 'title and message are required' }, { status: 400 })
  }

  const body: Record<string, unknown> = {
    app_id: APP_ID,
    headings: { en: title },
    contents: { en: message },
  }

  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    body.include_aliases = { external_id: userIds }
    body.target_channel = 'push'
  } else {
    body.included_segments = ['All']
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

  return NextResponse.json(data)
}
