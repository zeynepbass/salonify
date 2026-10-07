import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { cn } from "@/lib/cn";

export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Sayfalar" className="mt-10 flex flex-wrap items-center gap-1 border-t-2 border-line pt-5">
      <Button size="icon" aria-label="Önceki sayfa" disabled={page === 1} onClick={() => onChange(page - 1)}>
        <Icon name="chevronLeft" />
      </Button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
        <button
          key={number}
          type="button"
          aria-current={number === page ? "page" : undefined}
          onClick={() => onChange(number)}
          className={cn(
            "h-9 min-w-9 border text-[14px] font-semibold transition-colors",
            number === page ? "border-ink bg-ink text-canvas" : "border-line hover:border-ink",
          )}
        >
          {number}
        </button>
      ))}
      <Button size="icon" aria-label="Sonraki sayfa" disabled={page === pageCount} onClick={() => onChange(page + 1)}>
        <Icon name="chevronRight" />
      </Button>
      <span className="ml-auto text-[13px] text-neutral-700">
        Sayfa {page} / {pageCount}
      </span>
    </nav>
  );
}
