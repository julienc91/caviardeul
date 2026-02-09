"use client";

import React, { createContext, useCallback, useState } from "react";

import { Settings } from "@caviardeul/types";
import SaveManagement from "@caviardeul/utils/save";

const defaultSettings: Settings = {
  lightMode: false,
  autoScroll: true,
};
const getInitialSettings = (): Settings => {
  let settings;
  try {
    settings = SaveManagement.getSettings();
  } catch {
    return defaultSettings;
  }
  return {
    lightMode: settings?.lightMode ?? defaultSettings.lightMode,
    autoScroll: settings?.autoScroll ?? defaultSettings.autoScroll,
  };
};

export const SettingsContext = createContext<{
  settings: Settings;
  onChangeSettings: (_newSettings: Partial<Settings>) => void;
}>({
  settings: defaultSettings,
  onChangeSettings: () => {},
});

const SettingsManager: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(getInitialSettings());
  const handleChangeSettings = useCallback(
    (newSettings: Partial<Settings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      SaveManagement.saveSettings(updatedSettings);
    },
    [settings],
  );

  return (
    <SettingsContext.Provider
      value={{ settings, onChangeSettings: handleChangeSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsManager;
