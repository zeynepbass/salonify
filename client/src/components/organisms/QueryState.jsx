import Button from "@/components/atoms/Button";
import PageSpinner from "@/components/molecules/PageSpinner";
import StateMessage from "@/components/molecules/StateMessage";
import { getErrorMessage } from "@/lib/api";

export default function QueryState({
  query,
  errorTitle = "Veriler yüklenemedi.",
  loading = <PageSpinner className="min-h-[30vh]" />,
  isEmpty,
  empty = null,
  className,
  children,
}) {
  if (query.isPending) return loading;

  if (query.isError) {
    return (
      <StateMessage role="alert" icon="alert" tone="accent" title={errorTitle} description={getErrorMessage(query.error)} className={className}>
        <Button onClick={() => query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? "Yükleniyor…" : "Tekrar dene"}
        </Button>
      </StateMessage>
    );
  }

  if (isEmpty?.(query.data)) return empty;

  return children(query.data);
}
