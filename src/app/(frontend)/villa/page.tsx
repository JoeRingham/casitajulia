import type { Metadata } from "next";

import { PageContent } from "@/components/PageContent";
import { getVillaContent } from "@/lib/data";

export const metadata: Metadata = { title: "The Villa" };
export const dynamic = "force-dynamic";

export default async function VillaPage() {
  const sections = await getVillaContent().catch(() => []);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        The Villa
      </h1>

      {sections.length === 0 ? (
        <p className="text-muted">A look around the house is coming soon.</p>
      ) : (
        <PageContent sections={sections} />
      )}
    </div>
  );
}
