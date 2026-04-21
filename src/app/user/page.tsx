'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserByPhone, saveUser, deactivateRoomRequest, getRoomRequestByPhone, resetUserForReapply } from '@/lib/storage'
import { Gender, UserInfo, RoomRequest } from '@/types'

// 흐름:
// phone → DB없음 or inactive → new-user → form → complete(PW설정)
// phone → DB있음 + active  → verify-pw → options-active(수정/그만받기)
// PW초기화 → 전체삭제 → new-user

type Step = 'phone' | 'new-user' | 'verify-pw' | 'options-active'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px',
  border: '1.5px solid #E5E8EB', borderRadius: 10,
  fontSize: 15, color: '#191F28', background: '#fff', outline: 'none',
}

const backBtnStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 8, background: '#F2F4F6',
  border: '1px solid #E5E8EB', cursor: 'pointer', fontSize: 18, color: '#191F28',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

const Spinner = () => (
  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', verticalAlign: 'middle', marginRight: 8 }} />
)

const PrimaryBtn = ({ label, onClick, disabled, loading }: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean }) => (
  <button onClick={onClick} disabled={disabled || loading} className="pressable" style={{
    width: '100%', padding: '15px', borderRadius: 10,
    background: (disabled || loading) ? '#E5E8EB' : '#3182F6',
    color: (disabled || loading) ? '#B0B8C1' : '#fff',
    fontSize: 16, fontWeight: 700, border: 'none', cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
  }}>
    {loading && <Spinner />}{label}
  </button>
)

const CancelBtn = ({ label, onClick, loading }: { label: string; onClick: () => void; loading?: boolean }) => (
  <button onClick={onClick} disabled={loading} className="pressable" style={{
    width: '100%', padding: '15px', borderRadius: 10,
    background: '#F2F4F6', color: loading ? '#B0B8C1' : '#4E5968',
    fontSize: 16, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
  }}>{label}</button>
)

const StopBtn = ({ label, onClick, loading }: { label: string; onClick: () => void; loading?: boolean }) => (
  <button onClick={onClick} disabled={loading} className="pressable" style={{
    width: '100%', padding: '15px', borderRadius: 10,
    background: loading ? '#F2F4F6' : '#FFF0F2',
    color: loading ? '#B0B8C1' : '#F04452',
    fontSize: 16, fontWeight: 600, border: `1.5px solid ${loading ? '#E5E8EB' : 'rgba(240,68,82,0.25)'}`, cursor: loading ? 'not-allowed' : 'pointer',
  }}>
    {loading && <Spinner />}{label}
  </button>
)

