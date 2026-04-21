// =====================================================
// 방추천 Google Sheets 연동 스크립트
// =====================================================
// 사용법:
// 1. 스프레드시트 열기
// 2. 확장 프로그램 > Apps Script
// 3. 이 코드 전체 붙여넣기
// 4. 저장 후 [배포] > [배포 관리] > 연필 아이콘 > 새 버전 선택 > 배포
// =====================================================

const SHEET_NAME = '방추천신청';

const HEADERS = [
  '신청일시', '전화번호', '성별', '출생년도',
  '방추천시작일', '방추천종료일',
  '입주희망시작', '입주희망종료', '입주희망미정',
  '희망구', '희망동',
  '보증금최소(만)', '보증금최대(만)',
  '월세최소(만)', '월세최대(만)',
  '매물유형', '추가요청사항', '상태'
];

function cleanPhone(p) {
  return String(p || '').replace(/[^0-9]/g, '');
}

function formatPhone(p) {
  const d = cleanPhone(p);
  if (d.length === 11) return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
  return d;
}

function getOrCreateSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#533afd')
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

    // 호스트 연락하기 로그 저장
    if (data.action === 'saveSendLog') {
      const logSheet = getOrCreateSendLogSheet(ss);
      logSheet.appendRow([
        data.requestedAt || new Date().toLocaleString('ko-KR'),
        formatPhone(data.hostPhone),
        data.hostUserId || '',
        data.branchUrl || '',
        data.dong || '',
        data.gu || '',
        data.customerPhone || '',
        data.message || '',
        data.status || 'requested',
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, action: 'sendLogSaved' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 비활성화 요청
    if (data.action === 'deactivate') {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const phones = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
        const statusCol = HEADERS.indexOf('상태') + 1;
        const targetPhone = cleanPhone(data.phone);
        for (let i = 0; i < phones.length; i++) {
          if (cleanPhone(phones[i][0]) === targetPhone) {
            sheet.getRange(i + 2, statusCol).setValue('inactive');
          }
        }
      }
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, action: 'deactivated' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 신규/수정 신청 — 같은 번호의 기존 active 행을 먼저 inactive 처리
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const phones = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      const statusCol = HEADERS.indexOf('상태') + 1;
      const targetPhone = cleanPhone(data.phone);
      for (let i = 0; i < phones.length; i++) {
        if (cleanPhone(phones[i][0]) === targetPhone) {
          sheet.getRange(i + 2, statusCol).setValue('inactive');
        }
      }
    }

    sheet.appendRow([
      new Date().toLocaleString('ko-KR'),
      formatPhone(data.phone),
      data.gender || '',
      data.age || '',
      data.recStart || '',
      data.recEnd || '',
      data.moveInStart || '',
      data.moveInEnd || '',
      data.moveInUndecided ? 'Y' : '',
      data.gu || '',
      data.dong || '',
      data.depositMin !== undefined ? data.depositMin : '',
      data.depositMax !== undefined ? data.depositMax : '',
      data.rentMin !== undefined ? data.rentMin : '',
      data.rentMax !== undefined ? data.rentMax : '',
      data.roomTypes || '',
      data.additionalNotes || '',
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

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  // 호스트용: active 신청 전체 조회
  if (action === 'getActiveRequests') {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = getOrCreateSheet(ss);
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return ContentService
          .createTextOutput(JSON.stringify({ rows: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
      const statusIdx = HEADERS.indexOf('상태');
      const rows = data
        .filter(row => row[statusIdx] === 'active')
        .map(row => ({
          createdAt: row[0],
          phone: row[1],
          gender: row[2],
          age: row[3],
          recStart: row[4],
          recEnd: row[5],
          moveInStart: row[6],
          moveInEnd: row[7],
          moveInUndecided: row[8],
          gu: row[9],
          dong: row[10],
          depositMin: row[11],
          depositMax: row[12],
          rentMin: row[13],
          rentMax: row[14],
          roomTypes: row[15],
          notes: row[16],
        }));
      return ContentService
        .createTextOutput(JSON.stringify({ rows }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', headers: HEADERS }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 연락하기 로그 시트
const SEND_LOG_SHEET = '연락하기로그';
const SEND_LOG_HEADERS = [
  '요청일시', '호스트전화', '호스트ID', '지점URL',
  '동', '구', '고객전화', '메시지', '상태'
];

function getOrCreateSendLogSheet(ss) {
  let sheet = ss.getSheetByName(SEND_LOG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SEND_LOG_SHEET);
    sheet.appendRow(SEND_LOG_HEADERS);
    sheet.getRange(1, 1, 1, SEND_LOG_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#1A73E8')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}
