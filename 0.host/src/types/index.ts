export interface Customer {
  phone: string
  gender: '남성' | '여성'
  age: string        // 출생년도
  gu: string         // 희망구 (콤마구분)
  dong: string       // 희망동 (콤마구분)
  depositMin: number
  depositMax: number
  rentMin: number
  rentMax: number
  roomTypes: string
  notes: string
  createdAt: string
}

export interface SendLog {
  hostPhone: string
  hostUserId: string
  branchUrl: string
  dong: string
  gu: string
  customerPhone: string
  customerSnapshot: Omit<Customer, 'phone'>
  message: string
  requestedAt: string
  status: 'requested'
}
