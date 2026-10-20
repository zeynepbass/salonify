import { randomInt } from 'node:crypto';
import { APPOINTMENT_SOURCE, APPOINTMENT_STATUS, NOTIFICATION_TYPES } from '../constants/index.js';
import { Appointment } from '../models/Appointment.js';
import { Salon } from '../models/Salon.js';
import { Service } from '../models/Service.js';
import { ApiError, isDuplicateKeyError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/response.js';
import { escapeRegex, formatDayMonth, getSalonNow, hasStarted } from '../utils/time.js';
import { assertSlotAvailable, SLOT_TAKEN_MESSAGE } from './availability.service.js';
import { notify } from './notification.service.js';
import { assertSalonExists } from './salon.service.js';

const { BOOKED, CANCELLED, COMPLETED, NO_SHOW } = APPOINTMENT_STATUS;
const SALON_SUMMARY = 'name address neighborhood district city phone coverImage';

const generateReference = () => `SL-${String(randomInt(0, 100_000_000)).padStart(8, '0')}`;

// ---------------------------------------------------------------------------
// Bildirimler
// ---------------------------------------------------------------------------

const TITLES = {
  [NOTIFICATION_TYPES.APPOINTMENT_CREATED]: { customer: 'Randevunuz oluşturuldu.', salon: 'Yeni randevu' },
  [NOTIFICATION_TYPES.APPOINTMENT_UPDATED]: { customer: 'Randevunuz güncellendi.', salon: 'Randevu güncellendi' },
  [NOTIFICATION_TYPES.APPOINTMENT_CANCELLED]: { customer: 'Randevunuz iptal edildi.', salon: 'Randevu iptal edildi' },
  [NOTIFICATION_TYPES.APPOINTMENT_COMPLETED]: { customer: 'Randevunuz tamamlandı.' },
};

// Randevu olaylarını ilgili taraflara bildirir. Hesabı olmayan (salonun elle
// girdiği) müşteriler için customer boş olduğundan bildirim oluşmaz.
async function notifyAppointmentEvent(type, appointment, { toCustomer = false, toSalon = false }) {
  const salon = await Salon.findById(appointment.salon).select('name owner');
  if (!salon) return;

  const when = `${formatDayMonth(appointment.date)}, ${appointment.startTime}`;
  const entries = [];

  if (toCustomer && appointment.customer) {
    entries.push({
      recipient: appointment.customer,
      type,
      title: TITLES[type].customer,
      body: `${salon.name} · ${appointment.serviceName} · ${when}`,
      appointment: appointment._id,
    });
  }
  if (toSalon) {
    entries.push({
      recipient: salon.owner,
      type,
      title: TITLES[type].salon,
      body: `${appointment.customerName} · ${appointment.serviceName} · ${when}`,
      appointment: appointment._id,
    });
  }
  // Randevu tamamlandığında müşteriden değerlendirme istenir.
  if (type === NOTIFICATION_TYPES.APPOINTMENT_COMPLETED && appointment.customer) {
    entries.push({
      recipient: appointment.customer,
      type: NOTIFICATION_TYPES.REVIEW_REQUESTED,
      title: 'Değerlendirmeniz için hazır.',
      body: `${salon.name} ziyaretinizi değerlendirin.`,
      appointment: appointment._id,
    });
  }

  await notify(entries);
}

// ---------------------------------------------------------------------------
// Ortak yardımcılar
// ---------------------------------------------------------------------------

// Müsaitlik kontrolünden geçen iki istek aynı anda kayda ulaşırsa, unique
// index ikincisini E11000 hatasıyla reddeder. Bu hatayı 409 Conflict'e
// çeviriyoruz. Yani asıl garanti veritabanındadır; üstteki kontrol yalnızca
// anlaşılır hata mesajları üretmek içindir.
function toSlotConflict(error) {
  return isDuplicateKeyError(error, 'slots') ? new ApiError(409, SLOT_TAKEN_MESSAGE) : error;
}

async function findBookableService(salonId, serviceId) {
  // Hizmet seçilen salona ait ve aktif olmalı. Yalnızca serviceId ile
  // aransaydı, A salonuna B salonunun hizmetiyle randevu yazılabilirdi.
  const service = await Service.findOne({ _id: serviceId, salon: salonId, isActive: true });
  if (!service) throw new ApiError(404, 'Hizmet bulunamadı.');
  return service;
}

async function createAppointment({ salonId, serviceId, date, startTime, notes, customer, customerName, customerPhone, source }) {
  const service = await findBookableService(salonId, serviceId);
  const { endTime } = await assertSlotAvailable({ salonId, date, startTime, duration: service.duration });

  const payload = {
    customer,
    customerName,
    customerPhone,
    salon: salonId,
    service: service._id,
    serviceName: service.name,
    duration: service.duration,
    price: service.price,
    date,
    startTime,
    endTime,
    notes,
    source,
    // Onay adımı yok: randevu oluştuğu anda kesinleşmiştir.
    status: BOOKED,
  };

  // Referans kodu rastgele üretilir; çok düşük ihtimalle çakışırsa yeniden denenir.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await Appointment.create({ ...payload, reference: generateReference() });
    } catch (error) {
      if (isDuplicateKeyError(error, 'reference')) continue;
      throw toSlotConflict(error);
    }
  }
  throw new ApiError(503, 'Randevu oluşturulamadı. Lütfen tekrar deneyin.');
}

