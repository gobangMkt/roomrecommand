'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SEOUL_GU_DONG } from '@/lib/seoulData'
import { saveRoomRequest, getRoomRequestByPhone, getUserByPhone, saveUser } from '@/lib/storage'
import { RoomType } from '@/types'

const ALL_ROOM_TYPES: RoomType[] = ['고시·원룸텔', '쉐어하우스', '원투룸', '상관없어요']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px',
  border: '1.5px solid #E5E8EB', borderRadius: 10,
  fontSize: 15, color: '#191F28', background: '#fff', outline: 'none',
  transition: 'border-color .15s',
}

// 섹션 제목 + 필수(*)
const SL = ({ label, required }: { label: string; required?: boolean }) => (
  <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 14 }}>
    {label}{required && <span style={{ color: '#F04452', marginLeft: 3 }}>*</span>}
  </p>
)

// 필드 레이블
const FL = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 14, fontWeight: 600, color: '#191F28', marginBottom: 8 }}>{children}</p>
)

// 안내 박스 (굵게 강조 지원 — 자식으로 JSX 넘김)
const Notice = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: '#F8FAFF', borderRadius: 10,
    border: '1.5px solid #D0E2FF', padding: '12px 14px', marginBottom: 16,
  }}>
    <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.65 }}>{children}</p>
  </div>
)

// 설명보기 토글
const DescToggle = ({ text }: { text: React.ReactNode }) => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <button onClick={() => setOpen(v => !v)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 13, color: '#3182F6', padding: '0 0 4px',
        textDecoration: 'underline', textUnderlineOffset: 2,
      }}>
        {open ? '설명 닫기' : '설명 보기'}
      </button>
      {open && (
        <div style={{ marginTop: 8 }}>
          <Notice>{text}</Notice>
        </div>
      )}
    </div>
  )
}

// 에러 메시지
const Err = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ fontSize: 12, color: '#F04452', marginTop: 8 }}>{msg}</p> : null

// 칩 버튼
const Chip = ({ label, active, onClick, disabled }: {
  label: string; active: boolean; onClick: () => void; disabled?: boolean
}) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: '9px 15px', borderRadius: 10, fontSize: 14, fontWeight: active ? 600 : 400,
    cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all .15s',
    background: active ? '#F0F6FF' : '#fff',
    color: active ? '#3182F6' : disabled ? '#B0B8C1' : '#8B95A1',
    border: `2px solid ${active ? '#3182F6' : disabled ? '#E5E8EB' : '#E5E8EB'}`,
  }}>{label}</button>
)

const NumInput = ({ label, value, onChange, step = 10 }: {
  label: string; value: string; onChange: (v: string) => void; step?: number
}) => (
  <div style={{ flex: 1 }}>
    <FL>{label}</FL>
    <div style={{ position: 'relative' }}>
      <input type="number" value={value} onChange={e => onChange(e.target.value)}
        min="0" step={step} autoComplete="off"
        style={{ ...inputStyle, paddingRight: 42 }} />
      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#8B95A1', pointerEvents: 'none' }}>만원</span>
    </div>
  </div>
)

const Card = ({ children, refProp }: { children: React.ReactNode; refProp?: React.Ref<HTMLDivElement> }) => (
  <div ref={refProp} style={{ background: '#fff', padding: '20px 20px 16px', marginTop: 8 }}>
    {children}
  </div>
)

