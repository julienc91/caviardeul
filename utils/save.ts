import { History, ScoreHistory, Settings } from "@caviardeul/types";
import { decode, encode, generateKey } from "@caviardeul/utils/encryption";

class SaveManagement {
  static getIsTutorialSkipped() {
    return localStorage.getItem("skipTutorial") === "true";
  }

  static setSkipTutorial() {
    localStorage.setItem("skipTutorial", "true");
  }

  static getEncryptionKey(
    generate: boolean = false,
    raise: boolean = true
  ): string {
    let key = localStorage.getItem("key");
    if (!key && generate) {
      key = generateKey();
      localStorage.setItem("key", key);
    } else if (!key && raise) {
      throw new Error("No encryption key found");
    }
    return key ?? "";
  }

  static loadProgress(puzzleId: number, pageId?: string): History | null {
    const isDaily = !pageId;
    const storageKey = isDaily ? "progress" : "custom-game-progress";
    const data = localStorage.getItem(storageKey);
    if (!data) {
      return null;
    }

    try {
      const key = SaveManagement.getEncryptionKey();
      const decryptedData = decode(data, key);
      const {
        history,
        puzzleId: savedPuzzleId,
        pageId: savedPageId,
      } = JSON.parse(decryptedData);

      if (!history || savedPuzzleId !== puzzleId) {
        SaveManagement.clearProgress(isDaily);
        return null;
      }
      if (!isDaily && pageId !== savedPageId) {
        SaveManagement.clearProgress(isDaily);
        return null;
      }
      return history;
    } catch (e) {
      SaveManagement.clearProgress(isDaily);
      return null;
    }
  }

  static saveProgress(
    puzzleId: number,
    history: History,
    pageId?: string
  ): void {
    const isDaily = !pageId;
    const data = {
      puzzleId,
      history,
      pageId: isDaily ? null : pageId,
    };
    const storageKey = isDaily ? "progress" : "custom-game-progress";
    const key = SaveManagement.getEncryptionKey(true);
    const json = JSON.stringify(data);
    const encryptedData = encode(json, key);
    localStorage.setItem(storageKey, encryptedData);
  }

  static loadHistory(): ScoreHistory[] {
    const data = localStorage.getItem("history");
    if (!data) {
      return [];
    }
    try {
      const key = SaveManagement.getEncryptionKey();
      const decryptedData = decode(data, key);
      return (JSON.parse(decryptedData) as ScoreHistory[]) || [];
    } catch (e) {
      SaveManagement.clearHistory();
      return [];
    }
  }

  static saveHistory(
    puzzleId: number,
    title: string,
    history: History,
    isOver: boolean
  ): void {
    const existing = SaveManagement.loadHistory();
    const data = {
      puzzleId,
      title,
      isOver,
      nbTrials: history.length,
      accuracy: history.filter(([_, count]) => count > 0).length,
    };
    if (
      existing.length === 0 ||
      existing[existing.length - 1].puzzleId !== puzzleId
    ) {
      existing.push({
        puzzleId,
        title,
        isOver,
        nbTrials: history.length,
        accuracy: history.filter(([_, count]) => count > 0).length,
      });
    } else {
      existing[existing.length - 1] = data;
    }

    const json = JSON.stringify(existing);
    const encryptionKey = SaveManagement.getEncryptionKey(true);
    const encryptedData = encode(json, encryptionKey);
    localStorage.setItem("history", encryptedData);
  }

  static clearProgress(isDaily: boolean = true): void {
    const storageKey = isDaily ? "progress" : "custom-game-progress";
    localStorage.removeItem(storageKey);
  }

  static clearHistory(): void {
    localStorage.removeItem("history");
  }

  static getSettings(): Settings | null {
    const data = localStorage.getItem("settings");
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  }

  static saveSettings(settings: Settings): void {
    localStorage.setItem("settings", JSON.stringify(settings));
  }
}

export default SaveManagement;
