import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { getSections } from "@/lib/data";

export const metadata: Metadata = { title: "Info" };
export const dynamic = "force-dynamic";

export default async function InfoPage() {
  const sections = await getSections().catch(() => []);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Info</h1>

      {sections.length === 0 ? (
        <p className="text-muted">
          Details for your stay will appear here soon.
        </p>
      ) : (
        sections.map((section) => (
          <section
            key={section.id}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <h2 className="font-serif text-xl font-semibold">{section.title}</h2>
            {section.body ? (
              <div className="prose-cj mt-2 text-[0.975rem]">
                <RichText data={section.body} />
              </div>
            ) : null}
          </section>
        ))
      )}
    </div>
  );
}
