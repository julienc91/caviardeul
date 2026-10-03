import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";

import Loader from "@caviardeul/components/utils/loader";
import { PageHeader } from "@caviardeul/components/utils/page";
import { getUserDailyArticleStats } from "@caviardeul/lib/queries";
import {
  ArticleInfo,
  ArticleInfoStats,
  DailyArticleStats,
  StatsCategory,
} from "@caviardeul/types";
import { API_URL } from "@caviardeul/utils/config";

const difficultyLabels: Record<StatsCategory, string> = {
  0: "Très facile",
  1: "Facile",
  2: "Moyen",
  3: "Difficile",
  4: "Très difficile",
};

const Difficulty: React.FC<{ stats: ArticleInfoStats }> = ({ stats }) => {
  const { category } = stats;
  const label = difficultyLabels[category];
  return (
    <div
      className={`article-difficulty level-${category}`}
      title={label}
      aria-label={`Difficulté\u00a0: ${label}`}
      role="img"
    >
      {[0, 1, 2, 3, 4].map((level) => (
        <span
          key={level}
          className={"difficulty" + (category >= level ? " active" : "")}
        />
      ))}
    </div>
  );
};

type SortType = "date" | "difficulty" | "score";
type FilterType = "finished" | "not_finished" | "";

const SegmentedControl = <T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: [T, string][];
  value: T;
  onChange: (_value: T) => void;
  className?: string;
}) => {
  return (
    <div
      className={"segmented-control" + (className ? ` ${className}` : "")}
      role="group"
      aria-label={label}
    >
      {options.map(([optionValue, optionLabel]) => (
        <button
          key={optionValue}
          className={optionValue === value ? "active" : undefined}
          aria-pressed={optionValue === value}
          onClick={() => onChange(optionValue)}
        >
          {optionLabel}
        </button>
      ))}
    </div>
  );
};

const SortSelection: React.FC<{
  sortBy: SortType;
  sortOrder: boolean;
  onChange: (_value: SortType) => void;
}> = ({ sortBy, sortOrder, onChange }) => {
  const orderLabel = sortOrder ? "Ordre croissant" : "Ordre décroissant";
  return (
    <div className="sort-selection">
      <span className="label">Trier par</span>
      <SegmentedControl<SortType>
        label="Trier par"
        options={[
          ["date", "Date"],
          ["difficulty", "Difficulté"],
          ["score", "Mon score"],
        ]}
        value={sortBy}
        onChange={onChange}
      />
      <button
        className="sort-order"
        onClick={() => onChange(sortBy)}
        title={orderLabel}
        aria-label={orderLabel}
      >
        {sortOrder ? <FaSortAmountUp /> : <FaSortAmountDown />}
      </button>
    </div>
  );
};

const FilterSelection: React.FC<{
  filterBy: FilterType;
  onChange: (_value: FilterType) => void;
}> = ({ filterBy, onChange }) => {
  return (
    <SegmentedControl<FilterType>
      label="Filtrer"
      className="filter-selection"
      options={[
        ["", "Tous"],
        ["not_finished", "À faire"],
        ["finished", "Terminés"],
      ]}
      value={filterBy}
      onChange={onChange}
    />
  );
};

const caviardedRadiuses = [
  "255px 15px 225px 15px/15px 225px 15px 255px",
  "225px 30px 255px 30px/30px 255px 30px 225px",
  "200px 30px 255px 20px/20px 215px 30px 250px",
  "220px 50px 215px 30px/40px 240px 20px 210px",
  "30px 255px 30px 225px/30px 225px 30px 250px",
];

