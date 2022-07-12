import React from "react";
import type { GetServerSideProps, NextPage } from "next";
import Game from "../components/game";
import { getEncodedArticle } from "../hooks/article";
import { EncodedArticle } from "../types";
import { decodeArticle } from "../utils/encryption";

const Home: NextPage<{ encodedArticle: EncodedArticle }> = ({
  encodedArticle,
  ...props
}) => {
  const article = decodeArticle(encodedArticle);
  return <Game article={article} {...props} />;
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const encodedArticle = await getEncodedArticle();
  return {
    props: { encodedArticle },
  };
};
