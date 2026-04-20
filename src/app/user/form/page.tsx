'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SEOUL_GU_DONG } from '@/lib/seoulData'
import { saveRoomRequest, getRoomRequestByPhone, getUserByPhone, saveUser } from '@/lib/storage'
import { RoomType } from '@/types'

const ALL_ROOM_TYPES: RoomType[] = ['고시·원룸텔', '쉐어하우스', '원투룸', '상관없어요']

const inputStyle: React.CSSProperties = {
  width: '100%', height: 52, borderRadius: 4,
  background: 'var(--elevated)',
  boxShadow: 'var(--inset)',
  border: 'none', padding: '0 16px',
  fontSize: 15, color: 'var(--text)', outline: 'none',
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
    letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10,
  }}>{children}</p>
)

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 28 }}>
    <p style={{
      fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
      letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12,
    }}>{title}</p>
    {children}
  </div>
)

const Chip = ({ label, active, onClick, disabled }: {
  label: string; active: boolean; onClick: () => void; disabled?: boolean
}) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: '7px 14px', borderRadius: 9999, fontSize: 13, fontWeight: 700,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    background: active ? 'var(--green)' : 'var(--elevated)',
    color: active ? '#000' : disabled ? '#555' : 'var(--text-sub)',
    letterSpacing: '.3px', transition: 'all .15s',
  }}>{label}</button>
)

const NumberInput = ({ label, value, onChange, step = 10 }: {
  label: string; value: string; onChange: (v: string) => void; step?: number
}) => (
  <div style={{ flex: 1 }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
    <div style={{ position: 'relative' }}>
      <input
        type="number" value={value} onChange={e => onChange(e.target.value)} min="0" step={step}
        autoComplete="off"
        style={{ ...inputStyle, paddingRight: 44 }}
      />
      <span style={{
        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
        fontSize: 13, color: 'var(--text-sub)', pointerEvents: 'none',
      }}>만원</span>
    </div>
  </div>
)

const UndecidedToggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 10 }}
    onClick={onChange}>
    <div style={{
      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
      border: `2px solid ${checked ? 'var(--green)' : 'var(--border)'}`,
      background: checked ? 'var(--green)' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all .15s',
    }}>
      {checked && <span style={{ color: '#000', fontSize: 11, fontWeight: 700 }}>✓</span>}
    </div>
    <span style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}>아직 정하지 않았어요</span>
  </label>
)

const ErrorMsg = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ fontSize: 13, color: 'var(--error)', marginTop: 8 }}>{msg}</p> : null

