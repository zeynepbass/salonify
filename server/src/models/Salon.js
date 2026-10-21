import mongoose from 'mongoose';
import { SERVICE_CATEGORIES } from '../constants/index.js';
import { schemaOptions } from '../utils/schemaOptions.js';

const salonSchema = new mongoose.Schema(
  {
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

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    categories: { type: [String], enum: SERVICE_CATEGORIES, default: [] },
    startingPrice: { type: Number, default: null },
    searchText: { type: String, default: '', select: false },
  },
  schemaOptions({ hidden: ['searchText', 'location'] }),
);

salonSchema.virtual('coordinates').get(function getCoordinates() {
  if (!this.isSelected('location')) return undefined;
  const [lng, lat] = this.location?.coordinates ?? [];
  return lat === undefined ? null : { lat, lng };
});

salonSchema.index({ location: '2dsphere' });
salonSchema.index({ city: 1, district: 1 });
salonSchema.index({ categories: 1 });
salonSchema.index({ rating: -1, reviewCount: -1 });

export const Salon = mongoose.model('Salon', salonSchema);
