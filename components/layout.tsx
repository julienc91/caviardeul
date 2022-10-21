import Head from "next/head";
import React, { useCallback, useState } from "react";

import IntroductionModal from "@caviardeul/components/introductionModal";
import Navbar from "@caviardeul/components/navbar";
import SettingsManager from "@caviardeul/components/settingsManager";
import SettingsModal from "@caviardeul/components/settingsModal";
import UserManager from "@caviardeul/components/userManager";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleShowSettingsModal = useCallback(() => {
    setShowSettingsModal(true);
  }, []);

  const handleCloseSettingsModal = useCallback(() => {
    setShowSettingsModal(false);
  }, []);

  return (
    <>
      <Head>
        <title>רדקטעל - מחשק פענוח מאמר ויקיפדיה יומי</title>
        <meta
          name="description"
          content="כל יום, מאמר חדש בוויקיפדיה לפענוח"
        />
        <meta name="author" content="@julienc91" />

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
