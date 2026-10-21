import mongoose from 'mongoose';
import { schemaOptions } from '../utils/schemaOptions.js';

const reviewSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    serviceName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '', maxlength: 1000 },
    hairPhotos: { type: [String], default: [] },
    isPublic: { type: Boolean, default: false },
  },
  schemaOptions(),
);

reviewSchema.virtual('hairPhoto').get(function getHairPhoto() {
  return this.hairPhotos?.[0] ?? '';
});

reviewSchema.index({ salon: 1, isPublic: 1, createdAt: -1 });

export const Review = mongoose.model('Review', reviewSchema);
