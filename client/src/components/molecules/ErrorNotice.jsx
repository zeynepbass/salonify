import Icon from "@/components/atoms/Icon";
import { toApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

export default function ErrorNotice({ error, className }) {
  if (!error) return null;

  const { message, fieldErrors } = typeof error === "string" ? { message: error, fieldErrors: [] } : toApiError(error);
  const details = fieldErrors.filter((item) => item.message !== message);

  return (
    <div role="alert" className={cn("flex gap-2.5 bg-accent-100 p-3 text-[13px] text-accent-800", className)}>
      <Icon name="alert" size={16} className="mt-0.5 flex-none" />
      <div className="min-w-0">
        <p className="font-semibold">{message}</p>
        {details.length > 0 && (
          <ul className="mt-1 list-disc pl-4">
            {details.map((item) => (
              <li key={`${item.field}-${item.message}`}>{item.message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
