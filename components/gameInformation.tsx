import React from "react";
import { History } from "../types";

const GameInformation: React.FC<{ history: History; pageName: string }> = ({
  history,
  pageName,
}) => {
  const nbTrials = history.length;
  const accuracy = Math.round(
    (history.filter(([_, count]) => count > 0).length / nbTrials) * 100
  );
  const shareLink = `http://twitter.com/share?text=${encodeURIComponent(
    "J'ai déchiffré le Caviardeul du jour en " +
      nbTrials +
      " coup" +
      (nbTrials > 1 ? "s" : "") +
      " !"
  )}&url=${encodeURIComponent(
    "https://caviardeul.vercel.app/"
  )}&hashtags=caviardeul`;
  return (
    <div className="game-information">
      <h2>Bravo&nbsp;!</h2>
      <p>
        Vous avez déchiffré la page du jour en {nbTrials} coup
        {nbTrials > 1 ? "s" : ""} avec une précision de {accuracy}%.
      </p>
      <ul>
        <li>
          Voir la page originale{" "}
          <a
            href={`https://fr.wikipedia.org/wiki/${pageName}`}
            target="_blank"
            rel="noreferrer"
          >
            sur Wikipédia
          </a>
        </li>
        <li>
          Partager{" "}
          <a href={shareLink} target="_blank" rel="noreferrer">
            sur Twitter
          </a>
        </li>
      </ul>
    </div>
  );
};

export default GameInformation;
