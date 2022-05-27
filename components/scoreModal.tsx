import React, { useCallback, useEffect } from "react";
import SaveManagement from "../utils/save";
import { ScoreHistory } from "../types";
import Modal from "./modal";

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      extraButtons={
        <button className="danger" onClick={handleClearHistory}>
          Effacer
        </button>
      }
    >
      <h1>Vos résultats</h1>

      <table>
        <thead>
          <tr>
            <th className="medium-up">&nbsp;</th>
            <th>Article</th>
            <th>Essais</th>
            <th>Précision</th>
            <th>Victoire</th>
          </tr>
        </thead>
        <tbody>
          {history
            .reverse()
            .map(({ puzzleId, title, isOver, nbTrials, accuracy }) => {
              return (
                <tr key={puzzleId}>
                  <td className="medium-up">#{puzzleId}</td>
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
    </Modal>
  );
};

export default ScoreModal;