const ArticleCard: React.FC<{ articleInfo: ArticleInfo }> = ({
  articleInfo,
}) => {
  const { articleId, pageName, userScore, stats } = articleInfo;
  const isOver = !!userScore;
  const median = stats.median >= 10 ? `${stats.median}` : "Moins de 10";

  const container = (
    <div className={"archive-item" + (isOver ? " completed" : "")}>
      <div className="archive-item-header">
        <span className="article-id">N°{articleId}</span>
        <Difficulty stats={stats} />
      </div>
      <h3>
        {isOver ? (
          pageName
        ) : (
          <span
            className="caviarded-title"
            style={{
              borderRadius:
                caviardedRadiuses[articleId % caviardedRadiuses.length],
            }}
          >
            ?
          </span>
        )}
      </h3>
      <div className="archive-item-median">
        <span className="value">{median}</span> coups en moyenne
      </div>
      <div className="archive-item-footer">
        {userScore ? (
          <>
            <span>
              Vous&nbsp;: <span className="value">{userScore.nbAttempts}</span>{" "}
              essais
            </span>
            <span>
              <span className="value">
                {Math.floor(
                  (userScore.nbCorrect * 100) /
                    Math.max(userScore.nbAttempts, 1),
                )}
                &nbsp;%
              </span>{" "}
              précision
            </span>
          </>
        ) : (
          <span className="play">► Jouer</span>
        )}
      </div>
    </div>
  );

  if (!isOver) {
    return (
      <Link href={`/archives/${articleId}`} prefetch={false}>
        {container}
      </Link>
    );
  }
  return container;
};

const arrayEqual = (
  arr1: (string | boolean)[],
  arr2: (string | boolean)[],
): boolean => {
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

  const params = useRef<(string | boolean)[]>([]);
  const observerTarget = useRef<HTMLDivElement>(null);
  const initialFetchInProgress = useRef<boolean>(false);

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

  const resetAndFetch = useCallback(
    async (newParams: (string | boolean)[]) => {
      params.current = newParams;
      initialFetchInProgress.current = true;

      // Reset state
      setHasMore(true);
      setLoading(true);
      setArticleList([]);

      // Fetch new data
      const articles = await fetchArticles(sortBy, sortOrder, filterBy);
      if (arrayEqual(newParams, params.current)) {
        setArticleList(articles);
      }
      setLoading(false);
      initialFetchInProgress.current = false;
    },
    [sortBy, sortOrder, filterBy],
  );

  const fetchNextPage = useCallback(async () => {
    if (loading || !hasMore || initialFetchInProgress.current) {
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
      queueMicrotask(() => {
        resetAndFetch(newParams);
      });
    }
  }, [filterBy, sortBy, sortOrder, resetAndFetch]);

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
      {articleList.length === 0 && !loading && filterBy !== "" ? (
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
  const title = "Caviardeul - Archives";

  const nbGames = userStats.total;
  const nbFinishedGames = userStats.totalFinished;
  const percentFinished = Math.floor(
    (nbFinishedGames * 100) / Math.max(nbGames, 1),
  );

  const avgTrials = userStats.averageNbAttempts;
  const avgAccuracy = Math.round(
    (100 * userStats.averageNbCorrect) /
      Math.max(userStats.averageNbAttempts, 1),
  );

  const formatNumber = (value: number) => value.toLocaleString("fr-FR");

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta key="og:title" property="og:title" content={title} />
      </Head>
      <main id="archives" className="page">
        <div className="page-content wide">
          <PageHeader eyebrow="Archives" title="Tous les Caviardeuls">
            <p className="lede">
              {formatNumber(nbGames)} articles déchiffrés jour après jour depuis
              le premier Caviardeul. Rattrapez ceux qui vous ont échappé.
            </p>
          </PageHeader>

          <div className="user-stats">
            <div className="stat finished">
              <div className="stat-label">Parties terminées</div>
              <div className="stat-values">
                <span className="stat-value">
                  {formatNumber(nbFinishedGames)}
                </span>
                <span className="stat-total">/ {formatNumber(nbGames)}</span>
                <span className="stat-percent">{percentFinished}&nbsp;%</span>
              </div>
              <div className="progress">
                <div style={{ width: `${percentFinished}%` }} />
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Essais en moyenne</div>
              <div className="stat-value">{avgTrials}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Précision moyenne</div>
              <div className="stat-value">
                {avgAccuracy}
                <span className="stat-unit">&nbsp;%</span>
              </div>
            </div>
          </div>

          <ArticleList />
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