function assertBooked(appointment) {
  // BOOKED dışındaki durumlar (iptal, tamamlandı, gelmedi) son durumlardır;
  // bu randevular artık değiştirilemez.
  if (appointment.status !== BOOKED) {
    throw new ApiError(409, 'Yalnızca aktif (BOOKED) randevular üzerinde işlem yapılabilir.');
  }
}

// Randevunun hizmetini, tarihini veya saatini değiştirir. Yeni zaman için
// müsaitlik kuralları baştan uygulanır; randevunun kendi mevcut saati
// "dolu" sayılmaz.
async function reschedule(appointment, { serviceId, date, startTime }) {
  let { duration } = appointment;

  if (serviceId && String(serviceId) !== String(appointment.service)) {
    const service = await findBookableService(appointment.salon, serviceId);
    appointment.set({ service: service._id, serviceName: service.name, duration: service.duration, price: service.price });
    duration = service.duration;
  }

  const nextDate = date ?? appointment.date;
  const nextStart = startTime ?? appointment.startTime;
  const { endTime } = await assertSlotAvailable({
    salonId: appointment.salon,
    date: nextDate,
    startTime: nextStart,
    duration,
    excludeAppointmentId: appointment._id,
  });

  appointment.set({ date: nextDate, startTime: nextStart, endTime });
}

async function applyEdit(appointment, { serviceId, date, startTime, ...fields }) {
  assertBooked(appointment);

  // Form çoğu zaman değişmeyen alanları da gönderir. Müsaitlik kurallarını
  // yalnızca hizmet, tarih veya saat gerçekten değiştiyse yeniden uyguluyoruz;
  // aksi halde yalnızca notu düzeltmek isteyen salon gereksiz yere engellenirdi.
  const scheduleChanged =
    (serviceId !== undefined && String(serviceId) !== String(appointment.service)) ||
    (date !== undefined && date !== appointment.date) ||
    (startTime !== undefined && startTime !== appointment.startTime);

  if (scheduleChanged) await reschedule(appointment, { serviceId, date, startTime });
  appointment.set(fields);

  try {
    await appointment.save();
  } catch (error) {
    throw toSlotConflict(error);
  }
}

async function cancel(appointment, reason = '') {
  assertBooked(appointment);
  // Durum CANCELLED olduğunda randevu unique index'in kapsamından çıkar;
  // saat başka bir müşteri için kendiliğinden müsait hale gelir.
  appointment.set({ status: CANCELLED, cancellationReason: reason });
  await appointment.save();
}

