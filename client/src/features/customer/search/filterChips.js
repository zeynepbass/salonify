import { AVAILABILITY_OPTIONS, DEFAULT_FILTERS } from "@/features/customer/search/salonQuery";
import { getCategoryLabel } from "@/lib/catalog";

const without = (list, item) => list.filter((value) => value !== item);

export function buildChips(filters, updateFilters, hasCoordinates) {
  const chips = [
    ...filters.serviceIds.map((id) => ({
      key: `service-${id}`,
      label: getCategoryLabel(id),
      onRemove: () => updateFilters({ serviceIds: without(filters.serviceIds, id) }),
    })),
    ...filters.hairStyles.map((style) => ({
      key: `style-${style}`,
      label: style,
      onRemove: () => updateFilters({ hairStyles: without(filters.hairStyles, style) }),
    })),
  ];

  if (filters.query) {
    chips.unshift({ key: "query", label: `“${filters.query}”`, onRemove: () => updateFilters({ query: "" }) });
  }
  if (filters.minRating) {
    chips.push({
      key: "rating",
      label: `${filters.minRating.toLocaleString("tr-TR")}+ puan`,
      onRemove: () => updateFilters({ minRating: DEFAULT_FILTERS.minRating }),
    });
  }
  if (filters.availability !== DEFAULT_FILTERS.availability) {
    chips.push({
      key: "availability",
      label: AVAILABILITY_OPTIONS.find((option) => option.value === filters.availability).label,
      onRemove: () => updateFilters({ availability: DEFAULT_FILTERS.availability }),
    });
  }
  if (hasCoordinates && filters.distance !== DEFAULT_FILTERS.distance) {
    chips.push({
      key: "distance",
      label: `${filters.distance} km`,
      onRemove: () => updateFilters({ distance: DEFAULT_FILTERS.distance }),
    });
  }

  return chips;
}
