import type { CollectionConfig } from "payload";

import { authenticated } from "@/lib/access";

/**
 * Admin accounts for Julia & Neal. In practice this is one shared login,
 * username `admin`, whose password Joe sets via the seed script (ADMIN_PASSWORD).
 * Login is by username — no email required.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    loginWithUsername: {
      allowEmailLogin: false,
      requireEmail: false,
      requireUsername: true,
    },
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
    maxLoginAttempts: 10,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: "username",
    defaultColumns: ["username", "name"],
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
      admin: { description: "Optional — just so you can tell logins apart." },
    },
  ],
};
