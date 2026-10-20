import mongoose from 'mongoose';
import { PORTFOLIO_SOURCE } from '../constants/index.js';
import { schemaOptions } from '../utils/schemaOptions.js';

const portfolioSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    image: { type: String, required: true },
    title: { type: String, trim: true, default: '', maxlength: 120 },
    description: { type: String, trim: true, default: '', maxlength: 500 },

    // SALON: salonun kendi eklediği görsel.
    // REVIEW: müşterinin değerlendirmesiyle gönderdiği saç fotoğrafı.
    source: { type: String, enum: Object.values(PORTFOLIO_SOURCE), default: PORTFOLIO_SOURCE.SALON },
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },
    customerName: { type: String, default: '' },
    rating: { type: Number, default: null },

    // hasConsent: görsel herkese açık gösterilebilir mi? Müşteri fotoğrafında
    // bu değer değerlendirmedeki isPublic izninden gelir.
    // isPublished: salonun görseli profilinde yayınlama tercihi.
    // Bir görsel ancak ikisi de true ise herkese açık olur.
    hasConsent: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
  },
  schemaOptions(),
);

portfolioSchema.index({ salon: 1, isPublished: 1, createdAt: -1 });

export const Portfolio = mongoose.model('Portfolio', portfolioSchema);
