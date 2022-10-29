import React, { useCallback, useContext } from "react";

import Modal from "@caviardeul/components/modal";
import { SettingsContext, defaultSettings } from "@caviardeul/utils/settings";

const SettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { settings, onChangeSettings } = useContext(SettingsContext);
  const { lightMode, displayWordLength, withCloseAlternatives } =
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

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} className="settings-modal">
      <h1>אפשרויות</h1>
      <div>
        <label>
          <input
            type="checkbox"
            checked={!lightMode}
            onChange={handleToggleLightMode}
          />
          הפעל מצב כהה
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={displayWordLength}
            onChange={handleToggleDisplayWordLength}
          />
          הצג מספר אותיות במילה בלחיצה
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={withCloseAlternatives}
            onChange={handleToggleWithCloseAlternatives}
          />
          נחש בתוספת אותיות השימוש וסיומת רבים <span className="beta">בטא</span> 
        </label>
      </div>
    </Modal>
  );
};

export default React.memo(SettingsModal);
