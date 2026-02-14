import { describe, expect, it } from "vitest";

import { GameHistory } from "@caviardeul/types";
import { getSelectedWord } from "@caviardeul/utils/game";

describe("getSelectedWord", () => {
  const history: GameHistory = [
    ["tour", 3],
    ["eiffel", 2],
    ["paris", 0],
  ];

  it("returns the word if it exists in history", () => {
    expect(getSelectedWord("tour", history)).toBe("tour");
    expect(getSelectedWord("eiffel", history)).toBe("eiffel");
  });

  it("returns the word itself if not in history and no suffix match", () => {
    expect(getSelectedWord("france", history)).toBe("france");
  });

  it("returns the base word when a suffix variant matches history", () => {
    // "tours" ends with "s", and "tour" is in history
    expect(getSelectedWord("tours", history)).toBe("tour");
    expect(getSelectedWord("toure", history)).toBe("tour");
    expect(getSelectedWord("toures", history)).toBe("tour");
  });

  it("returns the word itself when suffix removal does not match history", () => {
    expect(getSelectedWord("frances", history)).toBe("frances");
  });

  it("handles empty history", () => {
    expect(getSelectedWord("tour", [])).toBe("tour");
  });

  it("does not strip suffix if word equals suffix", () => {
    // "s" is a suffix, but word "s" should not become ""
    const historyWithEmpty: GameHistory = [["", 0]];
    expect(getSelectedWord("s", historyWithEmpty)).toBe("s");
  });
});
