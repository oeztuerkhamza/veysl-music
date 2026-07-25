/**
 * TODO(kunde): Partner-Locations müssen vom Kunden benannt und freigegeben
 * werden, bevor sie öffentlich als Referenz genannt werden dürfen. Leer
 * lassen, bis das vorliegt.
 */

export interface Venue {
  id: string;
  name: string;
  city: string;
  logo?: { src: string; alt: string; width: number; height: number };
  url?: string;
}

export const venues: Venue[] = [];
