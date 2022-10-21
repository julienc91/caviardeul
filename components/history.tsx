import React, { useEffect, useRef } from "react";

import { History } from "@caviardeul/types";

const HistoryContainer: React.FC<{
  history: History;
  selectedWord: string | null;
  onSelectionChange: (world: string) => void;
}> = ({ history, selectedWord, onSelectionChange }) => {
  const selectedRow = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    if (selectedRow.current) {
      selectedRow.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [selectedRow, selectedWord]);

  return (
    <div className="guess-history">
      <table>
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>ניחוש</th>
            <th>מופעים</th>
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
                  onClick={() => onSelectionChange(word)}
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

export default HistoryContainer;
