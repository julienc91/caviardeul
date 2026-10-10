"use client";

import React, { useContext } from "react";

import { SettingsContext } from "@caviardeul/components/settings/manager";

const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: () => void;
}> = ({ label, checked, onChange }) => {
  return (
    <label className="toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={onChange}
      />
      <span className="track" aria-hidden />
    </label>
  );
};

const Options: React.FC = () => {
  const { settings, onChangeSettings } = useContext(SettingsContext);
  const { lightMode } = settings;

  return (
    <div className="options">
      <Toggle
        label="Activer le mode sombre"
        checked={!lightMode}
        onChange={() => onChangeSettings({ lightMode: !lightMode })}
      />
    </div>
  );
};

export default Options;
