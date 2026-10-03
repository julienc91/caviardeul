import React from "react";

import Modal from "@caviardeul/components/modals/modal";

const ConfirmModal: React.FC<{
  title?: string;
  message: React.ReactNode;
  open: boolean;
  danger: boolean;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  title,
  message,
  open,
  danger,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      closeLabel={cancelLabel}
      extraButtons={
        <button className={danger ? "danger" : "action"} onClick={onConfirm}>
          {confirmLabel}
        </button>
      }
    >
      <h1>{title ?? "Confirmation"}</h1>
      {message}
    </Modal>
  );
};

export default ConfirmModal;
