import React, { useCallback, useContext } from "react";

import Modal from "@caviardeul/components/modals/modal";
import { SettingsContext, defaultSettings } from "@caviardeul/utils/settings";

const SettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { settings, onChangeSettings } = useContext(SettingsContext);
  const { lightMode, displayWordLength, withCloseAlternatives, autoScroll } =
    settings ?? defaultSettings;

  const handleToggleLightMode = useCallback(() => {
    onChangeSettings({ lightMode: !lightMode });
  }, [lightMode, onChangeSettings]);

  const handleToggleDisplayWordLength = useCallback(() => {
    onChangeSettings({ displayWordLength: !displayWordLength });
  }, [displayWordLength, onChangeSettings]);

  const handleToggleWithCloseAlternatives = useCallback(() => {
    onChangeSettings({ withCloseAlternatives: !withCloseAlternatives });
  }, [withCloseAlternatives, onChangeSettings]);

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
            checked={displayWordLength}
            onChange={handleToggleDisplayWordLength}
          />
          Afficher le nombre de lettres au clic
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={withCloseAlternatives}
            onChange={handleToggleWithCloseAlternatives}
          />
          Révéler les mots proches
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
