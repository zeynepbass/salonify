import { APPOINTMENT_STATUS, NOTIFICATION_TYPES, PORTFOLIO_SOURCE } from '../constants/index.js';
import { Appointment } from '../models/Appointment.js';
import { Portfolio } from '../models/Portfolio.js';
import { Review } from '../models/Review.js';
import { Salon } from '../models/Salon.js';
import { ApiError, isDuplicateKeyError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/response.js';
import { notify } from './notification.service.js';
import { assertSalonExists, refreshSalonRating } from './salon.service.js';

const ALREADY_REVIEWED = 'Bu randevu için daha önce değerlendirme yapılmış.';

export async function createReview(customer, appointmentId, { rating, comment, hairPhoto, hairPhotos, isPublic }) {
  const photos = [...new Set([...(hairPhotos ?? []), ...(hairPhoto ? [hairPhoto] : [])])];

  // 1. Randevu giriş yapan müşteriye mi ait?
  // Yalnızca gerçekten o salondan hizmet almış kişi değerlendirme yazabilir.
  // Başkasının randevusu için "bulunamadı" dönüyoruz.
  const appointment = await Appointment.findOne({ _id: appointmentId, customer: customer._id });
  if (!appointment) throw new ApiError(404, 'Randevu bulunamadı.');

  // 2. Randevu tamamlandı mı?
  // İptal edilen, gelinmeyen veya henüz gerçekleşmemiş bir randevu için
  // değerlendirme yapılamaz; aksi halde alınmamış bir hizmete puan verilebilirdi.
  if (appointment.status !== APPOINTMENT_STATUS.COMPLETED) {
    throw new ApiError(409, 'Yalnızca tamamlanan randevular değerlendirilebilir.');
  }

  // 3. Daha önce değerlendirme var mı?
  if (appointment.isReviewed) throw new ApiError(409, ALREADY_REVIEWED);

  let review;
  try {
    review = await Review.create({
      appointment: appointment._id,
      customer: customer._id,
      salon: appointment.salon,
      serviceName: appointment.serviceName,
      rating,
      comment,
      hairPhotos: photos,
      isPublic,
    });
  } catch (error) {
    // Aynı anda gelen iki istek üstteki kontrolü birlikte geçebilir; bu
    // durumda Review.appointment üzerindeki unique index ikincisini reddeder.
    if (isDuplicateKeyError(error, 'appointment')) throw new ApiError(409, ALREADY_REVIEWED);
    throw error;
  }

  await Appointment.updateOne({ _id: appointment._id }, { isReviewed: true });
  await refreshSalonRating(appointment.salon);

  // Müşterinin fotoğrafları salonun portföy havuzuna "yayında değil" olarak
  // düşer. hasConsent müşterinin verdiği izni taşır: izin yoksa salon bu
  // görselleri hiçbir şekilde yayınlayamaz.
  await Portfolio.insertMany(
    photos.map((image) => ({
      salon: appointment.salon,
      source: PORTFOLIO_SOURCE.REVIEW,
      review: review._id,
      image,
      title: appointment.serviceName,
      customerName: customer.name,
      rating,
      hasConsent: isPublic,
      isPublished: false,
    })),
  );

  const salon = await Salon.findById(appointment.salon).select('owner');
  await notify([
    {
      recipient: salon?.owner,
      type: NOTIFICATION_TYPES.REVIEW_PUBLISHED,
      title: `Yeni değerlendirme · ${rating} yıldız`,
      body: isPublic
        ? `${customer.name} değerlendirmesinin profilde paylaşılmasına izin verdi.`
        : `${customer.name} değerlendirmesini yalnızca sizinle paylaştı.`,
      appointment: appointment._id,
    },
  ]);

  return review;
}

// Salon profilinde gösterilen değerlendirmeler.
export async function listSalonReviews({ salonId, page, limit }) {
  const salon = await assertSalonExists(salonId);

  // RIZA: Yalnızca müşterinin paylaşım izni verdiği (isPublic: true)
  // değerlendirmeler listelenir. İzin verilmeyenlerin adı, yorumu ve
  // fotoğrafı bu uçtan hiçbir koşulda dönmez.
  const filter = { salon: salon._id, isPublic: true };

  const [reviews, total, distribution] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('customer', 'name'),
    Review.countDocuments(filter),
    // Puan dağılımı bütün değerlendirmelerden hesaplanır; yalnızca sayı
    // içerdiği için kimseyi tanımlamaz.
    Review.aggregate([{ $match: { salon: salon._id } }, { $group: { _id: '$rating', count: { $sum: 1 } } }]),
  ]);

  const counts = Object.fromEntries(distribution.map((item) => [item._id, item.count]));
  const totalCount = distribution.reduce((sum, item) => sum + item.count, 0);

  return {
    summary: {
      averageRating: salon.rating,
      reviewCount: salon.reviewCount,
      distribution: [5, 4, 3, 2, 1].map((stars) => {
        const count = counts[stars] ?? 0;
        return { stars, count, percent: totalCount ? Math.round((count / totalCount) * 100) : 0 };
      }),
    },
    // Müşteri kaydının tamamı yerine yalnızca gösterilecek alanlar seçilir.
    items: reviews.map((review) => ({
      id: review.id,
      authorName: review.customer?.name ?? 'Müşteri',
      serviceName: review.serviceName,
      rating: review.rating,
      comment: review.comment,
      hairPhotos: review.hairPhotos,
      hairPhoto: review.hairPhoto,
      createdAt: review.createdAt,
    })),
    pagination: buildPagination({ page, limit, total }),
  };
}

// Müşteri kendi yazdığı bütün değerlendirmeleri (özel olanlar dahil) görür.
export async function listCustomerReviews({ customerId, page, limit }) {
  const filter = { customer: customerId };

  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('salon', 'name district city coverImage'),
    Review.countDocuments(filter),
  ]);

  return { items, pagination: buildPagination({ page, limit, total }) };
}
