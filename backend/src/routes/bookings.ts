import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { sendEmail } from '../services/email';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const createSchema = z.object({
  client_name: z.string().min(2),
  client_phone: z.string().min(10),
  client_email: z.string().email().optional().or(z.literal('')),
  service_id: z.number().int().positive().optional(),
  custom_service: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_slot: z.string().regex(/^\d{2}:\d{2}$/),
  car_brand: z.string().optional(),
  car_model: z.string().optional(),
});

// POST /api/bookings — public
router.post('/', async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Ошибка валидации', errors: parsed.error.errors });

  const data = parsed.data;
  const dateObj = new Date(data.date);
  const timeObj = new Date(`1970-01-01T${data.time_slot}:00.000`);

  // Check not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dateObj < today) {
    return res.status(400).json({ message: 'Нельзя записаться на прошедшую дату' });
  }

  const booking = await prisma.booking.create({
    data: {
      client_name: data.client_name,
      client_phone: data.client_phone,
      client_email: data.client_email || null,
      service_id: data.service_id || null,
      custom_service: data.custom_service || null,
      date: dateObj,
      time_slot: timeObj,
      car_brand: data.car_brand || null,
      car_model: data.car_model || null,
      status: 'new',
    },
    include: { service: true },
  });

  // Send confirmation email if provided
  if (data.client_email) {
    await sendEmail({
      to: data.client_email,
      subject: 'Заявка принята — АвтоСервис',
      html: `
        <h2>Ваша заявка принята!</h2>
        <p>Номер заявки: <strong>#${booking.id}</strong></p>
        <p>Дата: <strong>${data.date}</strong></p>
        <p>Время: <strong>${data.time_slot}</strong></p>
        <p>Услуга: <strong>${booking.service?.name || data.custom_service || 'Другое'}</strong></p>
        <p>Мы свяжемся с вами для подтверждения записи.</p>
      `,
    }).catch(console.error);
  }

  return res.status(201).json({ id: booking.id, message: 'Заявка принята' });
});

export default router;
