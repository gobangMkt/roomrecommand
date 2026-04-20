'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getHostBranches } from '@/lib/mockData'
import { Branch } from '@/types'

export default function BranchesPage() {
  const router = useRouter()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = sessionStorage.getItem('host_userId')
    if (!userId) { router.push('/host'); return }
    setBranches(getHostBranches(userId))
    setLoading(false)
  }, [router])

  const handleSelect = (branch: Branch) => {
    sessionStorage.setItem('selected_branch', JSON.stringify(branch))
    router.push('/host/customers')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href="/host" className="text-gray-500 text-xl hover:text-gray-700">←</Link>
        <h1 className="font-bold text-lg">운영 중인 지점</h1>
      </header>

      <div className="flex-1 p-4 max-w-md mx-auto w-full mt-2">
        <p className="text-sm text-gray-400 mb-4">지점을 선택하면 맞춤 고객을 확인할 수 있습니다</p>

        {loading ? (
          <div className="text-center py-10 text-gray-400">로딩 중...</div>
        ) : branches.length === 0 ? (
          <div className="text-center py-10 text-gray-400">등록된 지점이 없습니다</div>
        ) : (
          <div className="space-y-3">
            {branches.map(branch => (
              <button
                key={branch.id}
                onClick={() => handleSelect(branch)}
                className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left border-2 border-transparent hover:border-blue-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">{branch.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{branch.gu} {branch.dong}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">보증금 {branch.deposit}만원</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">월세 {branch.monthlyRent}만원</span>
                    </div>
                  </div>
                  <span className="text-blue-400 text-xl">→</span>
                </div>
                <p className="text-xs text-blue-300 mt-3 truncate">{branch.url}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
