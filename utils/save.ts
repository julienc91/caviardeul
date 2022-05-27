import { History, ScoreHistory } from "../types";

class SaveManagement {
  static loadProgress(expectedTitle: string): History | null {
    const data = localStorage.getItem("progress");
    if (!data) {
      return null;
    }

    const { history, title } = JSON.parse(data);
    if (!history || !title || title !== expectedTitle) {
      SaveManagement.clearProgress();
      return null;
    }

    return history;
  }

  static saveProgress(title: string, history: History): void {
    const data = {
      title,
      history,
    };
    const json = JSON.stringify(data);
    localStorage.setItem("progress", json);
  }

  static loadHistory(): ScoreHistory {
    const data = localStorage.getItem("history");
    if (!data) {
      return [];
    }
    return JSON.parse(data) || [];
  }

  static saveHistory(title: string, history: History, isOver: boolean): void {
    const existing = SaveManagement.loadHistory();
    const data = {
      title,
      isOver,
      nbTrials: history.length,
      accuracy: history.filter(([_, count]) => count > 0).length,
    };
    if (
      existing.length === 0 ||
      existing[existing.length - 1].title !== title
    ) {
      existing.push({
        title,
        isOver,
        nbTrials: history.length,
        accuracy: history.filter(([_, count]) => count > 0).length,
      });
    } else {
      existing[existing.length - 1] = data;
    }

    const json = JSON.stringify(existing);
    localStorage.setItem("history", json);
  }

  static clearProgress(): void {
    localStorage.removeItem("progress");
  }

  static clearHistory(): void {
    localStorage.removeItem("history");
  }
}

export default SaveManagement;
