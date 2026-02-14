import { afterEach, describe, expect, it } from "vitest";

import SaveManagement from "@caviardeul/utils/save";

import { createArticle } from "../helpers/fixtures";

describe("SaveManagement", () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe("tutorial", () => {
    it("returns false when skipTutorial is not set", () => {
      expect(SaveManagement.getIsTutorialSkipped()).toBe(false);
    });

    it("returns true after setSkipTutorial", () => {
      SaveManagement.setSkipTutorial();
      expect(SaveManagement.getIsTutorialSkipped()).toBe(true);
    });
  });

  describe("settings", () => {
    it("returns null when no settings saved", () => {
      expect(SaveManagement.getSettings()).toBeNull();
    });

    it("saves and loads settings", () => {
      const settings = { lightMode: true, autoScroll: false };
      SaveManagement.saveSettings(settings);
      expect(SaveManagement.getSettings()).toEqual(settings);
    });
  });

  describe("encryption key", () => {
    it("generates and stores a key when generate=true", () => {
      const key = SaveManagement.getEncryptionKey(true);
      expect(key).toBeTruthy();
      expect(localStorage.getItem("key")).toBe(key);
    });

    it("returns existing key if valid", () => {
      const key = SaveManagement.getEncryptionKey(true);
      const key2 = SaveManagement.getEncryptionKey();
      expect(key2).toBe(key);
    });

    it("throws when no key exists and raise=true", () => {
      expect(() => SaveManagement.getEncryptionKey(false, true)).toThrow();
    });

    it("returns empty string when no key and raise=false", () => {
      expect(SaveManagement.getEncryptionKey(false, false)).toBe("");
    });
  });

  describe("progress", () => {
    it("returns null when no progress saved", () => {
      const article = createArticle();
      expect(SaveManagement.loadProgress(article)).toBeNull();
    });

    it("saves and loads progress for daily article", () => {
      const article = createArticle({ archive: false, custom: false });
      const history: [string, number][] = [
        ["tour", 3],
        ["eiffel", 2],
      ];

      SaveManagement.saveProgress(article, history);
      const loaded = SaveManagement.loadProgress(article);
      expect(loaded).toEqual(history);
    });

    it("saves and loads progress for archive article", () => {
      const article = createArticle({ archive: true, custom: false });
      const history: [string, number][] = [["test", 1]];

      SaveManagement.saveProgress(article, history);
      expect(SaveManagement.loadProgress(article)).toEqual(history);
    });

    it("saves and loads progress for custom article", () => {
      const article = createArticle({
        archive: false,
        custom: true,
        articleId: "custom-id",
      });
      const history: [string, number][] = [["word", 5]];

      SaveManagement.saveProgress(article, history);
      expect(SaveManagement.loadProgress(article)).toEqual(history);
    });

    it("returns null for different articleId", () => {
      const article = createArticle({ articleId: 1 });
      const history: [string, number][] = [["tour", 3]];
      SaveManagement.saveProgress(article, history);

      const otherArticle = createArticle({ articleId: 2 });
      expect(SaveManagement.loadProgress(otherArticle)).toBeNull();
    });

    it("clears progress", () => {
      const daily = createArticle({ archive: false, custom: false });
      const archive = createArticle({ archive: true, custom: false });
      SaveManagement.saveProgress(daily, [["a", 1]]);
      SaveManagement.saveProgress(archive, [["b", 2]]);

      SaveManagement.clearProgress(true, false, false);
      expect(SaveManagement.loadProgress(daily)).toBeNull();
      // archive should still exist
      expect(SaveManagement.loadProgress(archive)).not.toBeNull();
    });
  });

  describe("getProgressStorageKey", () => {
    it("returns 'progress' for daily", () => {
      expect(SaveManagement.getProgressStorageKey(false, false)).toBe(
        "progress",
      );
    });

    it("returns 'archive-game-progress' for archive", () => {
      expect(SaveManagement.getProgressStorageKey(true, false)).toBe(
        "archive-game-progress",
      );
    });

    it("returns 'custom-game-progress' for custom", () => {
      expect(SaveManagement.getProgressStorageKey(false, true)).toBe(
        "custom-game-progress",
      );
    });
  });
});
