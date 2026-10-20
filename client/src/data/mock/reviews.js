export const salonReviews = [
  {
    id: "r1",
    author: "Zeynep Baş",
    rating: 5,
    date: "2026-09-28",
    serviceId: "balayage",
    hasPhoto: true,
    text: "Ne istediğimi ilk dakikada anladı. Renk geçişleri çok doğal oldu, üç hafta sonra bile ilk günkü gibi duruyor.",
  },
  {
    id: "r2",
    author: "Selin Aksoy",
    rating: 4,
    date: "2026-09-19",
    serviceId: "kesim",
    hasPhoto: false,
    text: "Kesim çok iyiydi; randevu saatinde başlandı. Salon cumartesi biraz kalabalıktı.",
  },
  {
    id: "r3",
    author: "Elif Demir",
    rating: 5,
    date: "2026-09-03",
    serviceId: "ombre",
    hasPhoto: true,
    text: "Uygulama öncesi saç analizi yapıldı ve bakım önerileri verildi. Kesinlikle tekrar geleceğim.",
  },
  {
    id: "r4",
    author: "Mert Güneş",
    rating: 5,
    date: "2026-08-27",
    serviceId: "kesim",
    hasPhoto: false,
    text: "Online randevu ile bekleme olmadan girdim. Hızlı, temiz ve özenli.",
  },
];

export const ratingDistribution = [
  { stars: 5, percent: 82 },
  { stars: 4, percent: 12 },
  { stars: 3, percent: 4 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 1 },
];

export const ratingLabels = ["Kötü", "Orta", "İyi", "Çok iyi", "Mükemmel"];

export const myReviews = [
  {
    id: "m1",
    salonId: 5,
    serviceId: "ombre",
    date: "2026-09-04",
    rating: 5,
    shared: true,
    text: "Renk geçişi tam istediğim gibi oldu, çok memnun kaldım.",
  },
  {
    id: "m2",
    salonId: 2,
    serviceId: "fon",
    date: "2026-07-12",
    rating: 4,
    shared: false,
    text: "Hızlı ve özenli; sadece biraz beklettiler.",
  },
];
