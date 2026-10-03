"use client";

import { useContext, useEffect } from "react";

import { SettingsContext } from "@caviardeul/components/settings/manager";

const ColorMode = () => {
  const { settings } = useContext(SettingsContext);
  const { lightMode } = settings;

  useEffect(() => {
    document.documentElement.dataset.theme = lightMode ? "light" : "dark";
  }, [lightMode]);

  return null;
};

export default ColorMode;
