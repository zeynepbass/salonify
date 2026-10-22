"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import StateMessage from "@/components/molecules/StateMessage";
import QueryState from "@/components/organisms/QueryState";
import { useToast } from "@/components/organisms/ToastProvider";
import { usePanel } from "@/features/panel/PanelProvider";
import ServiceFormDialog from "@/features/panel/components/ServiceFormDialog";
import { useDeleteService, useSaveService, useServices } from "@/features/panel/hooks/useServices";
import { getResponseMessage } from "@/lib/api";
import { formatDuration, formatPrice } from "@/lib/format";

export default function ServicesScreen() {
  const { requestConfirmation, closeConfirmation } = usePanel();
  const { showToast, showError } = useToast();
  const servicesQuery = useServices();
  const [form, setForm] = useState(null);

  const saveService = useSaveService({
    onSuccess: () => {
      setForm(null);
      showToast("Hizmet kaydedildi.");
    },
  });
  const deleteService = useDeleteService({
    onSuccess: (response) => showToast(getResponseMessage(response, "Hizmet silindi.")),
    onError: showError,
    onSettled: closeConfirmation,
  });

  const handleDelete = (service) => {
    requestConfirmation({
      title: `“${service.name}” silinsin mi?`,
      body: "Hizmet müşteri sitesinden kaldırılır. Mevcut randevular etkilenmez.",
      confirmLabel: "Hizmeti sil",
      onConfirm: () => deleteService.mutate(service.id),
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

      <QueryState
        query={servicesQuery}
        errorTitle="Hizmetler yüklenemedi."
        isEmpty={(services) => services.length === 0}
        empty={
          <StateMessage icon="scissors" title="Henüz hizmet eklemedin." description="Müşterilerin randevu alabilmesi için en az bir hizmet ekle." />
        }
      >
        {(services) => (
          <div className="border-t border-neutral-400">
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
      </QueryState>

      {form && (
        <ServiceFormDialog
          service={form.service}
          saving={saveService.isPending}
          error={saveService.error}
          onSave={(service) => saveService.mutate(service)}
          onClose={() => {
            setForm(null);
            saveService.reset();
          }}
        />
      )}
    </div>
  );
}
