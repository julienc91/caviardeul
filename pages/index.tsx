import React from "react";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Game from "../components/game";
import { getEncodedArticle } from "../hooks/article";
import { EncodedArticle } from "../types";
import { decodeArticle } from "../utils/encryption";

const Home: NextPage<{ encodedArticle: EncodedArticle }> = ({
  encodedArticle,
  ...props
}) => {
  const article = decodeArticle(encodedArticle);
  return (
    <>
      <Head>
        <title>Caviardeul - Déchiffrez l&apos;article Wikipédia du jour</title>
      </Head>
      <Game article={article} custom={false} {...props} />
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const encodedArticle = await getEncodedArticle();
  return {
    props: { encodedArticle },
  };
};
