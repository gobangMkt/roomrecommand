'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getRoomRequests, getUserByPhone } from '@/lib/storage'
import { Branch, RoomRequest, UserInfo } from '@/types'

interface CustomerData {
  user: UserInfo
  request: RoomRequest
}

function isMatch(request: RoomRequest, branch: Branch): boolean {
  const locationMatch =
    request.location.dong.includes(branch.dong) ||
    request.location.gu.includes(branch.gu)

  const depositMatch =
    branch.deposit >= request.deposit.min &&
    branch.deposit <= request.deposit.max

  const rentMatch =
    branch.monthlyRent >= request.monthlyRent.min &&
    branch.monthlyRent <= request.monthlyRent.max

  return locationMatch && depositMatch && rentMatch
}

export default function CustomersPage() {
  const router = useRouter()
  const [branch, setBranch] = useState<Branch | null>(null)
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<CustomerData | null>(null)
  const [message, setMessage] = useState('')
  const [sentPhones, setSentPhones] = useState<string[]>([])

  useEffect(() => {
    const raw = sessionStorage.getItem('selected_branch')
    if (!raw) { router.push('/host/branches'); return }
    const b: Branch = JSON.parse(raw)
    setBranch(b)

    const matched: CustomerData[] = []
    for (const req of getRoomRequests().filter(r => r.active)) {
      if (isMatch(req, b)) {
        const user = getUserByPhone(req.phone)
        if (user) matched.push({ user, request: req })
      }
    }
    setCustomers(matched)
    setLoading(false)
  }, [router])

  const handleSend = () => {
    if (!modal) return
    setSentPhones(prev => [...prev, modal.user.phone])
    setModal(null)
    setMessage('')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/host/branches" className="text-gray-500 text-xl hover:text-gray-700">←</Link>
        <div>
          <h1 className="font-bold text-base">{branch?.name}</h1>
          <p className="text-xs text-gray-400">{branch?.gu} {branch?.dong} · 월세 {branch?.monthlyRent}만원</p>
        </div>
      </header>

      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <span className="animate-pulse">매칭 중...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🔍</div>
            <p className="text-gray-600 font-medium">아직 맞춤 고객이 없습니다</p>
            <p className="text-gray-400 text-sm">조건에 맞는 신청자가 생기면 여기에 표시됩니다</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-bold text-blue-600">{customers.length}명</span>의 맞춤 고객이 있습니다
            </p>
            <div className="space-y-4">
              {customers.map((c, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                        {c.user.gender === '남성' ? '남' : '여'}
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-base">{c.user.age}세</span>
                        <span className="text-gray-400 text-sm ml-2">{c.user.gender}</span>
                      </div>
                    </div>
                    {sentPhones.includes(c.user.phone) && (
                      <span className="text-xs bg-green-100 text-green-600 px-2.5 py-1 rounded-full font-medium">전송완료</span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    {[
                      ['기간', `${c.request.period.start} ~ ${c.request.period.end}`],
                      ['지역', c.request.location.dong.length > 0
                        ? c.request.location.dong.slice(0, 3).join(', ') + (c.request.location.dong.length > 3 ? ' 외' : '')
                        : c.request.location.gu.join(', ')],
                      ['보증금', `${c.request.deposit.min}~${c.request.deposit.max}만원`],
                      ['월세', `${c.request.monthlyRent.min}~${c.request.monthlyRent.max}만원`],
                      ['유형', c.request.roomTypes.join(', ')],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-2">
                        <span className="text-gray-400 w-14 shrink-0">{label}</span>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    ))}
                    {c.request.additionalNotes && (
                      <div className="flex gap-2">
                        <span className="text-gray-400 w-14 shrink-0">요청</span>
                        <span className="text-gray-500 italic">{c.request.additionalNotes}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setModal(c)}
                    className="w-full bg-blue-500 text-white rounded-xl py-3 font-medium hover:bg-blue-600 transition-colors text-sm"
                  >
                    연락 보내기
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Contact modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
            {/* AdSense placeholder */}
            <div className="bg-gray-100 rounded-xl p-3 text-center text-xs text-gray-400 border border-dashed border-gray-300">
              📢 Google AdSense 광고 영역
            </div>

            <h3 className="font-bold text-lg">연락 보내기</h3>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-gray-400 mb-1">고객 연락처</p>
              <p className="font-bold text-blue-700 text-xl">{modal.user.phone}</p>
              <p className="text-xs text-gray-400 mt-1">{modal.user.gender} · {modal.user.age}세</p>
            </div>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="메시지를 입력해주세요 (선택사항)"
              rows={3}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => { setModal(null); setMessage('') }}
                className="flex-1 border border-gray-200 rounded-xl py-3 text-gray-500 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSend}
                className="flex-1 bg-blue-500 text-white rounded-xl py-3 font-medium hover:bg-blue-600 transition-colors"
              >
                메시지 전송
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
