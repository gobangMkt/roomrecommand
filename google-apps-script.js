// =====================================================
// 방추천 Google Sheets 연동 스크립트
// =====================================================
// 사용법:
// 1. 스프레드시트 열기
// 2. 확장 프로그램 > Apps Script
// 3. 이 코드 전체 붙여넣기
// 4. 저장 후 [배포] > [새 배포] (또는 기존 배포 수정)
// 5. 유형: 웹앱, 실행: 나(내 계정), 액세스: 모든 사용자
// 6. 배포 후 나오는 URL을 .env.local 에 붙여넣기
// =====================================================

const SHEET_NAME = '방추천신청';

const HEADERS = [
  '신청일시', '전화번호', '성별', '나이',
  '방추천시작일', '방추천종료일', '방추천미정',
  '입주희망시작', '입주희망종료', '입주희망미정',
  '희망구', '희망동',
  '보증금최소(만)', '보증금최대(만)',
  '월세최소(만)', '월세최대(만)',
  '매물유형', '추가요청사항', '상태'
];

function getOrCreateSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#4A90D9')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreateSheet(ss);
    const data = JSON.parse(e.postData.contents);

    // 비활성화 요청
    if (data.action === 'deactivate') {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const phones = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
        const statusCol = HEADERS.indexOf('상태') + 1;
        for (let i = 0; i < phones.length; i++) {
          if (String(phones[i][0]) === String(data.phone)) {
            sheet.getRange(i + 2, statusCol).setValue('inactive');
          }
        }
      }
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, action: 'deactivated' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 신규/수정 신청
    sheet.appendRow([
      new Date().toLocaleString('ko-KR'),
      data.phone,
      data.gender,
      data.age,
      data.recStart || '',
      data.recEnd || '',
      data.recUndecided ? 'Y' : '',
      data.moveInStart || '',
      data.moveInEnd || '',
      data.moveInUndecided ? 'Y' : '',
      data.gu,
      data.dong,
      data.depositMin,
      data.depositMax,
      data.rentMin,
      data.rentMax,
      data.roomTypes,
      data.additionalNotes,
      'active'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
