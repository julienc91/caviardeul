import { deleteCookie, getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";

import ConfirmModal from "@caviardeul/components/confirmModal";
import { ArticleInfo } from "@caviardeul/types";
import { BASE_URL } from "@caviardeul/utils/config";
import SaveManagement from "@caviardeul/utils/save";

const Archives: React.FC<{ articles: ArticleInfo[] }> = ({ articles }) => {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const nbGames = articles.length;
  const finishedGames = articles.filter(
    (articleInfo) => !!articleInfo.userScore
  );
  const nbFinishedGames = finishedGames.length;

  const avgTrials = useMemo(
    () =>
      Math.floor(
        finishedGames.reduce(
          (acc, { userScore }) => acc + (userScore?.nbAttempts || 0),
          0
        ) / Math.max(nbFinishedGames, 1)
      ),
    [finishedGames, nbFinishedGames]
  );
  const avgAccuracy = useMemo(
    () =>
      Math.floor(
        finishedGames.reduce(
          (acc, { userScore }) =>
            acc +
            ((userScore?.nbCorrect || 0) * 100) /
              Math.max(userScore?.nbAttempts || 0, 1),
          0
        ) / Math.max(nbFinishedGames, 1)
      ),
    [finishedGames, nbFinishedGames]
  );

  const handleShowConfirmModal = useCallback(
    () => setShowConfirmModal(true),
    []
  );
  const handleCloseConfirmModal = useCallback(
    () => setShowConfirmModal(false),
    []
  );

  const handleReset = useCallback(() => {
    SaveManagement.clearHistory();
    SaveManagement.clearProgress();
    deleteCookie("userId");
    handleCloseConfirmModal();
  }, [handleCloseConfirmModal]);

  const gamesContainer = articles.map((articleInfo, i) => {
    const isOver = !!articleInfo.userScore;
    const url = i === 0 ? "/" : `/archives/${articleInfo.articleId}`;

    let container = (
      <div
        className={"archive-item" + (isOver ? " completed" : "")}
        key={articleInfo.articleId}
      >
        <h3>
          N°{articleInfo.articleId} - {isOver ? articleInfo.pageName : "?"}
        </h3>
        {isOver && !!articleInfo.userScore ? (
          <>
            <span>Essais&nbsp;: {articleInfo.userScore.nbAttempts}</span>
            <span>
              Précision&nbsp;:{" "}
              {Math.floor(
                (articleInfo.userScore.nbCorrect * 100) /
                  Math.max(articleInfo.userScore.nbAttempts, 1)
              )}
              %
            </span>
          </>
        ) : (
          <span>► Jouer</span>
        )}
      </div>
    );

    if (!isOver) {
      container = (
        <Link href={url} key={i}>
          {container}
        </Link>
      );
    }
    return container;
  });

  return (
    <>
      <Head>
        <title>Caviardeul - Archives</title>
      </Head>
      <main id="archives">
        <div className="left-container">
          <h1>Archives</h1>
          <div className="archive-grid">{gamesContainer}</div>
        </div>
        <div className="right-container">
          <h1>Score</h1>

          <ul>
            <li>
              Parties terminées&nbsp;: {nbFinishedGames}/{nbGames} (
              {Math.floor((nbFinishedGames * 100) / Math.max(nbGames, 1))}%)
            </li>
            <li>Nombre d&apos;essais moyen&nbsp;: {avgTrials}</li>
            <li>Précision moyenne&nbsp;: {avgAccuracy}%</li>
          </ul>

          <button className="danger" onClick={handleShowConfirmModal}>
            Réinitialiser
          </button>
          <ConfirmModal
            message={
              <>
                Cette action réinitialisera vos scores et votre progression de
                manière irréversible.
                <br />
                Voulez-vous continuer&nbsp;?
              </>
            }
            open={showConfirmModal}
            danger={true}
            confirmLabel="Confirmer"
            onConfirm={handleReset}
            onCancel={handleCloseConfirmModal}
          />
        </div>
      </main>
    </>
  );
};

export default Archives;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const userId = getCookie("userId", { req, res }) || "";
  const response = await fetch(`${BASE_URL}/api/articles`, {
    headers: {
      Cookie: `userId=${userId}`,
    },
  });
  const articles = await response.json();
  return {
    props: {
      articles: articles.reverse(),
    },
  };
};
