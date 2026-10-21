"use client";

import { useState } from "react";
import Switch from "@/components/atoms/Switch";
import { useToast } from "@/components/organisms/ToastProvider";
import { useAuth } from "@/features/auth/AuthProvider";
import { api, getErrorMessage } from "@/lib/api";

const PREFERENCES = [
  { key: "email", label: "E-posta bildirimleri", description: "Randevu oluşturma, güncelleme ve iptaller" },
  { key: "sms", label: "SMS bildirimleri", description: "Randevu bilgileri telefonuna gelsin" },
  { key: "reminder", label: "Randevu hatırlatması", description: "Randevudan 24 saat önce" },
  { key: "promo", label: "Kampanyalar", description: "Takip ettiğin kuaförlerden fırsatlar" },
];

export default function NotificationPreferences({ initialPreferences }) {
  const { updateSession } = useAuth();
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState(initialPreferences);

  const togglePreference = async (key, checked) => {
    setPreferences((current) => ({ ...current, [key]: checked }));
    try {
      const profile = await api.patch("/users/me", { notificationPreferences: { [key]: checked } });
      updateSession({ user: profile.user });
    } catch (error) {
      setPreferences((current) => ({ ...current, [key]: !checked }));
      showToast(getErrorMessage(error), { tone: "error" });
    }
  };

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
              onChange={(checked) => togglePreference(item.key, checked)}
              aria-labelledby={labelId}
            />
          </div>
        );
      })}
    </section>
  );
}
