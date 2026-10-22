export default function MobileActionBar({ kicker, value, children }) {
  return (
    <div className="glass fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line px-4 py-2.5 md:hidden">
      <div className="min-w-0 flex-1 leading-[1.2]">
        <div className="truncate text-[11px] text-neutral-700">{kicker}</div>
        <div className="text-[17px] font-extrabold">{value}</div>
      </div>
      {children}
    </div>
  );
}
