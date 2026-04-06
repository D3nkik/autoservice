import { Router, Request, Response } from 'express';
import { prisma } from '../../services/prisma';

const router = Router();

// GET /api/admin/schedule?date=YYYY-MM-DD
router.get('/', async (req: Request, res: Response) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Укажите дату' });

  // Use date-only comparison to avoid timezone issues
  const dayStart = new Date(`${date}T00:00:00.000`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  const [lifts, bookings] = await Promise.all([
    prisma.lift.findMany({ where: { is_active: true } }),
    prisma.booking.findMany({
      where: { date: { gte: dayStart, lte: dayEnd }, status: { not: 'cancelled' } },
      include: { service: true, user: { select: { id: true, name: true } } },
    }),
  ]);

  const liftsWithBookings = lifts.map((lift) => ({
    ...lift,
    bookings: bookings.filter((b) => b.lift_id === lift.id),
  }));

  // Bookings without a lift — show in a virtual "unassigned" column
  const unassigned = bookings.filter((b) => !b.lift_id);

  return res.json({ date, lifts: liftsWithBookings, unassigned });
});

export default router;
