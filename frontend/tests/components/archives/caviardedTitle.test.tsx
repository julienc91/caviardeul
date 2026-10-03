import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CaviardedTitle from "@caviardeul/components/archives/caviardedTitle";
import { encode, generateKey } from "@caviardeul/utils/encryption";

const renderTitle = (title: string) => {
  const key = generateKey();
  return render(
    <CaviardedTitle
      encryptedPageName={encode(title, key)}
      encryptionKey={key}
    />,
  );
};

describe("CaviardedTitle", () => {
  it("hides every word but common ones", () => {
    const { container } = renderTitle("Château de Versailles");
    expect(container.textContent).toBe("███████ de ██████████");
    expect(container.querySelectorAll(".caviarded")).toHaveLength(2);
  });

  it("keeps punctuation visible", () => {
    const { container } = renderTitle("Python (langage)");
    expect(container.textContent).toBe("██████ (███████)");
  });

  it("never renders the title in clear", () => {
    const { container } = renderTitle("Tour Eiffel");
    expect(container.innerHTML).not.toContain("Tour");
    expect(container.innerHTML).not.toContain("Eiffel");
  });

  it("falls back to a placeholder when the title cannot be decrypted", () => {
    const { container } = render(
      <CaviardedTitle encryptedPageName="invalid" encryptionKey="invalid" />,
    );
    expect(container.textContent).toBe("?");
  });
});
