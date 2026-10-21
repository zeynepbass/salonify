import { pathToFileURL } from 'node:url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { NOTIFICATION_TYPES, PORTFOLIO_SOURCE, ROLES } from '../src/constants/index.js';
import { Appointment } from '../src/models/Appointment.js';
import { BlockedDate } from '../src/models/BlockedDate.js';
import { Notification } from '../src/models/Notification.js';
import { Portfolio } from '../src/models/Portfolio.js';
import { Review } from '../src/models/Review.js';
import { Salon } from '../src/models/Salon.js';
import { Service } from '../src/models/Service.js';
import { User } from '../src/models/User.js';
import { WorkingHours } from '../src/models/WorkingHours.js';
import { createSalonForOwner, refreshSalonRating, syncSalonCatalog, toPoint } from '../src/services/salon.service.js';
import { addDays, formatDayMonth, getDayOfWeek, getSalonNow, minutesToTime, timeToMinutes } from '../src/utils/time.js';

export const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Salonabox123';

const image = (seed, size = '800/1000') => `https://picsum.photos/seed/salonabox-${seed}/${size}`;

const SERVICE_CATALOG = {
  balayage: { name: 'Balayage', duration: 180, price: 2500, description: 'Doğal görünümlü, el ile uygulanan renk geçişi.' },
  kesim: { name: 'Saç Kesimi', duration: 45, price: 600, description: 'Yüz hattına uygun kesim, yıkama ve şekillendirme dahil.' },
  boya: { name: 'Boya', duration: 120, price: 1800, description: 'Dip veya tüm saç boyama.' },
  ombre: { name: 'Ombre', duration: 150, price: 2200, description: 'Köklerden uçlara açılan renk geçişi.' },
  rofle: { name: 'Röfle', duration: 120, price: 1900, description: 'İnce tutamlarla ışıltı.' },
  fon: { name: 'Fön', duration: 30, price: 350, description: 'Yıkama ve fön.' },
  gelin: { name: 'Gelin Saçı', duration: 120, price: 3500, description: 'Prova sonrası düğün günü saç tasarımı.' },
};

