"use client";

import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import StateMessage from "@/components/molecules/StateMessage";

export default function RouteError({ description, onRetry }) {
  return (
    <div className="page-container max-w-[760px] py-12">
      <StateMessage role="alert" icon="alert" tone="accent" title="Bir şeyler ters gitti." description={description}>
        <Button variant="primary" className="gap-2.5" onClick={onRetry}>
          <Icon name="refresh" />
          Tekrar Dene
        </Button>
      </StateMessage>
    </div>
  );
}
