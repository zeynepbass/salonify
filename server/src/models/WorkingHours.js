import mongoose from 'mongoose';
import { schemaOptions } from '../utils/schemaOptions.js';

const workingHoursSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
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

workingHoursSchema.index({ salon: 1, dayOfWeek: 1 }, { unique: true });

export const WorkingHours = mongoose.model('WorkingHours', workingHoursSchema);
