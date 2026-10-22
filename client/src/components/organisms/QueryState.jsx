import PageSpinner from "@/components/molecules/PageSpinner";
import QueryError from "@/components/molecules/QueryError";

export default function QueryState({
  query,
  errorTitle,
  loading = <PageSpinner className="min-h-[30vh]" />,
  isEmpty,
  empty = null,
  className,
  children,
}) {
  if (query.isPending) return loading;
  if (query.isError) return <QueryError query={query} title={errorTitle} className={className} />;
  if (isEmpty?.(query.data)) return empty;
  return children(query.data);
}
