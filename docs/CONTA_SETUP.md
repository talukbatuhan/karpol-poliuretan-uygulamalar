# Conta Takip — Supabase + Google E-Tablolar Kurulumu

Bu rehber **Adım 1** içindir. Kod tarafı hazır; aşağıdaki manuel adımları siz tamamlayacaksınız.

---

## Adım 1 — Supabase (sizin yapacaklarınız)

### 1.1 Proje ve API anahtarları
1. [supabase.com](https://supabase.com) → projenizi açın (veya yeni oluşturun)
2. **Settings → API** bölümünden kopyalayın:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ gizli tutun

### 1.2 `.env.local` dosyası
Proje kökünde `.env.local` oluşturun (`.env.local.example` şablonuna bakın):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 1.3 Veritabanı migration'ları
Supabase Dashboard → **SQL Editor** → sırayla çalıştırın:

1. `supabase/migrations/004_conta_tracking.sql`
2. `supabase/migrations/005_conta_storage_sync.sql`

### 1.4 Storage bucket kontrolü
**Storage** menüsünde `conta-images` bucket'ının oluştuğunu doğrulayın (public).

### 1.5 Test
```bash
npm run dev
```
`/conta-takip` sayfasını açın. Conta ID alanı Supabase'den bir sonraki kodu göstermeli (`CT-0001` vb.).

Formu doldurup **Kaydet** deyin → Supabase **Table Editor → conta_records** tablosunda satır görünmeli.

---

## Adım 2 — Google E-Tablolar (bir sonraki adım)

1. Yeni Google E-Tablo oluşturun: **Conta Takip**
2. **Uzantılar → Apps Script**
3. `scripts/google-apps-script/conta-sheets.gs` içeriğini yapıştırın
4. `setupSheet` fonksiyonunu bir kez çalıştırın (başlık satırı oluşur)
5. **Dağıt → Yeni dağıtım → Web uygulaması** → Erişim: **Herkes**
6. Web app URL'sini `.env.local` içine ekleyin:
   ```env
   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
   ```
7. `npm run dev` yeniden başlatın ve test kaydı yapın → E-Tabloda yeni satır görünmeli

---

## Akış özeti

```
ContaForm → POST /api/conta
  → Supabase conta_records (ana kayıt)
  → Supabase Storage conta-images (görseller)
  → Supabase conta_attachments (görsel meta)
  → Google Sheets webhook (satır ekleme)
  → conta_sync_log (senkron durumu)
```

Supabase başarılı, Sheets başarısız olursa kayıt yine oluşur; sarı uyarı mesajı gösterilir.

---

## Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| Conta ID güncellenmiyor | `.env.local` ve `SUPABASE_SERVICE_ROLE_KEY` kontrol edin |
| Tablo bulunamadı | `004_conta_tracking.sql` çalıştırın |
| Görsel yüklenmiyor | `005_conta_storage_sync.sql` + `conta-images` bucket |
| Sheets'e yazılmıyor | `GOOGLE_SHEETS_WEBHOOK_URL` ve Apps Script dağıtımı |
