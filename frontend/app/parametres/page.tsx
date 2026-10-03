import { Metadata } from "next";
import React from "react";

import SettingsPage from "@caviardeul/components/settings/settingsPage";

const Page: React.FC = () => {
  return <SettingsPage />;
};

export const metadata: Metadata = {
  title: "Caviardeul - Paramètres",
};
export default Page;
