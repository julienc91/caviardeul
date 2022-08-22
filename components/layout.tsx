import Head from "next/head";
import React, { useCallback, useState } from "react";

import InfoModal from "@caviardeul/components/infoModal";
import IntroductionModal from "@caviardeul/components/introductionModal";
import Navbar from "@caviardeul/components/navbar";
import SettingsManager from "@caviardeul/components/settingsManager";
import SettingsModal from "@caviardeul/components/settingsModal";
import UserManager from "@caviardeul/components/userManager";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleShowInfoModal = useCallback(() => {
    setShowInfoModal(true);
  }, []);

  const handleCloseInfoModal = useCallback(() => {
    setShowInfoModal(false);
  }, []);

  const handleShowSettingsModal = useCallback(() => {
    setShowSettingsModal(true);
  }, []);

  const handleCloseSettingsModal = useCallback(() => {
    setShowSettingsModal(false);
  }, []);

  return (
    <>
      <Head>
        <title>Caviardeul - Déchiffrez l&apos;article Wikipédia du jour</title>
        <meta
          name="description"
          content="Chaque jour, un nouvel article Wikipédia à déchiffrer"
        />
        <meta name="author" content="@julienc91" />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <UserManager>
        <Navbar
          onShowInfoModal={handleShowInfoModal}
          onShowSettingsModal={handleShowSettingsModal}
        />

        <SettingsManager>
          {children}

          <InfoModal open={showInfoModal} onClose={handleCloseInfoModal} />
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
