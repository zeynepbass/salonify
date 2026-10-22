import Switch from "@/components/atoms/Switch";
import { Input } from "@/components/atoms/Input";
import { Cell, HeadCell } from "@/components/molecules/Table";
import { WEEKDAYS } from "@/lib/date";

function TimeInput({ label, ...props }) {
  return <Input type="time" aria-label={label} className="w-[116px]" {...props} />;
}

export default function WeeklySchedule({ hours, onChange }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-[14px]">
        <thead>
          <tr>
            {["Gün", "Durum", "Açılış", "Kapanış", "Mola"].map((heading) => (
              <HeadCell key={heading}>{heading}</HeadCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((day) => {
            const name = WEEKDAYS[day.weekday];
            const set = (field) => (event) => onChange(day.weekday, { [field]: event.target.value });
            return (
              <tr key={day.weekday}>
                <Cell as="th" scope="row" className="text-left font-bold">
                  {name}
                </Cell>
                <Cell>
                  <div className="flex items-center gap-2">
                    <Switch checked={day.open} onChange={(open) => onChange(day.weekday, { open })} aria-label={`${name} açık`} />
                    <span className="text-[13px]">{day.open ? "Açık" : "Kapalı"}</span>
                  </div>
                </Cell>
                <Cell>
                  <TimeInput label={`${name} açılış`} value={day.start} disabled={!day.open} onChange={set("start")} />
                </Cell>
                <Cell>
                  <TimeInput label={`${name} kapanış`} value={day.end} disabled={!day.open} onChange={set("end")} />
                </Cell>
                <Cell>
                  <div className="flex items-center gap-1.5">
                    <TimeInput label={`${name} mola başlangıç`} value={day.breakStart} disabled={!day.open} onChange={set("breakStart")} />
                    <span>–</span>
                    <TimeInput label={`${name} mola bitiş`} value={day.breakEnd} disabled={!day.open} onChange={set("breakEnd")} />
                  </div>
                </Cell>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
