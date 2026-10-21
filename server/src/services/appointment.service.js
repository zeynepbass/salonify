import { randomInt } from 'node:crypto';
import { APPOINTMENT_SOURCE, APPOINTMENT_STATUS, NOTIFICATION_TYPES } from '../constants/index.js';
import { Appointment } from '../models/Appointment.js';
import { Salon } from '../models/Salon.js';
import { Service } from '../models/Service.js';
import { ApiError, isDuplicateKeyError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/response.js';
import { formatDayMonth, getSalonNow, hasStarted } from '../utils/time.js';
import { assertSlotAvailable, SLOT_TAKEN_MESSAGE } from './availability.service.js';
import { notify } from './notification.service.js';
import { assertSalonExists } from './salon.service.js';

const { BOOKED, CANCELLED, COMPLETED, NO_SHOW } = APPOINTMENT_STATUS;
const SALON_SUMMARY = 'name address neighborhood district city phone coverImage';

const generateReference = () => `SL-${String(randomInt(0, 100_000_000)).padStart(8, '0')}`;

const TITLES = {
  [NOTIFICATION_TYPES.APPOINTMENT_CREATED]: { customer: 'Randevunuz oluşturuldu.', salon: 'Yeni randevu' },
  [NOTIFICATION_TYPES.APPOINTMENT_UPDATED]: { customer: 'Randevunuz güncellendi.', salon: 'Randevu güncellendi' },
  [NOTIFICATION_TYPES.APPOINTMENT_CANCELLED]: { customer: 'Randevunuz iptal edildi.', salon: 'Randevu iptal edildi' },
  [NOTIFICATION_TYPES.APPOINTMENT_COMPLETED]: { customer: 'Randevunuz tamamlandı.' },
};

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

function toSlotConflict(error) {
  return isDuplicateKeyError(error, 'slots') ? new ApiError(409, SLOT_TAKEN_MESSAGE) : error;
}

async function findBookableService(salonId, serviceId) {
  const service = await Service.findOne({ _id: serviceId, salon: salonId });
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
    status: BOOKED,
  };

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
  if (appointment.status !== BOOKED) {
    throw new ApiError(409, 'Yalnızca aktif (BOOKED) randevular üzerinde işlem yapılabilir.');
  }
}

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
  appointment.set({ status: CANCELLED, cancellationReason: reason });
  await appointment.save();
}

async function findCustomerAppointment(customerId, appointmentId) {
  const appointment = await Appointment.findOne({ _id: appointmentId, customer: customerId });
  if (!appointment) throw new ApiError(404, 'Randevu bulunamadı.');
  return appointment;
}

export async function bookAppointment(customer, { salonId, serviceId, date, startTime, notes }) {
  await assertSalonExists(salonId);

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

async function findSalonAppointment(salonId, appointmentId) {
  const appointment = await Appointment.findOne({ _id: appointmentId, salon: salonId });
  if (!appointment) throw new ApiError(404, 'Randevu bulunamadı.');
  return appointment;
}

function scopeFilters(today) {
  return {
    today: { date: today },
    upcoming: { status: BOOKED, date: { $gte: today } },
    past: { $or: [{ date: { $lt: today } }, { status: { $ne: BOOKED } }] },
    all: {},
  };
}

export async function listSalonAppointments({ salonId, scope, date, from, to, status, page, limit }) {
  const scopes = scopeFilters(getSalonNow().date);
  const conditions = [{ salon: salonId }];

  if (scope) conditions.push(scopes[scope]);
  if (status) conditions.push({ status });
  if (date) conditions.push({ date });
  else if (from || to) conditions.push({ date: { ...(from && { $gte: from }), ...(to && { $lte: to }) } });

  const filter = { $and: conditions };
  const countScope = (name) => Appointment.countDocuments({ salon: salonId, ...scopes[name] });

  const [items, total, today, upcoming, past, all] = await Promise.all([
    Appointment.find(filter)
      .sort(scope === 'past' ? { date: -1, startTime: -1 } : { date: 1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Appointment.countDocuments(filter),
    ...['today', 'upcoming', 'past', 'all'].map(countScope),
  ]);

  return { items, counts: { today, upcoming, past, all }, pagination: buildPagination({ page, limit, total }) };
}

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
