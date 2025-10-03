import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

import Navbar from "@caviardeul/components/navbar";
import ColorMode from "@caviardeul/components/settings/colorMode";
import SettingsManager from "@caviardeul/components/settings/manager";
import { BASE_URL } from "@caviardeul/utils/config";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const title = "Caviardeul - Devinez l'article Wikipédia caché";
  const description =
    "Chaque jour, jouez et essayez de retrouver le titre de l'article Wikipédia masqué";
  const url = `${BASE_URL}${router.asPath}`;
  const imageUrl = `${BASE_URL}/caviardeul.png`;
  const imageAlt =
    "Capture d'écran du jeu Caviardeul où vous devez proposer des mots afin de révéler au fur et à mesure le contenu d'un article Wikipédia caviardé afin d'en trouver le titre";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta key="description" name="description" content={description} />
        <meta name="author" content="@julienc91" />

        <meta key="og:title" property="og:title" content={title} />
        <meta property="og:site_name" content="Caviardeul" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={imageAlt} />
        <meta property="og:url" content={url} />
        <meta
          key="og:description"
          property="og:description"
          content={description}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SettingsManager>
        <ColorMode />
        <Navbar />
        {children}
      </SettingsManager>
    </>
  );
};

export default Layout;