const SALONS = [
  {
    key: 'ayse',
    owner: { name: 'Ayşe Yılmaz', email: 'ayse@ayseyilmazstudio.com' },
    name: 'Ayşe Yılmaz Studio',
    neighborhood: 'Moda',
    address: 'Moda Mah. Bahariye Cad. No:24, Kadıköy / İstanbul',
    phone: '0216 555 01 01',
    email: 'merhaba@ayseyilmazstudio.com',
    audience: 'Kadın · Erkek',
    hairStyles: ['Uzun', 'Dalgalı', 'Bob'],
    coordinates: { lat: 40.979, lng: 29.025 },
    services: Object.keys(SERVICE_CATALOG),
    description:
      'Ayşe Yılmaz Studio, renk ve kesimde uzmanlaşmış ekibiyle doğal görünümlü sonuçlara odaklanır. Her uygulama öncesi kısa bir saç analizi yapılır.',
  },
  {
    key: 'nur',
    owner: { name: 'Nur Aydın', email: 'nur@ateliernur.com' },
    name: 'Atelier Nur',
    neighborhood: 'Caferağa',
    address: 'Caferağa Mah. Moda Cad. No:112, Kadıköy / İstanbul',
    phone: '0216 555 02 02',
    email: 'merhaba@ateliernur.com',
    audience: 'Kadın',
    hairStyles: ['Uzun', 'Dalgalı'],
    coordinates: { lat: 40.987, lng: 29.026 },
    services: ['gelin', 'fon', 'ombre'],
    description: 'Atelier Nur, gelin saçı ve özel gün hazırlıklarında butik bir deneyim sunar. Prova randevularıyla tarzını birlikte netleştirir.',
  },
  {
    key: 'kesik',
    owner: { name: 'Kerem Çelik', email: 'kerem@kesikhairlab.com' },
    name: 'Kesik Hair Lab',
    neighborhood: 'Fenerbahçe',
    address: 'Fenerbahçe Mah. Fener Kalamış Cad. No:58, Kadıköy / İstanbul',
    phone: '0216 555 03 03',
    email: 'merhaba@kesikhairlab.com',
    audience: 'Kadın · Erkek',
    hairStyles: ['Kısa', 'Bob', 'Orta boy'],
    coordinates: { lat: 40.969, lng: 29.04 },
    services: ['kesim', 'rofle'],
    description: 'Kesik Hair Lab, yüz hattına göre planlanan hassas kesimleriyle bilinir. Randevular saatinde başlar, bekleme olmaz.',
  },
  {
    key: 'form',
    owner: { name: 'Hakan Form', email: 'hakan@formkuafor.com' },
    name: 'Form Kuaför',
    neighborhood: 'Göztepe',
    address: 'Göztepe Mah. Tütüncü Mehmet Efendi Cad. No:41, Kadıköy / İstanbul',
    phone: '0216 555 04 04',
    email: 'merhaba@formkuafor.com',
    audience: 'Kadın · Erkek',
    hairStyles: ['Orta boy', 'Uzun'],
    coordinates: { lat: 40.979, lng: 29.06 },
    services: ['boya', 'rofle', 'fon'],
    description: 'Form Kuaför, mahallenin köklü salonlarından biri. Boya ve röflede saç sağlığını koruyan ürünlerle çalışır.',
  },
  {
    key: 'ton',
    owner: { name: 'Işık Ton', email: 'isik@tonisik.com' },
    name: 'Ton & Işık',
    neighborhood: 'Acıbadem',
    address: 'Acıbadem Mah. Acıbadem Cad. No:89, Kadıköy / İstanbul',
    phone: '0216 555 05 05',
    email: 'merhaba@tonisik.com',
    audience: 'Kadın',
    hairStyles: ['Uzun', 'Dalgalı', 'Orta boy'],
    coordinates: { lat: 41.004, lng: 29.045 },
    services: ['balayage', 'ombre'],
    description: 'Ton & Işık yalnızca renk uygulamalarına odaklanan bir stüdyo. Balayage ve ombre geçişlerinde kişiye özel ton karışımları hazırlar.',
  },
  {
    key: 'mavi',
    owner: { name: 'Deniz Mavi', email: 'deniz@mavimakas.com' },
    name: 'Mavi Makas',
    neighborhood: 'Bostancı',
    address: 'Bostancı Mah. Bağdat Cad. No:512, Kadıköy / İstanbul',
    phone: '0216 555 06 06',
    email: 'merhaba@mavimakas.com',
    audience: 'Kadın · Erkek',
    hairStyles: ['Kısa', 'Orta boy'],
    coordinates: { lat: 40.953, lng: 29.095 },
    services: ['kesim', 'fon'],
    description: 'Mavi Makas, hızlı ve özenli kesim ile fön hizmetleriyle yoğun günlerin pratik adresi.',
  },
  {
    key: 'lina',
    owner: { name: 'Lina Arslan', email: 'lina@linahairatelier.com' },
    name: 'Lina Hair Atelier',
    neighborhood: 'Suadiye',
    address: 'Suadiye Mah. Bağdat Cad. No:398, Kadıköy / İstanbul',
    phone: '0216 555 07 07',
    email: 'merhaba@linahairatelier.com',
    audience: 'Kadın',
    hairStyles: ['Uzun', 'Kıvırcık', 'Dalgalı'],
    coordinates: { lat: 40.96, lng: 29.083 },
    services: ['gelin', 'balayage'],
    description: 'Lina Hair Atelier, gelin saçı ve balayage uygulamalarında deneyimli ekibiyle sakin bir atölye ortamı sunar.',
  },
  {
    key: 'kuzey',
    owner: { name: 'Kuzey Demir', email: 'kuzey@kuzeysacevi.com' },
    name: 'Kuzey Saç Evi',
    neighborhood: 'Koşuyolu',
    address: 'Koşuyolu Mah. Koşuyolu Cad. No:17, Kadıköy / İstanbul',
    phone: '0216 555 08 08',
    email: 'merhaba@kuzeysacevi.com',
    audience: 'Kadın · Erkek',
    hairStyles: ['Kısa', 'Kıvırcık'],
    coordinates: { lat: 41.011, lng: 29.037 },
    services: ['boya', 'kesim'],
    description: 'Kuzey Saç Evi, samimi ortamı ve ulaşılabilir fiyatlarıyla boya ve kesimde güvenilir bir mahalle salonu.',
  },
];

