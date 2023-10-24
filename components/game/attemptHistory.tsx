import React, { useContext, useEffect, useRef } from "react";

import { GameContext } from "@caviardeul/components/game/manager";

const AttemptHistory = () => {
  const { isOver, history, selection, updateSelection } =
    useContext(GameContext);
  const selectedRow = useRef<HTMLTableRowElement>(null);
  const selectedWord = selection ? selection[0] : null;

  useEffect(() => {
    if (selectedRow.current) {
      selectedRow.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [selectedRow, selectedWord]);

  if (isOver && !history.length) {
    return null;
  }

  return (
    <div className="guess-history">
      <table>
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>Essai</th>
            <th>Occurrences</th>
          </tr>
        </thead>
        <tbody>
          {history
            .map(([word, count], i) => {
              const isClickable = count > 0;
              const isSelectedWord = word === selectedWord;
              return (
                <tr
                  key={i}
                  className={
                    (isSelectedWord ? "selected " : "") +
                    (isClickable ? "clickable " : "")
                  }
                  onClick={() => updateSelection(word)}
                  ref={isSelectedWord ? selectedRow : null}
                >
                  <td>{i + 1}</td>
                  <td>{word}</td>
                  <td>{count}</td>
                </tr>
              );
            })
            .reverse()}
        </tbody>
      </table>
    </div>
  );
};

export default AttemptHistory;
