import type { Access, FieldAccess } from 'payload';

/**
 * Single-owner admin panel: "admin" just means "authenticated Payload user".
 * There is no multi-role system — every logged-in user is Veysel (or someone
 * he shares the login with) and gets full access.
 */
export const isAdmin: Access = ({ req }) => Boolean(req.user);

/** Same rule, shaped for field-level `access.read`/`access.update`. */
export const isAdminField: FieldAccess = ({ req }) => Boolean(req.user);

/** Deny every request — used to close off REST/GraphQL writes that must only ever happen via the trusted server-side Local API (see `src/lib/payload.ts` callers). */
export const denyAll: Access = () => false;
