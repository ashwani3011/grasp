import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Braces } from "lucide-react";
import { ArchetypeBadge } from "@/components/ArchetypeBadge";
import { encodeSpec } from "@/lib/share";
import { showcaseSpecs } from "@/lib/showcase";

export const metadata = { title: "Gallery" };

export default function GalleryPage() {
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
          Back to generator
        </Link>
      </nav>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8">
        <div className="max-w-2xl">
          <div className="text-xs font-bold tracking-[0.16em] text-violet-600 uppercase">
            Verified gallery
          </div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-5xl">
            Eight concepts. Zero loading.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Every explainer here is hand-verified, bundled with the app, and
            works without an API connection.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {showcaseSpecs.map((spec, index) => (
            <Link
              key={spec.title}
              href={`/e/${encodeSpec(spec)}`}
              className={`group flex min-h-64 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,.45)] transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_26px_70px_-35px_rgba(91,33,182,.35)] ${index === 0 || index === 5 ? "lg:col-span-2" : ""}`}
            >
              <ArchetypeBadge
                archetype={spec.archetype}
                why={spec.whyThisArchetype}
                compact
              />
              <h2 className="mt-5 text-xl font-extrabold tracking-tight text-slate-950">
                {spec.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {spec.summary}
              </p>
              <div className="mt-auto flex items-center justify-between pt-6 text-xs font-bold text-violet-700">
                <span>{spec.level.replace("_", " ")}</span>
                <span className="flex items-center gap-1">
                  Explore{" "}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
