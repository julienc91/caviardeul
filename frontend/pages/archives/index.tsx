import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";

import ConfirmModal from "@caviardeul/components/modals/confirmModal";
import Modal from "@caviardeul/components/modals/modal";
import { ArticleInfo, ArticleInfoStats } from "@caviardeul/types";
import { API_URL, BASE_URL } from "@caviardeul/utils/config";
import SaveManagement from "@caviardeul/utils/save";

const Difficulty: React.FC<{ stats: ArticleInfoStats }> = ({ stats }) => {
  const { category, median } = stats;
  return (
    <div className="article-difficulty" title={`${median} coups en moyenne`}>
      {[0, 1, 2, 3, 4].map((level) => (
        <span
          key={level}
          className={
            `difficulty level-${level}` + (category >= level ? " active" : "")
          }
        />
      ))}
    </div>
  );
};

type SortType = "id" | "median" | "userScore";

const SortSelection: React.FC<{
  sortBy: SortType;
  sortOrder: boolean;
  onChange: (value: SortType) => void;
}> = ({ sortBy, sortOrder, onChange }) => {
  return (
    <>
      <label>
        Trier
        <select
          value={sortBy}
          onChange={({ target: { value } }) => {
            onChange(value as SortType);
          }}
        >
          <option value="id">Date</option>
          <option value="median">Difficulté</option>
          <option value="userScore">Mon score</option>
        </select>
      </label>
      <button onClick={() => onChange(sortBy)}>
        {sortOrder ? <FaSortAmountDown /> : <FaSortAmountUp />}
      </button>
    </>
  );
};

type FilterType = "finished" | "not_finished" | "all";

const FilterSelection: React.FC<{
  filterBy: FilterType;
  onChange: (value: FilterType) => void;
}> = ({ filterBy, onChange }) => {
  return (
    <div className="filter-selection">
      <label>
        Fitrer
        <select
          value={filterBy}
          onChange={({ target: { value } }) => {
            onChange(value as FilterType);
          }}
        >
          <option value="all">Tous</option>
          <option value="not_finished">À faire</option>
          <option value="finished">Terminés</option>
        </select>
      </label>
    </div>
  );
};

const SynchronizationModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [reveal, setReveal] = useState<boolean>(false);
  const userId = getCookie("userId");
  const url = `${BASE_URL}/login?user=${userId}`;
  return (
    <Modal className="sync-modal" open={open} onClose={onClose}>
      <h1>Synchronisation entre appareils</h1>

      <p>
        Si vous jouez à Caviardeul sur plusieurs appareils à la fois, vous
        pouvez les synchroniser pour retrouver vos scores et votre progression
        sur chacun d&apos;entre eux.
      </p>

      <p>
        Notez tout de même que l&apos;historique de vos essais n&apos;est pas
        synchronisé, vous ne pourrez donc pas commencer une partie sur un
        appareil puis la reprendre où vous l&apos;aviez laissée sur un second.
      </p>

      <p>
        Pour commencer la synchronisation, utilisez le lien suivant depuis votre
        second appareil&nbsp;:
      </p>
      <div className="button-input">
        <button onClick={() => setReveal(!reveal)}>
          {reveal ? <FaEyeSlash /> : <FaEye />}
        </button>
        <input value={url} type={reveal ? "text" : "password"} readOnly />
      </div>
      <p>Ou scannez ce QR Code&nbsp;:</p>
      <div className="qr-code">
        {!reveal && (
          <div className="mask" onClick={() => setReveal(true)}>
            <FaEye />
          </div>
        )}
        <QRCodeSVG value={url} />
      </div>

      <p>
        <strong>Attention&nbsp;:</strong> Ce lien et ce code sont spécifiques à
        votre compte, ne les partagez pas&nbsp;!
      </p>
    </Modal>
  );
};

