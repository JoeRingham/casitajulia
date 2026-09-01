import { RichText } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";

import type { Media, StayGuideContent, VillaContent } from "@/payload-types";

type ContentSection = VillaContent | StayGuideContent;

function mediaOf(value: number | Media | null | undefined): Media | null {
  return value && typeof value === "object" ? value : null;
}

/**
 * Renders one content page ("The Villa" or "Stay Guide") — an ordered list of
 * sections, each a heading, optional rich text, and an optional grid of
 * captioned images. Presentational only; the sections come pre-filtered to
 * `published` and pre-sorted from lib/data.ts.
 */
export function PageContent({ sections }: { sections: ContentSection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const images = (section.images ?? []).flatMap((row) => {
          const media = mediaOf(row.image);
          return media?.url
            ? [{ media, caption: row.caption ?? null }]
            : [];
        });

        return (
          <section
            key={section.id}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <h2 className="font-serif text-xl font-semibold">
              {section.heading}
            </h2>

            {section.body ? (
              <div className="prose-cj mt-2 text-[0.975rem]">
                <RichText data={section.body} />
              </div>
            ) : null}

            {images.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {images.map(({ media, caption }) => (
                  <figure
                    key={media.id}
                    className="overflow-hidden rounded-lg border border-border"
                  >
                    <Image
                      src={media.url as string}
                      alt={caption || media.alt || ""}
                      width={media.width || 1200}
                      height={media.height || 900}
                      className="h-52 w-full object-cover"
                    />
                    {caption ? (
                      <figcaption className="px-3 py-2 text-sm text-muted">
                        {caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
