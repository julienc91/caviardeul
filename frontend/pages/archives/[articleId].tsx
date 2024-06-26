import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";

import Game from "@caviardeul/components/game/game";
import { getEncodedArticle } from "@caviardeul/lib/article";
import { EncodedArticle } from "@caviardeul/types";
import { decodeArticle } from "@caviardeul/utils/encryption";

const ArchiveGame: NextPage<{
  encodedArticle: EncodedArticle;
}> = ({ encodedArticle, ...props }) => {
  const article = decodeArticle(encodedArticle);
  const title = `Caviardeul - Déchiffrez le Caviardeul n°${article.articleId}`;
  return (
    <>
      <Head>
        <title key="title">{title}</title>
        <meta key="og:title" property="og:title" content={title} />
        <meta key="twitter:title" name="twitter:title" content={title} />
      </Head>
      <Game article={article} {...props} />
    </>
  );
};

export default ArchiveGame;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const { userId } = req.cookies;
  const articleId = parseInt(params?.articleId as string);
  let encodedArticle;
  try {
    encodedArticle = await getEncodedArticle(articleId, false, userId);
  } catch (error) {
    return { notFound: true };
  }

  const { userScore } = encodedArticle;
  if (userScore) {
    return { redirect: { permanent: false, destination: "/archives" } };
  }

  return {
    props: { encodedArticle },
  };
};
