import { NextRequest, NextResponse } from 'next/server'
import { dongToGu } from '@/lib/seoulData'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url 파라미터가 없습니다' }, { status: 400 })

  // gobang.kr/place 형식 URL만 허용
  if (!url.startsWith('https://gobang.kr/') && !url.startsWith('http://gobang.kr/')) {
    return NextResponse.json({ error: '고방 지점 URL만 입력 가능합니다 (gobang.kr)' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()

    // "도보 N분(OO동)" 패턴 추출
    const patterns = [
      /도보\s*\d+분\s*\(([가-힣]+동)\)/,
      /도보\s*\d+분\s*([가-힣]+동)/,
      /\(([가-힣]+동)\)/,
    ]

    let dong: string | null = null
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) { dong = match[1]; break }
    }

    if (!dong) return NextResponse.json({ error: '동 정보를 찾을 수 없습니다. 직접 입력해주세요.' })

    const gu = dongToGu(dong)
    if (!gu) return NextResponse.json({ error: `"${dong}"에 해당하는 구를 찾을 수 없습니다. 직접 입력해주세요.` })

    return NextResponse.json({ dong, gu })
  } catch {
    return NextResponse.json({ error: '크롤링에 실패했습니다. 동을 직접 입력해주세요.' })
  }
}
