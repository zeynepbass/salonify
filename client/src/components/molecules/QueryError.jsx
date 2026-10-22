import Button from "@/components/atoms/Button";
import StateMessage from "@/components/molecules/StateMessage";
import { getErrorMessage } from "@/lib/api";

export default function QueryError({ query, title = "Veriler yüklenemedi.", className }) {
  return (
    <StateMessage role="alert" icon="alert" tone="accent" title={title} description={getErrorMessage(query.error)} className={className}>
      <Button onClick={() => query.refetch()} disabled={query.isFetching}>
        {query.isFetching ? "Yükleniyor…" : "Tekrar dene"}
      </Button>
    </StateMessage>
  );
}