// ---------------------------------------------------------------------------
// Müşteri işlemleri
// ---------------------------------------------------------------------------

// Frontend'den gelen appointmentId tek başına yetki anlamına gelmez.
// Randevuyu her zaman (id + giriş yapan müşteri) çiftiyle arıyoruz. Randevu
// başkasına aitse "bulunamadı" döner; böylece hem erişim engellenir hem de
// o kimlikte bir randevunun var olduğu bilgisi sızdırılmaz.
async function findCustomerAppointment(customerId, appointmentId) {
  const appointment = await Appointment.findOne({ _id: appointmentId, customer: customerId });
  if (!appointment) throw new ApiError(404, 'Randevu bulunamadı.');
  return appointment;
}

export async function bookAppointment(customer, { salonId, serviceId, date, startTime, notes }) {
  await assertSalonExists(salonId);

  // Müşteri kimliği body'den değil, doğrulanmış oturumdan alınır; kimse
  // başkası adına randevu oluşturamaz.
  const appointment = await createAppointment({
    salonId,
    serviceId,
    date,
    startTime,
    notes,
    customer: customer._id,
    customerName: customer.name,
    customerPhone: customer.phone,
    source: APPOINTMENT_SOURCE.ONLINE,
  });

  await notifyAppointmentEvent(NOTIFICATION_TYPES.APPOINTMENT_CREATED, appointment, { toCustomer: true, toSalon: true });
  return appointment.populate('salon', SALON_SUMMARY);
}

export async function listCustomerAppointments({ customerId, status, scope, page, limit }) {
  const filter = { customer: customerId };
  let sort = { date: -1, startTime: -1 };

  if (status) filter.status = status;
  if (scope === 'upcoming') {
    filter.status = BOOKED;
    sort = { date: 1, startTime: 1 };
  }
  if (scope === 'past') filter.status = { $ne: BOOKED };

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('salon', SALON_SUMMARY),
    Appointment.countDocuments(filter),
  ]);

  return { items, pagination: buildPagination({ page, limit, total }) };
}

export async function getCustomerAppointment(customerId, appointmentId) {
  const appointment = await findCustomerAppointment(customerId, appointmentId);
  return appointment.populate('salon', SALON_SUMMARY);
}

export async function updateCustomerAppointment(customerId, appointmentId, changes) {
  const appointment = await findCustomerAppointment(customerId, appointmentId);
  if (hasStarted(appointment)) throw new ApiError(409, 'Başlamış bir randevu değiştirilemez.');

  await applyEdit(appointment, changes);
  await notifyAppointmentEvent(NOTIFICATION_TYPES.APPOINTMENT_UPDATED, appointment, { toSalon: true });
  return appointment.populate('salon', SALON_SUMMARY);
}

export async function cancelCustomerAppointment(customerId, appointmentId, reason) {
  const appointment = await findCustomerAppointment(customerId, appointmentId);
  if (hasStarted(appointment)) throw new ApiError(409, 'Başlamış bir randevu iptal edilemez.');

  await cancel(appointment, reason);
  await notifyAppointmentEvent(NOTIFICATION_TYPES.APPOINTMENT_CANCELLED, appointment, { toCustomer: true, toSalon: true });
  return appointment.populate('salon', SALON_SUMMARY);
}

// ---------------------------------------------------------------------------
// Salon işlemleri
// ---------------------------------------------------------------------------

// Salon yalnızca kendi salonuna ait randevuları yönetebilir. salonId
// istekten değil, oturumdaki kullanıcının salonundan (req.salon) gelir.
async function findSalonAppointment(salonId, appointmentId) {
  const appointment = await Appointment.findOne({ _id: appointmentId, salon: salonId });
  if (!appointment) throw new ApiError(404, 'Randevu bulunamadı.');
  return appointment;
}

