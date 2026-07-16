import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stepper } from "@/components/Stepper";
import { showcaseBySlug } from "@/lib/showcase";

describe("Stepper", () => {
  it("moves through steps while keeping the same chip identity visible", () => {
    const spec = showcaseBySlug["event-loop"];
    if (spec.archetype !== "stepper")
      throw new Error("Fixture must be a stepper");
    render(<Stepper spec={spec} />);
    expect(
      screen.getByText("Synchronous work always wins first."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Callbacks become ready")).toBeInTheDocument();
    expect(screen.getByText("setTimeout callback")).toBeInTheDocument();
  });
});
