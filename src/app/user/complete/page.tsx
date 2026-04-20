'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRoomRequestByPhone } from '@/lib/storage'
import { RoomRequest } from '@/types'

export default function CompletePage() {
  const [request, setRequest] = useState<RoomRequest | null>(null)

  useEffect(() => {
    const phone = sessionStorage.getItem('current_phone')
    if (phone) setRequest(getRoomRequestByPhone(phone))
  }, [])

  const p = request?.period
  const recLabel = p?.recUndecided ? '아직 정하지 않았어요'
    : (p?.recStart && p?.recEnd) ? `${p.recStart} – ${p.recEnd}` : '—'
  const moveInLabel = p?.moveInUndecided ? '아직 정하지 않았어요'
    : (p?.moveInStart && p?.moveInEnd) ? `${p.moveInStart} – ${p.moveInEnd}` : '—'

  const rows = request ? [
    ['방추천 기간', recLabel],
    ['입주 희망', moveInLabel],
    ['지역', request.location.gu.join(', ')],
    ['보증금', `${request.deposit.min}–${request.deposit.max}만원`],
    ['월세', `${request.monthlyRent.min}–${request.monthlyRent.max}만원`],
    ['유형', request.roomTypes.join(', ')],
    ...(request.additionalNotes ? [['요청사항', request.additionalNotes]] : []),
  ] : []

  return (
    <main style={{ minHeight: '100svh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
      <div style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', paddingTop: 64 }}>

        {/* 성공 아이콘 */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(30,215,96,.15)',
          border: '2px solid var(--green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, color: 'var(--green)', fontWeight: 700,
          marginBottom: 24,
        }}>✓</div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 8 }}>
          신청이 완료됐어요
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: 40 }}>
          조건에 맞는 호스트가 직접 연락드릴 거예요.<br />
          연락처를 확인하고 기다려주세요.
        </p>

        {request && (
          <div style={{
            background: 'var(--surface)', borderRadius: 8,
            overflow: 'hidden', marginBottom: 16,
            boxShadow: 'var(--shadow-medium)',
          }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--elevated)' }}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
                letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>신청 내용</p>
            </div>
            {rows.map(([label, value], i) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '13px 18px',
                borderBottom: i < rows.length - 1 ? '1px solid var(--elevated)' : 'none',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-sub)', flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textAlign: 'right', maxWidth: '60%' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{
          background: 'var(--elevated)', borderRadius: 8,
          padding: '14px 16px', display: 'flex', gap: 10, marginBottom: 40,
          border: '1px solid var(--border)',
        }}>
          <span style={{ color: 'var(--green)', fontSize: 15, flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            조건 변경이 필요하면 다시 방 추천 받기에서<br />
            수정하기를 눌러 언제든 바꿀 수 있어요.
          </p>
        </div>
      </div>

      <div style={{ padding: '16px 0 40px', maxWidth: 480, width: '100%', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'block' }}>
          <button style={{
            width: '100%', height: 56, borderRadius: 9999,
            background: 'var(--green)', color: '#000',
            fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
            letterSpacing: '1.4px', textTransform: 'uppercase',
          }}>
            홈으로 돌아가기
          </button>
        </Link>
      </div>
    </main>
  )
}
