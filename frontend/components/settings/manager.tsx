"use client";

import React, {
  createContext,
  useCallback,
  useState,
  useSyncExternalStore,
} from "react";

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

// Stored settings are only available in the browser: expose them through an
// external store so that hydration uses the defaults rendered by the server,
// then switches to the stored settings
const createSettingsStore = () => {
  let settings: Settings | null = null;
  const listeners = new Set<() => void>();
  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: (): Settings => (settings ??= getInitialSettings()),
    getServerSnapshot: (): Settings => defaultSettings,
    update: (newSettings: Partial<Settings>) => {
      settings = { ...(settings ?? getInitialSettings()), ...newSettings };
      SaveManagement.saveSettings(settings);
      listeners.forEach((listener) => listener());
    },
  };
};

const SettingsManager: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [store] = useState(createSettingsStore);
  const settings = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const handleChangeSettings = useCallback(
    (newSettings: Partial<Settings>) => store.update(newSettings),
    [store],
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
