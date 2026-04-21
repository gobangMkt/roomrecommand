import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '방추천 호스트',
  description: '고방 호스트 맞춤 고객 조회',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
