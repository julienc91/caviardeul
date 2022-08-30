import type { GetServerSideProps, NextPage } from "next";
import Error from "next/error";
import Head from "next/head";
import React from "react";

import Game from "@caviardeul/components/game";
import { getEncodedArticle } from "@caviardeul/hooks/article";
import { EncodedArticle } from "@caviardeul/types";
import { decodeArticle } from "@caviardeul/utils/encryption";

const Home: NextPage<{ encodedArticle: EncodedArticle | null }> = ({
  encodedArticle,
  ...props
}) => {
  const article = encodedArticle ? decodeArticle(encodedArticle) : "";
  return (
    <>
      <Head>
        <title>Caviardeul - Déchiffrez l&apos;article Wikipédia du jour</title>
      </Head>
      {article ? (
        <Game article={article} custom={false} {...props} />
      ) : (
        <Error statusCode={500} title="Une erreur est survenue" />
      )}
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const encodedArticle = await getEncodedArticle();
    return { props: { encodedArticle } };
  } catch (error) {
    return { props: { encodedArticle: null } };
  }
};
