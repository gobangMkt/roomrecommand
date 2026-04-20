import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL
  if (!scriptUrl) {
    return NextResponse.json({ error: 'GOOGLE_SCRIPT_URL not set' }, { status: 500 })
  }
  try {
    const data = await req.json()
    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, action: 'deactivate' }),
      redirect: 'follow',
    })
    const text = await res.text()
    return NextResponse.json({ ok: true, result: text })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
