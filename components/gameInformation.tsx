import React from "react";
import { History } from "../types";
import ExternalLink from "./externalLink";
import { BASE_URL } from "../utils/config";

const GameInformation: React.FC<{
  history: History;
  pageName: string;
  puzzleId: number;
}> = ({ history, pageName, puzzleId }) => {
  const nbTrials = history.length;
  const accuracy = Math.round(
    (history.filter(([_, count]) => count > 0).length / nbTrials) * 100
  );
  const shareLink = `http://twitter.com/share?text=${encodeURIComponent(
    "J'ai déchiffré le Caviardeul n°" +
      puzzleId +
      " en " +
      nbTrials +
      " coup" +
      (nbTrials > 1 ? "s" : "") +
      "\u00A0!"
  )}&url=${encodeURIComponent(BASE_URL + "/")}&hashtags=caviardeul`;
  return (
    <div className="game-information">
      <h2>Bravo&nbsp;!</h2>
      <p>
        Vous avez déchiffré le Caviardeul du jour en {nbTrials} coup
        {nbTrials > 1 ? "s" : ""} avec une précision de {accuracy}%.
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
      <p>Revenez demain pour une nouvelle page à déchiffrer&nbsp;!</p>
    </div>
  );
};

export default GameInformation;
