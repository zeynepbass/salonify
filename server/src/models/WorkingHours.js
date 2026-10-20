import mongoose from 'mongoose';
import { schemaOptions } from '../utils/schemaOptions.js';

// Bir salonun haftanın tek bir gününe ait çalışma düzeni.
const workingHoursSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    // JavaScript'in Date.getDay() değeriyle aynı: 0 = Pazar ... 6 = Cumartesi.
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    breaks: {
      type: [{ _id: false, start: { type: String, required: true }, end: { type: String, required: true } }],
      default: [],
    },
    isClosed: { type: Boolean, default: false },
  },
  schemaOptions(),
);

// Aynı salon için aynı günden iki kayıt olamaz.
workingHoursSchema.index({ salon: 1, dayOfWeek: 1 }, { unique: true });

export const WorkingHours = mongoose.model('WorkingHours', workingHoursSchema);
