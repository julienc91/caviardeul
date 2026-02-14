import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ConfirmModal from "@caviardeul/components/modals/confirmModal";

describe("ConfirmModal", () => {
  const defaultProps = {
    message: <p>Are you sure?</p>,
    open: true,
    danger: false,
    confirmLabel: "Confirm",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it("renders the message", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("renders confirmation heading", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("Confirmation")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when close/cancel button clicked", async () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("applies danger class when danger is true", () => {
    render(<ConfirmModal {...defaultProps} danger={true} />);
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    expect(confirmButton).toHaveClass("danger");
  });

  it("does not apply danger class when danger is false", () => {
    render(<ConfirmModal {...defaultProps} danger={false} />);
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    expect(confirmButton).not.toHaveClass("danger");
  });

  it("renders nothing when open is false", () => {
    const { container } = render(
      <ConfirmModal {...defaultProps} open={false} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
