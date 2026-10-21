# SalonaBOX API

Kuaför / güzellik salonu randevu platformunun REST API'si. Express 5, MongoDB (Mongoose) ve JWT ile çalışır. Kullanılan bütün paketler açık kaynak ve ücretsizdir.

Her ucun istek / cevap detayları için: [docs/API.md](docs/API.md)

## Kurulum

```bash
npm install
npm run seed     # örnek veriyi yazar
npm run dev      # http://localhost:5000/api
```

`.env` dosyası:

| Değişken | Açıklama |
| --- | --- |
| `MONGODB_URI` | MongoDB bağlantı adresi (yerel MongoDB veya MongoDB Atlas ücretsiz M0) |
| `JWT_SECRET` | Access token imza anahtarı |
| `JWT_REFRESH_SECRET` | Refresh token imza anahtarı (`JWT_SECRET` ile aynı olamaz) |
| `PORT` | Varsayılan `5000` |
| `CLIENT_URL` | CORS için izin verilen adresler, virgülle ayrılır. Varsayılan `http://localhost:3000` |
| `SEED_PASSWORD` | Örnek hesapların şifresi. Varsayılan `Salonabox123` |

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Sunucuyu değişiklikleri izleyerek başlatır |
| `npm start` | Sunucuyu başlatır |
| `npm run seed` | Veritabanı boşsa örnek veriyi yazar (`-- --reset` ile sıfırlar) |
| `npm test` | Testleri in-memory MongoDB üzerinde çalıştırır |
| `npm run lint` | ESLint |

## Klasör yapısı

```
src/
  routes/        uçların tanımı (hangi URL hangi controller'a gider)
  controllers/   istek / cevap katmanı
  services/      iş kuralları ve veritabanı işlemleri
  models/        Mongoose şemaları
  validators/    Zod ile girdi doğrulama
  middlewares/   auth, rate limit, upload, hata yakalama
  utils/         token, saat, cevap yardımcıları
  config/        env ve veritabanı bağlantısı
```

## Hangi API neye ait

Bütün uçlar `/api` ile başlar. **Yetki** sütunu: herkese açık, giriş yapmış herhangi bir kullanıcı, yalnızca müşteri (`CUSTOMER`) veya yalnızca salon sahibi (`SALON`).

### Sistem

| Metot | Uç | Yetki | Ne işe yarar |
| --- | --- | --- | --- |
| GET | `/health` | Herkes | Sunucunun ayakta olduğunu kontrol eder |

### Kimlik doğrulama — `auth.routes.js`

Müşteri ve salon sahibi girişi, kayıt ve oturum yenileme.

| Metot | Uç | Yetki | Ne işe yarar |
| --- | --- | --- | --- |
| POST | `/auth/register` | Herkes | Yeni hesap oluşturur |
| POST | `/auth/login` | Herkes | E-posta ve şifre ile giriş, token döner |
| POST | `/auth/refresh` | Herkes | Refresh token ile yeni access token alır |
| POST | `/auth/logout` | Herkes | Refresh token'ı geçersiz kılar |
| GET | `/auth/me` | Giriş yapmış | Oturumdaki kullanıcıyı döner |

### Kullanıcı hesabı — `user.routes.js`

Müşterinin profil sayfası (`/profil`).

| Metot | Uç | Yetki | Ne işe yarar |
| --- | --- | --- | --- |
| GET | `/users/me` | Giriş yapmış | Profil bilgileri |
| PATCH | `/users/me` | Giriş yapmış | Profil güncelleme |
| PATCH | `/users/me/password` | Giriş yapmış | Şifre değiştirme |
| DELETE | `/users/me` | Müşteri | Hesabı silme |
| GET | `/users/me/appointments` | Müşteri | Müşterinin randevuları |
| GET | `/users/me/reviews` | Müşteri | Müşterinin yaptığı değerlendirmeler |
| GET | `/users/me/notifications` | Giriş yapmış | Kullanıcının bildirimleri |

### Salonlar (herkese açık) — `salon.routes.js`

Ana sayfa, kuaför arama (`/kuaforler`) ve salon detay sayfası (`/kuaforler/:salonId`).

| Metot | Uç | Yetki | Ne işe yarar |
| --- | --- | --- | --- |
| GET | `/salons` | Herkes | Salon listesi; arama, filtre, sıralama ve sayfalama |
| GET | `/salons/:salonId` | Herkes | Salon detayı |
| GET | `/salons/:salonId/services` | Herkes | Salonun aktif hizmetleri |
| GET | `/salons/:salonId/working-hours` | Herkes | Haftalık çalışma saatleri |
| GET | `/salons/:salonId/blocked-dates` | Herkes | Salonun kapalı olduğu günler |
| GET | `/salons/:salonId/availability` | Herkes | Seçilen gün ve hizmet için boş saatler (randevu ekranı) |
| GET | `/salons/:salonId/portfolio` | Herkes | Portföy görselleri |
| GET | `/salons/:salonId/reviews` | Herkes | Salon değerlendirmeleri |

