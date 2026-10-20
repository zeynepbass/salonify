import mongoose from 'mongoose';
import { schemaOptions } from '../utils/schemaOptions.js';

// Haftalık düzenin dışında, salonun tamamen kapalı olduğu tek seferlik günler
// (tatil, eğitim vb.).
const blockedDateSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    date: { type: String, required: true },
    note: { type: String, trim: true, default: '', maxlength: 200 },
  },
  schemaOptions(),
);

blockedDateSchema.index({ salon: 1, date: 1 }, { unique: true });

export const BlockedDate = mongoose.model('BlockedDate', blockedDateSchema);
