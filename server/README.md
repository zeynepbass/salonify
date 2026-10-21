# SalonaBOX API

Kuaför ve güzellik salonu randevu platformunun sunucu tarafı. Express 5, MongoDB (Mongoose) ve JWT ile çalışır. Kullanılan bütün paketler açık kaynak ve ücretsizdir.

## Kurulum

```bash
npm install
npm run seed     # örnek veriyi yazar
npm run dev      # http://localhost:5000/api
```

Proje kökünde (`salonify/.env`) bir `.env` dosyası oluşturulur. Arayüz de aynı dosyayı okur:

| Değişken | Açıklama |
| --- | --- |
| `MONGODB_URI` | MongoDB bağlantı adresi (yerel MongoDB veya MongoDB Atlas ücretsiz paket) |
| `JWT_SECRET` | Giriş anahtarının (access token) imza şifresi |
| `JWT_REFRESH_SECRET` | Yenileme anahtarının (refresh token) imza şifresi, `JWT_SECRET` ile aynı olamaz |
| `PORT` | Sunucu portu, varsayılan `5000` |
| `CLIENT_URL` | Arayüzün adresi, birden fazlaysa virgülle ayrılır. Varsayılan `http://localhost:3000` |
| `SEED_PASSWORD` | Örnek hesapların şifresi, varsayılan `Salonabox123` |
| `NEXT_PUBLIC_API_URL` | Arayüzün istek attığı API adresi, örn. `http://localhost:5000/api` |

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Sunucuyu başlatır, dosya değişince yeniden başlatır |
| `npm start` | Sunucuyu başlatır |
| `npm run seed` | Veritabanı boşsa örnek veriyi yazar, `npm run seed -- --reset` her şeyi silip baştan yazar |
| `npm test` | Testleri geçici bir veritabanında çalıştırır |

## Örnek hesaplar

`npm run seed` tek bir salon, tek bir müşteri ve aralarında 5 bağlantılı randevu yazar. Tarihler script'in çalıştığı güne göre hesaplanır; veriler eskidiğinde `npm run seed -- --reset` ile yenilenir.

Bütün örnek hesapların şifresi: **`Salonabox123`**. Arayüzdeki giriş formları bu hesaplarla dolu açılır.

| Hesap | E-posta | İçinde ne var |
| --- | --- | --- |
| Müşteri | `elif.kaya@posta.com` | 2 yaklaşan, 2 tamamlanmış (biri değerlendirilmiş), 1 iptal edilmiş randevu ve bildirimler |
| Salon | `ayse@ayseyilmazstudio.com` | Ayşe Yılmaz Studio: 3 hizmet, aynı 5 randevu, 1 değerlendirme, 2 portföy görseli, bildirimler |

## Klasör yapısı

| Klasör | İçerik |
| --- | --- |
| `src/routes` | Uçların tanımı, hangi adresin hangi işleme gittiği |
| `src/controllers` | İsteği alıp cevabı dönen katman |
| `src/services` | İş kuralları ve veritabanı işlemleri |
| `src/models` | Veritabanı şemaları |
| `src/validators` | Gelen verinin kontrolü |
| `src/middlewares` | Oturum kontrolü, istek limiti, dosya yükleme, hata yakalama |
| `src/utils` | Token, saat ve cevap yardımcıları |
| `src/config` | Ortam değişkenleri ve veritabanı bağlantısı |
| `scripts` | Örnek veri script'i |
| `tests` | API testleri |

## Hangi API hangi sayfada ne işe yarıyor

Bütün uçlar `/api` ile başlar.

Yetki türleri:

- **Herkes**: giriş yapmadan kullanılabilir
- **Giriş yapmış**: müşteri veya salon sahibi
- **Müşteri**: yalnızca müşteri hesabı
- **Salon**: yalnızca salon sahibi hesabı

### Sistem

| Metot | Uç | Sayfa | Ne işe yarıyor | Yetki |
| --- | --- | --- | --- | --- |
| GET | `/health` | — | Sunucunun çalıştığını kontrol eder | Herkes |

