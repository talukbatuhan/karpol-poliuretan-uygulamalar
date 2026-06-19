/**
 * Google E-Tablolar — Apps Script kodu
 *
 * Kurulum:
 * 1. Google E-Tabloda Uzantılar > Apps Script açın
 * 2. Bu dosyanın içeriğini yapıştırın
 * 3. Dağıt > Yeni dağıtım > Web uygulaması
 * 4. "Herkes" erişimi ile dağıtın
 * 5. URL'yi .env.local içindeki GOOGLE_SHEETS_WEBHOOK_URL'e yazın
 *
 * Biçimlendirme:
 * - 2. satırı (ilk veri satırı) istediğiniz gibi biçimlendirin
 * - Yeni satırlar bir üst satırın biçimini kopyalar
 */

var COLUMN_COUNT = 9;
var GORSEL_COLUMN = 7;
var STYLE_TEMPLATE_ROW = 2;

function formatKayitTarihi(value) {
  var date = value ? new Date(value) : new Date();
  return Utilities.formatDate(date, "Europe/Istanbul", "dd/MM/yyyy - HH:mm");
}

function parseGorselUrls_(data) {
  if (Array.isArray(data.gorselUrlList) && data.gorselUrlList.length > 0) {
    return data.gorselUrlList.filter(function (url) {
      return !!url;
    });
  }

  if (!data.gorselLinkleri) {
    return [];
  }

  return String(data.gorselLinkleri)
    .split(/[\n,]+/)
    .map(function (part) {
      return part.trim();
    })
    .filter(function (part) {
      return part.length > 0 && part.indexOf("http") === 0;
    });
}

function setGorselLinkleriCell_(sheet, row, urls) {
  var range = sheet.getRange(row, GORSEL_COLUMN);

  if (!urls || urls.length === 0) {
    range.clearContent();
    return;
  }

  var labels = [];
  for (var i = 0; i < urls.length; i++) {
    labels.push("Görsel " + (i + 1));
  }

  var fullText = labels.join("\n");

  try {
    var richTextBuilder = SpreadsheetApp.newRichTextValue();
    richTextBuilder.setText(fullText);

    var offset = 0;
    for (var j = 0; j < urls.length; j++) {
      var label = labels[j];
      richTextBuilder.setLinkUrl(offset, offset + label.length, urls[j]);
      offset += label.length;
      if (j < urls.length - 1) {
        offset += 1;
      }
    }

    range.setRichTextValue(richTextBuilder.build());
  } catch (error) {
    range.setValue(urls.join("\n"));
  }

  range.setWrap(true);
  range.setVerticalAlignment("top");

  if (urls.length > 1) {
    sheet.setRowHeight(row, Math.max(21, urls.length * 22));
  }
}

function applyRowStyle_(sheet, newRow) {
  var sourceRow =
    newRow > STYLE_TEMPLATE_ROW ? newRow - 1 : STYLE_TEMPLATE_ROW;

  if (sheet.getLastRow() < STYLE_TEMPLATE_ROW) {
    return;
  }

  sheet
    .getRange(sourceRow, 1, 1, COLUMN_COUNT)
    .copyTo(sheet.getRange(newRow, 1, 1, COLUMN_COUNT), { formatOnly: true });
}

function doPost(e) {
  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Conta Takip") ||
    SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

  var data = JSON.parse(e.postData.contents);
  var gorselUrls = parseGorselUrls_(data);

  sheet.appendRow([
    data.contaCode || "",
    data.firmaIsmi || "",
    data.marka || "",
    data.uzunluk || "",
    data.adet || "",
    data.renk || "",
    "",
    formatKayitTarihi(data.createdAt),
    data.supabaseId || "",
  ]);

  var newRow = sheet.getLastRow();

  applyRowStyle_(sheet, newRow);
  setGorselLinkleriCell_(sheet, newRow, gorselUrls);

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, gorselCount: gorselUrls.length }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function testDoPost() {
  doPost({
    postData: {
      contents: JSON.stringify({
        contaCode: "CT-TEST",
        firmaIsmi: "Test Firma",
        marka: "Test Marka",
        uzunluk: "100 mm",
        adet: 2,
        renk: "Siyah",
        gorselUrlList: [
          "https://example.com/gorsel1.jpg",
          "https://example.com/gorsel2.jpg",
        ],
        createdAt: new Date().toISOString(),
        supabaseId: "test-uuid",
      }),
    },
  });
}

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Conta Takip");

  if (!sheet) {
    sheet = ss.insertSheet("Conta Takip");
  }

  sheet.getRange(1, 1, 1, COLUMN_COUNT).setValues([[

    "Conta ID",
    "Firma İsmi",
    "Markası",
    "Uzunluk",
    "Adet",
    "Renk",
    "Görsel Linkleri",
    "Kayıt Tarihi",
    "Supabase ID",
  ]]);

  sheet.setColumnWidth(GORSEL_COLUMN, 140);
}
