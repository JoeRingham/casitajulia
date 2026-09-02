import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Bookings } from "@/collections/Bookings";
import { Media } from "@/collections/Media";
import { StayGuideContent } from "@/collections/StayGuideContent";
import { Users } from "@/collections/Users";
import { VillaContent } from "@/collections/VillaContent";
import { General } from "@/globals/General";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const useS3 = Boolean(process.env.S3_BUCKET);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " · Casita Julia",
    },
    importMap: {
      // Resolve the "/components/..." string paths relative to `src/`.
      baseDir: dirname,
    },
    components: {
      // Every collection/global sets `admin.group: false`, so this is the whole
      // sidebar — in the order we want it.
      beforeNavLinks: ["/components/admin/AdminNav#AdminNav"],
    },
  },
  collections: [Users, Media, VillaContent, StayGuideContent, Bookings],
  globals: [General],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  sharp,
  plugins: [
    ...(useS3
      ? [
          s3Storage({
            collections: {
              media: { prefix: "media" },
            },
            bucket: process.env.S3_BUCKET as string,
            config: {
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION || "us-east-1",
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
              },
            },
          }),
        ]
      : []),
  ],
});
