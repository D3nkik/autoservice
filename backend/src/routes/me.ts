import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();
router.use(authenticate);

const toHHMM = (ts: Date): string =>
  `${String(ts.getUTCHours()).padStart(2, '0')}:${String(ts.getUTCMinutes()).padStart(2, '0')}`;

// GET /api/me/profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, phone: true, role: true, car_brand: true, car_model: true, car_year: true, car_plate: true },
  });
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  return res.json(user);
});

// PUT /api/me/profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
  const { name, email, phone, password, car_brand, car_model, car_year, car_plate } = req.body;
  const data: Record<string, unknown> = {};

  if (name) data.name = name;
  if (email) data.email = email;
  if (phone) data.phone = phone;
  if (car_brand !== undefined) data.car_brand = car_brand;
  if (car_model !== undefined) data.car_model = car_model;
  if (car_year !== undefined) data.car_year = car_year ? parseInt(car_year) : null;
  if (car_plate !== undefined) data.car_plate = car_plate;
  if (password && password.length >= 6) {
    data.password_hash = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true, car_brand: true, car_model: true, car_year: true, car_plate: true },
  });
  return res.json(user);
});

// GET /api/me/bookings
router.get('/bookings', async (req: AuthRequest, res: Response) => {
  const bookings = await prisma.booking.findMany({
    where: {
      user_id: req.user!.id,
      status: { in: ['new', 'confirmed', 'in_progress'] },
    },
    include: { service: true, lift: true },
    orderBy: { date: 'asc' },
  });
  return res.json(bookings.map((b) => ({ ...b, time_slot: toHHMM(b.time_slot) })));
});

// DELETE /api/me/bookings/:id — cancel
router.delete('/bookings/:id', async (req: AuthRequest, res: Response) => {
  const booking = await prisma.booking.findFirst({
    where: { id: parseInt(req.params.id), user_id: req.user!.id },
  });
  if (!booking) return res.status(404).json({ message: 'Запись не найдена' });
  if (!['new', 'confirmed'].includes(booking.status)) {
    return res.status(400).json({ message: 'Нельзя отменить запись в данном статусе' });
  }

  // Check 24h rule
  const bookingTime = new Date(booking.date);
  const now = new Date();
  const diffHours = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffHours < 24) return res.status(400).json({ message: 'Отмена возможна не позднее чем за 24 часа' });

  await prisma.booking.update({ where: { id: booking.id }, data: { status: 'cancelled' } });
  return res.json({ message: 'Запись отменена' });
});

// GET /api/me/history
router.get('/history', async (req: AuthRequest, res: Response) => {
  const history = await prisma.serviceHistory.findMany({
    where: { user_id: req.user!.id },
    orderBy: { completed_at: 'desc' },
  });
  return res.json(history);
});

export default router;
