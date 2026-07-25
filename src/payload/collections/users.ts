import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';

/**
 * Admin login. Single-owner site — no roles, no public registration.
 *
 * First-time login: Payload shows its own "create first admin user" screen
 * automatically at /admin whenever this collection is empty, regardless of
 * the `access.create` rule below — that rule only takes effect once at least
 * one user already exists, closing off self-registration after bootstrap.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Benutzer', plural: 'Benutzer' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'updatedAt'],
    description: 'Zugänge für das VEYSL-Adminpanel. In der Regel reicht ein einziger Account.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8h session
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 min lockout after 5 failed attempts
    verify: false, // no SMTP transport wired up yet (see BOOKING_TRANSPORT) — email verification would dead-end
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: { description: 'Anzeigename im Adminpanel (optional).' },
    },
  ],
};
