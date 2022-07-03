import React from "react";
import type { GetServerSideProps, NextPage } from "next";
import Game from "../components/game";

const Home: NextPage = () => {
  return <Game />;
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
