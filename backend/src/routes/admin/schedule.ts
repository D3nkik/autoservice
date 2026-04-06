import { Router, Request, Response } from 'express';
import { prisma } from '../../services/prisma';

const router = Router();

// Normalize Prisma TIME field (Date object) to "HH:MM" string
const toHHMM = (ts: Date): string =>
  `${String(ts.getUTCHours()).padStart(2, '0')}:${String(ts.getUTCMinutes()).padStart(2, '0')}`;

// GET /api/admin/schedule?date=YYYY-MM-DD
router.get('/', async (req: Request, res: Response) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Укажите дату' });

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const [lifts, bookings] = await Promise.all([
    prisma.lift.findMany({ where: { is_active: true } }),
    prisma.booking.findMany({
      where: { date: { gte: dayStart, lte: dayEnd }, status: { not: 'cancelled' } },
      include: { service: true, user: { select: { id: true, name: true } } },
    }),
  ]);

  const normalize = (b: typeof bookings[0]) => ({ ...b, time_slot: toHHMM(b.time_slot) });

  const liftsWithBookings = lifts.map((lift) => ({
    ...lift,
    bookings: bookings.filter((b) => b.lift_id === lift.id).map(normalize),
  }));

  const unassigned = bookings.filter((b) => !b.lift_id).map(normalize);

  return res.json({ date, lifts: liftsWithBookings, unassigned });
});

export default router;
