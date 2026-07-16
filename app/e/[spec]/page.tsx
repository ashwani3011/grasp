import Link from "next/link";
import { ArrowLeft, Braces } from "lucide-react";
import { ErrorCard } from "@/components/ErrorCard";
import { Explainer } from "@/components/Explainer";
import { ShareButton } from "@/components/ShareButton";
import { decodeSpec } from "@/lib/share";

export default async function SharedExplainerPage({
  params,
}: {
  params: Promise<{ spec: string }>;
}) {
  const encoded = (await params).spec;
  let spec;
  try {
    spec = decodeSpec(encoded);
  } catch {
    spec = null;
  }

  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Braces className="size-4" />
          </span>
          Grasp
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="size-4" />
          Build another
        </Link>
      </nav>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {spec ? (
          <>
            <div className="mb-5">
              <div className="text-xs font-bold tracking-[0.16em] text-violet-600 uppercase">
                Shared explainer · works offline
              </div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
                Someone sent you a concept to explore.
              </h1>
            </div>
            <Explainer spec={spec} actions={<ShareButton spec={spec} />} />
          </>
        ) : (
          <ErrorCard
            title="This shared explainer isn’t valid"
            message="The link may be incomplete or altered. Grasp rejected the payload instead of rendering untrusted data."
            action={
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-rose-900 underline underline-offset-4"
              >
                Create a new explainer
              </Link>
            }
          />
        )}
      </section>
    </main>
  );
}
