import { services } from "@/data/mock/services";
import { includesText } from "@/lib/format";

export const SORT_OPTIONS = [
  { value: "puan", label: "En yüksek puan" },
  { value: "yakin", label: "En yakın" },
  { value: "populer", label: "En popüler" },
];

export const DISTANCE_OPTIONS = [1, 3, 5, 10].map((km) => ({ value: km, label: `${km} km` }));

export const RATING_OPTIONS = [
  { value: 0, label: "Tümü" },
  { value: 4, label: "4.0 ve üzeri" },
  { value: 4.5, label: "4.5 ve üzeri" },
  { value: 4.8, label: "4.8 ve üzeri" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "any", label: "Herhangi bir zaman", withinDays: Infinity },
  { value: "today", label: "Bugün", withinDays: 0 },
  { value: "tomorrow", label: "Yarın", withinDays: 1 },
  { value: "week", label: "Bu hafta", withinDays: 6 },
];

export const DEFAULT_FILTERS = {
  query: "",
  serviceIds: [],
  hairStyles: [],
  minRating: 0,
  distance: 5,
  availability: "any",
  sort: "puan",
  page: 1,
};

const SORTERS = {
  puan: (a, b) => b.rating - a.rating,
  yakin: (a, b) => a.distanceKm - b.distanceKm,
  populer: (a, b) => b.popularity - a.popularity,
};

export function sortSalons(salons, sort) {
  return [...salons].sort(SORTERS[sort] ?? SORTERS.puan);
}

function matchesQuery(salon, query) {
  if (!query.trim()) return true;

  const serviceNames = services
    .filter((service) => salon.featuredServiceIds.includes(service.id))
    .map((service) => service.name);

  return [salon.name, salon.neighborhood, ...serviceNames, ...salon.hairStyles].some((text) => includesText(text, query));
}

export function filterSalons(salons, filters) {
  const { withinDays } = AVAILABILITY_OPTIONS.find((option) => option.value === filters.availability);

  return salons.filter(
    (salon) =>
      salon.distanceKm <= filters.distance &&
      salon.rating >= filters.minRating &&
      salon.nextAvailableInDays <= withinDays &&
      (filters.serviceIds.length === 0 || filters.serviceIds.some((id) => salon.featuredServiceIds.includes(id))) &&
      (filters.hairStyles.length === 0 || filters.hairStyles.some((style) => salon.hairStyles.includes(style))) &&
      matchesQuery(salon, filters.query),
  );
}