### Giriş ve oturum

Dosya: `src/routes/auth.routes.js`

| Metot | Uç | Sayfa | Ne işe yarıyor | Yetki |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | Kayıt | Yeni müşteri hesabı açar | Herkes |
| POST | `/auth/login` | Panel girişi `/panel/giris`, müşteri girişi | E-posta ve şifreyle giriş yapar | Herkes |
| POST | `/auth/refresh` | Bütün sayfalar | Süresi dolan oturumu arka planda yeniler | Herkes |
| POST | `/auth/logout` | Profil `/profil`, panel menüsü | Çıkış yapar | Herkes |
| GET | `/auth/me` | Bütün sayfalar | Oturumdaki kullanıcıyı getirir, üst menüdeki isim ve rol buradan gelir | Giriş yapmış |

### Kullanıcı hesabı

Dosya: `src/routes/user.routes.js`

| Metot | Uç | Sayfa | Ne işe yarıyor | Yetki |
| --- | --- | --- | --- | --- |
| GET | `/users/me` | Profil `/profil` | Ad, e-posta, telefon gibi profil bilgilerini getirir | Giriş yapmış |
| PATCH | `/users/me` | Profil `/profil` | Profil bilgilerini kaydeder | Giriş yapmış |
| PATCH | `/users/me/password` | Profil `/profil` | Şifre değiştirir | Giriş yapmış |
| DELETE | `/users/me` | Profil `/profil` | Hesabı siler | Müşteri |
| GET | `/users/me/appointments` | Randevularım `/randevularim` | Müşterinin randevularını listeler | Müşteri |
| GET | `/users/me/reviews` | Profil `/profil` | "Değerlendirmelerim" bölümünü doldurur | Müşteri |
| GET | `/users/me/notifications` | Bildirimler `/bildirimler` | Kullanıcının bildirimlerini listeler | Giriş yapmış |

### Salonlar

Dosya: `src/routes/salon.routes.js`

| Metot | Uç | Sayfa | Ne işe yarıyor | Yetki |
| --- | --- | --- | --- | --- |
| GET | `/salons` | Ana sayfa `/`, Kuaförler `/kuaforler` | Salonları listeler; arama, filtre, sıralama, konuma göre yakınlık ve sayfalama | Herkes |
| GET | `/salons/:salonId` | Salon detayı `/kuaforler/[salonId]`, Randevu al | Salonun adı, adresi, puanı, açıklaması | Herkes |
| GET | `/salons/:salonId/services` | Salon detayı, Randevu al | Salonun hizmetleri, süreleri ve fiyatları | Herkes |
| GET | `/salons/:salonId/working-hours` | Salon detayı, Randevu al, Panel takvim ve çalışma saatleri | Haftalık çalışma saatleri | Herkes |
| GET | `/salons/:salonId/blocked-dates` | Randevu al, Panel takvim ve çalışma saatleri | Salonun kapalı olduğu günler | Herkes |
| GET | `/salons/:salonId/availability` | Randevu al `/kuaforler/[salonId]/randevu`, Panel randevu formu | Seçilen gün ve hizmet için boş saatleri hesaplar | Herkes |
| GET | `/salons/:salonId/portfolio` | Salon detayı | Portföy galerisi | Herkes |
| GET | `/salons/:salonId/reviews` | Salon detayı | Değerlendirmeler ve puan dağılımı | Herkes |

### Müşteri randevuları

Dosya: `src/routes/appointment.routes.js`

