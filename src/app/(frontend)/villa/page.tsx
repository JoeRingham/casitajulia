import type { Metadata } from "next";
import Image from "next/image";

import { getPhotos } from "@/lib/data";

export const metadata: Metadata = { title: "Photos" };
export const dynamic = "force-dynamic";

export default async function VillaPage() {
  const photos = await getPhotos().catch(() => []);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Photos</h1>

      {photos.length === 0 ? (
        <p className="text-muted">Photos will appear here soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {photos.map((photo) =>
            photo.url ? (
              <figure
                key={photo.id}
                className="overflow-hidden rounded-xl border border-border bg-surface"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || "Casita Julia"}
                  width={photo.width || 1200}
                  height={photo.height || 900}
                  className="h-64 w-full object-cover"
                />
                {photo.caption ? (
                  <figcaption className="px-4 py-3 text-sm text-muted">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </figure>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
