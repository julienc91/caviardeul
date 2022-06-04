import React, { useCallback, useEffect, useState } from "react";
import Modal from "./modal";
import SaveManagement from "../utils/save";

const getColorScheme = (lightMode: boolean): [string, string] => {
  return lightMode ? ["#eee", "#202020"] : ["#101010", "#ddd"];
};

const SettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  const handleToggleLightMode = useCallback(() => {
    console.log(lightMode);
    const [backgroundColor, textColor] = getColorScheme(!lightMode);

    document.documentElement.style.setProperty("--color-text", textColor);
    document.documentElement.style.setProperty(
      "--color-background",
      backgroundColor
    );

    setLightMode(!lightMode);
  }, [lightMode]);

  useEffect(() => {
    if (settingsLoaded) {
      return;
    }
    const settings = SaveManagement.getSettings();
    if (settings?.lightMode) {
      handleToggleLightMode();
    }
    setSettingsLoaded(true);
  }, [settingsLoaded]);

  useEffect(() => {
    SaveManagement.saveSettings({ lightMode });
  }, [lightMode]);

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose}>
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
      </div>
    </Modal>
  );
};

export default React.memo(SettingsModal);