export default function UserFormPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  // 방추천 받고 싶은 기간
  const [recStart, setRecStart] = useState('')
  const [recEnd, setRecEnd] = useState('')
  const [recUndecided, setRecUndecided] = useState(false)
  // 입주 희망 기간
  const [moveInStart, setMoveInStart] = useState('')
  const [moveInEnd, setMoveInEnd] = useState('')
  const [moveInUndecided, setMoveInUndecided] = useState(false)

  const [selectedGu, setSelectedGu] = useState<string[]>([])
  const [selectedDong, setSelectedDong] = useState<string[]>([])
  const [depositMin, setDepositMin] = useState('0')
  const [depositMax, setDepositMax] = useState('500')
  const [rentMin, setRentMin] = useState('0')
  const [rentMax, setRentMax] = useState('100')
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('current_phone')
    if (!saved) { router.push('/user'); return }
    setPhone(saved)
    const existing = getRoomRequestByPhone(saved)
    if (existing) {
      setRecStart(existing.period.recStart ?? ''); setRecEnd(existing.period.recEnd ?? '')
      setRecUndecided(existing.period.recUndecided ?? false)
      setMoveInStart(existing.period.moveInStart ?? ''); setMoveInEnd(existing.period.moveInEnd ?? '')
      setMoveInUndecided(existing.period.moveInUndecided ?? false)
      setSelectedGu(existing.location.gu); setSelectedDong(existing.location.dong)
      setDepositMin(String(existing.deposit.min)); setDepositMax(String(existing.deposit.max))
      setRentMin(String(existing.monthlyRent.min)); setRentMax(String(existing.monthlyRent.max))
      setRoomTypes(existing.roomTypes); setAdditionalNotes(existing.additionalNotes)
    }
  }, [router])

  const toggleGu = (gu: string) => {
    if (selectedGu.includes(gu)) {
      setSelectedGu(selectedGu.filter(g => g !== gu))
      setSelectedDong(selectedDong.filter(d => !(SEOUL_GU_DONG[gu] || []).includes(d)))
    } else {
      if (selectedGu.length >= 2) return
      setSelectedGu([...selectedGu, gu])
    }
  }

  const toggleDong = (dong: string) =>
    setSelectedDong(prev => prev.includes(dong) ? prev.filter(d => d !== dong) : [...prev, dong])

  const toggleAllDong = (gu: string) => {
    const guDong = SEOUL_GU_DONG[gu] || []
    const allSelected = guDong.every(d => selectedDong.includes(d))
    if (allSelected) {
      setSelectedDong(selectedDong.filter(d => !guDong.includes(d)))
    } else {
      const next = [...selectedDong]; guDong.forEach(d => { if (!next.includes(d)) next.push(d) }); setSelectedDong(next)
    }
  }

  const toggleRoomType = (type: RoomType) => {
    if (type === '상관없어요') {
      setRoomTypes(prev => prev.includes('상관없어요') ? [] : ['상관없어요']); return
    }
    setRoomTypes(prev => {
      const w = prev.filter(t => t !== '상관없어요')
      return w.includes(type) ? w.filter(t => t !== type) : [...w, type]
    })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    const recValid = (recStart && recEnd) || recUndecided
    const moveInValid = (moveInStart && moveInEnd) || moveInUndecided
    if (!recValid) e.recPeriod = '기간을 선택하거나 "아직 정하지 않았어요"를 체크해주세요.'
    if (!moveInValid) e.moveInPeriod = '기간을 선택하거나 "아직 정하지 않았어요"를 체크해주세요.'
    if (recStart && recEnd && recStart >= recEnd) e.recPeriod = '종료일은 시작일 이후여야 합니다.'
    if (moveInStart && moveInEnd && moveInStart >= moveInEnd) e.moveInPeriod = '종료일은 시작일 이후여야 합니다.'
    if (selectedGu.length === 0) e.location = '구를 1개 이상 선택해주세요.'
    if (Number(depositMin) > Number(depositMax)) e.deposit = '최솟값이 최댓값보다 클 수 없어요.'
    if (Number(rentMin) > Number(rentMax)) e.rent = '최솟값이 최댓값보다 클 수 없어요.'
    if (roomTypes.length === 0) e.roomTypes = '방 유형을 1개 이상 선택해주세요.'
    if (!agreed) e.agreed = '유의사항에 동의해주세요.'
    setErrors(e); return Object.keys(e).length === 0
  }

  const doSave = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    const req = {
      phone,
      period: { recStart, recEnd, recUndecided, moveInStart, moveInEnd, moveInUndecided },
      location: { gu: selectedGu, dong: selectedDong },
      deposit: { min: Number(depositMin), max: Number(depositMax) },
      monthlyRent: { min: Number(rentMin), max: Number(rentMax) },
      roomTypes, additionalNotes, active: true, createdAt: new Date().toISOString(),
    }
    saveRoomRequest(req)
    const user = getUserByPhone(phone)
    try {
      await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone, gender: user?.gender ?? '', age: user?.age ?? '',
          recStart, recEnd, recUndecided,
          moveInStart, moveInEnd, moveInUndecided,
          gu: selectedGu.join(', '), dong: selectedDong.join(', '),
          depositMin: Number(depositMin), depositMax: Number(depositMax),
          rentMin: Number(rentMin), rentMax: Number(rentMax),
          roomTypes: roomTypes.join(', '), additionalNotes,
        }),
      })
    } catch { /* 로컬은 저장됨 */ }
    router.push('/user/complete')
  }

  const handleSubmit = () => {
    if (isSubmitting) return
    if (!validate()) return
    const user = getUserByPhone(phone)
    if (!user?.password) setShowPasswordModal(true)
    else doSave()
  }

  const handlePasswordConfirm = async () => {
    if (isSubmitting) return
    if (newPassword.length < 4) { setPasswordError('비밀번호는 4자리 이상 입력해주세요.'); return }
    if (newPassword !== confirmPassword) { setPasswordError('비밀번호가 일치하지 않아요.'); return }
    const user = getUserByPhone(phone)
    if (user) saveUser({ ...user, password: newPassword })
    await doSave()
  }

  const divider = <div style={{ height: 1, background: 'var(--elevated)', margin: '24px 0' }} />

  const dateInputBase: React.CSSProperties = {
    ...inputStyle, fontSize: 14,
  }

  return (
    <main style={{ minHeight: '100svh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* 헤더 */}
      <header style={{
        display: 'flex', alignItems: 'center', padding: '12px 8px',
        background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1px solid var(--elevated)',
      }}>
        <Link href="/user">
          <button style={{
            width: 40, height: 40, borderRadius: '50%', background: 'var(--elevated)',
            border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>‹</button>
        </Link>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginLeft: 12, letterSpacing: '.3px' }}>방추천 조건 입력</span>
      </header>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, padding: '24px 24px 120px', maxWidth: 480, width: '100%', margin: '0 auto' }}>

        {/* 기간 */}
        <Section title="기간">
          {/* 방추천 받고 싶은 기간 */}
          <div style={{
            background: 'var(--surface)', borderRadius: 8, padding: '16px',
            marginBottom: 12, boxShadow: 'var(--shadow-medium)',
          }}>
            <Label>방추천 받고 싶은 기간</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, opacity: recUndecided ? 0.35 : 1, transition: 'opacity .15s' }}>
              {[
                { label: '시작일', val: recStart, set: setRecStart },
                { label: '종료일', val: recEnd, set: setRecEnd },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
                  <input type="date" value={val} onChange={e => set(e.target.value)}
                    disabled={recUndecided} style={dateInputBase} />
                </div>
              ))}
            </div>
            <UndecidedToggle checked={recUndecided} onChange={() => { setRecUndecided(v => !v); setRecStart(''); setRecEnd('') }} />
            <ErrorMsg msg={errors.recPeriod} />
          </div>

          {/* 입주 희망 기간 */}
          <div style={{
            background: 'var(--surface)', borderRadius: 8, padding: '16px',
            boxShadow: 'var(--shadow-medium)',
          }}>
            <Label>입주 희망 기간</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, opacity: moveInUndecided ? 0.35 : 1, transition: 'opacity .15s' }}>
              {[
                { label: '시작일', val: moveInStart, set: setMoveInStart },
                { label: '종료일', val: moveInEnd, set: setMoveInEnd },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
                  <input type="date" value={val} onChange={e => set(e.target.value)}
                    disabled={moveInUndecided} style={dateInputBase} />
                </div>
              ))}
            </div>
            <UndecidedToggle checked={moveInUndecided} onChange={() => { setMoveInUndecided(v => !v); setMoveInStart(''); setMoveInEnd('') }} />
            <ErrorMsg msg={errors.moveInPeriod} />
          </div>
        </Section>

        {divider}

        {/* 위치 */}
        <Section title="위치 — 구 최대 2개">
          <Label>구 선택</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.keys(SEOUL_GU_DONG).map(gu => (
              <Chip key={gu} label={gu} active={selectedGu.includes(gu)}
                onClick={() => toggleGu(gu)}
                disabled={!selectedGu.includes(gu) && selectedGu.length >= 2} />
            ))}
          </div>
          <ErrorMsg msg={errors.location} />

          {selectedGu.map(gu => (
            <div key={gu} style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--elevated)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Label>{gu} 동 선택</Label>
                <button onClick={() => toggleAllDong(gu)} style={{
                  background: 'none', border: 'none', fontSize: 12, color: 'var(--green)',
                  cursor: 'pointer', fontWeight: 700, letterSpacing: '.5px',
                }}>
                  {(SEOUL_GU_DONG[gu] || []).every(d => selectedDong.includes(d)) ? '전체해제' : '전체선택'}
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(SEOUL_GU_DONG[gu] || []).map(dong => (
                  <Chip key={dong} label={dong} active={selectedDong.includes(dong)} onClick={() => toggleDong(dong)} />
                ))}
              </div>
            </div>
          ))}
        </Section>

        {divider}

        {/* 보증금 */}
        <Section title="보증금">
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <NumberInput label="최소" value={depositMin} onChange={setDepositMin} step={10} />
            <span style={{ color: 'var(--text-sub)', fontSize: 20, paddingBottom: 14 }}>–</span>
            <NumberInput label="최대" value={depositMax} onChange={setDepositMax} step={10} />
          </div>
          <ErrorMsg msg={errors.deposit} />
        </Section>

        {divider}

        {/* 월세 */}
        <Section title="월세">
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <NumberInput label="최소" value={rentMin} onChange={setRentMin} step={5} />
            <span style={{ color: 'var(--text-sub)', fontSize: 20, paddingBottom: 14 }}>–</span>
            <NumberInput label="최대" value={rentMax} onChange={setRentMax} step={5} />
          </div>
          <ErrorMsg msg={errors.rent} />
        </Section>

        {divider}

        {/* 매물 유형 */}
        <Section title="매물 유형">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_ROOM_TYPES.map(type => (
              <Chip key={type} label={type} active={roomTypes.includes(type)} onClick={() => toggleRoomType(type)} />
            ))}
          </div>
          <ErrorMsg msg={errors.roomTypes} />
        </Section>

        {divider}

        {/* 추가 요청사항 */}
        <Section title="추가 요청사항 (선택)">
          <textarea
            value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)}
            placeholder="추가로 원하는 조건을 자유롭게 입력해주세요"
            rows={3}
            style={{
              width: '100%', borderRadius: 4, padding: '14px 16px',
              background: 'var(--elevated)', boxShadow: 'var(--inset)',
              border: 'none', fontSize: 15, color: 'var(--text)',
              resize: 'none', outline: 'none', lineHeight: 1.6,
            }}
          />
        </Section>

        {divider}

        {/* 유의사항 */}
        <Section title="유의사항">
          <ul style={{ listStyle: 'none', marginBottom: 20 }}>
            {[
              '입력하신 개인정보는 방추천 목적으로만 사용됩니다',
              '호스트가 직접 연락할 수 있도록 연락처가 제공됩니다',
              '허위 정보 입력 시 서비스 이용이 제한될 수 있습니다',
              '신청 내용은 언제든지 수정하거나 취소할 수 있습니다',
            ].map(text => (
              <li key={text} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: 12, marginTop: 2 }}>•</span>
                <span style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>{text}</span>
              </li>
            ))}
          </ul>

          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => setAgreed(!agreed)}>
            <div style={{
              width: 22, height: 22, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${agreed ? 'var(--green)' : 'var(--border)'}`,
              background: agreed ? 'var(--green)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
            }}>
              {agreed && <span style={{ color: '#000', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
              위 유의사항을 확인하고 동의합니다
            </span>
          </label>
          <ErrorMsg msg={errors.agreed} />
        </Section>

      </div>

      {/* 하단 고정 버튼 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg)', borderTop: '1px solid var(--elevated)',
        padding: '12px 24px 28px',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <button onClick={handleSubmit} disabled={isSubmitting} style={{
            width: '100%', height: 56, borderRadius: 9999,
            background: agreed ? 'var(--green)' : 'var(--elevated)',
            color: agreed ? '#000' : 'var(--text-sub)',
            fontSize: 16, fontWeight: 700, border: 'none',
            cursor: agreed && !isSubmitting ? 'pointer' : 'not-allowed',
            letterSpacing: '1.4px', textTransform: 'uppercase', transition: 'all .15s',
          }}>
            {isSubmitting ? '저장 중...' : '신청하기'}
          </button>
        </div>
      </div>

      {/* 비밀번호 모달 */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'flex-end', zIndex: 50,
        }} onClick={() => setShowPasswordModal(false)}>
          <div style={{
            background: 'var(--surface)', width: '100%', maxWidth: 480, margin: '0 auto',
            borderRadius: '16px 16px 0 0', padding: '28px 24px 40px',
            boxShadow: 'var(--shadow-heavy)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 28px' }} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              비밀번호 설정
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 24 }}>
              나중에 신청 내용을 수정하거나 취소할 때 사용돼요
            </p>
            {/* hidden fake field to prevent Chrome password manager from triggering */}
            <input type="text" style={{ display: 'none' }} autoComplete="username" readOnly />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                { val: newPassword, set: setNewPassword, placeholder: '비밀번호 (4자리 이상)' },
                { val: confirmPassword, set: setConfirmPassword, placeholder: '비밀번호 확인' },
              ].map(({ val, set, placeholder }) => (
                <input key={placeholder} type="password" value={val}
                  onChange={e => set(e.target.value)} placeholder={placeholder}
                  autoComplete="new-password"
                  style={inputStyle}
                />
              ))}
              {passwordError && <p style={{ fontSize: 13, color: 'var(--error)' }}>{passwordError}</p>}
            </div>
            <button onClick={handlePasswordConfirm} disabled={isSubmitting} style={{
              width: '100%', height: 56, borderRadius: 9999,
              background: 'var(--green)', color: '#000',
              fontSize: 16, fontWeight: 700, border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              letterSpacing: '1.4px', textTransform: 'uppercase',
            }}>{isSubmitting ? '저장 중...' : '완료'}</button>
          </div>
        </div>
      )}
    </main>
  )
}
