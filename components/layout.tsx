import React, { useCallback, useState } from "react";
import Head from "next/head";
import Navbar from "./navbar";
import InfoModal from "./infoModal";
import IntroductionModal from "./introductionModal";
import SettingsModal from "./settingsModal";
import SettingsManager from "./settingsManager";

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
        <title>Caviardeul - Déchiffrez l&apos;article du jour</title>
        <meta name="description" content="Un jeu de réflexion quotidien" />
        <meta name="author" content="@julienc91" />

        <link rel="icon" href="/favicon.ico" />
      </Head>

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
    </>
  );
};

export default Layout;
