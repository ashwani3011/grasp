import { explainerSpecSchema, type ExplainerSpec } from "@/lib/schema";

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(
    normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="),
  );
  return new TextDecoder().decode(
    Uint8Array.from(binary, (character) => character.charCodeAt(0)),
  );
}

export function encodeSpec(spec: ExplainerSpec) {
  return toBase64Url(JSON.stringify(explainerSpecSchema.parse(spec)));
}

export function decodeSpec(value: string) {
  if (value.length > 100_000) throw new Error("Shared explainer is too large");
  return explainerSpecSchema.parse(JSON.parse(fromBase64Url(value)));
}
