import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CodeProof } from "@/components/CodeProof";

const first = {
  code: "console.log('A')",
  output: "A",
  note: "It logs synchronously.",
};

describe("CodeProof", () => {
  it("reveals the exact output only after prediction", async () => {
    const user = userEvent.setup();
    render(<CodeProof example={first} />);

    expect(
      screen.queryByText("It logs synchronously."),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reveal output" }));
    expect(screen.getByText("It logs synchronously.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("A");
  });

  it("resets the reveal when a new example renders", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CodeProof key="first" example={first} />);
    await user.click(screen.getByRole("button", { name: "Reveal output" }));

    rerender(
      <CodeProof
        key="second"
        example={{
          code: "console.log('B')",
          output: "B",
          note: "This is the new proof.",
        }}
      />,
    );

    expect(
      screen.queryByText("This is the new proof."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reveal output" })).toBeVisible();
  });
});
