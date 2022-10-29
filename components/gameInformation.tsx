import Link from "next/link";
import React from "react";

import ExternalLink from "@caviardeul/components/externalLink";
import ShareAction from "@caviardeul/components/shareAction";
import { ArticleId, History } from "@caviardeul/types";

const GameInformation: React.FC<{
  articleId: ArticleId;
  archive: boolean;
  custom: boolean;
  history: History;
  pageName: string;
  userScore?: { nbAttempts: number; nbCorrect: number };
}> = ({ articleId, archive, custom, history, pageName, userScore }) => {
  const nbTrials = userScore?.nbAttempts ?? history.length;
  const accuracy = Math.round(
    (userScore
      ? userScore.nbCorrect / Math.max(userScore.nbAttempts, 1)
      : history.filter(([_, count]) => count > 0).length / nbTrials) * 100
  );

  return (
    <div className="game-information">
      <h2>כל הכבוד!</h2>
      <p>
        פענחת את{" "}
        {archive || custom ? "המאמר" : "הרדקטעל היומי"} {" "}
        {nbTrials !== 1 ? `ב-${nbTrials} ניחושים` : "בניחוש יחיד! "} עם רמת דיוק של {" "}
        {accuracy}%.
      </p>
      <p>
        לדף המקורי{" "}
        <ExternalLink href={`https://he.wikipedia.org/wiki/${pageName}`}>
          בויקיפדיה
        </ExternalLink>
      </p>

      <ShareAction
        articleId={articleId}
        custom={custom}
        archive={archive}
        nbTrials={nbTrials}
      />

      {custom && (
        <p>
          צור{" "}
          <Link href="/custom/nouveau" prefetch={false}>
            משחק מותאם אישית
          </Link>
          &nbsp;
        </p>
      )}
      {!custom && !archive && (
        <p>חזור מחר לאתגר הבא!</p>
      )}
    </div>
  );
};

export default GameInformation;
