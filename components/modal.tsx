import React from "react";

const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  extraButtons?: React.ReactNode;
  closeLabel?: string;
}> = ({ open, onClose, closeLabel, extraButtons, children }) => {
  if (!open) {
    return null;
  }
  return (
    <div className="modal-container">
      <div className="modal-background" onClick={onClose} />
      <div className="modal">
        {children}
        <div className="modal-buttons">
          <button onClick={onClose}>{closeLabel || "Fermer"}</button>
          {extraButtons}
        </div>
      </div>
    </div>
  );
};

export default Modal;
