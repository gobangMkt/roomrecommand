# Design System — Neoflat Mobile Form

네오플랫 내부 폼 앱 디자인 시스템. 블로그 신청 앱(index.html)에서 추출.
모바일 우선, 풀-스크린 섹션 카드, 파란색 액션 기반 한국형 UX.

---

## 1. Visual Theme & Atmosphere

밝고 깔끔한 라이트 테마. 회색 배경(`#F2F4F6`) 위에 흰 섹션 카드가 8px 간격으로 쌓이는 구조.
Spotify(다크), Stripe(네이비)와 달리 **토스/당근마켓 계열의 한국형 모바일 UX**.
섹션은 좌우 여백 없이 풀-위드로 붙고, 내부 패딩으로만 여백을 표현한다.
파란색(`#3182F6`)이 유일한 액션 컬러. 초록(`#00C73C`) = 성공, 빨강(`#F04452`) = 에러.

**Key Characteristics:**
- 회색 페이지 배경 + 흰 섹션 카드 (8px 간격 스택)
- 섹션 카드는 좌우 마진 없이 풀-위드
- 입력 필드: 10px radius, 1.5px border, focus 시 파란 테두리
- 버튼: 10px radius, 전체 너비, 높이 충분(padding 15px)
- 섹션 레이블: 13px 회색 캡션 스타일 (필드명 위 그룹 레이블)
- 필드 레이블: 14px 다크 볼드 (개별 입력 항목 레이블)
- 공지/안내: 파란 tint 박스 (#F8FAFF + #D0E2FF 테두리)
- 바텀시트 모달: 20px 상단 라운드, slideUp 애니메이션

---

## 2. Color Palette

### Background & Surface
- **Page BG**: `#F2F4F6` — 섹션 사이 회색 배경
- **Surface (Card)**: `#FFFFFF` — 섹션 카드, 입력 필드, 모달
- **Elevated**: `#F8FAFF` — 공지 박스, 요약 카드, 선택된 카드 배경 내부

### Primary & Action
- **Blue**: `#3182F6` — 주 액션 버튼, 포커스 테두리, 링크, 선택 상태
- **Blue Hover**: `#1B6CF2` — 버튼 hover
- **Blue Light BG**: `#EEF3FF` — 키워드 active 배경, 성공 아이콘 배경
- **Blue Selected Card**: `#F0F6FF` — 선택된 카드 배경

### Text
- **Text Primary**: `#191F28` — 헤딩, 필드 레이블, 중요 텍스트
- **Text Secondary**: `#8B95A1` — 섹션 레이블, 플레이스홀더, 부가 설명
- **Text Body**: `#4A5568` — 공지 본문, 약관 텍스트
- **Text Muted**: `#B0B8C1` — 비활성 플레이스홀더, 글자 수 카운터

### Status
- **Valid Green**: `#00C73C` — 유효한 입력 테두리, 성공 피드백
- **Valid BG**: `#E8FBF0` — 키워드 valid 번호 배경
- **Error Red**: `#F04452` — 에러 테두리, 에러 피드백
- **Error BG**: `#FFF0F2` — 에러 배너, 키워드 invalid 번호 배경
- **Urgent Text**: `#D92B2B` — 긴급 안내 텍스트

### Border
- **Border Default**: `#E5E8EB` — 입력 기본, 카드 구분선
- **Border Blue**: `#D0E2FF` — 공지 박스 테두리, 동의 카드 테두리
- **Border Focus**: `#3182F6` — 포커스/선택 상태
- **Border Valid**: `#00C73C`
- **Border Error**: `#F04452`
- **Border Header**: `#F2F4F6` — 헤더/바텀바 구분선 (거의 안 보임)

### Button States
- **Disabled BG**: `#E5E8EB`
- **Disabled Text**: `#B0B8C1`
- **Cancel BG**: `#F2F4F6`
- **Cancel Text**: `#4E5968`

---

## 3. Typography

**Font**: `Pretendard` (variable) — 시스템 폰트 fallback: `-apple-system, BlinkMacSystemFont`

| Role | Size | Weight | Color | Notes |
|------|------|--------|-------|-------|
| Page Title (H1) | 20px | 700 | #191F28 | 헤더 타이틀 |
| Page Subtitle | 14px | 400 | #8B95A1 | 헤더 부제목 |
| Section Label | 13px | 600 | #8B95A1 | 섹션 그룹 레이블, letter-spacing 0.3px |
| Field Label | 14px | 600 | #191F28 | 개별 입력 항목 레이블 |
| Input Text | 15px | 400 | #191F28 | 입력값 |
| Input Placeholder | 15px | 400 | #B0B8C1 | — |
| Body Text | 14px | 400 | #4A5568 | 공지, 약관 line-height 1.6 |
| Feedback | 12px | 400 | status color | 입력 유효성 피드백 |
| Char Count | 12px | 400 | #B0B8C1 | 글자 수 카운터 |
| Button Primary | 16px | 700 | #ffffff | — |
| Button Cancel | 16px | 600 | #4E5968 | — |
| Modal Title | 20px | 700 | #191F28 | — |
| Modal Desc | 15px | 400 | #8B95A1 | line-height 1.6 |
| Tag/Badge | 11px | 700 | — | 카드 타입 태그 |
| OG Host | 11px | 400 | #B0B8C1 | — |
| OG Title | 14px | 600 | #191F28 | — |
| OG Desc | 12px | 400 | #8B95A1 | 2줄 clamp |

---

## 4. Component Styles

### Page Layout
```
background: #F2F4F6
max-width: 480px, margin: 0 auto
padding-bottom: 90px (바텀바 여백)
```

### Header
```
background: #fff
padding: 20px 20px 0
border-bottom: 1px solid #F2F4F6
H1: 20px/700/#191F28
subtitle: 14px/#8B95A1, margin-top 4px
```

### Section Card
```
background: #fff
margin-top: 8px  ← 섹션 간 회색 갭의 핵심
padding: 20px 20px 16px
/* 좌우 마진 없이 풀-위드 */
```

### Section Label (그룹 레이블)
```
font-size: 13px
font-weight: 600
color: #8B95A1
margin-bottom: 16px
letter-spacing: 0.3px
```

### Field Label (개별 항목)
```
font-size: 14px
font-weight: 600
color: #191F28
margin-bottom: 8px
```

### Input / Textarea
```
width: 100%
padding: 14px 16px
border: 1.5px solid #E5E8EB
border-radius: 10px
font-size: 15px
color: #191F28
background: #fff
outline: none
transition: border-color 0.15s

:focus  → border-color: #3182F6
.valid  → border-color: #00C73C
.invalid → border-color: #F04452
::placeholder → color: #B0B8C1

textarea: resize: none, height: 100px, line-height: 1.6
```

### Notice / Info Box (공지 카드)
```
background: #F8FAFF
border: 1.5px solid #D0E2FF
border-radius: 10px
padding: 14px 16px

li: font-size 14px, color #4A5568, line-height 1.6
li::before: '·' 파란색 (#3182F6), font-weight 700
```

### Feedback Text
```
font-size: 12px
margin-top: 6px
min-height: 16px

.ok      → color: #00C73C
.error   → color: #F04452
.checking → color: #8B95A1
```

### Primary Button
```
width: 100%
padding: 15px
background: #3182F6
color: #fff
border: none
border-radius: 10px
font-size: 16px
font-weight: 700
cursor: pointer
transition: background 0.15s

:hover → background: #1B6CF2
:disabled → background: #E5E8EB, color: #B0B8C1, cursor: not-allowed
```

### Cancel / Secondary Button
```
width: 100%
padding: 15px
background: #F2F4F6
color: #4E5968
border: none
border-radius: 10px
font-size: 16px
font-weight: 600
```

### Bottom Bar (하단 고정 CTA) — 모든 페이지 공통
```
position: fixed; bottom: 0
left: 50%; transform: translateX(-50%)   ← max-width 컨테이너 중앙 정렬 필수
width: 100%; max-width: 480px
padding: 12px 20px 16px
background: #fff
border-top: 1px solid #F2F4F6

/* 본문 컨테이너에 반드시 padding-bottom: 90px 설정 */
/* CTA가 있는 모든 페이지(홈, 폼, 완료 등)에 동일 패턴 적용 */
/* flex spacer로 bottom에 붙이는 방식 금지 — 콘텐츠가 짧을 때 버튼이 잘림 */
```

### Selection Card (선택 카드)
```
border: 2px solid #E5E8EB
border-radius: 12px
padding: 16px 14px
background: #fff
cursor: pointer
transition: border-color 0.15s, background 0.15s

.selected:
  border-color: #3182F6
  background: #F0F6FF
```

### Tag / Badge (카드 내 타입 태그)
```
font-size: 11px
font-weight: 700
color: #3182F6
background: #EEF3FF
border-radius: 6px
padding: 2px 8px

.selected:
  background: #3182F6
  color: #fff
```

### Chip / Keyword Number Badge
```
width: 28px; height: 28px
border-radius: 50%
font-size: 13px; font-weight: 600

default:  bg #F2F4F6,  color #8B95A1
active:   bg #EEF3FF,  color #3182F6
valid:    bg #E8FBF0,  color #00C73C
invalid:  bg #FFF0F2,  color #F04452
```

### Toggle (동의 토글)
```
width: 44px; height: 26px
border-radius: 13px
off: background #D1D6DB
on:  background #3182F6
thumb: 20px circle, white, box-shadow: 0 1px 3px rgba(0,0,0,0.18)
transition: 0.2s
```

### Agree Row (동의 카드)
```
display: flex; align-items: flex-start; gap: 14px
background: #F8FAFF
border: 1.5px solid #D0E2FF
border-radius: 10px
padding: 14px 16px
cursor: pointer

text: 14px, #4A5568, line-height 1.5, word-break: keep-all
strong: color #191F28
```

### Modal / Bottom Sheet
```
overlay: rgba(0,0,0,0.4), position fixed inset 0
align-items: flex-end (바텀 기준)

sheet:
  background: #fff
  border-radius: 20px 20px 0 0
  padding: 28px 24px 32px
  max-width: 480px, width: 100%
  animation: slideUp 0.2s ease

@keyframes slideUp:
  from transform: translateY(100%)
  to   transform: translateY(0)

modal-icon: 48px circle, #F2F4F6 bg
modal-title: 20px/700/#191F28
modal-desc: 15px/#8B95A1, line-height 1.6
```

### Summary Card (모달 내 요약)
```
background: #F8FAFF
border: 1.5px solid #E5E8EB
border-radius: 10px
padding: 14px 16px
gap: 10px (행 간격)

label: 13px/#8B95A1/500, min-width 70px
value: 13px/#191F28/600, word-break: break-all
```

### Success Screen
```
display: flex, flex-direction: column
align-items: center, justify-content: center
min-height: 100vh, text-align: center, padding: 40px 20px

icon: 64px circle, #EEF3FF bg, 28px emoji
h2: 20px/700/#191F28, margin-bottom 10px
p: 15px/#8B95A1, line-height 1.7
```

---

## 5. Layout Principles

### Spacing
- 섹션 간 간격: `margin-top: 8px` → 회색 배경이 갭으로 보임
- 섹션 내 패딩: `20px 20px 16px`
- 필드 간 간격: `margin-bottom: 16px` (마지막은 0)
- 그리드 갭: `12px` (2열 레이아웃)
- 바텀 여백: `padding-bottom: 90px` (바텀바 가림 방지)

### Grid
- 2열: `grid-template-columns: 1fr 1fr; gap: 12px`
- 모바일 max-width: 480px, 중앙 정렬

### Responsive
- max-width 480px 이하: page/header-inner 마진 제거, 풀-위드 처리
- 바텀바: left/right 0, transform 제거

---

## 6. Do's and Don'ts

### Do
- 흰 섹션 카드를 `margin-top: 8px`로 쌓아 회색 갭을 만든다
- 섹션 레이블은 회색(#8B95A1), 필드 레이블은 다크(#191F28)로 구분한다
- 입력 테두리는 1.5px, 10px radius로 통일한다
- 버튼은 10px radius, 16px/700, 패딩 15px로 넉넉하게
- 포커스/선택/유효/에러를 **테두리 색**으로만 구분한다
- 공지/안내는 반드시 `#F8FAFF + #D0E2FF` 파란 tint 박스 사용

### Don't
- 카드에 그림자(box-shadow) 쓰지 않는다 — 배경 갭으로만 구분
- 4px 이하 작은 radius 쓰지 않는다 (Stripe 스타일과 혼용 금지)
- pill 형태(9999px) 버튼 쓰지 않는다 — 10px 고정
- 헤딩에 weight 300 쓰지 않는다 — 최소 600, 주로 700
- 다크 배경 섹션 쓰지 않는다 — 항상 흰색/연회색만
- 파란색 외 accent 컬러(퍼플, 그린 등)를 primary로 쓰지 않는다

---

## 7. Quick Reference

```
Primary Blue:    #3182F6
Page BG:         #F2F4F6
Surface:         #FFFFFF
Text Dark:       #191F28
Text Gray:       #8B95A1
Text Body:       #4A5568
Border:          #E5E8EB
Notice BG:       #F8FAFF
Notice Border:   #D0E2FF
Valid:           #00C73C
Error:           #F04452
Disabled:        #E5E8EB / #B0B8C1

Input radius:    10px, border 1.5px
Button radius:   10px, padding 15px, 16px/700
Card radius:     10–12px (선택 카드)
Modal radius:    20px 20px 0 0
Section gap:     margin-top: 8px
Section padding: 20px 20px 16px
```
