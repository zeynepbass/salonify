import { PORTFOLIO_SOURCE } from '../constants/index.js';
import { Portfolio } from '../models/Portfolio.js';
import { ApiError } from '../utils/ApiError.js';

export function listSalonPortfolio(salonId) {
  return Portfolio.find({ salon: salonId }).sort({ createdAt: -1 });
}

async function findOwnedItem(salonId, itemId) {
  const item = await Portfolio.findOne({ _id: itemId, salon: salonId });
  if (!item) throw new ApiError(404, 'Portföy görseli bulunamadı.');
  return item;
}

export function createPortfolioItem(salonId, { image, title, description, isPublished = true }) {
  return Portfolio.create({ salon: salonId, image, title, description, isPublished, source: PORTFOLIO_SOURCE.SALON });
}

export async function updatePortfolioItem(salonId, itemId, changes) {
  const item = await findOwnedItem(salonId, itemId);

  if (changes.isPublished && !item.hasConsent) {
    throw new ApiError(403, 'Müşteri bu fotoğrafın profilde paylaşılmasına izin vermedi.');
  }

  if (item.source === PORTFOLIO_SOURCE.REVIEW) delete changes.image;

  item.set(changes);
  await item.save();
  return item;
}

export async function deletePortfolioItem(salonId, itemId) {
  const item = await findOwnedItem(salonId, itemId);
  await item.deleteOne();
}
