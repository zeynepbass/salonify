"use client";

import { useState } from "react";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import StateMessage from "@/components/molecules/StateMessage";
import Lightbox from "@/features/salon/components/Lightbox";
import SalonSection from "@/features/salon/components/SalonSection";

export default function PortfolioGallery({ items }) {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <SalonSection id="portfoy" title="Portföy" aside="Yalnızca paylaşım izni veren müşterilerin işleri gösterilir.">
      {items.length === 0 ? (
        <StateMessage icon="image" title="Portföyde henüz fotoğraf yok." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${[item.title, item.subtitle].filter(Boolean).join(", ")} fotoğrafını büyüt`}
              className="group flex flex-col gap-2 text-left"
            >
              <ImagePlaceholder
                src={item.image}
                alt={item.title}
                stripe={12}
                className="aspect-[4/5] w-full"
                imageClassName="transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="flex w-full flex-wrap justify-between gap-x-2">
                <span className="text-[14px] font-bold">{item.title}</span>
                <span className="text-[13px] text-neutral-700">{item.subtitle}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {activeIndex !== null && (
        <Lightbox items={items} index={activeIndex} onChange={setActiveIndex} onClose={() => setActiveIndex(null)} />
      )}
    </SalonSection>
  );
}
