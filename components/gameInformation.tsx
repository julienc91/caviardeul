import Link from "next/link";
import React from "react";

import ExternalLink from "@caviardeul/components/externalLink";
import { History } from "@caviardeul/types";
import { BASE_URL } from "@caviardeul/utils/config";

const GameInformation: React.FC<{
  pageId?: string;
  archive: boolean;
  history: History;
  pageName: string;
  puzzleId: number;
}> = ({ pageId, archive, history, pageName, puzzleId }) => {
  const customGame = !!pageId && !archive;
  const nbTrials = history.length;
  const accuracy = Math.round(
    (history.filter(([_, count]) => count > 0).length / nbTrials) * 100
  );

  const shareSentence = `J'ai déchiffré ${
    customGame ? "ce Caviardeul" : `le Caviardeul n°${puzzleId}`
  } en ${nbTrials} coup${nbTrials > 1 ? "s" : ""}\u00A0!`;
  let shareUrl = `${BASE_URL}/`;
  if (archive) {
    shareUrl += `archives/${pageId}`;
  } else if (customGame) {
    shareUrl += `custom/${pageId}`;
  }
  const shareLink = `https://twitter.com/share?text=${encodeURIComponent(
    shareSentence
  )}&url=${encodeURIComponent(shareUrl)}&hashtags=caviardeul`;

  return (
    <div className="game-information">
      <h2>Bravo&nbsp;!</h2>
      <p>
        Vous avez déchiffré{" "}
        {customGame || archive ? "cet article" : "le Caviardeul du jour"} en{" "}
        {nbTrials} coup{nbTrials > 1 ? "s" : ""} avec une précision de{" "}
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
      {customGame && (
        <p>
          Créez votre nouvelle{" "}
          <Link href="/custom/nouveau" prefetch={false}>
            <a>partie personnalisée</a>
          </Link>
          &nbsp;
        </p>
      )}
      {!customGame && !archive && (
        <p>Revenez demain pour une nouvelle page à déchiffrer&nbsp;!</p>
      )}
    </div>
  );
};

export default GameInformation;
