import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, buildSalonParams } from "@/features/customer/search/salonQuery";
import { buildChips } from "@/features/customer/search/filterChips";
import { buildSearchHref, parseFilters } from "@/features/customer/search/useSalonFilters";

const istanbul = { city: "İstanbul", district: "Kadıköy" };
const withCoords = { ...istanbul, lat: 40.99, lng: 29.02 };

describe("buildSalonParams", () => {
  it("konum yokken 'en yakın' sıralamasını puana çevirir ve mesafe göndermez", () => {
    const params = buildSalonParams({ ...DEFAULT_FILTERS, sort: "yakin" }, istanbul);
    expect(params.sort).toBe("rating");
    expect(params).not.toHaveProperty("distance");
    expect(params).not.toHaveProperty("lat");
  });

  it("konum varken mesafe ve koordinat ekler", () => {
    const params = buildSalonParams({ ...DEFAULT_FILTERS, sort: "yakin" }, withCoords);
    expect(params).toMatchObject({ sort: "nearest", distance: 5, lat: 40.99, lng: 29.02 });
  });

  it("yalnızca boşluk olan aramayı göndermez, boşlukları kırpar", () => {
    expect(buildSalonParams({ ...DEFAULT_FILTERS, query: "   " }, istanbul)).not.toHaveProperty("search");
    expect(buildSalonParams({ ...DEFAULT_FILTERS, query: "  balayage " }, istanbul).search).toBe("balayage");
  });

  it("bilinmeyen sıralamada puana düşer, sayfa yoksa 1 kullanır", () => {
    const params = buildSalonParams({ sort: "bilinmeyen" }, istanbul);
    expect(params.sort).toBe("rating");
    expect(params.page).toBe(1);
  });
});

describe("arama URL'i", () => {
  it("varsayılan filtrelerde sorgu dizesi üretmez", () => {
    expect(buildSearchHref()).toBe("/kuaforler");
  });

  it("filtreleri URL'e yazar ve geri okur", () => {
    const href = buildSearchHref({ query: "kesim", serviceIds: ["kesim", "boya"], minRating: 4.5, page: 2 });
    const filters = parseFilters(new URLSearchParams(href.split("?")[1]));
    expect(filters).toMatchObject({ query: "kesim", serviceIds: ["kesim", "boya"], minRating: 4.5, page: 2 });
  });

  it("bozuk URL değerlerinde varsayılanlara döner", () => {
    const filters = parseFilters(new URLSearchParams("puan=abc&sayfa=-3&sirala=xyz&uygunluk=hep&hizmet=,,"));
    expect(filters).toMatchObject({ minRating: 0, page: 1, sort: "puan", availability: "any", serviceIds: [] });
  });
});

describe("buildChips", () => {
  const noop = () => {};

  it("varsayılan filtrelerde etiket üretmez", () => {
    expect(buildChips(DEFAULT_FILTERS, noop, true)).toEqual([]);
  });

  it("konum yoksa mesafe etiketini göstermez, aramayı en başa koyar", () => {
    const filters = { ...DEFAULT_FILTERS, query: "kesim", distance: 10, minRating: 4.5 };
    expect(buildChips(filters, noop, false).map((chip) => chip.key)).toEqual(["query", "rating"]);
    expect(buildChips(filters, noop, true).map((chip) => chip.key)).toEqual(["query", "rating", "distance"]);
  });

  it("etiket kaldırıldığında yalnızca ilgili değeri temizler", () => {
    const changes = [];
    const chips = buildChips({ ...DEFAULT_FILTERS, serviceIds: ["kesim", "boya"] }, (change) => changes.push(change), false);
    chips[0].onRemove();
    expect(changes).toEqual([{ serviceIds: ["boya"] }]);
  });
});
