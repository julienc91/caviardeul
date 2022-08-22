import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";

import Game from "@caviardeul/components/game";
import { getEncodedArticle } from "@caviardeul/hooks/article";
import { EncodedArticle } from "@caviardeul/types";
import { decodeArticle } from "@caviardeul/utils/encryption";

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
