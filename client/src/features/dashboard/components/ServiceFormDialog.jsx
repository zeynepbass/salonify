"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import Dialog, { DialogActions, DialogTitle } from "@/components/molecules/Dialog";
import Field from "@/components/molecules/Field";

const TITLE_ID = "service-form-title";
const NEW_SERVICE = { name: "", duration: 60, price: 500, active: true };

export default function ServiceFormDialog({ service, onSave, onClose }) {
  const [form, setForm] = useState(service ?? NEW_SERVICE);
  const invalid = !form.name.trim() || !(form.duration > 0) || form.price < 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (invalid) return;
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
        <Field label="Süre (dakika)" htmlFor="service-duration">
          <Input
            id="service-duration"
            type="number"
            min="15"
            step="15"
            value={form.duration}
            onChange={(event) => setForm({ ...form, duration: Number(event.target.value) })}
          />
        </Field>
        <Field label="Fiyat (TL)" htmlFor="service-price">
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
      <DialogActions>
        <Button onClick={onClose}>Vazgeç</Button>
        <Button type="submit" variant="primary" disabled={invalid}>
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
