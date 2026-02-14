import { afterEach, describe, expect, it, vi } from "vitest";

import { getEncodedArticle } from "@caviardeul/lib/article";
import { APIError } from "@caviardeul/lib/queries";

describe("getEncodedArticle", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches the current article when no articleId", async () => {
    const data = {
      key: "key",
      articleId: 1,
      safety: "SAFE",
      archive: false,
      custom: false,
      pageName: "page",
      content: "content",
      userScore: null,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(data),
      }),
    );

    const result = await getEncodedArticle();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/articles/current"),
      expect.any(Object),
    );
    expect(result).toEqual(data);
  });

  it("fetches a specific article by id", async () => {
    const data = {
      key: "key",
      articleId: 42,
      safety: "SAFE",
      archive: true,
      custom: false,
      pageName: "page",
      content: "content",
      userScore: null,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(data),
      }),
    );

    const result = await getEncodedArticle(42);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/articles/42"),
      expect.any(Object),
    );
    expect(result).toEqual(data);
  });

  it("fetches a custom article", async () => {
    const data = {
      key: "key",
      articleId: "abc",
      safety: "UNKNOWN",
      archive: false,
      custom: true,
      pageName: "page",
      content: "content",
      userScore: null,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(data),
      }),
    );

    const result = await getEncodedArticle("abc", true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/articles/custom/abc"),
      expect.any(Object),
    );
    expect(result).toEqual(data);
  });

  it("passes userId as cookie header", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          key: "k",
          articleId: 1,
          safety: "SAFE",
          archive: false,
          custom: false,
          pageName: "p",
          content: "c",
          userScore: null,
        }),
      }),
    );

    await getEncodedArticle(undefined, undefined, "user-123");
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { Cookie: "userId=user-123" },
      }),
    );
  });

  it("throws APIError on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ details: "Not found" }),
      }),
    );

    await expect(getEncodedArticle(999)).rejects.toThrow(APIError);
    try {
      await getEncodedArticle(999);
    } catch (e) {
      expect((e as APIError).status).toBe(404);
      expect((e as APIError).details).toBe("Not found");
    }
  });
});
