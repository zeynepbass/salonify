import mongoose from 'mongoose';
import { SERVICE_CATEGORIES } from '../constants/index.js';
import { schemaOptions } from '../utils/schemaOptions.js';

const salonSchema = new mongoose.Schema(
  {
    // Her salon hesabının tek bir salonu vardır; unique index bunu garanti eder.
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, default: '', maxlength: 2000 },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    neighborhood: { type: String, trim: true, default: '' },
    audience: { type: String, trim: true, default: '' },
    hairStyles: { type: [String], default: [] },
    coverImage: { type: String, default: '' },
    // GeoJSON noktası: coordinates = [boylam, enlem]. Mesafe filtresi ve
    // "en yakın" sıralaması bu alan üzerindeki 2dsphere index'i kullanır.
    // Koordinatı girilmemiş salonlarda alan hiç bulunmaz.
    location: {
      type: new mongoose.Schema(
        {
          type: { type: String, enum: ['Point'], required: true },
          coordinates: { type: [Number], required: true },
        },
        { _id: false },
      ),
      default: undefined,
    },

    // Aşağıdaki alanlar başka koleksiyonlardan türetilir (denormalizasyon).
    // Salon listesi çok sık okunur; her listelemede yorumları ve hizmetleri
    // yeniden toplamak yerine, veri değiştiği anda bu alanları güncelliyoruz.
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    categories: { type: [String], enum: SERVICE_CATEGORIES, default: [] },
    startingPrice: { type: Number, default: null },
    searchText: { type: String, default: '', select: false },
  },
  schemaOptions({ hidden: ['searchText', 'location'] }),
);

// API'de GeoJSON yerine okunması kolay { lat, lng } biçimi kullanılır.
salonSchema.virtual('coordinates').get(function getCoordinates() {
  // Salon özet olarak (yalnızca birkaç alanıyla) yüklendiyse konum bilgisi
  // elimizde yoktur; "konumu yok" anlamına gelen null yerine alanı hiç dönmüyoruz.
  if (!this.isSelected('location')) return undefined;
  const [lng, lat] = this.location?.coordinates ?? [];
  return lat === undefined ? null : { lat, lng };
});

salonSchema.index({ location: '2dsphere' });
salonSchema.index({ city: 1, district: 1 });
salonSchema.index({ categories: 1 });
salonSchema.index({ rating: -1, reviewCount: -1 });

export const Salon = mongoose.model('Salon', salonSchema);
