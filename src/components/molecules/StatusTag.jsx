import Icon from "@/components/atoms/Icon";
import Tag from "@/components/atoms/Tag";
import { STATUS_META } from "@/lib/appointmentStatus";

export default function StatusTag({ status, className }) {
  const { label, variant, icon } = STATUS_META[status];

  return (
    <Tag variant={variant} className={className}>
      <Icon name={icon} size={12} />
      {label}
    </Tag>
  );
}
