import Image from "next/image";
import Link from "next/link";

import { getGeneral } from "@/lib/data";

// Reads the (gated) database and changes only via the admin panel.
export const dynamic = "force-dynamic";

const tiles = [
  {
    href: "/calendar",
    title: "Calendar",
    blurb: "See which dates are free.",
  },
  {
    href: "/info",
    title: "Stay Guide",
    blurb: "Wifi, keys, arrival, house notes.",
  },
  {
    href: "/villa",
    title: "The Villa",
    blurb: "A look around the house.",
  },
];

export default async function HomePage() {
  const general = await getGeneral().catch(() => null);

  const hero =
    general?.heroImage && typeof general.heroImage === "object"
      ? general.heroImage
      : null;

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {general?.welcomeTitle || "Casita Julia"}
        </h1>
        {general?.welcomeIntro ? (
          <p className="max-w-prose text-lg leading-8 text-muted">
            {general.welcomeIntro}
          </p>
        ) : null}
      </section>

      {hero?.url ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <Image
            src={hero.url}
            alt={hero.alt || general?.welcomeTitle || "Casita Julia"}
            width={hero.width || 1600}
            height={hero.height || 1000}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <h2 className="font-serif text-lg font-semibold">{tile.title}</h2>
            <p className="mt-1 text-sm text-muted">{tile.blurb}</p>
          </Link>
        ))}
      </section>

      {general?.howToBook ? (
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-serif text-lg font-semibold">How to book</h2>
          <p className="mt-2 whitespace-pre-line leading-7 text-muted">
            {general.howToBook}
          </p>
        </section>
      ) : null}
    </div>
  );
}
