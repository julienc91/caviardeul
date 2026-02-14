import { afterEach, describe, expect, it, vi } from "vitest";

import { SinglePlayerStrategy } from "@caviardeul/components/game/strategies/singlePlayerStrategy";

import { createArticle } from "../../../helpers/fixtures";

vi.mock("@caviardeul/utils/save", () => ({
  default: {
    loadProgress: vi.fn().mockReturnValue(null),
    saveProgress: vi.fn(),
    getEncryptionKey: vi.fn().mockReturnValue("key"),
  },
}));

vi.mock("@caviardeul/lib/queries", () => ({
  saveGameScore: vi.fn().mockResolvedValue(undefined),
}));

describe("SinglePlayerStrategy", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with empty state", async () => {
    const strategy = new SinglePlayerStrategy();
    const article = createArticle({
      pageName: "Test",
      content: "<p>Hello world test</p>",
    });
    await strategy.initialize(article);

    const state = strategy.getState();
    expect(state.history).toEqual([]);
    expect(state.revealedWords.size).toBe(0);
    expect(state.selection).toBeNull();
    expect(state.isOver).toBe(false);
  });

  it("returns current player", () => {
    const strategy = new SinglePlayerStrategy();
    const player = strategy.getCurrentPlayer();
    expect(player).toEqual({ id: "local", name: "You" });
  });

  it("canCurrentPlayerPlay returns true when game not over", async () => {
    const strategy = new SinglePlayerStrategy();
    const article = createArticle({
      pageName: "Test",
      content: "<p>A test article</p>",
    });
    await strategy.initialize(article);
    expect(strategy.canCurrentPlayerPlay()).toBe(true);
  });

  it("canCurrentPlayerPlay returns false when game is over", () => {
    const strategy = new SinglePlayerStrategy(true);
    expect(strategy.canCurrentPlayerPlay()).toBe(false);
  });

  describe("makeAttempt", () => {
    it("adds word to history and revealed words", async () => {
      const strategy = new SinglePlayerStrategy();
      const article = createArticle({
        pageName: "Test",
        content: "<p>Hello world test foo</p>",
      });
      await strategy.initialize(article);

      strategy.makeAttempt("hello");

      const state = strategy.getState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0][0]).toBe("hello");
      expect(state.revealedWords.has("hello")).toBe(true);
    });

    it("ignores common words", async () => {
      const strategy = new SinglePlayerStrategy();
      const article = createArticle({
        pageName: "Test",
        content: "<p>Le test</p>",
      });
      await strategy.initialize(article);

      strategy.makeAttempt("le");

      const state = strategy.getState();
      expect(state.history).toHaveLength(0);
    });

    it("does not duplicate already revealed words in history", async () => {
      const strategy = new SinglePlayerStrategy();
      const article = createArticle({
        pageName: "Test",
        content: "<p>Hello world test</p>",
      });
      await strategy.initialize(article);

      strategy.makeAttempt("hello");
      strategy.makeAttempt("hello");

      const state = strategy.getState();
      expect(state.history).toHaveLength(1);
    });

    it("detects game over when title words are revealed", async () => {
      const strategy = new SinglePlayerStrategy();
      const article = createArticle({
        pageName: "Tour",
        content: "<p>La tour Eiffel</p>",
      });
      await strategy.initialize(article);

      strategy.makeAttempt("tour");

      const state = strategy.getState();
      expect(state.isOver).toBe(true);
    });

    it("notifies listeners on state change", async () => {
      const strategy = new SinglePlayerStrategy();
      const article = createArticle({
        pageName: "Test",
        content: "<p>Hello test world</p>",
      });
      await strategy.initialize(article);

      const listener = vi.fn();
      strategy.onStateChange(listener);

      strategy.makeAttempt("hello");

      expect(listener).toHaveBeenCalled();
    });
  });

  describe("updateSelection", () => {
    it("sets selection to the word", async () => {
      const strategy = new SinglePlayerStrategy();
      const article = createArticle({
        pageName: "Test",
        content: "<p>Hello test</p>",
      });
      await strategy.initialize(article);

      // updateSelection on a word not yet attempted
      strategy.updateSelection("hello");

      const state = strategy.getState();
      expect(state.selection).toEqual(["hello", 0]);
    });

    it("increments index on repeated selection", async () => {
      const strategy = new SinglePlayerStrategy();
      const article = createArticle({
        pageName: "Test",
        content: "<p>Hello test</p>",
      });
      await strategy.initialize(article);

      strategy.updateSelection("hello");
      strategy.updateSelection("hello");

      const state = strategy.getState();
      expect(state.selection).toEqual(["hello", 1]);
    });

    it("clears selection with null", async () => {
      const strategy = new SinglePlayerStrategy();
      const article = createArticle({
        pageName: "Test",
        content: "<p>Hello test</p>",
      });
      await strategy.initialize(article);

      strategy.updateSelection("hello");
      strategy.updateSelection(null);

      const state = strategy.getState();
      expect(state.selection).toBeNull();
    });
  });

  describe("onStateChange", () => {
    it("returns unsubscribe function", async () => {
      const strategy = new SinglePlayerStrategy();
      const article = createArticle({
        pageName: "Test",
        content: "<p>Hello test</p>",
      });
      await strategy.initialize(article);

      const listener = vi.fn();
      const unsubscribe = strategy.onStateChange(listener);
      unsubscribe();

      strategy.makeAttempt("hello");
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("loadProgress", () => {
    it("restores history from saved progress", async () => {
      const { default: SaveManagement } = await import(
        "@caviardeul/utils/save"
      );
      vi.mocked(SaveManagement.loadProgress).mockReturnValue([
        ["hello", 1],
        ["world", 2],
      ]);

      const strategy = new SinglePlayerStrategy();
      const article = createArticle({
        pageName: "Test",
        content: "<p>Hello world test</p>",
      });
      await strategy.initialize(article);

      const state = strategy.getState();
      expect(state.history).toHaveLength(2);
      expect(state.revealedWords.has("hello")).toBe(true);
      expect(state.revealedWords.has("world")).toBe(true);
    });
  });
});
