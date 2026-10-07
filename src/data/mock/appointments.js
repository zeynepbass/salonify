export const cancellationReasons = ["Planlarım değişti", "Başka bir saat istiyorum", "Diğer"];

export const customerAppointments = [
  { id: "a1", reference: "SL-48207", salonId: 3, serviceId: "kesim", date: "2026-10-09", time: "15:00", status: "BOOKED", reviewed: false },
  { id: "a2", reference: "SL-48208", salonId: 2, serviceId: "fon", date: "2026-10-20", time: "14:30", status: "BOOKED", reviewed: false },
  { id: "a3", reference: "SL-48209", salonId: 3, serviceId: "kesim", date: "2026-09-21", time: "11:00", status: "COMPLETED", reviewed: false },
  { id: "a4", reference: "SL-48210", salonId: 5, serviceId: "ombre", date: "2026-09-02", time: "13:00", status: "COMPLETED", reviewed: true },
  { id: "a5", reference: "SL-48211", salonId: 4, serviceId: "boya", date: "2026-08-14", time: "10:30", status: "CANCELLED", reviewed: false },
  { id: "a6", reference: "SL-48212", salonId: 6, serviceId: "fon", date: "2026-07-30", time: "17:00", status: "NO_SHOW", reviewed: false },
];

const pad = (value) => String(value).padStart(2, "0");

const entry = (id, day, time, customer, serviceId, overrides = {}) => ({
  id,
  date: `2026-10-${pad(day)}`,
  time,
  customer,
  phone: `053${id % 10} 4${pad(id)} ${pad(10 + id)} ${pad(30 + id)}`,
  serviceId,
  status: "BOOKED",
  source: "online",
  note: "",
  ...overrides,
});

export const salonAppointments = [
  entry(1, 7, "09:00", "Zeynep Baş", "kesim", { status: "COMPLETED" }),
  entry(2, 7, "10:00", "Elif Demir", "boya"),
  entry(3, 7, "13:00", "Mert Güneş", "fon"),
  entry(4, 7, "13:30", "Selin Aksoy", "ombre", { note: "Önceki boyası 3 ay önce" }),
  entry(5, 7, "16:00", "Deniz Kara", "kesim", { source: "manual" }),
  entry(6, 7, "17:00", "Ece Turan", "fon"),
  entry(7, 7, "17:30", "Buse Öz", "kesim"),
  entry(8, 7, "18:30", "İpek Yıldız", "fon"),
  entry(9, 5, "10:00", "Melis Ak", "gelin", { status: "COMPLETED" }),
  entry(10, 5, "14:00", "Ceren Uz", "kesim", { status: "COMPLETED" }),
  entry(11, 5, "16:00", "Aslı Er", "boya", { status: "NO_SHOW" }),
  entry(12, 6, "09:30", "Gizem Tan", "balayage", { status: "COMPLETED" }),
  entry(13, 6, "13:00", "Nil Sezer", "fon", { status: "CANCELLED" }),
  entry(14, 6, "14:00", "Damla Koç", "rofle", { status: "COMPLETED" }),
  entry(15, 6, "17:00", "Burak Ay", "kesim", { status: "COMPLETED" }),
  entry(16, 8, "09:00", "Pelin Su", "ombre"),
  entry(17, 8, "13:00", "Tuğba Ol", "kesim"),
  entry(18, 8, "15:00", "Hande Ek", "boya"),
  entry(19, 9, "10:00", "Sena Ilgın", "rofle"),
  entry(20, 9, "14:30", "Ayla Kurt", "fon"),
  entry(21, 9, "16:00", "Merve Ön", "kesim"),
  entry(22, 10, "10:00", "Yasemin Ar", "gelin", { source: "manual" }),
  entry(23, 10, "13:00", "Cansu Yel", "balayage"),
  entry(24, 12, "10:00", "Zeynep Baş", "balayage"),
  entry(25, 13, "11:00", "Irmak Toprak", "kesim"),
];
