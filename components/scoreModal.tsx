import React, { useCallback, useEffect } from "react";
import SaveManagement from "../utils/save";
import { ScoreHistory } from "../types";

const ScoreModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const [history, setHistory] = React.useState<ScoreHistory>([]);

  useEffect(() => {
    if (open) {
      let history = SaveManagement.loadHistory();
      if (history.length && !history[history.length - 1].isOver) {
        history[history.length - 1].title = "???";
      }
      setHistory(history);
    }
  }, [open, setHistory]);

  const handleClearHistory = useCallback(() => {
    SaveManagement.clearHistory();
    setHistory(SaveManagement.loadHistory);
  }, [setHistory]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-container">
      <div className="modal-background" onClick={onClose} />
      <div className="modal">
        <h1>Vos résultats</h1>

        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th>Essais</th>
              <th>Précision</th>
              <th>Victoire</th>
            </tr>
          </thead>
          <tbody>
            {history
              .reverse()
              .map(({ title, isOver, nbTrials, accuracy }, i) => {
                return (
                  <tr key={i}>
                    <td>{title}</td>
                    <td>{nbTrials}</td>
                    <td>
                      {Math.floor((accuracy * 100) / Math.max(nbTrials, 1))}%
                    </td>
                    <td>{isOver ? "Oui" : "Non"}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <button onClick={handleClearHistory}>Effacer</button>
      </div>
    </div>
  );
};

export default ScoreModal;
