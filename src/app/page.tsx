'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100svh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: '56px 24px 0', maxWidth: 480, width: '100%', margin: '0 auto' }}>

        {/* 브랜드 */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'var(--elevated)', borderRadius: 9999,
            padding: '6px 16px 6px 8px', marginBottom: 32,
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>🏠</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '.5px' }}>방추천</span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1.25, marginBottom: 12 }}>
            원하는 방 조건을<br />알려주세요
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            조건에 맞는 호스트가 직접 연락해드립니다
          </p>
        </div>

        {/* 특징 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { icon: '📍', title: '위치 · 가격 조건 입력', desc: '구/동 단위로 원하는 위치와 예산을 설정해요' },
            { icon: '📞', title: '호스트 직접 연락',     desc: '조건이 맞으면 호스트가 바로 연락해요' },
            { icon: '✏️', title: '언제든 수정 가능',     desc: '신청 내용을 자유롭게 수정하거나 취소할 수 있어요' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--surface)', borderRadius: 8,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>{icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.4 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '24px 24px 40px', maxWidth: 480, width: '100%', margin: '0 auto' }}>
        <Link href="/user" style={{ display: 'block' }}>
          <button style={{
            width: '100%', height: 52, borderRadius: 9999,
            background: 'var(--green)', color: '#000',
            fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
            letterSpacing: '1.4px', textTransform: 'uppercase',
            boxShadow: '0 4px 16px rgba(30,215,96,.25)',
          }}>
            방 추천 받기
          </button>
        </Link>
      </div>
    </main>
  )
}
