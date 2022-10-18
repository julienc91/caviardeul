import React from "react";
import ReactMarkdown from "react-markdown";

import className = ReactMarkdown.propTypes.className;

const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  extraButtons?: React.ReactNode;
  closeLabel?: string;
}> = ({ open, onClose, className, closeLabel, extraButtons, children }) => {
  if (!open) {
    return null;
  }
  return (
    <div className="modal-container">
      <div className="modal-background" onClick={onClose} />
      <div className={"modal" + (className ? ` ${className}` : "")}>
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
