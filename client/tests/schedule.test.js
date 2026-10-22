import { describe, expect, it } from "vitest";
import { getBusyRanges, getGridRange, validateHours } from "@/features/panel/scheduling";
import { getDaySchedule, toWorkingHours, toWorkingHoursPayload } from "@/lib/schedule";

const day = (overrides) => ({ weekday: 1, open: true, start: "09:00", end: "18:00", breakStart: "", breakEnd: "", ...overrides });

describe("validateHours", () => {
  it("geçerli programda hata vermez, kapalı günleri atlar", () => {
    expect(validateHours([day(), day({ weekday: 0, open: false, start: "20:00", end: "08:00" })])).toBeNull();
  });

  it("kapanış açılıştan önce ya da eşitse hata verir", () => {
    expect(validateHours([day({ end: "09:00" })])).toMatch(/kapanış saati açılıştan sonra/);
  });

  it("boş saatleri yakalar", () => {
    expect(validateHours([day({ start: "" })])).toMatch(/açılış ve kapanış saati gerekli/);
  });

  it("yarım girilmiş molayı yakalar", () => {
    expect(validateHours([day({ breakStart: "12:00" })])).toMatch(/birlikte girilmeli/);
  });

  it("çalışma saatleri dışındaki molayı yakalar", () => {
    expect(validateHours([day({ breakStart: "08:00", breakEnd: "08:30" })])).toMatch(/çalışma saatleri içinde/);
    expect(validateHours([day({ breakStart: "13:00", breakEnd: "12:00" })])).toMatch(/mola bitişi/);
  });
});

describe("çalışma saatleri dönüşümü", () => {
  it("eksik günleri kapalı ve varsayılan saatlerle doldurur", () => {
    const hours = toWorkingHours([]);
    expect(hours).toHaveLength(7);
    expect(hours.every((item) => !item.open && item.start === "09:00")).toBe(true);
  });

  it("API biçimine geri çevirirken molayı korur", () => {
    const api = [{ dayOfWeek: 1, openTime: "10:00", closeTime: "19:00", breaks: [{ start: "13:00", end: "14:00" }], isClosed: false }];
    const payload = toWorkingHoursPayload(toWorkingHours(api));
    expect(payload.find((item) => item.dayOfWeek === 1)).toEqual(api[0]);
    expect(payload.find((item) => item.dayOfWeek === 2)).toMatchObject({ isClosed: true, breaks: [] });
  });

  it("özel kapalı günü kapalı sayar", () => {
    const hours = toWorkingHours([{ dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", breaks: [], isClosed: false }]);
    expect(getDaySchedule(hours, [], "2026-10-22").closed).toBe(false);
    expect(getDaySchedule(hours, [{ date: "2026-10-22" }], "2026-10-22").closed).toBe(true);
  });
});

describe("takvim yardımcıları", () => {
  it("hiç açık gün yoksa varsayılan aralık döner", () => {
    expect(getGridRange([day({ open: false })])).toEqual({ start: 540, end: 1140 });
  });

  it("dolu aralıklarda iptal edilenleri ve hariç tutulanı saymaz", () => {
    const appointments = [
      { id: "a", date: "2026-10-22", time: "10:00", endTime: "10:45", status: "BOOKED" },
      { id: "b", date: "2026-10-22", time: "11:00", endTime: "12:00", status: "CANCELLED" },
      { id: "c", date: "2026-10-22", time: "13:00", endTime: "13:30", status: "BOOKED" },
      { id: "d", date: "2026-10-23", time: "10:00", endTime: "11:00", status: "BOOKED" },
    ];
    expect(getBusyRanges(appointments, "2026-10-22", "c")).toEqual([[600, 645]]);
  });
});
