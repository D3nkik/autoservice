import { Router, Request, Response } from 'express';
import { prisma } from '../../services/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayBookings, newBookings, lifts] = await Promise.all([
    prisma.booking.count({ where: { date: { gte: today, lt: tomorrow }, status: { not: 'cancelled' } } }),
    prisma.booking.count({ where: { status: 'new' } }),
    prisma.lift.findMany({ where: { is_active: true } }),
  ]);

  const todayBookingsByLift = await prisma.booking.groupBy({
    by: ['lift_id'],
    where: { date: { gte: today, lt: tomorrow }, status: { not: 'cancelled' } },
    _count: { id: true },
  });

  const liftsLoad = lifts.map((l) => ({
    lift_id: l.id,
    name: l.name,
    used: todayBookingsByLift.find((b) => b.lift_id === l.id)?._count.id || 0,
    total: 12,
  }));

  return res.json({ todayBookings, newBookings, liftsLoad });
});

export default router;
