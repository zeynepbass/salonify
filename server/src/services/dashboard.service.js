import { APPOINTMENT_STATUS } from '../constants/index.js';
import { Appointment } from '../models/Appointment.js';
import { getSalonNow, getWeekRange } from '../utils/time.js';
import { getDayLoad } from './availability.service.js';

const { BOOKED, CANCELLED, COMPLETED } = APPOINTMENT_STATUS;
const UPCOMING_LIMIT = 5;

// Panel özet ekranı için gereken her şeyi tek istekte döndürür.
export async function getDashboard(salon) {
  const now = getSalonNow();
  const week = getWeekRange(now.date);
  const thisWeek = { salon: salon._id, date: { $gte: week.from, $lte: week.to } };

  const upcoming = {
    salon: salon._id,
    status: BOOKED,
    $or: [{ date: { $gt: now.date } }, { date: now.date, startTime: { $gt: now.time } }],
  };

  const [todayAppointments, upcomingAppointments, upcomingCount, completedAppointments, cancelledAppointments, dayLoad] = await Promise.all([
    Appointment.find({ salon: salon._id, date: now.date, status: { $ne: CANCELLED } }).sort({ startTime: 1 }),
    Appointment.find(upcoming).sort({ date: 1, startTime: 1 }).limit(UPCOMING_LIMIT),
    Appointment.countDocuments(upcoming),
    Appointment.countDocuments({ ...thisWeek, status: COMPLETED }),
    Appointment.countDocuments({ ...thisWeek, status: CANCELLED }),
    getDayLoad(salon._id, now.date),
  ]);

  // Doluluk: bugünkü randevuların toplam süresinin, salonun bugün açık
  // olduğu süreye (molalar hariç) oranı.
  const bookedMinutes = todayAppointments.reduce((total, appointment) => total + appointment.duration, 0);
  const occupancy = dayLoad.openMinutes ? Math.min(100, Math.round((bookedMinutes / dayLoad.openMinutes) * 100)) : 0;

  return {
    date: now.date,
    week,
    todayAppointments,
    upcomingAppointments,
    upcomingCount,
    today: { occupancy, freeSlotCount: dayLoad.freeSlotCount },
    completedAppointments,
    cancelledAppointments,
    averageRating: salon.rating,
    reviewCount: salon.reviewCount,
  };
}
