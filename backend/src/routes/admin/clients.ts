import { Router, Request, Response } from 'express';
import { prisma } from '../../services/prisma';
import bcrypt from 'bcryptjs';

const router = Router();

// GET /api/admin/clients
router.get('/', async (req: Request, res: Response) => {
  const { search } = req.query;
  const where: Record<string, unknown> = { role: 'client' };

  if (search) {
    where.OR = [
      { name: { contains: String(search) } },
      { phone: { contains: String(search) } },
      { email: { contains: String(search) } },
    ];
  }

  const clients = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, phone: true, car_brand: true, car_model: true, car_plate: true, _count: { select: { bookings: true } } },
    orderBy: { created_at: 'desc' },
  });
  return res.json(clients);
});

// GET /api/admin/clients/:id
router.get('/:id', async (req: Request, res: Response) => {
  const client = await prisma.user.findUnique({
    where: { id: parseInt(req.params.id) },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      car_brand: true, car_model: true, car_year: true, car_plate: true,
      bookings: {
        include: { service: true },
        orderBy: { date: 'desc' },
        take: 20,
      },
      service_history: {
        orderBy: { completed_at: 'desc' },
        take: 20,
      },
    },
  });
  if (!client) return res.status(404).json({ message: 'Клиент не найден' });
  return res.json(client);
});

// POST /api/admin/clients
router.post('/', async (req: Request, res: Response) => {
  const { name, email, phone, car_brand, car_model, car_year, car_plate } = req.body;
  if (!email || !phone) return res.status(400).json({ message: 'Email и телефон обязательны' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: 'Email уже зарегистрирован' });

  const password_hash = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
  const client = await prisma.user.create({
    data: { name, email, phone, password_hash, car_brand, car_model, car_year, car_plate, role: 'client' },
    select: { id: true, name: true, email: true, phone: true },
  });
  return res.status(201).json(client);
});

export default router;
