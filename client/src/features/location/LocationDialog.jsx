"use client";

import { useId, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import Spinner from "@/components/atoms/Spinner";
import Dialog, { DialogActions, DialogTitle } from "@/components/molecules/Dialog";
import SearchInput from "@/components/molecules/SearchInput";
import { useToast } from "@/components/organisms/ToastProvider";
import { cities } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { includesText } from "@/lib/format";

function Option({ selected, onSelect, trailing, children }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-2.5 text-left text-[14px] transition-colors hover:bg-neutral-200",
        selected && "bg-accent-100 font-bold text-accent-800 hover:bg-accent-100",
      )}
    >
      {children}
      {trailing}
    </button>
  );
}

export default function LocationDialog({ current, onApply, onClose }) {
  const titleId = useId();
  const { showToast } = useToast();
  const [city, setCity] = useState(current.city);
  const [district, setDistrict] = useState(current.district);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle");

  const districts = cities.find((item) => item.name === city).districts;
  const visibleDistricts = districts.filter((item) => includesText(item, query));
  const locating = status === "locating";

  const selectCity = (name) => {
    setCity(name);
    setDistrict(cities.find((item) => item.name === name).districts[0]);
  };

  const apply = (next, message) => {
    onApply(next);
    showToast(message);
    onClose();
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        apply(
          { city, district, lat: coords.latitude, lng: coords.longitude },
          `Konum bulundu. Sonuçlar ${city}, ${district} için yakınlığa göre listelenir.`,
        ),
      () => setStatus("denied"),
      { timeout: 8000 },
    );
  };

  return (
    <Dialog size="md" titleId={titleId} onClose={onClose}>
      <div className="flex items-center justify-between">
        <DialogTitle id={titleId}>Konum seç</DialogTitle>
        <Button variant="plain" size="icon" aria-label="Kapat" onClick={onClose}>
          <Icon name="close" />
        </Button>
      </div>

      <Button size="md" align="start" className="w-full gap-2.5" disabled={locating} onClick={locateUser}>
        {locating ? <Spinner /> : <Icon name="navigation" />}
        {locating ? "Konum alınıyor…" : "Mevcut konumumu kullan"}
      </Button>

      {status === "denied" && (
        <div role="alert" className="flex gap-2.5 bg-accent-100 p-3 text-[13px] text-accent-800">
          <Icon name="alert" />
          <span>
            Konum izni reddedildi. İl ve ilçeyi aşağıdan manuel seçebilirsin; tarayıcı ayarlarından izni daha sonra
            açabilirsin.
          </span>
        </div>
      )}

      <SearchInput value={query} onChange={setQuery} placeholder="İlçe ara" />

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] border-t-2 border-line">
        <div role="listbox" aria-label="Şehir" className="flex max-h-[300px] flex-col overflow-auto border-r border-line">
          <div className="eyebrow px-3 pt-2.5 pb-1.5 font-normal text-neutral-700">Şehir</div>
          {cities.map((item) => (
            <Option
              key={item.name}
              selected={item.name === city}
              onSelect={() => selectCity(item.name)}
              trailing={<Icon name="chevronRight" size={14} />}
            >
              {item.name}
            </Option>
          ))}
        </div>
        <div role="listbox" aria-label="İlçe" className="flex max-h-[300px] flex-col overflow-auto">
          <div className="eyebrow px-3 pt-2.5 pb-1.5 font-normal text-neutral-700">İlçe</div>
          {visibleDistricts.map((item) => (
            <Option
              key={item}
              selected={item === district}
              onSelect={() => setDistrict(item)}
              trailing={item === district && <Icon name="check" size={14} />}
            >
              {item}
            </Option>
          ))}
          {visibleDistricts.length === 0 && <div className="p-3 text-[13px] text-neutral-700">Sonuç yok.</div>}
        </div>
      </div>

      <DialogActions>
        <Button onClick={onClose}>Vazgeç</Button>
        <Button variant="primary" onClick={() => apply({ city, district }, `Konum: ${city}, ${district}`)}>
          Konumu uygula
        </Button>
      </DialogActions>
    </Dialog>
  );
}
