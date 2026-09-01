import type { CollectionConfig } from "payload";

import { authenticated } from "@/lib/access";

/**
 * Admin accounts for Julia & Neal. In practice this is one shared login whose
 * password is managed by Joe. Kept intentionally minimal.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
    maxLoginAttempts: 10,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email"],
    group: "Admin",
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
    },
  ],
};
