import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  APIError,
  getUserDailyArticleStats,
  isAPIError,
  saveGameScore,
  sendLoginRequest,
} from "@caviardeul/lib/queries";

import { createArticle } from "../helpers/fixtures";

// Mock cookies-next
vi.mock("cookies-next/client", () => ({
  getCookie: vi.fn().mockReturnValue("csrf-token"),
}));

describe("APIError", () => {
  it("creates an error with status and details", () => {
    const error = new APIError(404, "Not found");
    expect(error.status).toBe(404);
    expect(error.details).toBe("Not found");
    expect(error.message).toBe("API Call error");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("isAPIError", () => {
  it("returns true for APIError instances", () => {
    expect(isAPIError(new APIError(500, "error"))).toBe(true);
  });

  it("returns true for objects with status and details", () => {
    expect(isAPIError({ status: 400, details: "bad" })).toBe(true);
  });

  it("returns false for null/undefined", () => {
    expect(isAPIError(null)).toBe(false);
    expect(isAPIError(undefined)).toBe(false);
  });

  it("returns false for plain errors", () => {
    expect(isAPIError(new Error("oops"))).toBe(false);
  });

  it("returns false for non-objects", () => {
    expect(isAPIError("string")).toBe(false);
    expect(isAPIError(42)).toBe(false);
  });
});

describe("saveGameScore", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: vi.fn().mockResolvedValue(null),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends POST request with score data", async () => {
    const article = createArticle({ articleId: 42, custom: false });
    await saveGameScore(article, 10, 5);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/scores"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"nbAttempts":10'),
      }),
    );
  });
});

describe("sendLoginRequest", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ success: true }),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends POST request with userId", async () => {
    await sendLoginRequest("user-123");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ userId: "user-123" }),
      }),
    );
  });
});

describe("getUserDailyArticleStats", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches stats with userId cookie", async () => {
    const stats = {
      total: 100,
      totalFinished: 50,
      averageNbAttempts: 15,
      averageNbCorrect: 10,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue(stats),
      }),
    );

    const result = await getUserDailyArticleStats("user-123");
    expect(result).toEqual(stats);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/articles/stats"),
      expect.objectContaining({
        headers: { Cookie: "userId=user-123" },
      }),
    );
  });

  it("sends empty cookie when userId is undefined", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({}),
      }),
    );

    await getUserDailyArticleStats(undefined);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/articles/stats"),
      expect.objectContaining({
        headers: { Cookie: "" },
      }),
    );
  });
});
