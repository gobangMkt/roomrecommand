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
  const recLabel = (p?.recStart && p?.recEnd) ? `${p.recStart} ~ ${p.recEnd}` : '—'
  const moveInLabel = p?.moveInUndecided ? '아직 정하지 않았어요'
    : (p?.moveInStart && p?.moveInEnd) ? `${p.moveInStart} ~ ${p.moveInEnd}` : '—'

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
    <main style={{ background: '#F2F4F6', maxWidth: 480, margin: '0 auto' }}>

      {/* 완료 헤더 */}
      <div style={{ background: '#fff', padding: '32px 20px 24px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: '#E8FBF0', borderRadius: 6,
          padding: '3px 10px', marginBottom: 16,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#00C73C', letterSpacing: '0.3px' }}>신청 완료</span>
        </div>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: '#EEF3FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, marginBottom: 16,
        }}>🏠</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#191F28', marginBottom: 6 }}>
          신청이 완료됐어요
        </h1>
        <p style={{ fontSize: 14, color: '#8B95A1', lineHeight: 1.6 }}>
          조건에 맞는 호스트가 직접 연락드릴 거예요
        </p>
      </div>

      {/* 신청 내용 요약 */}
      {request && (
        <div style={{ background: '#fff', marginTop: 8, padding: '20px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#8B95A1', letterSpacing: '0.3px', marginBottom: 14 }}>신청 내용</p>
          <div style={{ border: '1.5px solid #E5E8EB', borderRadius: 10, overflow: 'hidden' }}>
            {rows.map(([label, value], i) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '13px 16px',
                borderBottom: i < rows.length - 1 ? '1px solid #E5E8EB' : 'none',
              }}>
                <span style={{ fontSize: 13, color: '#8B95A1', minWidth: 70, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#191F28', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 안내 */}
      <div style={{ background: '#fff', marginTop: 8, padding: '16px 20px' }}>
        <div style={{ background: '#F8FAFF', borderRadius: 10, border: '1.5px solid #D0E2FF', padding: '14px 16px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: '#3182F6', fontWeight: 700, flexShrink: 0 }}>·</span>
            <span style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.6 }}>
              조건 변경이 필요하면 다시 방 추천 받기에서 수정하기를 눌러 언제든 바꿀 수 있어요.
            </span>
          </div>
        </div>
      </div>

      {/* CTA — 콘텐츠 바로 아래 */}
      <div style={{ background: '#fff', marginTop: 8, padding: '16px 20px 32px' }}>
        <Link href="/" style={{ display: 'block' }}>
          <button style={{
            width: '100%', padding: '15px', borderRadius: 10,
            background: '#3182F6', color: '#fff',
            fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}>
            홈으로 돌아가기
          </button>
        </Link>
      </div>
    </main>
  )
}
