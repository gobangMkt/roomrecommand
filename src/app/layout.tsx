import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '방추천 | 원하는 방 조건을 입력하세요',
  description: '원하는 방 조건을 입력하면 호스트가 직접 연락해드립니다',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