const Archives: React.FC<{ articles: ArticleInfo[] }> = ({ articles }) => {
  const [sortBy, setSortBy] = useState<SortType>("id");
  const [sortOrder, setSortOrder] = useState<boolean>(false);
  const [filterBy, setFilterBy] = useState<FilterType>("all");
  const [reset, setReset] = useState<boolean>(false);
  const [showSynchronizationModal, setShowSynchronizationModal] =
    useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>();

  const title = "Caviardeul - Archives";

  const displayArticles = useMemo(
    () =>
      articles
        .slice(1)
        .filter(
          (article) =>
            filterBy === "all" ||
            (filterBy === "not_finished" && !article.userScore) ||
            (filterBy === "finished" && !!article.userScore),
        )
        .sort((a, b) => {
          let sortValue = 0;
          if (sortBy === "median") {
            sortValue = a.stats.median - b.stats.median;
          } else if (sortBy === "userScore") {
            sortValue =
              (a?.userScore?.nbAttempts ?? 0) - (b?.userScore?.nbAttempts ?? 0);
          } else if (sortBy === "id") {
            sortValue = a.articleId - b.articleId;
          }

          if (sortValue === 0) {
            sortValue = a.articleId - b.articleId;
          } else {
            sortValue *= sortOrder ? 1 : -1;
          }
          return sortValue;
        })
        .map((article) =>
          reset
            ? {
                articleId: article.articleId,
                stats: article.stats,
              }
            : article,
        ),
    [articles, sortBy, sortOrder, filterBy, reset],
  );

  const nbGames = articles.length;
  const finishedGames = articles.filter(
    (articleInfo) => !!articleInfo.userScore,
  );
  const nbFinishedGames = finishedGames.length;

  const avgTrials = useMemo(
    () =>
      Math.floor(
        finishedGames.reduce(
          (acc, { userScore }) => acc + (userScore?.nbAttempts || 0),
          0,
        ) / Math.max(nbFinishedGames, 1),
      ),
    [finishedGames, nbFinishedGames],
  );
  const avgAccuracy = useMemo(
    () =>
      Math.floor(
        finishedGames.reduce(
          (acc, { userScore }) =>
            acc +
            ((userScore?.nbCorrect || 0) * 100) /
              Math.max(userScore?.nbAttempts || 0, 1),
          0,
        ) / Math.max(nbFinishedGames, 1),
      ),
    [finishedGames, nbFinishedGames],
  );

  useEffect(() => {
    if (getCookie("userId")) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleReset = useCallback(() => {
    SaveManagement.clearProgress(true, true, true);
    setReset(true);
    setIsLoggedIn(false);
    setShowConfirmModal(false);
    setShowSynchronizationModal(false);
  }, [setReset]);

  const handleSortByChanged = useCallback(
    (value: SortType) => {
      let newSortOrder;
      if (value === sortBy) {
        newSortOrder = !sortOrder;
      } else {
        setSortBy(value);
        newSortOrder = false;
      }
      setSortOrder(newSortOrder);
    },
    [sortOrder, sortBy],
  );

  const handleFilterByChanged = useCallback(
    (filterBy: FilterType) => setFilterBy(filterBy),
    [],
  );

  const gamesContainer = displayArticles.map((articleInfo) => {
    const isOver = !!articleInfo.userScore;

    let container = (
      <div
        className={"archive-item" + (isOver ? " completed" : "")}
        key={articleInfo.articleId}
      >
        <div className="archive-info">
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
                    Math.max(articleInfo.userScore.nbAttempts, 1),
                )}
                %
              </span>
            </>
          ) : (
            <span>► Jouer</span>
          )}
        </div>
        {<Difficulty stats={articleInfo.stats} />}
      </div>
    );

    if (!isOver) {
      container = (
        <Link
          href={`/archives/${articleInfo.articleId}`}
          key={articleInfo.articleId}
          prefetch={false}
        >
          {container}
        </Link>
      );
    }
    return container;
  });

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta key="og:title" property="og:title" content={title} />
        <meta key="twitter:title" name="twitter:title" content={title} />
      </Head>
      <main id="archives">
        <div className="left-container">
          <h1>Archives</h1>

          <div className="list-filters">
            <FilterSelection
              filterBy={filterBy}
              onChange={handleFilterByChanged}
            />
            <SortSelection
              sortBy={sortBy}
              sortOrder={sortOrder}
              onChange={handleSortByChanged}
            />
          </div>

          <div className="archive-grid">{gamesContainer}</div>

          {displayArticles.length === 0 && (
            <div className="empty-state">
              {filterBy === "finished" && (
                <div>
                  Vous n&apos;avez terminé aucune partie archivée, c&apos;est le
                  moment de commencer&nbsp;!
                </div>
              )}
              {filterBy === "not_finished" && (
                <div>
                  Félicitations, vous avez terminé toutes les parties
                  archivées&nbsp;!
                </div>
              )}
            </div>
          )}
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

          {isLoggedIn && (
            <>
              <div>
                <h3>Vous jouez sur plusieurs appareils&nbsp;?</h3>
                <button
                  className="action"
                  onClick={() => setShowSynchronizationModal(true)}
                >
                  Synchroniser un appareil
                </button>
                <SynchronizationModal
                  open={showSynchronizationModal}
                  onClose={() => setShowSynchronizationModal(false)}
                />
              </div>

              <div className="separator" />
              <div className="reset-account">
                <button
                  className="danger"
                  onClick={() => setShowConfirmModal(true)}
                >
                  Réinitialiser
                </button>
                <ConfirmModal
                  message={
                    <>
                      Cette action réinitialisera vos scores et votre
                      progression de manière irréversible.
                      <br />
                      Voulez-vous continuer&nbsp;?
                    </>
                  }
                  open={showConfirmModal}
                  danger={true}
                  confirmLabel="Confirmer"
                  onConfirm={handleReset}
                  onCancel={() => setShowConfirmModal(false)}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Archives;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  console.log("XXXXXX", req.cookies);
  console.log("YYYYYY", req.headers.cookie);
  const response = await fetch(`${API_URL}/articles`, {
    credentials: "include",
    headers: {
      Cookie: req.headers.cookie ?? "",
    },
  });
  const articles = await response.json();
  return {
    props: {
      articles: articles.reverse(),
    },
  };
};
