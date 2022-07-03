import React from "react";
import { History } from "../types";
import ExternalLink from "./externalLink";
import { BASE_URL } from "../utils/config";
import Link from "next/link";

const GameInformation: React.FC<{
  customPuzzleId?: string;
  history: History;
  pageName: string;
  puzzleId: number;
}> = ({ customPuzzleId, history, pageName, puzzleId }) => {
  const customGame = !!customPuzzleId;
  const nbTrials = history.length;
  const accuracy = Math.round(
    (history.filter(([_, count]) => count > 0).length / nbTrials) * 100
  );

  const shareSentence = `J'ai déchiffré ${
    customGame ? "ce Caviardeul" : `le Caviardeul n°${puzzleId}`
  } en ${nbTrials} coup${nbTrials > 1 ? "s" : ""}\u00A0!`;
  const shareUrl = BASE_URL + (customGame ? `/custom/${customPuzzleId}` : "/");
  const shareLink = `http://twitter.com/share?text=${encodeURIComponent(
    shareSentence
  )}&url=${encodeURIComponent(shareUrl)}&hashtags=caviardeul`;

  return (
    <div className="game-information">
      <h2>Bravo&nbsp;!</h2>
      <p>
        Vous avez déchiffré{" "}
        {customGame ? "cet article" : "le Caviardeul du jour"} en {nbTrials}{" "}
        coup{nbTrials > 1 ? "s" : ""} avec une précision de {accuracy}%.
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
      {customGame ? (
        <p>
          Créez votre nouvelle{" "}
          <Link href="/custom/nouveau">partie personnalisée</Link>&nbsp;
        </p>
      ) : (
        <p>Revenez demain pour une nouvelle page à déchiffrer&nbsp;!</p>
      )}
    </div>
  );
};

export default GameInformation;
