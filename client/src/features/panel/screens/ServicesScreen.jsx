"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import StateMessage from "@/components/molecules/StateMessage";
import { useToast } from "@/components/organisms/ToastProvider";
import { usePanel } from "@/features/panel/PanelProvider";
import ServiceFormDialog from "@/features/panel/components/ServiceFormDialog";
import { getErrorMessage } from "@/lib/api";
import { formatDuration, formatPrice } from "@/lib/format";

export default function ServicesScreen() {
  const { services, saveService, deleteService, requestConfirmation, closeConfirmation } = usePanel();
  const { showToast } = useToast();
  const [form, setForm] = useState(null);

  const showError = (error) => showToast(getErrorMessage(error), { tone: "error" });

  const handleSave = async (service) => {
    try {
      await saveService(service);
      setForm(null);
      showToast("Hizmet kaydedildi.");
    } catch (error) {
      showError(error);
    }
  };

  const handleDelete = (service) => {
    requestConfirmation({
      title: `“${service.name}” silinsin mi?`,
      body: "Hizmet müşteri sitesinden kaldırılır. Mevcut randevular etkilenmez.",
      confirmLabel: "Hizmeti sil",
      onConfirm: async () => {
        try {
          await deleteService(service.id);
          showToast("Hizmet silindi.");
        } catch (error) {
          showError(error);
        } finally {
          closeConfirmation();
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-neutral-700">Eklediğin hizmetler müşteri sitesinde görünür ve randevuya açılır.</p>
        <Button variant="primary" onClick={() => setForm({ service: null })}>
          <Icon name="plus" />
          Hizmet ekle
        </Button>
      </div>

      {services.length === 0 ? (
        <StateMessage icon="scissors" title="Henüz hizmet eklemedin." description="Müşterilerin randevu alabilmesi için en az bir hizmet ekle." />
      ) : (
        <div className="border-t-2 border-ink">
          {services.map((service) => (
            <div key={service.id} className="flex flex-wrap items-center gap-4 border-b border-line py-4">
              <div className="min-w-0 flex-[1_1_200px]">
                <div className="text-[16px] font-extrabold">{service.name}</div>
                <div className="text-[13px] text-neutral-700">{formatDuration(service.duration, { long: true })}</div>
              </div>
              <div className="min-w-[100px] text-[18px] font-extrabold">{formatPrice(service.price)}</div>
              <div className="flex gap-1">
                <Button className="gap-1.5" onClick={() => setForm({ service })}>
                  <Icon name="edit" />
                  Düzenle
                </Button>
                <Button
                  variant="plain"
                  size="icon"
                  aria-label={`${service.name} hizmetini sil`}
                  className="text-accent-700"
                  onClick={() => handleDelete(service)}
                >
                  <Icon name="trash" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && <ServiceFormDialog service={form.service} onSave={handleSave} onClose={() => setForm(null)} />}
    </div>
  );
}
