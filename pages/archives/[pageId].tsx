import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

import Game from "@caviardeul/components/game";
import Loader from "@caviardeul/components/loader";
import { getEncodedArticle } from "@caviardeul/hooks/article";
import { EncodedArticle, ScoreHistory } from "@caviardeul/types";
import { decodeArticle } from "@caviardeul/utils/encryption";
import SaveManagement from "@caviardeul/utils/save";

const ArchiveGame: NextPage<{
  pageId: string;
  encodedArticle: EncodedArticle | null;
}> = ({ encodedArticle, ...props }) => {
  const [history, setHistory] = useState<ScoreHistory[] | null>(null);
  const router = useRouter();
  const article = encodedArticle ? decodeArticle(encodedArticle) : null;

  useEffect(() => {
    setHistory(SaveManagement.loadHistory());
  }, []);

  useEffect(() => {
    if (!isOver) {
      return;
    }

    const redirect = async () => {
      await router.push("/archives");
    };

    redirect().catch(console.error);
  });

  const isOver = useMemo<boolean>(() => {
    if (!history || !article) {
      return false;
    }
    return (
      history.find(({ puzzleId }) => puzzleId === article.puzzleId)?.isOver ??
      false
    );
  }, [history, article]);

  if (!history || !article || isOver) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>
          Caviardeul - Déchiffrez le Caviardeul n°{article.puzzleId}
        </title>
      </Head>
      <Game article={article} custom={false} {...props} />
    </>
  );
};

export default ArchiveGame;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const pageId = (params?.pageId || "") as string;
  try {
    const data = await getEncodedArticle(pageId, false);
    return { props: { pageId, encodedArticle: data } };
  } catch (error) {}
  return { props: { pageId, encodedArticle: null } };
};