| Metot | Uç | Sayfa | Ne işe yarıyor | Yetki |
| --- | --- | --- | --- | --- |
| POST | `/appointments` | Randevu al `/kuaforler/[salonId]/randevu` | Randevuyu oluşturur, salona bildirim gönderir | Müşteri |
| GET | `/appointments` | Randevularım `/randevularim` | Yaklaşan ve geçmiş randevuları listeler | Müşteri |
| GET | `/appointments/:appointmentId` | Randevu detayı, Randevu oluşturuldu, Değerlendir | Tek randevunun bilgileri | Müşteri |
| PATCH | `/appointments/:appointmentId` | Randevu detayı `/randevularim/[id]` | Randevunun tarihini, saatini veya hizmetini değiştirir | Müşteri |
| DELETE | `/appointments/:appointmentId` | Randevu detayı `/randevularim/[id]` | Randevuyu iptal eder | Müşteri |
| POST | `/appointments/:appointmentId/review` | Değerlendir `/randevularim/[id]/degerlendir` | Tamamlanan randevuya puan, yorum ve fotoğraf ekler | Müşteri |

### Bildirimler

Dosya: `src/routes/notification.routes.js`

| Metot | Uç | Sayfa | Ne işe yarıyor | Yetki |
| --- | --- | --- | --- | --- |
| GET | `/notifications` | Bildirimler `/bildirimler`, `/panel/bildirimler`, Panel özeti | Bildirimleri listeler, okunmamış sayısını verir | Giriş yapmış |
| PATCH | `/notifications/read-all` | Bildirimler | Hepsini okundu yapar | Giriş yapmış |
| PATCH | `/notifications/:notificationId/read` | Bildirimler | Tek bildirimi okundu yapar | Giriş yapmış |
| DELETE | `/notifications` | Panel bildirimleri | Kullanıcının tüm bildirimlerini siler | Giriş yapmış |
| DELETE | `/notifications/:notificationId` | Panel bildirimleri | Tek bildirimi siler | Giriş yapmış |

### Görsel yükleme

Dosya: `src/routes/upload.routes.js`

Görseller veritabanında (MongoDB GridFS) saklanır, ücretli bir dosya servisi kullanılmaz. JPG, PNG ve WebP kabul edilir.

| Metot | Uç | Sayfa | Ne işe yarıyor | Yetki |
| --- | --- | --- | --- | --- |
| POST | `/uploads` | Değerlendir, Panel portföy, Panel profil | Görsel yükler, görselin kimliğini döner | Giriş yapmış |
| GET | `/uploads/:fileId` | Görsel gösterilen bütün sayfalar | Yüklenen görseli gösterir | Herkes |

### Salon paneli

Dosya: `src/routes/salonPanel.routes.js`

Bu uçlar yalnızca salon sahibine açıktır ve her zaman giriş yapan kişinin kendi salonu üzerinde çalışır.

| Metot | Uç | Sayfa | Ne işe yarıyor |
| --- | --- | --- | --- |
| GET | `/salon/me` | Profil `/panel/profil` | Salonun profil bilgilerini getirir |
| PATCH | `/salon/me` | Profil `/panel/profil` | Salon adı, adres, iletişim ve kapak görselini kaydeder |
| GET | `/salon/me/dashboard` | Özet `/panel` | Bugünkü, yaklaşan, tamamlanan ve iptal edilen randevu sayıları, doluluk oranı |
| GET | `/salon/me/services` | Hizmetler `/panel/hizmetler`, Randevu formu | Pasifler dahil bütün hizmetleri listeler |
| POST | `/salon/me/services` | Hizmetler | Yeni hizmet ekler |
| PATCH | `/salon/me/services/:serviceId` | Hizmetler | Hizmetin adını, süresini ve fiyatını değiştirir |
| DELETE | `/salon/me/services/:serviceId` | Hizmetler | Hizmeti siler |
| PATCH | `/salon/me/working-hours` | Çalışma saatleri `/panel/calisma-saatleri` | Haftalık çalışma saatlerini kaydeder |
| POST | `/salon/me/blocked-dates` | Çalışma saatleri | Kapalı gün ekler |
| DELETE | `/salon/me/blocked-dates/:id` | Çalışma saatleri | Kapalı günü kaldırır |
| GET | `/salon/me/appointments` | Takvim `/panel/takvim`, Randevular `/panel/randevular` | Salonun randevularını tarihe, duruma ve aramaya göre listeler |
| POST | `/salon/me/appointments` | Takvim, Randevular, "Yeni Randevu" butonu | Telefonla veya yüz yüze gelen randevuyu elle girer |
| PATCH | `/salon/me/appointments/:appointmentId` | Takvim, Randevular | Randevuyu düzenler, tamamlandı veya gelmedi olarak işaretler |
| DELETE | `/salon/me/appointments/:appointmentId` | Takvim, Randevular | Randevuyu iptal eder, müşteriye bildirim gönderir |
| GET | `/salon/me/portfolio` | Portföy `/panel/portfoy` | Portföydeki görselleri listeler |
| POST | `/salon/me/portfolio` | Portföy | Portföye görsel ekler |
| PATCH | `/salon/me/portfolio/:itemId` | Portföy | Görseli yayınlar, gizler veya açıklamasını değiştirir |
| DELETE | `/salon/me/portfolio/:itemId` | Portföy | Görseli portföyden kaldırır |

