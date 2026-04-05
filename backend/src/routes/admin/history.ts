import { Router, Request, Response } from 'express';
import { prisma } from '../../services/prisma';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

// POST /api/admin/history — add record manually
router.post('/', async (req: AuthRequest, res: Response) => {
  const { booking_id, user_id, service_name, description, price, mileage, completed_at } = req.body;
  if (!user_id || !service_name) return res.status(400).json({ message: 'user_id и service_name обязательны' });

  const record = await prisma.serviceHistory.create({
    data: {
      booking_id: booking_id || null,
      user_id,
      service_name,
      description: description || null,
      price: price || null,
      mileage: mileage || null,
      completed_at: completed_at ? new Date(completed_at) : new Date(),
      created_by: req.user!.id,
    },
  });
  return res.status(201).json(record);
});

export default router;
