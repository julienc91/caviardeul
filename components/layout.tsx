import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";

import IntroductionModal from "@caviardeul/components/introductionModal";
import Navbar from "@caviardeul/components/navbar";
import SettingsManager from "@caviardeul/components/settingsManager";
import SettingsModal from "@caviardeul/components/settingsModal";
import UserManager from "@caviardeul/components/userManager";
import { BASE_URL } from "@caviardeul/utils/config";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleShowSettingsModal = useCallback(() => {
    setShowSettingsModal(true);
  }, []);

  const handleCloseSettingsModal = useCallback(() => {
    setShowSettingsModal(false);
  }, []);

  const router = useRouter();

  const title = "רדקטעל - משחק פענוח מאמר ויקיפדיה יומי";
  const description =
    "שחק כל יום ומצא את המאמר המוסתר מויקיפדיה";
  const url = `${BASE_URL}${router.asPath}`;
  const imageUrl = `${BASE_URL}/caviardeul.png`;
  const imageAlt =
    "צילום מסך של המשחק בו מגלים מילים בהדרגה ממאמר מוסתר על מנת לגלות את הכותרת שלו";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta key="description" name="description" content={description} />
        <meta name="author" content="@xperki" />

        <meta key="og:title" property="og:title" content={title} />
        <meta property="og:site_name" content="רדקטעל" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={imageAlt} />
        <meta property="og:url" content={url} />
        <meta
          key="og:description"
          property="og:description"
          content={description}
        />

        <meta key="twitter:title" name="twitter:title" content={title} />
        <meta
          key="twitter:description"
          name="twitter:description"
          content={description}
        />
        <meta property="twitter:domain" content="redactle.vercel.app" />
        <meta property="twitter:url" content={url} />
        <meta name="twitter:creator" content="@xperki" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={imageAlt} />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <UserManager>
        <Navbar onShowSettingsModal={handleShowSettingsModal} />

        <SettingsManager>
          {children}

          <SettingsModal
            open={showSettingsModal}
            onClose={handleCloseSettingsModal}
          />
          <IntroductionModal />
        </SettingsManager>
      </UserManager>
    </>
  );
};

export default Layout;
