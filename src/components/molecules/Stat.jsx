export default function Stat({ label, children }) {
  return (
    <div>
      <div className="text-[12px] text-neutral-700">{label}</div>
      <div className="text-[18px] font-extrabold">{children}</div>
    </div>
  );
}
