import React from "react";

import ArticleContainer from "@caviardeul/components/game/article";
import AttemptHistory from "@caviardeul/components/game/attemptHistory";
import GameInformation from "@caviardeul/components/game/gameInformation";
import Input from "@caviardeul/components/game/input";
import Manager from "@caviardeul/components/game/manager";
import { Article } from "@caviardeul/types";

const Game: React.FC<{
  article: Article;
  userScore?: { nbAttempts: number; nbCorrect: number };
}> = ({ article, userScore }) => {
  return (
    <main id="game">
      <Manager article={article} userScore={userScore}>
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
