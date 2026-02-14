import { describe, expect, it } from "vitest";

import {
  buildAlternatives,
  countOccurrences,
  isCommonWord,
  isSelected,
  isWord,
  splitWords,
  standardizeText,
  stripHtmlTags,
} from "@caviardeul/utils/caviarding";

describe("splitWords", () => {
  it("splits text on punctuation and whitespace", () => {
    expect(splitWords("hello world")).toEqual(["hello", " ", "world"]);
  });

  it("splits on commas and periods", () => {
    expect(splitWords("foo,bar.baz")).toEqual(["foo", ",", "bar", ".", "baz"]);
  });

  it("handles empty string", () => {
    expect(splitWords("")).toEqual([""]);
  });

  it("preserves consecutive separators", () => {
    const result = splitWords("a  b");
    expect(result).toEqual(["a", "  ", "b"]);
  });
});

describe("isWord", () => {
  it("returns true for alphabetic words", () => {
    expect(isWord("hello")).toBe(true);
    expect(isWord("Bonjour")).toBe(true);
  });

  it("returns false for punctuation", () => {
    expect(isWord(",")).toBe(false);
    expect(isWord(".")).toBe(false);
    expect(isWord(" ")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isWord("")).toBe(false);
  });

  it("returns true for accented words", () => {
    expect(isWord("éléphant")).toBe(true);
    expect(isWord("où")).toBe(true);
  });
});

describe("isCommonWord", () => {
  it("returns true for common French words", () => {
    expect(isCommonWord("le")).toBe(true);
    expect(isCommonWord("de")).toBe(true);
    expect(isCommonWord("et")).toBe(true);
    expect(isCommonWord("est")).toBe(true);
  });

  it("is case insensitive", () => {
    expect(isCommonWord("Le")).toBe(true);
    expect(isCommonWord("DE")).toBe(true);
  });

  it("returns false for non-common words", () => {
    expect(isCommonWord("tour")).toBe(false);
    expect(isCommonWord("eiffel")).toBe(false);
  });
});

describe("countOccurrences", () => {
  it("counts word occurrences in text", () => {
    expect(countOccurrences("tour", "La tour Eiffel est une tour de fer")).toBe(
      2,
    );
  });

  it("returns 0 for absent word", () => {
    expect(countOccurrences("paris", "La tour Eiffel")).toBe(0);
  });

  it("is case insensitive via standardized text", () => {
    expect(countOccurrences("tour", "La Tour Eiffel est une tour")).toBe(2);
  });

  it("counts including close alternative suffixes", () => {
    // "tours" matches "tour" with suffix "s"
    expect(countOccurrences("tour", "Les tours de la tour")).toBe(2);
  });

  it("does not count common words as occurrences", () => {
    // "est" is a common word; counting "est" in a sentence with only
    // the common word form should yield 0 since the common word is subtracted
    expect(countOccurrences("est", "La tour est grande")).toBe(0);
  });
});

describe("standardizeText", () => {
  it("lowercases text", () => {
    expect(standardizeText("HELLO")).toBe("hello");
  });

  it("removes diacritics", () => {
    expect(standardizeText("éléphant")).toBe("elephant");
    expect(standardizeText("à")).toBe("a");
  });

  it("lowercases and removes diacritics together", () => {
    expect(standardizeText("Étoile")).toBe("etoile");
  });
});

describe("buildAlternatives", () => {
  it("builds alternatives with close suffixes", () => {
    const alts = buildAlternatives("tour");
    expect(alts).toContain("toure");
    expect(alts).toContain("tours");
    expect(alts).toContain("toures");
    expect(alts).toContain("tourr");
    expect(alts).toContain("tourx");
    expect(alts).toHaveLength(5);
  });
});

describe("isSelected", () => {
  it("returns true for exact match", () => {
    expect(isSelected("tour", "tour")).toBe(true);
  });

  it("returns true for alternative suffix match", () => {
    expect(isSelected("tours", "tour")).toBe(true);
    expect(isSelected("toure", "tour")).toBe(true);
  });

  it("returns false for non-matching word", () => {
    expect(isSelected("paris", "tour")).toBe(false);
  });

  it("returns false for partial prefix that is not an alternative", () => {
    expect(isSelected("tourisme", "tour")).toBe(false);
  });

  it("returns false for empty selection", () => {
    expect(isSelected("tour", "")).toBe(false);
  });
});

describe("stripHtmlTags", () => {
  it("strips HTML tags and returns text content", () => {
    expect(stripHtmlTags("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("handles nested tags", () => {
    expect(stripHtmlTags("<div><p>A <span>B</span></p></div>")).toBe("A B");
  });

  it("handles empty HTML", () => {
    expect(stripHtmlTags("")).toBe("");
  });

  it("returns plain text unchanged", () => {
    expect(stripHtmlTags("plain text")).toBe("plain text");
  });
});
