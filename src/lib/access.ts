import type { Access } from "payload";

/** Any logged-in Payload admin user. */
export const authenticated: Access = ({ req }) => Boolean(req.user);

/**
 * Readable by anyone who reaches the request. The site as a whole is gated by
 * the shared-password proxy (src/proxy.ts), so "anyone" here means "any friend
 * who already has the site password" plus the admin.
 */
export const anyone: Access = () => true;
