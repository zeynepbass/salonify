import { describe, expect, it } from "vitest";
import { toPanelAppointment, toPortfolioItem } from "@/features/panel/panelMappers";
import { toNotificationView } from "@/lib/notifications";

describe("toPanelAppointment", () => {
  const raw = {
    id: "1",
    reference: "SB-1",
    date: "2020-01-01",
    startTime: "10:00",
    endTime: "10:45",
    customerName: "Elif",
    service: "s1",
    serviceName: "Kesim",
    duration: 45,
    price: 600,
    status: "BOOKED",
    source: "ONLINE",
  };

  it("eksik telefon, not ve kaynakta çökmez", () => {
    const view = toPanelAppointment({ ...raw, source: undefined });
    expect(view).toMatchObject({ phone: "", note: "", source: "" });
  });

  it("geçmişteki açık randevuyu düzenlenemez ama tamamlanabilir işaretler", () => {
    const view = toPanelAppointment(raw);
    expect(view).toMatchObject({ source: "online", canEdit: false, canComplete: true, start: 600, end: 645 });
  });

  it("iptal edilmiş randevuyu pasif ve kilitli sayar", () => {
    expect(toPanelAppointment({ ...raw, status: "CANCELLED" })).toMatchObject({ inactive: true, locked: true, canComplete: false });
  });
});

describe("toPortfolioItem", () => {
  it("müşteri adı yoksa salonu yazar", () => {
    const item = toPortfolioItem({ id: "p", image: "x", createdAt: "2026-10-01T10:00:00Z", hasConsent: true, isPublished: false });
    expect(item).toMatchObject({ customer: "Salon", title: "", date: "2026-10-01", consent: true, published: false });
  });
});

describe("toNotificationView", () => {
  const base = { id: "n", title: "t", body: "b", createdAt: new Date().toISOString(), isRead: false, appointment: "a1" };

  it("bilinmeyen türü hatırlatma olarak gösterir", () => {
    expect(toNotificationView({ ...base, type: "YENI_BIR_TUR" }).type).toBe("reminder");
  });

  it("müşteri için değerlendirme isteğini değerlendirme sayfasına bağlar", () => {
    expect(toNotificationView({ ...base, type: "REVIEW_REQUESTED" }).href).toBe("/randevularim/a1/degerlendir");
  });

  it("randevusu olmayan bildirimde bağlantı üretmez", () => {
    expect(toNotificationView({ ...base, type: "APPOINTMENT_CREATED", appointment: null }).href).toBeNull();
  });

  it("salon için yayınlanan değerlendirmeyi portföye yönlendirir", () => {
    const view = toNotificationView({ ...base, type: "REVIEW_PUBLISHED" }, { audience: "salon" });
    expect(view).toMatchObject({ href: "/panel/portfoy", appointmentId: null, unread: true });
  });
});
