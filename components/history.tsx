import React from "react";
import { History } from "../types";

const HistoryContainer: React.FC<{ history: History }> = ({ history }) => {
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
              return (
                <tr key={i}>
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
