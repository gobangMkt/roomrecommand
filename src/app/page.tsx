'use client'

import Link from 'next/link'

const features = [
  { num: '01', title: '위치 · 가격 조건 입력', desc: '구/동 단위로 원하는 위치와 예산을 설정해요' },
  { num: '02', title: '호스트 직접 연락',     desc: '조건이 맞으면 호스트가 바로 연락해드려요' },
  { num: '03', title: '언제든 수정 가능',     desc: '신청 내용을 자유롭게 수정하거나 취소할 수 있어요' },
]

export default function Home() {
  return (
    <main style={{ background: '#F2F4F6', maxWidth: 480, margin: '0 auto' }}>

      {/* 헤더 */}
      <div style={{ background: '#fff', padding: '24px 20px 20px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#191F28', lineHeight: 1.35, marginBottom: 6 }}>
          원하는 방 조건을<br />알려주세요
        </h1>
        <p style={{ fontSize: 14, color: '#8B95A1', lineHeight: 1.5 }}>
          조건에 맞는 호스트가 직접 연락해드립니다
        </p>
      </div>

      {/* 이용 순서 + 안내 */}
      <div style={{ background: '#fff', marginTop: 8 }}>
        {features.map(({ num, title, desc }, i) => (
          <div key={num} style={{
            padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16,
            borderBottom: '1px solid #E5E8EB',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#EEF3FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#3182F6', flexShrink: 0,
            }}>{num}</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#191F28', marginBottom: 3 }}>{title}</p>
              <p style={{ fontSize: 13, color: '#8B95A1', lineHeight: 1.5 }}>{desc}</p>
            </div>
          </div>
        ))}

        {/* 안내 — 같은 카드 안 하단 */}
        <div style={{ padding: '14px 20px', background: '#F8FAFF' }}>
          {[
            '연락처는 방추천 목적으로만 제공됩니다',
            '신청 기간이 만료되면 자동으로 종료돼요',
          ].map((t, i, arr) => (
            <div key={t} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < arr.length - 1 ? 6 : 0 }}>
              <span style={{ color: '#3182F6', fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 }}>·</span>
              <span style={{ fontSize: 13, color: '#8B95A1', lineHeight: 1.6 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA — 콘텐츠 바로 아래 */}
      <div style={{ background: '#fff', marginTop: 8, padding: '16px 20px 32px' }}>
        <Link href="/user" style={{ display: 'block' }}>
          <button style={{
            width: '100%', padding: '15px', borderRadius: 10,
            background: '#3182F6', color: '#fff',
            fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}>
            방 추천 받기
          </button>
        </Link>
      </div>
    </main>
  )
}
