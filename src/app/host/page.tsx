'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MOCK_HOSTS } from '@/lib/mockData'

export default function HostPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const cleaned = phone.replace(/-/g, '')
    const host = MOCK_HOSTS.find(h => h.phone === cleaned && h.userId === userId)
    if (!host) {
      setError('입력하신 정보와 일치하는 계정이 없습니다.')
      return
    }
    sessionStorage.setItem('host_userId', userId)
    router.push('/host/branches')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-gray-500 text-xl hover:text-gray-700">←</Link>
        <h1 className="font-bold text-lg">호스트 로그인</h1>
      </header>

      <div className="flex-1 p-6 max-w-md mx-auto w-full space-y-6 mt-4">
        <div>
          <h2 className="text-xl font-bold mb-1">호스트 정보를 입력해주세요</h2>
          <p className="text-gray-400 text-sm">U사장님 계정으로 로그인합니다</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">휴대폰 번호</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">U사장님 ID</label>
            <input
              type="text"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="아이디를 입력해주세요"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white rounded-xl py-4 font-bold text-lg hover:bg-blue-600 transition-colors"
        >
          로그인
        </button>

        <div className="bg-blue-50 rounded-xl p-4 text-center text-xs text-gray-500 border border-blue-100">
          <p className="font-semibold text-blue-600 mb-2">테스트 계정</p>
          <p>전화번호: 01012341234 / ID: host001</p>
          <p>전화번호: 01056785678 / ID: host002</p>
          <p>전화번호: 01099990000 / ID: host003</p>
        </div>
      </div>
    </main>
  )
}
