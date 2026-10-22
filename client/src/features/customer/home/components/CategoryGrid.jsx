import Link from "next/link";
import Icon from "@/components/atoms/Icon";
import SectionHeader from "@/features/customer/home/components/SectionHeader";
import { serviceCategories } from "@/data/catalog";
import { buildSearchHref } from "@/features/customer/search/useSalonFilters";

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
            className="group card flex min-h-[120px] flex-col items-start justify-between gap-7 p-4 text-[15px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-400 hover:shadow-md"
          >
            <span className="grid size-11 place-items-center rounded-lg bg-accent-100 text-accent transition-colors group-hover:bg-accent group-hover:text-canvas">
              <Icon name={category.icon} size={22} />
            </span>
            {category.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
