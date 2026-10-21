import { serviceCategories } from "@/data/catalog";

export function getCategoryLabel(id) {
  return serviceCategories.find((category) => category.id === id)?.label ?? "";
}
