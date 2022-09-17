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

  static getProgressStorageKey(archive: boolean, custom: boolean) {
    if (custom) {
      return "custom-game-progress";
    } else if (archive) {
      return "archive-game-progress";
    } else {
      return "progress";
    }
  }

  static loadProgress(
    articleId: number | string,
    archive: boolean,
    custom: boolean
  ): History | null {
    const storageKey = SaveManagement.getProgressStorageKey(archive, custom);
    const data = localStorage.getItem(storageKey);
    if (!data) {
      return null;
    }

    try {
      const key = SaveManagement.getEncryptionKey();
      const decryptedData = decode(data, key);
      const { articleId: savedArticleId, history } = JSON.parse(decryptedData);

      if (!history || savedArticleId !== articleId) {
        SaveManagement.clearProgress(!archive && !custom, archive, custom);
        return null;
      }
      return history;
    } catch (e) {
      SaveManagement.clearProgress(!archive && !custom, archive, custom);
      return null;
    }
  }

  static saveProgress(
    articleId: number | string,
    history: History,
    archive: boolean,
    custom: boolean
  ): void {
    const data = { articleId, history };
    const storageKey = SaveManagement.getProgressStorageKey(archive, custom);
    const key = SaveManagement.getEncryptionKey(true);
    const json = JSON.stringify(data);
    const encryptedData = encode(json, key);
    localStorage.setItem(storageKey, encryptedData);
  }

  static clearProgress(
    daily: boolean,
    archive: boolean,
    custom: boolean
  ): void {
    const keys = [];
    if (daily) {
      keys.push(SaveManagement.getProgressStorageKey(false, false));
    }
    if (archive) {
      keys.push(SaveManagement.getProgressStorageKey(true, false));
    }
    if (custom) {
      keys.push(SaveManagement.getProgressStorageKey(false, true));
    }
    keys.forEach((key) => localStorage.removeItem(key));
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
