import mongoose from 'mongoose';
import { APPOINTMENT_SOURCE, APPOINTMENT_STATUS } from '../constants/index.js';
import { schemaOptions } from '../utils/schemaOptions.js';
import { buildSlotKeys, timeToMinutes } from '../utils/time.js';

const appointmentSchema = new mongoose.Schema(
  {
    // Müşteriye gösterilen kısa randevu kodu (ör. SL-48207311).
    reference: { type: String, required: true, unique: true },

    // Salonun elle girdiği randevularda müşterinin hesabı olmayabilir; bu
    // durumda customer boş kalır, isim ve telefon aşağıdaki alanlarda tutulur.
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customerName: { type: String, required: true, trim: true, maxlength: 80 },
    customerPhone: { type: String, trim: true, default: '' },

    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

    // Hizmetin randevu anındaki adı, süresi ve fiyatı kopyalanır. Salon daha
    // sonra fiyatı değiştirse veya hizmeti silse bile geçmiş randevular
    // alındıkları andaki bilgilerle kalır.
    serviceName: { type: String, required: true },
    duration: { type: Number, required: true, min: 5 },
    price: { type: Number, required: true, min: 0 },

    // Salonun yerel saatine göre "YYYY-MM-DD" ve "HH:mm".
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    // Randevunun kapladığı 30 dakikalık dilimler; aşağıdaki unique index
    // tarafından kullanılır. pre('validate') içinde otomatik hesaplanır.
    slots: { type: [String], required: true },

    status: { type: String, enum: Object.values(APPOINTMENT_STATUS), default: APPOINTMENT_STATUS.BOOKED },
    source: { type: String, enum: Object.values(APPOINTMENT_SOURCE), default: APPOINTMENT_SOURCE.ONLINE },
    notes: { type: String, trim: true, default: '', maxlength: 500 },
    cancellationReason: { type: String, trim: true, default: '', maxlength: 200 },
    isReviewed: { type: Boolean, default: false },
  },
  schemaOptions({ hidden: ['slots'] }),
);

// DOUBLE BOOKING KORUMASI (veritabanı seviyesi)
//
// "Önce saat boş mu diye bak, boşsa kaydet" yaklaşımı tek başına güvenli
// değildir: iki istek aynı anda gelirse ikisi de saati boş görür ve ikisi de
// kayıt oluşturur (race condition). Uygulama kodu bu aralığı kapatamaz;
// kapatabilecek tek yer veritabanıdır.
//
// Çözüm: Her randevu kapladığı zaman dilimlerini `slots` dizisinde tutar.
// (salon, date, slots) üzerindeki unique index, aynı salonda aynı güne ait
// aynı dilimin ikinci kez yazılmasını reddeder. MongoDB dizi alanlarını
// eleman eleman index'lediği için 10:00-11:00 ile 10:30-11:30 randevuları
// "10:30" diliminde çakışır ve ikinci kayıt E11000 hatasıyla düşer.
//
// partialFilterExpression: index yalnızca BOOKED randevuları kapsar. Randevu
// iptal edildiğinde index'ten çıkar ve o saat kendiliğinden yeniden müsait olur.
appointmentSchema.index(
  { salon: 1, date: 1, slots: 1 },
  { unique: true, partialFilterExpression: { status: APPOINTMENT_STATUS.BOOKED } },
);

appointmentSchema.index({ customer: 1, date: -1 });
appointmentSchema.index({ salon: 1, date: 1, startTime: 1 });

// Dilimler her zaman başlangıç/bitiş saatinden türetilir; servis katmanının
// bunu hatırlamasına gerek kalmaz ve saat değiştiğinde kilit de güncellenir.
appointmentSchema.pre('validate', function setSlots() {
  if (this.startTime && this.endTime) {
    this.slots = buildSlotKeys(timeToMinutes(this.startTime), timeToMinutes(this.endTime));
  }
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);
