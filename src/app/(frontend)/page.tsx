import Image from "next/image";
import Link from "next/link";

import { getPhotos, getGeneral } from "@/lib/data";

// Reads the (gated) database and changes only via the admin panel.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [general, photos] = await Promise.all([
    getGeneral().catch(() => null),
    getPhotos().catch(() => []),
  ]);

  const hero = photos[0];

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
        ) : (
          <p className="max-w-prose text-lg leading-8 text-muted">
            Welcome. This is where friends of Julia and Neal can see when the
            house in Deià is free, and find everything needed for a stay.
          </p>
        )}
      </section>

      {hero?.url ? (
        <Link
          href="/villa"
          className="block overflow-hidden rounded-xl border border-border"
        >
          <Image
            src={hero.url}
            alt={hero.caption || "Casita Julia"}
            width={hero.width || 1600}
            height={hero.height || 1000}
            className="h-auto w-full object-cover"
            priority
          />
        </Link>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/calendar"
          className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
        >
          <h2 className="font-serif text-lg font-semibold">Calendar</h2>
          <p className="mt-1 text-sm text-muted">See which dates are free.</p>
        </Link>
        <Link
          href="/info"
          className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
        >
          <h2 className="font-serif text-lg font-semibold">Info</h2>
          <p className="mt-1 text-sm text-muted">
            Wifi, keys, arrival, house notes.
          </p>
        </Link>
        <Link
          href="/villa"
          className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
        >
          <h2 className="font-serif text-lg font-semibold">Photos</h2>
          <p className="mt-1 text-sm text-muted">A look around the house.</p>
        </Link>
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
