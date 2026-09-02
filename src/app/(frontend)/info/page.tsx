import type { Metadata } from "next";

import { PageContent } from "@/components/PageContent";
import { getStayGuideContent } from "@/lib/data";

export const metadata: Metadata = { title: "Stay Guide" };
export const dynamic = "force-dynamic";

export default async function StayGuidePage() {
  const sections = await getStayGuideContent().catch(() => []);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        Stay Guide
      </h1>

      {sections.length === 0 ? (
        <p className="text-muted">Details for your stay will appear here soon.</p>
      ) : (
        <PageContent sections={sections} />
      )}
    </div>
  );
}
