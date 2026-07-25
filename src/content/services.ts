/**
 * TODO(kunde): Icon-Auswahl final mit dem Kunden abstimmen, sobald weiteres
 * Bildmaterial/Branding vorliegt. Die eigentlichen Texte kommen ausschließlich
 * aus messages/*.json → Namespace "services.items" (nie hier hardcoden).
 */

export type ServiceId = 'wedding' | 'engagement' | 'afterparty' | 'corporate';

/** lucide-react icon name — resolved via a local map in the page component. */
export type ServiceIconName = 'Heart' | 'Users' | 'PartyPopper' | 'Briefcase';

export interface ServiceItem {
  /** Stable id — maps 1:1 to messages "services.items.<id>". */
  id: ServiceId;
  icon: ServiceIconName;
  /** Must match the length of messages "services.items.<id>.features". */
  featureCount: number;
}

export const services: ServiceItem[] = [
  { id: 'wedding', icon: 'Heart', featureCount: 4 },
  { id: 'engagement', icon: 'Users', featureCount: 4 },
  { id: 'afterparty', icon: 'PartyPopper', featureCount: 4 },
  { id: 'corporate', icon: 'Briefcase', featureCount: 4 },
];
