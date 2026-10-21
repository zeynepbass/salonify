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
  { value: "any", label: "Herhangi bir zaman" },
  { value: "today", label: "Bugün" },
  { value: "tomorrow", label: "Yarın" },
  { value: "week", label: "Bu hafta" },
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

const API_SORTS = { puan: "rating", yakin: "nearest", populer: "popular" };

export function getSortOptions(hasCoordinates) {
  return hasCoordinates ? SORT_OPTIONS : SORT_OPTIONS.filter((option) => option.value !== "yakin");
}

export function buildSalonParams(filters, location, { limit, withDistance = true } = {}) {
  const hasCoordinates = location.lat !== undefined && location.lng !== undefined;
  const sort = API_SORTS[filters.sort] ?? API_SORTS.puan;

  return {
    city: location.city,
    district: location.district,
    ...(filters.query?.trim() && { search: filters.query.trim() }),
    ...(filters.serviceIds?.length && { category: filters.serviceIds.join(",") }),
    ...(filters.hairStyles?.length && { hairStyle: filters.hairStyles.join(",") }),
    ...(filters.minRating && { rating: filters.minRating }),
    ...(filters.availability && filters.availability !== "any" && { availability: filters.availability }),
    ...(hasCoordinates && { lat: location.lat, lng: location.lng }),
    ...(hasCoordinates && withDistance && filters.distance && { distance: filters.distance }),
    sort: sort === "nearest" && !hasCoordinates ? API_SORTS.puan : sort,
    page: filters.page ?? 1,
    ...(limit && { limit }),
  };
}
