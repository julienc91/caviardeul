import { deleteCookie, getCookie } from "cookies-next/client";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { QRCodeSVG } from "qrcode.react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";

import ConfirmModal from "@caviardeul/components/modals/confirmModal";
import Modal from "@caviardeul/components/modals/modal";
import Loader from "@caviardeul/components/utils/loader";
import { getUserDailyArticleStats } from "@caviardeul/lib/queries";
import {
  ArticleInfo,
  ArticleInfoStats,
  DailyArticleStats,
} from "@caviardeul/types";
import { API_URL, BASE_URL } from "@caviardeul/utils/config";
import SaveManagement from "@caviardeul/utils/save";

const Difficulty: React.FC<{ stats: ArticleInfoStats }> = ({ stats }) => {
  const { category, median } = stats;
  const display = median >= 10 ? `${median}` : "Moins de 10";
  return (
    <div className="article-difficulty" title={`${display} coups en moyenne`}>
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

type SortType = "date" | "difficulty" | "score";

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
          <option value="date">Date</option>
          <option value="difficulty">Difficulté</option>
          <option value="score">Mon score</option>
        </select>
      </label>
      <button onClick={() => onChange(sortBy)}>
        {sortOrder ? <FaSortAmountUp /> : <FaSortAmountDown />}
      </button>
    </>
  );
};

type FilterType = "finished" | "not_finished" | "";

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
          <option value="">Tous</option>
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

const ArticleCard: React.FC<{ articleInfo: ArticleInfo }> = ({
  articleInfo,
}) => {
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
};

const arrayEqual = (arr1: any[], arr2: any[]): boolean => {
  if (arr1.length != arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

const fetchArticles = async (
  order: SortType,
  asc: boolean,
  status: FilterType,
  offset: number = 0,
  limit: number = 50,
) => {
  const urlParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    order: order,
    asc: asc.toString(),
    status,
  });
  const response = await fetch(`${API_URL}/articles?` + urlParams.toString());
  const data = await response.json();
  return data.items;
};

const ArticleList: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [sortOrder, setSortOrder] = useState<boolean>(false);
  const [filterBy, setFilterBy] = useState<FilterType>("");
  const [articleList, setArticleList] = useState<ArticleInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const params = useRef<any[]>([]);
  const observerTarget = useRef<HTMLDivElement>(null);

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

  const fetchNextPage = useCallback(async () => {
    if (loading || !hasMore) {
      return;
    }

    setLoading(true);
    const articles = await fetchArticles(
      sortBy,
      sortOrder,
      filterBy,
      articleList.length,
    );
    const queryParams = [filterBy, sortBy, sortOrder];
    if (arrayEqual(queryParams, params.current)) {
      setArticleList([...articleList, ...articles]);
      if (!articles.length) {
        setHasMore(false);
      }
    }
    setLoading(false);
  }, [loading, hasMore, articleList, sortBy, sortOrder, filterBy]);

  useEffect(() => {
    const target = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 },
    );

    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [observerTarget, fetchNextPage]);

  useEffect(() => {
    const newParams = [filterBy, sortBy, sortOrder];
    if (!arrayEqual(newParams, params.current)) {
      params.current = newParams;
      setHasMore(true);
      setLoading(true);
      setArticleList([]);
      (async () => {
        const articles = await fetchArticles(sortBy, sortOrder, filterBy);
        if (arrayEqual(newParams, params.current)) {
          setArticleList(articles);
        }
        setLoading(false);
      })();
    }
  }, [articleList, filterBy, sortBy, sortOrder]);

  const gamesContainer = articleList.map((articleInfo) => (
    <ArticleCard key={articleInfo.articleId} articleInfo={articleInfo} />
  ));

  return (
    <div>
      <div className="list-filters">
        <FilterSelection filterBy={filterBy} onChange={handleFilterByChanged} />
        <SortSelection
          sortBy={sortBy}
          sortOrder={sortOrder}
          onChange={handleSortByChanged}
        />
      </div>
      {articleList.length === 0 && !loading ? (
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
      ) : (
        <>
          <div className="archive-grid">{gamesContainer}</div>
          {loading && <Loader />}
          <div ref={observerTarget} />
        </>
      )}
    </div>
  );
};

const Archives: React.FC<{ userStats: DailyArticleStats }> = ({
  userStats,
}) => {
  const [showSynchronizationModal, setShowSynchronizationModal] =
    useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>();
  const router = useRouter();

  const title = "Caviardeul - Archives";

  const nbGames = userStats.total;
  const nbFinishedGames = userStats.totalFinished;

  const avgTrials = userStats.averageNbAttempts;
  const avgAccuracy = Math.round(
    (100 * userStats.averageNbCorrect) /
      Math.max(userStats.averageNbAttempts, 1),
  );

  useEffect(() => {
    if (getCookie("userId")) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleReset = useCallback(() => {
    SaveManagement.clearProgress(true, true, true);
    setIsLoggedIn(false);
    setShowConfirmModal(false);
    setShowSynchronizationModal(false);
    deleteCookie("userId");
    router.reload();
  }, [router]);

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

          <ArticleList />
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
  const { userId } = req.cookies;
  const userStats = await getUserDailyArticleStats(userId);
  return {
    props: { userStats },
  };
};
