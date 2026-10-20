"use client";

import { useEffect, useRef } from "react";
import Icon from "@/components/atoms/Icon";

export default function PhotoPicker({ photos, max, onChange }) {
  const inputRef = useRef(null);
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

  const addPhotos = (event) => {
    const files = Array.from(event.target.files).slice(0, max - photos.length);
    onChange([...photos, ...files.map((file) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(file) }))]);
    event.target.value = "";
  };

  const removePhoto = (photo) => {
    URL.revokeObjectURL(photo.url);
    onChange(photos.filter((item) => item.id !== photo.id));
  };

  return (
    <div>
      <div className="mb-1.5 text-[12px] text-neutral-700">Fotoğraf ekle (isteğe bağlı, en fazla {max})</div>
      <div className="flex flex-wrap gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative size-24">
            <div
              role="img"
              aria-label="Eklenen fotoğraf"
              className="absolute inset-0 bg-neutral-200 bg-cover bg-center grayscale"
              style={{ backgroundImage: `url(${photo.url})` }}
            />
            <button
              type="button"
              onClick={() => removePhoto(photo)}
              aria-label="Fotoğrafı kaldır"
              className="absolute top-0 right-0 grid size-6 place-items-center bg-ink text-canvas"
            >
              <Icon name="close" size={12} />
            </button>
          </div>
        ))}
        {photos.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="flex size-24 flex-col items-center justify-center gap-1.5 border border-dashed border-neutral-600 text-[12px] transition-colors hover:border-accent hover:text-accent"
          >
            <Icon name="camera" />
            Ekle
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
    </div>
  );
}
