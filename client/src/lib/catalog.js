import { salons } from "@/data/mock/salons";
import { services } from "@/data/mock/services";

export function getSalon(id) {
  return salons.find((salon) => String(salon.id) === String(id));
}

export function getService(id, source = services) {
  return source.find((service) => service.id === id) ?? services.find((service) => service.id === id);
}

export function getServiceName(id) {
  return getService(id)?.name ?? "";
}
