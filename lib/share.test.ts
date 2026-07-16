import { describe, expect, it } from "vitest";
import { decodeSpec, encodeSpec } from "@/lib/share";
import { showcaseSpecs } from "@/lib/showcase";

describe("share encoding", () => {
  it("round-trips a spec without an API or database", () => {
    const encoded = encodeSpec(showcaseSpecs[0]);
    expect(encoded).not.toContain("/");
    expect(decodeSpec(encoded)).toEqual(showcaseSpecs[0]);
  });

  it("rejects malformed shared payloads", () => {
    expect(() => decodeSpec("not-a-valid-spec")).toThrow();
  });
});
