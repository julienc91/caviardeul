import Link from "next/link";
import React from "react";

import ExternalLink from "@caviardeul/components/utils/externalLink";
import ShareAction from "@caviardeul/components/utils/shareAction";
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
      : history.filter(([_, count]) => count > 0).length / nbTrials) * 100,
  );

  return (
    <div className="game-information">
      <h2>Bravo&nbsp;!</h2>
      <p>
        Vous avez déchiffré{" "}
        {archive || custom ? "cet article" : "le Caviardeul du jour"} en{" "}
        {nbTrials} coup{nbTrials !== 1 ? "s" : ""} avec une précision de{" "}
        {accuracy}%.
      </p>
      <p>
        Voir la page originale{" "}
        <ExternalLink href={`https://fr.wikipedia.org/wiki/${pageName}`}>
          sur Wikipédia
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
          Créez votre nouvelle{" "}
          <Link href="/custom/nouveau" prefetch={false}>
            partie personnalisée
          </Link>
          &nbsp;
        </p>
      )}
      {!custom && !archive && (
        <p>Revenez demain pour une nouvelle page à déchiffrer&nbsp;!</p>
      )}
    </div>
  );
};

export default GameInformation;
