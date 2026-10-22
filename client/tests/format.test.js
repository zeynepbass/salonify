import { describe, expect, it } from "vitest";
import { addDays, formatRelativeTime, minutesToTime, startOfWeek, timeToMinutes } from "@/lib/date";
import { formatDuration, formatPrice, formatRating, getInitials, withLocativeSuffix } from "@/lib/format";

describe("withLocativeSuffix", () => {
  it.each([
    ["Kadıköy", "Kadıköy'de"],
    ["Beşiktaş", "Beşiktaş'ta"],
    ["Şişli", "Şişli'de"],
    ["Bakırköy", "Bakırköy'de"],
    ["Konak", "Konak'ta"],
    ["Çankaya", "Çankaya'da"],
  ])("%s → %s", (word, expected) => {
    expect(withLocativeSuffix(word)).toBe(expected);
  });
});

describe("format", () => {
  it("fiyatı Türkçe binlik ayraçla yazar", () => {
    expect(formatPrice(1800)).toBe("1.800 TL");
    expect(formatPrice(0)).toBe("0 TL");
  });

  it("puanı tek ondalıkla yazar", () => {
    expect(formatRating(5)).toBe("5.0");
    expect(formatRating(4.86)).toBe("4.9");
  });

  it("süreyi kısa ve uzun biçimde yazar", () => {
    expect(formatDuration(45)).toBe("45 dk");
    expect(formatDuration(45, { long: true })).toBe("45 dakika");
  });

  it("baş harfleri fazla boşluğa ve Türkçe harfe dayanıklı üretir", () => {
    expect(getInitials("  ilknur   şahin  ")).toBe("İŞ");
    expect(getInitials("Elif")).toBe("E");
    expect(getInitials("Ayşe Nur Yılmaz")).toBe("AN");
  });
});

describe("date", () => {
  it("ay ve yıl sınırlarını doğru geçer", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("haftanın başlangıcını pazartesi kabul eder", () => {
    expect(startOfWeek("2026-10-22")).toBe("2026-10-19");
    expect(startOfWeek("2026-10-25")).toBe("2026-10-19");
    expect(startOfWeek("2026-10-19")).toBe("2026-10-19");
  });

  it("saat ve dakika arasında çevirir", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("23:59")).toBe(1439);
    expect(minutesToTime(65)).toBe("01:05");
  });

  it("göreli zamanı yazar", () => {
    const now = new Date("2026-10-22T12:00:00Z");
    expect(formatRelativeTime("2026-10-22T11:59:30Z", now)).toBe("Şimdi");
    expect(formatRelativeTime("2026-10-22T11:15:00Z", now)).toBe("45 dk önce");
    expect(formatRelativeTime("2026-10-21T11:00:00Z", now)).toBe("Dün");
    expect(formatRelativeTime("2026-10-23T12:00:00Z", now)).toBe("Şimdi");
  });
});
