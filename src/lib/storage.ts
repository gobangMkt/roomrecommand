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

export function getRoomRequestByPhone(phone: string): RoomRequest | null {
  return getRoomRequests().find(r => r.phone === phone && r.active) || null
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
