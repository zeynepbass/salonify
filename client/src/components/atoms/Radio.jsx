export default function Radio({ name, checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14px]">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="grid size-[18px] flex-none place-items-center border-2 border-neutral-500 transition-colors peer-checked:border-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-checked:[&>span]:bg-accent">
        <span className="size-2" />
      </span>
      {children}
    </label>
  );
}
