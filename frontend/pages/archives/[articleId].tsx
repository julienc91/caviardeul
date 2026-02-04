import type { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useMemo } from "react";

import Game from "@caviardeul/components/game/game";
import CustomError from "@caviardeul/components/utils/error";
import { getEncodedArticle } from "@caviardeul/lib/article";
import { APIError, isAPIError } from "@caviardeul/lib/queries";
import { EncodedArticle } from "@caviardeul/types";
import { decodeArticle } from "@caviardeul/utils/encryption";
import { SinglePlayerStrategy } from "@caviardeul/components/game/strategies/singlePlayerStrategy";

const ArchiveGame: React.FC<{
  encodedArticle: EncodedArticle | null;
  error?: APIError;
}> = ({ encodedArticle, error, ...props }) => {
  if (!encodedArticle) {
    return <CustomError statusCode={error!.status} text={error!.details} />;
  }

  const article = decodeArticle(encodedArticle);
  const strategy = useMemo(() => new SinglePlayerStrategy(), []);
  const title = `Caviardeul - Déchiffrez le Caviardeul n°${article.articleId}`;
  return (
    <>
      <Head>
        <title key="title">{title}</title>
        <meta key="og:title" property="og:title" content={title} />
      </Head>
      <Game article={article} strategy={strategy} {...props} />
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
  let encodedArticle = null;
  try {
    encodedArticle = await getEncodedArticle(articleId, false, userId);
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
  if (userScore) {
    return { redirect: { permanent: false, destination: "/archives" } };
  }

  return {
    props: { encodedArticle },
  };
};
