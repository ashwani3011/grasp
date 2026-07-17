import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeExperience } from "@/components/HomeExperience";
import { generationHeaders } from "@/lib/pipeline";
import { showcaseBySlug } from "@/lib/showcase";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("HomeExperience live pipeline", () => {
  it("shows trace metadata only after a live generation returns it", async () => {
    const user = userEvent.setup();
    const generated = showcaseBySlug.closures;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(generated), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            [generationHeaders.model]: "gpt-test",
            [generationHeaders.generateMs]: "950",
            [generationHeaders.repairUsed]: "false",
            [generationHeaders.validation]: "zod",
          },
        }),
      ),
    );
    render(<HomeExperience />);

    expect(screen.queryByText("How this was made")).not.toBeInTheDocument();
    await user.type(
      screen.getByLabelText("Concept, code, or error message"),
      "JavaScript closures",
    );
    await user.click(screen.getByRole("button", { name: "Build explainer" }));

    expect(await screen.findByText("How this was made")).toBeInTheDocument();
    expect(
      screen.getByText(/gpt-test produced the JSON spec/),
    ).toBeInTheDocument();
  });
});
