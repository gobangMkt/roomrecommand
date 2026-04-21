// 호스트별 전송완료 고객 phone 목록을 localStorage에 저장
const sentKey = (hostPhone: string) => `host_sent_${hostPhone.replace(/[^0-9]/g, '')}`

export function getSentPhones(hostPhone: string): string[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(sentKey(hostPhone))
  return raw ? JSON.parse(raw) : []
}

export function addSentPhone(hostPhone: string, customerPhone: string): void {
  const list = getSentPhones(hostPhone)
  if (!list.includes(customerPhone)) {
    localStorage.setItem(sentKey(hostPhone), JSON.stringify([...list, customerPhone]))
  }
}
