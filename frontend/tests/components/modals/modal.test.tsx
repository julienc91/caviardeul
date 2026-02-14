import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Modal from "@caviardeul/components/modals/modal";

describe("Modal", () => {
  it("renders nothing when open is false", () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders children when open is true", () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        Content
      </Modal>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when background is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open={true} onClose={onClose}>
        Content
      </Modal>,
    );

    const background = container.querySelector(".modal-background")!;
    await userEvent.click(background);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("uses custom close label", () => {
    render(
      <Modal open={true} onClose={vi.fn()} closeLabel="Done">
        Content
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
  });

  it("renders extra buttons", () => {
    render(
      <Modal
        open={true}
        onClose={vi.fn()}
        extraButtons={<button>Extra</button>}
      >
        Content
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "Extra" })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Modal open={true} onClose={vi.fn()} className="custom-class">
        Content
      </Modal>,
    );
    expect(container.querySelector(".modal.custom-class")).toBeInTheDocument();
  });
});
