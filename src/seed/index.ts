import config from "@payload-config";
import { getPayload } from "payload";

/**
 * One-off starter content so the site isn't blank on first run.
 * Safe to run more than once — it skips anything that already exists.
 *   npm run seed
 */

function para(text: string) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          children: [
            {
              type: "text",
              text,
              format: 0,
              style: "",
              mode: "normal",
              detail: 0,
              version: 1,
            },
          ],
        },
      ],
    },
  };
}

const STARTER_SECTIONS = [
  {
    title: "Arrival & keys",
    body: "Add directions to the house, where to park, and how to get the keys (lockbox code, neighbour, etc.).",
  },
  {
    title: "Wifi",
    body: "Network name and password go here.",
  },
  {
    title: "House rules",
    body: "The handful of things you'd like guests to know — no shoes upstairs, water is precious in summer, that sort of thing.",
  },
  {
    title: "Bins & recycling",
    body: "Which day, which bags, where they go.",
  },
  {
    title: "Before you leave",
    body: "Strip the beds, empty the fridge, close the shutters, lock up, and let Julia know you're away so the cleaner can come.",
  },
  {
    title: "Local tips",
    body: "Favourite walks, the good bakery, where to swim, a restaurant or two.",
  },
];

const payload = await getPayload({ config });

const existing = await payload.count({ collection: "sections" });
if (existing.totalDocs > 0) {
  payload.logger.info(`Sections already present (${existing.totalDocs}) — skipping.`);
} else {
  for (const section of STARTER_SECTIONS) {
    await payload.create({
      collection: "sections",
      data: {
        title: section.title,
        published: true,
        body: para(section.body),
      },
    });
  }
  payload.logger.info(`Created ${STARTER_SECTIONS.length} starter sections.`);
}

await payload.updateGlobal({
  slug: "settings",
  data: {
    welcomeTitle: "Casita Julia",
    welcomeIntro:
      "Welcome. This is where friends of Julia and Neal can see when the house in Deià is free, and find everything they need for a stay.",
  },
});
payload.logger.info("Settings initialised.");

process.exit(0);
