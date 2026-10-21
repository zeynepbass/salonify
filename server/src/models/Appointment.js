import mongoose from 'mongoose';
import { APPOINTMENT_SOURCE, APPOINTMENT_STATUS } from '../constants/index.js';
import { schemaOptions } from '../utils/schemaOptions.js';
import { buildSlotKeys, timeToMinutes } from '../utils/time.js';

const appointmentSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },

    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customerName: { type: String, required: true, trim: true, maxlength: 80 },
    customerPhone: { type: String, trim: true, default: '' },

    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

    serviceName: { type: String, required: true },
    duration: { type: Number, required: true, min: 5 },
    price: { type: Number, required: true, min: 0 },

    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    slots: { type: [String], required: true },

    status: { type: String, enum: Object.values(APPOINTMENT_STATUS), default: APPOINTMENT_STATUS.BOOKED },
    source: { type: String, enum: Object.values(APPOINTMENT_SOURCE), default: APPOINTMENT_SOURCE.ONLINE },
    notes: { type: String, trim: true, default: '', maxlength: 500 },
    cancellationReason: { type: String, trim: true, default: '', maxlength: 200 },
    isReviewed: { type: Boolean, default: false },
  },
  schemaOptions({ hidden: ['slots'] }),
);

appointmentSchema.index(
  { salon: 1, date: 1, slots: 1 },
  { unique: true, partialFilterExpression: { status: APPOINTMENT_STATUS.BOOKED } },
);

appointmentSchema.index({ customer: 1, date: -1 });
appointmentSchema.index({ salon: 1, date: 1, startTime: 1 });

appointmentSchema.pre('validate', function setSlots() {
  if (this.startTime && this.endTime) {
    this.slots = buildSlotKeys(timeToMinutes(this.startTime), timeToMinutes(this.endTime));
  }
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);