export default function UserFormPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [recStart, setRecStart] = useState('')
  const [recEnd, setRecEnd] = useState('')
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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const recRef = useRef<HTMLDivElement>(null)
  const moveInRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)
  const depositRef = useRef<HTMLDivElement>(null)
  const rentRef = useRef<HTMLDivElement>(null)
  const roomTypesRef = useRef<HTMLDivElement>(null)
  const agreedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('current_phone')
    if (!saved) { router.push('/user'); return }
    setPhone(saved)
    const existing = getRoomRequestByPhone(saved)
    if (existing) {
      setRecStart(existing.period.recStart ?? ''); setRecEnd(existing.period.recEnd ?? '')
      setMoveInStart(existing.period.moveInStart ?? ''); setMoveInEnd(existing.period.moveInEnd ?? '')
      setMoveInUndecided(existing.period.moveInUndecided ?? false)
      setSelectedGu(existing.location.gu); setSelectedDong(existing.location.dong)
      setDepositMin(String(existing.deposit.min)); setDepositMax(String(existing.deposit.max))
      setRentMin(String(existing.monthlyRent.min)); setRentMax(String(existing.monthlyRent.max))
      setRoomTypes(existing.roomTypes); setAdditionalNotes(existing.additionalNotes)
    }
  }, [router])

  const isFormComplete = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    if (!recStart || !recEnd || recStart >= recEnd || recEnd <= today) return false
    if (!((moveInStart && moveInEnd && moveInStart < moveInEnd) || moveInUndecided)) return false
    if (selectedGu.length === 0) return false
    if (selectedGu.some(gu => !(SEOUL_GU_DONG[gu] || []).some(d => selectedDong.includes(d)))) return false
    if (Number(depositMin) > Number(depositMax)) return false
    if (Number(rentMin) > Number(rentMax)) return false
    if (roomTypes.length === 0) return false
    if (!agreed) return false
    return true
  }, [recStart, recEnd, moveInStart, moveInEnd, moveInUndecided, selectedGu, depositMin, depositMax, rentMin, rentMax, roomTypes, agreed])

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
    if (allSelected) setSelectedDong(selectedDong.filter(d => !guDong.includes(d)))
    else { const next = [...selectedDong]; guDong.forEach(d => { if (!next.includes(d)) next.push(d) }); setSelectedDong(next) }
  }
  const toggleRoomType = (type: RoomType) => {
    if (type === '상관없어요') { setRoomTypes(prev => prev.includes('상관없어요') ? [] : ['상관없어요']); return }
    setRoomTypes(prev => { const w = prev.filter(t => t !== '상관없어요'); return w.includes(type) ? w.filter(t => t !== type) : [...w, type] })
  }

  const computeErrors = () => {
    const e: Record<string, string> = {}
    const today = new Date().toISOString().split('T')[0]
    if (!recStart || !recEnd) e.rec = '방추천 받고 싶은 기간을 입력해주세요.'
    else if (recStart >= recEnd) e.rec = '종료일은 시작일 이후여야 해요.'
    else if (recEnd <= today) e.rec = '종료일은 오늘 이후여야 해요.'
    if (!((moveInStart && moveInEnd) || moveInUndecided)) e.moveIn = '입주 희망 기간을 선택하거나 "아직 정하지 않았어요"를 체크해주세요.'
    if (moveInStart && moveInEnd && moveInStart >= moveInEnd) e.moveIn = '종료일은 시작일 이후여야 해요.'
    if (selectedGu.length === 0) e.location = '구를 1개 이상 선택해주세요.'
    else if (selectedGu.some(gu => !(SEOUL_GU_DONG[gu] || []).some(d => selectedDong.includes(d)))) e.location = '선택한 구마다 동을 1개 이상 선택해주세요.'
    if (Number(depositMin) > Number(depositMax)) e.deposit = '최솟값이 최댓값보다 클 수 없어요.'
    if (Number(rentMin) > Number(rentMax)) e.rent = '최솟값이 최댓값보다 클 수 없어요.'
    if (roomTypes.length === 0) e.roomTypes = '방 유형을 1개 이상 선택해주세요.'
    if (!agreed) e.agreed = '유의사항에 동의해주세요.'
    return e
  }

  const doSave = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    const req = {
      phone,
      period: { recStart, recEnd, recUndecided: false, moveInStart, moveInEnd, moveInUndecided },
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
          recStart, recEnd, moveInStart, moveInEnd, moveInUndecided,
          gu: selectedGu.join(', '), dong: selectedDong.join(', '),
          depositMin: Number(depositMin), depositMax: Number(depositMax),
          rentMin: Number(rentMin), rentMax: Number(rentMax),
          roomTypes: roomTypes.join(', '), additionalNotes,
        }),
      })
    } catch { /**/ }
    router.push('/user/complete')
  }

  const handleSubmit = () => {
    if (isSubmitting) return
    const e = computeErrors()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      const order: [string, React.RefObject<HTMLDivElement>][] = [
        ['rec', recRef], ['moveIn', moveInRef], ['location', locationRef],
        ['deposit', depositRef], ['rent', rentRef], ['roomTypes', roomTypesRef], ['agreed', agreedRef],
      ]
      for (const [key, ref] of order) {
        if (e[key] && ref.current) { ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); break }
      }
      return
    }
    const user = getUserByPhone(phone)
    if (!user?.password) setShowPasswordModal(true)
    else setShowConfirmModal(true)
  }

  const handlePasswordConfirm = () => {
    if (newPassword.length < 4) { setPasswordError('비밀번호는 4자리 이상 입력해주세요.'); return }
    if (newPassword !== confirmPassword) { setPasswordError('비밀번호가 일치하지 않아요.'); return }
    const user = getUserByPhone(phone)
    if (user) saveUser({ ...user, password: newPassword })
    setShowPasswordModal(false); setShowConfirmModal(true)
  }

  const modalBg: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50,
  }
  const sheet: React.CSSProperties = {
    background: '#fff', width: '100%', maxWidth: 480,
    borderRadius: '20px 20px 0 0', padding: '28px 24px 40px',
    animation: 'slideUp 0.2s ease',
  }
  const handle = <div style={{ width: 32, height: 3, borderRadius: 2, background: '#E5E8EB', margin: '0 auto 24px' }} />

  return (
    <main style={{ minHeight: '100svh', background: '#F2F4F6', maxWidth: 480, margin: '0 auto', paddingBottom: 90 }}>

      <header style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
        background: '#fff', borderBottom: '1px solid #F2F4F6',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link href="/user">
          <button style={{ width: 36, height: 36, borderRadius: 8, background: '#F2F4F6', border: '1px solid #E5E8EB', cursor: 'pointer', fontSize: 18, color: '#191F28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        </Link>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#191F28' }}>방추천 조건 입력</span>
      </header>

      {/* 방추천 기간 */}
      <Card refProp={recRef}>
        <SL label="방추천 받고 싶은 기간" required />
        <Notice>
          종료일이 지나면 신청이 <strong>자동으로 만료</strong>돼요. 기간 내에 호스트가 연락드려요.
        </Notice>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {([['시작일', recStart, setRecStart], ['종료일', recEnd, setRecEnd]] as [string, string, (v: string) => void][]).map(([label, val, set]) => (
            <div key={label}>
              <FL>{label}</FL>
              <input type="date" value={val} onChange={e => set(e.target.value)} style={{ ...inputStyle, fontSize: 14 }} />
            </div>
          ))}
        </div>
        <Err msg={errors.rec} />
      </Card>

      {/* 입주 희망 기간 */}
      <Card refProp={moveInRef}>
        <SL label="입주 희망 기간" required />
        <Notice>실제 입주 희망 시기를 입력하면 더 <strong>적합한 방</strong>을 추천받을 수 있어요.</Notice>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, opacity: moveInUndecided ? 0.35 : 1 }}>
          {([['시작일', moveInStart, setMoveInStart], ['종료일', moveInEnd, setMoveInEnd]] as [string, string, (v: string) => void][]).map(([label, val, set]) => (
            <div key={label}>
              <FL>{label}</FL>
              <input type="date" value={val} onChange={e => set(e.target.value)} disabled={moveInUndecided} style={{ ...inputStyle, fontSize: 14 }} />
            </div>
          ))}
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 14 }}
          onClick={() => { setMoveInUndecided(v => !v); setMoveInStart(''); setMoveInEnd('') }}>
          <div style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
            border: `2px solid ${moveInUndecided ? '#3182F6' : '#E5E8EB'}`,
            background: moveInUndecided ? '#3182F6' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
          }}>
            {moveInUndecided && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14, color: '#8B95A1' }}>아직 정하지 않았어요</span>
        </label>
        <Err msg={errors.moveIn} />
      </Card>

      {/* 위치 */}
      <Card refProp={locationRef}>
        <SL label="위치" required />
        <Notice>구는 <strong>최대 2개</strong>까지, 구 선택 후 <strong>동을 반드시 선택</strong>해주세요.</Notice>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.keys(SEOUL_GU_DONG).map(gu => (
            <Chip key={gu} label={gu} active={selectedGu.includes(gu)}
              onClick={() => toggleGu(gu)}
              disabled={!selectedGu.includes(gu) && selectedGu.length >= 2} />
          ))}
        </div>
        <Err msg={errors.location} />
        {selectedGu.map(gu => (
          <div key={gu} style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #E5E8EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <FL>{gu} 동 선택</FL>
              <button onClick={() => toggleAllDong(gu)} style={{ background: 'none', border: 'none', fontSize: 13, color: '#3182F6', cursor: 'pointer', fontWeight: 600 }}>
                {(SEOUL_GU_DONG[gu] || []).every(d => selectedDong.includes(d)) ? '전체해제' : '전체선택'}
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(SEOUL_GU_DONG[gu] || []).map(dong => (
                <Chip key={dong} label={dong} active={selectedDong.includes(dong)} onClick={() => toggleDong(dong)} />
              ))}
            </div>
          </div>
        ))}
      </Card>

      {/* 보증금 */}
      <Card refProp={depositRef}>
        <SL label="보증금" required />
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <NumInput label="최소" value={depositMin} onChange={setDepositMin} step={10} />
          <span style={{ color: '#8B95A1', fontSize: 18, paddingBottom: 14 }}>–</span>
          <NumInput label="최대" value={depositMax} onChange={setDepositMax} step={10} />
        </div>
        <Err msg={errors.deposit} />
      </Card>

      {/* 월세 */}
      <Card refProp={rentRef}>
        <SL label="월세" required />
        <Notice>관리비는 별도 기준이에요. 범위가 <strong>넓을수록 더 많은 매물</strong>을 받아볼 수 있어요.</Notice>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <NumInput label="최소" value={rentMin} onChange={setRentMin} step={5} />
          <span style={{ color: '#8B95A1', fontSize: 18, paddingBottom: 14 }}>–</span>
          <NumInput label="최대" value={rentMax} onChange={setRentMax} step={5} />
        </div>
        <Err msg={errors.rent} />
      </Card>

      {/* 매물 유형 */}
      <Card refProp={roomTypesRef}>
        <SL label="매물 유형" required />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
          {ALL_ROOM_TYPES.map(type => (
            <Chip key={type} label={type} active={roomTypes.includes(type)} onClick={() => toggleRoomType(type)} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#8B95A1', marginTop: 8 }}>&#39;상관없어요&#39; 선택 시 모든 유형 포함</p>
        <Err msg={errors.roomTypes} />
      </Card>

      {/* 추가 요청사항 */}
      <Card>
        <SL label="추가 요청사항" />
        <textarea
          value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)}
          placeholder="반려동물·성별 제한·층수 등 자유롭게 입력해주세요"
          rows={3}
          style={{
            width: '100%', borderRadius: 10, padding: '14px 16px',
            background: '#fff', border: '1.5px solid #E5E8EB',
            fontSize: 15, color: '#191F28', resize: 'none', outline: 'none', lineHeight: 1.6,
          }}
        />
      </Card>

      {/* 유의사항 */}
      <Card refProp={agreedRef}>
        <SL label="유의사항" />
        <div style={{ background: '#F8FAFF', borderRadius: 10, border: '1.5px solid #D0E2FF', padding: '14px 16px', marginBottom: 20 }}>
          {[
            '입력하신 개인정보는 방추천 목적으로만 사용됩니다',
            '호스트가 직접 연락할 수 있도록 연락처가 제공됩니다',
            '신청 내용은 언제든지 수정하거나 취소할 수 있습니다',
            '방추천 기간 만료 시 자동으로 종료됩니다',
          ].map((text, i, arr) => (
            <p key={text} style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.6, display: 'flex', gap: 8, marginBottom: i < arr.length - 1 ? 8 : 0 }}>
              <span style={{ color: '#3182F6', fontWeight: 700, flexShrink: 0 }}>·</span>{text}
            </p>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => setAgreed(!agreed)}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            border: `2px solid ${agreed ? '#3182F6' : '#E5E8EB'}`,
            background: agreed ? '#3182F6' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
          }}>
            {agreed && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#191F28' }}>위 유의사항을 확인하고 동의합니다</span>
        </label>
        <Err msg={errors.agreed} />
      </Card>

      {/* 하단 고정 버튼 — 동의 체크 시 활성화 */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: '#fff', borderTop: '1px solid #F2F4F6',
        padding: '12px 20px 16px',
      }}>
        <button onClick={handleSubmit} disabled={!agreed || isSubmitting} style={{
          width: '100%', padding: '15px', borderRadius: 10,
          background: agreed && !isSubmitting ? '#3182F6' : '#E5E8EB',
          color: agreed && !isSubmitting ? '#fff' : '#B0B8C1',
          fontSize: 16, fontWeight: 700, border: 'none',
          cursor: agreed && !isSubmitting ? 'pointer' : 'not-allowed',
          transition: 'background .15s, color .15s',
        }}>
          {isSubmitting ? '저장 중...' : '신청하기'}
        </button>
      </div>

      {/* 비밀번호 설정 모달 */}
      {showPasswordModal && (
        <div style={modalBg} onClick={() => setShowPasswordModal(false)}>
          <div style={sheet} onClick={e => e.stopPropagation()}>
            {handle}
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#191F28', marginBottom: 6 }}>비밀번호 설정</h3>
            <p style={{ fontSize: 15, color: '#8B95A1', marginBottom: 20, lineHeight: 1.6 }}>나중에 수정하거나 취소할 때 사용해요</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                { val: newPassword, set: setNewPassword, placeholder: '비밀번호 (4자리 이상)' },
                { val: confirmPassword, set: setConfirmPassword, placeholder: '비밀번호 확인' },
              ].map(({ val, set, placeholder }) => (
                <input key={placeholder} type="text" value={val}
                  onChange={e => set(e.target.value)} placeholder={placeholder}
                  autoComplete="off" className="pw-mask" style={inputStyle} />
              ))}
              {passwordError && <p style={{ fontSize: 12, color: '#F04452' }}>{passwordError}</p>}
            </div>
            <button onClick={handlePasswordConfirm} style={{
              width: '100%', padding: '15px', borderRadius: 10,
              background: '#3182F6', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
            }}>다음</button>
          </div>
        </div>
      )}

      {/* 신청 확인 모달 */}
      {showConfirmModal && (
        <div style={modalBg} onClick={() => setShowConfirmModal(false)}>
          <div style={sheet} onClick={e => e.stopPropagation()}>
            {handle}
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#191F28', marginBottom: 6 }}>이 조건으로 신청할까요?</h3>
            <p style={{ fontSize: 15, color: '#8B95A1', marginBottom: 16, lineHeight: 1.6 }}>신청 후에도 언제든 수정할 수 있어요</p>
            <div style={{ background: '#F8FAFF', borderRadius: 10, border: '1.5px solid #E5E8EB', padding: '14px 16px', marginBottom: 20 }}>
              {([
                ['방추천 기간', `${recStart} ~ ${recEnd}`],
                ['지역', selectedGu.join(', ') || '—'],
                ['보증금', `${depositMin}–${depositMax}만원`],
                ['월세', `${rentMin}–${rentMax}만원`],
                ['유형', roomTypes.join(', ') || '—'],
              ] as [string, string][]).map(([k, v], i, arr) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: i < arr.length - 1 ? 10 : 0, marginBottom: i < arr.length - 1 ? 10 : 0,
                  borderBottom: i < arr.length - 1 ? '1px solid #E5E8EB' : 'none',
                }}>
                  <span style={{ fontSize: 13, color: '#8B95A1', minWidth: 70 }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#191F28', maxWidth: '60%', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={doSave} disabled={isSubmitting} style={{
                width: '100%', padding: '15px', borderRadius: 10,
                background: '#3182F6', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
              }}>{isSubmitting ? '저장 중...' : '신청하기'}</button>
              <button onClick={() => setShowConfirmModal(false)} style={{
                width: '100%', padding: '15px', borderRadius: 10,
                background: '#F2F4F6', color: '#4E5968', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer',
              }}>다시 확인하기</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
    </main>
  )
}
