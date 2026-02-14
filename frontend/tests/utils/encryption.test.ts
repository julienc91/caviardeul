import { describe, expect, it } from "vitest";

import { EncodedArticle } from "@caviardeul/types";
import {
  checkEncryptionKey,
  decode,
  decodeArticle,
  encode,
  generateKey,
} from "@caviardeul/utils/encryption";

describe("generateKey", () => {
  it("generates a base64-encoded key", () => {
    const key = generateKey();
    expect(key).toBeTruthy();
    // Should be valid base64
    expect(() => atob(key)).not.toThrow();
  });

  it("generates different keys on each call", () => {
    const key1 = generateKey();
    const key2 = generateKey();
    expect(key1).not.toBe(key2);
  });
});

describe("checkEncryptionKey", () => {
  it("returns true for a valid fernet key", () => {
    const key = generateKey();
    expect(checkEncryptionKey(key)).toBe(true);
  });

  it("returns false for an invalid key", () => {
    expect(checkEncryptionKey("not-a-valid-key")).toBe(false);
    expect(checkEncryptionKey("")).toBe(false);
  });
});

describe("encode/decode", () => {
  it("round-trips a string through encode and decode", () => {
    const key = generateKey();
    const original = "Hello, World!";
    const encoded = encode(original, key);
    const decoded = decode(encoded, key);
    expect(decoded).toBe(original);
  });

  it("round-trips unicode text", () => {
    const key = generateKey();
    const original = "La tour Eiffel est à Paris";
    const encoded = encode(original, key);
    const decoded = decode(encoded, key);
    expect(decoded).toBe(original);
  });

  it("produces different ciphertext for different keys", () => {
    const key1 = generateKey();
    const key2 = generateKey();
    const text = "same text";
    const encoded1 = encode(text, key1);
    const encoded2 = encode(text, key2);
    expect(encoded1).not.toBe(encoded2);
  });
});

describe("decodeArticle", () => {
  it("decodes pageName and content from an encoded article", () => {
    const key = generateKey();
    const pageName = "Tour Eiffel";
    const content = "<p>La tour Eiffel</p>";

    const encodedArticle: EncodedArticle = {
      key,
      articleId: 42,
      safety: "SAFE",
      archive: false,
      custom: false,
      pageName: encode(pageName, key),
      content: encode(content, key),
      userScore: null,
    };

    const article = decodeArticle(encodedArticle);
    expect(article.pageName).toBe(pageName);
    expect(article.content).toBe(content);
    expect(article.articleId).toBe(42);
    expect(article.safety).toBe("SAFE");
    expect(article.archive).toBe(false);
    expect(article.custom).toBe(false);
  });
});
