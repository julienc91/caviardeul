import type { GetServerSideProps, NextPage } from "next";
import Error from "next/error";
import React from "react";

import Game from "@caviardeul/components/game/game";
import { getEncodedArticle } from "@caviardeul/hooks/article";
import prismaClient from "@caviardeul/prisma";
import { EncodedArticle } from "@caviardeul/types";
import { getUser } from "@caviardeul/utils/api";
import { decodeArticle } from "@caviardeul/utils/encryption";

const Home: NextPage<{
  encodedArticle: EncodedArticle | null;
  userScore?: { nbAttempts: number; nbCorrect: number };
}> = ({ encodedArticle, userScore }) => {
  const dailyArticle = encodedArticle ? decodeArticle(encodedArticle) : null;
  return dailyArticle ? (
    <Game
      key={dailyArticle.articleId}
      article={dailyArticle}
      userScore={userScore}
    />
  ) : (
    <Error statusCode={500} title="Une erreur est survenue" />
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  let encodedArticle;
  try {
    encodedArticle = await getEncodedArticle();
  } catch (error) {
    return { props: { encodedArticle: null } };
  }

  const user = await getUser(req, res);
  let userScore;

  if (user) {
    userScore = await prismaClient.dailyArticleScore.findFirst({
      where: {
        userId: user.id,
        dailyArticleId: encodedArticle.articleId as number,
      },
    });
  }

  return {
    props: {
      encodedArticle,
      userScore: userScore
        ? { nbAttempts: userScore.nbAttempts, nbCorrect: userScore.nbCorrect }
        : null,
    },
  };
};
