export default function Checkbox({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[14px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="m-0 size-[18px] accent-accent" />
      {children}
    </label>
  );
}
