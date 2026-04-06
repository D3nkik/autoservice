import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/prisma';
import { sendEmail } from '../../services/email';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

// GET /api/admin/bookings
router.get('/', async (req: Request, res: Response) => {
  const { status, search, date, lift_id } = req.query;
  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (lift_id) where.lift_id = parseInt(String(lift_id));
  if (date) {
    const d = new Date(String(date));
    const next = new Date(d); next.setDate(next.getDate() + 1);
    where.date = { gte: d, lt: next };
  }
  if (search) {
    where.OR = [
      { client_name: { contains: String(search) } },
      { client_phone: { contains: String(search) } },
      { client_email: { contains: String(search) } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: { service: true, lift: true, user: { select: { id: true, name: true } } },
    orderBy: [{ date: 'desc' }, { time_slot: 'asc' }],
  });
  return res.json(bookings);
});

// GET /api/admin/bookings/:id
router.get('/:id', async (req: Request, res: Response) => {
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { service: true, lift: true, user: { select: { id: true, name: true, email: true } } },
  });
  if (!booking) return res.status(404).json({ message: 'Заявка не найдена' });
  return res.json(booking);
});

// PUT /api/admin/bookings/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const { lift_id, status, admin_notes, total_price, cancel_reason, service_description, mileage, user_id, duration_hours } = req.body;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { user: true, service: true },
  });
  if (!booking) return res.status(404).json({ message: 'Заявка не найдена' });

  // If assigning lift, check availability
  if (lift_id && status === 'confirmed') {
    const conflict = await prisma.booking.findFirst({
      where: {
        lift_id,
        date: booking.date,
        time_slot: booking.time_slot,
        status: { in: ['confirmed', 'in_progress'] },
        id: { not: id },
      },
    });
    if (conflict) return res.status(409).json({ message: 'Подъёмник занят на это время' });
  }

  const data: Record<string, unknown> = {};
  if (lift_id !== undefined) data.lift_id = lift_id;
  if (status !== undefined) data.status = status;
  if (admin_notes !== undefined) data.admin_notes = admin_notes;
  if (total_price !== undefined) data.total_price = total_price;
  if (cancel_reason !== undefined) data.cancel_reason = cancel_reason;
  if (user_id !== undefined) data.user_id = user_id;
  if (duration_hours !== undefined) data.duration_hours = parseInt(String(duration_hours));

  const updated = await prisma.booking.update({ where: { id }, data, include: { service: true, lift: true } });

  // Auto-create history on completed
  if (status === 'completed' && booking.user_id) {
    const existingHistory = await prisma.serviceHistory.findUnique({ where: { booking_id: id } });
    if (!existingHistory) {
      await prisma.serviceHistory.create({
        data: {
          booking_id: id,
          user_id: booking.user_id,
          service_name: booking.service?.name || booking.custom_service || 'Другое',
          description: service_description || admin_notes || null,
          price: total_price || null,
          mileage: mileage || null,
          completed_at: new Date(),
          created_by: req.user!.id,
        },
      });
    }
  }

  // Send email notifications on status change
  const email = booking.client_email || booking.user?.email;
  if (email && status && status !== booking.status) {
    const subjects: Record<string, string> = {
      confirmed: 'Запись подтверждена — АвтоСервис',
      completed: 'Работы выполнены — АвтоСервис',
      cancelled: 'Запись отменена — АвтоСервис',
    };
    const subject = subjects[status];
    if (subject) {
      await sendEmail({ to: email, subject, html: `<p>Статус вашей заявки #${id} изменён: <strong>${status}</strong></p>` }).catch(console.error);
    }
  }

  return res.json(updated);
});

// POST /api/admin/bookings
router.post('/', async (req: AuthRequest, res: Response) => {
  const { client_name, client_phone, client_email, service_id, custom_service, date, time_slot, duration_hours, lift_id, user_id, car_brand, car_model } = req.body;

  // Auto-link to existing user by phone or email
  let resolvedUserId = user_id || null;
  if (!resolvedUserId && client_phone) {
    const found = await prisma.user.findFirst({ where: { phone: client_phone } });
    resolvedUserId = found?.id || null;
  }
  if (!resolvedUserId && client_email) {
    const found = await prisma.user.findFirst({ where: { email: client_email } });
    resolvedUserId = found?.id || null;
  }

  const booking = await prisma.booking.create({
    data: {
      client_name, client_phone,
      client_email: client_email || null,
      service_id: service_id || null,
      custom_service: custom_service || null,
      date: new Date(date),
      time_slot: new Date(`1970-01-01T${time_slot}:00.000`),
      duration_hours: duration_hours || 1,
      lift_id: lift_id || null,
      user_id: resolvedUserId,
      car_brand: car_brand || null,
      car_model: car_model || null,
      status: 'confirmed',
    },
    include: { service: true, lift: true },
  });
  return res.status(201).json(booking);
});

export default router;
