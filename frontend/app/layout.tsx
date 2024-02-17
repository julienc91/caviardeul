import { Metadata } from "next";
import React from "react";

import Navbar from "@caviardeul/components/navbar";
import ColorMode from "@caviardeul/components/settings/colorMode";
import SettingsManager from "@caviardeul/components/settings/manager";
import { BASE_URL } from "@caviardeul/utils/config";

import "../styles/style.scss";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="fr">
      <body>
        <SettingsManager>
          <ColorMode />
          <Navbar />
          {children}
        </SettingsManager>
      </body>
    </html>
  );
};

const defaultTitle = "Caviardeul - Devinez l'article Wikipédia caché";
const defaultDescription =
  "Chaque jour, jouez et essayez de retrouver le titre de l'article Wikipédia masqué";
const defaultImage = "/caviardeul.png";
const defaultImageAlt =
  "Capture d'écran du jeu Caviardeul où vous devez proposer des mots afin de révéler au fur et à mesure le contenu d'un article Wikipédia caviardé afin d'en trouver le titre";
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: defaultTitle,
  description: defaultDescription,
  authors: [{ name: "Julien Chaumont", url: "https://julienc.io" }],
  icons: ["/favicon.ico"],
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    siteName: "Caviardeul",
    type: "website",
    images: [{ url: defaultImage, alt: defaultImageAlt }],
  },
  twitter: {
    title: defaultTitle,
    description: defaultDescription,
    creator: "@julienc91",
    card: "summary_large_image",
    images: [{ url: defaultImage, alt: defaultImageAlt }],
  },
};

export default RootLayout;
