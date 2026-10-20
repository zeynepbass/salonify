import { PORTFOLIO_SOURCE } from '../constants/index.js';
import { Portfolio } from '../models/Portfolio.js';
import { ApiError } from '../utils/ApiError.js';

// Salon paneli: yayında olmayan ve izin verilmemiş görseller dahil hepsi.
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

  // RIZA KONTROLÜ: Müşteri fotoğrafı, müşteri paylaşım izni vermediyse
  // yayınlanamaz. Panel bu düğmeyi gizlese bile kural burada uygulanır;
  // izin kararı salona veya arayüze bırakılmaz.
  if (changes.isPublished && !item.hasConsent) {
    throw new ApiError(403, 'Müşteri bu fotoğrafın profilde paylaşılmasına izin vermedi.');
  }

  // Müşteriden gelen fotoğrafın kendisi değiştirilemez; salon yalnızca
  // başlığını, açıklamasını ve yayın durumunu yönetir.
  if (item.source === PORTFOLIO_SOURCE.REVIEW) delete changes.image;

  item.set(changes);
  await item.save();
  return item;
}

export async function deletePortfolioItem(salonId, itemId) {
  const item = await findOwnedItem(salonId, itemId);
  await item.deleteOne();
}
