"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import type { ExplainerSpec } from "@/lib/schema";
import { encodeSpec } from "@/lib/share";
import { Button } from "@/components/ui/button";

export function ShareButton({ spec }: { spec: ExplainerSpec }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    const url = new URL(
      `/e/${encodeSpec(spec)}`,
      window.location.origin,
    ).toString();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return (
    <Button variant="outline" size="sm" onClick={copy}>
      {copied ? (
        <Check className="size-4 text-emerald-600" />
      ) : (
        <Share2 className="size-4" />
      )}
      {copied ? "Copied" : "Share"}
    </Button>
  );
}
