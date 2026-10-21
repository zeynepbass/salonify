"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { AVAILABILITY_OPTIONS, DEFAULT_FILTERS, SORT_OPTIONS } from "@/features/customer/search/salonQuery";

const PARAMS = {
  query: "q",
  serviceIds: "hizmet",
  hairStyles: "stil",
  minRating: "puan",
  distance: "mesafe",
  availability: "uygunluk",
  sort: "sirala",
  page: "sayfa",
};

const toList = (value) => (value ? value.split(",").filter(Boolean) : []);
const toNumber = (value, fallback) => (value !== null && !Number.isNaN(Number(value)) ? Number(value) : fallback);
const toOption = (value, options, fallback) => (options.some((option) => option.value === value) ? value : fallback);

function parseFilters(params) {
  return {
    query: params.get(PARAMS.query) ?? DEFAULT_FILTERS.query,
    serviceIds: toList(params.get(PARAMS.serviceIds)),
    hairStyles: toList(params.get(PARAMS.hairStyles)),
    minRating: toNumber(params.get(PARAMS.minRating), DEFAULT_FILTERS.minRating),
    distance: toNumber(params.get(PARAMS.distance), DEFAULT_FILTERS.distance),
    availability: toOption(params.get(PARAMS.availability), AVAILABILITY_OPTIONS, DEFAULT_FILTERS.availability),
    sort: toOption(params.get(PARAMS.sort), SORT_OPTIONS, DEFAULT_FILTERS.sort),
    page: Math.max(1, toNumber(params.get(PARAMS.page), DEFAULT_FILTERS.page)),
  };
}

function serializeFilters(filters) {
  const params = new URLSearchParams();

  Object.entries(PARAMS).forEach(([key, param]) => {
    const value = filters[key];
    const serialized = Array.isArray(value) ? value.join(",") : String(value);
    const fallback = Array.isArray(DEFAULT_FILTERS[key]) ? "" : String(DEFAULT_FILTERS[key]);
    if (serialized !== fallback) params.set(param, serialized);
  });

  return params.toString();
}

export function buildSearchHref(filters = {}) {
  const query = serializeFilters({ ...DEFAULT_FILTERS, ...filters });
  return query ? `/kuaforler?${query}` : "/kuaforler";
}

export function useSalonFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const updateFilters = useCallback(
    (changes) => {
      const next = { ...filters, page: DEFAULT_FILTERS.page, ...changes };
      const query = serializeFilters(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: "page" in changes });
    },
    [filters, pathname, router],
  );

  const resetFilters = useCallback(() => {
    updateFilters({ ...DEFAULT_FILTERS, sort: filters.sort });
  }, [filters.sort, updateFilters]);

  return { filters, updateFilters, resetFilters };
}
