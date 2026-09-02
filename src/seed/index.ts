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

const STAY_GUIDE_SECTIONS = [
  {
    heading: "Arrival & keys",
    body: "Add directions to the house, where to park, and how to get the keys (lockbox code, neighbour, etc.).",
  },
  {
    heading: "Wifi",
    body: "Network name and password go here.",
  },
  {
    heading: "House rules",
    body: "The handful of things you'd like guests to know — no shoes upstairs, water is precious in summer, that sort of thing.",
  },
  {
    heading: "Bins & recycling",
    body: "Which day, which bags, where they go.",
  },
  {
    heading: "Before you leave",
    body: "Strip the beds, empty the fridge, close the shutters, lock up, and let the owners know you're away so the cleaner can come.",
  },
  {
    heading: "Local tips",
    body: "Favourite walks, the good bakery, where to swim, a restaurant or two.",
  },
];

const VILLA_SECTIONS = [
  {
    heading: "The house",
    body: "A short description of the villa — how many bedrooms, the layout, the view.",
  },
  {
    heading: "The garden & terrace",
    body: "The outdoor space — where to sit in the morning, the shade in the afternoon, the pool if there is one.",
  },
  {
    heading: "Getting here",
    body: "How to reach Deià — nearest airport, the drive, parking, whether a car is worth it.",
  },
];

const payload = await getPayload({ config });

async function seedPageContent(
  collection: "stayGuideContent" | "villaContent",
  rows: { heading: string; body: string }[],
) {
  const existing = await payload.count({ collection });
  if (existing.totalDocs > 0) {
    payload.logger.info(
      `${collection}: ${existing.totalDocs} already present — skipping.`,
    );
    return;
  }
  for (const row of rows) {
    await payload.create({
      collection,
      data: { heading: row.heading, published: true, body: para(row.body) },
    });
  }
  payload.logger.info(`${collection}: created ${rows.length} starter sections.`);
}

await seedPageContent("stayGuideContent", STAY_GUIDE_SECTIONS);
await seedPageContent("villaContent", VILLA_SECTIONS);

// Only fill in "General" fields that are still empty — never overwrite existing
// edits on a re-run.
const currentGeneral = await payload.findGlobal({ slug: "general" });
const generalPatch: Record<string, unknown> = {};
if (!currentGeneral.welcomeTitle) generalPatch.welcomeTitle = "Casita Julia";
if (!currentGeneral.welcomeIntro) {
  generalPatch.welcomeIntro =
    "Welcome - see when our house in Deià is free, and find everything you need for a stay!";
}
if (Object.keys(generalPatch).length > 0) {
  await payload.updateGlobal({ slug: "general", data: generalPatch });
  payload.logger.info(`General: filled in ${Object.keys(generalPatch).join(", ")}.`);
} else {
  payload.logger.info("General content already set — left unchanged.");
}

// ── Admin login ──────────────────────────────────────────────────────────────
// One shared account, username `admin` by default.
//
// This CREATES the account if it doesn't exist yet. It does NOT touch an
// existing account's password — a password changed in the admin UI is kept, and
// a redeploy never runs this script anyway. To deliberately reset the password
// from the command line, set ADMIN_RESET_PASSWORD=true and re-run `npm run seed`.
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD;
const adminForceReset = process.env.ADMIN_RESET_PASSWORD === "true";

const existingAdmin = await payload.find({
  collection: "users",
  where: { username: { equals: adminUsername } },
  limit: 1,
});

if (existingAdmin.docs.length > 0) {
  if (adminForceReset && adminPassword) {
    await payload.update({
      collection: "users",
      id: existingAdmin.docs[0].id,
      data: { password: adminPassword },
    });
    payload.logger.info(
      `Admin user "${adminUsername}" password reset from ADMIN_PASSWORD.`,
    );
  } else if (adminForceReset) {
    payload.logger.warn(
      "ADMIN_RESET_PASSWORD=true but ADMIN_PASSWORD is empty — password left unchanged.",
    );
  } else {
    payload.logger.info(
      `Admin user "${adminUsername}" already exists — left unchanged. ` +
        "(Set ADMIN_RESET_PASSWORD=true to reset its password.)",
    );
  }
} else if (!adminPassword) {
  payload.logger.warn(
    "No admin user yet and ADMIN_PASSWORD not set — skipping. Set it in .env and re-run `npm run seed`.",
  );
} else {
  await payload.create({
    collection: "users",
    data: { username: adminUsername, password: adminPassword, name: "Admin" },
  });
  payload.logger.info(`Admin user "${adminUsername}" created.`);
}

process.exit(0);
