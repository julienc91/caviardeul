import React from "react";

import ArticleContainer from "@caviardeul/components/game/article";
import AttemptHistory from "@caviardeul/components/game/attemptHistory";
import GameInformation from "@caviardeul/components/game/gameInformation";
import Manager from "@caviardeul/components/game/gameManager";
import Input from "@caviardeul/components/game/input";
import { Article } from "@caviardeul/types";
import { GameStrategy } from "@caviardeul/components/game/strategies/gameStrategy";

const Game: React.FC<{
  article: Article;
  strategy: GameStrategy;
  userScore?: { nbAttempts: number; nbCorrect: number };
}> = ({ article, strategy, userScore }) => {
  return (
    <main id="game">
      <Manager article={article} strategy={strategy} userScore={userScore}>
        <div className="left-container">
          <ArticleContainer />
          <Input />
        </div>
        <div className="right-container">
          <GameInformation />
          <AttemptHistory />
        </div>
      </Manager>
    </main>
  );
};

export default Game;