## Sayfaya göre kullanılan uçlar

### Müşteri

| Sayfa | Uçlar |
| --- | --- |
| Ana sayfa `/` | `GET /salons` |
| Kuaförler `/kuaforler` | `GET /salons` |
| Salon detayı `/kuaforler/[salonId]` | `GET /salons/:salonId`, `/services`, `/working-hours`, `/portfolio`, `/reviews` |
| Randevu al `/kuaforler/[salonId]/randevu` | `GET /salons/:salonId`, `/services`, `/working-hours`, `/blocked-dates`, `/availability`, `POST /appointments` |
| Randevu oluşturuldu `/randevularim/[id]/basarili` | `GET /appointments/:id` |
| Randevularım `/randevularim` | `GET /appointments` |
| Randevu detayı `/randevularim/[id]` | `GET`, `PATCH`, `DELETE /appointments/:id` |
| Değerlendir `/randevularim/[id]/degerlendir` | `GET /appointments/:id`, `POST /uploads`, `POST /appointments/:id/review` |
| Bildirimler `/bildirimler` | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Profil `/profil` | `GET`, `PATCH`, `DELETE /users/me`, `PATCH /users/me/password`, `GET /users/me/reviews`, `POST /auth/logout` |

### Salon paneli

| Sayfa | Uçlar |
| --- | --- |
| Giriş `/panel/giris` | `POST /auth/login` |
| Özet `/panel` | `GET /salon/me/dashboard`, `GET /notifications` |
| Takvim `/panel/takvim` | `GET /salon/me/appointments`, `GET /salons/:salonId/working-hours`, `GET /salons/:salonId/blocked-dates` |
| Randevular `/panel/randevular` | `GET`, `POST`, `PATCH`, `DELETE /salon/me/appointments` |
| Randevu formu | `GET /salon/me/services`, `GET /salons/:salonId/availability`, `POST` / `PATCH /salon/me/appointments` |
| Hizmetler `/panel/hizmetler` | `GET`, `POST`, `PATCH`, `DELETE /salon/me/services` |
| Çalışma saatleri `/panel/calisma-saatleri` | `GET /salons/:salonId/working-hours`, `PATCH /salon/me/working-hours`, `GET /salons/:salonId/blocked-dates`, `POST`, `DELETE /salon/me/blocked-dates` |
| Portföy `/panel/portfoy` | `GET`, `POST`, `PATCH`, `DELETE /salon/me/portfolio`, `POST /uploads` |
| Bildirimler `/panel/bildirimler` | `GET /notifications`, `PATCH /notifications/:id/read`, `DELETE /notifications/:id`, `DELETE /notifications` |
| Profil `/panel/profil` | `GET`, `PATCH /salon/me`, `POST /uploads` |

## Genel kurallar

### Cevap biçimi

Başarılı cevap:

```json
{ "success": true, "data": {} }
```

Hatalı cevap. `message` Türkçedir ve doğrudan kullanıcıya gösterilebilir:

```json
{ "success": false, "message": "Salon bulunamadı." }
```

