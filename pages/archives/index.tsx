import React, { useCallback, useEffect, useMemo, useState } from "react";
import { firstGameDate } from "../../utils/config";
import SaveManagement from "../../utils/save";
import { ScoreHistory } from "../../types";
import Link from "next/link";
import { GetStaticProps } from "next";

const Archives: React.FC = () => {
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const now = new Date();
  const diff = now.getTime() - firstGameDate.getTime();
  const nbGames = Math.floor(diff / (1000 * 3600 * 24));

  useEffect(() => {
    setHistory(SaveManagement.loadHistory());
  }, []);

  const handleReset = useCallback(() => {
    SaveManagement.clearHistory();
    setHistory([]);
  }, []);

  const finishedGames = useMemo(() => {
    return history
      .filter(({ isOver }) => isOver)
      .reduce((acc: { [id: number]: ScoreHistory }, item) => {
        acc[item.puzzleId] = item;
        return acc;
      }, {});
  }, [history]);

  const gamesContainer = [];
  for (let i = nbGames; i >= 1; i--) {
    const scoreHistory = finishedGames[i];
    const isOver = scoreHistory?.isOver ?? false;
    const url = `/archives/${i}`;

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
          <span>
            <Link href={`/archives/${i}`}>► Jouer</Link>
          </span>
        )}
      </div>
    );

    if (!isOver) {
      container = <Link href={url}>{container}</Link>;
    }
    gamesContainer.push(container);
  }

  return (
    <main id="archives">
      <h1>Archives</h1>
      <div className="archive-grid">{gamesContainer}</div>
      <button className="danger" onClick={handleReset}>
        Réinitialiser
      </button>
    </main>
  );
};

export default Archives;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
