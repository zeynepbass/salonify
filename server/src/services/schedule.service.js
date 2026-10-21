import { APPOINTMENT_STATUS } from '../constants/index.js';
import { Appointment } from '../models/Appointment.js';
import { BlockedDate } from '../models/BlockedDate.js';
import { WorkingHours } from '../models/WorkingHours.js';
import { ApiError, isDuplicateKeyError } from '../utils/ApiError.js';
import { getSalonNow } from '../utils/time.js';
import { sortWeek } from './salon.service.js';

export async function getWorkingHours(salonId) {
  return sortWeek(await WorkingHours.find({ salon: salonId }));
}

export async function updateWorkingHours(salonId, days) {
  await WorkingHours.bulkWrite(
    days.map(({ dayOfWeek, ...fields }) => ({
      updateOne: {
        filter: { salon: salonId, dayOfWeek },
        update: { $set: fields },
        upsert: true,
      },
    })),
  );
  return getWorkingHours(salonId);
}

export function listBlockedDates(salonId) {
  return BlockedDate.find({ salon: salonId, date: { $gte: getSalonNow().date } }).sort({ date: 1 });
}

export async function addBlockedDate(salonId, { date, note }) {
  let blockedDate;
  try {
    blockedDate = await BlockedDate.create({ salon: salonId, date, note });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new ApiError(409, 'Bu tarih zaten kapalı olarak işaretlenmiş.');
    throw error;
  }

  const bookedAppointmentCount = await Appointment.countDocuments({
    salon: salonId,
    date,
    status: APPOINTMENT_STATUS.BOOKED,
  });

  return { ...blockedDate.toJSON(), bookedAppointmentCount };
}

export async function removeBlockedDate(salonId, blockedDateId) {
  const result = await BlockedDate.deleteOne({ _id: blockedDateId, salon: salonId });
  if (result.deletedCount === 0) throw new ApiError(404, 'Kapalı gün bulunamadı.');
}