// Panel randevu listesindeki sekmeler. "Geçmiş": tarihi geçmiş ya da artık
// aktif olmayan (iptal, tamamlandı, gelmedi) randevular.
function scopeFilters(today) {
  return {
    today: { date: today },
    upcoming: { status: BOOKED, date: { $gte: today } },
    past: { $or: [{ date: { $lt: today } }, { status: { $ne: BOOKED } }] },
    all: {},
  };
}

export async function listSalonAppointments({ salonId, scope, search, date, from, to, status, page, limit }) {
  const scopes = scopeFilters(getSalonNow().date);
  const conditions = [{ salon: salonId }];

  if (scope) conditions.push(scopes[scope]);
  if (status) conditions.push({ status });
  if (date) conditions.push({ date });
  else if (from || to) conditions.push({ date: { ...(from && { $gte: from }), ...(to && { $lte: to }) } });
  if (search) conditions.push({ customerName: { $regex: escapeRegex(search), $options: 'i' } });

  const filter = { $and: conditions };
  const countScope = (name) => Appointment.countDocuments({ salon: salonId, ...scopes[name] });

  const [items, total, today, upcoming, past, all] = await Promise.all([
    Appointment.find(filter)
      // Geçmiş sekmesinde en yeni randevu en üstte görünür.
      .sort(scope === 'past' ? { date: -1, startTime: -1 } : { date: 1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Appointment.countDocuments(filter),
    ...['today', 'upcoming', 'past', 'all'].map(countScope),
  ]);

  // counts: sekme başlıklarındaki sayılar (arama ve diğer filtrelerden bağımsız).
  return { items, counts: { today, upcoming, past, all }, pagination: buildPagination({ page, limit, total }) };
}

// Salonun elle eklediği randevu da müşterininkiyle aynı kurallardan geçer
// ve doğrudan BOOKED olur.
export function createSalonAppointment(salonId, { serviceId, date, startTime, notes, customerName, customerPhone }) {
  return createAppointment({
    salonId,
    serviceId,
    date,
    startTime,
    notes,
    customer: null,
    customerName,
    customerPhone,
    source: APPOINTMENT_SOURCE.MANUAL,
  });
}

export async function updateSalonAppointment(salonId, appointmentId, { status, cancellationReason, ...changes }) {
  const appointment = await findSalonAppointment(salonId, appointmentId);

  if (status === CANCELLED) return cancelAndNotify(appointment, cancellationReason);

  if (status === COMPLETED || status === NO_SHOW) {
    assertBooked(appointment);
    // Henüz başlamamış bir randevu "tamamlandı" ya da "gelmedi" olamaz.
    // Bu kontrol olmasaydı ileri tarihli bir randevu tamamlanmış sayılıp
    // müşteriye değerlendirme hakkı açılabilirdi.
    if (!hasStarted(appointment)) {
      throw new ApiError(409, 'Randevu saati gelmeden bu işlem yapılamaz.');
    }

    appointment.status = status;
    await appointment.save();

    if (status === COMPLETED) {
      await notifyAppointmentEvent(NOTIFICATION_TYPES.APPOINTMENT_COMPLETED, appointment, { toCustomer: true });
    }
    return appointment;
  }

  // Online randevuda müşteri adı ve telefonu müşterinin hesabından gelir;
  // salon bunları yalnızca elle oluşturduğu randevularda düzenleyebilir.
  if (appointment.source !== APPOINTMENT_SOURCE.MANUAL) {
    delete changes.customerName;
    delete changes.customerPhone;
  }

  await applyEdit(appointment, changes);
  await notifyAppointmentEvent(NOTIFICATION_TYPES.APPOINTMENT_UPDATED, appointment, { toCustomer: true });
  return appointment;
}

async function cancelAndNotify(appointment, reason) {
  await cancel(appointment, reason);
  await notifyAppointmentEvent(NOTIFICATION_TYPES.APPOINTMENT_CANCELLED, appointment, { toCustomer: true });
  return appointment;
}

export async function cancelSalonAppointment(salonId, appointmentId, reason) {
  const appointment = await findSalonAppointment(salonId, appointmentId);
  return cancelAndNotify(appointment, reason);
}
