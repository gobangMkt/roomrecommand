import { Branch } from '@/types'

export const MOCK_HOSTS = [
  { phone: '01012341234', userId: 'host001' },
  { phone: '01056785678', userId: 'host002' },
  { phone: '01099990000', userId: 'host003' },
]

const MOCK_BRANCHES: Record<string, Branch[]> = {
  host001: [
    { id: 'b1', name: '고방 역삼점', url: 'https://gobang.kr/room/1', gu: '강남구', dong: '역삼동', deposit: 0, monthlyRent: 50 },
    { id: 'b2', name: '고방 반포점', url: 'https://gobang.kr/room/2', gu: '서초구', dong: '반포동', deposit: 100, monthlyRent: 70 },
  ],
  host002: [
    { id: 'b3', name: '고방 합정점', url: 'https://gobang.kr/room/3', gu: '마포구', dong: '합정동', deposit: 0, monthlyRent: 45 },
    { id: 'b4', name: '고방 홍대점', url: 'https://gobang.kr/room/4', gu: '마포구', dong: '서교동', deposit: 50, monthlyRent: 55 },
  ],
  host003: [
    { id: 'b5', name: '고방 신림점', url: 'https://gobang.kr/room/5', gu: '관악구', dong: '신림동', deposit: 0, monthlyRent: 35 },
    { id: 'b6', name: '고방 상계점', url: 'https://gobang.kr/room/6', gu: '노원구', dong: '상계동', deposit: 0, monthlyRent: 40 },
  ],
}

export function getHostBranches(userId: string): Branch[] {
  return MOCK_BRANCHES[userId] || []
}
