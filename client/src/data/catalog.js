export const serviceCategories = [
  { id: "kesim", label: "Saç Kesimi", icon: "scissors" },
  { id: "boya", label: "Boya", icon: "droplet" },
  { id: "balayage", label: "Balayage", icon: "sparkle" },
  { id: "ombre", label: "Ombre", icon: "contrast" },
  { id: "rofle", label: "Röfle", icon: "waves" },
  { id: "fon", label: "Fön", icon: "wind" },
  { id: "gelin", label: "Gelin Saçı", icon: "crown" },
  { id: "diger", label: "Diğer", icon: "grid" },
];

export const hairStyles = ["Kısa", "Orta boy", "Uzun", "Bob", "Kıvırcık", "Dalgalı"];

export const popularSearches = [
  { label: "Balayage", categoryId: "balayage" },
  { label: "Kısa bob", hairStyle: "Bob" },
  { label: "Gelin saçı", categoryId: "gelin" },
  { label: "Ombre", categoryId: "ombre" },
];

export const cities = [
  { name: "İstanbul", districts: ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Ataşehir", "Bakırköy", "Sarıyer"] },
  { name: "Ankara", districts: ["Çankaya", "Keçiören", "Yenimahalle", "Etimesgut"] },
  { name: "İzmir", districts: ["Konak", "Karşıyaka", "Bornova", "Çeşme"] },
  { name: "Bursa", districts: ["Nilüfer", "Osmangazi"] },
  { name: "Antalya", districts: ["Muratpaşa", "Konyaaltı"] },
];

export const defaultLocation = { city: "İstanbul", district: "Kadıköy" };

export const cancellationReasons = ["Planlarım değişti", "Başka bir saat istiyorum", "Diğer"];

export const ratingLabels = ["Kötü", "Orta", "İyi", "Çok iyi", "Mükemmel"];

export const demoAccounts = {
  customer: { email: "elif.kaya@posta.com", password: "Salonabox123" },
  salon: { email: "ayse@ayseyilmazstudio.com", password: "Salonabox123" },
};
