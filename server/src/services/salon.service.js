import { DEFAULT_WORKING_HOURS } from '../constants/index.js';
import { BlockedDate } from '../models/BlockedDate.js';
import { Portfolio } from '../models/Portfolio.js';
import { Review } from '../models/Review.js';
import { Salon } from '../models/Salon.js';
import { Service } from '../models/Service.js';
import { WorkingHours } from '../models/WorkingHours.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/response.js';
import { escapeRegex, getSalonNow, normalizeText } from '../utils/time.js';
import { filterSalonsWithOpenSlot } from './availability.service.js';

const EARTH_RADIUS_KM = 6371;
const AVAILABILITY_WINDOWS = { today: 0, tomorrow: 1, week: 6 };
const MAX_AVAILABILITY_CANDIDATES = 500;

export const toPoint = ({ lat, lng }) => ({ type: 'Point', coordinates: [lng, lat] });

function distanceInKm(from, to) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a)) * 10) / 10;
}

const SORTS = {
  rating: { rating: -1, reviewCount: -1 },
  popular: { reviewCount: -1, rating: -1 },
  price: { startingPrice: 1, rating: -1 },
  newest: { createdAt: -1 },
};

export async function createSalonForOwner(owner, details) {
  const salon = await Salon.create({ ...details, owner: owner._id, email: details.email ?? owner.email });
  await WorkingHours.insertMany(DEFAULT_WORKING_HOURS.map((day) => ({ ...day, salon: salon._id })));
  await syncSalonCatalog(salon._id);
  return salon;
}

export async function assertSalonExists(salonId) {
  const salon = await Salon.findById(salonId);
  if (!salon) throw new ApiError(404, 'Salon bulunamadı.');
  return salon;
}

export async function listSalons({
  search,
  city,
  district,
  category,
  hairStyle,
  rating,
  lat,
  lng,
  distance,
  availability,
  sort,
  page,
  limit,
}) {
  const filter = {};
  const origin = lat !== undefined && lng !== undefined ? { lat, lng } : null;

  if (city) filter.city = city;
  if (district) filter.district = district;
  if (category?.length) filter.categories = { $in: category };
  if (hairStyle?.length) filter.hairStyles = { $in: hairStyle };
  if (rating) filter.rating = { $gte: rating };
  if (search) {
    filter.searchText = { $regex: escapeRegex(normalizeText(search)) };
  }

  if (origin && distance) {
    filter.location = { $geoWithin: { $centerSphere: [[lng, lat], distance / EARTH_RADIUS_KM] } };
  }

  if (availability) {
    const candidates = await Salon.find(filter).select('_id').limit(MAX_AVAILABILITY_CANDIDATES);
    const ids = candidates.map((salon) => salon._id);
    filter._id = { $in: await filterSalonsWithOpenSlot(ids, AVAILABILITY_WINDOWS[availability]) };
  }

  const countFilter = { ...filter };
  let query;
  if (sort === 'nearest') {
    countFilter.location ??= { $exists: true };
    query = Salon.find({
      ...filter,
      location: { $nearSphere: { $geometry: toPoint(origin), ...(distance && { $maxDistance: distance * 1000 }) } },
    });
  } else {
    query = Salon.find(filter).sort({ ...SORTS[sort], _id: 1 });
  }

  const [salons, total] = await Promise.all([query.skip((page - 1) * limit).limit(limit), Salon.countDocuments(countFilter)]);

  const items = salons.map((salon) => {
    const item = salon.toJSON();
    if (origin) item.distanceKm = item.coordinates ? distanceInKm(origin, item.coordinates) : null;
    return item;
  });

  return { items, pagination: buildPagination({ page, limit, total }) };
}

export async function getSalonDetail(salonId) {
  const salon = await assertSalonExists(salonId);

  const [services, portfolio, workingHours, blockedDates] = await Promise.all([
    Service.find({ salon: salon._id }).sort({ name: 1 }),
    listPublicPortfolio(salon._id),
    WorkingHours.find({ salon: salon._id }),
    BlockedDate.find({ salon: salon._id, date: { $gte: getSalonNow().date } }).sort({ date: 1 }),
  ]);

  return { ...salon.toJSON(), services, portfolio, workingHours: sortWeek(workingHours), blockedDates };
}

export function listPublicPortfolio(salonId) {
  return Portfolio.find({ salon: salonId, isPublished: true, hasConsent: true })
    .sort({ createdAt: -1 })
    .select('image title description customerName rating createdAt');
}

export function sortWeek(days) {
  return [...days].sort((a, b) => ((a.dayOfWeek + 6) % 7) - ((b.dayOfWeek + 6) % 7));
}

export async function updateSalonProfile(salon, { coordinates, ...changes }) {
  salon.set(changes);
  if (coordinates !== undefined) salon.location = coordinates ? toPoint(coordinates) : undefined;
  await salon.save();
  await syncSalonCatalog(salon._id);
  return Salon.findById(salon._id);
}

export async function syncSalonCatalog(salonId) {
  const [salon, services] = await Promise.all([
    Salon.findById(salonId),
    Service.find({ salon: salonId }).select('name category price'),
  ]);
  if (!salon) return;

  const searchText = [salon.name, salon.neighborhood, salon.district, salon.city, ...salon.hairStyles, ...services.map((s) => s.name)]
    .map(normalizeText)
    .filter(Boolean)
    .join(' ');

  await Salon.updateOne(
    { _id: salonId },
    {
      categories: [...new Set(services.map((service) => service.category))],
      startingPrice: services.length ? Math.min(...services.map((service) => service.price)) : null,
      searchText,
    },
  );
}

export async function refreshSalonRating(salonId) {
  const [stats] = await Review.aggregate([
    { $match: { salon: salonId } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Salon.updateOne(
    { _id: salonId },
    { rating: stats ? Math.round(stats.average * 10) / 10 : 0, reviewCount: stats?.count ?? 0 },
  );
}
