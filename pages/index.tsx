import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Game from "../components/game";
import Navbar from "../components/navbar";
import InfoModal from "../components/infoModal";

const Home: NextPage = () => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleShowInfoModal = () => {
    setShowInfoModal(true);
  };

  const handleCloseInfoModal = () => {
    setShowInfoModal(false);
  };

  return (
    <>
      <Head>
        <title>Caviardeul</title>
        <meta name="description" content="Un jeu de réflexion quotidien" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar onShowInfoModal={handleShowInfoModal} />
      <Game />
      <footer>Footer</footer>

      <InfoModal open={showInfoModal} onClose={handleCloseInfoModal} />
    </>
  );
};

export default Home;
