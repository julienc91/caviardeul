import React, { useCallback, useContext } from "react";

import Modal from "@caviardeul/components/modals/modal";
import { SettingsContext } from "@caviardeul/components/settings/manager";

const SettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { settings, onChangeSettings } = useContext(SettingsContext);
  const { lightMode, autoScroll } = settings;

  const handleToggleLightMode = useCallback(() => {
    onChangeSettings({ lightMode: !lightMode });
  }, [lightMode, onChangeSettings]);

  const handleToggleAutoscroll = useCallback(() => {
    onChangeSettings({ autoScroll: !autoScroll });
  }, [autoScroll, onChangeSettings]);

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} className="settings-modal">
      <h1>Options</h1>
      <div>
        <label>
          <input
            type="checkbox"
            checked={!lightMode}
            onChange={handleToggleLightMode}
          />
          Activer le mode sombre
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={handleToggleAutoscroll}
          />
          Défilement automatique vers le mot sélectionné
        </label>
      </div>
    </Modal>
  );
};

export default React.memo(SettingsModal);
