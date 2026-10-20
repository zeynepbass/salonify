import Icon from "@/components/atoms/Icon";

export default function Spinner({ size = 18 }) {
  return <Icon name="loader" size={size} className="animate-spin-slow" />;
}
