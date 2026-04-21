import { UserInfo, RoomRequest } from '@/types'

const USERS_KEY = 'room_users'
const REQUESTS_KEY = 'room_requests'

export function getUsers(): UserInfo[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(USERS_KEY)
  return data ? JSON.parse(data) : []
}

export function getUserByPhone(phone: string): UserInfo | null {
  return getUsers().find(u => u.phone === phone) || null
}

export function saveUser(user: UserInfo): void {
  const users = getUsers().filter(u => u.phone !== user.phone)
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]))
}

export function getRoomRequests(): RoomRequest[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(REQUESTS_KEY)
  return data ? JSON.parse(data) : []
}

function isExpired(req: RoomRequest): boolean {
  if (req.period.recUndecided || !req.period.recEnd) return false
  const today = new Date().toISOString().split('T')[0]
  return req.period.recEnd < today
}

export function getRoomRequestByPhone(phone: string): RoomRequest | null {
  const req = getRoomRequests().find(r => r.phone === phone && r.active)
  if (!req) return null
  if (isExpired(req)) {
    deactivateRoomRequest(phone)
    return null
  }
  return req
}

export function saveRoomRequest(request: RoomRequest): void {
  const requests = getRoomRequests().filter(r => r.phone !== request.phone)
  localStorage.setItem(REQUESTS_KEY, JSON.stringify([...requests, request]))
}

export function deactivateRoomRequest(phone: string): void {
  const requests = getRoomRequests().map(r =>
    r.phone === phone ? { ...r, active: false } : r
  )
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
}

export function deleteUser(phone: string): void {
  const users = getUsers().filter(u => u.phone !== phone)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// 유저·신청 완전 삭제 → 재접속 시 완전 신규로 처음부터
export function resetUserForReapply(phone: string): void {
  deactivateRoomRequest(phone)
  deleteUser(phone)
}
