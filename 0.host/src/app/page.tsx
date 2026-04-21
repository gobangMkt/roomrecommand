'use client'

import { useState, useEffect } from 'react'
import { Customer } from '@/types'
import { getSentPhones, addSentPhone } from '@/lib/storage'
import { SEOUL_GU_DONG, dongToGu } from '@/lib/seoulData'

type Step = 'input' | 'crawling' | 'manual-dong' | 'customers'

const ALL_DONGS = Object.values(SEOUL_GU_DONG).flat().sort()

// ─── 공통 스타일 ───
const card = { background: '#fff', borderRadius: 16, padding: '20px 20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', border: '1.5px solid #E5E8EB',
  borderRadius: 10, fontSize: 15, color: '#191F28', background: '#fff', outline: 'none',
  boxSizing: 'border-box',
}
const primaryBtn = (disabled?: boolean): React.CSSProperties => ({
  width: '100%', padding: '16px', borderRadius: 12, fontSize: 16, fontWeight: 700,
  border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all .15s',
  background: disabled ? '#E5E8EB' : '#3182F6', color: disabled ? '#B0B8C1' : '#fff',
})

function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, fontWeight: 600, color: '#191F28', marginBottom: 8 }}>{children}</p>
}

function calcAge(birthYear: string): string {
  const y = parseInt(birthYear)
  if (isNaN(y)) return birthYear
  return `${new Date().getFullYear() - y + 1}세`
}

