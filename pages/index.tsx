import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Game from "../components/game";
import Navbar from "../components/navbar";
import InfoModal from "../components/infoModal";
import ScoreModal from "../components/scoreModal";

const Home: NextPage = () => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  const handleShowInfoModal = () => {
    setShowInfoModal(true);
  };

  const handleCloseInfoModal = () => {
    setShowInfoModal(false);
  };

  const handleShowScoreModal = () => {
    setShowScoreModal(true);
  };

  const handleCloseScoreModal = () => {
    setShowScoreModal(false);
  };

  return (
    <>
      <Head>
        <title>Caviardeul</title>
        <meta name="description" content="Un jeu de réflexion quotidien" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar
        onShowInfoModal={handleShowInfoModal}
        onShowScoreModal={handleShowScoreModal}
      />
      <Game />

      <InfoModal open={showInfoModal} onClose={handleCloseInfoModal} />
      <ScoreModal open={showScoreModal} onClose={handleCloseScoreModal} />
    </>
  );
};

export default Home;
