import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("provides a jsdom document and DOM matchers", () => {
    const element = document.createElement("div");
    document.body.append(element);
    expect(element).toBeInTheDocument();
  });
});
