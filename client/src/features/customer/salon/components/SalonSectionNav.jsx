const SALON_SECTIONS = [
  { id: "hizmetler", label: "Hizmetler" },
  { id: "portfoy", label: "Portföy" },
  { id: "degerlendirmeler", label: "Değerlendirmeler" },
  { id: "calisma-saatleri", label: "Çalışma saatleri" },
];

export default function SalonSectionNav() {
  return (
    <nav
      aria-label="Salon bölümleri"
      className="sticky top-[68px] z-10 mt-12 flex gap-1 overflow-x-auto border-b border-line bg-canvas"
    >
      {SALON_SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="px-3 py-3.5 text-[14px] font-semibold whitespace-nowrap transition-colors hover:text-accent"
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
