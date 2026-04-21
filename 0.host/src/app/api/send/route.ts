import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const gasUrl = process.env.GOOGLE_SCRIPT_URL

  if (gasUrl) {
    try {
      await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'saveSendLog', ...body }),
        signal: AbortSignal.timeout(10000),
      })
    } catch {
      // GAS 저장 실패해도 클라이언트엔 성공 응답 (로그 유실은 감수)
    }
  }

  return NextResponse.json({ success: true })
}
