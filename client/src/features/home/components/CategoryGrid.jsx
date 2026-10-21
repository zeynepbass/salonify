import Link from "next/link";
import Icon from "@/components/atoms/Icon";
import SectionHeader from "@/features/home/components/SectionHeader";
import { serviceCategories } from "@/data/catalog";
import { buildSearchHref } from "@/features/search/useSalonFilters";

export default function CategoryGrid() {
  return (
    <section id="kategoriler" className="page-container scroll-mt-24">
      <SectionHeader title="Kategoriler" className="mb-5 items-baseline">
        <span className="text-[13px] text-neutral-700">Bir kategori seç, sonuçlar ona göre filtrelensin.</span>
      </SectionHeader>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-3">
        {serviceCategories.map((category) => (
          <Link
            key={category.id}
            href={buildSearchHref({ serviceIds: [category.id] })}
            className="group flex min-h-[120px] flex-col items-start justify-between gap-7 border border-transparent bg-surface p-4 text-[15px] font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
          >
            <Icon name={category.icon} size={26} className="text-accent transition-colors group-hover:text-canvas" />
            {category.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
