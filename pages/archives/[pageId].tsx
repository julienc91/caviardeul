import React, { useEffect, useMemo, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import Game from "../../components/game";
import { getEncodedArticle } from "../../hooks/article";
import { EncodedArticle, ScoreHistory } from "../../types";
import { decodeArticle } from "../../utils/encryption";
import SaveManagement from "../../utils/save";
import Loader from "../../components/loader";
import { useRouter } from "next/router";

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

  return <Game article={article} custom={false} {...props} />;
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
