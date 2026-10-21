import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../constants/index.js';
import { schemaOptions } from '../utils/schemaOptions.js';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPES), required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    isRead: { type: Boolean, default: false },
  },
  schemaOptions(),
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
