import { deleteCookie, getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import ConfirmModal from "@caviardeul/components/confirmModal";
import Modal from "@caviardeul/components/modal";
import { ArticleInfo, ArticleInfoStats } from "@caviardeul/types";
import { getUser } from "@caviardeul/utils/api";
import { BASE_URL } from "@caviardeul/utils/config";
import SaveManagement from "@caviardeul/utils/save";

const Difficulty: React.FC<{ stats: ArticleInfoStats }> = ({ stats }) => {
  const { category, median } = stats;
  return (
    <div className="article-difficulty" title={`${median} חציון ניחושים`}>
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
  onChange: (value: SortType) => void;
}> = ({ sortBy, onChange }) => {
  return (
    <>
      <label>
        מיון 
        <select
          value={sortBy}
          onChange={({ target: { value } }) => {
            onChange(value as SortType);
          }}
        >
          <option value="id">תאריך</option>
          <option value="median">רמת קושי</option>
          <option value="userScore">הניקוד שלי</option>
        </select>
      </label>
      <button onClick={() => onChange(sortBy)}>↑↓</button>
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
        סנן
        <select
          value={filterBy}
          onChange={({ target: { value } }) => {
            onChange(value as FilterType);
          }}
        >
          <option value="all">הכל</option>
          <option value="not_finished">לא הושלמו</option>
          <option value="finished">הושלמו</option>
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
      <h1>סנכרון בין מכשירים</h1>

      <p>
        אם אתם משחקים רדקטעל בכמה מכשירים בו זמנית, ניתן
        לסנכרן אותם כדי לעקוב אחר התוצאות וההתקדמות
        על כל אחד מהם.
      </p>

      <p>
        שימו לב, עם זאת, ההיסטוריה של הניחושים שלכם לא
        מסונכרנת, כך שלא תוכלו להתחיל משחק במכשיר אחד
        ולאחר מכן להמשיך באחר מהמקום שבו הפסקתם.
      </p>

      <p>
       כדי להתחיל בסנכרון השתמשו בקישור הבא במכשיר השני:
        <div className="button-input">
          <button onClick={() => setReveal(!reveal)}>
            {reveal ? <FaEyeSlash /> : <FaEye />}
          </button>
          <input value={url} type={reveal ? "text" : "password"} readOnly />
        </div>
       או סרקו את קוד ה-QR: <br />
        <div className="qr-code">
          {!reveal && (
            <div className="mask" onClick={() => setReveal(true)}>
              <FaEye />
            </div>
          )}
          <QRCodeSVG value={url} />
        </div>
      </p>

      <p>
        <strong>אזהרה:</strong> קישור וקוד זה ספציפיים 
        לחשבון שלכם, אל תשתפו אותם!
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

  const displayArticles = useMemo(
    () =>
      articles
        .slice(1)
        .filter(
          (article) =>
            filterBy === "all" ||
            (filterBy === "not_finished" && !article.userScore) ||
            (filterBy === "finished" && !!article.userScore)
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
            : article
        ),
    [articles, sortBy, sortOrder, filterBy, reset]
  );

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

  useEffect(() => {
    if (getCookie("userId")) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleReset = useCallback(() => {
    SaveManagement.clearProgress(true, true, true);
    deleteCookie("userId");
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
    [sortOrder, sortBy]
  );

  const handleFilterByChanged = useCallback(
    (filterBy: FilterType) => setFilterBy(filterBy),
    []
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
            מספר {articleInfo.articleId} - {isOver ? articleInfo.pageName : "?"}
          </h3>
          {isOver && !!articleInfo.userScore ? (
            <>
              <span>ניחושים: {articleInfo.userScore.nbAttempts}</span>
              <span>
                רמת דיוק:{" "}
                {Math.floor(
                  (articleInfo.userScore.nbCorrect * 100) /
                    Math.max(articleInfo.userScore.nbAttempts, 1)
                )}
                %
              </span>
            </>
          ) : (
            <span>שחק ►</span>
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
        <title>רדקטעל - ארכיון</title>
      </Head>
      <main id="archives">
        <div className="left-container">
          <h1>ארכיון</h1>

          <div className="list-filters">
            <FilterSelection
              filterBy={filterBy}
              onChange={handleFilterByChanged}
            />
            <SortSelection sortBy={sortBy} onChange={handleSortByChanged} />
          </div>

          <div className="archive-grid">{gamesContainer}</div>

          {displayArticles.length === 0 && (
            <div className="empty-state">
              {filterBy === "finished" && (
                <div>
                  טרם השלמת משחק בארכיון, זה הזמן להתחיל!
                </div>
              )}
              {filterBy === "not_finished" && (
                <div>
                  ברכות, השלמת את כל המשחקים בארכיון!
                </div>
              )}
            </div>
          )}
        </div>
        <div className="right-container">
          <h1>ציון</h1>

          <ul>
            <li>
              משחקים שהושלמו: {nbFinishedGames}/{nbGames} (
              {Math.floor((nbFinishedGames * 100) / Math.max(nbGames, 1))}%)
            </li>
            <li>מספר ניחושים ממוצע: {avgTrials}</li>
            <li>רמת דיוק ממוצעת: {avgAccuracy}%</li>
          </ul>

          {isLoggedIn && (
            <>
              <div>
                <h3>משחק על יותר ממכשיר אחד?</h3>
                <button
                  className="action"
                  onClick={() => setShowSynchronizationModal(true)}
                >
                  סנכרן מכשיר נוסף
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
                  אתחול
                </button>
                <ConfirmModal
                  message={
                    <>
                      פעולה זו תאפס את הציונים וההתקדמות והיא בלתי הפיכה.
                      <br />
                      האם אתה רוצה להמשיך?
                    </>
                  }
                  open={showConfirmModal}
                  danger={true}
                  confirmLabel="אשר"
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

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const user = await getUser(req, res);
  const response = await fetch(`${BASE_URL}/api/articles`, {
    headers: user ? { Cookie: `userId=${user.id}` } : {},
  });
  const articles = await response.json();
  return {
    props: {
      articles: articles.reverse(),
    },
  };
};
