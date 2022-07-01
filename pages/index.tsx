import React from "react";
import type { NextPage } from "next";
import Game from "../components/game";

const Home: NextPage = () => {
  return <Game />;
};

export default Home;

export const getStaticProps = async () => {
  return {
    props: {},
  };
};
