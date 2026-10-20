import { APPOINTMENT_STATUS } from '../constants/index.js';
import { Appointment } from '../models/Appointment.js';
import { Service } from '../models/Service.js';
import { ApiError } from '../utils/ApiError.js';
import { getSalonNow } from '../utils/time.js';
import { syncSalonCatalog } from './salon.service.js';

// Müşteriye yalnızca aktif hizmetler gösterilir.
export function listActiveServices(salonId) {
  return Service.find({ salon: salonId, isActive: true }).sort({ name: 1 });
}

// Salon paneli pasif hizmetleri de görür.
export function listSalonServices(salonId) {
  return Service.find({ salon: salonId }).sort({ createdAt: 1 });
}

// Hizmeti her zaman (id + salon) çiftiyle arıyoruz. serviceId geçerli olsa
// bile başka bir salona aitse sonuç boş döner; yani bir salon başka salonun
// hizmetini ne görebilir ne değiştirebilir.
async function findOwnedService(salonId, serviceId) {
  const service = await Service.findOne({ _id: serviceId, salon: salonId });
  if (!service) throw new ApiError(404, 'Hizmet bulunamadı.');
  return service;
}

export async function createService(salonId, data) {
  const service = await Service.create({ ...data, salon: salonId });
  await syncSalonCatalog(salonId);
  return service;
}

export async function updateService(salonId, serviceId, changes) {
  const service = await findOwnedService(salonId, serviceId);
  service.set(changes);
  await service.save();
  await syncSalonCatalog(salonId);
  return service;
}

export async function deleteService(salonId, serviceId) {
  const service = await findOwnedService(salonId, serviceId);

  // Geçmiş randevular hizmetin adını ve fiyatını kendi üzerinde taşıdığı için
  // silme işlemi onları bozmaz. Ancak ileri tarihli aktif randevusu olan bir
  // hizmeti silmek, o randevuları düzenlenemez hale getirir.
  const hasUpcoming = await Appointment.exists({
    service: service._id,
    status: APPOINTMENT_STATUS.BOOKED,
    date: { $gte: getSalonNow().date },
  });
  if (hasUpcoming) {
    throw new ApiError(409, 'Bu hizmete ait ileri tarihli randevular var. Hizmeti silmek yerine pasif hale getirebilirsiniz.');
  }

  await service.deleteOne();
  await syncSalonCatalog(salonId);
}
