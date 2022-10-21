import Link from "next/link";
import React from "react";

import ExternalLink from "@caviardeul/components/externalLink";
import { ArticleId, History } from "@caviardeul/types";
import { BASE_URL } from "@caviardeul/utils/config";

const GameInformation: React.FC<{
  articleId: ArticleId;
  archive: boolean;
  custom: boolean;
  history: History;
  pageName: string;
}> = ({ articleId, archive, custom, history, pageName }) => {
  const nbTrials = history.length;
  const accuracy = Math.round(
    (history.filter(([_, count]) => count > 0).length / nbTrials) * 100
  );

  const shareSentence = `פענחתי  ${
    custom ? "רדקטעל" : `את הרדקטעל מספר ${articleId}`
  } ב-${nbTrials} ${nbTrials > 1 ? "ניחושים" : "ניחוש יחיד"}!`;
  let shareUrl = `${BASE_URL}/`;
  if (archive) {
    shareUrl += `archives/${articleId}`;
  } else if (custom) {
    shareUrl += `custom/${articleId}`;
  }
  const shareLink = `https://twitter.com/share?text=${encodeURIComponent(
    shareSentence
  )}&url=${encodeURIComponent(shareUrl)}&hashtags=caviardeul`;

  return (
    <div className="game-information">
      <h2>כל הכבוד!</h2>
      <p>
        פענחת את{" "}
        {archive || custom ? "המאמר" : "הרדקטעל היומי"} ב{"-"}
        {nbTrials} {nbTrials > 1 ? "ניחושים" : "ניחוש יחיד"} עם רמת דיוק של {" "}
        {accuracy}%.
      </p>
      <ul>
        <li>
          לדף המקורי{" "}
          <ExternalLink href={`https://he.wikipedia.org/wiki/${pageName}`}>
            בויקיפדיה
          </ExternalLink>
        </li>
        <li>
          שתף <ExternalLink href={shareLink}>ב-Twitter</ExternalLink>
        </li>
      </ul>
      {custom && (
        <p>
          צור{" "}
          <Link href="/custom/nouveau" prefetch={false}>
            <a>משחק מותאם אישית</a>
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
