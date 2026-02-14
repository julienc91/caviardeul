import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Loader from "@caviardeul/components/utils/loader";

describe("Loader", () => {
  it("renders a loader container", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector(".loader")).toBeInTheDocument();
  });

  it("renders a spinner element", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector(".spinner")).toBeInTheDocument();
  });
});
