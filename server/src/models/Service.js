import mongoose from 'mongoose';
import { SERVICE_CATEGORIES } from '../constants/index.js';
import { schemaOptions } from '../utils/schemaOptions.js';

const serviceSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, default: '', maxlength: 500 },
    category: { type: String, enum: SERVICE_CATEGORIES, default: 'diger' },
    // Dakika cinsinden süre; müsaitlik hesabı bu değere göre yapılır.
    duration: { type: Number, required: true, min: 5, max: 600 },
    price: { type: Number, required: true, min: 0 },
    // Pasif hizmet silinmez ama müşteriye gösterilmez ve randevu alınamaz.
    isActive: { type: Boolean, default: true },
  },
  schemaOptions(),
);

export const Service = mongoose.model('Service', serviceSchema);
