import { History, Settings } from "@caviardeul/types";
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

  static clearProgress(isDaily: boolean = true): void {
    const storageKey = isDaily ? "progress" : "custom-game-progress";
    localStorage.removeItem(storageKey);
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
