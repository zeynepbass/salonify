import { describe, expect, it } from "vitest";
import { filterBySearch, matchesSearch, normalizeText, tokenize } from "@/lib/search";

describe("normalizeText", () => {
  it("Türkçe büyük/küçük harf ve karakterleri sadeleştirir", () => {
    expect(normalizeText("İSTANBUL Şişli Çağlayan")).toBe("istanbul sisli caglayan");
    expect(normalizeText("IĞDIR")).toBe("igdir");
    expect(normalizeText("Müşteri Göğüş")).toBe("musteri gogus");
  });

  it("boş, null ve sayı değerlerini güvenle işler", () => {
    expect(normalizeText(null)).toBe("");
    expect(normalizeText(undefined)).toBe("");
    expect(normalizeText(0)).toBe("0");
    expect(normalizeText("   ")).toBe("");
  });

  it("birden fazla boşluğu teke indirir", () => {
    expect(normalizeText("  Ayşe \t  Yılmaz \n")).toBe("ayse yilmaz");
  });
});

describe("tokenize", () => {
  it("boş sorguda boş dizi döner", () => {
    expect(tokenize("")).toEqual([]);
    expect(tokenize("    ")).toEqual([]);
    expect(tokenize(undefined)).toEqual([]);
  });
});

describe("matchesSearch", () => {
  const fields = ["Elif Kaya", "0532 555 12 34", "Saç Kesimi", null];

  it("boş sorgu her zaman eşleşir", () => {
    expect(matchesSearch(fields, "")).toBe(true);
  });

  it("aksansız yazımla eşleşir", () => {
    expect(matchesSearch(fields, "sac kesimi")).toBe(true);
    expect(matchesSearch(fields, "ELİF")).toBe(true);
  });

  it("tüm kelimelerin farklı alanlarda geçmesini ister", () => {
    expect(matchesSearch(fields, "elif kesim")).toBe(true);
    expect(matchesSearch(fields, "elif boya")).toBe(false);
  });

  it("telefon numarası parçasıyla eşleşir", () => {
    expect(matchesSearch(fields, "555 12")).toBe(true);
  });
});

describe("filterBySearch", () => {
  const items = [{ name: "Ayşe" }, { name: "Şule" }, { name: "Can" }];
  const getFields = (item) => [item.name];

  it("sorgu boşsa aynı diziyi döner", () => {
    expect(filterBySearch(items, " ", getFields)).toBe(items);
  });

  it("dizi olmayan girdide boş dizi döner", () => {
    expect(filterBySearch(undefined, "a", getFields)).toEqual([]);
    expect(filterBySearch(null, "", getFields)).toEqual([]);
  });

  it("eşleşmeyen sorguda boş sonuç verir", () => {
    expect(filterBySearch(items, "zzz", getFields)).toEqual([]);
  });

  it("Türkçe karaktere duyarsız filtreler", () => {
    expect(filterBySearch(items, "sule", getFields)).toEqual([{ name: "Şule" }]);
  });
});
