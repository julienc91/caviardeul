import type { GetServerSideProps } from "next";
import React from "react";

import Game from "@caviardeul/components/game/game";
import CustomError from "@caviardeul/components/utils/error";
import { getEncodedArticle } from "@caviardeul/lib/article";
import { APIError, isAPIError } from "@caviardeul/lib/queries";
import { EncodedArticle } from "@caviardeul/types";
import { decodeArticle } from "@caviardeul/utils/encryption";

const Home: React.FC<{
  encodedArticle: EncodedArticle | null;
  userScore?: { nbAttempts: number; nbCorrect: number };
  error?: APIError;
}> = ({ encodedArticle, userScore, error }) => {
  if (!encodedArticle) {
    return <CustomError statusCode={error!.status} text={error!.details} />;
  }

  const article = decodeArticle(encodedArticle);
  return (
    <Game key={article.articleId} article={article} userScore={userScore} />
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { userId } = req.cookies;
  let encodedArticle = null;
  try {
    encodedArticle = await getEncodedArticle(undefined, undefined, userId);
  } catch (error) {
    let apiError;
    if (isAPIError(error)) {
      apiError = error;
    } else {
      apiError = new APIError(500, "Une erreur est survenue");
    }
    return {
      props: {
        encodedArticle,
        error: { status: apiError.status, details: apiError.details },
      },
    };
  }

  const { userScore } = encodedArticle;

  return {
    props: {
      encodedArticle,
      userScore: userScore
        ? { nbAttempts: userScore.nbAttempts, nbCorrect: userScore.nbCorrect }
        : null,
    },
  };
};
