import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExplainerSkeleton } from "@/components/ExplainerSkeleton";

describe("ExplainerSkeleton", () => {
  it("announces only the real in-progress server work", () => {
    render(
      <ExplainerSkeleton status="Builder is generating JSON; Inspector validates it before render." />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Builder is generating JSON; Inspector validates it before render.",
    );
    expect(screen.queryByText(/Architect/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Fact-checker/)).not.toBeInTheDocument();
  });
});
