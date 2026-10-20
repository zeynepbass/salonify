import mongoose from 'mongoose';
import { ROLES } from '../constants/index.js';
import { schemaOptions } from '../utils/schemaOptions.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false -> sorgularda açıkça istenmedikçe gelmez. Şifre hash'inin
    // yanlışlıkla bir API cevabına karışmasını engeller.
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: '' },
    // Müşterinin arama için seçtiği konum (profilde saklanır).
    location: {
      city: { type: String, trim: true, default: '' },
      district: { type: String, trim: true, default: '' },
    },
    // immutable: rol yalnızca kayıt sırasında belirlenir. Sonradan hiçbir
    // güncelleme isteği (yanlışlıkla bile olsa) rolü değiştiremez.
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CUSTOMER, immutable: true },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      reminder: { type: Boolean, default: true },
      promo: { type: Boolean, default: false },
    },
    // Aktif oturumların refresh token hash'leri (cihaz başına bir kayıt).
    refreshTokens: {
      type: [{ _id: false, tokenHash: { type: String, required: true }, expiresAt: { type: Date, required: true } }],
      default: [],
      select: false,
    },
  },
  schemaOptions({ hidden: ['passwordHash', 'refreshTokens'] }),
);

export const User = mongoose.model('User', userSchema);
