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
  userScore?: { nbAttempts: number; nbCorrect: number };
}> = ({ articleId, archive, custom, history, pageName, userScore }) => {
  const nbTrials = userScore?.nbAttempts ?? history.length;
  const accuracy = Math.round(
    (userScore
      ? userScore.nbCorrect / Math.max(userScore.nbAttempts, 1)
      : history.filter(([_, count]) => count > 0).length / nbTrials) * 100
  );

  const shareSentence = `J'ai déchiffré ${
    custom ? "ce Caviardeul" : `le Caviardeul n°${articleId}`
  } en ${nbTrials} coup${nbTrials > 1 ? "s" : ""}\u00A0!`;
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
      <h2>Bravo&nbsp;!</h2>
      <p>
        Vous avez déchiffré{" "}
        {archive || custom ? "cet article" : "le Caviardeul du jour"} en{" "}
        {nbTrials} coup{nbTrials !== 1 ? "s" : ""} avec une précision de{" "}
        {accuracy}%.
      </p>
      <ul>
        <li>
          Voir la page originale{" "}
          <ExternalLink href={`https://fr.wikipedia.org/wiki/${pageName}`}>
            sur Wikipédia
          </ExternalLink>
        </li>
        <li>
          Partager <ExternalLink href={shareLink}>sur Twitter</ExternalLink>
        </li>
      </ul>
      {custom && (
        <p>
          Créez votre nouvelle{" "}
          <Link href="/custom/nouveau" prefetch={false}>
            <a>partie personnalisée</a>
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
