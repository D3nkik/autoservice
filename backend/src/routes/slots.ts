import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';

const router = Router();

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];

// GET /api/slots?date=YYYY-MM-DD
router.get('/', async (req: Request, res: Response) => {
  const { date } = req.query;
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ message: 'Укажите дату в формате YYYY-MM-DD' });
  }

  const targetDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (targetDate < today) {
    return res.status(400).json({ message: 'Нельзя записаться на прошедшую дату' });
  }

  // Get active lifts count
  const liftsCount = await prisma.lift.count({ where: { is_active: true } });
  if (liftsCount === 0) return res.json({ available_slots: [] });

  // Get bookings for this date
  const dayStart = new Date(`${date}T00:00:00.000`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  const bookings = await prisma.booking.findMany({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      status: { not: 'cancelled' },
    },
    select: { time_slot: true, duration_hours: true, lift_id: true },
  });

  // Build occupied slot-lift pairs
  const occupiedSlots: Record<string, Set<number | null>> = {};
  for (const booking of bookings) {
    const startHour = booking.time_slot.getHours();
    for (let h = 0; h < booking.duration_hours; h++) {
      const slotHour = startHour + h;
      const slotKey = `${String(slotHour).padStart(2, '0')}:00`;
      if (!occupiedSlots[slotKey]) occupiedSlots[slotKey] = new Set();
      occupiedSlots[slotKey].add(booking.lift_id);
    }
  }

  // A slot is available if at least one lift is free
  const available_slots = TIME_SLOTS.filter((slot) => {
    const occupied = occupiedSlots[slot];
    if (!occupied) return true;
    return occupied.size < liftsCount;
  });

  return res.json({ available_slots, date });
});

export default router;
