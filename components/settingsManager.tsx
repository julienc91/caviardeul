import React, { useCallback, useEffect, useState } from "react";
import { SettingsContext, getInitialSettings } from "../utils/settings";
import { Settings } from "../types";
import SaveManagement from "../utils/save";

const getColorScheme = (lightMode: boolean): [string, string] => {
  return lightMode ? ["#eee", "#202020"] : ["#101010", "#ddd"];
};

const SettingsManager: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(getInitialSettings());

  const toggleLightMode = useCallback((lightMode: boolean) => {
    const [backgroundColor, textColor] = getColorScheme(lightMode);
    document.documentElement.style.setProperty("--color-text", textColor);
    document.documentElement.style.setProperty(
      "--color-background",
      backgroundColor
    );
  }, []);

  const handleChangeSettings = useCallback(
    (newSettings: Partial<Settings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      SaveManagement.saveSettings(updatedSettings);
    },
    [settings]
  );

  useEffect(() => {
    toggleLightMode(settings.lightMode);
  }, [settings, toggleLightMode]);

  return (
    <SettingsContext.Provider
      value={{ settings, onChangeSettings: handleChangeSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsManager;
