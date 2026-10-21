import { pathToFileURL } from 'node:url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { NOTIFICATION_TYPES, PORTFOLIO_SOURCE, ROLES } from '../src/constants/index.js';
import { Appointment } from '../src/models/Appointment.js';
import { Notification } from '../src/models/Notification.js';
import { Portfolio } from '../src/models/Portfolio.js';
import { Review } from '../src/models/Review.js';
import { Salon } from '../src/models/Salon.js';
import { Service } from '../src/models/Service.js';
import { User } from '../src/models/User.js';
import { createSalonForOwner, refreshSalonRating, syncSalonCatalog, toPoint } from '../src/services/salon.service.js';
import { addDays, formatDayMonth, getDayOfWeek, getSalonNow, minutesToTime, timeToMinutes } from '../src/utils/time.js';

export const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Salonabox123';

export const SEED_ACCOUNTS = Object.freeze({
  customer: 'elif.kaya@posta.com',
  salon: 'ayse@ayseyilmazstudio.com',
});

const image = (seed, size = '800/1000') => `https://picsum.photos/seed/salonabox-${seed}/${size}`;

const SERVICES = {
  kesim: { name: 'Saç Kesimi', duration: 45, price: 600, description: 'Yüz hattına uygun kesim, yıkama ve şekillendirme dahil.' },
  boya: { name: 'Boya', duration: 120, price: 1800, description: 'Dip veya tüm saç boyama.' },
  fon: { name: 'Fön', duration: 30, price: 350, description: 'Yıkama ve fön.' },
};

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
  const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const customer = await User.create({
    name: 'Elif Kaya',
    email: SEED_ACCOUNTS.customer,
    phone: '0532 555 12 34',
    passwordHash,
    role: ROLES.CUSTOMER,
    location: { city: 'İstanbul', district: 'Kadıköy' },
  });

  const owner = await User.create({
    name: 'Ayşe Yılmaz',
    email: SEED_ACCOUNTS.salon,
    phone: '0216 555 01 01',
    passwordHash,
    role: ROLES.SALON,
  });

  const salon = await createSalonForOwner(owner, {
    name: 'Ayşe Yılmaz Studio',
    description:
      'Ayşe Yılmaz Studio, renk ve kesimde uzmanlaşmış ekibiyle doğal görünümlü sonuçlara odaklanır. Her uygulama öncesi kısa bir saç analizi yapılır.',
    neighborhood: 'Moda',
    address: 'Moda Mah. Bahariye Cad. No:24, Kadıköy / İstanbul',
    phone: '0216 555 01 01',
    email: 'merhaba@ayseyilmazstudio.com',
    audience: 'Kadın · Erkek',
    hairStyles: ['Uzun', 'Dalgalı', 'Bob'],
    city: 'İstanbul',
    district: 'Kadıköy',
    coverImage: image('ayse-kapak', '1200/900'),
    location: toPoint({ lat: 40.979, lng: 29.025 }),
  });

  const services = {};
  for (const [category, data] of Object.entries(SERVICES)) {
    services[category] = await Service.create({ ...data, category, salon: salon._id });
  }

  let sequence = 48207;
  const addAppointment = ({ category, date, startTime, status = 'BOOKED', ...rest }) => {
    const service = services[category];
    return Appointment.create({
      reference: `SL-000${sequence++}`,
      customer: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      source: 'ONLINE',
      salon: salon._id,
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
  };

  const upcoming = await addAppointment({ category: 'kesim', date: openDay(1), startTime: '13:00', notes: 'Kısa kesim istiyorum.' });
  const nextWeek = await addAppointment({ category: 'fon', date: openDay(6), startTime: '15:00' });
  const reviewed = await addAppointment({ category: 'boya', date: openDay(-9), startTime: '10:00', status: 'COMPLETED' });
  const toReview = await addAppointment({ category: 'kesim', date: openDay(-16), startTime: '11:00', status: 'COMPLETED' });
  const cancelled = await addAppointment({
    category: 'fon',
    date: openDay(-2),
    startTime: '16:00',
    status: 'CANCELLED',
    cancellationReason: 'Planlarım değişti',
  });

  const review = await Review.create({
    appointment: reviewed._id,
    customer: customer._id,
    salon: salon._id,
    serviceName: reviewed.serviceName,
    rating: 5,
    comment: 'Renk tam istediğim gibi oldu, uygulama öncesi saç analizi de yapıldı.',
    hairPhotos: [image('elif-boya')],
    isPublic: true,
    createdAt: at(addDays(reviewed.date, 1)),
  });
  await Appointment.updateOne({ _id: reviewed._id }, { isReviewed: true });

  await Portfolio.insertMany([
    {
      salon: salon._id,
      source: PORTFOLIO_SOURCE.SALON,
      image: image('ayse-1'),
      title: 'Küt bob kesim',
      isPublished: true,
    },
    {
      salon: salon._id,
      source: PORTFOLIO_SOURCE.REVIEW,
      review: review._id,
      image: review.hairPhotos[0],
      title: reviewed.serviceName,
      customerName: customer.name,
      rating: review.rating,
      hasConsent: true,
      isPublished: true,
    },
  ]);

  const describe = (appointment, who) =>
    `${who} · ${appointment.serviceName} · ${formatDayMonth(appointment.date)}, ${appointment.startTime}`;
  const T = NOTIFICATION_TYPES;

  await Notification.insertMany([
    { recipient: customer._id, type: T.APPOINTMENT_CREATED, title: 'Randevunuz oluşturuldu.', body: describe(upcoming, salon.name), appointment: upcoming._id, createdAt: hoursAgo(2) },
    { recipient: customer._id, type: T.REVIEW_REQUESTED, title: 'Değerlendirmeniz için hazır.', body: `${salon.name} ziyaretinizi değerlendirin.`, appointment: toReview._id, createdAt: hoursAgo(50) },
    { recipient: customer._id, type: T.APPOINTMENT_CANCELLED, title: 'Randevunuz iptal edildi.', body: describe(cancelled, salon.name), appointment: cancelled._id, isRead: true, createdAt: hoursAgo(60) },
    { recipient: owner._id, type: T.APPOINTMENT_CREATED, title: 'Yeni randevu', body: describe(upcoming, customer.name), appointment: upcoming._id, createdAt: hoursAgo(2) },
    { recipient: owner._id, type: T.APPOINTMENT_CREATED, title: 'Yeni randevu', body: describe(nextWeek, customer.name), appointment: nextWeek._id, createdAt: hoursAgo(5) },
    { recipient: owner._id, type: T.REVIEW_PUBLISHED, title: 'Yeni değerlendirme · 5 yıldız', body: `${customer.name} değerlendirmesinin profilde paylaşılmasına izin verdi.`, appointment: reviewed._id, isRead: true, createdAt: hoursAgo(30) },
  ]);

  await syncSalonCatalog(salon._id);
  await refreshSalonRating(salon._id);

  const [salonCount, serviceCount, appointmentCount, reviewCount, portfolioCount, notificationCount] = await Promise.all(
    [Salon, Service, Appointment, Review, Portfolio, Notification].map((model) => model.countDocuments()),
  );

  return {
    users: 2,
    salons: salonCount,
    services: serviceCount,
    appointments: appointmentCount,
    reviews: reviewCount,
    portfolio: portfolioCount,
    notifications: notificationCount,
    accounts: { ...SEED_ACCOUNTS },
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
