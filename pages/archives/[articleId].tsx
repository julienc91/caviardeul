import { getCookie } from "cookies-next";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";

import Game from "@caviardeul/components/game";
import { getEncodedArticle } from "@caviardeul/hooks/article";
import prismaClient from "@caviardeul/prisma";
import { EncodedArticle } from "@caviardeul/types";
import { decodeArticle } from "@caviardeul/utils/encryption";

const ArchiveGame: NextPage<{
  encodedArticle: EncodedArticle;
}> = ({ encodedArticle, ...props }) => {
  const article = decodeArticle(encodedArticle);
  return (
    <>
      <Head>
        <title>
          Caviardeul - Déchiffrez le Caviardeul n°{article.articleId}
        </title>
      </Head>
      <Game article={article} {...props} />
    </>
  );
};

export default ArchiveGame;

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res,
}) => {
  const articleId = parseInt(params?.articleId as string);
  const userId = (getCookie("userId", { req, res }) || "") as string;

  if (userId !== "") {
    const userScore = await prismaClient.dailyArticleScore.findFirst({
      where: { userId, dailyArticleId: articleId },
    });
    if (userScore) {
      return { redirect: { permanent: false, destination: "/archives" } };
    }
  }

  try {
    const data = await getEncodedArticle(articleId, false);
    return {
      props: { encodedArticle: data },
    };
  } catch (error) {
    return { notFound: true };
  }
};
