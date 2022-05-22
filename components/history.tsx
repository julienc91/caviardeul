import React from "react";
import { History } from "../types";

const HistoryContainer: React.FC<{
  history: History;
  selectedWord: string;
  onSelectionChange: (world: string) => void;
}> = ({ history, selectedWord, onSelectionChange }) => {
  return (
    <div className="guess-history">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Essai</th>
            <th>Occurrences</th>
          </tr>
        </thead>
        <tbody>
          {history
            .map(([word, count], i) => {
              const isSelectedWord = word === selectedWord;
              return (
                <tr
                  key={i}
                  className={isSelectedWord ? "selected" : ""}
                  onClick={() => onSelectionChange(word)}
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
