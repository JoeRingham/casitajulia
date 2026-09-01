import type { GlobalConfig } from "payload";

import { anyone, authenticated } from "@/lib/access";

/**
 * Site-wide copy the owners can edit — home heading, intro, "how to book" text,
 * footer line. A Payload "global" is a single record, not a list.
 *
 * Slug `general` → the DB table is `general`, the admin shows it as "General",
 * and code reads it as `findGlobal({ slug: "general" })`.
 */
export const General: GlobalConfig = {
  slug: "general",
  admin: { group: "Content" },
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: "ownerNames",
      type: "text",
      label: "Owners' name(s)",
      admin: {
        description:
          'Used in site help text — e.g. the sign-in page: "ask … for the latest password".',
      },
    },
    {
      name: "welcomeTitle",
      type: "text",
      label: "Home page heading",
      defaultValue: "Casita Julia",
    },
    {
      name: "welcomeIntro",
      type: "textarea",
      label: "Home page introduction",
      admin: {
        description: "A short paragraph shown on the landing page.",
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "Home page photo",
      admin: {
        description: "Large image near the top of the home page. Optional.",
      },
    },
    {
      name: "howToBook",
      type: "textarea",
      label: "How to book",
      defaultValue:
        "To ask about dates, message the owners directly with the days you'd like. They'll check the calendar and confirm here once it's agreed.",
      admin: {
        description:
          "Shown on the calendar page. No form — friends already know how to reach the owners.",
      },
    },
    {
      name: "footerNote",
      type: "text",
      label: "Footer line",
      defaultValue:
        "A private family home in Deià, Mallorca — please treat it with care.",
    },
  ],
};
