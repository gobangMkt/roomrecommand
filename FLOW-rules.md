# 방추천 앱 — 사용자 흐름 및 DB 규칙

> 이 문서는 확정된 UX 흐름과 DB 정책을 기술합니다.
> 기능 수정 시 반드시 이 문서를 먼저 참조하세요.

---

## 1. 전화번호 기반 사용자 구분

```
전화번호 입력
├── DB에 없음  → 신규 사용자 → 기본정보 입력
└── DB에 있음
    ├── active 신청 있음  → 재방문 사용자 → PW 확인
    └── active 신청 없음 → 신규 사용자 취급 (inactive = 신규)
```

**핵심 규칙:**
- PW를 묻는 조건은 **"DB에 있음 + active 신청 있음"** 딱 하나
- inactive 상태의 기존 유저는 **신규 취급** — PW 묻지 않고 기본정보 입력부터

---

## 2. 신규 사용자 흐름

```
전화번호 입력 → 기본정보(성별·출생년도) → 조건 폼 → 완료(PW 설정) → DB active 저장
```

- 기본정보 저장: `saveUser({ phone, gender, age, password: '' })`
- 조건 저장 + GAS 전송: form 페이지의 `doSave()`
- PW 설정: 폼 제출 시 최초 1회, 비밀번호 모달에서 입력
- 저장 후 상태: **active**

---

## 3. 재방문 사용자 흐름 (active 신청 있음)

```
전화번호 입력 → PW 확인 → 옵션 선택
                              ├── 수정하기 → 폼 (기존 데이터 prefill) → 저장 (기존 inactive, 신규 active)
                              └── 그만받기 → 기존 신청 inactive → 홈
```

- **"새로 등록"은 없음** — inactive 후 재신청은 동일 번호로 다시 시작 = 신규 취급
- 수정하기: form 페이지가 `saveRoomRequest`로 같은 번호 기존 레코드 덮어씀 + GAS도 같은 번호 기존 행 inactive 후 신규 추가

---

## 4. PW 초기화 흐름

```
PW 분실 → "비밀번호를 잊었어요" → 초기화 확인 모달 → 초기화 실행
→ 유저 레코드 삭제 + 신청 inactive → 기본정보 입력부터 (신규 흐름)
```

- `resetUserForReapply(phone)`: 유저 레코드 삭제 + 신청 deactivate
- GAS에도 deactivate 요청 전송
- 초기화 후: `new-user` 스텝으로 이동 (성별·출생년도 재입력)

---

## 5. DB 불변 규칙

| 규칙 | 설명 |
|------|------|
| **전화번호당 active 1개** | 새 신청 저장 시 기존 동일 번호 행 전부 inactive 처리 후 신규 추가 |
| **만료 자동 비활성화** | `recEnd < 오늘` 이면 `getRoomRequestByPhone` 호출 시 자동 inactive 처리 후 null 반환 |
| **inactive = 신규 취급** | PW 확인 없이 처음부터 재시작 |

---

## 6. GAS (Google Apps Script) 규칙

- **신규/수정 제출**: 같은 번호의 기존 active 행 전부 inactive → 신규 행 추가 (active)
- **그만받기**: `/api/deactivate` → GAS `action: 'deactivate'` → 해당 번호 행 inactive
- **전화번호 저장 형식**: `formatPhone()` 사용 → `010-XXXX-XXXX`
- **전화번호 비교**: `cleanPhone()` (숫자만 추출) 으로 비교
- **코드 수정 후 반드시 재배포**: 배포관리 → 연필 → 새 버전 → 배포

---

## 7. UI / UX 규칙

### 버튼
- 클릭 시 press 모션: `.pressable:active { transform: scale(0.97); opacity: 0.88 }`
- 비동기 작업(그만받기, 초기화 등) 시 **로딩 스피너 + 버튼 비활성화**
- disabled 버튼: `#E5E8EB` 배경, `#B0B8C1` 텍스트

### 경고 문구
- 박스형 에러 배너 대신 **인라인 텍스트**: `※ 이 작업은 되돌릴 수 없어요`
- 에러 색상: `#F04452`

### 입력 + 버튼 위치
- 짧은 폼(전화번호, 기본정보, PW 확인): **버튼을 카드 안에 포함** — 입력과 버튼 사이 빈 공간 금지
- 긴 폼(조건 입력): **하단 고정 바텀바** (`position: fixed; bottom: 0; padding-bottom: 16px`)

### PW 관련
- 모든 비밀번호 input: `autoComplete="off"` (Chrome 비밀번호 저장/유출경고 방지)
- `type="password"` 필드에 `autoComplete="new-password"` 금지

---

## 8. 스텝 정의 (user/page.tsx)

| Step | 조건 | 내용 |
|------|------|------|
| `phone` | 초기 | 전화번호 입력 |
| `new-user` | DB 없음 or inactive | 성별·출생년도 입력 |
| `verify-pw` | DB 있음 + active | PW 입력, 기존 신청 요약 표시 |
| `options-active` | PW 통과 | 수정하기 / 그만받기 |
