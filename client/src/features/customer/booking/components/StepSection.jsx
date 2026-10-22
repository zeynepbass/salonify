export default function StepSection({ id, title, aside, children }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-[100px]">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={id} className="text-[20px]">
          {title}
        </h2>
        {aside && <span className="text-[13px] text-neutral-700">{aside}</span>}
      </div>
      {children}
    </section>
  );
}