const SL = ({ text }: { text: string }) => (
  <p style={{ fontSize: 13, fontWeight: 600, color: '#8B95A1', letterSpacing: '0.3px', marginBottom: 16 }}>{text}</p>
)
const FL = ({ text }: { text: string }) => (
  <p style={{ fontSize: 14, fontWeight: 600, color: '#191F28', marginBottom: 8 }}>{text}</p>
)
const Err = ({ msg }: { msg: string }) => (
  <p style={{ fontSize: 12, color: '#F04452', marginTop: 6 }}>{msg}</p>
)

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
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const clean = (p: string) => p.replace(/-/g, '')

  const handlePhoneSubmit = () => {
    const c = clean(phone)
    if (!/^01[0-9]{8,9}$/.test(c)) { setError('올바른 휴대폰 번호를 입력해주세요.'); return }
    setError('')
    const user = getUserByPhone(c)
    const req = user ? getRoomRequestByPhone(c) : null

    if (user && req) {
      // active 신청 있음 → PW 확인
      setExistingUser(user)
      setExistingRequest(req)
      setStep('verify-pw')
    } else {
      // DB 없거나 inactive → 신규 취급
      setStep('new-user')
    }
  }

  const handleNewUserSubmit = () => {
    const y = Number(age)
    if (!age || isNaN(y) || y < 1940 || y > 2010) {
      setError('올바른 출생년도를 입력해주세요 (1940–2010).'); return
    }
    setError('')
    const c = clean(phone)
    saveUser({ phone: c, gender, age, password: '', createdAt: new Date().toISOString() })
    sessionStorage.setItem('current_phone', c)
    router.push('/user/form')
  }

  const handleVerifyPw = () => {
    if (!existingUser || verifyPassword !== existingUser.password) {
      setError('비밀번호가 올바르지 않아요.'); return
    }
    setError('')
    setStep('options-active')
  }

  const handleStop = async () => {
    setIsLoading(true)
    const c = clean(phone)
    deactivateRoomRequest(c)
    try {
      await fetch('/api/deactivate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: c }),
      })
    } catch { /**/ }
    setIsLoading(false)
    router.push('/')
  }

  const handleResetAndReapply = async () => {
    setIsLoading(true)
    const c = clean(phone)
    resetUserForReapply(c)
    try {
      await fetch('/api/deactivate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: c }),
      })
    } catch { /**/ }
    setIsLoading(false)
    setShowResetConfirm(false)
    setGender('남성'); setAge(''); setError('')
    setStep('new-user')
  }

  const goToForm = () => {
    sessionStorage.setItem('current_phone', clean(phone))
    router.push('/user/form')
  }

  const card = (children: React.ReactNode) => (
    <div style={{ background: '#fff', padding: '20px', marginTop: 8 }}>{children}</div>
  )

  return (
    <main style={{ minHeight: '100svh', background: '#F2F4F6', maxWidth: 480, margin: '0 auto' }}>

      <header style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
        background: '#fff', borderBottom: '1px solid #F2F4F6',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        {step === 'phone'
          ? <Link href="/"><button style={backBtnStyle}>‹</button></Link>
          : step === 'new-user'
            ? <button style={backBtnStyle} onClick={() => { setStep('phone'); setError('') }}>‹</button>
            : step === 'verify-pw'
              ? <button style={backBtnStyle} onClick={() => { setStep('phone'); setError(''); setVerifyPassword('') }}>‹</button>
              : <button style={backBtnStyle} onClick={() => { setStep('verify-pw'); setVerifyPassword('') }}>‹</button>
        }
        <span style={{ fontSize: 15, fontWeight: 600, color: '#191F28' }}>
          {step === 'phone' ? '방 추천 받기'
            : step === 'new-user' ? '기본 정보 입력'
            : step === 'verify-pw' ? '본인 확인'
            : '내 신청'}
        </span>
      </header>

      {/* ── phone ── */}
      {step === 'phone' && card(<>
        <SL text="전화번호" />
        <FL text="휴대폰 번호" />
        <input type="tel" value={phone}
          onChange={e => setPhone(formatPhone(e.target.value))}
          onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
          placeholder="010-0000-0000" autoComplete="off"
          style={{ ...inputStyle, fontSize: 18, letterSpacing: 1 }}
        />
        {error && <Err msg={error} />}
        <div style={{ marginTop: 20 }}><PrimaryBtn label="확인" onClick={handlePhoneSubmit} /></div>
      </>)}

      {/* ── new-user ── */}
      {step === 'new-user' && card(<>
        <SL text="기본 정보" />
        <p style={{ fontSize: 13, color: '#8B95A1', marginBottom: 20, lineHeight: 1.6 }}>호스트에게 표시되는 정보예요</p>
        <FL text="성별" />
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['남성', '여성'] as Gender[]).map(g => (
            <button key={g} onClick={() => setGender(g)} className="pressable" style={{
              flex: 1, padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer',
              background: gender === g ? '#F0F6FF' : '#fff',
              color: gender === g ? '#3182F6' : '#8B95A1',
              border: `2px solid ${gender === g ? '#3182F6' : '#E5E8EB'}`,
            }}>{g}</button>
          ))}
        </div>
        <FL text="출생년도" />
        <input type="number" value={age} onChange={e => setAge(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleNewUserSubmit()}
          placeholder="예: 1995" min="1940" max="2010" autoComplete="off"
          style={inputStyle}
        />
        {error && <Err msg={error} />}
        <div style={{ marginTop: 20 }}><PrimaryBtn label="다음" onClick={handleNewUserSubmit} /></div>
      </>)}

      {/* ── verify-pw ── */}
      {step === 'verify-pw' && existingUser && existingRequest && card(<>
        <SL text="본인 확인" />
        <p style={{ fontSize: 13, color: '#8B95A1', marginBottom: 16, lineHeight: 1.6 }}>
          신청 중인 방추천이 있어요. 비밀번호를 입력하면 수정하거나 취소할 수 있어요.
        </p>
        <div style={{ background: '#F8FAFF', borderRadius: 10, border: '1.5px solid #D0E2FF', padding: '14px 16px', marginBottom: 20 }}>
          {([
            ['방추천 기간', `${existingRequest.period.recStart} ~ ${existingRequest.period.recEnd}`],
            ['지역', existingRequest.location.gu.join(', ')],
            ['보증금', `${existingRequest.deposit.min}–${existingRequest.deposit.max}만원`],
            ['월세', `${existingRequest.monthlyRent.min}–${existingRequest.monthlyRent.max}만원`],
          ] as [string, string][]).map(([k, v], i, arr) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              paddingBottom: i < arr.length - 1 ? 10 : 0, marginBottom: i < arr.length - 1 ? 10 : 0,
              borderBottom: i < arr.length - 1 ? '1px solid #E5E8EB' : 'none',
            }}>
              <span style={{ fontSize: 13, color: '#8B95A1', minWidth: 70 }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#191F28', textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
        <FL text="비밀번호" />
        <input type="text" value={verifyPassword}
          onChange={e => setVerifyPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleVerifyPw()}
          placeholder="비밀번호 입력" autoComplete="off"
          className="pw-mask" style={inputStyle}
        />
        {error && <Err msg={error} />}
        <button onClick={() => setShowResetConfirm(true)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: '#8B95A1', textDecoration: 'underline', padding: '8px 0', display: 'block',
        }}>비밀번호를 잊었어요</button>
        <div style={{ marginTop: 16 }}><PrimaryBtn label="확인" onClick={handleVerifyPw} /></div>
      </>)}

      {/* ── options-active ── */}
      {step === 'options-active' && card(<>
        <SL text="내 신청" />
        <p style={{ fontSize: 13, color: '#8B95A1', marginBottom: 24, lineHeight: 1.6 }}>
          현재 방추천을 받고 있어요. 어떻게 하시겠어요?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryBtn label="신청 내용 수정하기" onClick={goToForm} loading={isLoading} />
          <StopBtn label="방추천 그만받기" onClick={handleStop} loading={isLoading} />
        </div>
      </>)}

      {/* ── PW 초기화 모달 ── */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50,
        }} onClick={() => !isLoading && setShowResetConfirm(false)}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: 480,
            borderRadius: '20px 20px 0 0', padding: '28px 24px 40px',
            animation: 'slideUp 0.2s ease',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 32, height: 3, borderRadius: 2, background: '#E5E8EB', margin: '0 auto 24px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#191F28', marginBottom: 10 }}>기존 신청을 초기화할까요?</h3>
            <p style={{ fontSize: 15, color: '#8B95A1', lineHeight: 1.6, marginBottom: 8 }}>
              비밀번호와 기존 신청 내용이 모두 삭제돼요.<br />기본 정보부터 다시 입력하게 됩니다.
            </p>
            <p style={{ fontSize: 13, color: '#F04452', marginBottom: 24 }}>※ 이 작업은 되돌릴 수 없어요</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <StopBtn label="초기화하고 새로 신청하기" onClick={handleResetAndReapply} loading={isLoading} />
              <CancelBtn label="취소" onClick={() => setShowResetConfirm(false)} loading={isLoading} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        .pressable:active:not(:disabled) { transform: scale(0.97); opacity: 0.88; transition: transform 0.08s, opacity 0.08s; }
      `}</style>
    </main>
  )
}
