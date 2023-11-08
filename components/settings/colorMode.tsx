"use client";

import { useContext, useEffect } from "react";

import { SettingsContext } from "@caviardeul/components/settings/manager";

const getColorScheme = (lightMode: boolean): [string, string] => {
  return lightMode ? ["#eee", "#202020"] : ["#101010", "#ddd"];
};

const ColorMode = () => {
  const { settings } = useContext(SettingsContext);
  const { lightMode } = settings;

  useEffect(() => {
    const [backgroundColor, textColor] = getColorScheme(lightMode);
    document.documentElement.style.setProperty("--color-text", textColor);
    document.documentElement.style.setProperty(
      "--color-background",
      backgroundColor,
    );
  }, [lightMode]);

  return null;
};

export default ColorMode;
