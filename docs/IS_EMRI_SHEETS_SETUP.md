# İş Emri → Google E-Tablolar Kurulumu

Kod tarafı hazır. Aşağıdaki adımları sizin tamamlamanız gerekir.

## 1. E-Tablo

1. Google Drive’da **İş Emri Kayıtları** adlı e-tabloyu açın (veya yeni oluşturun).
2. **Uzantılar → Apps Script** açın.
3. Projedeki şu dosyanın içeriğini yapıştırın:

   `scripts/google-apps-script/is-emri-sheets.gs`

4. Editörde **`setupTemplate`** fonksiyonunu seçip **Çalıştır** deyin (bir kez).
   - `Şablon` sayfası ve başlık satırı oluşur.
5. Gerekirse yetki onaylarını verin.

## 2. Web uygulaması dağıtımı

1. Apps Script’te **Dağıt → Yeni dağıtım**
2. Tür: **Web uygulaması**
3. Ayarlar:
   - **Yürütme:** Ben
   - **Erişim:** Herkes
4. **Dağıt** → çıkan URL’yi kopyalayın  
   (`https://script.google.com/macros/s/.../exec`)

> Conta webhook URL’sinden **farklı** olmalı. Conta kendi script’inde kalır.

## 3. `.env.local`

Proje kökündeki `.env.local` dosyasına ekleyin:

```env
GOOGLE_SHEETS_IS_EMRI_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
```

Ardından geliştirmeyi yeniden başlatın:

```bash
npm run dev
```

## 4. Test

1. Panelde **İş Takip** → yeni iş emri kaydedin.
2. E-tabloda işin tarihine göre sayfa oluşmalı (ör. `12.07.2026`).
3. Satırda **Durum = Tamamlanmadı** görünmeli.
4. Geçmiş iş emirlerinden kaydı **Tamamlandı** yapın.
5. Aynı satırda durum **İş tamamlandı** olmalı; panelde geri alınamaz.

## Davranış özeti

| Olay | Sheets |
|------|--------|
| Yeni iş emri | Günlük sayfaya yeni satır |
| Tamamlandı | Aynı satırda durum güncellenir |
| Tamamlandı → geri alma | Engellenir (API + UI) |

Supabase kaydı başarılı olup Sheets yazılamazsa iş emri yine oluşur; sunucu logunda `[is-emri sheets]` uyarısı görünür.

## Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| Hiç satır yok | `.env.local` URL’si ve `npm run dev` restart |
| 401 / HTML hata | Web uygulamasını yeniden dağıtın, erişim **Herkes** |
| Durum güncellenmiyor | Aynı script URL’si mi? `testComplete` ile Apps Script’te deneyin |
| Yanlış gün sayfası | Sayfa adı iş emrinin **Tarih** alanından gelir (`dd.MM.yyyy`) |
