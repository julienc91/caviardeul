import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";

import Game from "@caviardeul/components/game";
import { getEncodedArticle } from "@caviardeul/hooks/article";
import { EncodedArticle } from "@caviardeul/types";
import { decodeArticle } from "@caviardeul/utils/encryption";

const CustomGame: NextPage<{
  pageId: string;
  encodedArticle: EncodedArticle;
}> = ({ encodedArticle, ...props }) => {
  const article = decodeArticle(encodedArticle);
  return (
    <>
      <Head>
        <title>Caviardeul - Déchiffrez une partie personnalisée</title>
      </Head>
      <Game article={article} custom={true} {...props} />
    </>
  );
};

export default CustomGame;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const pageId = (params?.pageId || "") as string;
  try {
    const data = await getEncodedArticle(pageId, true);
    return { props: { pageId, encodedArticle: data } };
  } catch (error) {
    return { notFound: true };
  }
};
