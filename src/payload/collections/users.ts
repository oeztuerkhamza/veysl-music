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
    /**
     * 30 Tage. Bewusst lang: der Betreiber pflegt Inhalte sporadisch von
     * seinem eigenen Rechner, und eine Sitzung, die nach acht Stunden abläuft,
     * bedeutet praktisch bei jedem Besuch ein neues Login. Angemeldet bleiben
     * bis zum ausdrücklichen Logout ist hier das gewünschte Verhalten.
     *
     * Der Schutz liegt entsprechend nicht auf der Sitzungsdauer, sondern auf
     * dem Login selbst (`maxLoginAttempts`/`lockTime` unten) und auf dem
     * Cookie: httpOnly (von Payload gesetzt), `Secure` in Produktion, also
     * nur über HTTPS, und `SameSite=Lax`. Wer physischen Zugriff auf einen
     * angemeldeten Rechner hat, kommt damit ins Panel — das ist der Preis
     * dieser Entscheidung und der Grund, das Gerät selbst zu sperren.
     */
    tokenExpiration: 60 * 60 * 24 * 30,
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
