import { NextRequest, NextResponse } from 'next/server'
import { Customer } from '@/types'

export async function GET(req: NextRequest) {
  const gu = req.nextUrl.searchParams.get('gu')
  if (!gu) return NextResponse.json({ error: 'gu 파라미터가 없습니다' }, { status: 400 })

  const gasUrl = process.env.GOOGLE_SCRIPT_URL
  if (!gasUrl) return NextResponse.json({ customers: [] })

  try {
    const res = await fetch(`${gasUrl}?action=getActiveRequests`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`GAS HTTP ${res.status}`)
    const data = await res.json()

    if (!Array.isArray(data.rows)) return NextResponse.json({ customers: [] })

    // 해당 구가 희망구에 포함된 고객만 필터링, 시간순 정렬
    const customers: Customer[] = (data.rows as Customer[])
      .filter(c => c.gu?.split(',').map(s => s.trim()).includes(gu))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    return NextResponse.json({ customers })
  } catch {
    return NextResponse.json({ error: '고객 정보를 가져오지 못했습니다.' }, { status: 500 })
  }
}
