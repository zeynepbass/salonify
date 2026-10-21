import SalonSection from "@/features/customer/salon/components/SalonSection";
import { cn } from "@/lib/cn";
import { WEEKDAYS } from "@/lib/date";

export default function HoursSection({ hours, todayWeekday }) {
  return (
    <SalonSection id="calisma-saatleri" title="Çalışma saatleri">
      <table className="w-full max-w-[520px] text-[14px]">
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
    </SalonSection>
  );
}
