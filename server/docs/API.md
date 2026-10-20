# SalonaBOX API Rehberi

Frontend'i (`web-box`) API'ye bağlarken bakılacak başvuru dokümanı. Her uç için ne işe yaradığı, ne gönderileceği, ne döneceği ve hangi hataların beklenmesi gerektiği yazılıdır.

- [1. Başlarken](#1-başlarken)
- [2. Genel kurallar](#2-genel-kurallar)
- [3. Oturum yönetimi](#3-oturum-yönetimi)
- [4. Mock veriden API'ye alan eşlemesi](#4-mock-veriden-apiye-alan-eşlemesi)
- [5. Hangi ekran hangi ucu kullanır](#5-hangi-ekran-hangi-ucu-kullanır)
- [6. Auth](#6-auth)
- [7. Kullanıcı](#7-kullanıcı)
- [8. Salonlar (herkese açık)](#8-salonlar-herkese-açık)
- [9. Müsaitlik](#9-müsaitlik)
- [10. Randevular (müşteri)](#10-randevular-müşteri)
- [11. Değerlendirme](#11-değerlendirme)
- [12. Bildirimler](#12-bildirimler)
- [13. Görsel yükleme](#13-görsel-yükleme)
- [14. Salon paneli](#14-salon-paneli)
- [15. Sabit değerler](#15-sabit-değerler)

---

## 1. Başlarken

| | |
| --- | --- |
| Temel adres (yerel) | `http://localhost:5000/api` |
| İçerik türü | `application/json` (görsel yükleme hariç) |
| Sağlık kontrolü | `GET /api/health` |

### Örnek veri

```bash
npm run seed              # veritabanı boşsa örnek veriyi yazar
npm run seed -- --reset   # bütün veriyi silip baştan yazar
```

Örnek veri, frontend'deki mock dosyalarıyla aynı 8 salonu ve aynı kişileri içerir. Tarihler script'in çalıştığı güne göre hesaplanır; veriler eskidiğinde `--reset` ile yenilenebilir.

Bütün örnek hesapların şifresi: **`Salonabox123`**

| Hesap | E-posta | İçinde ne var |
| --- | --- | --- |
| Müşteri | `elif.kaya@posta.com` | 2 yaklaşan randevu, değerlendirilmeyi bekleyen 1 tamamlanmış randevu, değerlendirilmiş 2 randevu (biri özel), 1 iptal, 1 gelinmedi, 5 bildirim (3'ü okunmamış) |
| Salon | `ayse@ayseyilmazstudio.com` | Ayşe Yılmaz Studio: 7 aktif + 1 pasif hizmet, bugün ve ileri tarihli randevular (online ve elle girilmiş), geçmiş randevular, 5 değerlendirme (biri izinsiz), 7 portföy görseli, 1 kapalı gün, 4 bildirim |
| Diğer müşteriler | `zeynep.bas@`, `selin.aksoy@`, `mert.gunes@`, `gizem.tan@`, `asli.er@` + `posta.com` | Ayşe Yılmaz Studio'daki randevu ve yorumların sahipleri |
| Diğer salonlar | `nur@ateliernur.com`, `kerem@kesikhairlab.com`, `hakan@formkuafor.com`, `isik@tonisik.com`, `deniz@mavimakas.com`, `lina@linahairatelier.com`, `kuzey@kuzeysacevi.com` | Hizmetler, 2 portföy görseli, en az 1 değerlendirme |

Portföyde üç durumun da örneği vardır: yayında olan müşteri fotoğrafı (Zeynep Baş), izin verilmiş ama henüz yayınlanmamış (Gizem Tan) ve izin verilmemiş (Aslı Er).

---

## 2. Genel kurallar

### Cevap zarfı

Başarılı her cevap:

```json
{ "success": true, "data": { } }
```

Hatalı her cevap:

```json
{ "success": false, "message": "Salon bulunamadı." }
```

`message` kullanıcıya doğrudan gösterilebilecek Türkçe bir metindir (toast için uygundur). Doğrulama hatalarında alan bazlı liste de gelir; formda ilgili alanın altına yazmak için kullanılabilir:

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

### HTTP kodları

| Kod | Ne zaman | Frontend ne yapmalı |
| --- | --- | --- |
| 200 / 201 | Başarılı | — |
| 400 | Eksik/hatalı alan ya da kural ihlali (kapalı gün, mola, geçmiş saat) | `message` göster |
| 401 | Token yok, geçersiz ya da süresi dolmuş | Bir kez `/auth/refresh` dene; o da 401 ise giriş ekranına yönlendir |
| 403 | Giriş var ama rol yetmiyor | "Yetkiniz yok" göster |
| 404 | Kayıt yok ya da bu kullanıcıya ait değil | "Bulunamadı" ekranı |
| 409 | Çakışma: saat dolu, zaten değerlendirilmiş, e-posta kayıtlı, randevu artık aktif değil | `message` göster; saat çakışmasında slotları yeniden yükle |
| 413 | Görsel 5 MB'tan büyük | `message` göster |
| 429 | Çok fazla istek | Biraz bekleyip tekrar dene |

### Kimlikler

Bütün kayıtlarda kimlik alanı `id`'dir (24 karakterlik string). Mock verideki `1`, `"a1"`, `"kesim"` gibi kimliklerin yerini alır.

### Tarih ve saat

| Alan türü | Biçim | Örnek |
| --- | --- | --- |
| Randevu / kapalı gün tarihi | `YYYY-MM-DD` | `"2026-10-09"` |
| Saat | `HH:mm` (24 saat) | `"15:00"` |
| `createdAt`, `updatedAt` | ISO 8601 (UTC) | `"2026-10-08T11:26:36.530Z"` |
| Haftanın günü (`dayOfWeek`) | `0` = Pazar … `6` = Cumartesi | `1` = Pazartesi |

Randevu tarih ve saatleri salonun yerel saatidir (İstanbul); saat dilimi dönüşümü yapılmaz. Randevu saatleri 30 dakikalık dilimlere oturmalıdır (`09:00`, `09:30` …).

### Sayfalama

Liste uçları `page` (varsayılan 1) ve `limit` (varsayılan 20, en fazla 50) alır ve şunu döner:

```json
{
  "items": [],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

### Fazladan alanlar

API tanımadığı alanları sessizce yok sayar. Örneğin randevu oluştururken `status` ya da `price` göndermek hata vermez ama etkisi de olmaz; bu değerler sunucuda belirlenir.

---

## 3. Oturum yönetimi

İki token vardır:

| Token | Nerede durur | Ömrü | Nasıl gönderilir |
| --- | --- | --- | --- |
| Access token | Giriş cevabında `data.accessToken`. Bellekte (state/context) tutulmalı, `localStorage`'a yazılmamalı | 15 dakika | `Authorization: Bearer <token>` |
| Refresh token | `httpOnly` cookie; JavaScript göremez, tarayıcı kendisi yönetir | 7 gün | `/api/auth/*` isteklerinde tarayıcı otomatik ekler |

Cookie'nin gidip gelebilmesi için **bütün isteklerde `credentials: 'include'`** kullanılmalıdır.

### Akış

1. Giriş/kayıt → `accessToken` bellekte saklanır.
2. Sayfa yenilenince bellek boşalır → uygulama açılışında `POST /auth/refresh` çağrılır. 200 dönerse kullanıcı hâlâ giriş yapmış demektir; 401 dönerse misafirdir.
3. Herhangi bir istek 401 dönerse → bir kez `POST /auth/refresh`, ardından isteği yeni token'la tekrarla.
4. Çıkış → `POST /auth/logout`, bellekteki token silinir.

Her `refresh` çağrısı eski refresh token'ı geçersiz kılar. Aynı anda iki `refresh` isteği gönderilirse ikincisi 401 alır ve güvenlik gereği bütün oturumlar kapanır; bu yüzden refresh isteği tekilleştirilmelidir (aşağıdaki örnekte olduğu gibi).

### Örnek istemci

```js
const API_URL = process.env.NEXT_PUBLIC_API_URL; // http://localhost:5000/api

let accessToken = null;
let refreshing = null;

export const setAccessToken = (token) => { accessToken = token; };

// Aynı anda birden fazla istek 401 alırsa tek bir refresh çağrısı yapılır.
function refreshSession() {
  refreshing ??= fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then((res) => (res.ok ? res.json() : null))
    .then((body) => {
      accessToken = body?.data.accessToken ?? null;
      return body?.data ?? null; // { user, salon?, accessToken }
    })
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function api(path, { method = 'GET', body, query, retry = true } = {}) {
  const url = new URL(`${API_URL}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) url.searchParams.set(key, value);
  });

  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: body && JSON.stringify(body),
  });

  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    const session = await refreshSession();
    if (session) return api(path, { method, body, query, retry: false });
  }

  const json = await res.json();
  if (!json.success) {
    const error = new Error(json.message);
    error.status = res.status;
    error.fields = json.errors ?? [];
    throw error;
  }
  return json.data;
}
```

Kullanım:

```js
const { items, pagination } = await api('/salons', { query: { category: 'kesim,boya', sort: 'rating' } });
const appointment = await api('/appointments', { method: 'POST', body: { salonId, serviceId, date, startTime } });
```

`.env.local` (frontend): `NEXT_PUBLIC_API_URL=http://localhost:5000/api`. Backend'in `.env` dosyasındaki `CLIENT_URL` frontend adresiyle (`http://localhost:3000`) aynı olmalıdır; aksi halde tarayıcı CORS hatası verir.

---

## 4. Mock veriden API'ye alan eşlemesi

### Salon (`data/mock/salons.js`)

| Mock | API | Not |
| --- | --- | --- |
| `id` (sayı) | `id` (string) | |
| `name`, `neighborhood`, `district`, `city`, `address`, `phone`, `email`, `audience`, `description`, `hairStyles` | aynı | |
| `rating`, `reviewCount`, `startingPrice` | aynı | Sunucuda hesaplanır |
| `featuredServiceIds` | `categories` | Salonun aktif hizmetlerinin kategorileri (`["kesim", "boya"]`) |
| `distanceKm` | `distanceKm` | Yalnızca istekte `lat` ve `lng` gönderilirse gelir |
| `popularity` | — | `sort=popular` kullanılır (yorum sayısına göre) |
| `nextAvailableInDays` | — | `availability=today|tomorrow|week` filtresi kullanılır |
| — | `coverImage`, `coordinates` | Yeni alanlar |

### Hizmet (`data/mock/services.js`)

| Mock | API | Not |
| --- | --- | --- |
| `id` (`"kesim"`) | `id` (string) | Her salonun hizmeti ayrı bir kayıttır |
| — | `category` | Mock'taki `id`'nin karşılığı: `kesim`, `boya` … İkon seçimi için bu kullanılır |
| `name`, `duration`, `price` | aynı | |
| `active` | `isActive` | |
| — | `description` | |

### Çalışma saatleri (`data/mock/workingHours.js`)

| Mock | API |
| --- | --- |
| `weekday` | `dayOfWeek` |
| `open: true` | `isClosed: false` (tersi) |
| `start`, `end` | `openTime`, `closeTime` |
| `breakStart`, `breakEnd` | `breaks: [{ start, end }]` (birden fazla mola olabilir) |
| `closedDays: [{ date, note }]` | Kapalı günler: `{ id, date, note }` |

### Randevu (`data/mock/appointments.js`)

| Mock | API | Not |
| --- | --- | --- |
| `id`, `reference` | aynı | |
| `salonId` | `salon` | Müşteri uçlarında nesne (`{ id, name, neighborhood, … }`), panel uçlarında yalnızca id |
| `serviceId` | `service` (id) + `serviceName`, `duration`, `price` | Hizmet bilgisi randevunun üzerinde gelir; ayrıca hizmeti aramaya gerek yok |
| `date` | `date` | |
| `time` | `startTime` | `endTime` de gelir |
| `status` | `status` | Aynı dört değer |
| `reviewed` | `isReviewed` | |
| `customer` (isim) | `customerName` | `customer` alanı artık kullanıcı id'si (elle girilen randevuda `null`) |
| `phone` | `customerPhone` | |
| `note` | `notes` | |
| `source: "online" / "manual"` | `source: "ONLINE" / "MANUAL"` | |
| — | `cancellationReason` | |

`canComplete`, `canEdit`, `canReview` gibi türetilen alanlar frontend'de hesaplanmaya devam eder: `canReview = status === "COMPLETED" && !isReviewed`.

### Değerlendirme (`data/mock/reviews.js`)

| Mock | API |
| --- | --- |
| `author` | `authorName` |
| `text` | `comment` |
| `date` | `createdAt` |
| `serviceId` | `serviceName` |
| `hasPhoto` | `hairPhotos` (adres dizisi), `hairPhoto` (ilki) |
| `shared` (`myReviews`) | `isPublic` |
| `ratingDistribution[].percent` | `summary.distribution[].percent` |

### Portföy (`data/mock/portfolio.js`)

| Mock | API |
| --- | --- |
| `customer` | `customerName` |
| `serviceId` | `title` (müşteri fotoğrafında hizmet adı) |
| `consent` | `hasConsent` |
| `published` | `isPublished` |
| `date` | `createdAt` |
| — | `image`, `description`, `source` (`SALON` / `REVIEW`) |

### Bildirim (`data/mock/notifications.js`)

| Mock | API | Not |
| --- | --- | --- |
| `type` (`booked`, `updated` …) | `type` | [Eşleme tablosu](#bildirim-tipleri) |
| `title`, `body` | aynı | |
| `unread` | `isRead` (tersi) | |
| `time` ("2 saat önce") | `createdAt` | Göreli metni frontend üretir |
| `href`, `appointmentId` | `appointment` (id) | Bağlantıyı frontend kurar |

### Kullanıcı (`data/mock/users.js`)

| Mock | API |
| --- | --- |
| `name`, `email`, `phone`, `notificationPreferences` | aynı |
| `memberSince` | `createdAt` |
| `salonOwner.salonId` | Giriş cevabındaki `salon.id` |

---

## 5. Hangi ekran hangi ucu kullanır

### Müşteri

| Ekran (rota) | Uçlar |
| --- | --- |
| Ana sayfa `/` | `GET /salons?sort=rating&limit=…`, `GET /salons?sort=popular`, yakındakiler için `GET /salons?lat&lng&distance=5&sort=nearest` |
| Arama `/kuaforler` | `GET /salons` (bütün filtreler) |
| Salon detayı `/kuaforler/[salonId]` | `GET /salons/:salonId`, `GET /salons/:salonId/reviews` |
| Randevu al `/kuaforler/[salonId]/randevu` | `GET /salons/:salonId` (hizmetler, çalışma saatleri, kapalı günler), `GET /salons/:salonId/availability`, `POST /appointments` |
| Randevu başarılı `/randevularim/[id]/basarili` | `GET /appointments/:id` |
| Randevularım `/randevularim` | `GET /appointments?scope=upcoming`, `GET /appointments?scope=past` |
| Randevu detayı `/randevularim/[id]` | `GET /appointments/:id`, `DELETE /appointments/:id` |
| Değerlendir `/randevularim/[id]/degerlendir` | `GET /appointments/:id`, `POST /uploads` (fotoğraf başına), `POST /appointments/:id/review` |
| Bildirimler `/bildirimler` | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Profil `/profil` | `GET /users/me`, `PATCH /users/me`, `GET /users/me/reviews`, `PATCH /users/me/password`, `DELETE /users/me` |

### Salon paneli

| Ekran (rota) | Uçlar |
| --- | --- |
| Giriş `/panel/giris` | `POST /auth/login` (cevapta `user.role === "SALON"` kontrol edilir) |
| Özet `/panel` | `GET /salon/me/dashboard`, `GET /notifications?limit=3` |
| Takvim `/panel/takvim` | `GET /salon/me/appointments?from&to&limit=200`, `GET /salons/:salonId/working-hours`, `GET /salons/:salonId/blocked-dates` |
| Randevular `/panel/randevular` | `GET /salon/me/appointments?scope&search`, `PATCH` ve `DELETE /salon/me/appointments/:id` |
| Randevu formu (yeni/düzenle) | `GET /salon/me/services`, `GET /salons/:salonId/availability` (düzenlemede `excludeAppointmentId` ile), `POST` / `PATCH /salon/me/appointments` |
| Hizmetler `/panel/hizmetler` | `GET`, `POST`, `PATCH`, `DELETE /salon/me/services` |
| Çalışma saatleri `/panel/calisma-saatleri` | `GET /salons/:salonId/working-hours`, `PATCH /salon/me/working-hours`, `GET /salons/:salonId/blocked-dates`, `POST` ve `DELETE /salon/me/blocked-dates` |
| Portföy `/panel/portfoy` | `GET /salon/me/portfolio`, `PATCH /salon/me/portfolio/:itemId` (yayınla/gizle), `POST /uploads` + `POST /salon/me/portfolio` |
| Bildirimler `/panel/bildirimler` | Müşteriyle aynı bildirim uçları |
| Profil `/panel/profil` | `GET /salon/me`, `PATCH /salon/me`, `POST /uploads` (kapak görseli) |

---

## 6. Auth

### `POST /auth/register`

Yeni hesap açar ve oturumu başlatır. Giriş gerektirmez.

| Alan | Tür | Zorunlu | Kural |
| --- | --- | --- | --- |
| `name` | string | Evet | En fazla 80 karakter |
| `email` | string | Evet | Geçerli e-posta; küçük harfe çevrilir |
| `password` | string | Evet | 8–72 karakter |
| `phone` | string | Hayır | Rakam, boşluk, `+ ( ) -` |
| `role` | string | Hayır | `CUSTOMER` (varsayılan) veya `SALON` |
| `salon` | nesne | `role: "SALON"` ise evet | Aşağıda |

`salon` nesnesi:

| Alan | Zorunlu | Not |
| --- | --- | --- |
| `name` | Evet | Salon adı |
| `city`, `district` | Evet | |
| `neighborhood`, `address`, `phone` | Hayır | |
| `coordinates` | Hayır | `{ "lat": 40.979, "lng": 29.025 }` |

Müşteri kaydı:

```json
{ "name": "Elif Kaya", "email": "elif@ornek.com", "password": "en-az-8-karakter", "phone": "0532 555 12 34" }
```

Salon kaydı:

```json
{
  "name": "Ayşe Yılmaz",
  "email": "ayse@ornek.com",
  "password": "en-az-8-karakter",
  "role": "SALON",
  "salon": { "name": "Ayşe Yılmaz Studio", "city": "İstanbul", "district": "Kadıköy", "neighborhood": "Moda" }
}
```

Cevap `201` — giriş cevabıyla aynıdır (aşağıda). Salon hesabında salon kaydı ve varsayılan çalışma saatleri (Pzt–Cmt 09:00–19:00, 12:00–13:00 mola, Pazar kapalı) otomatik oluşur.

| Hata | Sebep |
| --- | --- |
| 400 | Eksik/hatalı alan; `SALON` seçilip `salon` gönderilmemesi |
| 409 | `Bu e-posta adresiyle kayıtlı bir hesap var.` |

### `POST /auth/login`

```json
{ "email": "elif.kaya@posta.com", "password": "Salonabox123" }
```

Cevap `200` (refresh token cookie olarak ayrıca gelir):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6ac799e5512b5cde3676ff4f",
      "name": "Elif Kaya",
      "email": "elif.kaya@posta.com",
      "phone": "0532 555 12 34",
      "role": "CUSTOMER",
      "location": { "city": "İstanbul", "district": "Kadıköy" },
      "notificationPreferences": { "email": true, "sms": true, "reminder": true, "promo": false },
      "createdAt": "2025-03-12T09:00:00.000Z",
      "updatedAt": "2025-03-12T09:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

Salon hesabında `data.salon` da gelir ([salon nesnesi](#salon-nesnesi)). Panel bu `salon.id` değerini herkese açık salon uçlarında (`/salons/:salonId/...`) kullanır.

Yönlendirme için `user.role` kullanılır: `CUSTOMER` → müşteri arayüzü, `SALON` → `/panel`.

| Hata | Sebep |
| --- | --- |
| 401 | `E-posta veya şifre hatalı.` (hangisinin yanlış olduğu bilinçli olarak söylenmez) |
| 429 | 15 dakikada 20'den fazla deneme |

### `POST /auth/refresh`

Gövde gönderilmez; refresh cookie'si yeterlidir. Yeni bir `accessToken` ve yeni bir refresh cookie verir. Cevap giriş cevabıyla aynıdır. Sayfa yenilendiğinde oturumu geri yüklemek için de bu uç kullanılır.

| Hata | Sebep |
| --- | --- |
| 401 | Cookie yok, süresi dolmuş ya da daha önce kullanılmış |

### `POST /auth/logout`

Gövde gönderilmez. Refresh token'ı geçersiz kılar ve cookie'yi siler. Her durumda `200` döner.

### `GET /auth/me`

Giriş yapan kullanıcıyı döner: `{ user, salon? }`. `GET /users/me` ile aynıdır.

---

## 7. Kullanıcı

Hepsi giriş gerektirir. Kullanıcı kimliği adreste yer almaz; her zaman giriş yapan kullanıcı üzerinde çalışılır.

### `GET /users/me`

Cevap: `{ user, salon? }`.

### `PATCH /users/me`

Profili günceller. Yalnızca değişen alanları göndermek yeterlidir; en az bir alan olmalıdır.

| Alan | Tür | Not |
| --- | --- | --- |
| `name` | string | Boş olamaz |
| `email` | string | Başka hesapta kullanılıyorsa 409 |
| `phone` | string | |
| `notificationPreferences` | nesne | `email`, `sms`, `reminder`, `promo` (boolean). Yalnızca gönderilen anahtarlar değişir |
| `location` | nesne | `city`, `district` |

Tek bir bildirim tercihini değiştirmek:

```json
{ "notificationPreferences": { "promo": true } }
```

Cevap: güncel `{ user, salon? }`.

### `PATCH /users/me/password`

```json
{ "currentPassword": "Salonabox123", "newPassword": "yeni-sifre-22" }
```

Başarılı olursa kullanıcının diğer cihazlardaki oturumları kapanır; bu cihaz için yeni bir oturum verilir. Cevap giriş cevabıyla aynıdır: **dönen `accessToken` bellekteki eskisinin yerine yazılmalıdır.**

| Hata | Sebep |
| --- | --- |
| 400 | `Mevcut şifre hatalı.`; yeni şifre 8 karakterden kısa; yeni şifre eskisiyle aynı |

### `DELETE /users/me`

Müşteri hesabını kalıcı olarak siler. Yalnızca `CUSTOMER` rolü.

```json
{ "password": "Salonabox123" }
```

Ne olur: ileri tarihli randevular iptal edilir, değerlendirmeler ve yüklenen fotoğraflar silinir, geçmiş randevular salon kayıtlarında isimsiz olarak kalır. Başarılı olursa `200` döner; ardından bellekteki token silinip ana sayfaya yönlendirilmelidir.

| Hata | Sebep |
| --- | --- |
| 400 | `Mevcut şifre hatalı.` |
| 403 | Salon hesabı |

### `GET /users/me/appointments`

`GET /appointments` ile aynıdır ([10. bölüm](#10-randevular-müşteri)).

### `GET /users/me/reviews`

Müşterinin yazdığı bütün değerlendirmeler (özel olanlar dahil). Parametreler: `page`, `limit`.

```json
{
  "items": [
    {
      "id": "6ac79a06512b5cde3676ffd6",
      "appointment": "6ac79a00512b5cde3676ffc6",
      "salon": { "id": "6ac799f2512b5cde3676ff89", "name": "Ton & Işık", "city": "İstanbul", "district": "Kadıköy", "coverImage": "https://..." },
      "serviceName": "Ombre",
      "rating": 5,
      "comment": "Renk geçişi tam istediğim gibi oldu, çok memnun kaldım.",
      "hairPhotos": [],
      "hairPhoto": "",
      "isPublic": true,
      "createdAt": "2026-09-04T09:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 2, "totalPages": 1 }
}
```

`isPublic: true` → "Profilde paylaşıldı", `false` → "Yalnızca kuaför görür".

### `GET /users/me/notifications`

`GET /notifications` ile aynıdır ([12. bölüm](#12-bildirimler)).

---

## 8. Salonlar (herkese açık)

Giriş gerektirmez.

### Salon nesnesi

```json
{
  "id": "6ac799e7512b5cde3676ff56",
  "owner": "6ac799e7512b5cde3676ff55",
  "name": "Ayşe Yılmaz Studio",
  "description": "Ayşe Yılmaz Studio, renk ve kesimde uzmanlaşmış ekibiyle...",
  "email": "merhaba@ayseyilmazstudio.com",
  "phone": "0216 555 01 01",
  "address": "Moda Mah. Bahariye Cad. No:24, Kadıköy / İstanbul",
  "city": "İstanbul",
  "district": "Kadıköy",
  "neighborhood": "Moda",
  "audience": "Kadın · Erkek",
  "hairStyles": ["Uzun", "Dalgalı", "Bob"],
  "coverImage": "https://picsum.photos/seed/salonabox-ayse-kapak/1200/900",
  "rating": 4.6,
  "reviewCount": 5,
  "categories": ["balayage", "kesim", "boya", "ombre", "rofle", "fon", "gelin"],
  "startingPrice": 350,
  "coordinates": { "lat": 40.979, "lng": 29.025 },
  "createdAt": "2026-10-08T13:25:59.816Z",
  "updatedAt": "2026-10-08T13:26:37.772Z"
}
```

| Alan | Açıklama |
| --- | --- |
| `rating` | Bütün değerlendirmelerin ortalaması (0–5, tek ondalık). Yorum yoksa `0` |
| `categories` | Aktif hizmetlerin kategorileri; karttaki hizmet etiketleri için |
| `startingPrice` | En ucuz aktif hizmetin fiyatı. Hizmet yoksa `null` |
| `coordinates` | Salon konum girmemişse `null` |

### `GET /salons`

Salonları filtreleyip sıralar.

| Parametre | Tür | Açıklama |
| --- | --- | --- |
| `search` | string | Salon adı, mahalle, ilçe, şehir, hizmet adı ve saç stillerinde arar. Büyük/küçük harf ve Türkçe karakter duyarsız |
| `city`, `district` | string | Tam eşleşme (`İstanbul`, `Kadıköy`) |
| `category` | string | Virgülle ayrılmış kategori listesi; herhangi birini sunan salonlar: `kesim,boya` |
| `hairStyle` | string | Virgülle ayrılmış saç stili listesi: `Bob,Uzun` |
| `rating` | sayı | En düşük puan: `4.5` |
| `lat`, `lng` | sayı | Kullanıcının konumu. İkisi birlikte gönderilir. Gönderilirse her salona `distanceKm` eklenir |
| `distance` | sayı | Kilometre cinsinden en fazla uzaklık (en çok 100). `lat` ve `lng` gerektirir |
| `availability` | string | `today`, `tomorrow`, `week`: bu süre içinde en az bir boş saati olan salonlar |
| `sort` | string | `rating` (varsayılan), `popular`, `price` (ucuzdan pahalıya), `newest`, `nearest` (`lat` ve `lng` gerektirir) |
| `page`, `limit` | sayı | Sayfalama |

Frontend filtre adlarının karşılıkları:

| Frontend (`useSalonFilters`) | API |
| --- | --- |
| `query` (`q`) | `search` |
| `serviceIds` (`hizmet`) | `category` (virgülle birleştirilir) |
| `hairStyles` (`stil`) | `hairStyle` |
| `minRating` (`puan`) | `rating` (0 ise gönderilmez) |
| `distance` (`mesafe`) | `distance` + `lat` + `lng` |
| `availability` (`uygunluk`): `any` / `today` / `tomorrow` / `week` | `availability` (`any` ise gönderilmez) |
| `sort` (`sirala`): `puan` / `yakin` / `populer` | `rating` / `nearest` / `popular` |
| `page` (`sayfa`) | `page` (+ `limit=6`) |

Örnek: `GET /salons?city=İstanbul&district=Kadıköy&category=kesim,boya&rating=4.5&lat=40.99&lng=29.03&distance=5&sort=nearest&limit=6`

Cevap:

```json
{
  "items": [ { "id": "...", "name": "Ton & Işık", "rating": 5, "distanceKm": 2, "...": "salon nesnesinin diğer alanları" } ],
  "pagination": { "page": 1, "limit": 6, "total": 8, "totalPages": 2 }
}
```

Konumla ilgili dikkat edilecekler:

- `distanceKm` yalnızca `lat` ve `lng` gönderildiğinde gelir. Koordinatı olmayan salonda `null` olur.
- `distance` filtresi ve `sort=nearest`, koordinatı olmayan salonları sonuçtan çıkarır.
- Kullanıcı konum izni vermediyse `lat`, `lng`, `distance` gönderilmemeli ve "En yakın" sıralaması devre dışı bırakılmalıdır; aksi halde 400 döner. Bu durumda `city` ve `district` ile filtrelenebilir.

### `GET /salons/:salonId`

Salon detay sayfasının ihtiyacı olan her şeyi tek istekte döner: [salon nesnesi](#salon-nesnesi) + dört alan.

```json
{
  "id": "6ac799e7512b5cde3676ff56",
  "name": "Ayşe Yılmaz Studio",
  "...": "salon nesnesinin diğer alanları",
  "services": [
    {
      "id": "6ac799e9512b5cde3676ff5e",
      "salon": "6ac799e7512b5cde3676ff56",
      "name": "Balayage",
      "description": "Doğal görünümlü, el ile uygulanan renk geçişi.",
      "category": "balayage",
      "duration": 180,
      "price": 2500,
      "isActive": true
    }
  ],
  "portfolio": [
    {
      "id": "6ac79a0c512b5cde3676ffdf",
      "image": "https://picsum.photos/seed/salonabox-ayse-1/800/1000",
      "title": "Bal köpüğü balayage",
      "description": "Koyu kumral üzerine sıcak tonlar.",
      "customerName": "",
      "rating": null,
      "createdAt": "2026-10-08T13:26:36.236Z"
    }
  ],
  "workingHours": [
    { "id": "...", "dayOfWeek": 1, "openTime": "09:00", "closeTime": "19:00", "breaks": [{ "start": "12:00", "end": "13:00" }], "isClosed": false }
  ],
  "blockedDates": [
    { "id": "6ac799fb512b5cde3676ffb5", "date": "2026-10-16", "note": "Personel eğitimi" }
  ]
}
```

| Alan | Açıklama |
| --- | --- |
| `services` | Yalnızca aktif hizmetler |
| `portfolio` | Yalnızca yayındaki görseller. Müşteri fotoğrafında `customerName` ve `rating` dolu gelir; salonun kendi görselinde `""` ve `null` |
| `workingHours` | 7 gün, Pazartesi'den başlayarak sıralı |
| `blockedDates` | Bugün ve sonrasındaki kapalı günler |

"Şu an açık mı" bilgisi `workingHours` + `blockedDates` üzerinden frontend'de hesaplanır (mevcut `getOpeningStatus` mantığı).

| Hata | Sebep |
| --- | --- |
| 400 | `salonId` geçerli bir kimlik değil |
| 404 | `Salon bulunamadı.` |

### `GET /salons/:salonId/services`

Salonun aktif hizmetleri (dizi). Detay cevabındaki `services` ile aynıdır.

### `GET /salons/:salonId/working-hours`

7 günlük çalışma düzeni (dizi). Detay cevabındaki `workingHours` ile aynıdır.

### `GET /salons/:salonId/blocked-dates`

Bugün ve sonrasındaki kapalı günler (dizi). Takvimde bu günler seçilemez gösterilmelidir.

### `GET /salons/:salonId/portfolio`

Yayındaki portföy görselleri (dizi). Detay cevabındaki `portfolio` ile aynıdır.

### `GET /salons/:salonId/reviews`

Salon profilinde gösterilecek değerlendirmeler. Parametreler: `page`, `limit`.

```json
{
  "summary": {
    "averageRating": 4.6,
    "reviewCount": 5,
    "distribution": [
      { "stars": 5, "count": 3, "percent": 60 },
      { "stars": 4, "count": 2, "percent": 40 },
      { "stars": 3, "count": 0, "percent": 0 },
      { "stars": 2, "count": 0, "percent": 0 },
      { "stars": 1, "count": 0, "percent": 0 }
    ]
  },
  "items": [
    {
      "id": "6ac79a05512b5cde3676ffd4",
      "authorName": "Gizem Tan",
      "serviceName": "Balayage",
      "rating": 5,
      "comment": "Tam istediğim ton oldu, teşekkürler!",
      "hairPhotos": ["https://.../1.jpg", "https://.../2.jpg"],
      "hairPhoto": "https://.../1.jpg",
      "createdAt": "2026-10-07T09:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 4, "totalPages": 1 }
}
```

`items` yalnızca müşterinin paylaşım izni verdiği değerlendirmeleri içerir. Bu yüzden `pagination.total` (4), bütün değerlendirmeleri sayan `summary.reviewCount` (5) değerinden küçük olabilir; bu bir hata değildir.

---

## 9. Müsaitlik

### `GET /salons/:salonId/availability`

Seçilen hizmet ve gün için alınabilecek saatleri döner. Hangi saatin müsait olduğuna yalnızca backend karar verir; frontend sonucu gösterir.

| Parametre | Zorunlu | Açıklama |
| --- | --- | --- |
| `serviceId` | Evet | Bu salona ait aktif bir hizmet |
| `date` | Evet | `YYYY-MM-DD` |
| `excludeAppointmentId` | Hayır | Randevu düzenlenirken kendi saatinin dolu görünmemesi için o randevunun kimliği |

Örnek: `GET /salons/6ac7…ff56/availability?serviceId=6ac7…ff5f&date=2026-10-13`

```json
{
  "date": "2026-10-13",
  "service": { "id": "6ac799e9512b5cde3676ff5f", "name": "Saç Kesimi", "duration": 45, "price": 600 },
  "slotInterval": 30,
  "isClosed": false,
  "slots": [
    { "time": "09:00", "endTime": "09:45", "available": true },
    { "time": "09:30", "endTime": "10:15", "available": false },
    { "time": "10:00", "endTime": "10:45", "available": true }
  ]
}
```

| Alan | Açıklama |
| --- | --- |
| `isClosed` | Salon o gün kapalı (haftalık tatil ya da kapalı gün). `slots` boş gelir |
| `slots` | O gün için bütün başlangıç saatleri. `available: false` olanlar devre dışı gösterilir (dolu, molaya denk geliyor ya da geçmişte kalmış) |
| `time` | Randevu oluştururken `startTime` olarak gönderilecek değer |

Geçmiş bir tarih ya da 90 günden ileri bir tarih için `slots` boş gelir.

Kullanım notları:

- Hizmet ya da tarih her değiştiğinde yeniden çağrılmalıdır (süre değişince müsait saatler de değişir).
- Liste alındıktan sonra başka biri aynı saati alabilir. `POST /appointments` 409 dönerse mesaj gösterilip bu uç yeniden çağrılmalıdır.

| Hata | Sebep |
| --- | --- |
| 400 | `serviceId` ya da `date` eksik/hatalı |
| 404 | Salon yok; hizmet bu salona ait değil ya da pasif |

---

## 10. Randevular (müşteri)

Hepsi `CUSTOMER` rolü gerektirir. Müşteri yalnızca kendi randevularını görür; başkasının randevusu için 404 döner.

### Randevu nesnesi

```json
{
  "id": "6ac799ff512b5cde3676ffc3",
  "reference": "SL-00048220",
  "customer": "6ac799e5512b5cde3676ff4f",
  "customerName": "Elif Kaya",
  "customerPhone": "0532 555 12 34",
  "salon": {
    "id": "6ac799ed512b5cde3676ff72",
    "name": "Kesik Hair Lab",
    "phone": "0216 555 03 03",
    "address": "Fenerbahçe Mah. Fener Kalamış Cad. No:58, Kadıköy / İstanbul",
    "neighborhood": "Fenerbahçe",
    "district": "Kadıköy",
    "city": "İstanbul",
    "coverImage": "https://..."
  },
  "service": "6ac799ef512b5cde3676ff7a",
  "serviceName": "Saç Kesimi",
  "duration": 45,
  "price": 600,
  "date": "2026-10-10",
  "startTime": "15:00",
  "endTime": "15:45",
  "status": "BOOKED",
  "source": "ONLINE",
  "notes": "",
  "cancellationReason": "",
  "isReviewed": false,
  "createdAt": "2026-10-08T13:26:23.548Z",
  "updatedAt": "2026-10-08T13:26:23.548Z"
}
```

`serviceName`, `duration` ve `price` randevunun alındığı andaki değerlerdir; salon sonradan fiyatı değiştirse de randevudaki değer değişmez.

### `POST /appointments`

Randevu oluşturur. Onay adımı yoktur; randevu doğrudan `BOOKED` olur.

| Alan | Zorunlu | Açıklama |
| --- | --- | --- |
| `salonId` | Evet | |
| `serviceId` | Evet | O salonun aktif bir hizmeti |
| `date` | Evet | `YYYY-MM-DD` |
| `startTime` | Evet | Müsaitlik cevabındaki `time` değeri |
| `notes` | Hayır | En fazla 500 karakter |

```json
{ "salonId": "6ac799ed512b5cde3676ff72", "serviceId": "6ac799ef512b5cde3676ff7a", "date": "2026-10-10", "startTime": "15:00" }
```

Cevap `201`: [randevu nesnesi](#randevu-nesnesi). `id` ile başarı sayfasına yönlendirilir. Müşteriye ve salona bildirim oluşur.

| Hata | Mesaj / sebep |
| --- | --- |
| 400 | Kapalı gün, çalışma saati dışı, mola, geçmiş saat, 30 dakikalık dilime uymayan saat, 90 günden ileri tarih |
| 404 | Salon ya da hizmet bulunamadı |
| 409 | `Bu saat az önce başka bir müşteri tarafından alındı.` → slotlar yeniden yüklenmeli |

### `GET /appointments`

Müşterinin randevuları.

| Parametre | Açıklama |
| --- | --- |
| `scope` | `upcoming`: aktif (`BOOKED`) randevular, en yakın tarih önce. `past`: diğerleri (tamamlanan, iptal, gelinmedi), en yeni önce |
| `status` | Tek bir duruma göre filtre: `BOOKED`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| `page`, `limit` | Sayfalama |

Cevap: `{ items: [randevu], pagination }`.

"Randevularım" ekranındaki iki sekme için `scope=upcoming` ve `scope=past` kullanılır.

### `GET /appointments/:appointmentId`

Tek randevu. Cevap: [randevu nesnesi](#randevu-nesnesi).

Ekrandaki düğmeler şu alanlardan türetilir:

| Durum | Koşul |
| --- | --- |
| "İptal et" görünür | `status === "BOOKED"` |
| "Değerlendir" görünür | `status === "COMPLETED" && !isReviewed` |
| "Değerlendirildi" | `status === "COMPLETED" && isReviewed` |

### `PATCH /appointments/:appointmentId`

Randevunun tarihini, saatini ya da notunu değiştirir. Yalnızca `BOOKED` ve henüz başlamamış randevular için.

| Alan | Açıklama |
| --- | --- |
| `date` | Yeni tarih |
| `startTime` | Yeni saat |
| `notes` | Not |

```json
{ "date": "2026-10-12", "startTime": "16:00" }
```

Cevap: güncel randevu. Salona bildirim gider.

| Hata | Sebep |
| --- | --- |
| 400 | Yeni saat kurallara uymuyor |
| 409 | Yeni saat dolu; randevu aktif değil; randevu başlamış |

### `DELETE /appointments/:appointmentId`

Randevuyu iptal eder. Kayıt silinmez; `status` `CANCELLED` olur ve saat yeniden müsait hale gelir.

Gövde isteğe bağlıdır:

```json
{ "reason": "Planlarım değişti" }
```

Cevap: güncel randevu (`status: "CANCELLED"`, `cancellationReason`). Müşteriye ve salona bildirim oluşur.

| Hata | Sebep |
| --- | --- |
| 409 | Randevu zaten iptal edilmiş/tamamlanmış; randevu başlamış |

---

## 11. Değerlendirme

### `POST /appointments/:appointmentId/review`

Tamamlanmış bir randevu için değerlendirme yazar. Yalnızca `CUSTOMER`.

| Alan | Tür | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `rating` | sayı | Evet | 1–5 arası tam sayı |
| `comment` | string | Hayır | En fazla 1000 karakter |
| `hairPhotos` | string[] | Hayır | En fazla 4 görsel adresi ([önce yüklenir](#13-görsel-yükleme)) |
| `isPublic` | boolean | Hayır | Paylaşım izni. **Varsayılan `false`**; anahtar açıksa açıkça `true` gönderilmelidir |

```json
{
  "rating": 5,
  "comment": "Renk geçişi tam istediğim gibi oldu.",
  "hairPhotos": ["http://localhost:5000/api/uploads/6ac7a1b2c3d4e5f6a7b8c9d0"],
  "isPublic": true
}
```

Fotoğraflı gönderim sırası:

1. Seçilen her dosya için `POST /uploads` → dönen `url` değerleri toplanır.
2. `POST /appointments/:id/review` ile `hairPhotos: [url, ...]` gönderilir.

Cevap `201`:

```json
{
  "id": "6ac79a06512b5cde3676ffd6",
  "appointment": "6ac79a00512b5cde3676ffc6",
  "customer": "6ac799e5512b5cde3676ff4f",
  "salon": "6ac799f2512b5cde3676ff89",
  "serviceName": "Ombre",
  "rating": 5,
  "comment": "Renk geçişi tam istediğim gibi oldu.",
  "hairPhotos": ["http://localhost:5000/api/uploads/6ac7a1b2c3d4e5f6a7b8c9d0"],
  "hairPhoto": "http://localhost:5000/api/uploads/6ac7a1b2c3d4e5f6a7b8c9d0",
  "isPublic": true,
  "createdAt": "2026-10-08T14:02:11.120Z"
}
```

`isPublic` ne anlama gelir:

| Değer | Sonuç |
| --- | --- |
| `true` | Yorum, müşterinin adı ve fotoğrafları salon profilinde gösterilebilir. Fotoğrafları salon portföyünde yayınlayabilir |
| `false` | Yalnızca salon ve müşterinin kendisi görür. Salon fotoğrafları yayınlayamaz |

Her iki durumda da puan, salonun ortalamasına dahil edilir.

| Hata | Sebep |
| --- | --- |
| 400 | `rating` 1–5 dışında ya da tam sayı değil; 4'ten fazla fotoğraf; geçersiz görsel adresi |
| 404 | Randevu yok ya da bu müşteriye ait değil |
| 409 | `Yalnızca tamamlanan randevular değerlendirilebilir.` / `Bu randevu için daha önce değerlendirme yapılmış.` |

---

## 12. Bildirimler

Müşteri de salon da aynı uçları kullanır; herkes yalnızca kendi bildirimlerini görür.

### `GET /notifications`

| Parametre | Açıklama |
| --- | --- |
| `unreadOnly` | `true` gönderilirse yalnızca okunmamışlar |
| `page`, `limit` | Sayfalama |

```json
{
  "items": [
    {
      "id": "6ac79a0c512b5cde3676fff4",
      "recipient": "6ac799e5512b5cde3676ff4f",
      "type": "APPOINTMENT_CREATED",
      "title": "Randevunuz oluşturuldu.",
      "body": "Kesik Hair Lab · Saç Kesimi · 10 Ekim, 15:00",
      "appointment": "6ac799ff512b5cde3676ffc3",
      "isRead": false,
      "createdAt": "2026-10-08T11:26:36.530Z"
    }
  ],
  "unreadCount": 3,
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

`unreadCount` filtrelerden bağımsızdır; menüdeki rozet için kullanılır. Rozeti güncel tutmak için `GET /notifications?limit=1` yeterlidir.

Bildirime tıklanınca gidilecek sayfa `type` ve `appointment` alanlarından belirlenir ([tablo](#bildirim-tipleri)).

### `PATCH /notifications/:notificationId/read`

Tek bildirimi okundu işaretler. Gövde gönderilmez. Cevap: güncel bildirim (`isRead: true`).

### `PATCH /notifications/read-all`

Hepsini okundu işaretler. Gövde gönderilmez. Cevap: `{ "updatedCount": 2 }`.

---

## 13. Görsel yükleme

### `POST /uploads`

Bir görsel yükler ve adresini döner. Giriş gerektirir (her iki rol).

- İçerik türü: `multipart/form-data`
- Alan adı: `file` (tek dosya)
- Türler: JPG, PNG, WebP
- En fazla 5 MB

```js
async function uploadImage(file) {
  const form = new FormData();
  form.append('file', file);

  // Content-Type başlığı elle yazılmaz; tarayıcı sınır (boundary) bilgisiyle kendisi ekler.
  const res = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    credentials: 'include',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data.url;
}
```

Cevap `201`:

```json
{
  "id": "6ac7a1b2c3d4e5f6a7b8c9d0",
  "contentType": "image/png",
  "size": 184320,
  "url": "http://localhost:5000/api/uploads/6ac7a1b2c3d4e5f6a7b8c9d0"
}
```

`url` değeri şu alanlarda kullanılır:

| Nerede | Alan |
| --- | --- |
| Değerlendirme | `hairPhotos` |
| Portföy görseli | `image` |
| Salon kapak görseli | `coverImage` |

| Hata | Sebep |
| --- | --- |
| 400 | Dosya yok; JPG/PNG/WebP değil (uzantıya değil içeriğe bakılır) |
| 401 | Giriş yapılmamış |
| 413 | 5 MB'tan büyük |

### `GET /uploads/:fileId`

Görseli sunar. Giriş gerektirmez; `<img src>` içinde doğrudan kullanılabilir.

Next.js `<Image>` bileşeni kullanılacaksa API adresi `next.config.mjs` içindeki `images.remotePatterns` listesine eklenmelidir. Örnek veride görseller `picsum.photos` adresindedir; o da eklenmelidir.

---

## 14. Salon paneli

Hepsi `SALON` rolü gerektirir ve giriş yapan kullanıcının kendi salonu üzerinde çalışır. Salon kimliği hiçbir istekte gönderilmez.

### `GET /salon/me`

Salonun kendi kaydı: [salon nesnesi](#salon-nesnesi).

### `PATCH /salon/me`

Salon profilini günceller. Yalnızca değişen alanlar gönderilir.

| Alan | Tür | Not |
| --- | --- | --- |
| `name` | string | Boş olamaz |
| `description` | string | En fazla 2000 karakter |
| `email`, `phone`, `address` | string | |
| `city`, `district` | string | Boş olamaz |
| `neighborhood`, `audience` | string | |
| `hairStyles` | string[] | En fazla 20 |
| `coverImage` | string | Yüklenen görselin adresi |
| `coordinates` | nesne / null | `{ "lat": 40.979, "lng": 29.025 }`. `null` konumu kaldırır. Mesafe filtresinde görünmek için gereklidir |

Cevap: güncel salon nesnesi.

### `GET /salon/me/dashboard`

Özet ekranının verisi.

```json
{
  "date": "2026-10-08",
  "week": { "from": "2026-10-05", "to": "2026-10-11" },
  "todayAppointments": [ { "...": "panel randevu nesnesi" } ],
  "upcomingAppointments": [ { "...": "panel randevu nesnesi" } ],
  "upcomingCount": 3,
  "today": { "occupancy": 36, "freeSlotCount": 5 },
  "completedAppointments": 1,
  "cancelledAppointments": 1,
  "averageRating": 4.6,
  "reviewCount": 5
}
```

| Alan | Kartta |
| --- | --- |
| `todayAppointments` | "Bugünkü Randevular": iptal edilmemiş bugünkü randevular, saate göre sıralı. Sayı için `.length` |
| `upcomingAppointments` | Şu andan sonraki ilk 5 aktif randevu |
| `upcomingCount` | "Yaklaşan" kartındaki toplam sayı |
| `completedAppointments` | "Tamamlanan" (bu hafta) |
| `cancelledAppointments` | "İptal" (bu hafta) |
| `today.occupancy` | Bugünün doluluk yüzdesi (0–100) |
| `today.freeSlotCount` | Bugün kalan boş 30 dakikalık başlangıç saati sayısı |
| `week` | Haftalık sayıların kapsadığı Pazartesi–Pazar aralığı |

Özetteki "son bildirimler" için `GET /notifications?limit=3` kullanılır.

### Hizmetler

#### `GET /salon/me/services`

Bütün hizmetler (pasifler dahil), eklenme sırasıyla. Dizi döner.

#### `POST /salon/me/services`

| Alan | Tür | Zorunlu | Kural |
| --- | --- | --- | --- |
| `name` | string | Evet | En fazla 80 karakter |
| `duration` | sayı | Evet | Dakika; 5–600 arası tam sayı |
| `price` | sayı | Evet | 0 veya daha büyük |
| `description` | string | Hayır | En fazla 500 karakter |
| `category` | string | Hayır | [Kategori](#hizmet-kategorileri); varsayılan `diger` |
| `isActive` | boolean | Hayır | Varsayılan `true` |

```json
{ "name": "Saç Kesimi", "category": "kesim", "duration": 45, "price": 600 }
```

`duration` ve `price` **sayı** olarak gönderilmelidir (`"45"` değil `45`); form değerleri `Number(...)` ile çevrilmelidir.

Cevap `201`: hizmet nesnesi.

#### `PATCH /salon/me/services/:serviceId`

Aynı alanlar, hepsi isteğe bağlı. Aktif/pasif anahtarı için:

```json
{ "isActive": false }
```

Pasif hizmet müşteriye görünmez ve randevu alınamaz; mevcut randevular etkilenmez.

#### `DELETE /salon/me/services/:serviceId`

Hizmeti siler. Geçmiş randevular bozulmaz.

| Hata | Sebep |
| --- | --- |
| 404 | Hizmet yok ya da başka salona ait |
| 409 | `Bu hizmete ait ileri tarihli randevular var. Hizmeti silmek yerine pasif hale getirebilirsiniz.` |

### Çalışma saatleri

Mevcut saatleri okumak için `GET /salons/:salonId/working-hours` kullanılır (`salonId` giriş cevabındaki `salon.id`).

#### `PATCH /salon/me/working-hours`

Bir ya da birden fazla günü günceller. Yalnızca değişen günler gönderilebilir.

```json
{
  "days": [
    { "dayOfWeek": 5, "openTime": "09:00", "closeTime": "20:00", "breaks": [{ "start": "12:00", "end": "13:00" }], "isClosed": false },
    { "dayOfWeek": 0, "openTime": "09:00", "closeTime": "19:00", "breaks": [], "isClosed": true }
  ]
}
```

| Alan | Zorunlu | Kural |
| --- | --- | --- |
| `dayOfWeek` | Evet | 0–6 (0 = Pazar) |
| `openTime`, `closeTime` | Evet | `HH:mm`; kapanış açılıştan sonra olmalı. Gün kapalı olsa bile gönderilir |
| `breaks` | Hayır | `[{ start, end }]`; çalışma saatleri içinde, birbiriyle çakışmayan en fazla 5 mola. Gönderilmezse molalar silinir |
| `isClosed` | Hayır | Varsayılan `false` |

Her gün bütün olarak kaydedilir; bir günün yalnızca tek alanını göndermek mümkün değildir. Cevap: güncel 7 günlük dizi.

Çalışma saatlerini değiştirmek mevcut randevuları iptal etmez.

#### `POST /salon/me/blocked-dates`

Salonu belirli bir gün için kapatır.

```json
{ "date": "2026-10-16", "note": "Personel eğitimi" }
```

Cevap `201`:

```json
{ "id": "6ac799fb512b5cde3676ffb5", "salon": "...", "date": "2026-10-16", "note": "Personel eğitimi", "bookedAppointmentCount": 2 }
```

`bookedAppointmentCount`: o gün zaten alınmış aktif randevu sayısı. Bu randevular otomatik iptal edilmez; 0'dan büyükse kullanıcıya uyarı gösterilmeli, gerekirse randevular tek tek iptal edilmelidir.

| Hata | Sebep |
| --- | --- |
| 409 | `Bu tarih zaten kapalı olarak işaretlenmiş.` |

#### `DELETE /salon/me/blocked-dates/:id`

Kapalı günü kaldırır. Mock'taki gibi tarihle değil, kaydın `id` değeriyle silinir.

### Randevular

#### Panel randevu nesnesi

Müşteri uçlarındakiyle aynı alanlar; tek fark `salon` alanının nesne değil kimlik olmasıdır.

```json
{
  "id": "6ac799fb512b5cde3676ffb6",
  "reference": "SL-00048207",
  "customer": "6ac799e6512b5cde3676ff51",
  "customerName": "Selin Aksoy",
  "customerPhone": "0534 404 14 34",
  "salon": "6ac799e7512b5cde3676ff56",
  "service": "6ac799e9512b5cde3676ff5f",
  "serviceName": "Saç Kesimi",
  "duration": 45,
  "price": 600,
  "date": "2026-10-08",
  "startTime": "09:00",
  "endTime": "09:45",
  "status": "BOOKED",
  "source": "ONLINE",
  "notes": "",
  "cancellationReason": "",
  "isReviewed": false
}
```

Frontend'de türetilecek alanlar (mevcut `toAppointmentView` mantığı):

| Alan | Koşul |
| --- | --- |
| `started` | `date < bugün` ya da (`date === bugün` ve `startTime <= şimdi`) |
| `canComplete` | `status === "BOOKED" && started` |
| `canEdit` | `status === "BOOKED" && !started` |
| "Manuel" etiketi | `source === "MANUAL"` (bu randevularda `customer` `null` olur) |

#### `GET /salon/me/appointments`

| Parametre | Açıklama |
| --- | --- |
| `scope` | `today`: bugünkü bütün randevular. `upcoming`: bugün ve sonrası, aktif. `past`: tarihi geçmiş ya da artık aktif olmayanlar (en yeni önce). `all`: hepsi |
| `search` | Müşteri adında arar |
| `date` | Tek gün (`YYYY-MM-DD`) |
| `from`, `to` | Tarih aralığı (dahil). Takvimin hafta görünümü için |
| `status` | Tek durum |
| `page`, `limit` | Varsayılan 50, en fazla 200 |

```json
{
  "items": [ { "...": "panel randevu nesnesi" } ],
  "counts": { "today": 3, "upcoming": 6, "past": 7, "all": 13 },
  "pagination": { "page": 1, "limit": 50, "total": 6, "totalPages": 1 }
}
```

`counts`, sekme başlıklarındaki sayılardır ("Bugün (3)"); arama ve diğer filtrelerden etkilenmez.

Örnekler:

- Randevular ekranı, "Yaklaşan" sekmesi + arama: `?scope=upcoming&search=elif`
- Takvim, gün görünümü: `?date=2026-10-08&limit=200`
- Takvim, hafta görünümü: `?from=2026-10-05&to=2026-10-11&limit=200`

#### `POST /salon/me/appointments`

Salonun elle eklediği randevu (telefonla arayan ya da salona gelen müşteri). Müşterininkiyle aynı müsaitlik kurallarından geçer ve doğrudan `BOOKED` olur.

| Alan | Zorunlu | Açıklama |
| --- | --- | --- |
| `customerName` | Evet | |
| `customerPhone` | Evet | |
| `serviceId` | Evet | Salonun aktif bir hizmeti |
| `date`, `startTime` | Evet | |
| `notes` | Hayır | |

```json
{ "customerName": "Deniz Kara", "customerPhone": "0535 405 15 35", "serviceId": "6ac799e9512b5cde3676ff5f", "date": "2026-10-09", "startTime": "16:00", "notes": "Telefonla aradı" }
```

Cevap `201`: panel randevu nesnesi (`source: "MANUAL"`, `customer: null`).

Formdaki saat seçenekleri için `GET /salons/:salonId/availability?serviceId=…&date=…` kullanılır.

| Hata | Sebep |
| --- | --- |
| 400 | Kapalı gün, mola, çalışma saati dışı, geçmiş saat |
| 409 | `Bu saat az önce başka bir müşteri tarafından alındı.` |

#### `PATCH /salon/me/appointments/:appointmentId`

İki ayrı iş için kullanılır. İkisi aynı istekte gönderilemez.

**a) Durum değiştirme**

```json
{ "status": "COMPLETED" }
```

| `status` | Düğme | Koşul | Sonuç |
| --- | --- | --- | --- |
| `COMPLETED` | "Tamamlandı" | Randevu `BOOKED` ve saati gelmiş olmalı | Müşteriye "tamamlandı" ve "değerlendirin" bildirimleri gider |
| `NO_SHOW` | "Gelmedi" | Randevu `BOOKED` ve saati gelmiş olmalı | — |
| `CANCELLED` | "İptal et" | Randevu `BOOKED` olmalı | Saat yeniden müsait olur; müşteriye bildirim gider. İsteğe bağlı `cancellationReason` gönderilebilir |

`BOOKED`, `PENDING`, `CONFIRMED` gibi değerler kabul edilmez (400).

**b) Düzenleme**

| Alan | Açıklama |
| --- | --- |
| `serviceId` | Farklı bir hizmet |
| `date`, `startTime` | Yeni zaman |
| `notes` | Not |
| `customerName`, `customerPhone` | Yalnızca elle girilen (`MANUAL`) randevularda değişir; online randevuda yok sayılır |

```json
{ "date": "2026-10-10", "startTime": "14:00", "notes": "Müşteri saat değişikliği istedi" }
```

Düzenleme formunda saat seçenekleri için müsaitlik ucu `excludeAppointmentId=<bu randevunun id'si>` ile çağrılmalıdır; aksi halde randevunun kendi saati dolu görünür.

Cevap: güncel randevu. Online randevuda müşteriye "güncellendi" bildirimi gider.

| Hata | Sebep |
| --- | --- |
| 400 | Geçersiz `status`; durum ile düzenleme alanlarının birlikte gönderilmesi; yeni saat kurallara uymuyor |
| 404 | Randevu yok ya da başka salona ait |
| 409 | `Randevu saati gelmeden bu işlem yapılamaz.` / randevu artık aktif değil / yeni saat dolu |

#### `DELETE /salon/me/appointments/:appointmentId`

Randevuyu iptal eder (`PATCH` ile `status: "CANCELLED"` göndermekle aynıdır). İsteğe bağlı gövde: `{ "reason": "..." }`.

### Portföy

#### `GET /salon/me/portfolio`

Salonun bütün portföy havuzu: kendi yüklediği görseller ve müşterilerin değerlendirmeyle gönderdiği fotoğraflar. Dizi döner.

```json
[
  {
    "id": "6ac79a0c512b5cde3676ffe3",
    "salon": "6ac799e7512b5cde3676ff56",
    "image": "https://picsum.photos/seed/salonabox-gizem-balayage-1/800/1000",
    "title": "Balayage",
    "description": "",
    "source": "REVIEW",
    "review": "6ac79a05512b5cde3676ffd4",
    "customerName": "Gizem Tan",
    "rating": 5,
    "hasConsent": true,
    "isPublished": false,
    "createdAt": "2026-10-08T13:26:36.236Z"
  }
]
```

Karttaki etiket:

| Koşul | Etiket | Anahtar |
| --- | --- | --- |
| `!hasConsent` | "İzin yok" | Devre dışı |
| `hasConsent && isPublished` | "Yayında" | Açık |
| `hasConsent && !isPublished` | "Gizli" | Kapalı |

`source`: `REVIEW` müşteri fotoğrafı (`customerName` ve `rating` dolu), `SALON` salonun kendi görseli (her zaman `hasConsent: true`).

#### `POST /salon/me/portfolio`

Salonun kendi görselini ekler.

| Alan | Zorunlu | Açıklama |
| --- | --- | --- |
| `image` | Evet | Yüklenen görselin adresi |
| `title` | Hayır | En fazla 120 karakter |
| `description` | Hayır | En fazla 500 karakter |
| `isPublished` | Hayır | Varsayılan `true` |

```json
{ "image": "http://localhost:5000/api/uploads/6ac7a1b2c3d4e5f6a7b8c9d0", "title": "Küt bob kesim" }
```

#### `PATCH /salon/me/portfolio/:itemId`

Yayın durumunu, başlığı ya da açıklamayı değiştirir. Yayınla/gizle anahtarı:

```json
{ "isPublished": true }
```

Müşteri fotoğrafının (`source: "REVIEW"`) görseli değiştirilemez.

| Hata | Sebep |
| --- | --- |
| 403 | `Müşteri bu fotoğrafın profilde paylaşılmasına izin vermedi.` |
| 404 | Görsel yok ya da başka salona ait |

#### `DELETE /salon/me/portfolio/:itemId`

Görseli portföyden kaldırır. Müşteri fotoğrafıysa değerlendirmenin kendisi silinmez.

---

## 15. Sabit değerler

### Randevu durumları

| Değer | Etiket | Açıklama |
| --- | --- | --- |
| `BOOKED` | Randevu alındı | Aktif randevu. Her randevu bu durumda başlar |
| `COMPLETED` | Tamamlandı | Salon tamamladı; değerlendirilebilir |
| `CANCELLED` | İptal edildi | Müşteri ya da salon iptal etti |
| `NO_SHOW` | Gelinmedi | Müşteri gelmedi |

`BOOKED` dışındaki durumlar son durumdur; bu randevular değiştirilemez. `PENDING` ve `CONFIRMED` yoktur.

### Roller

`CUSTOMER`, `SALON`

### Randevu kaynağı

`ONLINE` (müşteri aldı), `MANUAL` (salon ekledi)

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

### Bildirim tipleri

| `type` | Mock'taki karşılığı | Kime gider | Tıklanınca |
| --- | --- | --- | --- |
| `APPOINTMENT_CREATED` | `booked` | Müşteri ve salon | Müşteri: `/randevularim/{appointment}` · Salon: randevu çekmecesi |
| `APPOINTMENT_UPDATED` | `updated` | Değişikliği yapmayan taraf | Aynı |
| `APPOINTMENT_CANCELLED` | `cancelled` | Müşteri; müşteri iptal ettiyse salon da | Aynı |
| `APPOINTMENT_COMPLETED` | `completed` | Müşteri | `/randevularim/{appointment}` |
| `REVIEW_REQUESTED` | `review` (müşteri) | Müşteri | `/randevularim/{appointment}/degerlendir` |
| `REVIEW_PUBLISHED` | `review` (salon) | Salon | `/panel/portfoy` |

Mock'taki `reminder` tipinin (hatırlatma) API'de karşılığı yoktur.

### Sınırlar

| | |
| --- | --- |
| Randevu saat aralığı | 30 dakika |
| En ileri randevu tarihi | 90 gün |
| Değerlendirme fotoğrafı | En fazla 4 |
| Görsel boyutu | En fazla 5 MB (JPG, PNG, WebP) |
| Genel istek sınırı | 15 dakikada 600 |
| Giriş / kayıt / refresh / şifre işlemleri | 15 dakikada 20 |
| Görsel yükleme | 15 dakikada 60 |
