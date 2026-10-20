import { APPOINTMENT_STATUS } from '../constants/index.js';
import { Appointment } from '../models/Appointment.js';
import { Notification } from '../models/Notification.js';
import { Portfolio } from '../models/Portfolio.js';
import { Review } from '../models/Review.js';
import { User } from '../models/User.js';
import { ApiError, isDuplicateKeyError } from '../utils/ApiError.js';
import { getSalonNow } from '../utils/time.js';
import { cancelCustomerAppointment } from './appointment.service.js';
import { assertPassword } from './auth.service.js';
import { refreshSalonRating } from './salon.service.js';
import { deleteUploadsOf } from './upload.service.js';

const DELETED_CUSTOMER_NAME = 'Silinmiş kullanıcı';

export async function updateProfile(user, { notificationPreferences, location, ...fields }) {
  user.set(fields);

  // İç içe alanlar tek tek güncellenir; gönderilmeyenler olduğu gibi kalır.
  for (const [key, value] of Object.entries(notificationPreferences ?? {})) {
    user.notificationPreferences[key] = value;
  }
  for (const [key, value] of Object.entries(location ?? {})) {
    user.location[key] = value;
  }

  try {
    await user.save();
  } catch (error) {
    if (isDuplicateKeyError(error, 'email')) throw new ApiError(409, 'Bu e-posta adresi başka bir hesapta kullanılıyor.');
    throw error;
  }

  return user;
}

// HESAP SİLME (müşteri)
// Müşterinin kişisel verileri kalıcı olarak silinir. Adımların sırası
// önemlidir: kullanıcı kaydı en son silinir; arada bir hata olursa hesap
// hâlâ durur ve işlem tekrar denenebilir.
export async function deleteAccount(user, password) {
  await assertPassword(user._id, password);

  // 1. İleri tarihli randevular iptal edilir; saatler salon için yeniden
  //    müsait olur ve salon bilgilendirilir.
  const now = getSalonNow();
  const upcoming = await Appointment.find({
    customer: user._id,
    status: APPOINTMENT_STATUS.BOOKED,
    $or: [{ date: { $gt: now.date } }, { date: now.date, startTime: { $gt: now.time } }],
  }).select('_id');
  for (const appointment of upcoming) {
    await cancelCustomerAppointment(user._id, appointment._id, 'Hesap silindi');
  }

  // 2. Değerlendirmeler ve onlardan türeyen portföy görselleri silinir;
  //    etkilenen salonların puanı yeniden hesaplanır.
  const reviews = await Review.find({ customer: user._id }).select('_id salon');
  await Portfolio.deleteMany({ review: { $in: reviews.map((review) => review._id) } });
  await Review.deleteMany({ customer: user._id });
  const salonIds = [...new Map(reviews.map((review) => [String(review.salon), review.salon])).values()];
  await Promise.all(salonIds.map((salonId) => refreshSalonRating(salonId)));

  // 3. Geçmiş randevular salonun da kaydıdır (takvim, istatistik); bu yüzden
  //    silinmez, kimliksizleştirilir: müşteri bağlantısı, adı ve telefonu kaldırılır.
  await Appointment.updateMany(
    { customer: user._id },
    { $set: { customer: null, customerName: DELETED_CUSTOMER_NAME, customerPhone: '', notes: '' } },
  );

  // 4. Bildirimler, yüklenen dosyalar ve son olarak hesabın kendisi.
  await Notification.deleteMany({ recipient: user._id });
  await deleteUploadsOf(user._id);
  await User.deleteOne({ _id: user._id });
}
