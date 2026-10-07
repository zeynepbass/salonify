import Icon from "@/components/atoms/Icon";
import SalonSection from "@/features/salon/components/SalonSection";
import { cn } from "@/lib/cn";
import { WEEKDAYS } from "@/lib/date";

export default function HoursSection({ hours, todayWeekday }) {
  return (
    <SalonSection id="calisma-saatleri" title="Çalışma saatleri ve konum">
      <div className="flex flex-wrap gap-10">
        <table className="max-w-[520px] flex-[1_1_360px] self-start text-[14px]">
          <tbody>
            {hours.map((day) => (
              <tr key={day.weekday} className={cn("border-b border-line", day.weekday === todayWeekday && "font-extrabold")}>
                <th scope="row" className="py-3 pr-3 text-left font-[inherit]">
                  {WEEKDAYS[day.weekday]}
                </th>
                <td className="py-3 text-right">{day.open ? `${day.start} – ${day.end}` : "Kapalı"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="relative min-h-[240px] flex-[1_1_360px] bg-surface">
          <span className="absolute bottom-2.5 left-3 font-mono text-[11px] text-neutral-700">harita</span>
          <Icon name="pin" className="absolute top-[45%] left-1/2 text-accent" />
        </div>
      </div>
    </SalonSection>
  );
}