const CUSTOMERS = [
  { key: 'elif', name: 'Elif Kaya', email: 'elif.kaya@posta.com', phone: '0532 555 12 34', createdAt: new Date('2025-03-12T09:00:00Z') },
  { key: 'zeynep', name: 'Zeynep Baş', email: 'zeynep.bas@posta.com', phone: '0533 401 11 31' },
  { key: 'selin', name: 'Selin Aksoy', email: 'selin.aksoy@posta.com', phone: '0534 404 14 34' },
  { key: 'mert', name: 'Mert Güneş', email: 'mert.gunes@posta.com', phone: '0533 403 13 33' },
  { key: 'gizem', name: 'Gizem Tan', email: 'gizem.tan@posta.com', phone: '0532 412 22 42' },
  { key: 'asli', name: 'Aslı Er', email: 'asli.er@posta.com', phone: '0531 411 21 41' },
];

async function assertSafeToSeed(reset) {
  if (env.isProduction) throw new Error('Örnek veri production ortamında yazılamaz.');

  if (reset) {
    await Promise.all(Object.values(mongoose.models).map((model) => model.deleteMany({})));
    return;
  }
  if ((await User.estimatedDocumentCount()) > 0) {
    throw new Error('Veritabanında kayıt var. Mevcut veriyi silip baştan yazmak için: npm run seed -- --reset');
  }
}

