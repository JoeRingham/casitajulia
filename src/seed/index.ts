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

// ── Admin login ──────────────────────────────────────────────────────────────
// One shared account, username `admin` by default. Password comes from the
// environment. Re-running this script resets the password to ADMIN_PASSWORD,
// which is the supported way to change it from the command line.
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  payload.logger.warn(
    "ADMIN_PASSWORD not set — skipping admin user. Set it in .env and re-run `npm run seed`.",
  );
} else {
  const existing = await payload.find({
    collection: "users",
    where: { username: { equals: adminUsername } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    await payload.update({
      collection: "users",
      id: existing.docs[0].id,
      data: { password: adminPassword },
    });
    payload.logger.info(`Admin user "${adminUsername}" password reset.`);
  } else {
    await payload.create({
      collection: "users",
      data: { username: adminUsername, password: adminPassword, name: "Admin" },
    });
    payload.logger.info(`Admin user "${adminUsername}" created.`);
  }
}

process.exit(0);
