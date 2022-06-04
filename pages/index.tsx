import React, { useCallback, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Game from "../components/game";
import Navbar from "../components/navbar";
import InfoModal from "../components/infoModal";
import ScoreModal from "../components/scoreModal";
import IntroductionModal from "../components/introductionModal";
import SettingsModal from "../components/settingsModal";

const Home: NextPage = () => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleShowInfoModal = useCallback(() => {
    setShowInfoModal(true);
  }, []);

  const handleCloseInfoModal = useCallback(() => {
    setShowInfoModal(false);
  }, []);

  const handleShowScoreModal = useCallback(() => {
    setShowScoreModal(true);
  }, []);

  const handleCloseScoreModal = useCallback(() => {
    setShowScoreModal(false);
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
        onShowScoreModal={handleShowScoreModal}
        onShowSettingsModal={handleShowSettingsModal}
      />
      <Game />

      <InfoModal open={showInfoModal} onClose={handleCloseInfoModal} />
      <ScoreModal open={showScoreModal} onClose={handleCloseScoreModal} />
      <SettingsModal
        open={showSettingsModal}
        onClose={handleCloseSettingsModal}
      />
      <IntroductionModal />
    </>
  );
};

export default Home;

export const getStaticProps = async () => {
  return {
    props: {},
  };
};
