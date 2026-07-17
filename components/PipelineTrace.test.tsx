import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PipelineTrace } from "@/components/PipelineTrace";
import { showcaseBySlug } from "@/lib/showcase";

const baseMeta = {
  model: "gpt-test",
  generateMs: 1_234,
  repairUsed: false,
  validation: "zod" as const,
};

describe("PipelineTrace", () => {
  it("renders only stages that actually happened", () => {
    render(
      <PipelineTrace spec={showcaseBySlug["event-loop"]} meta={baseMeta} />,
    );

    expect(screen.getByText("How this was made")).toBeInTheDocument();
    expect(screen.getByText("Builder")).toBeInTheDocument();
    expect(screen.getByText("Inspector")).toBeInTheDocument();
    expect(screen.getByText("Shape: stepper")).toBeInTheDocument();
    expect(screen.queryByText("Repairer")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Examiner/ })).toHaveAttribute(
      "href",
      "#interview-mode",
    );
  });

  it("shows the repair stage only when one repair was used", () => {
    render(
      <PipelineTrace
        spec={showcaseBySlug["database-indexing"]}
        meta={{ ...baseMeta, repairUsed: true }}
      />,
    );

    expect(screen.getByText("Repairer")).toBeInTheDocument();
    expect(
      screen.getByText("Self-repaired once from validation feedback."),
    ).toBeInTheDocument();
    expect(screen.getByText("Shape: playground")).toBeInTheDocument();
    expect(screen.getByText(/complete scenario coverage/)).toBeInTheDocument();
  });
});
