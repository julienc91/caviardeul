import { describe, expect, it } from "vitest";

import { copyToClipboard } from "@caviardeul/utils/clipboard";

describe("copyToClipboard", () => {
  it("delegates to navigator.clipboard.writeText", async () => {
    await copyToClipboard("hello");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
  });

  it("passes arbitrary text", async () => {
    await copyToClipboard("some complex text 123!");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "some complex text 123!",
    );
  });
});
