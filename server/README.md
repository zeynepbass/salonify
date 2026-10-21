# SalonaBOX API

Kuaför ve güzellik salonu randevu platformunun sunucu tarafı. Express 5, MongoDB (Mongoose) ve JWT ile çalışır. Kullanılan bütün paketler açık kaynak ve ücretsizdir.

Her ucun gönderilen ve dönen alanlarının ayrıntısı için: [docs/API.md](docs/API.md)

## Kurulum

```bash
npm install
npm run seed     # örnek veriyi yazar
npm run dev      # http://localhost:5000/api
```

`server` klasöründe bir `.env` dosyası oluşturulur:

| Değişken | Açıklama |
| --- | --- |
| `MONGODB_URI` | MongoDB bağlantı adresi (yerel MongoDB veya MongoDB Atlas ücretsiz paket) |
| `JWT_SECRET` | Giriş anahtarının (access token) imza şifresi |
| `JWT_REFRESH_SECRET` | Yenileme anahtarının (refresh token) imza şifresi, `JWT_SECRET` ile aynı olamaz |
| `PORT` | Sunucu portu, varsayılan `5000` |
| `CLIENT_URL` | Arayüzün adresi, birden fazlaysa virgülle ayrılır. Varsayılan `http://localhost:3000` |
| `SEED_PASSWORD` | Örnek hesapların şifresi, varsayılan `Salonabox123` |

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Sunucuyu başlatır, dosya değişince yeniden başlatır |
| `npm start` | Sunucuyu başlatır |
| `npm run seed` | Veritabanı boşsa örnek veriyi yazar, `npm run seed -- --reset` her şeyi silip baştan yazar |
| `npm test` | Testleri geçici bir veritabanında çalıştırır |
| `npm run lint` | Kod kontrolü |

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
| PATCH | `/users/me` | Profil `/profil` | Profil bilgilerini ve bildirim tercihlerini kaydeder | Giriş yapmış |
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
| PATCH | `/salon/me/services/:serviceId` | Hizmetler | Hizmetin adını, süresini, fiyatını değiştirir veya pasife alır |
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
| Bildirimler `/panel/bildirimler` | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Profil `/panel/profil` | `GET`, `PATCH /salon/me`, `POST /uploads` |

## Cevap biçimi

Başarılı cevap:

```json
{ "success": true, "data": {} }
```

Hatalı cevap, `message` doğrudan kullanıcıya gösterilebilir:

```json
{ "success": false, "message": "Salon bulunamadı." }
```

## İstek limitleri

| Kapsam | 15 dakikadaki en fazla istek |
| --- | --- |
| Bütün API | 600 |
| Giriş, kayıt, şifre işlemleri | 20 |
| Görsel yükleme | 60 |
