import React from "react";

import Modal from "@caviardeul/components/modal";

const ConfirmModal: React.FC<{
  message: React.ReactNode;
  open: boolean;
  danger: boolean;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ message, open, danger, confirmLabel, onConfirm, onCancel }) => {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      extraButtons={
        <button className={danger ? "danger" : ""} onClick={onConfirm}>
          {confirmLabel}
        </button>
      }
    >
      <h1>Confirmation</h1>
      {message}
    </Modal>
  );
};

export default ConfirmModal;
