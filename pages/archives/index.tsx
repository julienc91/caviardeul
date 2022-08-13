import React, { useCallback, useEffect, useMemo, useState } from "react";
import { firstGameDate } from "../../utils/config";
import SaveManagement from "../../utils/save";
import { ScoreHistory } from "../../types";
import Link from "next/link";
import { GetStaticProps } from "next";
import ConfirmModal from "../../components/confirmModal";

const Archives: React.FC = () => {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const now = new Date();
  const diff = now.getTime() - firstGameDate.getTime();

  const nbGames = Math.floor(diff / (1000 * 3600 * 24)) + 1;

  const finishedGames = useMemo(
    () => history.filter(({ isOver }) => isOver),
    [history]
  );
  const nbFinishedGames = useMemo(() => finishedGames.length, [finishedGames]);

  const avgTrials = useMemo(
    () =>
      Math.floor(
        finishedGames.reduce((acc, { nbTrials }) => acc + nbTrials, 0) /
          Math.max(nbFinishedGames, 1)
      ),
    [finishedGames, nbFinishedGames]
  );
  const avgAccuracy = useMemo(
    () =>
      Math.floor(
        finishedGames.reduce(
          (acc, { accuracy, nbTrials }) =>
            acc + (accuracy * 100) / Math.max(nbTrials, 1),
          0
        ) / Math.max(nbFinishedGames, 1)
      ),
    [finishedGames, nbFinishedGames]
  );

  useEffect(() => {
    setHistory(SaveManagement.loadHistory());
  }, []);

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
    setHistory([]);
    handleCloseConfirmModal();
  }, [handleCloseConfirmModal]);

  const finishedGamesById = useMemo(() => {
    return history
      .filter(({ isOver }) => isOver)
      .reduce((acc: { [id: number]: ScoreHistory }, item) => {
        acc[item.puzzleId] = item;
        return acc;
      }, {});
  }, [history]);

  const gamesContainer = [];
  for (let i = nbGames; i >= 1; i--) {
    const scoreHistory = finishedGamesById[i];
    const isOver = scoreHistory?.isOver ?? false;
    const url = i < nbGames ? `/archives/${i}` : `/`;

    let container = (
      <div className={"archive-item" + (isOver ? " completed" : "")} key={i}>
        <h3>
          N°{i} - {scoreHistory?.isOver ? scoreHistory.title : "?"}
        </h3>
        {scoreHistory?.isOver ? (
          <>
            <span>Essais&nbsp;: {scoreHistory.nbTrials}</span>
            <span>
              Précision&nbsp;:{" "}
              {Math.floor(
                (scoreHistory.accuracy * 100) /
                  Math.max(scoreHistory.nbTrials, 1)
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
    gamesContainer.push(container);
  }

  return (
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
  );
};

export default Archives;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
