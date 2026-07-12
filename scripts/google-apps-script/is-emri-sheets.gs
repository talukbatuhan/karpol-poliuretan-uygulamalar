/**
 * Google E-Tablolar — İş Emri Kayıtları (Apps Script)
 *
 * Kurulum:
 * 1. "İş Emri Kayıtları" adlı e-tabloyu açın
 * 2. Uzantılar > Apps Script
 * 3. Bu dosyanın içeriğini yapıştırın
 * 4. setupTemplate fonksiyonunu bir kez çalıştırın
 * 5. Dağıt > Yeni dağıtım > Web uygulaması > Erişim: Herkes
 * 6. URL'yi .env.local → GOOGLE_SHEETS_IS_EMRI_WEBHOOK_URL
 *
 * Davranış:
 * - action=create → iş tarihine göre "dd.MM.yyyy" sayfasına satır ekler
 * - action=complete → aynı satırda Durum = "İş tamamlandı"
 */

var TEMPLATE_SHEET_NAME = "Şablon";
var COLUMN_COUNT = 13;
var ID_COLUMN = 1;
var STATUS_COLUMN = 12;
var STYLE_TEMPLATE_ROW = 2;

var HEADERS = [
  "İş ID",
  "Tarih",
  "Şehir",
  "Talep Eden Firma",
  "Uygulayıcı Firma",
  "İş Türü",
  "İş Açıklaması",
  "Miktar",
  "Birim",
  "Planlanan Teslim",
  "Sorumlu Personel",
  "Durum",
  "Oluşturma Zamanı",
];

function formatKayitTarihi(value) {
  var date = value ? new Date(value) : new Date();
  return Utilities.formatDate(date, "Europe/Istanbul", "dd/MM/yyyy - HH:mm");
}

function formatSheetDateFromIso_(isoDate) {
  // "2026-07-12" veya ISO datetime
  if (!isoDate) {
    return Utilities.formatDate(new Date(), "Europe/Istanbul", "dd.MM.yyyy");
  }

  var match = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return match[3] + "." + match[2] + "." + match[1];
  }

  return Utilities.formatDate(new Date(isoDate), "Europe/Istanbul", "dd.MM.yyyy");
}

function ensureTemplateSheet_(ss) {
  var template = ss.getSheetByName(TEMPLATE_SHEET_NAME);
  if (!template) {
    template = ss.insertSheet(TEMPLATE_SHEET_NAME, 0);
  }

  template.getRange(1, 1, 1, COLUMN_COUNT).setValues([HEADERS]);
  template
    .getRange(1, 1, 1, COLUMN_COUNT)
    .setFontWeight("bold")
    .setBackground("#0a1628")
    .setFontColor("#ffffff");

  return template;
}

function getOrCreateDailySheet_(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    return sheet;
  }

  var template = ensureTemplateSheet_(ss);
  sheet = template.copyTo(ss);
  sheet.setName(sheetName);

  // Kopyada sadece başlık kalsın (şablondaki örnek satırları temizle)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow, COLUMN_COUNT).clearContent();
  }

  // Günlük sayfaları şablondan sonra tut
  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(2);

  return sheet;
}

function applyRowStyle_(sheet, newRow) {
  var sourceRow =
    newRow > STYLE_TEMPLATE_ROW ? newRow - 1 : STYLE_TEMPLATE_ROW;

  if (sheet.getLastRow() < 1) {
    return;
  }

  var templateRow = Math.min(sourceRow, sheet.getLastRow());
  if (templateRow < 1) {
    return;
  }

  sheet
    .getRange(templateRow, 1, 1, COLUMN_COUNT)
    .copyTo(sheet.getRange(newRow, 1, 1, COLUMN_COUNT), { formatOnly: true });
}

function findRowByWorkOrderId_(sheet, workOrderId) {
  if (!workOrderId) return -1;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  var values = sheet.getRange(2, ID_COLUMN, lastRow, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(workOrderId)) {
      return i + 2;
    }
  }
  return -1;
}

function findAcrossSheets_(ss, workOrderId, preferredSheetName) {
  if (preferredSheetName) {
    var preferred = ss.getSheetByName(preferredSheetName);
    if (preferred) {
      var row = findRowByWorkOrderId_(preferred, workOrderId);
      if (row > 0) {
        return { sheet: preferred, row: row };
      }
    }
  }

  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    if (sheet.getName() === TEMPLATE_SHEET_NAME) continue;
    var found = findRowByWorkOrderId_(sheet, workOrderId);
    if (found > 0) {
      return { sheet: sheet, row: found };
    }
  }

  return null;
}

function handleCreate_(ss, data) {
  var sheetName =
    data.sheetName || formatSheetDateFromIso_(data.tarih || data.createdAt);
  var sheet = getOrCreateDailySheet_(ss, sheetName);

  // Başlık yoksa yaz
  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, COLUMN_COUNT).setValues([HEADERS]);
  }

  sheet.appendRow([
    data.workOrderId || "",
    data.tarihLabel || data.tarih || "",
    data.sehir || "",
    data.talepEdenFirma || "",
    data.uygulayiciFirma || "",
    data.isTuru || "",
    data.isAciklamasi || "",
    data.miktar != null ? data.miktar : "",
    data.birim || "",
    data.planlananTeslimTarihi || "",
    data.sorumluPersonel || "",
    data.durum || "Tamamlanmadı",
    formatKayitTarihi(data.createdAt),
  ]);

  var newRow = sheet.getLastRow();
  applyRowStyle_(sheet, newRow);

  return {
    success: true,
    action: "create",
    sheetName: sheetName,
    row: newRow,
  };
}

function handleComplete_(ss, data) {
  var workOrderId = data.workOrderId;
  if (!workOrderId) {
    return { success: false, error: "workOrderId zorunlu" };
  }

  var preferredSheetName =
    data.sheetName || formatSheetDateFromIso_(data.tarih || data.createdAt);

  var found = findAcrossSheets_(ss, workOrderId, preferredSheetName);
  if (!found) {
    return {
      success: false,
      error: "İş emri satırı bulunamadı: " + workOrderId,
    };
  }

  found.sheet.getRange(found.row, STATUS_COLUMN).setValue("İş tamamlandı");

  return {
    success: true,
    action: "complete",
    sheetName: found.sheet.getName(),
    row: found.row,
  };
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "create";

    var result;
    if (action === "complete") {
      result = handleComplete_(ss, data);
    } else {
      result = handleCreate_(ss, data);
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error && error.message ? error.message : String(error),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function setupTemplate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureTemplateSheet_(ss);
}

function testCreate() {
  doPost({
    postData: {
      contents: JSON.stringify({
        action: "create",
        workOrderId: "test-uuid-001",
        tarih: "2026-07-12",
        tarihLabel: "12.07.2026",
        sehir: "Denizli",
        talepEdenFirma: "Test Talep",
        uygulayiciFirma: "Test Uygulayıcı",
        isTuru: "Montaj",
        isAciklamasi: "Test açıklama",
        miktar: 5,
        birim: "adet",
        planlananTeslimTarihi: "15.07.2026",
        sorumluPersonel: "Ali Veli",
        durum: "Tamamlanmadı",
        createdAt: new Date().toISOString(),
      }),
    },
  });
}

function testComplete() {
  doPost({
    postData: {
      contents: JSON.stringify({
        action: "complete",
        workOrderId: "test-uuid-001",
        tarih: "2026-07-12",
      }),
    },
  });
}
