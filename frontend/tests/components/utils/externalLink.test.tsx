import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ExternalLink from "@caviardeul/components/utils/externalLink";

describe("ExternalLink", () => {
  it("renders a link with the correct href", () => {
    render(<ExternalLink href="https://example.com">Click me</ExternalLink>);
    const link = screen.getByRole("link", { name: "Click me" });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("sets target=_blank", () => {
    render(<ExternalLink href="https://example.com">Link</ExternalLink>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("sets rel=noopener noreferrer", () => {
    render(<ExternalLink href="https://example.com">Link</ExternalLink>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders children content", () => {
    render(
      <ExternalLink href="https://example.com">
        <span>Child content</span>
      </ExternalLink>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