export async function seedDatabase({ reset = false } = {}) {
  await assertSafeToSeed(reset);

  const today = getSalonNow().date;
  const openDay = (offset) => {
    let date = addDays(today, offset);
    while (getDayOfWeek(date) === 0) date = addDays(date, offset < 0 ? -1 : 1);
    return date;
  };
  const at = (date, time = '12:00') => new Date(`${date}T${time}:00+03:00`);

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const customers = {};
  for (const { key, ...data } of CUSTOMERS) {
    customers[key] = await User.create({
      ...data,
      passwordHash,
      role: ROLES.CUSTOMER,
      location: { city: 'İstanbul', district: 'Kadıköy' },
    });
  }

  const salons = {};
  const owners = {};
  const services = {};
  for (const { key, owner, coordinates, services: categories, ...details } of SALONS) {
    owners[key] = await User.create({ ...owner, passwordHash, role: ROLES.SALON, phone: details.phone });
    salons[key] = await createSalonForOwner(owners[key], {
      ...details,
      city: 'İstanbul',
      district: 'Kadıköy',
      coverImage: image(`${key}-kapak`, '1200/900'),
      location: toPoint(coordinates),
    });

    services[key] = {};
    for (const category of categories) {
      services[key][category] = await Service.create({ ...SERVICE_CATALOG[category], category, salon: salons[key]._id });
    }
  }

  await Service.create({ salon: salons.ayse._id, name: 'Keratin Bakımı', category: 'diger', duration: 90, price: 1500, isActive: false });

  await WorkingHours.updateOne({ salon: salons.ayse._id, dayOfWeek: 5 }, { closeTime: '20:00' });
  await WorkingHours.updateOne({ salon: salons.ayse._id, dayOfWeek: 6 }, { openTime: '10:00', closeTime: '18:00' });
  await BlockedDate.create({ salon: salons.ayse._id, date: openDay(8), note: 'Personel eğitimi' });

  let sequence = 48207;
  const appointments = {};

  async function addAppointment(key, { salon, category, customer, guest, date, startTime, status = 'BOOKED', ...rest }) {
    const service = services[salon][category];
    appointments[key] = await Appointment.create({
      reference: `SL-000${sequence++}`,
      customer: customer ? customers[customer]._id : null,
      customerName: customer ? customers[customer].name : guest.name,
      customerPhone: customer ? customers[customer].phone : guest.phone,
      source: customer ? 'ONLINE' : 'MANUAL',
      salon: salons[salon]._id,
      service: service._id,
      serviceName: service.name,
      duration: service.duration,
      price: service.price,
      date,
      startTime,
      endTime: minutesToTime(timeToMinutes(startTime) + service.duration),
      status,
      ...rest,
    });
    return appointments[key];
  }

  if (getDayOfWeek(today) !== 0) {
    await addAppointment('ayseToday1', { salon: 'ayse', category: 'kesim', customer: 'selin', date: today, startTime: '09:00' });
    await addAppointment('ayseToday2', { salon: 'ayse', category: 'boya', guest: { name: 'Deniz Kara', phone: '0535 405 15 35' }, date: today, startTime: '13:00', notes: 'Telefonla arayıp randevu aldı' });
    await addAppointment('ayseToday3', { salon: 'ayse', category: 'fon', customer: 'mert', date: today, startTime: '16:00' });
  }
  await addAppointment('ayseNext1', { salon: 'ayse', category: 'balayage', customer: 'zeynep', date: openDay(1), startTime: '13:00', notes: 'Önceki boyası 3 ay önce' });
  await addAppointment('ayseNext2', { salon: 'ayse', category: 'gelin', guest: { name: 'Yasemin Ar', phone: '0532 422 32 52' }, date: openDay(1), startTime: '10:00' });
  await addAppointment('ayseNext3', { salon: 'ayse', category: 'kesim', customer: 'gizem', date: openDay(3), startTime: '11:00' });
  await addAppointment('ayseDone1', { salon: 'ayse', category: 'balayage', customer: 'zeynep', date: openDay(-9), startTime: '10:00', status: 'COMPLETED' });
  await addAppointment('ayseDone2', { salon: 'ayse', category: 'kesim', customer: 'selin', date: openDay(-18), startTime: '14:00', status: 'COMPLETED' });
  await addAppointment('ayseDone3', { salon: 'ayse', category: 'kesim', customer: 'mert', date: openDay(-41), startTime: '11:00', status: 'COMPLETED' });
  await addAppointment('ayseDone4', { salon: 'ayse', category: 'balayage', customer: 'gizem', date: openDay(-2), startTime: '09:30', status: 'COMPLETED' });
  await addAppointment('ayseDone5', { salon: 'ayse', category: 'boya', customer: 'asli', date: openDay(-75), startTime: '13:00', status: 'COMPLETED' });
  await addAppointment('ayseNoShow', { salon: 'ayse', category: 'boya', customer: 'asli', date: openDay(-3), startTime: '16:00', status: 'NO_SHOW' });
  await addAppointment('ayseCancelled', { salon: 'ayse', category: 'fon', customer: 'mert', date: openDay(-1), startTime: '13:00', status: 'CANCELLED', cancellationReason: 'Planlarım değişti' });

  await addAppointment('elifUpcoming1', { salon: 'kesik', category: 'kesim', customer: 'elif', date: openDay(2), startTime: '15:00' });
  await addAppointment('elifUpcoming2', { salon: 'nur', category: 'fon', customer: 'elif', date: openDay(12), startTime: '14:30' });
  await addAppointment('elifToReview', { salon: 'kesik', category: 'kesim', customer: 'elif', date: openDay(-16), startTime: '11:00', status: 'COMPLETED' });
  await addAppointment('elifReviewed1', { salon: 'ton', category: 'ombre', customer: 'elif', date: openDay(-35), startTime: '13:00', status: 'COMPLETED' });
  await addAppointment('elifReviewed2', { salon: 'nur', category: 'fon', customer: 'elif', date: openDay(-88), startTime: '15:00', status: 'COMPLETED' });
  await addAppointment('elifCancelled', { salon: 'form', category: 'boya', customer: 'elif', date: openDay(-54), startTime: '10:30', status: 'CANCELLED', cancellationReason: 'Başka bir saat istiyorum' });
  await addAppointment('elifNoShow', { salon: 'mavi', category: 'fon', customer: 'elif', date: openDay(-69), startTime: '17:00', status: 'NO_SHOW' });

  const others = [
    ['nur', 'ombre', 'zeynep', 5, 'Prova randevusunda her detayı konuştuk, sonuç tam hayal ettiğim gibi.'],
    ['kesik', 'kesim', 'mert', 5, 'Online randevu ile bekleme olmadan girdim. Hızlı, temiz ve özenli.'],
    ['form', 'rofle', 'selin', 4, 'Röfle tonları güzel oldu, biraz uzun sürdü.'],
    ['ton', 'balayage', 'gizem', 5, 'Renk geçişleri çok doğal, saçım hiç yıpranmadı.'],
    ['mavi', 'kesim', 'zeynep', 4, 'Pratik ve hızlı; öğle arasında halloldu.'],
    ['lina', 'balayage', 'selin', 5, 'Sakin bir ortam, çok ilgili bir ekip.'],
    ['kuzey', 'boya', 'mert', 4, 'Fiyatına göre gayet iyi, samimi bir salon.'],
  ];
  for (const [index, [salon, category, customer]] of others.entries()) {
    await addAppointment(`other${index}`, { salon, category, customer, date: openDay(-20 - index * 3), startTime: '10:00', status: 'COMPLETED' });
  }

  const reviews = {};
  async function addReview(key, { rating, comment, photos = [], isPublic }) {
    const appointment = appointments[key];
    reviews[key] = await Review.create({
      appointment: appointment._id,
      customer: appointment.customer,
      salon: appointment.salon,
      serviceName: appointment.serviceName,
      rating,
      comment,
      hairPhotos: photos,
      isPublic,
      createdAt: at(addDays(appointment.date, 1)),
    });
    await Appointment.updateOne({ _id: appointment._id }, { isReviewed: true });
    return reviews[key];
  }

  await addReview('ayseDone1', { rating: 5, isPublic: true, photos: [image('zeynep-balayage')], comment: 'Ne istediğimi ilk dakikada anladı. Renk geçişleri çok doğal oldu, üç hafta sonra bile ilk günkü gibi duruyor.' });
  await addReview('ayseDone2', { rating: 4, isPublic: true, comment: 'Kesim çok iyiydi; randevu saatinde başlandı. Salon cumartesi biraz kalabalıktı.' });
  await addReview('ayseDone3', { rating: 5, isPublic: true, comment: 'Uygulama öncesi saç analizi yapıldı ve bakım önerileri verildi. Kesinlikle tekrar geleceğim.' });
  await addReview('ayseDone4', { rating: 5, isPublic: true, photos: [image('gizem-balayage-1'), image('gizem-balayage-2')], comment: 'Tam istediğim ton oldu, teşekkürler!' });
  await addReview('ayseDone5', { rating: 4, isPublic: false, photos: [image('asli-boya')], comment: 'Renk güzel oldu ama biraz beklemek zorunda kaldım.' });
  await addReview('elifReviewed1', { rating: 5, isPublic: true, comment: 'Renk geçişi tam istediğim gibi oldu, çok memnun kaldım.' });
  await addReview('elifReviewed2', { rating: 4, isPublic: false, comment: 'Hızlı ve özenli; sadece biraz beklettiler.' });
  for (const [index, [, , , rating, comment]] of others.entries()) {
    await addReview(`other${index}`, { rating, comment, isPublic: true });
  }

  const salonItem = (salon, seed, title, description = '') => ({
    salon: salons[salon]._id,
    source: PORTFOLIO_SOURCE.SALON,
    image: image(seed),
    title,
    description,
    isPublished: true,
  });
  const reviewItems = (key, isPublished) =>
    reviews[key].hairPhotos.map((photo) => ({
      salon: appointments[key].salon,
      source: PORTFOLIO_SOURCE.REVIEW,
      review: reviews[key]._id,
      image: photo,
      title: appointments[key].serviceName,
      customerName: appointments[key].customerName,
      rating: reviews[key].rating,
      hasConsent: reviews[key].isPublic,
      isPublished,
    }));

  await Portfolio.insertMany([
    salonItem('ayse', 'ayse-1', 'Bal köpüğü balayage', 'Koyu kumral üzerine sıcak tonlar.'),
    salonItem('ayse', 'ayse-2', 'Küt bob kesim'),
    salonItem('ayse', 'ayse-3', 'Gelin topuzu', 'Düğün günü hazırlığı.'),
    ...reviewItems('ayseDone1', true),
    ...reviewItems('ayseDone4', false),
    ...reviewItems('ayseDone5', false),
    ...SALONS.filter((salon) => salon.key !== 'ayse').flatMap((salon) => [
      salonItem(salon.key, `${salon.key}-1`, SERVICE_CATALOG[salon.services[0]].name),
      salonItem(salon.key, `${salon.key}-2`, SERVICE_CATALOG[salon.services[1]].name),
    ]),
  ]);

  const describe = (appointment, who) =>
    `${who} · ${appointment.serviceName} · ${formatDayMonth(appointment.date)}, ${appointment.startTime}`;
  const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);
  const T = NOTIFICATION_TYPES;

  await Notification.insertMany([
    { recipient: customers.elif._id, type: T.APPOINTMENT_CREATED, title: 'Randevunuz oluşturuldu.', body: describe(appointments.elifUpcoming1, 'Kesik Hair Lab'), appointment: appointments.elifUpcoming1._id, createdAt: hoursAgo(2) },
    { recipient: customers.elif._id, type: T.APPOINTMENT_UPDATED, title: 'Randevunuz güncellendi.', body: describe(appointments.elifUpcoming2, 'Atelier Nur'), appointment: appointments.elifUpcoming2._id, createdAt: hoursAgo(26) },
    { recipient: customers.elif._id, type: T.REVIEW_REQUESTED, title: 'Değerlendirmeniz için hazır.', body: 'Kesik Hair Lab ziyaretinizi değerlendirin.', appointment: appointments.elifToReview._id, createdAt: hoursAgo(50) },
    { recipient: customers.elif._id, type: T.APPOINTMENT_COMPLETED, title: 'Randevunuz tamamlandı.', body: describe(appointments.elifReviewed1, 'Ton & Işık'), appointment: appointments.elifReviewed1._id, isRead: true, createdAt: at(appointments.elifReviewed1.date, '15:30') },
    { recipient: customers.elif._id, type: T.APPOINTMENT_CANCELLED, title: 'Randevunuz iptal edildi.', body: describe(appointments.elifCancelled, 'Form Kuaför'), appointment: appointments.elifCancelled._id, isRead: true, createdAt: at(addDays(appointments.elifCancelled.date, -1)) },
    { recipient: owners.ayse._id, type: T.APPOINTMENT_CREATED, title: 'Yeni randevu', body: describe(appointments.ayseNext1, 'Zeynep Baş'), appointment: appointments.ayseNext1._id, createdAt: hoursAgo(1) },
    { recipient: owners.ayse._id, type: T.APPOINTMENT_CANCELLED, title: 'Randevu iptal edildi', body: describe(appointments.ayseCancelled, 'Mert Güneş'), appointment: appointments.ayseCancelled._id, createdAt: hoursAgo(30) },
    { recipient: owners.ayse._id, type: T.REVIEW_PUBLISHED, title: 'Yeni değerlendirme · 5 yıldız', body: 'Gizem Tan değerlendirmesinin profilde paylaşılmasına izin verdi.', appointment: appointments.ayseDone4._id, isRead: true, createdAt: hoursAgo(32) },
    { recipient: owners.ayse._id, type: T.APPOINTMENT_CREATED, title: 'Yeni randevu', body: describe(appointments.ayseNext3, 'Gizem Tan'), appointment: appointments.ayseNext3._id, isRead: true, createdAt: hoursAgo(52) },
  ]);

  for (const salon of Object.values(salons)) {
    await syncSalonCatalog(salon._id);
    await refreshSalonRating(salon._id);
  }

  const [salonCount, serviceCount, appointmentCount, reviewCount, portfolioCount, notificationCount] = await Promise.all(
    [Salon, Service, Appointment, Review, Portfolio, Notification].map((model) => model.countDocuments()),
  );

  return {
    users: CUSTOMERS.length + SALONS.length,
    salons: salonCount,
    services: serviceCount,
    appointments: appointmentCount,
    reviews: reviewCount,
    portfolio: portfolioCount,
    notifications: notificationCount,
    accounts: {
      customer: customers.elif.email,
      salon: owners.ayse.email,
      otherCustomers: CUSTOMERS.slice(1).map((customer) => customer.email),
      otherSalons: SALONS.slice(1).map((salon) => salon.owner.email),
    },
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await connectDatabase();
    await seedDatabase({ reset: process.argv.includes('--reset') });
  } catch {
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}
