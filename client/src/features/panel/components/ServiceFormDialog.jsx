"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import Dialog, { DialogActions, DialogTitle } from "@/components/molecules/Dialog";
import ErrorNotice from "@/components/molecules/ErrorNotice";
import Field from "@/components/molecules/Field";

const TITLE_ID = "service-form-title";
const NEW_SERVICE = { name: "", duration: 60, price: 500 };
const MIN_DURATION = 15;
const MAX_DURATION = 600;

export default function ServiceFormDialog({ service, saving = false, error, onSave, onClose }) {
  const [form, setForm] = useState(service ?? NEW_SERVICE);
  const durationInvalid = !Number.isInteger(form.duration) || form.duration < MIN_DURATION || form.duration > MAX_DURATION;
  const priceInvalid = !Number.isFinite(form.price) || form.price < 0;
  const invalid = !form.name.trim() || durationInvalid || priceInvalid;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (invalid || saving) return;
    onSave({ ...form, name: form.name.trim() });
  };

  return (
    <Dialog as="form" titleId={TITLE_ID} onClose={onClose} onSubmit={handleSubmit}>
      <DialogTitle id={TITLE_ID}>{service ? "Hizmeti düzenle" : "Yeni hizmet"}</DialogTitle>
      <Field label="Hizmet adı" htmlFor="service-name">
        <Input
          id="service-name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Örn. Keratin bakımı"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Süre (dakika)" htmlFor="service-duration" error={durationInvalid && `${MIN_DURATION}–${MAX_DURATION} dakika arası olmalı.`}>
          <Input
            id="service-duration"
            type="number"
            min={MIN_DURATION}
            max={MAX_DURATION}
            step="15"
            value={form.duration}
            onChange={(event) => setForm({ ...form, duration: Number(event.target.value) })}
          />
        </Field>
        <Field label="Fiyat (TL)" htmlFor="service-price" error={priceInvalid && "Fiyat 0 veya daha büyük olmalı."}>
          <Input
            id="service-price"
            type="number"
            min="0"
            step="50"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
          />
        </Field>
      </div>
      <ErrorNotice error={error} />
      <DialogActions>
        <Button onClick={onClose}>Vazgeç</Button>
        <Button type="submit" variant="primary" disabled={invalid || saving}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
