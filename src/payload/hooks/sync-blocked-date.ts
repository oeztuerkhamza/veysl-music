import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload, PayloadRequest } from 'payload';

/**
 * Keeps `blocked-dates` in sync with the owner's own confirmed `bookings`:
 * creating/confirming a booking blocks its date on the public calendar,
 * cancelling or deleting the last confirmed booking on a date frees it again
 * — unless an admin has *also* manually blocked that same day, in which case
 * the manual block wins and is left untouched.
 */
async function syncBlockedDateForDate(payload: Payload, date: string, req?: PayloadRequest): Promise<void> {
  const [confirmed, existing] = await Promise.all([
    payload.find({
      collection: 'bookings',
      where: { and: [{ date: { equals: date } }, { status: { equals: 'confirmed' } }] },
      limit: 50,
      depth: 0,
      req,
    }),
    payload.find({
      collection: 'blocked-dates',
      where: { date: { equals: date } },
      limit: 1,
      depth: 0,
      req,
    }),
  ]);

  const existingDoc = existing.docs[0];

  if (confirmed.totalDocs > 0) {
    const reason = confirmed.docs
      .map((booking) => (typeof booking.title === 'string' ? booking.title : undefined))
      .filter((title): title is string => Boolean(title))
      .join(', ');
    const bookingId = confirmed.docs[0]!.id;

    if (!existingDoc) {
      await payload.create({
        collection: 'blocked-dates',
        data: { date, reason, source: 'booking', booking: bookingId },
        req,
      });
    } else if (existingDoc.source === 'booking') {
      await payload.update({
        collection: 'blocked-dates',
        id: existingDoc.id,
        data: { reason, source: 'booking', booking: bookingId },
        req,
      });
    }
    // existingDoc.source === 'manual': a manual block already covers this day, leave it as-is.
  } else if (existingDoc && existingDoc.source === 'booking') {
    await payload.delete({ collection: 'blocked-dates', id: existingDoc.id, req });
  }
}

export const bookingsAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  const date = doc.date as string;
  if (typeof date === 'string' && date) {
    await syncBlockedDateForDate(req.payload, date, req);
  }

  const previousDate = previousDoc?.date as string | undefined;
  if (operation === 'update' && typeof previousDate === 'string' && previousDate && previousDate !== date) {
    await syncBlockedDateForDate(req.payload, previousDate, req);
  }

  return doc;
};

export const bookingsAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const date = doc?.date as string | undefined;
  if (typeof date === 'string' && date) {
    await syncBlockedDateForDate(req.payload, date, req);
  }
  return doc;
};
