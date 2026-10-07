"use client";

import { useId } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import Dialog, { DialogActions, DialogBody, DialogTitle } from "@/components/molecules/Dialog";

export default function ConfirmDialog({
  title,
  confirmLabel,
  cancelLabel = "Vazgeç",
  busy = false,
  onConfirm,
  onClose,
  children,
}) {
  const titleId = useId();
  const bodyId = useId();

  return (
    <Dialog role="alertdialog" titleId={titleId} aria-describedby={bodyId} onClose={onClose}>
      <span className="grid size-11 place-items-center bg-accent-100 text-accent-700">
        <Icon name="alert" />
      </span>
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogBody id={bodyId}>{children}</DialogBody>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button variant="primary" onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
