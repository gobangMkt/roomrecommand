'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserByPhone, saveUser, deactivateRoomRequest, getRoomRequestByPhone } from '@/lib/storage'
import { Gender, UserInfo, RoomRequest } from '@/types'

type Step = 'phone' | 'new-user' | 'existing-user'

const inputStyle: React.CSSProperties = {
  width: '100%', height: 52, borderRadius: 4,
  background: 'var(--elevated)',
  boxShadow: 'var(--inset)',
  border: 'none', padding: '0 16px',
  fontSize: 16, color: 'var(--text)', outline: 'none',
}

const genderBtnStyle = (active: boolean): React.CSSProperties => ({
  flex: 1, height: 48, borderRadius: 4,
  background: active ? 'var(--green)' : 'var(--elevated)',
  color: active ? '#000' : 'var(--text-sub)',
  border: active ? 'none' : '1px solid var(--border)',
  fontSize: 14, fontWeight: 700, cursor: 'pointer',
  letterSpacing: '.5px', transition: 'all .15s',
})

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

export default function UserPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<Gender>('남성')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')
  const [existingUser, setExistingUser] = useState<UserInfo | null>(null)
  const [existingRequest, setExistingRequest] = useState<RoomRequest | null>(null)
  const [verifyPassword, setVerifyPassword] = useState('')
  const [editMode, setEditMode] = useState(false)

  const clean = (p: string) => p.replace(/-/g, '')

  const handlePhoneSubmit = () => {
    const c = clean(phone)
    if (!/^01[0-9]{8,9}$/.test(c)) { setError('올바른 휴대폰 번호를 입력해주세요.'); return }
    setError('')
    const user = getUserByPhone(c)
    if (user) { setExistingUser(user); setExistingRequest(getRoomRequestByPhone(c)); setStep('existing-user') }
    else setStep('new-user')
  }

  const handleNewUserSubmit = () => {
    if (!age || isNaN(Number(age)) || Number(age) < 18 || Number(age) > 99) {
      setError('올바른 나이를 입력해주세요 (18–99).'); return
    }
    setError('')
    const c = clean(phone)
    saveUser({ phone: c, gender, age, password: '', createdAt: new Date().toISOString() })
    sessionStorage.setItem('current_phone', c)
    router.push('/user/form')
  }

  const handleEdit = () => {
    if (!existingUser || verifyPassword !== existingUser.password) { setError('비밀번호가 올바르지 않아요.'); return }
    sessionStorage.setItem('current_phone', clean(phone)); router.push('/user/form')
  }

  const handleStop = async () => {
    if (!existingUser || verifyPassword !== existingUser.password) { setError('비밀번호가 올바르지 않아요.'); return }
    const c = clean(phone)
    deactivateRoomRequest(c)
    try {
      await fetch('/api/deactivate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: c }),
      })
    } catch { /* 로컬은 이미 처리됨 */ }
    alert('방추천 신청이 취소됐어요.')
    router.push('/')
  }

  const PrimaryBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick} style={{
      width: '100%', height: 52, borderRadius: 9999,
      background: 'var(--green)', color: '#000',
      fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
      letterSpacing: '1.4px', textTransform: 'uppercase' as const,
    }}>{label}</button>
  )

  const SecondaryBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick} style={{
      width: '100%', height: 48, borderRadius: 9999,
      background: 'transparent', color: 'var(--text)',
      fontSize: 14, fontWeight: 700, border: '1px solid var(--border)',
      cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' as const,
    }}>{label}</button>
  )

  const GhostBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick} style={{
      width: '100%', height: 44, background: 'none', border: 'none',
      color: 'var(--text-sub)', fontSize: 13, cursor: 'pointer', fontWeight: 600,
    }}>{label}</button>
  )

  return (
    <main style={{ minHeight: '100svh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex', alignItems: 'center', padding: '12px 8px',
        background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link href="/">
          <button style={{
            width: 40, height: 40, borderRadius: '50%', background: 'var(--elevated)',
            border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>‹</button>
        </Link>
      </header>

      <div style={{ flex: 1, padding: '8px 24px 40px', maxWidth: 480, width: '100%', margin: '0 auto' }}>

        {step === 'phone' && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 6, marginTop: 16 }}>
              휴대폰 번호
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 28 }}>
              연락처로 신청 현황을 확인합니다
            </p>
            <input
              type="tel" value={phone}
              onChange={e => setPhone(formatPhone(e.target.value))}
              onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
              placeholder="010-0000-0000"
              autoComplete="off"
              style={{ ...inputStyle, fontSize: 20, marginBottom: 12 }}
            />
            {error && <p style={{ fontSize: 13, color: 'var(--error)', marginBottom: 16 }}>{error}</p>}
            <PrimaryBtn label="확인" onClick={handlePhoneSubmit} />
          </div>
        )}

        {step === 'new-user' && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 6, marginTop: 16 }}>
              기본 정보
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 28 }}>
              호스트에게 표시되는 정보예요
            </p>

            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>성별</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['남성', '여성'] as Gender[]).map(g => (
                <button key={g} onClick={() => setGender(g)} style={genderBtnStyle(gender === g)}>{g}</button>
              ))}
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>나이</p>
            <input type="number" value={age} onChange={e => setAge(e.target.value)}
              placeholder="예: 25" min="18" max="99"
              autoComplete="off"
              style={{ ...inputStyle, marginBottom: 12 }}
            />
            {error && <p style={{ fontSize: 13, color: 'var(--error)', marginBottom: 16 }}>{error}</p>}
            <PrimaryBtn label="다음" onClick={handleNewUserSubmit} />
          </div>
        )}

        {step === 'existing-user' && existingUser && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 6, marginTop: 16 }}>
              {existingUser.gender} · {existingUser.age}세
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 24 }}>
              {existingRequest ? '신청 중인 방추천이 있어요' : '신청된 방추천이 없어요'}
            </p>

            {existingRequest && (
              <div style={{
                background: 'var(--surface)', borderRadius: 8, padding: '16px 18px',
                marginBottom: 24, boxShadow: 'var(--shadow-medium)',
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>현재 신청 내용</p>
                {[
                  ['지역', existingRequest.location.gu.join(', ')],
                  ['보증금', `${existingRequest.deposit.min}–${existingRequest.deposit.max}만원`],
                  ['월세', `${existingRequest.monthlyRent.min}–${existingRequest.monthlyRent.max}만원`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {!editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PrimaryBtn label={existingRequest ? '새로 신청하기' : '방추천 신청하기'}
                  onClick={() => { sessionStorage.setItem('current_phone', clean(phone)); router.push('/user/form') }} />
                {existingRequest && <>
                  <SecondaryBtn label="수정하기" onClick={() => setEditMode(true)} />
                  <GhostBtn label="방추천 그만받기" onClick={() => setEditMode(true)} />
                </>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 }}>비밀번호 확인</p>
                <input type="password" value={verifyPassword}
                  onChange={e => setVerifyPassword(e.target.value)}
                  placeholder="비밀번호를 입력해주세요"
                  autoComplete="current-password"
                  style={{ ...inputStyle, marginBottom: 4 }}
                />
                {error && <p style={{ fontSize: 13, color: 'var(--error)' }}>{error}</p>}
                <div style={{ height: 8 }} />
                <PrimaryBtn label="수정하기" onClick={handleEdit} />
                <button onClick={handleStop} style={{
                  width: '100%', height: 48, borderRadius: 9999, background: 'transparent',
                  color: 'var(--error)', fontSize: 13, fontWeight: 700,
                  border: `1px solid var(--error)`, cursor: 'pointer', letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>방추천 그만받기</button>
                <GhostBtn label="취소" onClick={() => { setEditMode(false); setError('') }} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
