import { APPOINTMENT_STATUS } from '../constants/index.js';
import { Appointment } from '../models/Appointment.js';
import { Service } from '../models/Service.js';
import { ApiError } from '../utils/ApiError.js';
import { getSalonNow } from '../utils/time.js';
import { syncSalonCatalog } from './salon.service.js';

export function listActiveServices(salonId) {
  return Service.find({ salon: salonId, isActive: true }).sort({ name: 1 });
}

export function listSalonServices(salonId) {
  return Service.find({ salon: salonId }).sort({ createdAt: 1 });
}

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
