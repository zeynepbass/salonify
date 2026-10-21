import mongoose from 'mongoose';
import { ROLES } from '../constants/index.js';
import { schemaOptions } from '../utils/schemaOptions.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: '' },
    location: {
      city: { type: String, trim: true, default: '' },
      district: { type: String, trim: true, default: '' },
    },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CUSTOMER, immutable: true },
    refreshTokens: {
      type: [{ _id: false, tokenHash: { type: String, required: true }, expiresAt: { type: Date, required: true } }],
      default: [],
      select: false,
    },
  },
  schemaOptions({ hidden: ['passwordHash', 'refreshTokens'] }),
);

export const User = mongoose.model('User', userSchema);