Form hatalarında alan bazlı liste de gelir, ilgili alanın altına yazılabilir:

```json
{
  "success": false,
  "message": "Hizmet kimliği gerekli.",
  "errors": [
    { "field": "serviceId", "message": "Hizmet kimliği gerekli." },
    { "field": "startTime", "message": "Saat gerekli." }
  ]
}
```

### Hata kodları

| Kod | Ne zaman | Arayüz ne yapmalı |
| --- | --- | --- |
| 200 / 201 | Başarılı | — |
| 400 | Eksik veya hatalı alan, kural ihlali (kapalı gün, mola, geçmiş saat) | `message` gösterilir |
| 401 | Oturum yok veya süresi dolmuş | Bir kez `/auth/refresh` denenir, o da 401 dönerse giriş sayfasına gidilir |
| 403 | Giriş yapılmış ama yetki yok | "Yetkiniz yok" gösterilir |
| 404 | Kayıt yok veya bu kullanıcıya ait değil | "Bulunamadı" ekranı |
| 409 | Çakışma: saat dolu, zaten değerlendirilmiş, e-posta kayıtlı | `message` gösterilir, saat çakışmasında boş saatler yeniden yüklenir |
| 413 | Görsel 5 MB'tan büyük | `message` gösterilir |
| 429 | Çok fazla istek | Biraz beklenip tekrar denenir |

### Kimlik, tarih ve saat

| Alan | Biçim | Örnek |
| --- | --- | --- |
| Kimlik (`id`) | 24 karakterlik metin | `"6ac799ed512b5cde3676ff72"` |
| Randevu ve kapalı gün tarihi | `YYYY-MM-DD` | `"2026-10-09"` |
| Saat | `HH:mm` (24 saat) | `"15:00"` |
| `createdAt`, `updatedAt` | ISO 8601 (UTC) | `"2026-10-08T11:26:36.530Z"` |
| Haftanın günü (`dayOfWeek`) | `0` Pazar … `6` Cumartesi | `1` = Pazartesi |

Randevu tarih ve saatleri salonun yerel saatidir (İstanbul). Randevu saatleri 30 dakikalık dilimlere oturur (`09:00`, `09:30` …).

### Sayfalama

Liste uçları `page` (varsayılan 1) ve `limit` (varsayılan 20, en fazla 50) alır:

