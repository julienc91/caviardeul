import Link from "next/link";
import React, { useContext } from "react";

import { GameContext } from "@caviardeul/components/game/manager";
import ExternalLink from "@caviardeul/components/utils/externalLink";
import ShareAction from "@caviardeul/components/utils/shareAction";

const GameInformation = () => {
  const { article, userScore, isOver, history } = useContext(GameContext);
  if (!isOver || !article) {
    return null;
  }

  const { articleId, archive, custom, pageName } = article;
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
