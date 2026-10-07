"use client";

import { useState } from "react";
import Switch from "@/components/atoms/Switch";

const PREFERENCES = [
  { key: "email", label: "E-posta bildirimleri", description: "Randevu oluşturma, güncelleme ve iptaller" },
  { key: "sms", label: "SMS bildirimleri", description: "Randevu bilgileri telefonuna gelsin" },
  { key: "reminder", label: "Randevu hatırlatması", description: "Randevudan 24 saat önce" },
  { key: "promo", label: "Kampanyalar", description: "Takip ettiğin kuaförlerden fırsatlar" },
];

export default function NotificationPreferences({ initialPreferences }) {
  const [preferences, setPreferences] = useState(initialPreferences);

  return (
    <section>
      <h2 className="mb-2 text-[20px]">Bildirim tercihleri</h2>
      {PREFERENCES.map((item) => {
        const labelId = `preference-${item.key}`;
        return (
          <div key={item.key} className="flex items-center gap-4 border-t border-line py-4">
            <div className="flex-1">
              <div id={labelId} className="text-[15px] font-bold">
                {item.label}
              </div>
              <div className="text-[13px] text-neutral-700">{item.description}</div>
            </div>
            <Switch
              checked={preferences[item.key]}
              onChange={(checked) => setPreferences((current) => ({ ...current, [item.key]: checked }))}
              aria-labelledby={labelId}
            />
          </div>
        );
      })}
    </section>
  );
}
