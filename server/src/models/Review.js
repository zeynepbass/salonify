import mongoose from 'mongoose';
import { schemaOptions } from '../utils/schemaOptions.js';

const reviewSchema = new mongoose.Schema(
  {
    // unique: bir randevu yalnızca bir değerlendirme alabilir. Servis
    // katmanındaki "daha önce yorum var mı" kontrolü kullanıcıya düzgün bir
    // mesaj vermek içindir; aynı anda gelen iki isteğe karşı asıl garanti bu index'tir.
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    serviceName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '', maxlength: 1000 },
    hairPhotos: { type: [String], default: [] },
    // Müşterinin açık rızası. Varsayılan false: müşteri özellikle izin
    // vermedikçe adı, yorumu ve fotoğrafı salon profilinde gösterilmez.
    isPublic: { type: Boolean, default: false },
  },
  schemaOptions(),
);

// Tek fotoğraf bekleyen istemciler için ilk fotoğraf.
reviewSchema.virtual('hairPhoto').get(function getHairPhoto() {
  return this.hairPhotos?.[0] ?? '';
});

reviewSchema.index({ salon: 1, isPublic: 1, createdAt: -1 });

export const Review = mongoose.model('Review', reviewSchema);