### Randevular (müşteri) — `appointment.routes.js`

Randevu alma (`/kuaforler/:salonId/randevu`), randevularım (`/randevularim`) ve değerlendirme ekranı.

| Metot | Uç | Yetki | Ne işe yarar |
| --- | --- | --- | --- |
| POST | `/appointments` | Müşteri | Yeni randevu oluşturur |
| GET | `/appointments` | Müşteri | Müşterinin randevu listesi |
| GET | `/appointments/:appointmentId` | Müşteri | Randevu detayı |
| PATCH | `/appointments/:appointmentId` | Müşteri | Randevunun saatini / hizmetini değiştirir |
| DELETE | `/appointments/:appointmentId` | Müşteri | Randevuyu iptal eder |
| POST | `/appointments/:appointmentId/review` | Müşteri | Tamamlanan randevuya değerlendirme yazar |

### Bildirimler — `notification.routes.js`

Müşteri (`/bildirimler`) ve panel (`/panel/bildirimler`) bildirim ekranları.

| Metot | Uç | Yetki | Ne işe yarar |
| --- | --- | --- | --- |
| GET | `/notifications` | Giriş yapmış | Bildirim listesi |
| PATCH | `/notifications/read-all` | Giriş yapmış | Hepsini okundu yapar |
| PATCH | `/notifications/:notificationId/read` | Giriş yapmış | Tek bildirimi okundu yapar |

### Görsel yükleme — `upload.routes.js`

Görseller MongoDB GridFS'te saklanır; harici bir dosya servisi kullanılmaz. JPG, PNG ve WebP kabul edilir.

| Metot | Uç | Yetki | Ne işe yarar |
| --- | --- | --- | --- |
| POST | `/uploads` | Giriş yapmış | Görsel yükler (`multipart/form-data`) |
| GET | `/uploads/:fileId` | Herkes | Görseli döner |

### Salon paneli — `salonPanel.routes.js`

Kuaför paneli (`/panel/...`). Bütün uçlar yalnızca salon sahibine açıktır ve her zaman oturumdaki kullanıcının kendi salonu üzerinde çalışır.

| Metot | Uç | Ne işe yarar | Panel ekranı |
| --- | --- | --- | --- |
| GET | `/salon/me` | Salon profili | Profil |
| PATCH | `/salon/me` | Salon profilini günceller | Profil |
| GET | `/salon/me/dashboard` | Günün özeti, doluluk, yaklaşan randevular | Genel bakış |
| GET | `/salon/me/services` | Hizmet listesi (pasifler dahil) | Hizmetler |
| POST | `/salon/me/services` | Hizmet ekler | Hizmetler |
| PATCH | `/salon/me/services/:serviceId` | Hizmeti günceller | Hizmetler |
| DELETE | `/salon/me/services/:serviceId` | Hizmeti siler | Hizmetler |
| PATCH | `/salon/me/working-hours` | Çalışma saatlerini günceller | Çalışma saatleri |
| POST | `/salon/me/blocked-dates` | Kapalı gün ekler | Çalışma saatleri / Takvim |
| DELETE | `/salon/me/blocked-dates/:id` | Kapalı günü kaldırır | Çalışma saatleri / Takvim |
| GET | `/salon/me/appointments` | Salonun randevuları | Randevular / Takvim |
| POST | `/salon/me/appointments` | Elle randevu girer (telefon, yüz yüze) | Randevular / Takvim |
| PATCH | `/salon/me/appointments/:appointmentId` | Randevuyu günceller, tamamlandı / gelmedi işaretler | Randevular / Takvim |
| DELETE | `/salon/me/appointments/:appointmentId` | Randevuyu iptal eder | Randevular / Takvim |
| GET | `/salon/me/portfolio` | Portföy listesi | Portföy |
| POST | `/salon/me/portfolio` | Portföye görsel ekler | Portföy |
| PATCH | `/salon/me/portfolio/:itemId` | Portföy görselini günceller / yayınlar | Portföy |
| DELETE | `/salon/me/portfolio/:itemId` | Portföy görselini siler | Portföy |

## Cevap formatı

```json
{ "success": true, "data": {} }
{ "success": false, "message": "Salon bulunamadı." }
```

## İstek limitleri

| Kapsam | Limit (15 dakikada) |
| --- | --- |
| Bütün `/api` | 600 istek |
| Giriş, kayıt, şifre işlemleri | 20 istek |
| Görsel yükleme | 60 istek |