// ─── 메인 ───
export default function HostPage() {
  const [step, setStep] = useState<Step>('input')

  // 입력값
  const [phone, setPhone] = useState('')
  const [branchUrl, setBranchUrl] = useState('')
  const [userId, setUserId] = useState('')
  const [inputErr, setInputErr] = useState('')

  // 크롤 결과
  const [crawlErr, setCrawlErr] = useState('')
  const [dong, setDong] = useState('')
  const [gu, setGu] = useState('')

  // 수동 동 입력
  const [manualDong, setManualDong] = useState('')
  const [dongQuery, setDongQuery] = useState('')
  const [dongErr, setDongErr] = useState('')

  // 고객 목록
  const [customers, setCustomers] = useState<Customer[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [listErr, setListErr] = useState('')
  const [sentPhones, setSentPhones] = useState<string[]>([])

  // 연락하기 모달
  const [modal, setModal] = useState<Customer | null>(null)
  const [message, setMessage] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending, setSending] = useState(false)

  // 알림받기
  const [notifyDone, setNotifyDone] = useState(false)

  useEffect(() => {
    if (step === 'customers') {
      setSentPhones(getSentPhones(phone))
    }
  }, [step, phone])

  // ─── 전화번호 포맷 ───
  const cleanPhone = (p: string) => p.replace(/[^0-9]/g, '')
  function formatPhone(p: string): string {
    const d = cleanPhone(p)
    if (d.length <= 3) return d
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`
  }
  const isValidPhone = cleanPhone(phone).length === 11
  const isValidUrl = branchUrl.startsWith('https://gobang.kr/') || branchUrl.startsWith('http://gobang.kr/')
  const isValidUserId = userId.trim().length > 0
  const canSubmit = isValidPhone && isValidUrl && isValidUserId

  // ─── 유저 목록보기 → 크롤링 ───
  async function handleLookup() {
    if (!canSubmit) { setInputErr('모든 항목을 올바르게 입력해주세요.'); return }
    setInputErr('')
    setStep('crawling')
    setCrawlErr('')

    const res = await fetch(`/api/crawl?url=${encodeURIComponent(branchUrl)}`)
    const data = await res.json()

    if (data.dong && data.gu) {
      setDong(data.dong)
      setGu(data.gu)
      await loadCustomers(data.gu)
    } else {
      setCrawlErr(data.error || '크롤링 실패')
      setStep('manual-dong')
    }
  }

  // ─── 수동 동 확인 ───
  async function handleManualDong() {
    const selected = manualDong.trim()
    if (!selected) { setDongErr('동을 선택해주세요.'); return }
    const guResult = dongToGu(selected)
    if (!guResult) { setDongErr('해당하는 구를 찾을 수 없습니다.'); return }
    setDong(selected)
    setGu(guResult)
    setDongErr('')
    await loadCustomers(guResult)
  }

  // ─── 고객 목록 조회 ───
  async function loadCustomers(targetGu: string) {
    setListLoading(true)
    setListErr('')
    setStep('customers')
    const res = await fetch(`/api/customers?gu=${encodeURIComponent(targetGu)}`)
    const data = await res.json()
    if (data.customers) {
      setCustomers(data.customers)
    } else {
      setListErr(data.error || '조회 실패')
    }
    setListLoading(false)
  }

  // ─── 전송요청 확정 ───
  async function handleConfirmSend() {
    if (!modal) return
    setSending(true)
    await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostPhone: phone,
        hostUserId: userId,
        branchUrl,
        dong,
        gu,
        customerPhone: modal.phone,
        customerSnapshot: { ...modal, phone: undefined },
        message,
        requestedAt: new Date().toISOString(),
        status: 'requested',
      }),
    })
    addSentPhone(phone, modal.phone)
    setSentPhones(getSentPhones(phone))
    setSending(false)
    setConfirmOpen(false)
    setModal(null)
    setMessage('')
  }

  // ─── 렌더 ───
  return (
    <main style={{ minHeight: '100svh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #F0F2F4', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        {step !== 'input' && (
          <button
            onClick={() => { setStep('input'); setCustomers([]); setListErr('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#8B95A1', padding: 0, lineHeight: 1 }}
          >←</button>
        )}
        <h1 style={{ fontWeight: 700, fontSize: 17, color: '#191F28', margin: 0 }}>
          {step === 'input' && '호스트 고객 조회'}
          {step === 'crawling' && '지점 정보 확인 중...'}
          {step === 'manual-dong' && '동 직접 입력'}
          {step === 'customers' && `${gu} 맞춤 고객`}
        </h1>
      </header>

      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* ─── STEP: input ─── */}
        {step === 'input' && (
          <div style={card}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#191F28', marginBottom: 4 }}>지점 정보를 입력해주세요</p>
            <p style={{ fontSize: 13, color: '#8B95A1', marginBottom: 24 }}>인증 없이 고객 리스트를 조회할 수 있습니다</p>

            <div style={{ marginBottom: 16 }}>
              <Label>휴대폰 번호</Label>
              <input
                type="tel" value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="010-0000-0000"
                maxLength={13}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Label>운영 중인 지점 URL</Label>
              <input
                type="url" value={branchUrl}
                onChange={e => setBranchUrl(e.target.value)}
                placeholder="https://gobang.kr/place/xxxxx"
                style={inputStyle}
              />
              <p style={{ fontSize: 12, color: '#8B95A1', marginTop: 6 }}>고방 지점 페이지 URL을 입력하면 동 정보를 자동으로 추출합니다</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Label>U사장님 ID</Label>
              <input
                type="text" value={userId}
                onChange={e => setUserId(e.target.value)}
                placeholder="아이디를 입력해주세요"
                style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
              />
            </div>

            {inputErr && <p style={{ fontSize: 13, color: '#F04452', marginBottom: 12 }}>※ {inputErr}</p>}

            <button onClick={handleLookup} disabled={!canSubmit} style={primaryBtn(!canSubmit)}>
              유저 목록보기
            </button>
          </div>
        )}

        {/* ─── STEP: crawling ─── */}
        {step === 'crawling' && (
          <div style={{ ...card, textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
            <p style={{ fontWeight: 600, color: '#191F28', fontSize: 16, marginBottom: 8 }}>지점 URL에서 동 정보를 추출하고 있습니다</p>
            <p style={{ fontSize: 13, color: '#8B95A1' }}>잠시만 기다려주세요...</p>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, border: '3px solid #E5E8EB', borderTop: '3px solid #3182F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          </div>
        )}

        {/* ─── STEP: manual-dong ─── */}
        {step === 'manual-dong' && (
          <div style={card}>
            {crawlErr && (
              <div style={{ background: '#FFF5F5', border: '1.5px solid #FFD6D6', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: '#F04452', margin: 0 }}>※ {crawlErr}</p>
              </div>
            )}
            <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 4 }}>지점 동을 직접 입력해주세요</p>
            <p style={{ fontSize: 13, color: '#8B95A1', marginBottom: 20 }}>해당 동의 구 기준으로 고객을 매칭합니다</p>

            <Label>동 검색</Label>
            <input
              type="text" value={dongQuery}
              onChange={e => { setDongQuery(e.target.value); setManualDong('') }}
              placeholder="동 이름 검색 (예: 역삼동)"
              style={{ ...inputStyle, marginBottom: 8 }}
            />

            {dongQuery && (
              <div style={{ border: '1.5px solid #E5E8EB', borderRadius: 10, maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
                {ALL_DONGS.filter(d => d.includes(dongQuery)).slice(0, 20).map(d => (
                  <button
                    key={d}
                    onClick={() => { setManualDong(d); setDongQuery(d) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px',
                      border: 'none', borderBottom: '1px solid #F0F2F4', background: manualDong === d ? '#F0F6FF' : '#fff',
                      color: manualDong === d ? '#3182F6' : '#191F28', fontSize: 14, cursor: 'pointer',
                    }}
                  >{d}</button>
                ))}
                {ALL_DONGS.filter(d => d.includes(dongQuery)).length === 0 && (
                  <p style={{ padding: '12px 16px', color: '#8B95A1', fontSize: 13 }}>검색 결과 없음</p>
                )}
              </div>
            )}

            {manualDong && (
              <div style={{ background: '#F0F6FF', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#3182F6', fontWeight: 600 }}>선택: {manualDong}</span>
                <span style={{ fontSize: 12, color: '#8B95A1' }}>({dongToGu(manualDong)})</span>
              </div>
            )}

            {dongErr && <p style={{ fontSize: 13, color: '#F04452', marginBottom: 12 }}>※ {dongErr}</p>}

            <button
              onClick={handleManualDong}
              disabled={!manualDong}
              style={primaryBtn(!manualDong)}
            >
              고객 목록 보기
            </button>
          </div>
        )}

        {/* ─── STEP: customers ─── */}
        {step === 'customers' && (
          <>
            <div style={{ background: '#F0F6FF', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#3182F6' }}>📍</span>
              <span style={{ fontSize: 13, color: '#3182F6', fontWeight: 600 }}>{dong} ({gu}) 기준 맞춤 고객</span>
            </div>

            {listLoading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#8B95A1' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #E5E8EB', borderTop: '3px solid #3182F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ fontSize: 14 }}>고객 정보를 불러오는 중...</p>
              </div>
            )}

            {listErr && !listLoading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: '#F04452', fontSize: 14 }}>※ {listErr}</p>
              </div>
            )}

            {!listLoading && !listErr && customers.length === 0 && (
              <div style={{ ...card, textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p style={{ fontWeight: 700, color: '#191F28', fontSize: 16, marginBottom: 6 }}>아직 맞춤 고객이 없습니다</p>
                <p style={{ fontSize: 13, color: '#8B95A1', marginBottom: 24 }}>
                  {gu}에 새 고객이 생기면 알림을 드릴게요
                </p>
                {notifyDone ? (
                  <p style={{ fontSize: 14, color: '#3182F6', fontWeight: 600 }}>✓ 알림 신청이 완료되었습니다</p>
                ) : (
                  <button
                    onClick={() => setNotifyDone(true)}
                    style={{ padding: '13px 32px', borderRadius: 12, border: '2px solid #3182F6', background: '#fff', color: '#3182F6', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                  >
                    알림받기
                  </button>
                )}
              </div>
            )}

            {!listLoading && customers.length > 0 && (
              <>
                <p style={{ fontSize: 13, color: '#8B95A1', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, color: '#3182F6' }}>{customers.length}명</span>의 맞춤 고객
                </p>
                {customers.map((c, i) => {
                  const sent = sentPhones.includes(c.phone)
                  return (
                    <div key={i} style={{ ...card, opacity: sent ? 0.6 : 1 }}>
                      {/* 헤더 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 44, height: 44, background: c.gender === '남성' ? '#EEF3FF' : '#FFF0F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: c.gender === '남성' ? '#3182F6' : '#F06292' }}>
                            {c.gender === '남성' ? '남' : '여'}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#191F28', fontSize: 16 }}>{calcAge(c.age)}</span>
                            <span style={{ color: '#8B95A1', fontSize: 13, marginLeft: 6 }}>{c.gender}</span>
                          </div>
                        </div>
                        {sent && (
                          <span style={{ fontSize: 12, background: '#E8F5E9', color: '#43A047', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>전송완료</span>
                        )}
                      </div>

                      {/* 정보 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        {[
                          ['희망동', c.dong || c.gu],
                          ['보증금', `${c.depositMin}~${c.depositMax}만원`],
                          ['월세', `${c.rentMin}~${c.rentMax}만원`],
                          ['유형', c.roomTypes],
                        ].map(([label, value]) => value && (
                          <div key={label} style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 13, color: '#8B95A1', width: 52, flexShrink: 0 }}>{label}</span>
                            <span style={{ fontSize: 13, color: '#191F28' }}>{value}</span>
                          </div>
                        ))}
                        {c.notes && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 13, color: '#8B95A1', width: 52, flexShrink: 0 }}>요청</span>
                            <span style={{ fontSize: 13, color: '#555', fontStyle: 'italic' }}>{c.notes}</span>
                          </div>
                        )}
                      </div>

                      <button
                        disabled={sent}
                        onClick={() => { setModal(c); setMessage('') }}
                        style={{
                          width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                          border: 'none', cursor: sent ? 'not-allowed' : 'pointer',
                          background: sent ? '#E5E8EB' : '#3182F6',
                          color: sent ? '#B0B8C1' : '#fff',
                          transition: 'all .15s',
                        }}
                      >
                        {sent ? '이미 연락함' : '연락하기'}
                      </button>
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}
      </div>

      {/* ─── 연락하기 모달 ─── */}
      {modal && !confirmOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}
          onClick={() => { setModal(null); setMessage('') }}
        >
          <div
            style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, margin: '0 auto', padding: '24px 20px 32px', boxSizing: 'border-box' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, background: '#E5E8EB', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ fontWeight: 700, fontSize: 17, color: '#191F28', marginBottom: 4 }}>연락하기</h3>
            <p style={{ fontSize: 13, color: '#8B95A1', marginBottom: 20 }}>
              {modal.gender} · {calcAge(modal.age)} · {modal.dong || modal.gu}
            </p>

            <div style={{ marginBottom: 16 }}>
              <Label>보낼 메시지</Label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="고객에게 보낼 메시지를 입력해주세요&#10;(예: 안녕하세요, 조건에 맞는 방이 있어 연락드립니다.)"
                rows={4}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ background: '#FFF9E6', border: '1.5px solid #FFE082', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: '#7A6000', margin: 0 }}>
                전송 후 내부에서 고객에게 알림톡이 발송됩니다. 전송 요청 후에는 취소할 수 없습니다.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setModal(null); setMessage('') }}
                style={{ flex: 1, padding: '14px', borderRadius: 10, border: '1.5px solid #E5E8EB', background: '#fff', color: '#8B95A1', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
              >취소</button>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={!message.trim()}
                style={{ flex: 2, padding: '14px', borderRadius: 10, border: 'none', background: !message.trim() ? '#E5E8EB' : '#3182F6', color: !message.trim() ? '#B0B8C1' : '#fff', fontWeight: 700, fontSize: 15, cursor: !message.trim() ? 'not-allowed' : 'pointer' }}
              >전송 요청</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 전송 컨펌 모달 ─── */}
      {confirmOpen && modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '0 20px' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', maxWidth: 360, width: '100%', boxSizing: 'border-box' }}>
            <p style={{ fontWeight: 700, fontSize: 17, color: '#191F28', marginBottom: 8 }}>정말 전송하시겠어요?</p>
            <p style={{ fontSize: 13, color: '#8B95A1', marginBottom: 6 }}>메시지 미리보기:</p>
            <div style={{ background: '#F7F8FA', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
              <p style={{ fontSize: 14, color: '#191F28', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{message}</p>
            </div>
            <p style={{ fontSize: 12, color: '#F04452', marginBottom: 20 }}>※ 이 작업은 되돌릴 수 없어요</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{ flex: 1, padding: '14px', borderRadius: 10, border: '1.5px solid #E5E8EB', background: '#fff', color: '#8B95A1', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
              >취소</button>
              <button
                onClick={handleConfirmSend}
                disabled={sending}
                style={{ flex: 2, padding: '14px', borderRadius: 10, border: 'none', background: sending ? '#E5E8EB' : '#3182F6', color: sending ? '#B0B8C1' : '#fff', fontWeight: 700, fontSize: 15, cursor: sending ? 'not-allowed' : 'pointer' }}
              >
                {sending ? '전송 중...' : '확인, 전송요청'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        button:active:not(:disabled) { transform: scale(0.97); opacity: 0.88; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </main>
  )
}
