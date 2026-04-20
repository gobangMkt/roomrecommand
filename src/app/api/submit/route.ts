import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL
  if (!scriptUrl) {
    return NextResponse.json({ error: 'GOOGLE_SCRIPT_URL이 설정되지 않았습니다.' }, { status: 500 })
  }

  const data = await req.json()

  const res = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    redirect: 'follow',
  })

  const text = await res.text()
  try {
    return NextResponse.json(JSON.parse(text))
  } catch {
    return NextResponse.json({ success: true })
  }
}
