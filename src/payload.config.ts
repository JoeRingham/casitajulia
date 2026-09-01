import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Blocks } from "@/collections/Blocks";
import { Bookings } from "@/collections/Bookings";
import { Media } from "@/collections/Media";
import { Photos } from "@/collections/Photos";
import { Sections } from "@/collections/Sections";
import { Users } from "@/collections/Users";
import { Settings } from "@/globals/Settings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const useS3 = Boolean(process.env.S3_BUCKET);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " · Casita Julia",
    },
    components: {},
  },
  collections: [Users, Media, Photos, Sections, Bookings, Blocks],
  globals: [Settings],
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
              photos: { prefix: "photos" },
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
