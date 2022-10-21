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
}) => {
  const dailyArticle = encodedArticle ? decodeArticle(encodedArticle) : null;
  return (
    <>
      <Head>
        <title>רדקטעל - מחשק פענוח מאמר ויקיפדיה יומי</title>
      </Head>
      {dailyArticle ? (
        <Game article={dailyArticle} />
      ) : (
        <Error statusCode={500} title="קרתה שגיאה" />
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