```json
{
  "items": [],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

Tanınmayan alanlar sessizce yok sayılır. Örneğin randevu oluştururken `status` veya `price` göndermenin etkisi olmaz, bu değerleri sunucu belirler.

## Oturum yönetimi

| Anahtar | Nerede durur | Ömrü | Nasıl gönderilir |
| --- | --- | --- | --- |
| Giriş anahtarı (access token) | Giriş cevabındaki `data.accessToken`. Bellekte tutulur, `localStorage`'a yazılmaz | 15 dakika | `Authorization: Bearer <anahtar>` başlığı |
| Yenileme anahtarı (refresh token) | `httpOnly` çerez, tarayıcı kendisi yönetir | 7 gün | `/api/auth/*` isteklerinde tarayıcı otomatik ekler |

Çerezin gidip gelebilmesi için bütün isteklerde `credentials: 'include'` kullanılır.

1. Giriş veya kayıt sonrası `accessToken` bellekte saklanır.
2. Sayfa yenilenince uygulama açılışta `POST /auth/refresh` çağırır. 200 dönerse kullanıcı giriş yapmış sayılır, 401 dönerse misafirdir.
3. Bir istek 401 dönerse bir kez `POST /auth/refresh` çağrılır ve istek yeni anahtarla tekrarlanır.
4. Çıkışta `POST /auth/logout` çağrılır ve bellekteki anahtar silinir.

Her yenileme eski yenileme anahtarını geçersiz kılar. Aynı anda iki yenileme isteği gönderilirse ikincisi 401 alır ve güvenlik gereği bütün oturumlar kapanır; bu yüzden yenileme isteği tek seferde yapılmalıdır.

Kök `.env` dosyasındaki `NEXT_PUBLIC_API_URL`, `PORT` ile aynı portu göstermelidir. Sunucudaki `CLIENT_URL` arayüzün adresiyle aynı olmalıdır, yoksa tarayıcı CORS hatası verir.

## Önemli istekler

### Kayıt — `POST /auth/register`

| Alan | Zorunlu | Kural |
| --- | --- | --- |
| `name` | Evet | En fazla 80 karakter |
| `email` | Evet | Geçerli e-posta, küçük harfe çevrilir |
| `password` | Evet | 8–72 karakter |
| `phone` | Hayır | Rakam, boşluk, `+ ( ) -` |
| `role` | Hayır | `CUSTOMER` (varsayılan) veya `SALON` |
| `salon` | `role` `SALON` ise evet | `name`, `city`, `district` zorunlu; `neighborhood`, `address`, `phone`, `coordinates` isteğe bağlı |

```json
{ "name": "Elif Kaya", "email": "elif@ornek.com", "password": "en-az-8-karakter", "phone": "0532 555 12 34" }
```

Salon hesabı açılınca salon kaydı ve varsayılan çalışma saatleri (Pazartesi–Cumartesi 09:00–19:00, 12:00–13:00 mola, Pazar kapalı) otomatik oluşur.

### Giriş — `POST /auth/login`

```json
{ "email": "elif.kaya@posta.com", "password": "Salonabox123" }
```

Cevapta kullanıcı, salon hesabıysa salon bilgisi ve `accessToken` gelir; yenileme anahtarı çerez olarak ayrıca gelir.

### Salon arama — `GET /salons`

| Parametre | Açıklama |
| --- | --- |
| `search` | Salon adı, mahalle, ilçe, şehir, hizmet adı ve saç stillerinde arar; büyük/küçük harf ve Türkçe karakter duyarsızdır |
| `city`, `district` | Tam eşleşme (`İstanbul`, `Kadıköy`) |
| `category` | Virgülle ayrılmış kategori listesi: `kesim,boya` |
| `hairStyle` | Virgülle ayrılmış saç stili listesi: `Bob,Uzun` |
| `rating` | En düşük puan: `4.5` |
| `lat`, `lng` | Kullanıcının konumu, ikisi birlikte gönderilir. Gönderilirse her salona `distanceKm` eklenir |
| `distance` | En fazla uzaklık (km, en çok 100), `lat` ve `lng` gerektirir |
| `availability` | `today`, `tomorrow`, `week`: bu sürede boş saati olan salonlar |
| `sort` | `rating` (varsayılan), `popular`, `price`, `newest`, `nearest` (`lat` ve `lng` gerektirir) |
| `page`, `limit` | Sayfalama |

Arayüzdeki filtre adlarının karşılıkları:

| Arayüz (adres çubuğu) | API |
| --- | --- |
| `q` | `search` |
| `hizmet` | `category` |
| `stil` | `hairStyle` |
| `puan` | `rating` (0 ise gönderilmez) |
| `mesafe` | `distance` + `lat` + `lng` |
| `uygunluk` | `availability` (`any` ise gönderilmez) |
| `sirala`: `puan` / `yakin` / `populer` | `sort`: `rating` / `nearest` / `popular` |
| `sayfa` | `page` (+ `limit=6`) |

Kullanıcı konum izni vermediyse `lat`, `lng`, `distance` gönderilmez ve "En yakın" sıralaması kapatılır; aksi halde 400 döner.

### Boş saatler — `GET /salons/:salonId/availability`

| Parametre | Zorunlu | Açıklama |
| --- | --- | --- |
| `serviceId` | Evet | Bu salonun aktif bir hizmeti |
| `date` | Evet | `YYYY-MM-DD` |
| `excludeAppointmentId` | Hayır | Randevu düzenlenirken kendi saatinin dolu görünmemesi için |

```json
{
  "date": "2026-10-13",
  "service": { "id": "6ac799e9512b5cde3676ff5f", "name": "Saç Kesimi", "duration": 45, "price": 600 },
  "slotInterval": 30,
  "isClosed": false,
  "slots": [
    { "time": "09:00", "endTime": "09:45", "available": true },
    { "time": "09:30", "endTime": "10:15", "available": false }
  ]
}
```

Hangi saatin müsait olduğuna yalnızca sunucu karar verir, arayüz sonucu gösterir.

### Randevu alma — `POST /appointments`

| Alan | Zorunlu | Açıklama |
| --- | --- | --- |
| `salonId` | Evet | |
| `serviceId` | Evet | O salonun aktif bir hizmeti |
| `date` | Evet | `YYYY-MM-DD` |
| `startTime` | Evet | Boş saatler cevabındaki `time` değeri |
| `notes` | Hayır | En fazla 500 karakter |

```json
{ "salonId": "6ac799ed512b5cde3676ff72", "serviceId": "6ac799ef512b5cde3676ff7a", "date": "2026-10-10", "startTime": "15:00" }
```

Onay adımı yoktur, randevu doğrudan `BOOKED` olur; müşteriye ve salona bildirim gider.

| Hata | Sebep |
| --- | --- |
| 400 | Kapalı gün, çalışma saati dışı, mola, geçmiş saat, 30 dakikaya uymayan saat, 90 günden ileri tarih |
| 404 | Salon veya hizmet bulunamadı |
| 409 | Saat az önce başka bir müşteri tarafından alındı, boş saatler yeniden yüklenmeli |

## Sabit değerler

### Randevu durumları

| Değer | Etiket | Açıklama |
| --- | --- | --- |
| `BOOKED` | Randevu alındı | Aktif randevu, her randevu bu durumda başlar |
| `COMPLETED` | Tamamlandı | Salon tamamladı, değerlendirilebilir |
| `CANCELLED` | İptal edildi | Müşteri veya salon iptal etti |
| `NO_SHOW` | Gelinmedi | Müşteri gelmedi |

`BOOKED` dışındaki durumlar son durumdur, bu randevular değiştirilemez.

### Roller ve randevu kaynağı

| Değer | Anlamı |
| --- | --- |
| `CUSTOMER` | Müşteri |
| `SALON` | Salon sahibi |
| `ONLINE` | Randevuyu müşteri aldı |
| `MANUAL` | Randevuyu salon elle girdi |

### Hizmet kategorileri

| Değer | Etiket |
| --- | --- |
| `kesim` | Saç Kesimi |
| `boya` | Boya |
| `balayage` | Balayage |
| `ombre` | Ombre |
| `rofle` | Röfle |
| `fon` | Fön |
| `gelin` | Gelin Saçı |
| `diger` | Diğer |

### Bildirim türleri

| Tür | Kime gider | Tıklanınca |
| --- | --- | --- |
| `APPOINTMENT_CREATED` | Müşteri ve salon | Müşteri: `/randevularim/[id]`, salon: randevu detayı |
| `APPOINTMENT_UPDATED` | Değişikliği yapmayan taraf | Aynı |
| `APPOINTMENT_CANCELLED` | Müşteri; müşteri iptal ettiyse salon da | Aynı |
| `APPOINTMENT_COMPLETED` | Müşteri | `/randevularim/[id]` |
| `REVIEW_REQUESTED` | Müşteri | `/randevularim/[id]/degerlendir` |
| `REVIEW_PUBLISHED` | Salon | `/panel/portfoy` |

### Sınırlar

| Konu | Sınır |
| --- | --- |
| Randevu saat aralığı | 30 dakika |
| En ileri randevu tarihi | 90 gün |
| Değerlendirme fotoğrafı | En fazla 4 |
| Görsel boyutu | En fazla 5 MB (JPG, PNG, WebP) |
| Genel istek sınırı | 15 dakikada 600 |
| Giriş, kayıt, yenileme, şifre işlemleri | 15 dakikada 20 |
| Görsel yükleme | 15 dakikada 60 |
