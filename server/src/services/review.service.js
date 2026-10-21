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

  const appointment = await Appointment.findOne({ _id: appointmentId, customer: customer._id });
  if (!appointment) throw new ApiError(404, 'Randevu bulunamadı.');

  if (appointment.status !== APPOINTMENT_STATUS.COMPLETED) {
    throw new ApiError(409, 'Yalnızca tamamlanan randevular değerlendirilebilir.');
  }

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
    if (isDuplicateKeyError(error, 'appointment')) throw new ApiError(409, ALREADY_REVIEWED);
    throw error;
  }

  await Appointment.updateOne({ _id: appointment._id }, { isReviewed: true });
  await refreshSalonRating(appointment.salon);

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

export async function listSalonReviews({ salonId, page, limit }) {
  const salon = await assertSalonExists(salonId);

  const filter = { salon: salon._id, isPublic: true };

  const [reviews, total, distribution] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('customer', 'name'),
    Review.countDocuments(filter),
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
